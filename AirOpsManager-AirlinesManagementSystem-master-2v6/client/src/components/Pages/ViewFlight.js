import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Axios from "axios";
import Sidebar from "./Sidebar";
import AdminNavbar from "../Navbar/AdminNavbar";
import "./styles/ViewFlight.css";

// ---- AUTO MAP AIRLINE → LOCAL IMAGE ----
import AI from "../../images/AirIndia.png";
import Indigo from "../../images/IndiGo.png";
import Akasa from "../../images/Akasa.png";
import Vistara from "../../images/Vistara.png";
import StarJet from "../../images/logo.png";

const airlineLogos = {
  "Air India": AI,
  "IndiGo": Indigo,
  "Akasa": Akasa,
  "Vistara": Vistara,
  "StarJet Airlines": StarJet,
};

const ViewFlight = () => {
  const { id } = useParams();
  const [data, setData] = useState({
    flight: {},
    schedule: {},
    airplane: {},
    fromAirport: {},
    toAirport: {},
    status: {},
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const f = await Axios.get(`http://localhost:5000/flight/api/get/${id}`);
        if (!f.data || f.data.length === 0) return;

        const flight = f.data[0];

        const [sRes, aRes, fsRes, fromRes, toRes] = await Promise.all([
          Axios.get(`http://localhost:5000/schedule/api/get/${flight.schedule_id}`),
          Axios.get(`http://localhost:5000/airplane/api/get/${flight.airplane_id}`),
          Axios.get(`http://localhost:5000/flightStatus/api/get/${flight.flightstatus_id}`),
          Axios.get(`http://localhost:5000/airport/api/get/${flight.from_airport}`),
          Axios.get(`http://localhost:5000/airport/api/get/${flight.to_airport}`),
        ]);

        setData({
          flight,
          schedule: sRes.data[0] || {},
          airplane: aRes.data[0] || {},
          status: fsRes.data[0] || {},
          fromAirport: fromRes.data[0] || {},
          toAirport: toRes.data[0] || {},
        });
      } catch (error) {
        console.error("Error fetching flight data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const { flight, schedule, airplane, status, fromAirport, toAirport } = data;

  // Format time helper
  const formatTime = (datetime) => {
    if (!datetime) return "N/A";
    const parts = String(datetime).split(" ");
    if (parts.length < 2) return datetime;
    const datePart = parts[0];
    const timePart = parts[1]?.substring(0, 5) || "";
    return `${datePart} ${timePart}`;
  };

  // Format duration helper - converts decimal hours (e.g., 2.45) to "2h 27m"
  const formatDuration = (durationTime, departureTime, arrivalTime) => {
    // If duration_time is provided and is numeric
    if (durationTime !== null && durationTime !== undefined && durationTime !== "") {
      const num = Number(durationTime);
      if (!isNaN(num) && num > 0) {
        // Convert hours to total minutes (e.g., 2.45 hours = 147 minutes)
        const totalMinutes = Math.round(num * 60);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        return `${hours}h ${minutes}m`;
      }
      
      // If it's already in "Xh Ym" format, return as is
      const match = /(\d+)\s*h\s*(\d+)\s*m/i.exec(String(durationTime));
      if (match) {
        return `${match[1]}h ${match[2]}m`;
      }
    }

    // Fallback: calculate from departure and arrival times
    if (departureTime && arrivalTime) {
      try {
        const dep = new Date(departureTime.replace(" ", "T"));
        const arr = new Date(arrivalTime.replace(" ", "T"));
        if (!isNaN(dep.getTime()) && !isNaN(arr.getTime()) && arr > dep) {
          const diffMs = arr - dep;
          const totalMinutes = Math.round(diffMs / (1000 * 60));
          const hours = Math.floor(totalMinutes / 60);
          const minutes = totalMinutes % 60;
          return `${hours}h ${minutes}m`;
        }
      } catch (e) {
        // Ignore errors
      }
    }

    return "N/A";
  };

  const logo = airlineLogos[flight.airline] || StarJet;

  return (
    <div className="admin-layout">
      <AdminNavbar />
      <Sidebar />
      <main className="admin-main">
        {/* Header */}
        <header className="admin-header">
          <div>
            <h1>Flight Details</h1>
            <p className="admin-subtitle">Flight No: {flight.flight_no || id}</p>
          </div>
          <div className="admin-header-actions">
            <Link to="/FlightStatus">
              <button className="btn-ghost">← Back to Flight Status</button>
            </Link>
          </div>
        </header>

        {loading ? (
          <div className="view-flight-loading">Loading flight details...</div>
        ) : (
          <>
            {/* Flight Header Card */}
            <div className="view-flight-card flight-header-card">
              <div className="flight-header-content">
                <img src={logo} alt="Airline Logo" className="flight-logo" />
                <div className="flight-header-text">
                  <h2 className="flight-airline">{flight.airline || "StarJet Airlines"}</h2>
                  <p className="flight-number">Flight {flight.flight_no || "N/A"}</p>
                </div>
              </div>
              <div className="flight-status-badge">
                <span className="status-text">{status.status || "Unknown"}</span>
              </div>
            </div>

            {/* Flight Information Card */}
            <div className="view-flight-card">
              <h3 className="card-title">Flight Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <label>Flight Number</label>
                  <span>{flight.flight_no || "N/A"}</span>
                </div>
                <div className="info-item">
                  <label>Airline</label>
                  <span>{flight.airline || "N/A"}</span>
                </div>
                <div className="info-item">
                  <label>Status</label>
                  <span>{status.status || "N/A"}</span>
                </div>
                <div className="info-item">
                  <label>Fares</label>
                  <span>₹ {flight.fares || "0"}</span>
                </div>
              </div>
            </div>

            {/* Route Information Card */}
            <div className="view-flight-card">
              <h3 className="card-title">Route</h3>
              <div className="info-grid">
                <div className="info-item">
                  <label>From</label>
                  <span>{fromAirport.city || "N/A"} ({flight.from_airport || "—"})</span>
                </div>
                <div className="info-item">
                  <label>To</label>
                  <span>{toAirport.city || "N/A"} ({flight.to_airport || "—"})</span>
                </div>
                <div className="info-item">
                  <label>From Airport</label>
                  <span>{fromAirport.airport_name || "N/A"}</span>
                </div>
                <div className="info-item">
                  <label>To Airport</label>
                  <span>{toAirport.airport_name || "N/A"}</span>
                </div>
              </div>
            </div>

            {/* Schedule Card */}
            <div className="view-flight-card">
              <h3 className="card-title">Schedule</h3>
              <div className="info-grid">
                <div className="info-item">
                  <label>Departure</label>
                  <span>{formatTime(schedule.departure_time)}</span>
                </div>
                <div className="info-item">
                  <label>Arrival</label>
                  <span>{formatTime(schedule.arrival_time)}</span>
                </div>
                <div className="info-item">
                  <label>Duration</label>
                  <span>{formatDuration(schedule.duration_time, schedule.departure_time, schedule.arrival_time)}</span>
                </div>
              </div>
            </div>

            {/* Aircraft Card */}
            <div className="view-flight-card">
              <h3 className="card-title">Aircraft</h3>
              <div className="info-grid">
                <div className="info-item">
                  <label>Model</label>
                  <span>{airplane.model || "N/A"}</span>
                </div>
                <div className="info-item">
                  <label>Max Seats</label>
                  <span>{airplane.max_seats || "N/A"}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default ViewFlight;
