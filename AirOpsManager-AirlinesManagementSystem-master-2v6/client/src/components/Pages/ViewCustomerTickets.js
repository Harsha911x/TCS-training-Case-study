import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Axios from "axios";

import {
  Nav,
  Logo,
  LogoContainer,
  AirlineName,
  NavMenu,
  NavLink,
  NavBtn,
  NavBtnLink,
} from "../Navbar/NavbarElements";
import logo from "../../images/logo.png";

// ===== Internal Styles =====
const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #f3f4f6, #e0f2fe)",
    fontFamily:
      'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },

  // More top spacing so navbar never overlaps
  contentWrapper: {
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "130px 30px 50px",
    boxSizing: "border-box",
  },

  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "25px",
  },

  pageTitle: {
    fontSize: "34px",
    fontWeight: 800,
    color: "#0f172a",
  },

  pageSubtitle: {
    fontSize: "16px",
    color: "#475569",
  },

  backBtn: {
    padding: "12px 26px",
    borderRadius: "999px",
    border: "none",
    backgroundColor: "#0d47a1",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: 700,
    cursor: "pointer",
  },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: "20px",
    boxShadow: "0 12px 40px rgba(15, 23, 42, 0.15)",
    padding: "22px 24px",
    boxSizing: "border-box",
  },

  tableWrapper: {
    width: "100%",
    overflowX: "auto",
    marginTop: "10px",
  },

  table: {
    width: "100%",
    minWidth: "1200px",
    borderCollapse: "collapse",
    fontSize: "17px",
  },

  th: {
    padding: "16px 10px",
    textAlign: "center",
    fontSize: "16px",
    fontWeight: 800,
    backgroundColor: "#0f172a",
    color: "#ffffff",
    letterSpacing: "0.05em",
    borderBottom: "1px solid #1e293b",
    whiteSpace: "nowrap",
  },

  // extra width for Actions column
  thActions: {
    width: "230px",
  },

  td: {
    padding: "15px 10px",
    fontSize: "17px",
    fontWeight: 600,
    textAlign: "center",
    borderBottom: "1px solid #e5e7eb",
    color: "#111827",
  },

  indexCell: {
    fontWeight: 800,
    color: "#1e293b",
  },

  rowEven: { backgroundColor: "#f8fafc" },
  rowOdd: { backgroundColor: "#ffffff" },

  statusBadge: (status) => {
    let bg = "#e2e8f0";
    let color = "#1e293b";
    if (status?.toLowerCase().includes("confirmed")) {
      bg = "#bbf7d0";
      color = "#166534";
    } else if (status?.toLowerCase().includes("cancel")) {
      bg = "#fecaca";
      color = "#b91c1c";
    } else if (status?.toLowerCase().includes("pending")) {
      bg = "#fef08a";
      color = "#92400e";
    }
    return {
      display: "inline-block",
      padding: "8px 14px",
      borderRadius: "999px",
      fontSize: "15px",
      fontWeight: 800,
      backgroundColor: bg,
      color,
    };
  },

  actionsCell: {
    padding: "16px 10px",
  },

  // ✅ Fix flexwrap → flexWrap and center buttons nicely
  actionsWrapper: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "14px",
    flexWrap: "nowrap",
  },

  // ✅ Fixed textAlign typo + same size buttons
  actionBtnPrimary: {
    backgroundColor: "#0d47a1",
    color: "white",
    fontSize: "15px",
    fontWeight: 700,
    padding: "10px 22px",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    minWidth: "120px",
    textAlign: "center",
  },

  actionBtnDanger: {
    backgroundColor: "#dc2626",
    color: "white",
    fontSize: "15px",
    fontWeight: 700,
    padding: "10px 22px",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    minWidth: "120px",
    textAlign: "center",
  },

  emptyState: {
    padding: "28px 0",
    fontSize: "18px",
    fontWeight: 600,
    color: "#475569",
    textAlign: "center",
  },

  footerNote: {
    marginTop: "14px",
    fontSize: "13px",
    color: "#94a3b8",
    textAlign: "right",
  },
};

