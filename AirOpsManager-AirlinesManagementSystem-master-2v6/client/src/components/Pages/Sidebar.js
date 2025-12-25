


// src/components/Pages/Sidebar.jsx
import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import "../Pages/styles/Sidebar.css";

import {
  FaBars,
  FaTachometerAlt,
  FaUsers,
  FaPlane,
  FaClipboardList,
  FaMapMarkedAlt,
  FaCalendarAlt,
  FaStar,
} from "react-icons/fa";

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => setCollapsed((prev) => !prev);

  const menuItems = [
    { label: "Dashboard", icon: <FaTachometerAlt />, path: "/AdminPanel" },
    { label: "Clients", icon: <FaUsers />, path: "/Client" },
    { label: "Airplanes", icon: <FaPlane />, path: "/Airplane" },
    { label: "Flight Status", icon: <FaClipboardList />, path: "/FlightStatus" },
    { label: "Airports", icon: <FaMapMarkedAlt />, path: "/Airport" },
    { label: "Schedule", icon: <FaCalendarAlt />, path: "/Schedule" },
    { label: "Bookings", icon: <FaClipboardList />, path: "/Booking" },
    { label: "Reviews", icon: <FaStar />, path: "/Reviews" },
  ];

  return (
    <aside className={`sidebar-container ${collapsed ? "collapsed" : ""}`}>
      {/* Header with toggle */}
      <div className="sidebar-top">
        {!collapsed && <div className="sidebar-title">StarJet Admin</div>}
        <button
          type="button"
          className="toggle-btn"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
        >
          <FaBars />
        </button>
      </div>

      {/* Menu */}
      <nav className="sidebar-menu">
        {menuItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            className="sidebar-item"
            activeClassName="active" // important for React Router v5
          >
            <div className="sidebar-icon">{item.icon}</div>
            {!collapsed && <span className="sidebar-text">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="sidebar-footer">
          <span>© 2025 StarJet Airlines</span>
          <small>Admin Console</small>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;