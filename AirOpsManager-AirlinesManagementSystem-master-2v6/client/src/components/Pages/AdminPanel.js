


// src/components/Admin/AdminPanel.jsx
import React, { useState, useEffect } from "react";
import Axios from "axios";
import Sidebar from "../Pages/Sidebar";
import AdminNavbar from "../Navbar/AdminNavbar";
import { Line } from "react-chartjs-2";
import "./styles/AdminPanel.css";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

const AdminPanel = () => {
  const [stats, setStats] = useState({
    bookings: 0,
    revenue: 0,
    flights: 0,
    airports: 0,
    passengers: 0,
    avgFare: 0,
    topRoute: "N/A",
    monthlyRevenue: [],
    upcomingFlights: 0,
  });

  const [recentBookings, setRecentBookings] = useState([]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsRes, bookingRes, reviewRes] = await Promise.all([
          Axios.get("http://localhost:5000/getstats"),
          Axios.get("http://localhost:5000/booking/api/getFull"),
          Axios.get("http://localhost:5000/getreview").catch(() => ({
            data: [],
          })),
        ]);

        const base = statsRes.data[0] || {};
        const bookings = Array.isArray(bookingRes.data)
          ? bookingRes.data
          : [];
        const reviews = Array.isArray(reviewRes.data)
          ? reviewRes.data
          : [];

        // passengers = confirmed bookings count (can be more complex)
        const confirmed = bookings.filter(
          (b) => (b.booking_status || "").toLowerCase() === "confirmed"
        );

        // upcoming flights: future departure and not cancelled
        const now = new Date();
        const upcomingSet = new Set(
          bookings
            .filter((b) => {
              if (!b.departure_time) return false;
              const dep = new Date(
                String(b.departure_time).replace(" ", "T")
              );
              return (
                !isNaN(dep.getTime()) &&
                dep.getTime() > now.getTime() &&
                (b.booking_status || "").toLowerCase() !== "cancelled"
              );
            })
            .map((b) => b.flight_no)
        );

        // avg fare from bookings if not provided
        const paidFares = bookings
          .map((b) => Number(b.fares || 0))
          .filter((x) => x > 0);
        const avgFareCalc =
          paidFares.length > 0
            ? Math.round(
                paidFares.reduce((a, c) => a + c, 0) / paidFares.length
              )
            : base.avgFare || 0;

        // monthly revenue for last 6 months
        const monthly = new Array(6).fill(0);
        const monthLabels = [];
        const tempDate = new Date();

        for (let i = 5; i >= 0; i--) {
          const d = new Date(
            tempDate.getFullYear(),
            tempDate.getMonth() - i,
            1
          );
          const ym = `${d.getFullYear()}-${String(
            d.getMonth() + 1
          ).padStart(2, "0")}`;
          monthLabels.push(ym);

          const sumForMonth = bookings
            .filter((b) => {
              if (!b.departure_time) return false;
              const datePart = String(b.departure_time).split(" ")[0]; // YYYY-MM-DD
              return datePart.startsWith(ym);
            })
            .reduce((s, b) => s + (b.fares ? Number(b.fares) : 0), 0);

          monthly[5 - i] = sumForMonth;
        }

        // top route (simple: highest count route)
        const routeMap = {};
        bookings.forEach((b) => {
          if (!b.from_airport || !b.to_airport) return;
          const key = `${b.from_airport} → ${b.to_airport}`;
          routeMap[key] = (routeMap[key] || 0) + 1;
        });
        const topRoute =
          Object.keys(routeMap).sort(
            (a, b) => routeMap[b] - routeMap[a]
          )[0] || base.topRoute || "N/A";

        // flights & airports approximations
        const uniqueFlights = new Set(
          bookings.map((b) => b.flight_no).filter(Boolean)
        );
        const uniqueAirports = new Set(
          bookings
            .map((b) => b.from_airport)
            .concat(bookings.map((b) => b.to_airport))
            .filter(Boolean)
        );

        // recent 5 bookings
        const recent = [...bookings]
          .sort((a, b) => Number(b.booking_id) - Number(a.booking_id))
          .slice(0, 5);

        setRecentBookings(recent);

        setStats({
          bookings: base.countt || bookings.length,
          revenue: base.summ || paidFares.reduce((a, c) => a + c, 0),
          flights: base.flights || uniqueFlights.size,
          airports: base.airports || uniqueAirports.size,
          passengers: base.passengers || confirmed.length,
          avgFare: avgFareCalc,
          topRoute,
          monthlyRevenue: monthly,
          upcomingFlights: base.upcomingFlights || upcomingSet.size,
          monthLabels, // add to state for chart labels
          totalReviews: reviews.length,
        });
      } catch (e) {
        console.error("Admin stats error:", e);
      }
    };

    fetchAll();
  }, []);

  const revenueData = {
    labels:
      stats.monthLabels && stats.monthLabels.length > 0
        ? stats.monthLabels
        : ["M1", "M2", "M3", "M4", "M5", "M6"],
    datasets: [
      {
        label: "Revenue (INR)",
        data:
          stats.monthlyRevenue && stats.monthlyRevenue.length > 0
            ? stats.monthlyRevenue
            : [0, 0, 0, 0, 0, 0],
        borderColor: "#0057d9",
        backgroundColor: "rgba(0, 87, 217, 0.12)",
        borderWidth: 3,
        tension: 0.35,
        pointRadius: 3,
        pointHoverRadius: 5,
      },
    ],
  };

  return (
    <div className="admin-layout">
      <AdminNavbar />
      <Sidebar />

      <main className="admin-main">
        {/* Header row */}
        <header className="admin-header">
          <div>
            <h1>StarJet Airlines Admin</h1>
            <p className="admin-subtitle">
              Overview of bookings, flights, and revenue in real time.
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

        {/* Top stats cards */}
        <section className="grid-auto top-stats">
          <div className="card stat blue">
            <label>Total Bookings</label>
            <h2>{stats.bookings}</h2>
            <p className="card-helper">
              Passengers: <strong>{stats.passengers}</strong>
            </p>
          </div>
          <div className="card stat green">
            <label>Total Revenue</label>
            <h2>₹ {stats.revenue.toLocaleString("en-IN")}</h2>
            <p className="card-helper">
              Avg Fare: <strong>₹ {stats.avgFare}</strong>
            </p>
          </div>
          <div className="card stat orange">
            <label>Upcoming Flights</label>
            <h2>{stats.upcomingFlights}</h2>
            <p className="card-helper">
              Airports covered: <strong>{stats.airports}</strong>
            </p>
          </div>
        </section>

        {/* Mid metrics mini cards */}
        <section className="grid-auto mini-section">
          <div className="mini-card">
            <p>Active flights</p>
            <b>{stats.flights}</b>
          </div>
          <div className="mini-card">
            <p>Top Route</p>
            <b>{stats.topRoute}</b>
          </div>
          <div className="mini-card">
            <p>Reviews received</p>
            <b>{stats.totalReviews || 0}</b>
          </div>
          <div className="mini-card">
            <p>Revenue / Booking</p>
            <b>
              ₹{" "}
              {stats.bookings > 0
                ? Math.round(stats.revenue / stats.bookings)
                : 0}
            </b>
          </div>
        </section>

        {/* Chart + recent bookings */}
        <section className="grid-two">
          <div className="card chart-card">
            <div className="card-header">
              <h3>Revenue Trend (Last 6 Months)</h3>
              <span className="badge">INR</span>
            </div>
            <Line data={revenueData} />
          </div>

          <div className="card list-card">
            <div className="card-header">
              <h3>Recent Bookings</h3>
              <span className="badge grey">
                {recentBookings.length} latest
              </span>
            </div>
            <div className="booking-list">
              {recentBookings.length === 0 && (
                <p className="empty-text">No bookings found.</p>
              )}
              {recentBookings.map((b) => (
                <div key={b.booking_id} className="booking-item">
                  <div className="booking-main">
                    <div className="booking-route">
                      {b.from_airport || "N/A"} → {b.to_airport || "N/A"}
                    </div>
                    <div className="booking-name">
                      {b.passenger_name || "Unknown"}
                    </div>
                  </div>
                  <div className="booking-meta">
                    <div className="booking-pnr">
                      PNR: <strong>{b.PNR || "—"}</strong>
                    </div>
                    <div className="booking-status">
                      <span
                        className={`status-pill ${
                          (b.booking_status || "")
                            .toLowerCase()
                            .includes("cancel")
                            ? "cancel"
                            : (b.booking_status || "")
                                .toLowerCase()
                                .includes("confirm")
                            ? "success"
                            : "pending"
                        }`}
                      >
                        {b.booking_status || "Pending"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminPanel;