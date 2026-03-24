const db = require('./db');

const migrate = () => {
    // 1. Create Categories Table
    const createCategoriesTable = `
        CREATE TABLE IF NOT EXISTS categories (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nom VARCHAR(255) NOT NULL UNIQUE,
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;

    db.query(createCategoriesTable, (err, result) => {
        if (err) {
            console.error('❌ Error creating categories table:', err);
            return;
        }
        console.log('✅ Categories table created or already exists.');

        // 2. Add category_id to Produits Table
        const addCategoryIdColumn = `
            ALTER TABLE produits
            ADD COLUMN category_id INT DEFAULT NULL,
            ADD CONSTRAINT fk_category
            FOREIGN KEY (category_id) REFERENCES categories(id)
            ON DELETE SET NULL
            ON UPDATE CASCADE
        `;

        // Check if column exists first to avoid error on re-run
        const checkColumn = "SHOW COLUMNS FROM produits LIKE 'category_id'";

        db.query(checkColumn, (err, result) => {
            if (err) {
                console.error('❌ Error checking columns:', err);
                return;
            }

            if (result.length === 0) {
                db.query(addCategoryIdColumn, (err, result) => {
                    if (err) {
                        console.error('❌ Error adding category_id to produits:', err);
                    } else {
                        console.log('✅ category_id column added to produits table.');
                    }
                    process.exit();
                });
            } else {
                console.log('ℹ️ category_id column already exists in produits table.');
                process.exit();
            }
        });
    });
};

migrate();
