
import axios from 'axios';
const RoomData = require('./RoomData');
const ZeitSensorData = require('./ZeitSensorData');


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
    
    startExport(){
        
    }

    tryLogin(name, password){

    }

//#endregion
//#region Public Methodes
    async liefereVerfuegbareGebaeude() {
        const daten = await this.holeAllActualData();
        return [...new Set(daten.map(e => e.Gebaeude))];
    }
    temp(){        
        this.view.setSensorData("hi1")
    }
    async liefereVerfuegbareEtagen() {
        const daten = await this.holeAllActualData();
        return [...new Set(daten.map(e => e.Etage))];
    }

    async liefereVerfuegbareRaeume() {
        const daten = await this.holeAllActualData();
        return [...new Set(daten.map(e => e.Raum))];
    }

    async liefereVerfuegbareSensoren() {
        const daten = await this.holeAllActualData();
        const sensorKeys = new Set();
        daten.forEach(entry => {
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

        this.simuliereViewMitRoomData(roomDataList);
    }

    async holeUndVerarbeiteZeitSensorDaten() {
        const { gebaeude, etage, raum, sensor, datumVon, datumBis } = this.filter;

        const response = await axios.get('http://localhost:5001/GetZeitSensorData', {
            params: { gebaeude, etage, raum, sensor, datum_von: datumVon, datum_bis: datumBis }
        });

        const zeitSensorDataList = response.data.map(
            d => new ZeitSensorData(d.timestamp, d.value)
        );

        this.simuliereViewMitZeitSensorDaten(zeitSensorDataList);
    }

    async holeAllActualData() {
        if (this.cachedAllActualData) {
            return this.cachedAllActualData;
        }

        const response = await axios.get('http://localhost:5001/GetAllActualData');
        this.cachedAllActualData = response.data;
        return this.cachedAllActualData;
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