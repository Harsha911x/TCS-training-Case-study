import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Axios from "axios";
import "./styles/ViewAirplane.css";

const logos = {
  IndiGo: require("../../images/IndiGo.png"),
  AirIndia: require("../../images/AirIndia.png"),
  Vistara: require("../../images/Vistara.png"),
  SpiceJet: require("../../images/SpiceJet.png"),
  Akasa: require("../../images/Akasa.png"),
  default: require("../../images/logo.png"), // ← make sure this exists
};

export default function ViewAirplane() {
  const { id } = useParams();
  const [plane, setPlane] = useState({});

  useEffect(() => {
    Axios.get(`http://localhost:5000/airplane/api/get/${id}`).then((resp) => {
      setPlane(resp.data[0]);
    });
  }, [id]);

  /** SAFE LOGO FUNCTION */
  const getLogo = (name) => {
    if (!name) return logos.default;
    return logos[name] || logos.default;
  };

  return (
    <div className="view-wrapper">
      <div className="view-card">
        
        <div className="view-header">
          <img
            src={getLogo(plane.airline)}
            alt={plane.airline || "Airline"}
            className="airline-logo"
          />
          <h2>{plane.airline || "Unknown Airline"}</h2>
        </div>

        <div className="view-body">
          <p><strong>Airplane ID:</strong> {plane.airplane_id}</p>
          <p><strong>Model:</strong> {plane.model}</p>
          <p><strong>Max Seats:</strong> {plane.max_seats}</p>
        </div>

        <Link to="/Airplane" className="back-btn-view">Back</Link>
      </div>
    </div>
  );
}
