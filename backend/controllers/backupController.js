const db = require('../db');
const { logAction } = require('../utils/logger');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Helper function to escape SQL strings
function escapeSqlString(str) {
    if (str === null || str === undefined) return 'NULL';
    if (typeof str === 'number') return str.toString();
    if (str instanceof Date) {
        // Check if the date is valid to avoid RangeError: Invalid time value
        if (isNaN(str.getTime())) return 'NULL';
        return "'" + str.toISOString().slice(0, 19).replace('T', ' ') + "'";
    }
    return "'" + str.toString().replace(/'/g, "''").replace(/\\/g, '\\\\') + "'";
}

// Database backup/export using direct SQL queries
exports.backupDatabase = async (req, res) => {
    try {
        const backupDir = path.join(__dirname, '../backups');

        // Create backups directory if it doesn't exist
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }

        // Generate filename with timestamp
        const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
        const filename = `backup_${process.env.DB_NAME}_${timestamp}.sql`;
        const filepath = path.join(backupDir, filename);

        // Start building SQL dump
        let sqlDump = `-- MySQL Database Backup\n`;
        sqlDump += `-- Host: ${process.env.DB_HOST}\n`;
        sqlDump += `-- Database: ${process.env.DB_NAME}\n`;
        sqlDump += `-- Generated at: ${new Date().toISOString()}\n\n`;
        sqlDump += `SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";\n`;
        sqlDump += `SET time_zone = "+00:00";\n`;
        sqlDump += `SET FOREIGN_KEY_CHECKS = 0;\n\n`;

        // Get all tables
        db.query('SHOW TABLES', (err, tables) => {
            if (err) {
                console.error('Error getting tables:', err);
                return res.status(500).json({
                    message: 'Erreur lors de la récupération des tables',
                    error: err.message
                });
            }

            const tableNames = tables.map(t => Object.values(t)[0]);
            let processedTables = 0;

            if (tableNames.length === 0) {
                return res.status(500).json({
                    message: 'Aucune table trouvée dans la base de données'
                });
            }

            // Process each table
            tableNames.forEach((tableName) => {
                // Get CREATE TABLE statement
                db.query(`SHOW CREATE TABLE \`${tableName}\``, (err, createResult) => {
                    if (err) {
                        console.error(`Error getting CREATE TABLE for ${tableName}:`, err);
                        processedTables++;
                        return;
                    }

                    const createTableSQL = createResult[0]['Create Table'];
                    sqlDump += `\n-- Table structure for \`${tableName}\`\n`;
                    sqlDump += `DROP TABLE IF EXISTS \`${tableName}\`;\n`;
                    sqlDump += createTableSQL + ';\n\n';

                    // Get table data
                    db.query(`SELECT * FROM \`${tableName}\``, (err, rows) => {
                        if (err) {
                            console.error(`Error getting data from ${tableName}:`, err);
                            processedTables++;
                            return;
                        }

                        if (rows.length > 0) {
                            sqlDump += `-- Data for table \`${tableName}\`\n`;

                            // Get column names
                            const columns = Object.keys(rows[0]);
                            const columnList = columns.map(col => `\`${col}\``).join(', ');

                            // Insert data in batches
                            rows.forEach((row, index) => {
                                const values = columns.map(col => escapeSqlString(row[col])).join(', ');

                                if (index === 0) {
                                    sqlDump += `INSERT INTO \`${tableName}\` (${columnList}) VALUES\n`;
                                }

                                sqlDump += `(${values})`;

                                if (index < rows.length - 1) {
                                    sqlDump += ',\n';
                                } else {
                                    sqlDump += ';\n\n';
                                }
                            });
                        }

                        processedTables++;

                        // When all tables are processed, write file and send
                        if (processedTables === tableNames.length) {
                            sqlDump += `\nSET FOREIGN_KEY_CHECKS = 1;\n`;
                            fs.writeFile(filepath, sqlDump, 'utf8', (err) => {
                                if (err) {
                                    console.error('Error writing backup file:', err);
                                    return res.status(500).json({
                                        message: 'Erreur lors de l\'écriture du fichier',
                                        error: err.message
                                    });
                                }

                                // Send file for download
                                res.download(filepath, filename, async (err) => {
                                    if (err) {
                                        console.error('Download error:', err);
                                        return res.status(500).json({
                                            message: 'Erreur lors du téléchargement du backup'
                                        });
                                    }
                                    
                                    await logAction(req.user?.id, 'backup', 'system', null, null, null, `Exportation de la base de données: ${filename}`);

                                    // Optionally delete the file after download
                                    // setTimeout(() => {
                                    //   if (fs.existsSync(filepath)) {
                                    //     fs.unlinkSync(filepath);
                                    //   }
                                    // }, 5000);
                                });
                            });
                        }
                    });
                });
            });
        });
    } catch (error) {
        console.error('Backup error:', error);
        res.status(500).json({
            message: 'Erreur lors de la création du backup',
            error: error.message
        });
    }
};

