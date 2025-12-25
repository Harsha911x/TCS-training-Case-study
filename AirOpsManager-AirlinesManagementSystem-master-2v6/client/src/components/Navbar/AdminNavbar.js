// src/components/Navbar/AdminNavbar.jsx
import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import Axios from "axios";
import "../Pages/styles/AdminNavbar.css";

const AdminNavbar = () => {
  const [summary, setSummary] = useState({
    todayBookings: 0,
    activeFlights: 0,
    totalReviews: 0,
  });

  const [notifications, setNotifications] = useState([]);
  const [openNotif, setOpenNotif] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);

  // Format “Today, 11:32 AM”
  const now = new Date();
  const formattedNow = now.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  useEffect(() => {
    const fetchNavbarData = async () => {
      try {
        // 1) Full booking info (for flights + notifications)
        const bookingRes = await Axios.get(
          "http://localhost:5000/booking/api/getFull"
        );
        const bookings = Array.isArray(bookingRes.data)
          ? bookingRes.data
          : [];

        // Today date from system
        const todayISO = new Date().toISOString().split("T")[0];

        // Today’s confirmed bookings
        const todays = bookings.filter((b) => {
          if (!b.departure_time) return false;
          const depDate = String(b.departure_time).split(" ")[0]; // "YYYY-MM-DD"
          return depDate === todayISO && (b.booking_status || "").toLowerCase() === "confirmed";
        });

        // Active flights = unique flight_no with non-cancelled bookings
        const activeFlightsSet = new Set(
          bookings
            .filter(
              (b) =>
                b.flight_no &&
                (b.booking_status || "").toLowerCase() !== "cancelled"
            )
            .map((b) => b.flight_no)
        );

        // Latest 4 bookings as notifications
        const sorted = [...bookings].sort(
          (a, b) => Number(b.booking_id) - Number(a.booking_id)
        );
        const notifList = sorted.slice(0, 4).map((b) => {
          const depDate = b.departure_time
            ? String(b.departure_time).split(" ")[0]
            : "N/A";
          const route =
            b.from_airport && b.to_airport
              ? `${b.from_airport} → ${b.to_airport}`
              : "Route N/A";
          const status =
            (b.booking_status || "Pending")[0].toUpperCase() +
            (b.booking_status || "Pending").slice(1);

          return {
            id: b.booking_id,
            title: `${b.flight_no || "Flight"} • ${route}`,
            subtitle: `PNR: ${b.PNR || "N/A"} • ${status}`,
            time: `Dep: ${depDate}`,
          };
        });

        // 2) Reviews count
        let reviewCount = 0;
        try {
          const reviewRes = await Axios.get("http://localhost:5000/getreview");
          const reviews = Array.isArray(reviewRes.data)
            ? reviewRes.data
            : [];
          reviewCount = reviews.length;
        } catch {
          // ignore if fails
        }

        setSummary({
          todayBookings: todays.length,
          activeFlights: activeFlightsSet.size,
          totalReviews: reviewCount,
        });

        setNotifications(notifList);
      } catch (e) {
        console.error("Navbar data error:", e);
      }
    };

    fetchNavbarData();
  }, []);

  const unreadCount = notifications.length;

  const toggleNotif = () => {
    setOpenNotif((prev) => !prev);
    setOpenProfile(false);
  };

  const toggleProfile = () => {
    setOpenProfile((prev) => !prev);
    setOpenNotif(false);
  };

  return (
    <nav className="sj-navbar fadeSlide">
      {/* LEFT: Airline + title */}
      <div className="sj-left">
        <div className="sj-logo">
          ✈ StarJet <span>Airlines</span>
        </div>

        <div className="sj-plane-animation">🛫</div>

        <div className="sj-title">Admin Control Center</div>
      </div>

      {/* CENTER: Quick stats pills */}
      <div className="sj-center">
        <div className="sj-pill">
          <span>Today’s bookings</span>
          <strong>{summary.todayBookings}</strong>
        </div>
        <div className="sj-pill">
          <span>Active flights</span>
          <strong>{summary.activeFlights}</strong>
        </div>
        <div className="sj-pill">
          <span>Reviews</span>
          <strong>{summary.totalReviews}</strong>
        </div>
      </div>

      {/* RIGHT: time + notifications + profile */}
      <div className="sj-right">
        {/* System time */}
        <div className="sj-meta">
          <div className="sj-meta-label">System time</div>
          <div className="sj-meta-value">{formattedNow}</div>
        </div>

        {/* Notifications */}
        <div className="sj-notification" onClick={toggleNotif}>
          <i className="fas fa-bell"></i>
          {unreadCount > 0 && (
            <span className="notif-badge">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}

          {openNotif && (
            <div className="sj-notif-dropdown">
              <div className="notif-header">Recent Activity</div>
              {notifications.length === 0 ? (
                <p className="notif-empty">No recent activity</p>
              ) : (
                notifications.map((n) => (
                  <div key={n.id} className="notif-item">
                    <div className="notif-text">{n.title}</div>
                    <div className="notif-sub">{n.subtitle}</div>
                    <div className="notif-time">{n.time}</div>
                  </div>
                ))
              )}
              <div className="notif-footer">View all bookings</div>
            </div>
          )}
        </div>

        {/* Profile (static – no API required) */}
        <div className="sj-profile" onClick={toggleProfile}>
          <div className="sj-profile-info">
            <div className="sj-profile-name">StarJet Admin</div>
            <div className="sj-profile-role">Operations</div>
          </div>
          <img
            src="https://i.ibb.co/5FQ9sdG/user.png"
            alt="admin"
            className="sj-avatar"
          />
        </div>

        {openProfile && (
          <div className="sj-dropdown">
            <div className="dropdown-item disabled">
              <strong>StarJet Admin</strong>
              <br />
              <span>Operations</span>
            </div>
            <div className="dropdown-divider" />
            <button className="dropdown-item" type="button">
              👤 My Profile
            </button>
            <button className="dropdown-item" type="button">
              📊 Booking Reports
            </button>
            <button className="dropdown-item" type="button">
              ⚙️ System Settings
            </button>
            <div className="dropdown-divider" />
            <NavLink to="/" className="dropdown-item logout-item">
              🚪 Logout
            </NavLink>
          </div>
        )}
      </div>
    </nav>
  );
};

export default AdminNavbar;

