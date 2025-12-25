import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Axios from "axios";
import "./styles/ViewSchedule.css";

const ViewSchedule = () => {
  const { id } = useParams(); // schedule_id

  const [schedule, setSchedule] = useState(null);
  const [flight, setFlight] = useState(null);
  const [airplane, setAirplane] = useState(null);
  const [fromAirport, setFromAirport] = useState(null);
  const [toAirport, setToAirport] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ------------ HELPERS ------------ */

  const formatDuration = (raw, dep, arr) => {
    // 1) if numeric like 5 or "5.00"
    if (raw !== null && raw !== undefined && raw !== "") {
      const num = Number(raw);
      if (!isNaN(num)) {
        const totalMinutes = Math.round(num * 60);
        const h = Math.floor(totalMinutes / 60);
        const m = totalMinutes % 60;
        return `${h}h ${m}m`;
      }

      // 2) if string like "5h 0m"
      const match = /(\d+)\s*h\s*(\d+)\s*m/i.exec(String(raw));
      if (match) {
        return `${match[1]}h ${match[2]}m`;
      }
    }

    // 3) fallback – compute from departure & arrival
    if (dep && arr) {
      try {
        const d1 = new Date(dep.replace(" ", "T"));
        const d2 = new Date(arr.replace(" ", "T"));
        if (!isNaN(d1.getTime()) && !isNaN(d2.getTime()) && d2 > d1) {
          const diffMs = d2 - d1;
          const totalMinutes = Math.round(diffMs / (1000 * 60));
          const h = Math.floor(totalMinutes / 60);
          const m = totalMinutes % 60;
          return `${h}h ${m}m`;
        }
      } catch {
        // ignore
      }
    }

    return "-";
  };

  const getDate = (dt) => {
    if (!dt) return "-";
    return String(dt).split(" ")[0]; // "2025-12-04"
  };

  const getTime = (dt) => {
    if (!dt) return "-";
    const parts = String(dt).split(" ");
    if (parts.length < 2) return dt;
    return parts[1].substring(0, 5); // "18:05"
  };

  const airlineInitial = (name) => {
    if (!name) return "✈️";
    return name.trim().charAt(0).toUpperCase();
  };

  /* ------------ LOAD DATA ------------ */

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // 1) schedule
        const scheduleResp = await Axios.get(
          `http://localhost:5000/schedule/api/get/${id}`
        );
        const s = scheduleResp.data && scheduleResp.data[0];
        if (!s) {
          setError("Schedule not found");
          return;
        }
        setSchedule(s);

        // 2) find corresponding flight
        const flightsResp = await Axios.get(
          "http://localhost:5000/flight/api/get"
        );
        const flights = flightsResp.data || [];
        const f = flights.find(
          (fl) => Number(fl.schedule_id) === Number(id)
        );
        setFlight(f || null);

        if (f) {
          // 3) fetch airplane + airports in parallel
          const reqs = [];

          if (f.airplane_id) {
            reqs.push(
              Axios.get(
                `http://localhost:5000/airplane/api/get/${f.airplane_id}`
              )
            );
          } else {
            reqs.push(Promise.resolve({ data: [] }));
          }

          if (f.from_airport) {
            reqs.push(
              Axios.get(
                `http://localhost:5000/airport/api/get/${f.from_airport}`
              )
            );
          } else {
            reqs.push(Promise.resolve({ data: [] }));
          }

          if (f.to_airport) {
            reqs.push(
              Axios.get(
                `http://localhost:5000/airport/api/get/${f.to_airport}`
              )
            );
          } else {
            reqs.push(Promise.resolve({ data: [] }));
          }

          const [airplaneRes, fromRes, toRes] = await Promise.all(reqs);

          setAirplane(
            airplaneRes.data && airplaneRes.data.length
              ? airplaneRes.data[0]
              : null
          );
          setFromAirport(
            fromRes.data && fromRes.data.length ? fromRes.data[0] : null
          );
          setToAirport(
            toRes.data && toRes.data.length ? toRes.data[0] : null
          );
        }
      } catch (e) {
        console.error(e);
        setError("Failed to load schedule details.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const durationLabel = formatDuration(
    schedule?.duration_time,
    schedule?.departure_time,
    schedule?.arrival_time
  );

  /* ------------ RENDER ------------ */

  if (loading) {
    return (
      <div className="vs-wrapper">
        <div className="vs-loading">Loading schedule…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="vs-wrapper">
        <div className="vs-error">{error}</div>
        <Link to="/Schedule" className="vs-back-link-simple">
          ← Back to Schedules
        </Link>
      </div>
    );
  }

  return (
    <div className="vs-wrapper">
      <div className="vs-card">
        {/* 7. Airline banner with logo + flight ID */}
        <div className="vs-airline-banner">
          <div className="vs-airline-left">
            <div className="vs-airline-logo-circle">
              {airlineInitial(flight?.airline)}
            </div>
            <div>
              <div className="vs-airline-name">
                {flight?.airline || "Unknown Airline"}
              </div>
              <div className="vs-flight-no">
                Flight {flight?.flight_no || "—"}
              </div>
            </div>
          </div>
          <div className="vs-airline-right">
            <span className="vs-tag">Schedule #{schedule?.schedule_id}</span>
            {flight?.flightstatus_id && (
              <span className="vs-tag vs-tag-status">
                Status ID: {flight.flightstatus_id}
              </span>
            )}
          </div>
        </div>

        <div className="vs-main-grid">
          {/* LEFT COLUMN: route timeline + mini map */}
          <div className="vs-col-left">
            {/* 1. Animated route timeline */}
            <h3 className="vs-section-title">Route</h3>
            <div className="vs-route-timeline">
              <div className="vs-route-row">
                <div className="vs-route-city">
                  <div className="vs-code">
                    {flight?.from_airport || "—"}
                  </div>
                  <div className="vs-city-name">
                    {fromAirport?.city ||
                      fromAirport?.airport_name ||
                      ""}
                  </div>
                </div>

                <div className="vs-route-mid">
                  <div className="vs-route-line">
                    <span className="vs-dot vs-dot-start" />
                    <span className="vs-line" />
                    <span className="vs-dot vs-dot-end" />
                    <span className="vs-plane-icon">✈︎</span>
                  </div>
                  <div className="vs-duration-label">
                    Duration: {durationLabel}
                  </div>
                </div>

                <div className="vs-route-city vs-route-city-right">
                  <div className="vs-code">
                    {flight?.to_airport || "—"}
                  </div>
                  <div className="vs-city-name">
                    {toAirport?.city ||
                      toAirport?.airport_name ||
                      ""}
                  </div>
                </div>
              </div>

              <div className="vs-times-row">
                <div className="vs-time-block">
                  <div className="vs-time-label">Departure</div>
                  <div className="vs-time-value">
                    {getTime(schedule?.departure_time)}
                  </div>
                  <div className="vs-date-value">
                    {getDate(schedule?.departure_time)}
                  </div>
                </div>
                <div className="vs-time-block">
                  <div className="vs-time-label">Arrival</div>
                  <div className="vs-time-value">
                    {getTime(schedule?.arrival_time)}
                  </div>
                  <div className="vs-date-value">
                    {getDate(schedule?.arrival_time)}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Simple "map-like" route visual */}
            <div className="vs-mini-map">
              <div className="vs-map-header">Flight Path</div>
              <div className="vs-map-body">
                <div className="vs-map-line">
                  <div className="vs-map-dot vs-map-dot-from">
                    {flight?.from_airport || "—"}
                  </div>
                  <div className="vs-map-arc" />
                  <div className="vs-map-dot vs-map-dot-to">
                    {flight?.to_airport || "—"}
                  </div>
                  {/* <div className="vs-map-plane" /> */}
                </div>
                <div className="vs-map-legend">
                  <span>
                    From:{" "}
                    {fromAirport?.airport_name ||
                      flight?.from_airport ||
                      "—"}
                  </span>
                  <span>
                    To:{" "}
                    {toAirport?.airport_name ||
                      flight?.to_airport ||
                      "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: aircraft info + gate/terminal */}
          <div className="vs-col-right">
            {/* 3. Aircraft info */}
            <div className="vs-info-card">
              <h3 className="vs-section-title">Aircraft</h3>
              <div className="vs-info-row">
                <span className="vs-label">Airline</span>
                <span className="vs-value">
                  {flight?.airline || "—"}
                </span>
              </div>
              <div className="vs-info-row">
                <span className="vs-label">Model</span>
                <span className="vs-value">
                  {airplane?.model || "—"}
                </span>
              </div>
              <div className="vs-info-row">
                <span className="vs-label">Max Seats</span>
                <span className="vs-value">
                  {airplane?.max_seats != null
                    ? airplane.max_seats
                    : "—"}
                </span>
              </div>
              <div className="vs-info-row">
                <span className="vs-label">Flight No</span>
                <span className="vs-value">
                  {flight?.flight_no || "—"}
                </span>
              </div>
            </div>

            {/* 4. Gate & base fare box */}
            <div className="vs-info-card">
              <h3 className="vs-section-title">Airport & Gate</h3>
              <div className="vs-info-row">
                <span className="vs-label">From Airport</span>
                <span className="vs-value">
                  {fromAirport?.airport_name || "—"}
                </span>
              </div>
              <div className="vs-info-row">
                <span className="vs-label">To Airport</span>
                <span className="vs-value">
                  {toAirport?.airport_name || "—"}
                </span>
              </div>
              <div className="vs-info-row">
                <span className="vs-label">From City</span>
                <span className="vs-value">
                  {fromAirport?.city || "—"}
                </span>
              </div>
              <div className="vs-info-row">
                <span className="vs-label">To City</span>
                <span className="vs-value">
                  {toAirport?.city || "—"}
                </span>
              </div>
              <div className="vs-info-row">
                <span className="vs-label">Gate (From)</span>
                <span className="vs-value">
                  {fromAirport?.gate_no != null
                    ? fromAirport.gate_no
                    : "—"}
                </span>
              </div>
              <div className="vs-info-row">
                <span className="vs-label">Base Fare</span>
                <span className="vs-value">
                  {flight?.fares != null ? `₹${flight.fares}` : "—"}
                </span>
              </div>
            </div>

            <Link to="/Schedule" className="vs-back-link">
              ← Back to Schedules
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewSchedule;
