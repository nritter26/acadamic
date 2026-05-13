const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const port = 3000;

// 2. Middleware
app.use(cors()); // Allows your HTML file to talk to this server
app.use(express.json()); // Allows the server to read JSON sent from your HTML


// 3. Connect to your SQLite database file
const db = new sqlite3.Database('./database/database.db', (err) => {
    if (err) console.error("Error opening database:", err.message);
    else console.log("Connected to the SQLite database.");
});

// Get all products
app.get('/api/data', (req, res) => {
    const sql = "SELECT * FROM products"; 
    
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(400).json({"error": err.message});
            return;
        }
        res.json({
            "message": "success",
            "data": rows
        });
    });
    console.log(rows)
});
// Add a new product
app.post('/api/products', (req, res) => {
    const { name, price } = req.body;
    const sql = "INSERT INTO products (name, price) VALUES (?, ?)";

    db.run(sql, [name, price], function(err) {
        if (err) {
            res.status(400).json({"error": err.message});
            return;
        }
        res.json({
            "message": "success",
            "data": {"id": this.lastID, name, price}
        });
    });
});
// Delete a product by ID
app.delete('/api/products/:id', (req, res) => {
    const id = req.params.id;
    const sql = "DELETE FROM products WHERE id = ?";
    
    db.run(sql, id, function(err) {
        res.json({ message: "deleted", rows: this.changes });
    });
});
// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});