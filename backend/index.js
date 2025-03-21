// Express-Modul importieren
const express = require('express');
const app = express();
const port = 5000;

// MQTT-Modul importieren
const mqtt = require('mqtt');

// Middleware: JSON-Parsing für API-Anfragen
app.use(express.json());

// Eine einfache Route
app.get('/', (req, res) => {
  res.send('Backend läuft!');
});

// MQTT-Client verbinden
const client = mqtt.connect('mqtt://test.mosquitto.org'); // Hier kannst du deinen eigenen MQTT-Broker verwenden

client.on('connect', () => {
  console.log('MQTT verbunden');
  client.subscribe('cbs/building_c/floor_1/room_16/display/status/switch', (err) => {
    if (!err) {
      console.log('Abonniert: cbs/building_c/floor_1/room_16/display/status/switch');
    } else {
      console.log('Fehler beim Abonnieren:', err);
    }
  });
});

// Empfang von Nachrichten über MQTT
client.on('message', (topic, message) => {
  console.log('Nachricht empfangen:', topic, message.toString());
  // Hier kannst du die Daten weiterverarbeiten oder in einer DB speichern
});

// Express-Server starten
app.listen(port, () => {
  console.log(`Backend läuft auf http://localhost:${port}`);
});
