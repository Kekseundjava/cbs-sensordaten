#GetAllActualData()
#gibt von allen räumen die Aktuellstend daten

#GetZeitSensorData(gebaeude, etage, raum, sensor, von, bis)
#Gibt von einem Bestimmten raum die Daten eines sensor Typs in einem Zeitraum

import datetime

from backend import RoomData

def GetAllActualData():
    """
    Gibt von allen Räumen die aktuellsten Daten zurück.
    Rückgabewert: Dictionary mit Raum-IDs als Schlüssel und den neuesten Sensordaten als Werte.
    """
    # Beispielhafte Implementierung (Datenbankabfrage oder Sensorabfrage erforderlich)
    actual_data = {
        {"Gebaeude": "A", "Etage": 0, "Raum": 12, "Temperatur": 22.5, "Luftfeuchtigkeit": 45},
        {"Gebaeude": "B", "Etage": 0, "Raum": 13, "Temperatur": 21.0, "Luftfeuchtigkeit": 50}
    }

    return actual_data

def GetZeitSensorData(gebaeude, etage, raum, sensor, von, bis):
    """
    Gibt von einem bestimmten Raum die Daten eines Sensortyps in einem Zeitraum zurück.
    
    Parameter:
    - gebaeude (str): Name oder ID des Gebäudes
    - etage (str/int): Nummer oder ID der Etage
    - raum (str): ID oder Name des Raums
    - sensor (str): Name des Sensortyps (z.B. Temperatur, Luftfeuchtigkeit)
    - von (datetime): Startzeitpunkt des gewünschten Zeitraums
    - bis (datetime): Endzeitpunkt des gewünschten Zeitraums
    
    Rückgabewert: Liste von Sensordaten innerhalb des angegebenen Zeitraums
    """
    # Beispielhafte Implementierung (Datenbankabfrage oder externe API erforderlich)
    dummy_data = [
        {"timestamp": datetime.datetime(2024, 3, 25, 12, 0), "value": 22.1},
        {"timestamp": datetime.datetime(2024, 3, 25, 13, 0), "value": 22.3},
        {"timestamp": datetime.datetime(2024, 3, 25, 14, 0), "value": 22.2}
    ]
    
    filtered_data = [entry for entry in dummy_data if von <= entry["timestamp"] <= bis]
    return filtered_data