// src/components/Admin/Schedule.jsx (or wherever your Schedule component is)

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Axios from "axios";
import { toast } from "react-toastify";
import Sidebar from "./Sidebar";
import "./styles/FlightCard.css";
import "./styles/Filters.css";

// Map airline names to logo images (adjust file names if needed)
const airlineLogos = {
  "IndiGo": require("../../images/IndiGo.png"),
  "Air India": require("../../images/AirIndia.png"),
  "Vistara": require("../../images/Vistara.png"),
  "SpiceJet": require("../../images/SpiceJet.png"),
  "Akasa Air": require("../../images/Akasa.png"),
  "Go First": require("../../images/gofirst.png"),
};

function getDurationMinutes(schedule) {
  if (!schedule?.departure_time || !schedule?.arrival_time) return null;
  const dep = new Date(schedule.departure_time.replace(" ", "T"));
  const arr = new Date(schedule.arrival_time.replace(" ", "T"));
  const diff = (arr - dep) / (1000 * 60);
  if (!isFinite(diff) || diff <= 0) return null;
  return Math.round(diff);
}

function formatDurationLabel(schedule) {
  const mins = getDurationMinutes(schedule);
  if (mins == null) return "Duration N/A • Non-stop";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m • Non-stop`;
}

const Schedule = () => {
  const [flights, setFlights] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [airplanes, setAirplanes] = useState([]);
  const [airports, setAirports] = useState([]);

  // filters
  const [airlineFilter, setAirlineFilter] = useState("");
  const [fromFilter, setFromFilter] = useState("");
  const [toFilter, setToFilter] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [timeFilter, setTimeFilter] = useState("");
  const [priceFilter, setPriceFilter] = useState(50000);

  // sorting
  const [sortBy, setSortBy] = useState("");

  useEffect(() => {
    Promise.all([
      Axios.get("http://localhost:5000/flight/api/get"),
      Axios.get("http://localhost:5000/schedule/api/get"),
      Axios.get("http://localhost:5000/airplane/api/get"),
      Axios.get("http://localhost:5000/airport/api/get"),
    ])
      .then(([fRes, sRes, aRes, apRes]) => {
        setFlights(fRes.data || []);
        setSchedules(sRes.data || []);
        setAirplanes(aRes.data || []);
        setAirports(apRes.data || []);
      })
      .catch(() => {
        toast.error("Failed to load schedules");
      });
  }, []);

  const delSchedule = (id) => {
    if (window.confirm(`Do you really want to delete Schedule ID ${id}?`)) {
      Axios.delete(`http://localhost:5000/schedule/api/remove/${id}`)
        .then(() => {
          toast.success("Schedule deleted successfully!");
          // reload data
          setFlights((prev) => prev.filter((f) => f.schedule_id !== id));
        })
        .catch(() => toast.error("Error deleting schedule"));
    }
  };

  // merge all data into a single array for the UI
  const combined = flights.map((f) => {
    const schedule = schedules.find(
      (s) => Number(s.schedule_id) === Number(f.schedule_id)
    );
    const airplane = airplanes.find(
      (a) => Number(a.airplane_id) === Number(f.airplane_id)
    );
    const depAirport = airports.find(
      (ap) => String(ap.airport_code) === String(f.from_airport)
    );
    const arrAirport = airports.find(
      (ap) => String(ap.airport_code) === String(f.to_airport)
    );

    return {
      ...f,
      schedule,
      airplane,
      depAirport,
      arrAirport,
    };
  });

  // filter logic
  const filtered = combined.filter((item) => {
    const depTime = item.schedule?.departure_time;
    const depHour = depTime ? parseInt(depTime.slice(11, 13)) : null;
    const depDate = depTime ? depTime.slice(0, 10) : null;

    const airlineOk =
      !airlineFilter || item.airplane?.airline === airlineFilter;
    const fromOk = !fromFilter || item.from_airport === fromFilter;
    const toOk = !toFilter || item.to_airport === toFilter;
    const priceOk = item.fares == null || item.fares <= priceFilter;
    const dateOk = !selectedDate || depDate === selectedDate;

    let timeOk = true;
    if (timeFilter && depHour != null) {
      if (timeFilter === "morning")
        timeOk = depHour >= 5 && depHour < 12;
      else if (timeFilter === "afternoon")
        timeOk = depHour >= 12 && depHour < 17;
      else if (timeFilter === "evening")
        timeOk = depHour >= 17 && depHour < 21;
      else if (timeFilter === "night")
        timeOk = depHour >= 21 || depHour < 5;
    }

    return airlineOk && fromOk && toOk && priceOk && dateOk && timeOk;
  });

  // sorting logic
  const sorted = [...filtered].sort((a, b) => {
    const depA = a.schedule?.departure_time
      ? parseInt(a.schedule.departure_time.slice(11, 13))
      : 0;
    const depB = b.schedule?.departure_time
      ? parseInt(b.schedule.departure_time.slice(11, 13))
      : 0;

    const durA = getDurationMinutes(a.schedule) || 0;
    const durB = getDurationMinutes(b.schedule) || 0;

    switch (sortBy) {
      case "priceLow":
        return (a.fares || 0) - (b.fares || 0);
      case "priceHigh":
        return (b.fares || 0) - (a.fares || 0);
      case "departEarly":
        return depA - depB;
      case "departLate":
        return depB - depA;
      case "durationLow":
        return durA - durB;
      default:
        return 0;
    }
  });

  // route label (top bar)
  const fromAirportObj = airports.find(
    (ap) => ap.airport_code === fromFilter
  );
  const toAirportObj = airports.find(
    (ap) => ap.airport_code === toFilter
  );

  const routeLabel =
    fromAirportObj && toAirportObj
      ? `${fromAirportObj.city} (${fromFilter}) → ${toAirportObj.city} (${toFilter})`
      : "All Routes";

  return (
    <>
      <Sidebar />

      <div className="flight-page">
        {/* route + date bar */}
        <div className="date-filter-box">
          <div className="route-title">{routeLabel}</div>

          <div className="date-chip-wrapper">
            <label className="date-label">Departure Date</label>
            <input
              type="date"
              className="date-input"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
        </div>

        {/* filters */}
        <div className="filter-box">
          <h3>Filters</h3>

          <div className="filter-row">
            {/* Airline */}
            <select
              value={airlineFilter}
              onChange={(e) => setAirlineFilter(e.target.value)}
            >
              <option value="">All Airlines</option>
              {Array.from(new Set(airplanes.map((a) => a.airline))).map(
                (air, i) =>
                  air && (
                    <option key={i} value={air}>
                      {air}
                    </option>
                  )
              )}
            </select>

            {/* From airport */}
            <select
              value={fromFilter}
              onChange={(e) => setFromFilter(e.target.value)}
            >
              <option value="">From</option>
              {airports.map((ap) => (
                <option key={ap.airport_code} value={ap.airport_code}>
                  {ap.city} ({ap.airport_code})
                </option>
              ))}
            </select>

            {/* To airport */}
            <select
              value={toFilter}
              onChange={(e) => setToFilter(e.target.value)}
            >
              <option value="">To</option>
              {airports.map((ap) => (
                <option key={ap.airport_code} value={ap.airport_code}>
                  {ap.city} ({ap.airport_code})
                </option>
              ))}
            </select>
          </div>

          <div className="filter-row">
            {/* time of day */}
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
            >
              <option value="">Any Time</option>
              <option value="morning">Morning (5am–12pm)</option>
              <option value="afternoon">Afternoon (12pm–5pm)</option>
              <option value="evening">Evening (5pm–9pm)</option>
              <option value="night">Night (9pm–5am)</option>
            </select>

            {/* price slider */}
            <div className="price-filter">
              <label>Max Price: ₹{priceFilter}</label>
              <input
                type="range"
                min="2000"
                max="50000"
                step="500"
                value={priceFilter}
                onChange={(e) => setPriceFilter(Number(e.target.value))}
              />
            </div>
          </div>
        </div>

        {/* sort bar */}
        <div className="sort-bar">
          <button
            className={sortBy === "priceLow" ? "active" : ""}
            onClick={() => setSortBy("priceLow")}
          >
            Price ↓
          </button>
          <button
            className={sortBy === "priceHigh" ? "active" : ""}
            onClick={() => setSortBy("priceHigh")}
          >
            Price ↑
          </button>
          <button
            className={sortBy === "departEarly" ? "active" : ""}
            onClick={() => setSortBy("departEarly")}
          >
            Early Departure
          </button>
          <button
            className={sortBy === "departLate" ? "active" : ""}
            onClick={() => setSortBy("departLate")}
          >
            Late Departure
          </button>
          <button
            className={sortBy === "durationLow" ? "active" : ""}
            onClick={() => setSortBy("durationLow")}
          >
            Shortest Duration
          </button>

          <div className="top-bar-right">
            <Link to="/AddEditSchedule">
              <button className="btn-add">+ Add Schedule</button>
            </Link>
          </div>
        </div>

        {/* flight cards */}
        {sorted.map((item) => {
          const schedule = item.schedule;
          const depTime = schedule?.departure_time?.slice(11, 16) || "--:--";
          const arrTime = schedule?.arrival_time?.slice(11, 16) || "--:--";
          const depCity = item.depAirport?.city || item.from_airport;
          const arrCity = item.arrAirport?.city || item.to_airport;
          const durationLabel = formatDurationLabel(schedule);

          const logoSrc =
            airlineLogos[item.airplane?.airline] ||
            airlineLogos[item.airline] ||
            airlineLogos["IndiGo"];

          return (
            <div key={item.flight_no} className="flight-card">
              {/* airline section */}
              <div className="airline-section">
                <img
                  src={logoSrc}
                  className="airline-logo"
                  alt={item.airplane?.airline || "airline"}
                />
                <div>
                  <div className="airline-name">
                    {item.airplane?.airline || item.airline}
                  </div>
                  <div className="model">{item.airplane?.model}</div>
                  <div className="flight-no">Flight #{item.flight_no}</div>
                </div>
              </div>

              {/* middle times */}
              <div className="flight-time-section">
                <div className="layover-text">{durationLabel}</div>

                <div className="main-times">
                  <div className="time-block">
                    <div className="time">{depTime}</div>
                    <div className="city">{depCity}</div>
                  </div>

                  <div className="duration-bar">
                    <span className="dot"></span>
                    <div className="line"></div>
                    <span className="dot"></span>
                  </div>

                  <div className="time-block">
                    <div className="time">{arrTime}</div>
                    <div className="city">{arrCity}</div>
                  </div>
                </div>
              </div>

              {/* right price & buttons */}
              <div className="price-section">
                <div className="price">
                  ₹{item.fares != null ? item.fares : "—"}
                </div>
                <div className="per-adult">per ticket</div>

                <div className="btn-group">
                  <Link to={`/UpdateSchedule/${item.schedule_id}`}>
                    <button className="btn-edit">Edit</button>
                  </Link>
                  <button
                    className="btn-delete"
                    onClick={() => delSchedule(item.schedule_id)}
                  >
                    Delete
                  </button>
                  <Link to={`/ViewSchedule/${item.schedule_id}`}>
                    <button className="btn-view">View</button>
                  </Link>
                </div>
              </div>
            </div>
          );
        })}

        {sorted.length === 0 && (
          <div style={{ marginTop: "20px", textAlign: "center" }}>
            No flights match the selected filters.
          </div>
        )}
      </div>
    </>
  );
};

export default Schedule;
