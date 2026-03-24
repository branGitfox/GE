const db = require('./db');

const queries = [
    "ALTER TABLE produits ADD COLUMN pieces_par_carton INT NOT NULL DEFAULT 1;",
    "ALTER TABLE produits ADD COLUMN prix_carton DECIMAL(20,2) NOT NULL DEFAULT 0.00;",
    "ALTER TABLE produits ADD COLUMN prix_piece DECIMAL(20,2) NOT NULL DEFAULT 0.00;"
];

let completed = 0;
let hasError = false;

queries.forEach(query => {
    db.query(query, (err, results) => {
        if (err) {
            // Ignore Duplicate column errors if script is run multiple times
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log(`Column already exists, skipping: ${query}`);
            } else {
                console.error(`Error executing ${query}:`, err);
                hasError = true;
            }
        } else {
            console.log(`Successfully executed: ${query}`);
        }

        completed++;
        if (completed === queries.length) {
            if (hasError) {
                console.log("Finished with some errors.");
                process.exit(1);
            } else {
                console.log("All columns added successfully.");
                process.exit(0);
            }
        }
    });
});
