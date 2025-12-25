import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Axios from "axios";
import Sidebar from "./Sidebar";
import AdminNavbar from "../Navbar/AdminNavbar";
import "./styles/FlightStatus.css";

export default function FlightStatus() {
  const [statuses, setStatuses] = useState([]);
  const [flights, setFlights] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openRow, setOpenRow] = useState(null);

  const [filterAirline, setFilterAirline] = useState("");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");

  const [showAllFlights, setShowAllFlights] = useState(false);

  // ---------------- LOAD ALL DATA ----------------
  useEffect(() => {
    const loadAll = async () => {
      try {
        setLoading(true);
        const [statusRes, flightRes, scheduleRes] = await Promise.all([
          Axios.get("http://localhost:5000/flightStatus/api/get"),
          Axios.get("http://localhost:5000/flight/api/get"),
          Axios.get("http://localhost:5000/schedule/api/get"),
        ]);

        setStatuses(statusRes.data || []);
        setFlights(flightRes.data || []);
        setSchedules(scheduleRes.data || []);
      } catch (error) {
        console.error("Error loading flight status data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, []);

  // Quick lookup map for schedule
  const scheduleMap = {};
  schedules.forEach((s) => (scheduleMap[s.schedule_id] = s));

  // Extract Filters
  const airlineOptions = [...new Set(flights.map((f) => f.airline))].sort();
  const airportFromOptions = [...new Set(flights.map((f) => f.from_airport))].sort();
  const airportToOptions = [...new Set(flights.map((f) => f.to_airport))].sort();

  // Colors for status badge
  const statusColor = (status) => {
    const colors = {
      "on time": { bg: "#dcfce7", color: "#166534" },
      delayed: { bg: "#fef9c3", color: "#854d0e" },
      departed: { bg: "#dbeafe", color: "#1e40af" },
      landed: { bg: "#f1f5f9", color: "#334155" },
      boarding: { bg: "#fee2e2", color: "#b91c1c" },
    };
    return colors[status.toLowerCase()] || { bg: "#e2e8f0", color: "#1e293b" };
  };

  // ---------------- STATS CARD ----------------
  const stats = {
    total: flights.length,
    onTime: flights.filter((f) => f.flightstatus_id == 65).length,
    departed: flights.filter((f) => f.flightstatus_id == 61).length,
    landed: flights.filter((f) => f.flightstatus_id == 62).length,
    delayed: flights.filter((f) => f.flightstatus_id == 63).length,
    boarding: flights.filter((f) => f.flightstatus_id == 64).length,
  };

  // Get flights of a specific status (with filters applied)
  const getFlightsByStatus = (flightstatus_id) => {
    return flights
      .filter((f) => Number(f.flightstatus_id) === Number(flightstatus_id))
      .filter((f) => (filterAirline ? f.airline === filterAirline : true))
      .filter((f) => (filterFrom ? f.from_airport === filterFrom : true))
      .filter((f) => (filterTo ? f.to_airport === filterTo : true))
      .map((f) => {
        const sch = scheduleMap[f.schedule_id] || {};
        const [date, time] = sch.departure_time?.split(" ") || ["-", "-"];
        return { ...f, depDate: date, depTime: time };
      });
  };

  return (
    <div className="admin-layout">
      <AdminNavbar />
      <Sidebar />
      <main className="admin-main">
        {/* Header */}
        <header className="admin-header">
          <div>
            <h1>Flight Status</h1>
            <p className="admin-subtitle">
              Monitor and manage flight statuses in real time
            </p>
          </div>
          <div className="admin-header-actions">
            <button
              type="button"
              className="btn-ghost"
              onClick={() => window.location.reload()}
            >
              ⟳ Refresh
            </button>
          </div>
        </header>

        {/* Stats Cards */}
        <div className="fs-stats-grid">
          {[
            { label: "Total Flights", count: stats.total, color: "#334155" },
            { label: "On Time", count: stats.onTime, color: "#15803d" },
            { label: "Delayed", count: stats.delayed, color: "#b45309" },
            { label: "Departed", count: stats.departed, color: "#1e40af" },
            { label: "Landed", count: stats.landed, color: "#334155" },
            { label: "Boarding", count: stats.boarding, color: "#b91c1c" },
          ].map((s, i) => (
            <div key={i} className="fs-stat-card" style={{ borderLeftColor: s.color }}>
              <div className="fs-stat-count">{s.count}</div>
              <div className="fs-stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filter Bar */}
        <div className="fs-filters-card">
          <div className="fs-filters">
            <select
              className="fs-filter-select"
              value={filterAirline}
              onChange={(e) => setFilterAirline(e.target.value)}
            >
              <option value="">All Airlines</option>
              {airlineOptions.map((x) => (
                <option key={x} value={x}>
                  {x}
                </option>
              ))}
            </select>

            <select
              className="fs-filter-select"
              value={filterFrom}
              onChange={(e) => setFilterFrom(e.target.value)}
            >
              <option value="">From Airport</option>
              {airportFromOptions.map((x) => (
                <option key={x} value={x}>
                  {x}
                </option>
              ))}
            </select>

            <select
              className="fs-filter-select"
              value={filterTo}
              onChange={(e) => setFilterTo(e.target.value)}
            >
              <option value="">To Airport</option>
              {airportToOptions.map((x) => (
                <option key={x} value={x}>
                  {x}
                </option>
              ))}
            </select>

            <button
              className="fs-toggle-btn"
              onClick={() => setShowAllFlights(!showAllFlights)}
            >
              {showAllFlights ? "Hide All Flights" : "Show All Flights"}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="fs-loading">Loading flight status data...</div>
        ) : (
          <>
            {/* Show All Flights Table */}
            {showAllFlights && (
              <div className="fs-table-card">
                <h3 className="card-title">All Flights</h3>
                <div className="fs-table-wrapper">
                  <table className="fs-table">
                    <thead>
                      <tr>
                        <th>Flight No</th>
                        <th>Airline</th>
                        <th>Route</th>
                        <th>Departure</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {flights.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="fs-no-data">
                            No flights found
                          </td>
                        </tr>
                      ) : (
                        flights.map((f) => {
                          const sch = scheduleMap[f.schedule_id] || {};
                          const [date, time] = sch.departure_time?.split(" ") || ["-", "-"];
                          const s =
                            statuses.find((x) => x.flightstatus_id === f.flightstatus_id)
                              ?.status || "";
                          const colors = statusColor(s);

                          return (
                            <tr key={f.flight_no}>
                              <td>{f.flight_no}</td>
                              <td>{f.airline}</td>
                              <td>
                                {f.from_airport} → {f.to_airport}
                              </td>
                              <td>
                                {date} {time}
                              </td>
                              <td>
                                <span
                                  className="fs-status-badge"
                                  style={{ background: colors.bg, color: colors.color }}
                                >
                                  {s}
                                </span>
                              </td>
                              <td>
                                <Link to={`/ViewFlight/${f.flight_no}`}>
                                  <button className="fs-view-btn">View</button>
                                </Link>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Main Status Accordion Table */}
            <div className="fs-table-card">
              <h3 className="card-title">Flight Status by Category</h3>
              <div className="fs-table-wrapper">
                <table className="fs-table">
                  <thead>
                    <tr>
                      <th>S. No</th>
                      <th>Status ID</th>
                      <th>Status</th>
                      <th>Flights</th>
                    </tr>
                  </thead>
                  <tbody>
                    {statuses.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="fs-no-data">
                          No status data found
                        </td>
                      </tr>
                    ) : (
                      statuses.map((item, index) => {
                        const list = getFlightsByStatus(item.flightstatus_id);
                        const colors = statusColor(item.status);

                        return (
                          <React.Fragment key={item.flightstatus_id}>
                            <tr
                              className="fs-accordion-row"
                              onClick={() =>
                                setOpenRow(
                                  openRow === item.flightstatus_id ? null : item.flightstatus_id
                                )
                              }
                            >
                              <td>{index + 1}</td>
                              <td>{item.flightstatus_id}</td>
                              <td>
                                <span
                                  className="fs-status-badge"
                                  style={{ background: colors.bg, color: colors.color }}
                                >
                                  {item.status}
                                </span>
                              </td>
                              <td>
                                {list.length} flights
                                <span className="fs-arrow">
                                  {openRow === item.flightstatus_id ? "▲" : "▼"}
                                </span>
                              </td>
                            </tr>

                            {openRow === item.flightstatus_id && (
                              <tr className="fs-expand">
                                <td colSpan="4">
                                  {list.length === 0 ? (
                                    <p className="fs-empty">No flights found with selected filters.</p>
                                  ) : (
                                    <div className="fs-inner-table-wrapper">
                                      <table className="fs-inner-table">
                                        <thead>
                                          <tr>
                                            <th>Flight No</th>
                                            <th>Airline</th>
                                            <th>Route</th>
                                            <th>Dep Date</th>
                                            <th>Dep Time</th>
                                            <th>Action</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {list.map((f) => (
                                            <tr key={f.flight_no}>
                                              <td>{f.flight_no}</td>
                                              <td>{f.airline}</td>
                                              <td>
                                                {f.from_airport} → {f.to_airport}
                                              </td>
                                              <td>{f.depDate}</td>
                                              <td>{f.depTime}</td>
                                              <td>
                                                <Link to={`/ViewFlight/${f.flight_no}`}>
                                                  <button className="fs-view-btn">View</button>
                                                </Link>
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
