// src/components/Pages/AvailableFlights.jsx
import React, { useEffect, useState, useMemo } from "react";
import { Link, useParams, useHistory } from "react-router-dom";
import Axios from "axios";
import "./styles/AvailableFlights.css";

function convertDateToBackend(d) {
  if (!d) return "";
  return d; // already "YYYY-MM-DD"
}



const airlineLogos = {
  "IndiGo": require("../../images/IndiGo.png"),
  "Air India": require("../../images/AirIndia.png"),
  "Vistara": require("../../images/Vistara.png"),
  "SpiceJet": require("../../images/SpiceJet.png"),
  "Akasa Air": require("../../images/Akasa.png"),
  "Go First": require("../../images/gofirst.png"),
};
const AvailableFlights = () => {
  const [showCancelPopup, setShowCancelPopup] = useState(false);
  const [popupFlight, setPopupFlight] = useState(null);
  const { id } = useParams();
  const history = useHistory();
  const [searchParams, setSearchParams] = useState(null);
  const [flights, setFlights] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedFlightIndex, setSelectedFlightIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [timeFilter, setTimeFilter] = useState("");

  // ---------- LOAD LATEST SEARCH ----------
  useEffect(() => {
    let cancelled = false;
    async function loadSearch() {
      try {
        const resp = await Axios.get("http://localhost:5000/SearchFlights");
        if (cancelled) return;
        if (!resp.data || resp.data.length === 0) {
          setSearchParams(null);
          setLoading(false);
          return;
        }
        const latestSearch = resp.data[resp.data.length - 1];
        setSearchParams(latestSearch);
      } catch (e) {
        console.error("SearchFlights fetch error", e);
        setSearchParams(null);
      } finally {
        setLoading(false);
      }
    }
    loadSearch();
    return () => (cancelled = true);
  }, []);

  // ---------- LOAD FLIGHTS ----------
  useEffect(() => {
    if (!searchParams||!selectedDate) return;
    let cancelled = false;

    async function fetchFlights() {
      setLoading(true);
      try {
        const dep = convertDateToBackend(searchParams.departureDate);
        const ret = convertDateToBackend(searchParams.returnDate);

        const resp = await Axios.post("http://localhost:5000/AvailableFlights", {
          from_airport: searchParams.from_airport_code,
          to_airport: searchParams.to_airport_code,
          departureDate: selectedDate,
          returnDate: ret,
          tripType: searchParams.tripType,
        });

        if (cancelled) return;

        if (Array.isArray(resp.data)) {
          setFlights(resp.data);
          setSelectedFlightIndex(0);
        } else {
          console.warn("AvailableFlights returned:", resp.data);
          setFlights([]);
        }
      } catch (e) {
        console.error("AvailableFlights error", e);
        setFlights([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchFlights();
    return () => (cancelled = true);
  }, [searchParams,selectedDate]);

  // Helper: Calculate duration in minutes (must be defined before useMemo)
  const calcDurationMinutes = (dep, arr) => {
    if (!dep || !arr) return 0;
    const depTime = new Date(dep.replace(" ", "T"));
    const arrTime = new Date(arr.replace(" ", "T"));
    return (arrTime - depTime) / (1000 * 60);
  };

  // Helper: compute display fare (2x for Business) - must be defined before useMemo
  const getDisplayFare = (base, travelClass) => {
    const baseNum = Number(base) || 0;
    return travelClass === "Business" ? baseNum * 2 : baseNum;
  };

  // Get travel class (before hooks)
  const travelClass = searchParams?.class || "Economy";

  // Generate future dates (next 7 days)
  const futureDates = useMemo(() => {
    if (!searchParams?.departureDate) return [];
    const dates = [];
    const baseDate = new Date(searchParams.departureDate);
    for (let i = 0; i < 7; i++) {
      const date = new Date(baseDate);
      date.setDate(date.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  }, [searchParams?.departureDate]);

  // Set initial selected date
  useEffect(() => {
    if (searchParams?.departureDate && !selectedDate) {
      setSelectedDate(searchParams.departureDate);
    }
  }, [searchParams?.departureDate, selectedDate]);

  // Filter and sort flights based on activeTab and filters - MUST be before early returns
  const filteredAndSortedFlights = useMemo(() => {
    if (!flights || flights.length === 0) return [];
    
    let result = [...flights];

    // Filter by selected date
    // Filter by selected date + current time rule for today
if (selectedDate) {
  const today = new Date().toISOString().split("T")[0];

  result = result.filter(f => {
    if (!f.departure_time) return false;

    const [flightDate, flightTime] = f.departure_time.split(" ");
    
    // Only today's date → check time also
    if (selectedDate === today) {
      const now = new Date();
      const [h, m] = flightTime.split(":").map(Number);
      const flightDateObj = new Date(today + "T" + h.toString().padStart(2,"0") + ":" + m.toString().padStart(2,"0"));

      return flightDateObj >= now; // show only if flight is not departed yet
    }

    // Other dates → only match date
    return flightDate === selectedDate;
  });
}

    // Filter by time of day
    if (timeFilter) {
      result = result.filter(f => {
        if (!f.departure_time) return false;
        const depTime = f.departure_time;
        const depHour = depTime ? parseInt(depTime.slice(11, 13)) : null;
        if (depHour === null) return false;

        switch (timeFilter) {
          case "morning":
            return depHour >= 5 && depHour < 12;
          case "afternoon":
            return depHour >= 12 && depHour < 17;
          case "evening":
            return depHour >= 17 && depHour < 21;
          case "night":
            return depHour >= 21 || depHour < 5;
          default:
            return true;
        }
      });
    }

    // Apply sorting
    switch (activeTab) {
      case "cheapest":
        // Sort by price (ascending)
        result.sort((a, b) => {
          const fareA = getDisplayFare(a.fares, travelClass);
          const fareB = getDisplayFare(b.fares, travelClass);
          return fareA - fareB;
        });
        break;
      
      case "all":
      default:
        // Show all flights, sorted by departure time
        result.sort((a, b) => {
          const timeA = new Date(a.departure_time.replace(" ", "T")).getTime();
          const timeB = new Date(b.departure_time.replace(" ", "T")).getTime();
          return timeA - timeB;
        });
        break;
    }

    return result;
  }, [flights, activeTab, travelClass, selectedDate, timeFilter]);

  // Update selected index when filter changes - MUST be before early returns
  useEffect(() => {
    if (filteredAndSortedFlights.length > 0) {
      setSelectedFlightIndex(0);
    } else {
      setSelectedFlightIndex(-1);
    }
  }, [activeTab, selectedDate, timeFilter, filteredAndSortedFlights.length]);

  // Calculate selected flight and fare
  const selectedFlight = filteredAndSortedFlights[selectedFlightIndex] || null;
  const selectedFare = selectedFlight ? getDisplayFare(selectedFlight.fares, travelClass) : 0;
  const selectFlight = (idx) => setSelectedFlightIndex(idx);

  // Early returns AFTER all hooks
  if (loading) {
    return <div className="af-loading">Loading flights…</div>;
  }

  if (!searchParams) {
    return (
      <div className="af-empty">
        <p>No search found. Please run a flight search first.</p>
        <Link to="/BookTicket">Search Flights</Link>
      </div>
    );
  }

  return (
    <div className="af-page">
      {/* HEADER */}
      <header className="af-header">
        <button className="af-back" onClick={() => history.goBack()}>
          ←
        </button>
        <div className="af-summary">
          <div className="af-route">
            <strong>{searchParams.departure || "From"}</strong> →{" "}
            <strong>{searchParams.arrival || "To"}</strong>
          </div>
          <div className="af-sub">
            {searchParams.departureDate} • 1 Adult • {travelClass}
          </div>
        </div>
        <Link className="af-edit" to="/BookTicket">
          Edit
        </Link>
      </header>

      {/* DATE CARDS */}
      <div className="af-date-row">
        {futureDates.map((date, idx) => {
          const dateObj = new Date(date);
          const isToday = date === searchParams.departureDate;
          const isSelected = selectedDate === date;
          const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
          const dayNum = dateObj.getDate();
          const monthName = dateObj.toLocaleDateString('en-US', { month: 'short' });

          return (
            <div
              key={date}
              className={`af-date-card ${isSelected ? "active" : ""} ${isToday ? "today" : ""}`}
              onClick={() => setSelectedDate(date)}
            >
              <div className="af-date-day-name">{dayName}</div>
              <div className="af-date-day-num">{dayNum}</div>
              <div className="af-date-month">{monthName}</div>
            </div>
          );
        })}
      </div>

      {/* FILTER TABS */}
      <div className="af-filters">
        <button
          className={activeTab === "cheapest" ? "filter active" : "filter"}
          onClick={() => setActiveTab("cheapest")}
        >
          Cheapest
        </button>
        <button
          className={activeTab === "all" ? "filter active" : "filter"}
          onClick={() => setActiveTab("all")}
        >
          All
        </button>
      </div>

      {/* TIME FILTERS */}
      <div className="af-time-filters">
        <button
          className={timeFilter === "morning" ? "time-filter active" : "time-filter"}
          onClick={() => setTimeFilter(timeFilter === "morning" ? "" : "morning")}
        >
          🌅 Morning (5 AM - 12 PM)
        </button>
        <button
          className={timeFilter === "afternoon" ? "time-filter active" : "time-filter"}
          onClick={() => setTimeFilter(timeFilter === "afternoon" ? "" : "afternoon")}
        >
          ☀️ Afternoon (12 PM - 5 PM)
        </button>
        <button
          className={timeFilter === "evening" ? "time-filter active" : "time-filter"}
          onClick={() => setTimeFilter(timeFilter === "evening" ? "" : "evening")}
        >
          🌆 Evening (5 PM - 9 PM)
        </button>
        <button
          className={timeFilter === "night" ? "time-filter active" : "time-filter"}
          onClick={() => setTimeFilter(timeFilter === "night" ? "" : "night")}
        >
          🌙 Night (9 PM - 5 AM)
        </button>
      </div>

      {/* FLIGHTS LIST */}
      <main className="af-list">
        {filteredAndSortedFlights.length === 0 ? (
          <div className="af-no-results">
            <div className="af-no-results-icon">✈</div>
            <h3>No flights available</h3>
            <p>Try adjusting your search criteria or filters</p>
          </div>
        ) : (
          <>
            <div className="af-results-count">
              {filteredAndSortedFlights.length} {filteredAndSortedFlights.length === 1 ? 'flight' : 'flights'} found
            </div>
            {filteredAndSortedFlights.map((f, i) => {
              const isSelected = i === selectedFlightIndex;
              const displayFare = getDisplayFare(f.fares, travelClass);
              const duration = calcDurationElapsed(f.departure_time, f.arrival_time);
              const airlineInitial = f.airline ? f.airline.charAt(0).toUpperCase() : "✈";

              return (
                <article
                  key={`${f.schedule_id}-${i}`}
                  className={`af-card ${isSelected ? "selected" : ""}`}
                  onClick={() => selectFlight(i)}
                >
                  <div className="af-card-top">
                    <div className="af-airline">
                      <div className="af-airline-logo" title={f.airline || "Airline"}>
                        <img src={airlineLogos[f.airline]||require("../../images/logo.png")}
                        alt={f.airline}
                        className="af-logo-img"/>
                      </div>
                      <div className="af-airline-name">{f.airline || "Airline"}</div>
                    </div>

                    <div className="af-times">
                      <div className="af-time-left">
                        <div className="af-time">
                          {formatTimeReading(f.departure_time)}
                        </div>
                        <div className="af-place">
                          <strong>{f.from_airport || "N/A"}</strong>
                          <span className="af-airport-name">{getAirportName(f.from_airport)||"Unknown Airport"}</span>
                        </div>
                      </div>

                      <div className="af-duration">
                        <div className="af-duration-time">{duration}</div>
                        <div className="af-nonstop">
                          <span className="af-nonstop-icon">●</span> Non stop
                        </div>
                        <div className="af-flight-number">Flight {f.flight_no}</div>
                      </div>

                      <div className="af-time-right">
                        <div className="af-time">
                          {formatTimeReading(f.arrival_time)}
                        </div>
                        <div className="af-place">
                          <strong>{f.to_airport || "N/A"}</strong>
                          <span className="af-airport-name">{getAirportName(f.to_airport)||"Unknown Airport"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="af-price">
                      <div className="af-amount">₹ {displayFare.toLocaleString()}</div>
                      <div className="af-label">per adult</div>
                      {travelClass === "Business" && (
                        <div className="af-class-badge">Business</div>
                      )}
                    </div>
                  </div>

                  {/* FARE + ACTIONS */}
                  <div className="af-card-bottom">
                    <div className="af-fare-card">
                      <div className="af-fare-title">
                        <span className="af-fare-badge">Saver</span>
                        {f.status && (
                          <span className={`af-status-badge af-status-${f.status.toLowerCase().replace(" ", "-")}`}>
                            {f.status}
                          </span>
                        )}
                      </div>
                      <div className="af-fare-details">
                        <div>
                          <span className="af-detail-icon">🎒</span>
                          Cabin bag <span>7 Kgs / Adult</span>
                        </div>
                        <div>
                          <span className="af-detail-icon">🧳</span>
                          Check-in <span>15 Kgs / Adult</span>
                        </div>
                        {/* <div>
                          <span className="af-detail-icon">ℹ️</span>
                          Cancellation <span>fee applies</span>
                        </div> */}
                        <div
  className="af-cancel-link"
  onClick={(e) => {
    e.stopPropagation();        // don’t select the card
    setPopupFlight(f);          // store which flight was clicked
    setShowCancelPopup(true);   // open popup
  }}
>
  <span className="af-detail-icon">ℹ️</span>
  <span className="af-cancel-text">Cancellation</span>
  <span> fee applies</span>
</div>
                      </div>
                    </div>
                    
                    <div className="af-actions">
                      {id > 0 ? (
                        <Link
                          to={{
                            pathname: `/SeatSelection/${id}/${f.flight_no}`,
                            state: {
                              flight: f,
                              search: searchParams,
                              travelClass,
                              fare: displayFare,
                            },
                          }}
                          className="af-book-btn"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Select Seats
                        </Link>
                      ) : (
                        <Link 
                          to="/CustomerSignin" 
                          className="af-book-btn"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Login to book
                        </Link>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </>
        )}
      </main>
      {showCancelPopup && popupFlight && (
  <div className="af-popup-overlay" onClick={() => setShowCancelPopup(false)}>
    <div className="af-popup-box" onClick={(e) => e.stopPropagation()}>

      <h3 className="af-popup-title">Cancellation Policy</h3>

      <p className="af-popup-text"><strong>Flight:</strong> {popupFlight.flight_no}</p>
      <p className="af-popup-text"><strong>Airline:</strong> {popupFlight.airline}</p>

      <ul>
        <li>Cancellation fee applies based on airline rules.</li>
        <li>Free cancellation within 24 hours (if applicable).</li>
        <li>No-show fee applies if the passenger doesn’t board.</li>
        <li>Refund is returned to original payment method.</li>
      </ul>

      <button className="af-popup-close-btn" onClick={() => setShowCancelPopup(false)}>
        Close
      </button>

    </div>
  </div>
)}
      {/* BOTTOM BAR */}
      <footer className="af-bottom">
        <div className="af-bottom-left">
          <div className="af-total">₹ {selectedFare}</div>
          <div className="af-for">FOR 1 ADULT</div>
        </div>
        <div className="af-bottom-right">
          <button
            className="af-continue"
            onClick={() => {
              if (!selectedFlight) return;
              if (id > 0) {
                const displayFare = getDisplayFare(selectedFlight.fares, travelClass);
                history.push({
                  pathname: `/SeatSelection/${id}/${selectedFlight.flight_no}`,
                  state: {
                    flight: selectedFlight,
                    search: searchParams,
                    travelClass,
                    fare: displayFare,
                  },
                });
              } else {
                history.push("/CustomerSignin");
              }
            }}
          >
            Continue
          </button>
        </div>
      </footer>
    </div>
  );
};

// ---------- HELPERS ----------
function formatTimeReading(datetime) {
  if (!datetime) return "";
  const parts = datetime.split(" ");
  if (parts.length < 2) return "";
  const t = parts[1];
  const hhmm = t.slice(0, 5);
  return hhmm;
}

function extractPlace(datetime) {
  return "";
}

// Helper: Get airport name from code
function getAirportName(code) {
  const airportNames = {
    "DEL": "Delhi", "BOM": "Mumbai", "BLR": "Bengaluru", "MAA": "Chennai",
    "HYD": "Hyderabad", "CCU": "Kolkata", "AMD": "Ahmedabad", "GOI": "Goa",
    "PNQ": "Pune", "LKO": "Lucknow", "VNS": "Varanasi", "TRV": "Thiruvananthapuram",
    "COK": "Kochi", "IXC": "Chandigarh", "ATQ": "Amritsar"
  };
  return airportNames[code] || "";
}

function calcDurationElapsed(dep, arr) {
  if (!dep || !arr) return "";

  const [depDate, depTime] = dep.split(" ");
  const [arrDate, arrTime] = arr.split(" ");

  const [y1, m1, d1] = depDate.split("-").map(Number);
  const [h1, min1, s1] = depTime.split(":").map(Number);

  const [y2, m2, d2] = arrDate.split("-").map(Number);
  const [h2, min2, s2] = arrTime.split(":").map(Number);

  const depObj = new Date(y1, m1 - 1, d1, h1, min1, s1);
  const arrObj = new Date(y2, m2 - 1, d2, h2, min2, s2);

  let diffMs = arrObj - depObj;
  if (diffMs < 0) return "";

  const totalMinutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${hours}h ${minutes}m`;
}

export default AvailableFlights;