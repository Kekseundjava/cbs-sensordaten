class WarnungData {
    
    constructor(gebaeude, etage, raum, temperatur, luftfeuchtigkeit, text) {
        this.gebaeude = gebaeude;
        this.etage = etage;
        this.raum = raum;
        this.temperatur = temperatur;
        this.luftfeuchtigkeit = luftfeuchtigkeit;
        this.text = text;
    }

    toString() {
        return `RaumSensorDaten(Gebaeude=${this.gebaeude}, Etage=${this.etage}, Raum=${this.raum}, Temperatur=${this.temperatur}, Luftfeuchtigkeit=${this.luftfeuchtigkeit}), Text=${this.text})`;
    }
}
module.exports = WarnungData;