class RoomData {
    
    constructor(gebaeude, etage, raum, temperatur, luftfeuchtigkeit) {
        this.gebaeude = gebaeude;
        this.etage = etage;
        this.raum = raum;
        this.temperatur = temperatur;
        this.luftfeuchtigkeit = luftfeuchtigkeit;
    }

    toString() {
        return `RaumSensorDaten(Gebaeude=${this.gebaeude}, Etage=${this.etage}, Raum=${this.raum}, Temperatur=${this.temperatur}, Luftfeuchtigkeit=${this.luftfeuchtigkeit})`;
    }
}
module.exports = RoomData;