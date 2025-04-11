
import axios from 'axios';
// Importiere die Datenklassen
const RoomData = require('./RoomData');
const ZeitSensorData = require('./ZeitSensorData');
const WetterData = require('./WetterData');
const WarnungData = require('./WarnungData');

// Hauptklasse zur Steuerung der Sensor-Datenanzeige
export class SensorDataController {
    //#region Konstruktor
    constructor(viewMethods) {
        // Filter, die von der View gesetzt werden
        this.filter = {
            gebaeude: null,
            etage: null,
            raum: null,
            sensor: null,
            datumVon: null,
            datumBis: null
        };
        this.view = viewMethods;
        this.cachedAllActualData = null; // Cache für aktuelle Sensordaten
    }
    //#endregion
    //#region EventHandler
    // Setzt das gewählte Gebäude
    setGebaeude(value) {
        this.filter.gebaeude = value;
        this.updateView();
    }

    setEtage(value) {
        this.filter.etage = value;
        this.updateView();
    }

    setRaum(value) {
        this.filter.raum = value;
        this.updateView();
    }

    setSensor(value) {
        this.filter.sensor = value;
        this.updateView();
    }

    setDatum(von, bis) {
        this.filter.datumVon = von;
        this.filter.datumBis = bis;
        this.updateView();
    }

