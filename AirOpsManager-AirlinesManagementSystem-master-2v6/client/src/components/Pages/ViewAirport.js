import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Axios from 'axios';
import Sidebar from './Sidebar';
import AdminNavbar from '../Navbar/AdminNavbar';
import './styles/ViewAirport.css';

const ViewAirport = () => {
  const [airport, setAirport] = useState({});
  const [loading, setLoading] = useState(true);
  const { id } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const resp = await Axios.get(`http://localhost:5000/airport/api/get/${id}`);
        if (resp.data && resp.data.length > 0) {
          setAirport(resp.data[0]);
        }
      } catch (error) {
        console.error('Error loading airport details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  return (
    <div className="admin-layout">
      <AdminNavbar />
      <Sidebar />
      <main className="admin-main">
        {/* Header */}
        <header className="admin-header">
          <div>
            <h1>Airport Details</h1>
            <p className="admin-subtitle">Airport Code: {id}</p>
          </div>
          <div className="admin-header-actions">
            <Link to="/Airport">
              <button className="btn-ghost">← Back to Airports</button>
            </Link>
          </div>
        </header>

        {loading ? (
          <div className="view-airport-loading">Loading airport details...</div>
        ) : (
          <div className="view-airport-card airport-header-card">
            <h3 className="card-title">Airport Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Airport Code</label>
                <span className="airport-code-badge">{id}</span>
              </div>
              <div className="info-item">
                <label>Airport Name</label>
                <span>{airport.airport_name || 'N/A'}</span>
              </div>
              <div className="info-item">
                <label>City</label>
                <span>{airport.city || 'N/A'}</span>
              </div>
              <div className="info-item">
                <label>Gate Number</label>
                <span>{airport.gate_no || 'N/A'}</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ViewAirport;
