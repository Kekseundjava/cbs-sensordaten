// Importiere die Express-App aus der db_to_model.js-Datei
const axios = require('axios');

// Funktion, um GetAllActualData() abzurufen
async function getAllActualData() {
    try {
        const response = await axios.get('http://localhost:5001/GetAllActualData');
        console.log('GetAllActualData Response:', response.data);
    } catch (error) {
        console.error('Fehler beim Abrufen der letzten Sensordaten:', error);
    }
}

// Funktion, um GetZeitSensorData() abzurufen
async function getZeitSensorData() {
    const gebaeude = 'a';
    const etage = '1';
    const raum = '22';
    const sensor = 'light';
    const datum_von = '2025-04-03 22:01:50';
    const datum_bis = '2025-04-03 22:38:50';

    try {
        const response = await axios.get('http://localhost:5001/GetZeitSensorData', {
            params: {
                gebaeude,
                etage,
                raum,
                sensor,
                datum_von,
                datum_bis
            }
        });
        console.log('GetZeitSensorData Response:', response.data);
    } catch (error) {
        console.error('Fehler beim Abrufen der Sensordaten im Zeitraum:', error);
    }
}

// Hauptfunktion zum Aufrufen der beiden APIs
async function main() {
    console.log('Rufe GetAllActualData ab:');
    await getAllActualData();  // Abrufen der letzten Sensordaten

    console.log('\nRufe GetZeitSensorData ab:');
    await getZeitSensorData();  // Abrufen der Sensordaten für das angegebene Gebäude, Etage, Raum, Sensor und Zeitraum
}

// Hauptfunktion ausführen
main();