    // Exportiert entweder Zeitdaten oder aktuelle Raumdaten
    async startExport() {
        const { gebaeude, etage, raum, sensor, datumVon, datumBis } = this.filter;
        let exportData = [];

        // Wenn Sensor UND Zeitspanne angegeben sind: Zeitdaten exportieren
        if (sensor && datumVon && datumBis) {

            // Zuordnung von Anzeige-Text zu Backend-Namen
            const sensorMap = {
                // Mapping von UI-Sensornamen zu API-Namen
                'Temperatur': 'temp',
                'Luftfeuchtigkeit': 'hum',
                'Licht': 'light',
                'Display Verbrauch': 'display',
                'Rolladaen': 'roller_shutter'
            };

            // Umwandlung
            const sensor1 = sensorMap[sensor];

            if (!sensor1) {
                console.error(`Unbekannter Sensorwert: ${sensor1}`);
                return;
            }

            // Zeitdaten exportieren
            const response = await axios.get('http://localhost:5001/GetZeitSensorData', {
                params: { gebaeude, etage, raum, sensor: sensor1, datum_von: datumVon, datum_bis: datumBis }
            });

            // Formatierung der Daten
            exportData = response.data.map(d => `${d.timestamp}, ${d.value}`);

        } else {
            // Ansonsten: aktuelle Raumdaten exportieren
            const data = await this.holeAllActualData();

            const gefiltert = data.filter(entry =>
                (!gebaeude || entry.Gebaeude === gebaeude) &&
                (!etage || entry.Etage === etage) &&
                (!raum || entry.Raum === raum)
            );

            exportData = gefiltert.map(entry =>
                `Gebäude: ${entry.Gebaeude}, Etage: ${entry.Etage}, Raum: ${entry.Raum}, Temperatur: ${entry.Temperatur}, Luftfeuchtigkeit: ${entry.Luftfeuchtigkeit}`
            );
        }

        // Exportdatei erzeugen und Download anstoßen
        const blob = new Blob([exportData.join('\n')], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `export_${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    //#endregion
    //#region Public Methodes    
    // Login-Funktion (true/false)
    async tryLogin(name, password) {
        try {
            const response = await axios.post(`http://localhost:5001/checkUser`, {
                benutzer: name,
                passwort: password
            });
            console.log('Anmeldung erfolgreich:', response.data);
            return true;
        } catch (error) {
            //console.error('Fehler bei der Anmeldung:', error);
            return false;
        }
    }

    // Liste der verfügbaren Gebäude
    async liefereVerfuegbareGebaeude() {
        const daten = await this.holeAllActualData();
        return [...new Set(daten.map(e => e.Gebaeude))];
    }

    // Liste der Etagen, gefiltert nach Gebäude
    async liefereVerfuegbareEtagen() {
        const daten = await this.holeAllActualData();
        const { gebaeude } = this.filter;

        const gefiltert = daten.filter(e =>
            !gebaeude || e.Gebaeude === gebaeude
        );

        return [...new Set(gefiltert.map(e => e.Etage))];
    }

    // Liste der Räume, gefiltert nach Gebäude & Etage
    async liefereVerfuegbareRaeume() {
        const daten = await this.holeAllActualData();
        const { gebaeude, etage } = this.filter;

        const gefiltert = daten.filter(e =>
            (!gebaeude || e.Gebaeude === gebaeude) &&
            (!etage || e.Etage === etage)
        );

        return [...new Set(gefiltert.map(e => e.Raum))];
    }

    // Liste der Sensorarten im gewählten Raum
    async liefereVerfuegbareSensoren() {
        const daten = await this.holeAllActualData();
        const { gebaeude, etage, raum } = this.filter;

        const gefiltert = daten.filter(e =>
            (!gebaeude || e.Gebaeude === gebaeude) &&
            (!etage || e.Etage === etage) &&
            (!raum || e.Raum === raum)
        );

        const sensorKeys = new Set();
        gefiltert.forEach(entry => {
            Object.keys(entry).forEach(key => {
                if (!["Gebaeude", "Etage", "Raum"].includes(key)) {
                    sensorKeys.add(key);
                }
            });
        });

        return Array.from(sensorKeys);
    }


    //#endregion
    //#region Internal Methodes
    // Aktualisiert die View basierend auf den Filtern
    async updateView() {
        const { sensor, datumVon, datumBis } = this.filter;

        if (sensor && datumVon && datumBis) {
            await this.holeUndVerarbeiteZeitSensorDaten();
        } else {
            await this.holeUndVerarbeiteAllActualData();
        }
        await this.holeUndVerarbeiteWetterdaten(); // Wetter aktualisieren
        await this.holeUndVerarbeiteWarnungen();
    }

    // Holt aktuelle Raumdaten und verarbeitet sie
    async holeUndVerarbeiteAllActualData() {
        const { gebaeude, etage, raum } = this.filter;
        const data = await this.holeAllActualData();

        const gefiltert = data.filter(entry =>
            (!gebaeude || entry.Gebaeude === gebaeude) &&
            (!etage || entry.Etage === etage) &&
            (!raum || entry.Raum === raum)
        );

        const roomDataList = gefiltert.map(e => {
            const luftfeuchtigkeit = e.Luftfeuchtigkeit || null;
            const licht = e.Licht || null;

            const displayVerbrauch = e["Display Verbrauch"] != null ? e["Display Verbrauch"] > 20 : null;
            const rolladaen = e.Rolladaen != null ? e.Rolladaen === 1 : null;

            return new RoomData(
                e.Gebaeude,
                e.Etage,
                e.Raum,
                e.Temperatur || null,
                e.Luftfeuchtigkeit || null,
                e.Licht || null,
                displayVerbrauch,
                rolladaen
            );
        });

        //this.simuliereViewMitRoomData(roomDataList);
        this.view.setSensorData(roomDataList);
    }

    // Holt Zeitreihen-Daten (wenn Sensor & Zeit gesetzt)
    async holeUndVerarbeiteZeitSensorDaten() {
        const { gebaeude, etage, raum, sensor: auswahlSensor, datumVon, datumBis } = this.filter;

        // Zuordnung von Anzeige-Text zu Backend-Namen
        const sensorMap = {
            'Temperatur': 'temp',
            'Luftfeuchtigkeit': 'hum',
            'Licht': 'light',
            'Display Verbrauch': 'display',
            'Rolladaen': 'roller_shutter'
        };

        // Umwandlung
        const sensor = sensorMap[auswahlSensor];

        if (!sensor) {
            console.error(`Unbekannter Sensorwert: ${auswahlSensor}`);
            return;
        }
        try {
            const response = await axios.get('http://localhost:5001/GetZeitSensorData', {
                params: { gebaeude, etage, raum, sensor, datum_von: datumVon, datum_bis: datumBis }
            });

            const zeitSensorDataList = response.data.map(
                d => new ZeitSensorData(d.timestamp, d.value)
            );

            this.view.setTimeSensorData(zeitSensorDataList);
        } catch (error) {
            this.view.setDebug(`Fehler beim Datenabruf: ${error.message}`);
        }
    }

    // Holt alle aktuellen Sensordaten
    async holeAllActualData() {
        if (this.cachedAllActualData) {
            return this.cachedAllActualData;
        }

        const response = await axios.get('http://localhost:5001/GetAllActualData');
        this.cachedAllActualData = response.data;
        return this.cachedAllActualData;
    }

    // Holt und verarbeitet aktuelle Wetterdaten
    async holeUndVerarbeiteWetterdaten() {
        const response = await axios.get('http://localhost:5001/GetWetterData');

        const { temperatur, wind, regen } = response.data;
        const wetterData = new WetterData(temperatur, wind, regen);

        this.aktuellesWetter = wetterData;
        this.view.setWetterData(wetterData);
    }

    // Analysiert Daten & erzeugt Warnungen bei bestimmten Bedingungen
    async holeUndVerarbeiteWarnungen() {
        const daten = await this.holeAllActualData();
        const warnungen = [];

        const aktuelleStunde = new Date().getHours();

        // 👉 Windgeschwindigkeit aus gemerkten Wetterdaten lesen
        const windGeschwindigkeit = parseInt(this.aktuellesWetter?.wind || 0);

        daten.forEach(entry => {
            const { Gebaeude, Etage, Raum, Temperatur, Luftfeuchtigkeit, Licht } = entry;

            const displayVerbrauch = entry["Display Verbrauch"] != null ? entry["Display Verbrauch"] > 20 : null;
            const rolladaen = entry.Rolladaen != null ? entry.Rolladaen === 1 : null;

            // Warnung: Licht nach 21 Uhr noch an
            if (aktuelleStunde >= 17 && Licht > 70) {
                warnungen.push(
                    new WarnungData(Gebaeude, Etage, Raum, Temperatur, Luftfeuchtigkeit, Licht, displayVerbrauch, rolladaen, "Licht ist nach 16 Uhr noch eingeschaltet.")
                );
            }

            // Warnung: Rolladen unten + starker Wind
            if (rolladaen && windGeschwindigkeit >= 50) {
                warnungen.push(
                    new WarnungData(Gebaeude, Etage, Raum, Temperatur, Luftfeuchtigkeit, Licht, displayVerbrauch, rolladaen, "Rolladen ist unten bei starkem Wind.")
                );
            }
        });

        this.view.setWarnungData(warnungen);
    }
    //#endregion
}
export default SensorDataController;