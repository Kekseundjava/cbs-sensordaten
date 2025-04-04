// Module importieren
const express = require('express');
const mysql = require('mysql2');

// Express-App erstellen
const app = express();
const port = 5001;
app.use(express.json());

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

// GetZeitSensorData: Holt Sensordaten für ein spezifisches Gebäude/Etage/Raum/Sensor im angegebenen Zeitraum
app.get('/GetZeitSensorData', (req, res) => {
    const { gebaeude, etage, raum, sensor, datum_von, datum_bis } = req.query;

    // SQL-Abfrage zur Extraktion der Sensordaten im angegebenen Zeitraum
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

        // Ergebnis in ein passendes Format umwandeln und den timestamp anpassen
        const actual_data = results.map(row => {
            const timestamp = new Date(row.timestamp); // timestamp in Date-Objekt umwandeln

            // Benutzerdefiniertes Format für timestamp: [Jahr, Monat, Tag, Stunde, Minute, Sekunde]
            const formattedTimestamp = [
                timestamp.getFullYear(),
                timestamp.getMonth() + 1, // Monat ist nullbasiert, daher +1
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

        // Ergebnis zurückgeben
        res.json(actual_data);
    });
});

// GetAllActualData: Holt den letzten Wert für jede Kombination aus Gebäude, Etage, Raum und Sensor und fasst sie zusammen
app.get('/GetAllActualData', (req, res) => {
    const query = `
        SELECT gebaeude, stockwerk, raum, sensor, value, MAX(timestamp) AS latest_timestamp
        FROM sensordaten_ausgelesen
        GROUP BY gebaeude, stockwerk, raum, sensor;
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Fehler beim Abrufen der Daten:', err);
            return res.status(500).json({ error: 'Datenbankfehler' });
        }

        // Daten in ein verständliches Format umwandeln
        let combinedData = {};

        results.forEach(row => {
            const { gebaeude, stockwerk, raum, sensor, value } = row;

            // Kombinierte Daten für jede Raum/Sensor-Kombination
            if (!combinedData[gebaeude]) combinedData[gebaeude] = {};
            if (!combinedData[gebaeude][stockwerk]) combinedData[gebaeude][stockwerk] = {};
            if (!combinedData[gebaeude][stockwerk][raum]) combinedData[gebaeude][stockwerk][raum] = {};

            // Füge den Wert zum entsprechenden Sensor in der kombinierten Struktur hinzu
            combinedData[gebaeude][stockwerk][raum][sensor] = value;
        });

        // Umwandlung der kombinierten Daten in das endgültige Format
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
                        "Display Verbrauch": roomData.display || null
                    });
                }
            }
        }

        // Ergebnis zurückgeben
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
