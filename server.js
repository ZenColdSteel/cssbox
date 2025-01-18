const express = require("express");
const mysql = require("mysql2");
const cors = require("cors"); // For enabling cross-origin requests

const app = express();
const port = 3000;

// Middleware to enable CORS
app.use(cors());

// Create a connection to the MySQL database
const connection = mysql.createConnection({
    host: "localhost",
    user: "myuser1", // Replace with your MySQL username
    password: "mypassword", // Replace with your MySQL password
    database: "my_game_database", // Replace with your database name
});

// Route to fetch data from the database
app.get("/api/games", (req, res) => {
    // Query to select all data from the games table
    connection.query("SELECT * FROM games", (err, results) => {
        if (err) {
            console.error("Error fetching data:", err);
            return res.status(500).json({ error: "Database error" });
        }
        // Return the results as JSON
        res.json(results);
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
