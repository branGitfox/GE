const db = require('./db');

console.log("Adding 'status' column to 'factures' table...");

db.query("ALTER TABLE factures ADD COLUMN status ENUM('facture', 'proforma') DEFAULT 'facture'", (err, results, fields) => {
    if (err) {
        if (err.code === 'ER_DUP_FIELDNAME') {
            console.log("Column 'status' already exists.");
        } else {
            console.error("Migration error:", err);
        }
    } else {
        console.log("Column added successfully!");
    }
    process.exit();
});
