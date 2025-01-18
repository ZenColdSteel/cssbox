const getGameDetails = require("./getGameDetails");
const fs = require("fs");
const mysql = require("mysql2");

// Create a connection to the MySQL database
const connection = mysql.createConnection({
    host: "localhost",
    user: "myuser1", // Replace with your MySQL username
    password: "mypassword", // Replace with your MySQL password
    database: "my_game_database", // Replace with your database name
});

// Connect to the database
connection.connect((err) => {
    if (err) {
        console.error("Error connecting to MySQL:", err);
        return;
    }
    console.log("Connected to MySQL database");
});

// Read JSON data
fs.readFile("display_info/data.json", "utf8", (err, data) => {
    if (err) {
        console.error("Error reading file:", err);
        return;
    }

    // Parse JSON data
    const gameData = JSON.parse(data);

    // SQL query to insert data with the correct number of placeholders
    const query = `INSERT INTO games (steam_appid, name, price, detailed_description, background, ratings)
    VALUES (?, ?, ?, ?, ?, ?)`;

    // Values to insert (Ensure you have the right number of values for each placeholder)
    const values = [
        gameData.steam_appid, // Adjusted to match placeholders in SQL
        gameData.name,
        gameData.price,
        gameData.detailed_description,
        gameData.background,
        gameData.ratings,
    ];

    // Insert data into the database
    connection.query(query, values, (err, results) => {
        if (err) {
            console.error("Error inserting data:", err);
            return;
        }
        console.log("Inserted data successfully:", results);
    });

    // Close the connection
    connection.end();
});
