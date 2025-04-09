import './App.css';
import { useState, useEffect } from "react";
import { SensorDataController } from './Controller.js';

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

  // 1. Methoden definieren, auf die der Controller Zugriff haben soll
  const setSensorData = (sensorData) => {setBuildings(sensorData.map(element => element.toString()))};
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

  const [buildings, setBuildings] = useState([]);
  useEffect(() => {
    // Async function to fetch available buildings
    const fetchBuildings = async () => {
      const buildingsList = await controller.liefereVerfuegbareGebaeude();
      setBuildings(buildingsList); // Set the buildings in state
    };

    fetchBuildings(); // Call the async function
  }, []);
  const floors = ["E", "1", "2"];
  const rooms = ["01", "02"];
  const sensors = ["x", "y"];

  useEffect(() => {
    const concatenatedText = first + second + third + fourth + startdate + enddate + starttime + endtime;
    setText(concatenatedText);
  }, [first, second, third, fourth, startdate, enddate, starttime, endtime]);

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex gap-4">
        <div className="left space-y-2">
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
              <option key={r} value={r}>{`Option ${r}`}</option>
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
              <option key={s} value={s}>{`Option ${s.toUpperCase()}`}</option>
            ))}
          </select>

          {/* Date and Time Inputs */}
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
        </div>
      </div>
      <div className="right mt-4">
        <div className="p-2 border rounded bg-gray-100">{text}</div>
      </div>
    </div>
  );
}

export default App;
