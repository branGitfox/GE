const db = require('../db');
const { logAction } = require('../utils/logger');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const TABLE_ORDER = [
    'roles',
    'pages',
    'role_pages',
    'categories',
    'clients',
    'fournisseurs',
    'entrepots',
    'users',
    'produits',
    'depenses',
    'factures',
    'produit_achat',
    'produit_entrepot',
    'produit_fournisseurs',
    'system_logs'
];

// Helper function to escape SQL strings
function escapeSqlString(str) {
    if (str === null || str === undefined) return 'NULL';
    if (typeof str === 'number') return str.toString();
    if (str instanceof Date) {
        if (isNaN(str.getTime())) return 'NULL';
        // Use local time components to avoid TZ shifting
        const year = str.getFullYear();
        const month = String(str.getMonth() + 1).padStart(2, '0');
        const day = String(str.getDate()).padStart(2, '0');
        const hours = String(str.getHours()).padStart(2, '0');
        const minutes = String(str.getMinutes()).padStart(2, '0');
        const seconds = String(str.getSeconds()).padStart(2, '0');
        return `'${year}-${month}-${day} ${hours}:${minutes}:${seconds}'`;
    }
    return "'" + str.toString().replace(/'/g, "''").replace(/\\/g, '\\\\') + "'";
}

// Database backup/export using direct SQL queries
exports.backupDatabase = async (req, res) => {
    try {
        const backupDir = path.join(__dirname, '../backups');

        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }

        const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
        const filename = `backup_${process.env.DB_NAME}_${timestamp}.sql`;
        const filepath = path.join(backupDir, filename);

        let sqlDump = `-- MySQL Database Backup\n`;
        sqlDump += `-- Host: ${process.env.DB_HOST}\n`;
        sqlDump += `-- Database: ${process.env.DB_NAME}\n`;
        sqlDump += `-- Generated at: ${new Date().toISOString()}\n\n`;
        sqlDump += `SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";\n`;
        sqlDump += `SET time_zone = "+00:00";\n`;
        sqlDump += `SET FOREIGN_KEY_CHECKS = 0;\n\n`;

        // Get all tables from DB to check if they exist
        db.query('SHOW TABLES', async (err, tables) => {
            if (err) {
                console.error('Error getting tables:', err);
                return res.status(500).json({ message: 'Erreur lors de la récupération des tables', error: err.message });
            }

            const existingTables = tables.map(t => Object.values(t)[0]);
            
            // Use TABLE_ORDER but only for tables that actually exist
            const tableNames = TABLE_ORDER.filter(t => existingTables.includes(t));
            
            // Add any other tables not in TABLE_ORDER at the end
            existingTables.forEach(t => {
                if (!tableNames.includes(t)) tableNames.push(t);
            });

            if (tableNames.length === 0) {
                return res.status(500).json({ message: 'Aucune table trouvée' });
            }

            const queryAsync = (sql) => new Promise((resolve, reject) => {
                db.query(sql, (err, result) => err ? reject(err) : resolve(result));
            });

            try {
                for (const tableName of tableNames) {
                    // Get CREATE TABLE
                    const createResult = await queryAsync(`SHOW CREATE TABLE \`${tableName}\``);
                    const createTableSQL = createResult[0]['Create Table'];
                    sqlDump += `\n-- Table structure for \`${tableName}\`\n`;
                    sqlDump += `DROP TABLE IF EXISTS \`${tableName}\`;\n`;
                    sqlDump += createTableSQL + ';\n\n';

                    // Get Data
                    const rows = await queryAsync(`SELECT * FROM \`${tableName}\``);
                    if (rows.length > 0) {
                        sqlDump += `-- Data for table \`${tableName}\`\n`;
                        const columns = Object.keys(rows[0]);
                        const columnList = columns.map(col => `\`${col}\``).join(', ');

                        rows.forEach((row, index) => {
                            const values = columns.map(col => escapeSqlString(row[col])).join(', ');
                            if (index === 0) {
                                sqlDump += `INSERT INTO \`${tableName}\` (${columnList}) VALUES\n`;
                            }
                            sqlDump += `(${values})`;
                            sqlDump += (index < rows.length - 1) ? ',\n' : ';\n\n';
                        });
                    }
                }

                sqlDump += `\nSET FOREIGN_KEY_CHECKS = 1;\n`;

                fs.writeFileSync(filepath, sqlDump, 'utf8');

                res.download(filepath, filename, async (err) => {
                    if (err) console.error('Download error:', err);
                    await logAction(req.user?.id, 'backup', 'system', null, null, null, `Exportation de la base de données: ${filename}`);
                });

            } catch (procErr) {
                console.error('Error processing tables:', procErr);
                res.status(500).json({ message: 'Erreur lors de la génération du dump', error: procErr.message });
            }
        });
    } catch (error) {
        console.error('Backup error:', error);
        res.status(500).json({ message: 'Erreur lors du backup', error: error.message });
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
                    message: 'Import réussi ! VEUILLEZ VOUS DÉCONNECTER ET VOUS RECONNECTER pour synchroniser votre session avec la nouvelle base de données.',
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
    try {
        // 1. Get all tables from the database
        db.query('SHOW TABLES', (err, results) => {
            if (err) {
                console.error('Error fetching tables:', err);
                return res.status(500).json({
                    message: 'Erreur lors de la récupération des tables',
                    error: err.message
                });
            }

            // Extract table names
            const allTables = results.map(row => Object.values(row)[0]);
            // Filter out 'users' table
            const tablesToTruncate = allTables.filter(table => table.toLowerCase() !== 'users' && table.toLowerCase() !== 'role_pages' && table.toLowerCase() !== 'roles' && table.toLowerCase() !== 'pages' && table.toLowerCase() !== 'fournisseurs' && table.toLowerCase() !== 'categories' && table.toLowerCase() !== 'entrepots' && table.toLowerCase() !== 'clients');

            if (tablesToTruncate.length === 0) {
                return res.status(200).json({
                    message: 'Aucune table à réinitialiser.'
                });
            }

            // 2. Disable foreign key checks to allow truncation
            db.query('SET FOREIGN_KEY_CHECKS = 0', (err) => {
                if (err) {
                    console.error('Error disabling FK checks:', err);
                    return res.status(500).json({
                        message: 'Erreur lors de la désactivation des contraintes',
                        error: err.message
                    });
                }

                let processedCount = 0;
                let errors = [];

                const truncateNext = (index) => {
                    if (index >= tablesToTruncate.length) {
                        // 3. Re-enable foreign key checks
                        db.query('SET FOREIGN_KEY_CHECKS = 1', async (err) => {
                            if (err) console.error('Error enabling FK checks:', err);

                            if (errors.length > 0) {
                                return res.status(500).json({
                                    message: 'Réinitialisation terminée avec des erreurs',
                                    errors
                                });
                            }

                            await logAction(req.user?.id, 'reset', 'system', null, null, null, `Réinitialisation complète de la base de données (hors utilisateurs)`);

                            return res.status(200).json({
                                message: 'Base de données réinitialisée avec succès ! Les données ont été effacées et tous les IDs sont revenus à 1.'
                            });
                        });
                        return;
                    }

                    const table = tablesToTruncate[index];
                    db.query(`TRUNCATE TABLE \`${table}\``, (err) => {
                        if (err) {
                            console.error(`Error truncating ${table}:`, err);
                            errors.push(`Erreur sur la table ${table}: ${err.message}`);
                        }
                        truncateNext(index + 1);
                    });
                };

                // Start truncating
                truncateNext(0);
            });
        });
    } catch (error) {
        console.error('Reset error:', error);
        // Ensure FK checks are re-enabled even on crash if possible
        db.query('SET FOREIGN_KEY_CHECKS = 1');
        res.status(500).json({
            message: 'Erreur critique lors de la réinitialisation',
            error: error.message
        });
    }
};
