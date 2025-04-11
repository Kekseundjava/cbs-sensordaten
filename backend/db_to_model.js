const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const cors = require('cors');
const axios = require('axios');


// Express-App erstellen
const app = express();
const port = 5001;
app.use(express.json());
app.use(cors());

// Verbindung zur MySQL-Datenbank (XAMPP)
const db = mysql.createConnection({
    host: '127.0.0.1',  // XAMPP MySQL läuft lokal
    user: 'root',       // Standard-Benutzername
    password: '',       // Standard-Passwort (leer lassen)
    database: 'cbs-sensordaten'
});

// Verbindung prüfen
db.connect(err => {
    if (err) {
        console.error('Fehler beim Verbinden zur MySQL-Datenbank:', err);
        return;
    }
    console.log('Verbunden mit MySQL-Datenbank');
});

// API-Endpoint zum Erstellen eines neuen Benutzers
app.post('/createUser', async (req, res) => {
    const { benutzer, passwort } = req.body;

    if (!benutzer || !passwort) {
        return res.status(400).json({ error: 'Benutzername und Passwort sind erforderlich.' });
    }

    try {
        // Passwort hashen
        const hashedPassword = await bcrypt.hash(passwort, 10);

        // SQL-Abfrage, um den neuen Benutzer zu speichern
        const query = "INSERT INTO benutzer (benutzer, passwort_hash) VALUES (?, ?)";
        db.query(query, [benutzer, hashedPassword], (err, result) => {
            if (err) {
                console.error('Fehler beim Anlegen des Benutzers:', err);
                return res.status(500).json({ error: 'Fehler beim Erstellen des Benutzers.' });
            }
            res.json({ message: 'Benutzer erfolgreich erstellt.', userId: result.insertId });
        });
    } catch (error) {
        console.error('Fehler beim Hashen des Passworts:', error);
        res.status(500).json({ error: 'Fehler beim Verarbeiten des Passworts.' });
    }
});

// API-Endpoint zum Überprüfen der Benutzer-Passwort-Kombination
app.post('/checkUser', async (req, res) => {
    const { benutzer, passwort } = req.body;

    if (!benutzer || !passwort) {
        return res.status(400).json({ error: 'Benutzername und Passwort sind erforderlich.' });
    }

    try {
        // SQL-Abfrage, um den Benutzer aus der DB zu finden
        const query = "SELECT passwort_hash FROM benutzer WHERE benutzer = ?";
        db.query(query, [benutzer], async (err, results) => {
            if (err) {
                console.error('Fehler beim Abrufen des Benutzers:', err);
                return res.status(500).json({ error: 'Fehler bei der Benutzersuche.' });
            }

            if (results.length === 0) {
                return res.status(404).json({ error: 'Benutzer nicht gefunden.' });
            }

            // Passwort mit dem gespeicherten Hash vergleichen
            const isMatch = await bcrypt.compare(passwort, results[0].passwort_hash);

            if (isMatch) {
                res.json({ message: 'Anmeldung erfolgreich.' });
            } else {
                res.status(401).json({ error: 'Falsches Passwort.' });
            }
        });
    } catch (error) {
        console.error('Fehler beim Überprüfen des Passworts:', error);
        res.status(500).json({ error: 'Fehler bei der Passwortüberprüfung.' });
    }
});

