import { useState, useEffect } from "react";
import { SensorDataController } from './Controller.js';
import './data.css';  // Import the CSS file
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  } from 'recharts';

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
  const [formattedData, setFormattedData] = useState([]);
  const[buildings, setBuildings] = useState([]);
  const [floors, setFloors] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [sensors, setSensors] = useState([]);
  const [sendata, setsenData] = useState([]);
  const [data, setData] = useState([]);
  const [wetdata, setwetData] = useState("test");
  const [debugdata, setdebugdata] = useState("");
  const [timesendata, settimesensenData] = useState([]);
  const [warndata, setwarnData] = useState([]);


  // 1. Define Methods for the Controller
  const setSensorData = (sensorData) => {
    if(startdate==""|| enddate==""||starttime==""||endtime==""){ //so that the data doesnt overwrite
        setsenData(sensorData.map(element => element.toString()))
    }
    };

  const setTimeSensorData = (timeSensorData) => {
    if(startdate!=""&& enddate!=""&&starttime!=""&&endtime!=""){ 
        setsenData(timeSensorData.map(element => element.toString()))
        const datas = sendata.map(str => { //formats it for the chart
            const zeitMatch = str.match(/Zeit=([^,]+)/);
            const wertMatch = str.match(/Wert=(\d+)/);
    
            return {
            Zeit: zeitMatch ? zeitMatch[1].trim() : '',
            Wert: wertMatch ? Number(wertMatch[1]) : null,
            };
        })
    setFormattedData(datas);
}
    };
  const setWarnungData = (warnungData) => {setwarnData(warnungData.map(element => element.toString()))};
  const setWetterData = (wetterData) => {setwetData(wetterData)};
  const setDebug = (text) => {
    setdebugdata(text)
  };

  // 2. Controller erzeugen und Methoden übergeben
  const controller = new SensorDataController({
    setSensorData,
    setTimeSensorData,
    setWarnungData,
    setWetterData,
    setDebug
  });

  useEffect(() => {
    controller.setGebaeude(first);
    controller.setEtage(second);
    controller.setRaum(third);
    controller.setSensor(fourth);
    controller.setDatum(startdate +" " + starttime + ":00" , enddate + " " + endtime + ":00");

    const concatenatedText = first + second + third + fourth + startdate + enddate + starttime + endtime;
    setText(concatenatedText);
    const fetch = async () => {
        
        
        const buildingsList = await controller.liefereVerfuegbareGebaeude();
        setBuildings(buildingsList); // Set the buildings in state
        
  
        const floorsList = await controller.liefereVerfuegbareEtagen();
          setFloors(floorsList); // Set the floors in state
  
          const roomsList = await controller.liefereVerfuegbareRaeume();
          setRooms(roomsList); // Set the rooms in state
  
          const sensorsList = await controller.liefereVerfuegbareSensoren();
          setSensors(sensorsList); // Set the sensors in state
      };
      
  
      fetch(); // Call the async function
  }, [first, second, third, fourth, startdate, enddate, starttime, endtime]);

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex gap-4">
        <div className="left">
          <select
            value={first}
            onChange={(e) => setFirst(e.target.value)}
            className="selects"
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
            className="selects"
          >
            <option value="">Etage</option>
            {floors.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>

          <select
            value={third}
            onChange={(e) => setThird(e.target.value)}
            className="selects"
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
            className="selects"
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
          {formattedData.length==0 ?(
        <div className="data-container">
            {sendata.map((item, index) => (
                <div className="data-box" key={index}>
                    <h3>{item.split(":")[0]}</h3>
                    <p>{item.split(":")[1]}</p>
                </div>
            ))}
        </div>
        ): (
            <LineChart
            width={1000}
            height={500}
            data={formattedData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
            <CartesianGrid strokeDasharray="5 5" />
            <XAxis dataKey="Zeit" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="Wert" stroke="#8884d8" strokeWidth={2} />
        </LineChart>
        )}
        <div className="export-container">
        <button
          onClick={() => {
            controller.setGebaeude(first);
            controller.setEtage(second);
            controller.setRaum(third);
            controller.setSensor(fourth);
            controller.setDatum(startdate + " " + starttime + ":00", enddate + " " + endtime + ":00");
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
            <p>temperatur: {wetdata.temperatur/10}°C</p> 
            <p>windstärke: {wetdata.wind/10}km/h</p>
            <p>regen: {wetdata.regen/10}mm</p>

            <br />

        </div>
        <div className="warning">
          <h1>Warnungen</h1>
          {debugdata}
          {warndata.map((item, index) => (
            <div className="warning-box" key={index}>
              <h3>{item.split(":")[0]}</h3>
                <p>{item.split(":")[1]}</p>
            </div>
          ))}
          
        </div>
        
      </div>
    </div>
  );
}

export default App;
