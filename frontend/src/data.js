import { useState, useEffect } from "react";
import { SensorDataController } from './Controller.js';
import './data.css';  // Import the CSS file

function App() {
  // State variables
  const [first, setFirst] = useState("");
  const [second, setSecond] = useState("");
  const [third, setThird] = useState("");
  const [fourth, setFourth] = useState("");
  const [startdate, setStartDate] = useState("");
  const [enddate, setEndDate] = useState("");
  const [starttime, setStartTime] = useState("");
  const [endtime, setEndTime] = useState("");
  const [text, setText] = useState("");

const tmpdata = "23";
const tmprain = "23";

  

  const[buildings, setBuildings] = useState([]);
  
  const [floors, setFloors] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [sensors, setSensors] = useState([]);

  
  const [data, setData] = useState([]);

  //const buildings = ["A", "B", "C"]; // Example buildings
  //const floors = ["E", "1", "2"];
  //const rooms = ["01", "02"];
  //const sensors = ["x", "y"];


  // 1. Methoden definieren, auf die der Controller Zugriff haben soll
  const setSensorData = (sensorData) => {
    setBuildings(sensorData.map(element => element.toString()))
    };
  const setTimeSensorData = (timeSensorData) => {};
  const setWarnungData = (warnungData) => {};
  const setWetterData = (wetterData) => {};

  // 2. Controller erzeugen und Methoden übergeben
  const controller = new SensorDataController({
    setSensorData,
    setTimeSensorData,
    setWarnungData,
    setWetterData
  });

  useEffect(() => {
    // Async function to fetch available buildings
    const fetch = async () => {
        
        
      const buildingsList = await controller.liefereVerfuegbareGebaeude();
      setBuildings(buildingsList); // Set the buildings in state
      

      const floorsList = await controller.liefereVerfuegbareEtagen();
        setFloors(floorsList); // Set the floors in state

        const roomsList = await controller.liefereVerfuegbareRaeume();
        setRooms(roomsList); // Set the rooms in state

        const sensorsList = await controller.liefereVerfuegbareSensoren();
        setSensors(sensorsList); // Set the sensors in state
        
        
        const exampleData = [
            { id: 1, name: 'Gebäude A', beschreibung: 'Beschreibung A' },
            { id: 2, name: 'Gebäude B', beschreibung: 'Beschreibung B' },
            { id: 3, name: 'Gebäude C', beschreibung: 'Beschreibung C' },
          ];
          setData(exampleData); // Setze die Beispiel-Daten


    };
    

    fetch(); // Call the async function
  },[]);
  

  useEffect(() => {
    const concatenatedText = first + second + third + fourth + startdate + enddate + starttime + endtime;
    setText(concatenatedText);
  }, [first, second, third, fourth, startdate, enddate, starttime, endtime]);

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex gap-4">
        <div className="left">
          <select
            value={first}
            onChange={(e) => setFirst(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">Gebäude</option>
            {buildings.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>

          <select
            value={second}
            onChange={(e) => setSecond(e.target.value)}
            disabled={!first}
            className="w-full p-2 border rounded disabled:opacity-50"
          >
            <option value="">Etage</option>
            {floors.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>

          <select
            value={third}
            onChange={(e) => setThird(e.target.value)}
            className="w-full p-2 border rounded"
            disabled={!second}
          >
            <option value="">Raum</option>
            {rooms.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>

          <select
            value={fourth}
            onChange={(e) => setFourth(e.target.value)}
            className="w-full p-2 border rounded"
            disabled={!third}
          >
            <option value="">Sensor</option>
            {sensors.map((s) => (
              <option key={s} value={s}>{s.toUpperCase()}</option>
            ))}
          </select>

          <input
            type="date"
            id="start"
            value={startdate}
            disabled={fourth === ""}
            onChange={(e) => setStartDate(e.target.value)}
          />

          <input
            type="time"
            id="starttime"
            value={starttime}
            disabled={startdate === ""}
            onChange={(e) => setStartTime(e.target.value)}
          />

          <input
            type="date"
            id="end"
            value={enddate}
            min={startdate}
            disabled={starttime === ""}
            onChange={(e) => setEndDate(e.target.value)}
          />

          <input
            type="time"
            id="endtime"
            value={endtime}
            disabled={enddate === ""}
            onChange={(e) => setEndTime(e.target.value)}
          />
          <div className="data-container">
      {data.map((item) => (
        <div key={item.id} className="data-box">
          <h3>{item.name}</h3>
          <p>{item.beschreibung}</p>
        </div>
              ))}
        </div>
        <div className="export-container">
        <button
          onClick={() => {
            controller.startExport();
          }}
          className="export-button"
        >
            
          Export
        </button>
        </div>
        
    </div>
      </div>
      <div className="right">
        <div	className="text-box">
            <h1>Wetterbericht</h1>
            Temperatur: {tmpdata} °C
            <br />
            Regen: {tmprain} mm

        </div>
        <div className="warning">
          <h1>Warnungen</h1>
          {text}
        </div>
        
      </div>
    </div>
  );
}

export default App;
