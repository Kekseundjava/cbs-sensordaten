class WarnungData {
    

    toString() {
        return `RaumSensorDaten(Gebaeude=${this.gebaeude}, Etage=${this.etage}, Raum=${this.raum}, Temperatur=${this.temperatur}, Luftfeuchtigkeit=${this.luftfeuchtigkeit}))`;
    }
    constructor(gebaeude, etage, raum, temperatur, luftfeuchtigkeit, licht, display_Verbrauch, rolladaen, text) {
        this.gebaeude = gebaeude;
        this.etage = etage;
        this.raum = raum;
        this.temperatur = temperatur;
        this.luftfeuchtigkeit = luftfeuchtigkeit;
        this.licht = licht;
        this.display_Verbrauch = display_Verbrauch;
        this.rolladaen = rolladaen;
        this.text = text;
    }

    toString() {
        return `${this.gebaeude}${this.etage}${this.raum}: ` +
               `${this.text}`;
    }
}
module.exports = WarnungData;