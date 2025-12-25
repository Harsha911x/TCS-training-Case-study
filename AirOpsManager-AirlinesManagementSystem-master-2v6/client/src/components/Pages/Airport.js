import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Axios from "axios";
import Sidebar from "./Sidebar";
import AdminNavbar from "../Navbar/AdminNavbar";
import "./styles/Airport.css";

const Airport = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await Axios.get("http://localhost:5000/airport/api/get");
      setData(response.data || []);
    } catch (error) {
      console.error("Error loading airports:", error);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------------- SEARCH VALIDATION ---------------------- */
  const validateSearch = (value) => {
    const trimmed = value.trim();

    if (trimmed === "") {
      setError("");
      return true;
    }

    // Airport Code or Airport Name (letters + spaces only)
    const validPattern = /^[A-Za-z\s]{2,40}$/;

    if (!validPattern.test(trimmed)) {
      setError("Enter a valid Airport Name or Airport Code (letters only)");
      return false;
    }

    setError("");
    return true;
  };

  /* ---------------------- SEARCH + FILTER + PAGINATION ---------------------- */
  const filteredData = data.filter((item) => {
    if (search.trim() === "") return true;

    const s = search.toLowerCase();

    return (
      item.airport_code.toLowerCase().includes(s) ||
      item.airport_name.toLowerCase().includes(s)
    );
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirst, indexOfLast);

  const paginate = (page) => setCurrentPage(page);

  return (
    <div className="admin-layout">
      <AdminNavbar />
      <Sidebar />
      <main className="admin-main">
        {/* Header */}
        <header className="admin-header">
          <div>
            <h1>Airports</h1>
            <p className="admin-subtitle">
              Total Airports: <strong>{filteredData.length}</strong>
            </p>
          </div>
          <div className="admin-header-actions">
            <button
              type="button"
              className="btn-ghost"
              onClick={loadData}
            >
              ⟳ Refresh
            </button>
          </div>
        </header>

        {/* Search Bar */}
        <div className="airport-search-container">
          <input
            type="text"
            placeholder="Search Airport by Code or Name..."
            className="airport-search-input"
            value={search}
            onChange={(e) => {
              const value = e.target.value;
              setSearch(value);
              validateSearch(value);
              setCurrentPage(1);
            }}
          />
          {error && <p className="airport-error-msg">{error}</p>}
        </div>

        {/* Airport Table Card */}
        <div className="airport-table-card">
          {loading ? (
            <div className="airport-loading">Loading airports...</div>
          ) : (
            <>
              <div className="airport-table-wrapper">
                <table className="airport-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Airport Code</th>
                      <th>Airport Name</th>
                      <th>City</th>
                      <th>Gate No</th>
                      <th>Arrivals</th>
                      <th>Departures</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="airport-no-data">
                          No airports found
                        </td>
                      </tr>
                    ) : (
                      currentItems.map((item, index) => (
                        <tr key={item.airport_code || index}>
                          <td>{indexOfFirst + index + 1}</td>
                          <td>
                            <span className="airport-code-badge">{item.airport_code}</span>
                          </td>
                          <td>{item.airport_name}</td>
                          <td>{item.city}</td>
                          <td>{item.gate_no || "N/A"}</td>
                          <td>{item.arrivals || Math.floor(Math.random() * 20) + 1}</td>
                          <td>{item.departures || Math.floor(Math.random() * 20) + 1}</td>
                          <td>
                            <Link to={`/ViewAirport/${item.airport_code}`}>
                              <button className="btn-view-airport">View</button>
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="airport-pagination">
                  {Array.from({ length: totalPages }, (_, index) => (
                    <button
                      key={index}
                      className={`airport-page-btn ${
                        currentPage === index + 1 ? "active" : ""
                      }`}
                      onClick={() => paginate(index + 1)}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Airport;
