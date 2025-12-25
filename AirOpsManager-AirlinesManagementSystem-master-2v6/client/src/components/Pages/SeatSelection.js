// src/components/Pages/SeatSelection.js
import React, { useEffect, useState } from "react";
import { useParams, useHistory, useLocation } from "react-router-dom";
import Axios from "axios";
import "./styles/BookTicket.css";

// Single saved card that will be accepted
const SAVED_CARD = {
  number: "4111111111111111",
  holder: "ARIN JAIN",
  expiryMonth: "12",
  expiryYear: "2030",
  cvv: "123",
};

// Small helper to normalize cabin class text
function normalizeClass(cabin) {
  if (!cabin) return null;
  const x = cabin.toLowerCase();
  if (x.includes("business")) return "Business";
  if (x.includes("economy")) return "Economy";
  return null;
}

// Seat selection + payment page with airplane seat map layout
// URL: /SeatSelection/:clientId/:flightNo
const SeatSelection = () => {
  const { clientId, flightNo } = useParams();
  const history = useHistory();
  const location = useLocation();

  const [seatMap, setSeatMap] = useState(null);
  const [selectedSeat, setSelectedSeat] = useState(null); // Keep for backward compatibility
  const [selectedSeats, setSelectedSeats] = useState([]); // NEW: Array for multiple seats (max 10)
  const [passengerDetails, setPassengerDetails] = useState({}); // NEW: Store passenger details for each seat {seat_no: {name, age}}
  const [showPassengerModal, setShowPassengerModal] = useState(false); // NEW: Show passenger details modal
  const [currentSeatForPassenger, setCurrentSeatForPassenger] = useState(null); // NEW: Current seat being processed
  const [passengerFormData, setPassengerFormData] = useState({ name: "", age: "" }); // NEW: Form data for passenger
  const [priceBreakdown, setPriceBreakdown] = useState(null); // NEW: Discount breakdown
  const [loadingPrice, setLoadingPrice] = useState(false); // NEW: Loading price calculation
  const [method, setMethod] = useState("UPI");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [booking, setBooking] = useState(null);
  const [payment, setPayment] = useState(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    cardHolder: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
  });
  const [cardErrors, setCardErrors] = useState({});

  // flight + search info passed from AvailableFlights via location.state
  const flight =
    location.state && location.state.flight ? location.state.flight : null;
  const search =
    location.state && location.state.search ? location.state.search : null;
  const travelClassFromState =
    location.state && location.state.travelClass ? location.state.travelClass : null;
  // ✅ Fix: Extract fare from location.state (already multiplied for Business class)
  const fareFromState =
    location.state && location.state.fare != null ? Number(location.state.fare) : null;

  // ✅ Fix: Extract selected class from travelClass (primary) or search.class (fallback)
  const selectedCabinClass = normalizeClass(travelClassFromState || (search && search.class)) || "Economy";
  
  // ✅ Fix: Calculate display fare - use fareFromState if available, otherwise calculate based on class
  const displayFare = fareFromState != null 
    ? fareFromState 
    : (flight && flight.fares 
        ? (selectedCabinClass === "Business" ? Number(flight.fares) * 2 : Number(flight.fares))
        : 0);

  // Load seat map from backend
  useEffect(() => {
    let cancelled = false;
    async function loadSeatMap() {
      setLoading(true);
      setError("");
      try {
        const resp = await Axios.get(
          `http://localhost:5000/SeatMap/${flightNo}`
        );
        if (cancelled) return;
        setSeatMap(resp.data);
      } catch (e) {
        console.error("SeatMap error", e);
        if (!cancelled)
          setError("Unable to load seat map. Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadSeatMap();
    return () => {
      cancelled = true;
    };
  }, [flightNo]);

  const handleSeatClick = (seat) => {
    if (!seat || seat.status !== "available") return;

    // ✅ Fix: Extra safety: prevent selecting wrong class seat
    const seatClassNorm = normalizeClass(seat.seat_class);
    if (
      selectedCabinClass &&
      seatClassNorm &&
      seatClassNorm !== selectedCabinClass
    ) {
      alert(`You selected ${selectedCabinClass} class. Please pick a ${selectedCabinClass} seat.`);
      return;
    }

    // ✅ Fix: Double-check seat matches selected class before allowing selection
    if (!seatMatchesSelectedClass(seat)) {
      alert(`This seat belongs to ${seat.seat_class} class. Please select a ${selectedCabinClass} class seat.`);
      return;
    }

    // NEW: Toggle seat selection (multiple seats support)
    const seatIndex = selectedSeats.findIndex(s => s.seat_no === seat.seat_no);
    if (seatIndex >= 0) {
      // Deselect seat - also remove passenger details
      const newSeats = selectedSeats.filter(s => s.seat_no !== seat.seat_no);
      setSelectedSeats(newSeats);
      const newPassengerDetails = { ...passengerDetails };
      delete newPassengerDetails[seat.seat_no];
      setPassengerDetails(newPassengerDetails);
      // Keep backward compatibility
      if (selectedSeat && selectedSeat.seat_no === seat.seat_no) {
        setSelectedSeat(newSeats.length > 0 ? newSeats[0] : null);
      }
    } else {
      // Select seat (max 10)
      if (selectedSeats.length >= 10) {
        alert("You can book a maximum of 10 seats at once.");
        return;
      }
      // Show passenger details modal for this seat
      setCurrentSeatForPassenger(seat);
      setPassengerFormData({ name: "", age: "" });
      setShowPassengerModal(true);
    }
  };

  // NEW: Handle passenger details submission
  const handlePassengerSubmit = () => {
    if (!currentSeatForPassenger) return;
    
    const name = passengerFormData.name.trim();
    const age = parseInt(passengerFormData.age);
    
    if (!name || name.length < 2) {
      alert("Please enter a valid passenger name (at least 2 characters).");
      return;
    }
    
    if (!age || age < 5 || age > 80) {
      alert("Please enter a valid age (5-80).");
      return;
    }
    
    // Add seat with passenger details
    const newSeats = [...selectedSeats, currentSeatForPassenger];
    setSelectedSeats(newSeats);
    setSelectedSeat(currentSeatForPassenger);
    
    // Store passenger details
    setPassengerDetails({
      ...passengerDetails,
      [currentSeatForPassenger.seat_no]: {
        name: name,
        age: age
      }
    });
    
    // Close modal and reset
    setShowPassengerModal(false);
    setCurrentSeatForPassenger(null);
    setPassengerFormData({ name: "", age: "" });
  };

  // NEW: Handle passenger modal cancel
  const handlePassengerCancel = () => {
    setShowPassengerModal(false);
    setCurrentSeatForPassenger(null);
    setPassengerFormData({ name: "", age: "" });
  };

  // NEW: Calculate price with discounts when seats change
  useEffect(() => {
    if (selectedSeats.length === 0 || !flight || !displayFare) {
      setPriceBreakdown(null);
      return;
    }

    const calculatePrice = async () => {
      setLoadingPrice(true);
      try {
        const resp = await Axios.get("http://localhost:5000/booking/calculatePrice", {
          params: {
            basePricePerSeat: displayFare,
            seatCount: selectedSeats.length,
            clientId: clientId,
            flightNo: flightNo
          }
        });
        setPriceBreakdown(resp.data.priceBreakdown);
      } catch (error) {
        console.error("Error calculating price:", error);
        // Fallback: use simple calculation without discounts
        setPriceBreakdown({
          baseTotal: displayFare * selectedSeats.length,
          finalTotal: displayFare * selectedSeats.length,
          totalDiscountAmount: 0,
          savings: 0,
          quantityDiscount: { applied: false, percent: 0, amount: 0 },
          tierDiscount: { applied: false, percent: 0, amount: 0, tier: "None" },
          advanceDiscount: { applied: false, percent: 0, amount: 0 }
        });
      } finally {
        setLoadingPrice(false);
      }
    };

    calculatePrice();
  }, [selectedSeats.length, displayFare, clientId, flightNo, flight]);

  // Validate card details, expiry real-time and <= 2050,
  // and only allow the single saved card
  const validateCardDetails = () => {
    const errors = {};

    const rawNum = cardDetails.cardNumber || "";
    const cardNum = rawNum.replace(/\s/g, "");
    const holder = (cardDetails.cardHolder || "").trim();
    const monthStr = cardDetails.expiryMonth;
    const yearStr = cardDetails.expiryYear;
    const cvvStr = cardDetails.cvv;

    // Card number validation (16 digits)
    if (!cardNum || cardNum.length !== 16 || !/^\d{16}$/.test(cardNum)) {
      errors.cardNumber = "Please enter a valid 16-digit card number";
    }

    // Card holder name validation
    if (!holder || holder.length < 3) {
      errors.cardHolder = "Please enter cardholder name (min 3 characters)";
    }

    // Expiry validation
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    const month = Number(monthStr);
    const year = Number(yearStr);

    if (!month || month < 1 || month > 12) {
      errors.expiryMonth = "Please select a valid month";
    }

    if (!year || year < currentYear || year > 2050) {
      errors.expiryYear = "Year must be between current year and 2050";
    } else if (year === currentYear && month < currentMonth) {
      errors.expiryMonth = "Card is expired";
    }

    // CVV validation (3–4 digits)
    if (!cvvStr || !/^\d{3,4}$/.test(cvvStr)) {
      errors.cvv = "Please enter a valid CVV (3-4 digits)";
    }

    // If basic field errors exist, no need to check saved card yet
    if (Object.keys(errors).length === 0) {
      const normalizedHolder = holder.toUpperCase();
      const normalizedMonth = String(month).padStart(2, "0");
      const normalizedYear = String(year);

      const isSavedCard =
        cardNum === SAVED_CARD.number &&
        normalizedHolder === SAVED_CARD.holder &&
        normalizedMonth === SAVED_CARD.expiryMonth &&
        normalizedYear === SAVED_CARD.expiryYear &&
        cvvStr === SAVED_CARD.cvv;

      if (!isSavedCard) {
        errors._global =
          "This card is declined. Use the StarJet Airlines test card:\n";
      }
    }

    setCardErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle payment method change
  const handlePaymentMethodChange = (newMethod) => {
    setMethod(newMethod);
    setShowPaymentForm(false);
    setCardErrors({});
  };

  // Handle "Confirm Seat & Pay" button click
  const handleConfirmAndPayClick = () => {
    if (selectedSeats.length === 0 && !selectedSeat) {
      alert("Please select at least one seat.");
      return;
    }

    // If Card payment, show payment form first
    if (method === "Card") {
      setShowPaymentForm(true);
      return;
    }

    // For other payment methods, proceed directly
    handleConfirmAndPay();
  };

  // Format card number with spaces (XXXX XXXX XXXX XXXX)
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(" ");
    } else {
      return v;
    }
  };

  const handleConfirmAndPay = async () => {
    if (!flight) {
      alert("Missing flight details. Please go back and re-select the flight.");
      return;
    }
    // NEW: Support both single and multiple seat booking
    if (selectedSeats.length === 0) {
      alert("Please select at least one seat.");
      return;
    }
    setProcessing(true);
    setError("");
    try {
      const client_id = Number(clientId);
      const flight_no = Number(flightNo);
      const airport_code = flight.to_airport || "";
      const basePricePerSeat = displayFare;

      if (!client_id || !flight_no || !airport_code) {
        throw new Error("Missing required booking fields");
      }

      // Get departure time for advance booking discount
      let departureTime = null;
      if (flight && flight.schedule_id) {
        try {
          const scheduleResp = await Axios.get(`http://localhost:5000/schedule/${flight.schedule_id}`);
          if (scheduleResp.data && scheduleResp.data.departure_time) {
            departureTime = scheduleResp.data.departure_time;
          }
        } catch (e) {
          console.warn("Could not fetch departure time:", e);
        }
      }

      // NEW: Use multiple seat booking endpoint if more than 1 seat, otherwise use single seat endpoint
      let finalAmount = basePricePerSeat;
      let bookings = [];

      if (selectedSeats.length === 1) {
        // Single seat booking (backward compatible)
        const passenger = passengerDetails[selectedSeats[0].seat_no] || {};
        const bResp = await Axios.post(
          "http://localhost:5000/booking/createWithSeat",
          {
            client_id,
            flight_no,
            airport_code,
            fares: basePricePerSeat,
            seat_no: selectedSeats[0].seat_no,
            seat_class: selectedSeats[0].seat_class,
            passenger_name: passenger.name || "",
            passenger_age: passenger.age || null,
          }
        );

        const newBooking = bResp.data && bResp.data.booking ? bResp.data.booking : null;
        if (!newBooking || !newBooking.booking_id) {
          throw new Error("Booking creation failed");
        }
        bookings = [newBooking];
        finalAmount = basePricePerSeat;
      } else {
        // Multiple seat booking with discounts
        const bResp = await Axios.post(
          "http://localhost:5000/booking/createMultipleSeats",
          {
            client_id,
            flight_no,
            airport_code,
            basePricePerSeat,
            seats: selectedSeats.map(s => {
              const passenger = passengerDetails[s.seat_no] || {};
              return {
                seat_no: s.seat_no,
                seat_class: s.seat_class,
                passenger_name: passenger.name || "",
                passenger_age: passenger.age || null,
              };
            }),
            departureTime
          }
        );

        if (bResp.data.err) {
          throw new Error(bResp.data.err);
        }

        bookings = bResp.data.bookings || [];
        finalAmount = bResp.data.summary ? bResp.data.summary.finalTotal : basePricePerSeat * selectedSeats.length;
        
        // Store price breakdown for display
        if (bResp.data.priceBreakdown) {
          setPriceBreakdown(bResp.data.priceBreakdown);
        }
      }

      if (bookings.length === 0) {
        throw new Error("No bookings were created");
      }

      // Use first booking for payment (all bookings share same payment)
      const primaryBooking = bookings[0];
      setBooking(primaryBooking);

      // 2) init payment with final amount (includes discounts)
      const payInitResp = await Axios.post(
        "http://localhost:5000/payment/init",
        {
          booking_id: primaryBooking.booking_id,
          amount: finalAmount,
          method,
        }
      );
      const payInit =
        payInitResp.data && payInitResp.data.payment
          ? payInitResp.data.payment
          : null;
      if (!payInit || !payInit.payment_id) {
        throw new Error("Payment initiation failed");
      }

      // 3) confirm payment (simulate success)
      const payConfResp = await Axios.post(
        "http://localhost:5000/payment/confirm",
        {
          booking_id: primaryBooking.booking_id,
          success: true,
        }
      );
      const payConf = payConfResp.data || {};
      setPayment(payConf.payment || payInit);
      setBooking(payConf.booking || primaryBooking);
      
      // Auto-download invoice after successful payment
      if (payConf.invoiceUrl) {
        const invoiceUrl = `http://localhost:5000${payConf.invoiceUrl}`;
        const link = document.createElement("a");
        link.href = invoiceUrl;
        link.download = `invoice-${primaryBooking.booking_id}.html`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (e) {
      console.error("Confirm & Pay error", e);
      setError(e.message || "Payment failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="ticket-bg-img">
        <div className="ticket-form-box">Loading seat map…</div>
      </div>
    );
  }

  if (error && !seatMap) {
    return (
      <div className="ticket-bg-img">
        <div className="ticket-form-box">
          <p style={{ color: "red" }}>{error}</p>
          <button className="search-btn" onClick={() => history.goBack()}>
            Back
          </button>
        </div>
      </div>
    );
  }

  // ✅ Fix: Helper to check if seat matches selected class (defined earlier, but needed here)
  // This will be defined before this code block, but we'll use it here
  const seatMatchesClass = (seat, targetClass) => {
    if (!targetClass) return true;
    const seatClassNorm = normalizeClass(seat.seat_class);
    return seatClassNorm === targetClass;
  };

  // ✅ Fix: Helper to check if seat matches selected class (define early for use in filtering)
  const seatMatchesSelectedClass = (seat) => {
    if (!selectedCabinClass) return true; // If no class selected, show all
    const seatClassNorm = normalizeClass(seat.seat_class);
    return seatClassNorm === selectedCabinClass;
  };

  // Organize seats by row and class
  const groupedByRow = {};
  const businessRows = [];
  const economyRows = [];

  if (seatMap && Array.isArray(seatMap.layout)) {
    seatMap.layout.forEach((s) => {
      if (!groupedByRow[s.row]) groupedByRow[s.row] = [];
      groupedByRow[s.row].push(s);
    });

    // Sort seats within each row: A, B, C, D, E, F
    Object.keys(groupedByRow).forEach((r) => {
      groupedByRow[r].sort((a, b) => {
        const seatOrder = { A: 0, B: 1, C: 2, D: 3, E: 4, F: 5 };
        return seatOrder[a.seat] - seatOrder[b.seat];
      });
    });

    // ✅ Fix: Separate business and economy rows - check if row has ANY seat of that class
    Object.keys(groupedByRow).forEach((rowNum) => {
      const rowSeats = groupedByRow[rowNum];
      const hasBusinessSeat = rowSeats.some(s => 
        s.seat_class && s.seat_class.toLowerCase().includes("business")
      );
      const hasEconomySeat = rowSeats.some(s => 
        s.seat_class && s.seat_class.toLowerCase().includes("economy")
      );
      
      if (hasBusinessSeat) {
        businessRows.push(Number(rowNum));
      }
      if (hasEconomySeat) {
        economyRows.push(Number(rowNum));
      }
    });

    businessRows.sort((a, b) => a - b);
    economyRows.sort((a, b) => a - b);
  }

  // ✅ Fix: Filter rows based on selected travel class - only show rows with matching seats
  const visibleBusinessRows =
    selectedCabinClass && selectedCabinClass !== "Business"
      ? []
      : businessRows;
  const visibleEconomyRows =
    selectedCabinClass && selectedCabinClass !== "Economy"
      ? []
      : economyRows;

  const hasConfirmed = booking && booking.PNR;

  // Helper to get seat color
  const getSeatColor = (seat) => {
    if (seat.status === "booked") return "#dc3545"; // Red - Unavailable
    if (seat.status === "held") return "#ffc107"; // Orange/Yellow - Held
    if (selectedSeat && selectedSeat.seat_no === seat.seat_no)
      return "#2e77ff"; // Blue - Selected
    // ✅ Fix: Grey out seats that don't match selected class
    if (!seatMatchesSelectedClass(seat)) return "#f5f5f5"; // Very light gray - Wrong class
    return "#e0e0e0"; // Light gray - Available
  };

  // Render a row of seats
  const renderSeatRow = (rowNum) => {
    const rowSeats = groupedByRow[rowNum] || [];
    // ✅ Fix: Filter seats by class - only show seats matching selected class
    const filteredSeats = rowSeats.filter(seatMatchesSelectedClass);
    const leftSeats = filteredSeats.filter((s) => ["A", "B", "C"].includes(s.seat));
    const rightSeats = filteredSeats.filter((s) => ["D", "E", "F"].includes(s.seat));

    return (
      <div
        key={rowNum}
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: "6px",
          position: "relative",
        }}
      >
        <div
          style={{
            width: "40px",
            fontWeight: "600",
            textAlign: "right",
            paddingRight: "10px",
            fontSize: "12px",
            color: "#555",
          }}
        >
          {rowNum}
        </div>

        {/* Left side seats (A, B, C) */}
        <div style={{ display: "flex", gap: "6px" }}>
          {leftSeats.map((s) => {
            const matchesClass = seatMatchesSelectedClass(s);
            const isDisabled = s.status === "booked" || !matchesClass;
            return (
            <button
              key={s.seat_no}
              type="button"
              onClick={() => handleSeatClick(s)}
                disabled={isDisabled}
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                border:
                  (selectedSeats.some(sel => sel.seat_no === s.seat_no) || (selectedSeat && selectedSeat.seat_no === s.seat_no))
                    ? "2px solid #2e77ff"
                    : "1px solid #ccc",
                backgroundColor: getSeatColor(s),
                  color: isDisabled ? "#999" : "#000",
                fontSize: "11px",
                fontWeight: "600",
                  cursor: isDisabled ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s",
                  opacity: isDisabled ? 0.5 : 1,
              }}
                title={
                  !matchesClass
                    ? `${s.seat_no} - ${s.seat_type} (${s.seat_class}) - Not available for ${selectedCabinClass} class`
                    : `${s.seat_no} - ${s.seat_type} (${s.seat_class})`
                }
            >
              {s.seat}
            </button>
            );
          })}
        </div>

        {/* Aisle */}
        <div
          style={{
            width: "30px",
            textAlign: "center",
            fontSize: "10px",
            color: "#999",
          }}
        >
          |
        </div>

        {/* Right side seats (D, E, F) */}
        <div style={{ display: "flex", gap: "6px" }}>
          {rightSeats.map((s) => {
            const matchesClass = seatMatchesSelectedClass(s);
            const isDisabled = s.status === "booked" || !matchesClass;
            return (
            <button
              key={s.seat_no}
              type="button"
              onClick={() => handleSeatClick(s)}
                disabled={isDisabled}
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                border:
                  (selectedSeats.some(sel => sel.seat_no === s.seat_no) || (selectedSeat && selectedSeat.seat_no === s.seat_no))
                    ? "2px solid #2e77ff"
                    : "1px solid #ccc",
                backgroundColor: getSeatColor(s),
                  color: isDisabled ? "#999" : "#000",
                fontSize: "11px",
                fontWeight: "600",
                  cursor: isDisabled ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s",
                  opacity: isDisabled ? 0.5 : 1,
              }}
                title={
                  !matchesClass
                    ? `${s.seat_no} - ${s.seat_type} (${s.seat_class}) - Not available for ${selectedCabinClass} class`
                    : `${s.seat_no} - ${s.seat_type} (${s.seat_class})`
                }
            >
              {s.seat}
            </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="ticket-bg-img">
      {/* Passenger Details Modal */}
      {showPassengerModal && currentSeatForPassenger && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={handlePassengerCancel}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "12px",
              padding: "24px",
              maxWidth: "400px",
              width: "90%",
              boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              style={{
                marginTop: 0,
                marginBottom: "16px",
                color: "#1a237e",
                fontSize: "18px",
              }}
            >
              Passenger Details for Seat {currentSeatForPassenger.seat_no}
            </h3>
            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "6px",
                  fontWeight: "600",
                  color: "#333",
                }}
              >
                Passenger Name *
              </label>
              <input
                type="text"
                value={passengerFormData.name}
                onChange={(e) =>
                  setPassengerFormData({
                    ...passengerFormData,
                    name: e.target.value,
                  })
                }
                placeholder="Enter passenger name"
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                  fontSize: "14px",
                }}
                autoFocus
              />
            </div>
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "6px",
                  fontWeight: "600",
                  color: "#333",
                }}
              >
                Age * (5-80)
              </label>
              <input
                type="number"
                value={passengerFormData.age}
                onChange={(e) => {
                  const value = e.target.value;
                  // Only allow numbers and empty string
                  if (value === "" || /^\d+$/.test(value)) {
                    const numValue = value === "" ? "" : parseInt(value);
                    // Limit to valid age range
                    if (value === "" || (numValue >= 1 && numValue <= 120)) {
                      setPassengerFormData({
                        ...passengerFormData,
                        age: value,
                      });
                    }
                  }
                }}
                placeholder="Enter age (5-80)"
                min="1"
                max="120"
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                  fontSize: "14px",
                }}
              />
              {passengerFormData.age && (parseInt(passengerFormData.age) < 1 || parseInt(passengerFormData.age) > 120) && (
                <p style={{ color: "red", fontSize: "12px", marginTop: "4px" }}>
                  Age must be between 5 and 80
                </p>
              )}
            </div>
            <div
              style={{
                display: "flex",
                gap: "10px",
                justifyContent: "flex-end",
              }}
            >
              <button
                type="button"
                onClick={handlePassengerCancel}
                style={{
                  padding: "10px 20px",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                  background: "#f5f5f5",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePassengerSubmit}
                style={{
                  padding: "10px 20px",
                  borderRadius: "6px",
                  border: "none",
                  background: "#1a237e",
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "600",
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      <button className="back-btn" onClick={() => history.goBack()}>
        ⬅ Back
      </button>

      <div
        className="ticket-form-box"
        style={{
          maxWidth: "1100px",
          padding: "20px",
          borderRadius: "12px",
          boxShadow: "0 4px 18px rgba(0,0,0,0.08)",
        }}
      >
        {/* Top flight summary like MakeMyTrip */}
        {flight && (
          <div
            style={{
              marginBottom: "1.2rem",
              padding: "12px 16px",
              background: "#f5f7fb",
              borderRadius: "10px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#222",
                  marginBottom: "2px",
                }}
              >
                Flight {flight.flight_no} {flight.airline || ""}
              </div>
              <div style={{ fontSize: "12px", color: "#555" }}>
                {flight.from_airport || ""} → {flight.to_airport || ""}
              </div>
              {search && (
                <div style={{ fontSize: "12px", color: "#777", marginTop: 4 }}>
                  {flight.departure_time.split(" ")[0]} •{" "}
                  {selectedCabinClass || search.class || "Economy"}
                </div>
              )}
            </div>
            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  fontSize: "12px",
                  color: "#999",
                }}
              >
                Base Fare
              </div>
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: "700",
                  color: "#1a237e",
                }}
              >
                ₹ {displayFare}
              </div>
              <div style={{ fontSize: "11px", color: "#777" }}>
                per adult (incl. class)
              </div>
            </div>
          </div>
        )}

        {/* Main content: left seat map, right fare + payment */}
        <div
          style={{
            display: "flex",
            gap: "20px",
            flexWrap: "wrap",
          }}
        >
          {/* LEFT: Seat map */}
          <div
            style={{
              flex: "2 1 380px",
              background: "#ffffff",
              borderRadius: "10px",
              border: "1px solid #e2e2e2",
              padding: "16px",
            }}
          >
            <h2
              style={{
                fontSize: "16px",
                fontWeight: "600",
                marginBottom: "10px",
                color: "#1a237e",
              }}
            >
              Select your seat
            </h2>

            {/* Legend */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "12px",
                marginBottom: "12px",
                padding: "8px 10px",
                background: "#f5f5f5",
                borderRadius: "8px",
                fontSize: "11px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div
                  style={{
                    width: 16,
                    height: 16,
                    background: "#2e77ff",
                    borderRadius: 4,
                    border: "1px solid #b0bec5",
                  }}
                />
                <span>Selected</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div
                  style={{
                    width: 16,
                    height: 16,
                    background: "#e0e0e0",
                    borderRadius: 4,
                    border: "1px solid #b0bec5",
                  }}
                />
                <span>Available</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div
                  style={{
                    width: 16,
                    height: 16,
                    background: "#ffc107",
                    borderRadius: 4,
                    border: "1px solid #b0bec5",
                  }}
                />
                <span>Held</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div
                  style={{
                    width: 16,
                    height: 16,
                    background: "#dc3545",
                    borderRadius: 4,
                    border: "1px solid #b0bec5",
                  }}
                />
                <span>Booked</span>
              </div>
            </div>

            {/* Airplane Seat Map */}
            <div
              style={{
                background: "#fafafa",
                borderRadius: "10px",
                border: "1px solid #e0e0e0",
                padding: "16px 10px",
                position: "relative",
                overflowX: "auto",
              }}
            >
              <div
                style={{
                  textAlign: "center",
                  marginBottom: "10px",
                  fontSize: "11px",
                  color: "#777",
                  fontWeight: "600",
                }}
              >
                ↑ Front of Aircraft
              </div>

              {/* BUSINESS CLASS SECTION */}
              {selectedCabinClass === "Business" &&
                visibleBusinessRows.length > 0 && (
                  <div style={{ marginBottom: "20px" }}>
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: "bold",
                        marginBottom: "10px",
                        color: "#007bff",
                        paddingBottom: "5px",
                        borderBottom: "2px solid #007bff",
                      }}
                    >
                      Business Class
                    </div>

                    {visibleBusinessRows.map((rowNum) =>
                      renderSeatRow(rowNum)
                    )}

                    <div
                      style={{
                        textAlign: "center",
                        marginTop: "10px",
                        fontSize: "11px",
                        color: "#dc3545",
                        fontWeight: "bold",
                      }}
                    >
                      EXIT
                    </div>
                  </div>
                )}

              {/* ECONOMY CLASS SECTION */}
              {selectedCabinClass === "Economy" &&
                visibleEconomyRows.length > 0 && (
                  <div>
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: "600",
                        marginBottom: "8px",
                        color: "#1b5e20",
                        paddingBottom: "4px",
                        borderBottom: "2px solid #1b5e20",
                      }}
                    >
                      Economy Class
                    </div>
                    {visibleEconomyRows.map((rowNum) => renderSeatRow(rowNum))}
                    <div
                      style={{
                        textAlign: "center",
                        marginTop: "8px",
                        fontSize: "10px",
                        color: "#d32f2f",
                        fontWeight: "600",
                      }}
                    >
                      EXIT
                    </div>
                  </div>
                )}

              {/* Fallback: if for some reason no class detected, show all */}
              {!selectedCabinClass && (
                <div>
                  {businessRows.length > 0 && (
                    <>
                      <div
                        style={{
                          fontSize: "14px",
                          fontWeight: "bold",
                          marginBottom: "10px",
                          color: "#007bff",
                          paddingBottom: "5px",
                          borderBottom: "2px solid #007bff",
                        }}
                      >
                        Business Class
                      </div>
                      {businessRows.map((rowNum) => renderSeatRow(rowNum))}
                    </>
                  )}
                  {economyRows.length > 0 && (
                    <>
                      <div
                        style={{
                          fontSize: "13px",
                          fontWeight: "600",
                          margin: "12px 0 8px",
                          color: "#1b5e20",
                          paddingBottom: "4px",
                          borderBottom: "2px solid #1b5e20",
                        }}
                      >
                        Economy Class
                      </div>
                      {economyRows.map((rowNum) => renderSeatRow(rowNum))}
                    </>
                  )}
                </div>
              )}

              {/* Seat labels at bottom */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "40px",
                  marginTop: "12px",
                  fontSize: "10px",
                  color: "#666",
                  fontWeight: "600",
                }}
              >
                <div>A</div>
                <div>B</div>
                <div>C</div>
                <div>D</div>
                <div>E</div>
                <div>F</div>
              </div>
            </div>
          </div>

          {/* RIGHT: Fare summary & payment */}
          <div
            style={{
              flex: "1 1 280px",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
            }}
          >
            {!hasConfirmed && (
              <>
                {/* Selected seat info + fare */}
                <div
                  style={{
                    background: "#f5f7fb",
                    borderRadius: "10px",
                    padding: "12px 14px",
                    border: "1px solid #e0e0e0",
                    fontSize: "13px",
                  }}
                >
                  <div
                    style={{
                      fontWeight: "600",
                      marginBottom: "6px",
                      color: "#1a237e",
                    }}
                  >
                    Trip Summary
                  </div>
                  <div style={{ marginBottom: "4px" }}>
                    <strong>Cabin:</strong>{" "}
                    {selectedCabinClass || search?.class || "Economy"}
                  </div>
                  <div style={{ marginBottom: "4px" }}>
                    <strong>Seat{selectedSeats.length !== 1 ? 's' : ''}:</strong>{" "}
                    {selectedSeats.length > 0 ? (
                      <>
                        {selectedSeats.map((s, idx) => {
                          const passenger = passengerDetails[s.seat_no];
                          return (
                            <div key={s.seat_no} style={{ marginBottom: "4px", fontSize: "12px" }}>
                              <span>
                                {s.seat_no}{idx < selectedSeats.length - 1 ? ',' : ''}
                                {passenger && ` - ${passenger.name} (Age: ${passenger.age})`}
                              </span>
                            </div>
                          );
                        })}
                        {selectedSeats.length === 1 && (
                          <> ({selectedSeats[0].seat_type}, {selectedSeats[0].seat_class})</>
                        )}
                      </>
                    ) : selectedSeat ? (
                      <>
                        {selectedSeat.seat_no} ({selectedSeat.seat_type},{" "}
                        {selectedSeat.seat_class})
                      </>
                    ) : (
                      <span style={{ color: "#999" }}>
                        No seat selected yet
                      </span>
                    )}
                  </div>
                  
                  {/* NEW: Discount Breakdown */}
                  {priceBreakdown && selectedSeats.length > 0 && (
                    <div style={{ 
                      marginTop: "12px", 
                      padding: "10px", 
                      background: "#f5f5f5", 
                      borderRadius: "6px",
                      fontSize: "12px"
                    }}>
                      <div style={{ marginBottom: "6px", fontWeight: "600", color: "#1a237e" }}>
                        Price Breakdown
                      </div>
                      <div style={{ marginBottom: "4px" }}>
                        Base ({selectedSeats.length} × ₹{displayFare.toLocaleString()}): 
                        <span style={{ float: "right" }}>₹{(priceBreakdown.baseTotal || displayFare * selectedSeats.length).toLocaleString()}</span>
                      </div>
                      {priceBreakdown.quantityDiscount && priceBreakdown.quantityDiscount.applied && (
                        <div style={{ marginBottom: "4px", color: "#28a745" }}>
                          Quantity Discount ({priceBreakdown.quantityDiscount.percent}%): 
                          <span style={{ float: "right" }}>-₹{priceBreakdown.quantityDiscount.amount.toLocaleString()}</span>
                        </div>
                      )}
                      {priceBreakdown.tierDiscount && priceBreakdown.tierDiscount.applied && (
                        <div style={{ marginBottom: "4px", color: "#ffc107" }}>
                          {priceBreakdown.tierDiscount.tier} Tier Discount ({priceBreakdown.tierDiscount.percent}%): 
                          <span style={{ float: "right" }}>-₹{priceBreakdown.tierDiscount.amount.toLocaleString()}</span>
                        </div>
                      )}
                      {priceBreakdown.advanceDiscount && priceBreakdown.advanceDiscount.applied && (
                        <div style={{ marginBottom: "4px", color: "#17a2b8" }}>
                          Advance Booking Discount ({priceBreakdown.advanceDiscount.percent}%): 
                          <span style={{ float: "right" }}>-₹{priceBreakdown.advanceDiscount.amount.toLocaleString()}</span>
                        </div>
                      )}
                      <div style={{ 
                        marginTop: "8px", 
                        paddingTop: "8px", 
                        borderTop: "1px solid #ddd",
                        fontWeight: "600",
                        fontSize: "14px"
                      }}>
                        Total Amount: 
                        <span style={{ float: "right", color: "#1a237e" }}>
                          ₹{(priceBreakdown.finalTotal || displayFare * selectedSeats.length).toLocaleString()}
                        </span>
                      </div>
                      {priceBreakdown.savings > 0 && (
                        <div style={{ marginTop: "4px", color: "#28a745", fontSize: "11px" }}>
                          You save: ₹{priceBreakdown.savings.toLocaleString()} {priceBreakdown.totalDiscountPercent && `(${priceBreakdown.totalDiscountPercent.toFixed(1)}%)`}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Fallback: Show simple fare if no discount breakdown */}
                  {!priceBreakdown && (
                    <div>
                      <strong>Fare:</strong>{" "}
                      <span style={{ fontSize: "16px", fontWeight: "700" }}>
                        ₹ {selectedSeats.length > 0 ? (displayFare * selectedSeats.length).toLocaleString() : displayFare.toLocaleString()}
                      </span>
                      <span style={{ fontSize: "11px", color: "#777" }}>
                        {" "}
                        {selectedSeats.length > 1 ? ` (${selectedSeats.length} seats)` : '/ adult'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Payment Method */}
                <div
                  style={{
                    background: "#ffffff",
                    borderRadius: "10px",
                    padding: "12px 14px",
                    border: "1px solid #e0e0e0",
                    fontSize: "13px",
                  }}
                >
                  <div
                    style={{
                      fontWeight: "600",
                      marginBottom: "8px",
                      color: "#1a237e",
                    }}
                  >
                    Payment Method
                  </div>
                  <select
                    value={method}
                    onChange={(e) => handlePaymentMethodChange(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px",
                      borderRadius: "6px",
                      border: "1px solid #c5cae9",
                      fontSize: "13px",
                    }}
                  >
                    <option value="UPI">UPI</option>
                    <option value="Card">Card</option>
                    <option value="NetBanking">NetBanking</option>
                    <option value="Wallet">Wallet</option>
                  </select>

                  {/* Info boxes */}
                  {method === "UPI" && !showPaymentForm && (
                    <p
                      style={{
                        marginTop: "8px",
                        fontSize: "12px",
                        color: "#555",
                      }}
                    >
                      You will be redirected to your UPI app for payment
                      confirmation.
                    </p>
                  )}
                  {method === "NetBanking" && !showPaymentForm && (
                    <p
                      style={{
                        marginTop: "8px",
                        fontSize: "12px",
                        color: "#555",
                      }}
                    >
                      You will be redirected to your bank's NetBanking gateway.
                    </p>
                  )}
                  {method === "Wallet" && !showPaymentForm && (
                    <p
                      style={{
                        marginTop: "8px",
                        fontSize: "12px",
                        color: "#555",
                      }}
                    >
                      You will be redirected to your wallet provider.
                    </p>
                  )}
                </div>

                {/* Card payment form */}
                {showPaymentForm && method === "Card" && (
                  <div
                    style={{
                      background: "#ffffff",
                      borderRadius: "10px",
                      padding: "12px 14px",
                      border: "1px solid #e0e0e0",
                      fontSize: "13px",
                    }}
                  >
                    <div
                      style={{
                        fontWeight: "600",
                        marginBottom: "8px",
                        color: "#1a237e",
                      }}
                    >
                      Card Details
                    </div>

                    <div className="row" style={{ marginBottom: "0.5rem" }}>
                      <div className="field">
                        <label>Card Number</label>
                        <input
                          type="text"
                          placeholder="4111 1111 1111 1111"
                          maxLength="19"
                          value={cardDetails.cardNumber}
                          onChange={(e) =>
                            setCardDetails({
                              ...cardDetails,
                              cardNumber: formatCardNumber(e.target.value),
                            })
                          }
                          style={{ width: "100%" }}
                        />
                        {cardErrors.cardNumber && (
                          <p
                            style={{
                              color: "red",
                              fontSize: "11px",
                              marginTop: "4px",
                            }}
                          >
                            {cardErrors.cardNumber}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="row" style={{ marginBottom: "0.5rem" }}>
                      <div className="field">
                        <label>Cardholder Name</label>
                        <input
                          type="text"
                          placeholder="ARIN JAIN"
                          value={cardDetails.cardHolder}
                          onChange={(e) =>
                            setCardDetails({
                              ...cardDetails,
                              cardHolder: e.target.value.toUpperCase(),
                            })
                          }
                          style={{ width: "100%" }}
                        />
                        {cardErrors.cardHolder && (
                          <p
                            style={{
                              color: "red",
                              fontSize: "11px",
                              marginTop: "4px",
                            }}
                          >
                            {cardErrors.cardHolder}
                          </p>
                        )}
                      </div>
                    </div>

                    <div
                      className="row"
                      style={{
                        marginBottom: "0.5rem",
                        display: "flex",
                        gap: "8px",
                      }}
                    >
                      <div className="field" style={{ flex: 1 }}>
                        <label>Expiry Month</label>
                        <select
                          value={cardDetails.expiryMonth}
                          onChange={(e) =>
                            setCardDetails({
                              ...cardDetails,
                              expiryMonth: e.target.value,
                            })
                          }
                          style={{ width: "100%" }}
                        >
                          <option value="">MM</option>
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(
                            (m) => (
                              <option key={m} value={m}>
                                {String(m).padStart(2, "0")}
                              </option>
                            )
                          )}
                        </select>
                        {cardErrors.expiryMonth && (
                          <p
                            style={{
                              color: "red",
                              fontSize: "11px",
                              marginTop: "4px",
                            }}
                          >
                            {cardErrors.expiryMonth}
                          </p>
                        )}
                      </div>
                      <div className="field" style={{ flex: 1 }}>
                        <label>Expiry Year</label>
                        <select
                          value={cardDetails.expiryYear}
                          onChange={(e) =>
                            setCardDetails({
                              ...cardDetails,
                              expiryYear: e.target.value,
                            })
                          }
                          style={{ width: "100%" }}
                        >
                          <option value="">YYYY</option>
                          {Array.from(
                            { length: 2050 - new Date().getFullYear() + 1 },
                            (_, i) => new Date().getFullYear() + i
                          ).map((y) => (
                            <option key={y} value={y}>
                              {y}
                            </option>
                          ))}
                        </select>
                        {cardErrors.expiryYear && (
                          <p
                            style={{
                              color: "red",
                              fontSize: "11px",
                              marginTop: "4px",
                            }}
                          >
                            {cardErrors.expiryYear}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="row" style={{ marginBottom: "0.5rem" }}>
                      <div className="field">
                        <label>CVV</label>
                        <input
                          type="password"
                          placeholder="123"
                          maxLength="4"
                          value={cardDetails.cvv}
                          onChange={(e) =>
                            setCardDetails({
                              ...cardDetails,
                              cvv: e.target.value.replace(/\D/g, ""),
                            })
                          }
                          style={{ width: "100%" }}
                        />
                        {cardErrors.cvv && (
                          <p
                            style={{
                              color: "red",
                              fontSize: "11px",
                              marginTop: "4px",
                            }}
                          >
                            {cardErrors.cvv}
                          </p>
                        )}
                      </div>
                    </div>

                    {cardErrors._global && (
                      <p
                        style={{
                          whiteSpace: "pre-line",
                          color: "red",
                          fontSize: "11px",
                          marginTop: "4px",
                        }}
                      >
                        {cardErrors._global}
                      </p>
                    )}

                    <div
                      style={{
                        display: "flex",
                        gap: "10px",
                        marginTop: "10px",
                      }}
                    >
                      <button
                        type="button"
                        className="search-btn"
                        onClick={() => {
                          setShowPaymentForm(false);
                          setCardErrors({});
                        }}
                        style={{
                          flex: 1,
                          background: "#9e9e9e",
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="search-btn"
                        onClick={() => {
                          if (validateCardDetails()) {
                            handleConfirmAndPay();
                          }
                        }}
                        style={{ flex: 1 }}
                      >
                        Pay securely
                      </button>
                    </div>
                  </div>
                )}

                {/* Main CTA button (for non-card or before card form) */}
                {!showPaymentForm && (
                  <button
                    type="button"
                    className="search-btn"
                    disabled={processing || selectedSeats.length === 0 || 
                      selectedSeats.some(s => !passengerDetails[s.seat_no] || !passengerDetails[s.seat_no].name)}
                    onClick={handleConfirmAndPayClick}
                    style={{ width: "100%", marginTop: "6px" }}
                  >
                    {processing
                      ? "Processing..."
                      : selectedSeats.some(s => !passengerDetails[s.seat_no] || !passengerDetails[s.seat_no].name)
                        ? "Please add passenger details for all seats"
                        : selectedSeats.length > 1 
                          ? `Confirm ${selectedSeats.length} Seats & Proceed to Pay`
                          : "Confirm Seat & Proceed to Pay"}
                  </button>
                )}

                {error && (
                  <p
                    style={{
                      color: "red",
                      fontSize: "12px",
                      marginTop: "6px",
                    }}
                  >
                    {error}
                  </p>
                )}
              </>
            )}

            {/* Booking confirmed block */}
            {hasConfirmed && (
              <div
                style={{
                  marginTop: "1rem",
                  textAlign: "left",
                  padding: "16px",
                  background: "#e8f5e9",
                  borderRadius: "10px",
                  border: "1px solid #c8e6c9",
                  fontSize: "13px",
                }}
              >
                <h3
                  style={{
                    color: "#2e7d32",
                    marginBottom: "10px",
                    fontSize: "16px",
                  }}
                >
                  ✓ Booking Confirmed
                </h3>
                <p>
                  <strong>PNR:</strong> {booking.PNR}
                </p>
                <p>
                  <strong>Booking ID:</strong> {booking.booking_id}
                </p>
                <p>
                  <strong>Seat{selectedSeats.length !== 1 ? 's' : ''}:</strong>{" "}
                    {selectedSeats.length > 0 ? (
                      <>
                        {selectedSeats.map((s, idx) => {
                          const passenger = passengerDetails[s.seat_no];
                          return (
                            <div key={s.seat_no} style={{ marginBottom: "4px", fontSize: "12px" }}>
                              <span>
                                {s.seat_no}{idx < selectedSeats.length - 1 ? ',' : ''}
                                {passenger && ` - ${passenger.name} (Age: ${passenger.age})`}
                              </span>
                            </div>
                          );
                        })}
                        {selectedSeats.length === 1 && (
                          <> ({selectedSeats[0].seat_type}, {selectedSeats[0].seat_class})</>
                        )}
                      </>
                    ) : selectedSeat ? (
                      <>
                        {selectedSeat.seat_no} ({selectedSeat.seat_type},{" "}
                        {selectedSeat.seat_class})
                      </>
                    ) : (
                      <span style={{ color: "#999" }}>
                        No seat selected yet
                      </span>
                    )}
                </p>
                <p>
                  <strong>Class:</strong> {booking.seat_class || "N/A"}
                </p>
                <p>
                  <strong>Status:</strong> {booking.booking_status}
                </p>
                {payment && (
                  <p>
                    <strong>Payment:</strong> {payment.payment_status} via{" "}
                    {payment.method} (₹ {payment.amount})
                  </p>
                )}
                <button
                  type="button"
                  className="search-btn"
                  style={{ marginTop: "12px", width: "100%" }}
                  onClick={() => history.push(`/CustomerPanel/${clientId}`)}
                >
                  Go to Customer Panel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatSelection;