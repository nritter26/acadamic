const express = require('express'); 
const { Pool } = require('pg'); 
const path = require('path'); 
const cors = require('cors'); // 1. Move this to the top

const app = express(); 
app.use(cors());             // 2. Move this right after 'app' is created

const port = 3000; 

// ... rest of your code ...


// Configure the connection details so Node knows how to log into your database
const pool = new Pool({
  user: 'postgres',           // Your database username
  host: 'localhost',          // Where the database lives (your own computer)
  database: 'postgres',       // The name of the specific database you created
  password: '@Bernardshuffle26', // The password you set for PostgreSQL
  port: 5432,                 // The default port PostgreSQL listens on
});

// ROUTE 1: When someone visits 'http://localhost:3000/', do this:
app.get('/', (req, res) => {
  // Send the 'index.html' file from your folder to the user's browser
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ROUTE 2: When the browser's JavaScript asks for '/api/customers', do this:
app.get('/api/customers', async (req, res) => {
  try {
    // Wait for the database to finish running this specific SQL command
    const result = await pool.query('SELECT * FROM customerinfo');
    
    // Send the rows of data back to the browser in a format (JSON) it understands
    res.json(result.rows);
  } catch (err) {
    // If the database is offline or the query fails, send back a 500 error code
    res.status(500).json({ error: err.message });
  }
});

// Start the server and tell it to stay 'awake' and listen for requests
app.listen(port, () => {
  // Log a message in your terminal so you know everything started correctly
  console.log(`Server running at http://localhost:${port}`);
});

