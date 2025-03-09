const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("weather.db", (err) => {
    if (err) console.error(err.message);
    console.log("Connected to SQLite database.");
});

db.run(`
    CREATE TABLE IF NOT EXISTS weather_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        temperature REAL NOT NULL,
        humidity REAL NOT NULL
    )
`, (err) => {
    if (err) console.error(err.message);
    console.log("Table created successfully.");
    db.close();
});
