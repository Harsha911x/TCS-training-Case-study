import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Axios from 'axios';
import Sidebar from './Sidebar';
import AdminNavbar from '../Navbar/AdminNavbar';
import './styles/ViewReviews.css';

const ViewReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [clientInfo, setClientInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [reviewsRes, clientsRes] = await Promise.all([
          Axios.get(`http://localhost:5000/reviews/api/get/${id}`),
          Axios.get('http://localhost:5000/api/get').catch(() => ({ data: [] })),
        ]);

        const reviewsData = reviewsRes.data || [];
        setReviews(reviewsData);

        // Find client info
        const clients = clientsRes.data || [];
        const client = clients.find((c) => Number(c.client_id) === Number(id));
        if (client) {
          setClientInfo({
            name: `${client.fname || ''} ${client.lname || ''}`.trim(),
            email: client.email || 'N/A',
            phone: client.phone || 'N/A',
          });
        }
      } catch (error) {
        console.error('Error loading review details:', error);
        setReviews([]);
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
            <h1>Review Details</h1>
            <p className="admin-subtitle">Client ID: {id}</p>
        </div>
          <div className="admin-header-actions">
            <Link to="/Reviews">
              <button className="btn-ghost">← Back to Reviews</button>
          </Link>
          </div>
        </header>

        {loading ? (
          <div className="view-reviews-loading">Loading review details...</div>
        ) : reviews.length === 0 ? (
          <div className="view-reviews-card">
            <div className="view-reviews-empty">
              <p>No reviews found for Client ID: {id}</p>
            </div>
          </div>
        ) : (
          <>
            {/* Client Info Card */}
            {clientInfo && (
              <div className="view-reviews-card client-info-card">
                <h3 className="card-title">Client Information</h3>
                <div className="client-info-grid">
                  <div className="info-item">
                    <label>Name</label>
                    <span>{clientInfo.name || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <label>Email</label>
                    <span>{clientInfo.email}</span>
                  </div>
                  <div className="info-item">
                    <label>Phone</label>
                    <span>{clientInfo.phone}</span>
                  </div>
                  <div className="info-item">
                    <label>Client ID</label>
                    <span className="client-id-badge">{id}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Reviews List */}
            <div className="view-reviews-card">
              <h3 className="card-title">
                Reviews ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
              </h3>
              <div className="reviews-list">
                {reviews.map((review, index) => (
                  <div key={index} className="review-item">
                    <div className="review-header">
                      <span className="review-number">Review #{index + 1}</span>
                      <span className="review-date">Client ID: {review.client_id}</span>
                    </div>
                    <div className="review-content">
                      <p>{review.review || 'No review text available'}</p>
                    </div>
                  </div>
                ))}
        </div>
      </div>
          </>
        )}
      </main>
    </div>
  );
};

export default ViewReviews;
