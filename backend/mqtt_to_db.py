import paho.mqtt.client as mqtt
import mysql.connector
from datetime import datetime

# 1. MQTT-Callback-Funktionen
def on_connect(client, userdata, flags, rc):
    print("Verbunden mit MQTT Broker, Code:", rc)
    if rc == 0:
        print("Erfolgreich mit MQTT Broker verbunden.")
        # Abonniere das gewünschte Topic
        client.subscribe("cbs/#")
    else:
        print(f"Verbindung fehlgeschlagen. Rückgabecode: {rc}")

def on_message(client, userdata, msg):
    print(f"Nachricht empfangen: {msg.topic} - {msg.payload.decode()}")
    
    # 2. Daten in die Datenbank einfügen
    try:
        # Verbindung zur Datenbank herstellen
        conn = mysql.connector.connect(
            host="127.0.0.1",  # Oder "localhost"
            user="root",  # Dein MySQL-Benutzername
            password="",  # Dein MySQL-Passwort
            database="ka-system"
        )
        cur = conn.cursor()

        # Hier kannst du die Daten in die Tabelle 'testdaten' einfügen
        query = "INSERT INTO testdaten (name, value, timestamp) VALUES (%s, %s, %s)"
        cur.execute(query, (msg.topic, msg.payload.decode(), datetime.now()))

        conn.commit()
        cur.close()
        conn.close()
        print("Daten erfolgreich in der DB gespeichert.")
    
    except Exception as e:
        print(f"Fehler beim Speichern in der DB: {e}")

# 3. MQTT-Client konfigurieren
mqtt_broker = "test.mosquitto.org"  # Verwende den richtigen MQTT-Broker
client = mqtt.Client()

client.on_connect = on_connect
client.on_message = on_message

# 4. Verbindung zu MQTT-Broker herstellen
client.connect(mqtt_broker, 1883, 60)

# 5. MQTT Client laufen lassen
print("Verbindung mit MQTT Broker hergestellt. Starte die Nachrichtenübertragung...")
client.loop_forever()
