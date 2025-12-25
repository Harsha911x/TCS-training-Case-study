import React, { useState, useEffect } from "react";
import {
  FaExchangeAlt
} from "react-icons/fa";
import { useForm } from "react-hook-form";
import { useParams, useHistory } from "react-router-dom";
import Axios from "axios";
import "../Pages/styles/BookTicket.css";

const BookTicket = () => {
  const history = useHistory();
  const { id } = useParams();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm();

  const [airportData, setAirportData] = useState([]);
  const [tripType, setTripType] = useState("oneway");

  /* ---------------- LOAD AIRPORT LIST ---------------- */
  useEffect(() => {
    Axios.get("http://localhost:5000/airport/api/get").then((res) =>
      setAirportData(res.data)
    );
  }, []);

  /* ---------------- DATE LIMITS ---------------- */
  const today = new Date().toISOString().split("T")[0];

  const nextYear = new Date();
  nextYear.setFullYear(nextYear.getFullYear() + 1);
  const maxDate = nextYear.toISOString().split("T")[0];

  /* ---------------- WATCH INPUTS ---------------- */
  const departureDateSelected = watch("departureDate");
  const departureSelected = watch("departure");

  /* ---------------- SWAP BUTTON ---------------- */
  const swapLocations = () => {
    const from = document.getElementById("from").value;
    const to = document.getElementById("to").value;
    setValue("departure", to);
    setValue("arrival", from);
  };

  /* ---------------- SUBMIT ---------------- */
  const onSubmit = (data) => {
    if (data.departure === data.arrival) {
      alert("Departure and Arrival cannot be the same!");
      return;
    }

    // Validate dates
    const depDate = new Date(data.departureDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (depDate < today) {
      alert("Departure date cannot be in the past!");
      return;
    }

    // Validate return date for round trip
    if (tripType === "round") {
      if (!data.returnDate) {
        alert("Return date is required for round trip!");
        return;
      }
      const retDate = new Date(data.returnDate);
      if (retDate < depDate) {
        alert("Return date must be after departure date!");
        return;
      }
    }

    data.tripType = tripType;

    Axios.post("http://localhost:5000/BookTicket", data);

    setTimeout(() => history.push(`/AvailableFlights/${id}`), 150);
  };

  return (
    <div className="ticket-bg-img">
      {/* BACK BUTTON */}
      <button className="back-btn" onClick={() => history.goBack()}>
        ⬅ Back
      </button>

      {/* MAIN FORM BOX */}
      <div className="ticket-form-box">
        <h1 className="flight-heading">Search Flights</h1>

        {/* TRIP TYPE BUTTONS */}
        <div className="trip-options">
          <button
            className={tripType === "oneway" ? "trip-btn active" : "trip-btn"}
            onClick={() => setTripType("oneway")}
          >
            One-Way
          </button>

          <button
            className={tripType === "round" ? "trip-btn active" : "trip-btn"}
            onClick={() => setTripType("round")}
          >
            Round Trip
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>

          {/* FROM + TO + SWAP */}
          <div className="row">
            <div className="field">
              <label>Flying From</label>
              <select
                id="from"
                className={errors.departure ? "error-box" : ""}
                {...register("departure", { required: "Select a departure airport" })}
              >
                <option value="">--Select Airport--</option>
                {airportData.map((a) => (
                  <option key={a.airport_code} value={a.airport_name}>
                    {a.airport_name}({a.airport_code})
                  </option>
                ))}
              </select>
              {errors.departure && (
                <p className="error">{errors.departure.message}</p>
              )}
            </div>

            {/* SWAP BUTTON */}
            <button type="button" className="swap-btn" onClick={swapLocations}>
              <FaExchangeAlt size={24} />
            </button>

            <div className="field">
              <label>Flying To</label>
              <select
                id="to"
                {...register("arrival", { required: "Select an arrival airport" })}
              >
                <option value="">--Select Airport--</option>
                {airportData
                  // .filter((a) => a.airport_name !== departureSelected)
                  .map((a) => (
                    <option key={a.airport_code} value={a.airport_name}>
                      {a.airport_name}({a.airport_code})
                    </option>
                  ))}
              </select>
              {errors.arrival && (
                <p className="error">{errors.arrival.message}</p>
              )}
            </div>
          </div>

          {/* DATE SECTION */}
          <div className="row">
            <div className="field">
              <label>Departure Date</label>
              <input
                type="date"
                min={today}
                max={maxDate}
                {...register("departureDate", {
                  required: "Departure date is required",
                })}
              />
              {errors.departureDate && (
                <p className="error">{errors.departureDate.message}</p>
              )}
            </div>

            {tripType === "round" && (
              <div className="field">
                <label>Return Date</label>
                <input
                  type="date"
                  min={departureDateSelected ? departureDateSelected : today}
                  max={maxDate}
                  {...register("returnDate", {
                    required: "Return date is required for round trip",
                  })}
                />
                {errors.returnDate && (
                  <p className="error">{errors.returnDate.message}</p>
                )}
              </div>
            )}
          </div>

          {/* CLASS SECTION */}
          <div className="row">
            <div className="field">
              <label>Class</label>
              <select
                {...register("class", { required: "Select a travel class" })}
              >
                <option value="">--Select Class--</option>
                <option value="Economy">Economy</option>
                <option value="Business">Business</option>
              </select>
              {errors.class && <p className="error">{errors.class.message}</p>}
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <button type="submit" className="search-btn">
            Search Flights
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookTicket;