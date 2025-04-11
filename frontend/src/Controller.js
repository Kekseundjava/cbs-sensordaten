
import axios from 'axios';
const RoomData = require('./RoomData');
const ZeitSensorData = require('./ZeitSensorData');
const WetterData = require('./WetterData');
const WarnungData = require('./WarnungData');


export class SensorDataController {
    //#region Konstruktor
    constructor(viewMethods) {
        this.filter = {
            gebaeude: null,
            etage: null,
            raum: null,
            sensor: null,
            datumVon: null,
            datumBis: null
        };
        this.view = viewMethods;
        this.cachedAllActualData = null;
    }
    //#endregion
    //#region EventHandler
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

    async startExport() {
        const { gebaeude, etage, raum, sensor, datumVon, datumBis } = this.filter;
        let exportData = [];

        if (sensor && datumVon && datumBis) {
            // Zeitdaten exportieren
            const response = await axios.get('http://localhost:5001/GetZeitSensorData', {
                params: { gebaeude, etage, raum, sensor, datum_von: datumVon, datum_bis: datumBis }
            });

            exportData = response.data.map(d => `${d.timestamp}, ${d.value}`);
        } else {
            // Aktuelle Raumdaten exportieren
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

        // Datei erzeugen & herunterladen
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

    async liefereVerfuegbareGebaeude() {
        const daten = await this.holeAllActualData();
        return [...new Set(daten.map(e => e.Gebaeude))];
    }

    async liefereVerfuegbareEtagen() {
        const daten = await this.holeAllActualData();
        const { gebaeude } = this.filter;

        const gefiltert = daten.filter(e =>
            !gebaeude || e.Gebaeude === gebaeude
        );

        return [...new Set(gefiltert.map(e => e.Etage))];
    }

    async liefereVerfuegbareRaeume() {
        const daten = await this.holeAllActualData();
        const { gebaeude, etage } = this.filter;

        const gefiltert = daten.filter(e =>
            (!gebaeude || e.Gebaeude === gebaeude) &&
            (!etage || e.Etage === etage)
        );

        return [...new Set(gefiltert.map(e => e.Raum))];
    }

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

    async holeUndVerarbeiteAllActualData() {
        const { gebaeude, etage, raum } = this.filter;
        const data = await this.holeAllActualData();

        const gefiltert = data.filter(entry =>
            (!gebaeude || entry.Gebaeude === gebaeude) &&
            (!etage || entry.Etage === etage) &&
            (!raum || entry.Raum === raum)
        );

        const roomDataList = gefiltert.map(e =>
            new RoomData(e.Gebaeude, e.Etage, e.Raum, e.Temperatur, e.Luftfeuchtigkeit)
        );

        //this.simuliereViewMitRoomData(roomDataList);
        this.view.setSensorData(roomDataList);
    }

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


    async holeAllActualData() {
        if (this.cachedAllActualData) {
            return this.cachedAllActualData;
        }

        const response = await axios.get('http://localhost:5001/GetAllActualData');
        this.cachedAllActualData = response.data;
        return this.cachedAllActualData;
    }

    async holeUndVerarbeiteWetterdaten() {
        try {
            const response = await axios.get('https://app-prod-ws.warnwetter.de/v30/stationOverviewExtended', {
                params: { stationIds: 10515 }
            });

            const wetter = response.data["10515"];
            const tag = wetter?.days?.[0];

            if (!tag) return;

            const temperatur = tag.temperatureMax;
            const wind = tag.windSpeed;
            const regen = tag.precipitation;

            const wetterData = new WetterData(temperatur, wind, regen);

            // 👉 Wetterdaten merken
            this.aktuellesWetter = wetterData;

            this.view.setWetterData(wetterData);

        } catch (error) {
            console.error("Fehler beim Laden der Wetterdaten:", error);
        }
    }

    async holeUndVerarbeiteWarnungen() {
        const daten = await this.holeAllActualData();
        const warnungen = [];

        const aktuelleStunde = new Date().getHours();

        // 👉 Windgeschwindigkeit aus gemerkten Wetterdaten lesen
        const windGeschwindigkeit = parseInt(this.aktuellesWetter?.wind || 0);

        daten.forEach(entry => {
            const { Gebaeude, Etage, Raum, Temperatur, Luftfeuchtigkeit, Licht, RolladenUnten } = entry;

            // Warnung: Licht nach 16 Uhr noch an
            if (aktuelleStunde >= 16 && Licht === true) {
                warnungen.push(
                    new WarnungData(Gebaeude, Etage, Raum, Temperatur, Luftfeuchtigkeit, "Licht ist nach 16 Uhr noch eingeschaltet.")
                );
            }

            // Warnung: Rolladen unten + starker Wind
            if (RolladenUnten === true && windGeschwindigkeit >= 50) {
                warnungen.push(
                    new WarnungData(Gebaeude, Etage, Raum, Temperatur, Luftfeuchtigkeit, "Rolladen ist unten bei starkem Wind.")
                );
            }
        });

        this.view.setWarnungData(warnungen);
    }
    //#endregion
    //#region View Simulation

    simuliereViewMitRoomData(roomDataList) {
        console.log("=== Raumdaten (gefiltert) ===");
        if (roomDataList.length === 0) {
            console.log("Keine Daten gefunden.");
        } else {
            roomDataList.forEach(d => console.log(d.toString()));
        }
    }

    simuliereViewMitZeitSensorDaten(sensorDataList) {
        console.log("=== Zeit-Sensor-Daten ===");
        if (sensorDataList.length === 0) {
            console.log("Keine Zeitdaten gefunden.");
        } else {
            sensorDataList.forEach(d => console.log(d.toString()));
        }
    }

    //#endregion
}
export default SensorDataController;

/*// Beispielnutzung:
(async () => {
    const controller = new SensorDataController();

    // Anfang: alles anzeigen
    await controller.updateView();

    // Beispielhafte Filterung:
    controller.setGebaeude("b");
    controller.setEtage("e");
    console.log("=== Raum ===");
    const raumListe = await controller.liefereVerfuegbareRaeume();
    console.log("=== Raum ===");
    if (raumListe.length > 0) {
        console.log("=== Raum1 ===");
        controller.setRaum(raumListe[0]);
    }
    //controller.setRaum(await controller.liefereVerfuegbareRaeume[0]);

    // Zeitdaten anzeigen (nur wenn Sensor & Datum gesetzt sind)
    controller.setSensor("Display Verbrauch");
    controller.setDatum("2025-04-04 00:00:00", "2025-04-04 23:59:59");
})();*/