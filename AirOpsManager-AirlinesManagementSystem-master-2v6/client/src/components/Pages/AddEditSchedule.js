import React, { useEffect, useState } from "react";
import { useParams, useHistory, Link } from "react-router-dom";
import "./styles/AddEditSchedule.css";
import Axios from "axios";
import { toast } from "react-toastify";

export default function AddEditSchedule() {
  const history = useHistory();
  const { id } = useParams(); // schedule_id when editing

  const [scheduleId, setScheduleId] = useState("");
  const [flightNo, setFlightNo] = useState("");
  const [departure, setDeparture] = useState("");
  const [arrival, setArrival] = useState("");
  const [duration, setDuration] = useState("");
  const [fares, setFares] = useState("");

  const [airplaneList, setAirplaneList] = useState([]);
  const [airportList, setAirportList] = useState([]);
  const [statusList, setStatusList] = useState([]);

  const [airplaneId, setAirplaneId] = useState("");
  const [fromAirport, setFromAirport] = useState("");
  const [toAirport, setToAirport] = useState("");
  const [flightStatusId, setFlightStatusId] = useState("");

  /* ---------------------- AUTO GENERATE ID ---------------------- */

  const generateId = (prefix, min, max) => {
    return prefix + Math.floor(Math.random() * (max - min + 1) + min);
  };

  /* ---------------------- LOAD DROPDOWN DATA ---------------------- */

  useEffect(() => {
    Axios.get("http://localhost:5000/airplane/api/get").then((res) =>
      setAirplaneList(res.data)
    );
    Axios.get("http://localhost:5000/airport/api/get").then((res) =>
      setAirportList(res.data)
    );
    Axios.get("http://localhost:5000/flightStatus/api/get").then((res) =>
      setStatusList(res.data)
    );
  }, []);

  /* ---------------------- IF EDIT MODE ---------------------- */

  useEffect(() => {
    if (id) {
      Axios.get(`http://localhost:5000/schedule/api/get/${id}`).then((resp) => {
        const data = resp.data[0];
        setScheduleId(data.schedule_id);
        setDeparture(data.departure_time);
        setArrival(data.arrival_time);
        setDuration(data.duration_time);
      });

      // also fetch flight data
      Axios.get("http://localhost:5000/flight/api/get").then((resp) => {
        const found = resp.data.find((f) => Number(f.schedule_id) === Number(id));
        if (found) {
          setFlightNo(found.flight_no);
          setAirplaneId(found.airplane_id);
          setFlightStatusId(found.flightstatus_id);
          setFares(found.fares);
        }
      });
    } else {
      setScheduleId(generateId("", 1000, 9999)); // random schedule id
      setFlightNo(generateId("", 2000, 9000)); // random flight no
    }
  }, [id]);

  /* ---------------------- VALIDATION ---------------------- */

  function validate() {
    if (!departure || !arrival) {
      toast.error("Departure & Arrival times are required");
      return false;
    }

    if (!airplaneId) {
      toast.error("Please select an airplane");
      return false;
    }

    if (!fromAirport) {
      toast.error("Select From Airport");
      return false;
    }

    if (!toAirport) {
      toast.error("Select To Airport");
      return false;
    }

    if (fromAirport === toAirport) {
      toast.error("From & To airport cannot be same");
      return false;
    }

    if (!flightStatusId) {
      toast.error("Please select Flight Status");
      return false;
    }

    if (!fares || Number(fares) <= 0) {
      toast.error("Base fare is required");
      return false;
    }

    const now = new Date();
    const dep = new Date(departure);
    const arr = new Date(arrival);

    if (dep < now) {
      toast.error("Departure time cannot be before current time");
      return false;
    }

    if (arr <= dep) {
      toast.error("Arrival must be after departure");
      return false;
    }

    const maxArrival = new Date(dep.getTime() + 12 * 60 * 60 * 1000);
    if (arr > maxArrival) {
      toast.error("Arrival cannot be more than 12 hours after departure");
      return false;
    }

    return true;
  }

  /* ---------------------- CALCULATE DURATION ---------------------- */

  function computeDuration(dep, arr) {
    const d1 = new Date(dep);
    const d2 = new Date(arr);
    const diffHrs = (d2 - d1) / (1000 * 60 * 60);
    return diffHrs.toFixed(2);
  }

  /* ---------------------- SUBMIT ---------------------- */

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validate()) return;

  const duration_time = parseFloat(computeDuration(departure, arrival));
  setDuration(duration_time);

  // find airline name
  const selectedAirplane = airplaneList.find(
    (a) => Number(a.airplane_id) === Number(airplaneId)
  );
  const airlineName = selectedAirplane ? selectedAirplane.airline : null;

  /* ---------------- SAVE SCHEDULE ---------------- */

  if (id) {
    // UPDATE MODE
    await Axios.put(
      `http://localhost:5000/schedule/api/update/${scheduleId}`,
      {
        schedule_id: scheduleId,
        departure_time: departure.replace("T", " ") + ":00",
        arrival_time: arrival.replace("T", " ") + ":00",
        duration_time,
      }
    );
  } else {
    // ADD MODE (USE POST)
    await Axios.post("http://localhost:5000/schedule/api/post", {
      schedule_id: scheduleId,
      departure_time: departure.replace("T", " ") + ":00",
      arrival_time: arrival.replace("T", " ") + ":00",
      duration_time,
    });
  }

  /* ---------------- SAVE / UPDATE FLIGHT ---------------- */

  await Axios.post("http://localhost:5000/flight/api/post", {
    flight_no: flightNo,
    schedule_id: scheduleId,
    flightstatus_id: flightStatusId,
    airplane_id: airplaneId,
    fares,
    from_airport: fromAirport,
    to_airport: toAirport,
    airline: airlineName,
  });

  toast.success(id ? "Schedule Updated Successfully" : "Schedule Added Successfully");
  setTimeout(() => history.push("/Schedule"), 800);
};

  /* ---------------------- UI ---------------------- */

  return (
    <div className="form-wrapper">
      <form className="schedule-form" onSubmit={handleSubmit}>
        <h2>{id ? "Update Schedule" : "Add New Schedule"}</h2>

        {/* AUTO-IDS */}
        <div className="row-2">
          <div>
            <label>Schedule ID</label>
            <input value={scheduleId} readOnly />
          </div>

          <div>
            <label>Flight No</label>
            <input value={flightNo} readOnly />
          </div>
        </div>

        {/* TIME PICKERS */}
        <label>Departure Time</label>
        <input type="datetime-local" value={departure} onChange={(e) => setDeparture(e.target.value)} required />

        <label>Arrival Time</label>
        <input type="datetime-local" value={arrival} onChange={(e) => setArrival(e.target.value)} required />

        {/* DROPDOWNS */}
        <label>Airplane</label>
        <select value={airplaneId} onChange={(e) => setAirplaneId(e.target.value)} required>
          <option value="">Select Airplane</option>
          {airplaneList.map((a) => (
            <option key={a.airplane_id} value={a.airplane_id}>
              {a.model} – {a.max_seats} seats
            </option>
          ))}
        </select>

        <label>From Airport</label>
        <select value={fromAirport} onChange={(e) => setFromAirport(e.target.value)} required>
          <option value="">Select Airport</option>
          {airportList.map((a) => (
            <option key={a.airport_code} value={a.airport_code}>
              {a.airport_name} ({a.airport_code})
            </option>
          ))}
        </select>

        <label>To Airport</label>
        <select value={toAirport} onChange={(e) => setToAirport(e.target.value)} required>
          <option value="">Select Airport</option>
          {airportList.map((a) => (
            <option key={a.airport_code} value={a.airport_code}>
              {a.airport_name} ({a.airport_code})
            </option>
          ))}
        </select>

        <label>Flight Status</label>
        <select value={flightStatusId} onChange={(e) => setFlightStatusId(e.target.value)} required>
          <option value="">Select Status</option>
          {statusList.map((s) => (
            <option key={s.flightstatus_id} value={s.flightstatus_id}>
              {s.status}
            </option>
          ))}
        </select>

        {/* BASE FARE */}
        <label>Base Fare (₹)</label>
        <input type="number" value={fares} onChange={(e) => setFares(e.target.value)} required />

        {/* BUTTONS */}
        <div className="btn-row">
          <button type="submit" className="save-btn">
            {id ? "Update" : "Add"}
          </button>

          <Link to="/Schedule">
            <button type="button" className="back-btn">Back</button>
          </Link>
        </div>
      </form>
    </div>
  );
}