const ViewCustomerTickets = () => {
  const [data, setData] = useState([]);
  const { id } = useParams();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelData, setCancelData] = useState(null);
  const [cancellingBookingId, setCancellingBookingId] = useState(null);
  const [loadingCancel, setLoadingCancel] = useState(false);

  const loadData = async () => {
    const response = await Axios.get(`http://localhost:5000/showPass/${id}`);
    const sorted=(response.data||[]).sort((a,b)=>{
      return b.booking_id-a.booking_id;
    });
    setData(sorted);
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCancelClick = async (booking_id) => {
    if (!booking_id) return;
    
    try {
      setLoadingCancel(true);
      // First, get cancellation charges
      const chargesResp = await Axios.get(`http://localhost:5000/booking/cancellationCharges/${booking_id}`);
      
      // Check if response has error
      if (chargesResp.data.err) {
        throw new Error(chargesResp.data.err);
      }
      
      const charges = chargesResp.data.cancellationCharges;
      const hoursBeforeDeparture = chargesResp.data.hoursBeforeDeparture;
      
      if (!charges) {
        throw new Error("Cancellation charges data not found in response");
      }
      
      // Get booking details for display
      const bookingDetails = data.find(d => d.booking_id === booking_id);
      
      setCancelData({
        booking_id,
        charges,
        hoursBeforeDeparture,
        bookingDetails
      });
      setCancellingBookingId(booking_id);
      setShowCancelModal(true);
    } catch (e) {
      console.error("Error fetching cancellation charges:", e);
      const errorMessage = e.response?.data?.err || e.message || "Unable to fetch cancellation details. Please try again.";
      alert(`Error: ${errorMessage}`);
    } finally {
      setLoadingCancel(false);
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancellingBookingId || !cancelData) return;
    
    try {
      setLoadingCancel(true);
      const cancelResp = await Axios.post("http://localhost:5000/booking/cancel", { 
        booking_id: cancellingBookingId 
      });
      const cancelResult = cancelResp.data;
      
      setShowCancelModal(false);
      setCancelData(null);
      setCancellingBookingId(null);
      
      if (cancelResult.cancellationCharges) {
        alert(
          `Booking cancelled successfully!\n\n` +
          `Cancellation Charge: ₹${cancelResult.cancellationCharges.chargeAmount.toLocaleString()}\n` +
          `Refund Amount: ₹${cancelResult.cancellationCharges.refundAmount.toLocaleString()}\n` +
          `Refund will be processed according to payment method rules.`
        );
      } else {
        alert("Booking cancelled successfully!");
      }
      
      await loadData();
    } catch (e) {
      console.error("Cancel booking error", e);
      alert("Unable to cancel booking. Please try again.");
    } finally {
      setLoadingCancel(false);
    }
  };

  const handleCancelModalClose = () => {
    setShowCancelModal(false);
    setCancelData(null);
    setCancellingBookingId(null);
  };

  return (
    <div style={styles.page}>
      {/* Navbar */}
      <Nav>
        <LogoContainer>
          <Link to={`/CustomerPanel/${id}`} style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
            <Logo src={logo} alt="Airline Logo" />
            <AirlineName>StarJet Airlines</AirlineName>
          </Link>
        </LogoContainer>

        <NavMenu>
          <NavLink to={`/ViewProfile/${id}`}>View Profile</NavLink>
          <NavLink to={`/BookTicket/${id}`}>Book Flight</NavLink>
          <NavLink to={`/ViewCustomerTickets/${id}`}>View Tickets</NavLink>
          <NavLink to={`/AddReviews/${id}`}>Add Review</NavLink>
        </NavMenu>

        <NavBtn>
          <NavBtnLink to="/">Logout</NavBtnLink>
        </NavBtn>
      </Nav>

      {/* Main Content */}
      <div style={styles.contentWrapper}>
        <div style={styles.headerRow}>
          <div>
            <h1 style={styles.pageTitle}>My Tickets</h1>
            <span style={styles.pageSubtitle}>
              View your booked flights, boarding details and status at a glance.
            </span>
          </div>

          <Link to={`/CustomerPanel/${id}`} style={{ textDecoration: "none" }}>
            <button type="button" style={styles.backBtn}>
              ← Back to Dashboard
            </button>
          </Link>
        </div>

        <div style={styles.card}>
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>S. No</th>
                  <th style={styles.th}>Airport Code</th>
                  <th style={styles.th}>First Name</th>
                  <th style={styles.th}>Last Name</th>
                  <th style={styles.th}>Flight No</th>
                  <th style={styles.th}>Seat No</th>
                  <th style={styles.th}>Gate No</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Departure Time</th>
                  <th style={{ ...styles.th, ...styles.thActions }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 && (
                  <tr>
                    <td colSpan="10" style={styles.emptyState}>
                      No tickets found. Once you book a flight, your tickets
                      will appear here.
                    </td>
                  </tr>
                )}
                {data.map((item, index) => {
                  const rowStyle =
                    index % 2 === 0 ? styles.rowEven : styles.rowOdd;
                  return (
                    <tr key={index} style={rowStyle}>
                      <td style={{ ...styles.td, ...styles.indexCell }}>
                        {index + 1}
                      </td>
                      <td style={styles.td}>{item.airport_code}</td>
                      <td style={styles.td}>{item.fname}</td>
                      <td style={styles.td}>{item.lname}</td>
                      <td style={styles.td}>{item.flight_no}</td>
                      <td style={styles.td}>{item.seat_no}</td>
                      <td style={styles.td}>{item.gate_no}</td>
                      <td style={styles.td}>
                        <span style={styles.statusBadge(item.booking_status)}>
                          {item.booking_status || "N/A"}
                        </span>
                      </td>
                      <td style={styles.td}>{item.departure_time}</td>
                      <td style={{ ...styles.td, ...styles.actionsCell }}>
                        <div style={styles.actionsWrapper}>
                          {item.booking_id && item.PNR && (
                            <Link
                              to={`/BoardingPassView/${item.booking_id}`}
                              style={{ textDecoration: "none" }}
                            >
                              <button
                                type="button"
                                style={styles.actionBtnPrimary}
                              >
                                View Pass
                              </button>
                            </Link>
                          )}
                          {item.booking_id && item.booking_status !== "cancelled" && (
                            <button
                              type="button"
                              style={styles.actionBtnDanger}
                              onClick={() => handleCancelClick(item.booking_id)}
                              disabled={loadingCancel}
                            >
                              {loadingCancel ? "Loading..." : "Cancel"}
                            </button>
                          )}
                          {!item.booking_id && !item.PNR && "-"}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div style={styles.footerNote}>
            Status and timings are subject to change. Please re-check closer to
            departure.
          </div>
        </div>
      </div>

      {/* Cancellation Refund Summary Modal */}
      {showCancelModal && cancelData && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={handleCancelModalClose}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "12px",
              padding: "30px",
              maxWidth: "500px",
              width: "90%",
              boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              style={{
                marginTop: 0,
                marginBottom: "20px",
                color: "#1a237e",
                fontSize: "22px",
                fontWeight: "600",
              }}
            >
              Cancellation Refund Summary
            </h2>

            {cancelData.bookingDetails && (
              <div style={{ marginBottom: "20px", padding: "15px", background: "#f5f7fb", borderRadius: "8px" }}>
                <div style={{ marginBottom: "8px" }}>
                  <strong>Flight:</strong> {cancelData.bookingDetails.flight_no || "N/A"}
                </div>
                <div style={{ marginBottom: "8px" }}>
                  <strong>Route:</strong> {cancelData.bookingDetails.from_airport || "N/A"} → {cancelData.bookingDetails.to_airport || "N/A"}
                </div>
                <div style={{ marginBottom: "8px" }}>
                  <strong>Departure:</strong> {cancelData.bookingDetails.departure_time || "N/A"}
                </div>
                <div>
                  <strong>PNR:</strong> {cancelData.bookingDetails.PNR || "N/A"}
                </div>
              </div>
            )}

            <div style={{ marginBottom: "20px" }}>
              <h3 style={{ fontSize: "16px", marginBottom: "15px", color: "#333" }}>
                Refund Details
              </h3>
              
              <div style={{ marginBottom: "12px", display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#666" }}>Booking Amount:</span>
                <span style={{ fontWeight: "600" }}>₹{cancelData.charges.bookingAmount.toLocaleString()}</span>
              </div>
              
              <div style={{ marginBottom: "12px", display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#666" }}>
                  Cancellation Charge ({cancelData.charges.chargePercent}%):
                </span>
                <span style={{ fontWeight: "600", color: "#d32f2f" }}>
                  -₹{cancelData.charges.chargeAmount.toLocaleString()}
                </span>
              </div>
              
              <div
                style={{
                  marginTop: "20px",
                  paddingTop: "15px",
                  borderTop: "2px solid #e0e0e0",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: "18px", fontWeight: "600", color: "#1a237e" }}>
                  Refund Amount:
                </span>
                <span style={{ fontSize: "20px", fontWeight: "700", color: "#2e7d32" }}>
                  ₹{cancelData.charges.refundAmount.toLocaleString()}
                </span>
              </div>

              {cancelData.hoursBeforeDeparture > 0 && (
                <div style={{ marginTop: "15px", padding: "12px", background: "#fff3cd", borderRadius: "6px", fontSize: "13px", color: "#856404" }}>
                  <strong>Time to Departure:</strong> {Math.floor(cancelData.hoursBeforeDeparture)} hours
                </div>
              )}

              {cancelData.hoursBeforeDeparture <= 0 && (
                <div style={{ marginTop: "15px", padding: "12px", background: "#f8d7da", borderRadius: "6px", fontSize: "13px", color: "#721c24" }}>
                  <strong>Note:</strong> Flight has already departed. No refund applicable.
                </div>
              )}
            </div>

            <div style={{ marginTop: "25px", display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={handleCancelModalClose}
                disabled={loadingCancel}
                style={{
                  padding: "12px 24px",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                  background: "#f5f5f5",
                  cursor: loadingCancel ? "not-allowed" : "pointer",
                  fontSize: "14px",
                  fontWeight: "600",
                }}
              >
                Go Back
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={loadingCancel || cancelData.hoursBeforeDeparture <= 0}
                style={{
                  padding: "12px 24px",
                  borderRadius: "6px",
                  border: "none",
                  background: cancelData.hoursBeforeDeparture <= 0 ? "#ccc" : "#d32f2f",
                  color: "#fff",
                  cursor: (loadingCancel || cancelData.hoursBeforeDeparture <= 0) ? "not-allowed" : "pointer",
                  fontSize: "14px",
                  fontWeight: "600",
                }}
              >
                {loadingCancel ? "Cancelling..." : "Confirm Cancellation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewCustomerTickets;