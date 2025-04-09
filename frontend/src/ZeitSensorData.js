class ZeitSensorData {
    constructor(timestampArray, value) {
        // Erwartet z.B. [2025, 4, 4, 8, 44, 28]
        this.jahr = timestampArray[0];
        this.monat = timestampArray[1];
        this.tag = timestampArray[2];
        this.stunde = timestampArray[3];
        this.minute = timestampArray[4];
        this.sekunde = timestampArray[5];
        this.value = value;
    }

    getTimestampString() {
        return `${this.jahr}-${this.monat.toString().padStart(2, '0')}-${this.tag.toString().padStart(2, '0')} ` +
               `${this.stunde.toString().padStart(2, '0')}:${this.minute.toString().padStart(2, '0')}:${this.sekunde.toString().padStart(2, '0')}`;
    }

    toString() {
        return `ZeitSensorData(Zeit=${this.getTimestampString()}, Wert=${this.value})`;
    }
}

module.exports = ZeitSensorData;
