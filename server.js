const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const mqtt = require("mqtt");
const cors = require("cors");

const app = express();
app.use(cors());

const db = new sqlite3.Database("weather.db");

// MQTT Setup
const BROKER_URL = "mqtt://157.173.101.159:1883";
const TEMP_TOPIC = "/work_group_01/room_temp/temperature";
const HUMIDITY_TOPIC = "/work_group_01/room_temp/humidity";

const mqttClient = mqtt.connect(BROKER_URL);

mqttClient.on("connect", () => {
    console.log("Connected to MQTT Broker");
    mqttClient.subscribe([TEMP_TOPIC, HUMIDITY_TOPIC]);
});

mqttClient.on("message", (topic, message) => {
    const value = parseFloat(message.toString());
    const timestamp = new Date().toISOString();

    if (!isNaN(value)) {
        db.run("INSERT INTO weather_data (timestamp, temperature, humidity) VALUES (?, ?, ?)", 
            [timestamp, topic === TEMP_TOPIC ? value : null, topic === HUMIDITY_TOPIC ? value : null], 
            (err) => {
                if (err) console.error(err.message);
            }
        );
    }
});

// API Route to get the last 5 minutes of data
app.get("/data", (req, res) => {
    const query = `
        SELECT 
            timestamp,
            AVG(temperature) as avg_temp,
            AVG(humidity) as avg_humidity
        FROM weather_data
        WHERE timestamp >= datetime('now', '-5 minutes')
    `;

    db.get(query, [], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(row ? [{ time: row.timestamp, temperature: row.avg_temp, humidity: row.avg_humidity }] : []);
    });
});

// Start Server
app.listen(5000, () => {
    console.log("Server running on http://localhost:5000");
});
