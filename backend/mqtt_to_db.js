// Module importieren
const express = require('express');
const mysql = require('mysql2');
const mqtt = require('mqtt');

// Express-App erstellen
const app = express();
const port = 5000;
app.use(express.json());

// Interner Cache: letzter erfolgreicher DB-Eintrag je Sensor-Standort
const lastInsertMap = new Map();
const getKey = (geb, stock, raum, sensor) => `${geb}|${stock}|${raum}|${sensor}`;

// Verbindung zur MySQL-Datenbank (XAMPP)
const db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'cbs-sensordaten'
});

db.connect(err => {
    if (err) {
        console.error('Fehler beim Verbinden zur MySQL-Datenbank:', err);
        return;
    }
    console.log('Verbunden mit MySQL-Datenbank');
});

// MQTT-Client verbinden
const client = mqtt.connect('mqtt://test.mosquitto.org');

client.on('connect', () => {
    console.log('MQTT verbunden');
    client.subscribe('cbssimulation/#', err => {
        if (!err) {
            console.log('Alle Topics unter "cbssimulation/#" abonniert.');
        } else {
            console.error('Fehler beim Abonnieren:', err);
        }
    });
});

// Erlaubte Sensor-Typen
const allowedSensors = ['light', 'hum', 'display', 'temp', 'roller_shutter'];

client.on('message', (topic, message) => {
    //console.log('Nachricht empfangen:', topic, message.toString());

    const parts = topic.split('/');
    if (parts.length < 5) return;

    const sensor = parts[4];
    const isDisplayStatus = (sensor === 'display' && parts[5] === 'status');

    if (!allowedSensors.includes(sensor) && !isDisplayStatus) {
        console.log('Sensor nicht erlaubt oder unvollständig:', topic);
        return;
    }

    // Grundstruktur extrahieren
    const [schule, geb, stock, raum] = [
        parts[0],
        parts[1]?.split('_')[1],
        parts[2]?.split('_')[1],
        parts[3]?.split('_')[1]
    ];

    if (!geb || !stock || !raum || !sensor) {
        console.log('Ungültige Topic-Struktur:', topic);
        return;
    }

    let value;

    if (isDisplayStatus) {
        try {
            const jsonData = JSON.parse(message.toString());
            value = parseFloat(jsonData.voltage);
            if (isNaN(value)) {
                console.log('Ungültiger Voltage-Wert:', jsonData.voltage);
                return;
            }
        } catch (err) {
            console.log('Fehler beim JSON-Parsen:', err);
            return;
        }
    } else {
        value = parseFloat(message);
        if (isNaN(value)) {
            console.log('Ungültiger Sensorwert:', message.toString());
            return;
        }
    }

    // Zeitprüfung
    const key = getKey(geb, stock, raum, sensor);
    const now = Date.now();
    const lastInsert = lastInsertMap.get(key);

    if (lastInsert && (now - lastInsert < 10 * 60 * 1000)) {
        //console.log(`Ignoriert: Letzter Eintrag <10min alt für ${key}`);
        return;
    }

    // In DB speichern
    const query = "INSERT INTO sensordaten_ausgelesen (schule, gebaeude, stockwerk, raum, sensor, value, timestamp) VALUES (?, ?, ?, ?, ?, ?, NOW())";
    db.query(query, [schule, geb, stock, raum, sensor, value], (err, result) => {
        if (err) {
            console.error('Fehler beim Speichern in DB:', err);
        } else {
            //console.log(`✅ Gespeichert (#${result.insertId}) für ${key}`);
            lastInsertMap.set(key, now);
        }
    });
});

// Express-Server starten
app.get('/', (req, res) => {
    res.send('Backend läuft!');
});

app.listen(port, () => {
    console.log(`Backend läuft auf http://localhost:${port}`);
});
