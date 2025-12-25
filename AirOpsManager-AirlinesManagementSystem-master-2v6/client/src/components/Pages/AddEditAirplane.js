import React, { useEffect, useState } from "react";
import { useParams, useHistory, Link } from "react-router-dom";
import Axios from "axios";
import { toast } from "react-toastify";
import "./styles/AddEditAirplane.css";

const initialState = {
  airplane_id: "",
  airline: "",
  model: "",
  max_seats: "",
};

export default function AddEditAirplane() {
  const [state, setState] = useState(initialState);
  const { airplane_id, airline, model, max_seats } = state;

  const { id } = useParams();
  const history = useHistory();

  /* ------------ LOAD DATA ------------ */
  useEffect(() => {
    if (id) {
      Axios.get(`http://localhost:5000/airplane/api/get/${id}`).then((resp) => {
        const row = resp.data[0] || {};
        setState({
          airplane_id: row.airplane_id || "",
          airline: row.airline || "",
          model: row.model || "",
          max_seats: row.max_seats || "",
        });
      });
    } else {
      const autoID = Math.floor(1000 + Math.random() * 9000);
      setState((prev) => ({ ...prev, airplane_id: autoID }));
    }
  }, [id]);

  /* ------------ VALIDATE INPUT ------------ */
  const onlyLetters = (v) => /^[A-Za-z ]*$/.test(v);
  const digitsOnly = (v) => /^[0-9]*$/.test(v);

  const handleChange = (e) => {
  const { name, value } = e.target;

  // ---------- AIRLINE VALIDATION ----------
  if (name === "airline") {
    // Prevent leading whitespace
    if (value.startsWith(" ")) return;

    // Prevent double spaces
    if (value.includes("  ")) return;

    // Allow only letters + single space
    if (!/^[A-Za-z ]*$/.test(value)) return;

    return setState({ ...state, airline: value });
  }

  // ---------- MODEL VALIDATION ----------
  if (name === "model") {
    // Prevent leading whitespace
    if (value.startsWith(" ")) return;

    // Prevent double spaces
    if (value.includes("  ")) return;

    // Allow letters, numbers, spaces, hyphens
    if (!/^[A-Za-z0-9 -]*$/.test(value)) return;

    return setState({ ...state, model: value.toUpperCase() });
  }

  // ---------- MAX SEATS ----------
  if (name === "max_seats") {
    if (!/^[0-9]*$/.test(value)) return;
    if (value.length > 3) return;
    if(value.length>0&&value.startsWith("0"))return;
    return setState({ ...state, max_seats: value });
  }
};


  /* ------------ SUBMIT ------------ */
const handleSubmit = (e) => {
  e.preventDefault();

  if (!airline.trim()) return toast.error("Airline cannot be empty.");
  if (!model.trim()) return toast.error("Model cannot be empty.");

  // --- MAX SEATS VALIDATION ---
  const seats = Number(max_seats);

  if (!max_seats) return toast.error("Max seats is required.");
  if (max_seats.startsWith("0"))
    return toast.error("Max seats cannot start with zero.");
  if (seats < 20 || seats > 600)
    return toast.error("Max seats must be between 20 and 600.");
  if (isNaN(seats))
    return toast.error("Max seats must be a valid number.");

  const payload = {
    airplane_id: Number(airplane_id),
    airline: airline.trim(),
    model: model.trim(),
    max_seats: seats,
  };

  console.log("FINAL PAYLOAD SENT:", payload);

  if (!id) {
    Axios.post("http://localhost:5000/airplane/api/post", payload)
      .then(() => toast.success("Airplane Added"))
      .catch((err) => toast.error(err.response?.data));
  } else {
    Axios.put(`http://localhost:5000/airplane/api/update/${id}`, payload)
      .then(() => toast.success("Airplane Updated"))
      .catch((err) => toast.error(err.response?.data));
  }

  setTimeout(() => history.push("/Airplane"), 400);
};
  return (
    <div className="form-page">
      <form className="client-form" onSubmit={handleSubmit}>
        <h2>{id ? "Update Airplane" : "Add Airplane"}</h2>

        <label>Airplane ID</label>
        <input type="text" value={airplane_id} readOnly />

        <label>Airline</label>
        <input
          type="text"
          name="airline"
          value={airline}
          placeholder="Enter Airline"
          onChange={handleChange}
          required
        />

        <label>Model</label>
        <input
          type="text"
          name="model"
          value={model}
          placeholder="Enter Model"
          onChange={handleChange}
          required
        />

        <label>Max Seats</label>
        <input
          type="text"
          name="max_seats"
          value={max_seats}
          placeholder="50 - 400"
          onChange={handleChange}
          required
        />

        <div className="btn-row">
          <button className="save-btn" type="submit">
            {id ? "Update" : "Add"}
          </button>

          <Link to="/Airplane" className="back-btn">Back</Link>
        </div>
      </form>
    </div>
  );
}
