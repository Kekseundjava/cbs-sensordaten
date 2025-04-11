class RoomData {
    constructor(gebaeude, etage, raum, temperatur, luftfeuchtigkeit, licht, display_Verbrauch, rolladaen) {
        this.gebaeude = gebaeude;
        this.etage = etage;
        this.raum = raum;
        this.temperatur = temperatur;
        this.luftfeuchtigkeit = luftfeuchtigkeit;
        this.licht = licht;
        this.display_Verbrauch = display_Verbrauch;
        this.rolladaen = rolladaen;
    }

    toString() {
        return `Gebaeude=${this.gebaeude}, Etage=${this.etage}, Raum=${this.raum}, ` +
               `Temperatur=${this.temperatur}°C, Luftfeuchtigkeit=${this.luftfeuchtigkeit}, ` +
               `Licht=${this.licht} lumen, Display An=${this.display_Verbrauch}, Rolladen Oben=${this.rolladaen}`;
    }
    
}
module.exports = RoomData;
