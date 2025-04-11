// Importiere die Express-App aus der db_to_model.js-Datei
const axios = require('axios');

// URL der API
const apiUrl = 'http://localhost:5001';

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
    const gebaeude = 'c';
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

// Neuen Benutzer anlegen
async function createUser() {
    try {
        const response = await axios.post(`${apiUrl}/createUser`, {
            benutzer: 'test1234',  // Benutzername
            passwort: 'test1234'    // Passwort
        });
        console.log('Benutzer erfolgreich erstellt:', response.data);
    } catch (error) {
        console.error('Fehler beim Erstellen des Benutzers:', error.response ? error.response.data : error.message);
    }
}

// Benutzer-Passwort-Kombination überprüfen
async function checkUser() {
    try {
        const response = await axios.post(`${apiUrl}/checkUser`, {
            benutzer: 'test1234',  // Benutzername
            passwort: 'test1234'    // Passwort
        });
        console.log('Anmeldung erfolgreich:', response.data);
    } catch (error) {
        console.error('Fehler bei der Anmeldung:', error.response ? error.response.data : error.message);
    }
}

// Hauptfunktion zum Aufrufen der beiden APIs
async function main() {
    //console.log('Rufe GetAllActualData ab:');
    //await getAllActualData();  // Abrufen der letzten Sensordaten

    //console.log('\nRufe GetZeitSensorData ab:');
    await getZeitSensorData();  // Abrufen der Sensordaten für das angegebene Gebäude, Etage, Raum, Sensor und Zeitraum

    //Teste Create und Check User mit testuser test123
    //await createUser();
    //await checkUser();
}

// Hauptfunktion ausführen
main();
