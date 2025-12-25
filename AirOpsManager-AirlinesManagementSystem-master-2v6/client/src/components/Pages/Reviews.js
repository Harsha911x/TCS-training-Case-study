import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Axios from 'axios';
import Sidebar from './Sidebar';
import AdminNavbar from '../Navbar/AdminNavbar';
import './styles/Reviews.css';

const Reviews = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState([]);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await Axios.get('http://localhost:5000/reviews/api/get');
      setData(response.data || []);
      setFilteredData(response.data || []);
    } catch (error) {
      console.error('Error loading reviews:', error);
      setData([]);
      setFilteredData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredData(data);
    } else {
      const filtered = data.filter(
        (item) =>
          String(item.client_id).includes(searchTerm) ||
          (item.review && item.review.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredData(filtered);
    }
  }, [searchTerm, data]);

  return (
    <div className="admin-layout">
      <AdminNavbar />
      <Sidebar />
      <main className="admin-main">
        {/* Header */}
        <header className="admin-header">
      <div>
            <h1>Customer Reviews</h1>
            <p className="admin-subtitle">
              View and manage customer feedback and reviews
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
        <div className="reviews-search-container">
          <input
            type="text"
            placeholder="Search by Client ID or Review content..."
            className="reviews-search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="reviews-count">
            {filteredData.length} {filteredData.length === 1 ? 'review' : 'reviews'}
          </span>
        </div>

        {/* Reviews Table */}
        <div className="reviews-card">
          {loading ? (
            <div className="reviews-loading">Loading reviews...</div>
          ) : filteredData.length === 0 ? (
            <div className="reviews-empty">
              <p>No reviews found.</p>
            </div>
          ) : (
            <div className="reviews-table-container">
              <table className="reviews-table">
          <thead>
            <tr>
                    <th>S. No</th>
                    <th>Client ID</th>
                    <th>Review</th>
                    <th>Action</th>
            </tr>
            </thead>
            <tbody>
                  {filteredData.map((item, index) => (
                    <tr key={`${item.client_id}-${index}`}>
                      <td>{index + 1}</td>
                      <td>
                        <span className="client-id-badge">{item.client_id}</span>
                      </td>
                      <td>
                        <div className="review-text">
                          {item.review && item.review.length > 100
                            ? `${item.review.substring(0, 100)}...`
                            : item.review || 'N/A'}
                        </div>
                      </td>
                    <td>
                      <Link to={`/ViewReviews/${item.client_id}`}>
                          <button className="btn-view-review">View Details</button>
                      </Link>
                    </td>
                  </tr>
                  ))}
            </tbody>
        </table>
            </div>
          )}
        </div>
      </main>
      </div>
  );
};

export default Reviews;
