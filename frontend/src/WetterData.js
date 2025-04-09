class WetterData {
    
    constructor(temperatur, wind, regen) {
        this.temperatur = temperatur;
        this.wind = wind;
        this.regen = regen;
    }

    toString() {
        return `WetterData(temperatur=${this.temperatur}, wind=${this.wind}, regen=${this.regen})`;
    }
}
module.exports = WetterData;