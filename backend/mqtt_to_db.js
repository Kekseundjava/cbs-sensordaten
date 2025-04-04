// Module importieren
const express = require('express');
const mysql = require('mysql2');
const mqtt = require('mqtt');

// Express-App erstellen
const app = express();
const port = 5000;
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

// MQTT-Client verbinden
const client = mqtt.connect('mqtt://test.mosquitto.org');

client.on('connect', () => {
    console.log('MQTT verbunden');
    client.subscribe('cbssimulation/#', err => {
        if (!err) {
            console.log('Alle Topics unter "cbs/#" abonniert.');
        } else {
            console.error('Fehler beim Abonnieren:', err);
        }
    });
});

// Erlaubte Sensor-Typen an 5. Stelle
const allowedSensors = ['light', 'hum', 'display', 'temp', 'roller_shutter'];

// MQTT-Nachrichten empfangen und in DB speichern
client.on('message', (topic, message) => {
  console.log('Nachricht empfangen:', topic, message.toString());

  const parts = topic.split('/');
  if (parts.length < 5) return; // Sicherstellen, dass genug Teile vorhanden sind

  // Filterregel: Prüfen, ob an 5. Stelle ein erlaubter Sensor steht
  if (!allowedSensors.includes(parts[4]) && !(parts[4] === 'display' && parts.length >= 6 && parts[5] === 'status')) {
      console.log('Sensor nicht erlaubt oder fehlende Status-Informationen, Nachricht verworfen:', topic);
      return;
  }

  let value;

  if (parts[4] === 'display' && parts.length >= 6 && parts[5] === 'status') {
      // JSON-String für display verarbeiten
      try {
          const jsonData = JSON.parse(message.toString());
          // Den Wert nach "voltage" extrahieren und in einen Float umwandeln
          value = parseFloat(jsonData.voltage);

          if (isNaN(value)) {
              console.log('Ungültiger Wert für Voltage:', jsonData.voltage);
              return;
          }
      } catch (err) {
          console.log('Fehler beim Verarbeiten des JSON:', err);
          return;
      }
  } else {
      // Standard-Fall (z.B. cbs/building_a/floor_1/room_18/temp)
      const [schule, geb, stock, raum, sensor] = [parts[0], parts[1].split('_')[1], parts[2].split('_')[1], parts[3].split('_')[1], parts[4]];
      value = parseFloat(message);

      if (isNaN(value)) {
          console.log('Ungültiger Wert für Sensor:', message);
          return;
      }
  }

  // Die Daten in die Datenbank speichern
  const [schule, geb, stock, raum, sensor] = [parts[0], parts[1].split('_')[1], parts[2].split('_')[1], parts[3].split('_')[1], parts[4]];

  const query = "INSERT INTO sensordaten_ausgelesen (schule, gebaeude, stockwerk, raum, sensor, value, timestamp) VALUES (?, ?, ?, ?, ?, ?, NOW())";
  db.query(query, [schule, geb, stock, raum, sensor, value], (err, result) => {
      if (err) {
          console.error('Fehler beim Speichern in die DB:', err);
      } else {
          console.log('Daten erfolgreich gespeichert:', result.insertId);
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