// Database import/restore from SQL file
exports.importDatabase = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                message: 'Aucun fichier SQL fourni'
            });
        }

        const filepath = req.file.path;

        // Read the SQL file
        fs.readFile(filepath, 'utf8', (err, sqlContent) => {
            if (err) {
                console.error('Error reading SQL file:', err);
                // Clean up uploaded file
                if (fs.existsSync(filepath)) {
                    fs.unlinkSync(filepath);
                }
                return res.status(500).json({
                    message: 'Erreur lors de la lecture du fichier SQL',
                    error: err.message
                });
            }

            // Wrap SQL content to disable/enable FK checks
            const finalSql = `SET FOREIGN_KEY_CHECKS = 0;\n${sqlContent}\nSET FOREIGN_KEY_CHECKS = 1;`;

            // Execute the entire SQL content at once (leveraging multipleStatements: true)
            db.query(finalSql, async (err, results) => {
                // Clean up uploaded file
                if (fs.existsSync(filepath)) {
                    fs.unlinkSync(filepath);
                }

                if (err) {
                    console.error('Import SQL error:', err);
                    return res.status(500).json({
                    });
                }
                
                await logAction(req.user?.id, 'backup_import', 'system', null, null, null, `Importation d'une base de données (${req.file.originalname})`);

                // If multipleStatements is on, results is an array of results for each statement
                const totalStatements = Array.isArray(results) ? results.length : 1;

                return res.status(200).json({
                    message: 'Import réussi !',
                    executedStatements: totalStatements,
                    totalStatements: totalStatements
                });
            });
        });
    } catch (error) {
        console.error('Import error:', error);
        // Clean up uploaded file
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({
            message: 'Erreur lors de l\'import de la base de données',
            error: error.message
        });
    }
};

// Database reset: Clear all tables except users and reset auto-increment to 1
exports.resetDatabase = async (req, res) => {
    const tablesToTruncate = [
        'depenses',
        'factures',
        'produit_achat',
        'produits',
        'categories',
        'fournisseurs',
        'clients',
    ];

    try {
        // Disable foreign key checks to allow truncation
        db.query('SET FOREIGN_KEY_CHECKS = 0', (err) => {
            if (err) throw err;

            let truncatedCount = 0;
            let errors = [];

            const truncateNext = (index) => {
                if (index >= tablesToTruncate.length) {
                    // Re-enable foreign key checks
                    db.query('SET FOREIGN_KEY_CHECKS = 1', async (err) => {
                        if (err) {
                            console.error('Error enabling FK checks:', err);
                        }

                        if (errors.length > 0) {
                            return res.status(500).json({
                                message: 'Réinitialisation terminée avec des erreurs',
                                errors
                            });
                        }

                        await logAction(req.user?.id, 'reset', 'system', null, null, null, `Réinitialisation complète de la base de données`);

                        return res.status(200).json({
                            message: 'Base de données réinitialisée avec succès ! Tous les IDs sont revenus à 1.'
                        });
                    });
                    return;
                }

                const table = tablesToTruncate[index];
                db.query(`TRUNCATE TABLE \`${table}\``, (err) => {
                    if (err) {
                        console.error(`Error truncating ${table}:`, err);
                        errors.push(`Erreur sur la table ${table}: ${err.message}`);
                    } else {
                        truncatedCount++;
                    }
                    truncateNext(index + 1);
                });
            };

            truncateNext(0);
        });
    } catch (error) {
        console.error('Reset error:', error);
        // Ensure FK checks are re-enabled even on crash
        db.query('SET FOREIGN_KEY_CHECKS = 1');
        res.status(500).json({
            message: 'Erreur lors de la réinitialisation de la base de données',
            error: error.message
        });
    }
};
