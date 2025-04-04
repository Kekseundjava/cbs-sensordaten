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
    const gebaeude = 'b';
    const etage = 'e';
    const raum = '16';
    const sensor = 'display';
    const datum_von = '2025-04-04 00:00:00';
    const datum_bis = '2025-04-04 23:59:59';

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
