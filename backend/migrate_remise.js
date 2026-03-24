const db = require('./db');

console.log("Adding 'remise' column to 'factures' table...");

db.query("ALTER TABLE factures ADD COLUMN remise DECIMAL(15,2) DEFAULT 0.00", (err, results, fields) => {
    if (err) {
        if (err.code === 'ER_DUP_FIELDNAME') {
            console.log("Column 'remise' already exists.");
        } else {
            console.error("Migration error:", err);
        }
    } else {
        console.log("Column added successfully!");
    }
    process.exit();
});
