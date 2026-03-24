const db = require('./db');

const up = async () => {
    console.log("🚀 Starting migration: Update factures table for temporary clients...");

    const queries = [
        // 1. Drop the foreign key constraint first if it exists to allow changing the column
        // We need to find the constraint name. Usually it's factures_ibfk_1 based on the SQL dump.
        "ALTER TABLE factures DROP FOREIGN KEY IF EXISTS factures_ibfk_1",

        // 2. Modify client_id to be NULLABLE
        "ALTER TABLE factures MODIFY client_id INT(11) NULL",

        // 3. Add temporary client columns
        "ALTER TABLE factures ADD COLUMN IF NOT EXISTS temp_client_nom VARCHAR(255) NULL AFTER client_id",
        "ALTER TABLE factures ADD COLUMN IF NOT EXISTS temp_client_adresse TEXT NULL AFTER temp_client_nom",
        "ALTER TABLE factures ADD COLUMN IF NOT EXISTS temp_client_telephone VARCHAR(50) NULL AFTER temp_client_adresse",
        "ALTER TABLE factures ADD COLUMN IF NOT EXISTS temp_client_email VARCHAR(100) NULL AFTER temp_client_telephone",

        // 4. Re-add the foreign key constraint without the NOT NULL requirement
        "ALTER TABLE factures ADD CONSTRAINT factures_ibfk_1 FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL ON UPDATE CASCADE"
    ];

    for (const query of queries) {
        try {
            await new Promise((resolve, reject) => {
                db.query(query, (err, results) => {
                    if (err) {
                        // Ignore error if it's "DROP FOREIGN KEY IF EXISTS" not supported or columns already exist
                        if (err.code === 'ER_CANT_DROP_FIELD_OR_KEY' || err.code === 'ER_DUP_FIELDNAME') {
                            console.warn(`⚠️ Warning: ${err.message}`);
                            resolve();
                        } else {
                            reject(err);
                        }
                    } else {
                        resolve(results);
                    }
                });
            });
            console.log(`✅ Success: ${query.substring(0, 50)}...`);
        } catch (error) {
            console.error(`❌ Error executing query: ${query}`);
            console.error(error);
            process.exit(1);
        }
    }

    console.log("🎉 Migration completed successfully!");
    process.exit(0);
};

up();
