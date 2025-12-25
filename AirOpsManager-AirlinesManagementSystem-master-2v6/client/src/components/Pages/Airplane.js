import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Axios from "axios";
import { toast } from "react-toastify";
import Sidebar from "./Sidebar";

// shared table styles
import "./styles/Tables.css";
// new Indigo / MMT style
import "./styles/Airplane.css";

export default function Airplane() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");

  /* ----------------- LOAD DATA ----------------- */
  const loadData = async () => {
    const res = await Axios.get("http://localhost:5000/airplane/api/get");
    setData(res.data || []);
  };

  useEffect(() => {
    loadData();
  }, []);

  /* ------------ AIRLINE COUNT + STATS ------------ */
  const airlineCounts = data.reduce((acc, plane) => {
    const key = plane.airline || "Unknown";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const totalPlanes = data.length;
  const totalSeats = data.reduce(
    (sum, plane) => sum + (Number(plane.max_seats) || 0),
    0
  );

  /* ------------ SEARCH VALIDATION (ONLY LETTERS) ------------ */
  const handleSearch = (e) => {
  let val = e.target.value;

  // ❌ prevent starting space
  if (val.startsWith(" ")) return;

  // ❌ prevent multiple spaces
  if (val.includes("  ")) return;

  // allow only letters + single spaces
  if (/^[A-Za-z ]*$/.test(val)) {
    setSearch(val);
  }
};


  /* ------------ SAFE DELETE (CHECK IF CONNECTED TO FLIGHT) ------------ */
  const delAirplane = async (id) => {
    const flights = await Axios.get("http://localhost:5000/flight/api/get");
    const used = flights.data.some(
      (f) => Number(f.airplane_id) === Number(id)
    );

    if (used) {
      return toast.error("Cannot delete! Airplane is assigned to a flight.");
    }

    if (window.confirm(`Delete Airplane ID ${id}?`)) {
      await Axios.delete(`http://localhost:5000/airplane/api/remove/${id}`);
      toast.success("Airplane deleted successfully!");
      loadData();
    }
  };

  /* ------------ SEARCH FILTER ------------ */
  const filteredData = data.filter((item) => {
    const s = search.toLowerCase();
    return (
      item.airline.toLowerCase().includes(s) ||
      item.model.toLowerCase().includes(s)
    );
  });

  /* ------------ SORTING ------------ */
  const handleSort = (val) => {
    let sorted = [...data];

    if (val === "airline")
      sorted.sort((a, b) => (a.airline || "").localeCompare(b.airline || ""));

    if (val === "model")
      sorted.sort((a, b) => (a.model || "").localeCompare(b.model || ""));


    if (val === "seats")
      sorted.sort((a, b) => Number(a.max_seats) - Number(b.max_seats));

    setData(sorted);
  };

  return (
    <>
      <Sidebar />

      <div className="airplane-page">
        {/* ---------- TOP HEADER / STATS CARD ---------- */}
        <div className="airplane-hero">
          <div>
            <h2 className="airplane-title">Airplane Fleet</h2>
            <p className="airplane-subtitle">
              Manage aircrafts across all partner airlines.
            </p>
          </div>

          <div className="airplane-stats">
            <div className="stat-pill">
              <span className="stat-label">Total Planes</span>
              <span className="stat-value">{totalPlanes}</span>
            </div>
            <div className="stat-pill">
              <span className="stat-label">Total Seats</span>
              <span className="stat-value">{totalSeats}</span>
            </div>
          </div>
        </div>

        {/* ---------- ACTION ROW (SEARCH + SORT + ADD) ---------- */}
        <div className="airplane-actions-row">
          <div className="airplane-actions-left">
            <input
              value={search}
              onChange={handleSearch}
              className="airplane-search"
              placeholder="Search by Airline / Model"
            />

            <select
              className="airplane-sort"
              onChange={(e) => handleSort(e.target.value)}
            >
              <option value="">Sort By</option>
              <option value="airline">Airline</option>
              <option value="model">Model</option>
              <option value="seats">Seats</option>
            </select>
          </div>

          <Link to="/AddEditAirplane">
            <button className="airplane-add-btn">+ Add Airplane</button>
          </Link>
        </div>

        {/* ---------- AIRLINE SUMMARY CHIPS ---------- */}
        <div className="airline-summary-strip">
          {Object.keys(airlineCounts).length === 0 ? (
            <p className="summary-empty">No airplanes added yet.</p>
          ) : (
            Object.entries(airlineCounts).map(([airline, count]) => (
              <div className="summary-chip" key={airline}>
                <span className="chip-airline">{airline}</span>
                <span className="chip-count">{count} plane(s)</span>
              </div>
            ))
          )}
        </div>

        {/* ---------- TABLE ---------- */}
        <div className="table-wrapper">
          <table className="client-table">
            <thead>
              <tr>
                <th>S. No</th>
                <th>Airplane ID</th>
                <th>Airline</th>
                <th>Model</th>
                <th>Max Seats</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan="6" className="no-data">
                    No matching airplanes found.
                  </td>
                </tr>
              ) : (
                filteredData.map((item, index) => (
                  <tr key={item.airplane_id}>
                    <td>{index + 1}</td>
                    <td>{item.airplane_id}</td>
                    <td>{item.airline}</td>
                    <td>{item.model}</td>
                    <td>{item.max_seats}</td>
                    <td className="action-buttons">
                      <Link to={`/UpdateAirplane/${item.airplane_id}`}>
                        <button className="btn-edit">Edit</button>
                      </Link>

                      <button
                        className="btn-delete"
                        onClick={() => delAirplane(item.airplane_id)}
                      >
                        Delete
                      </button>

                      <Link to={`/ViewAirplane/${item.airplane_id}`}>
                        <button className="btn-view">View</button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