// GetZeitSensorData: Holt Sensordaten für ein spezifisches Gebäude/Etage/Raum/Sensor im angegebenen Zeitraum
app.get('/GetZeitSensorData', (req, res) => {
    const { gebaeude, etage, raum, sensor, datum_von, datum_bis } = req.query;

    const query = `
        SELECT timestamp, value
        FROM sensordaten_ausgelesen
        WHERE gebaeude = ? AND stockwerk = ? AND raum = ? AND sensor = ?
        AND timestamp BETWEEN ? AND ?
        ORDER BY timestamp ASC
    `;

    db.query(query, [gebaeude, etage, raum, sensor, datum_von, datum_bis], (err, results) => {
        if (err) {
            console.error('Fehler beim Abrufen der Daten:', err);
            return res.status(500).json({ error: 'Datenbankfehler' });
        }

        const actual_data = results.map(row => {
            const timestamp = new Date(row.timestamp);
            const formattedTimestamp = [
                timestamp.getFullYear(),
                timestamp.getMonth() + 1,
                timestamp.getDate(),
                timestamp.getHours(),
                timestamp.getMinutes(),
                timestamp.getSeconds()
            ];

            return {
                "timestamp": formattedTimestamp,
                "value": row.value
            };
        });

        res.json(actual_data);
    });
});

// GetAllActualData: Holt den letzten Wert für jede Kombination aus Gebäude, Etage, Raum und Sensor und fasst sie zusammen
app.get('/GetAllActualData', (req, res) => {
    const query = `
        SELECT s1.gebaeude, s1.stockwerk, s1.raum, s1.sensor, s1.value, s1.timestamp
        FROM sensordaten_ausgelesen AS s1
        INNER JOIN (
            SELECT gebaeude, stockwerk, raum, sensor, MAX(timestamp) AS max_timestamp
            FROM sensordaten_ausgelesen
            GROUP BY gebaeude, stockwerk, raum, sensor ) AS s2
        ON s1.gebaeude = s2.gebaeude
        AND s1.stockwerk = s2.stockwerk
        AND s1.raum = s2.raum
        AND s1.sensor = s2.sensor
        AND s1.timestamp = s2.max_timestamp; `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Fehler beim Abrufen der Daten:', err);
            return res.status(500).json({ error: 'Datenbankfehler' });
        }

        let combinedData = {};

        results.forEach(row => {
            const { gebaeude, stockwerk, raum, sensor, value } = row;

            if (!combinedData[gebaeude]) combinedData[gebaeude] = {};
            if (!combinedData[gebaeude][stockwerk]) combinedData[gebaeude][stockwerk] = {};
            if (!combinedData[gebaeude][stockwerk][raum]) combinedData[gebaeude][stockwerk][raum] = {};

            combinedData[gebaeude][stockwerk][raum][sensor] = value;
        });

        let resultData = [];
        for (let geb in combinedData) {
            for (let stock in combinedData[geb]) {
                for (let room in combinedData[geb][stock]) {
                    const roomData = combinedData[geb][stock][room];
                    resultData.push({
                        "Gebaeude": geb,
                        "Etage": stock,
                        "Raum": room,
                        "Temperatur": roomData.temp || null,
                        "Luftfeuchtigkeit": roomData.hum || null,
                        "Licht": roomData.light || null,
                        "Display Verbrauch": roomData.display || null,
                        "Rolladaen": roomData.roller_shutter || null
                    });
                }
            }
        }

        res.json(resultData);
    });
});

// Express-Server starten
app.get('/', (req, res) => {
    res.send('Backend läuft!');
});

app.listen(port, () => {
    console.log(`Backend läuft auf http://localhost:${port}`);
});

app.get('/GetWetterData', async (req, res) => {
    try {
        const response = await axios.get('https://app-prod-ws.warnwetter.de/v30/stationOverviewExtended', {
            params: { stationIds: 10515 }
        });

        const wetter = response.data["10515"];
        const tag = wetter?.days?.[0];

        if (!tag) {
            return res.status(404).json({ error: "Keine Wetterdaten gefunden." });
        }

        const temperatur = tag.temperatureMax;
        const wind = tag.windSpeed;
        const regen = tag.precipitation;

        res.json({
            temperatur,
            wind,
            regen
        });

    } catch (error) {
        console.error("Fehler beim Abrufen der Wetterdaten:", error);
        res.status(500).json({ error: "Fehler beim Abrufen der Wetterdaten." });
    }
});
