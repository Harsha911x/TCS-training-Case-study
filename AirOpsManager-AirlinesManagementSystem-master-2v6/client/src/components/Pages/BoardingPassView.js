// import React, { useEffect, useState } from "react";
// import { useParams, useHistory } from "react-router-dom";
// import Axios from "axios";
// import "./styles/BoardingPass.css";

// const BoardingPassView = () => {
//   const { booking_id } = useParams();
//   const history = useHistory();
//   const [boardingPass, setBoardingPass] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     async function loadBoardingPass() {
//       try {
//         const resp = await Axios.get(`http://localhost:5000/boardingpass/${booking_id}`);
//         setBoardingPass(resp.data);
//       } catch (e) {
//         console.error("Boarding pass error", e);
//         setError("Unable to load boarding pass. Please try again.");
//       } finally {
//         setLoading(false);
//       }
//     }
//     loadBoardingPass();
//   }, [booking_id]);

//   const formatDateTime = (datetimeStr) => {
//     if (!datetimeStr) return { date: "", time: "" };
//     try {
//       // Handle format: "2025-12-06 08:00:00"
//       const dt = new Date(datetimeStr.replace(' ', 'T'));
//       if (isNaN(dt.getTime())) {
//         // Try alternative parsing
//         const parts = datetimeStr.split(' ');
//         const dateParts = parts[0].split('-');
//         const timeParts = parts[1] ? parts[1].split(':') : ['00', '00', '00'];
//         const dt2 = new Date(Date.UTC(
//           parseInt(dateParts[0]),
//           parseInt(dateParts[1]) - 1,
//           parseInt(dateParts[2]),
//           parseInt(timeParts[0]),
//           parseInt(timeParts[1]),
//           parseInt(timeParts[2])
//         ));
//         const date = dt2.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
//         const time = dt2.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
//         return { date, time };
//       }
//       const date = dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
//       const time = dt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
//       return { date, time };
//     } catch (e) {
//       return { date: datetimeStr.split(' ')[0] || "", time: datetimeStr.split(' ')[1] || "" };
//     }
//   };

//   const handleDownload = () => {
//     window.print();
//   };

//   if (loading) {
//     return <div className="boarding-pass-container"><div className="boarding-pass-box">Loading boarding pass…</div></div>;
//   }

//   if (error || !boardingPass) {
//     return (
//       <div className="boarding-pass-container">
//         <div className="boarding-pass-box">
//           <p style={{ color: "red" }}>{error || "Boarding pass not found"}</p>
//           <button className="search-btn" onClick={() => history.goBack()}>Back</button>
//         </div>
//       </div>
//     );
//   }

//   const depDateTime = formatDateTime(boardingPass.departure_time);
//   const arrDateTime = formatDateTime(boardingPass.arrival_time);
//   const boardDateTime = formatDateTime(boardingPass.boarding_time);

//   return (
//     <div className="boarding-pass-container">
//       <button className="back-btn" onClick={() => history.goBack()}>
//         ⬅ Back
//       </button>

//       <div className="boarding-pass-wrapper" id="boarding-pass-content">
//         <div className="boarding-pass">
//           {/* Header */}
//           <div className="bp-header">
//             <div className="bp-airline">{boardingPass.airline || "AIRLINE"}</div>
//             <div className="bp-pnr">
//               <div className="bp-label">PNR</div>
//               <div className="bp-value-large">{boardingPass.PNR}</div>
//             </div>
//           </div>

//           {/* Main Content */}
//           <div className="bp-content">
//             {/* Passenger Info */}
//             <div className="bp-section">
//               <div className="bp-field">
//                 <div className="bp-label">PASSENGER</div>
//                 <div className="bp-value">{boardingPass.passenger_name}</div>
//               </div>
//               <div className="bp-field">
//                 <div className="bp-label">FLIGHT</div>
//                 <div className="bp-value">{boardingPass.flight_no}</div>
//               </div>
//             </div>

//             {/* Route */}
//             <div className="bp-section bp-route">
//               <div className="bp-route-item">
//                 <div className="bp-label">FROM</div>
//                 <div className="bp-value-large">{boardingPass.from_airport}</div>
//                 <div className="bp-city">{boardingPass.from_city}</div>
//                 <div className="bp-airport-name">{boardingPass.from_airport_name}</div>
//               </div>
//               <div className="bp-arrow">→</div>
//               <div className="bp-route-item">
//                 <div className="bp-label">TO</div>
//                 <div className="bp-value-large">{boardingPass.to_airport}</div>
//                 <div className="bp-city">{boardingPass.to_city}</div>
//                 <div className="bp-airport-name">{boardingPass.to_airport_name}</div>
//               </div>
//             </div>

//             {/* Flight Details */}
//             <div className="bp-section bp-details">
//               <div className="bp-detail-item">
//                 <div className="bp-label">DEPARTURE</div>
//                 <div className="bp-value">{depDateTime.time}</div>
//                 <div className="bp-date">{depDateTime.date}</div>
//               </div>
//               <div className="bp-detail-item">
//                 <div className="bp-label">ARRIVAL</div>
//                 <div className="bp-value">{arrDateTime.time}</div>
//                 <div className="bp-date">{arrDateTime.date}</div>
//               </div>
//               <div className="bp-detail-item">
//                 <div className="bp-label">BOARDING</div>
//                 <div className="bp-value">{boardDateTime.time}</div>
//                 <div className="bp-date">{boardDateTime.date}</div>
//               </div>
//             </div>

//             {/* Seat & Gate */}
//             <div className="bp-section bp-seat-gate">
//               <div className="bp-seat">
//                 <div className="bp-label">SEAT</div>
//                 <div className="bp-value-xlarge">{boardingPass.seat_no}</div>
//               </div>
//               <div className="bp-gate">
//                 <div className="bp-label">GATE</div>
//                 <div className="bp-value-xlarge">{boardingPass.gate}</div>
//               </div>
//             </div>
//           </div>

//           {/* Footer */}
//           <div className="bp-footer">
//             <div className="bp-barcode">
//               <div className="bp-barcode-text">{boardingPass.PNR}</div>
//             </div>
//             <div className="bp-status">{boardingPass.booking_status?.toUpperCase() || "CONFIRMED"}</div>
//           </div>
//         </div>
//       </div>

//       {/* Action Buttons */}
//       <div className="bp-actions">
//         <button className="search-btn" onClick={handleDownload} style={{ marginRight: "10px" }}>
//           📄 Download / Print
//         </button>
//         <button className="search-btn" onClick={() => history.goBack()} style={{ background: "#6c757d" }}>
//           Close
//         </button>
//       </div>
//     </div>
//   );
// };

// export default BoardingPassView;

import React, { useEffect, useState } from "react";
import { useParams, useHistory } from "react-router-dom";
import Axios from "axios";
import "./styles/BoardingPass.css";

import "../../images/logo.png"

const BoardingPassView = () => {
  const { booking_id } = useParams();
  const history = useHistory();
  const [boardingPass, setBoardingPass] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadBoardingPass() {
      try {
        const resp = await Axios.get(`http://localhost:5000/boardingpass/${booking_id}`);
        setBoardingPass(resp.data);
      } catch (e) {
        console.error("Boarding pass error", e);
        setError("Unable to load boarding pass. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    loadBoardingPass();
  }, [booking_id]);

  const formatDateTime = (datetimeStr) => {
    if (!datetimeStr) return { date: "", time: "" };
    try {
      const dt = new Date(datetimeStr.replace(" ", "T"));
      const date = dt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
      const time = dt.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
      return { date, time };
    } catch {
      return { date: "", time: "" };
    }
  };

  const handleDownload = () => window.print();

  if (loading) return <div className="bp-loading">Loading boarding pass…</div>;

  if (error || !boardingPass) {
    return (
      <div className="bp-error">
        <p>{error || "Boarding pass not found"}</p>
        <button onClick={() => history.goBack()}>Back</button>
      </div>
    );
  }

  const dep = formatDateTime(boardingPass.departure_time);
  const arr = formatDateTime(boardingPass.arrival_time);
  const board = formatDateTime(boardingPass.boarding_time);

  return (
    <div className="bp-container">

      <button className="bp-back-btn" onClick={() => history.goBack()}>
        ⬅ Back
      </button>

      <div className="boarding-card" >

        {/* LEFT MAIN TICKET */}
        <div className="ticket-left" >
          <div className="bp-header">
            <div className="bp-logo"></div>
            {/* <img src="../../images/logo.png" alt="logo" className="bp-logo" /> */}
            <h2>StarJet Airlines</h2>
          </div>

          <div className="bp-section">
            <div>
              <label>Passenger</label>
              <p>{boardingPass.passenger_name}</p>
            </div>
            <div>
              <label>Flight</label>
              <p>{boardingPass.flight_no}</p>
            </div>
          </div>

          <div className="bp-route">
            <div>
              <label>From</label>
              <h1>{boardingPass.from_airport}</h1>
              <span>{boardingPass.from_city}</span>
              <p className="airport-name">{boardingPass.from_airport_name}</p>
            </div>
            <div className="bp-arrow">✈</div>
            <div>
              <label>To</label>
              <h1>{boardingPass.to_airport}</h1>
              <span>{boardingPass.to_city}</span>
              <p className="airport-name">{boardingPass.to_airport_name}</p>
            </div>
          </div>

          <div className="bp-details">
            <div>
              <label>Departure</label>
              <p className="big">{dep.time}</p>
              <span>{dep.date}</span>
            </div>
            <div>
              <label>Arrival</label>
              <p className="big">{arr.time}</p>
              <span>{arr.date}</span>
            </div>
            <div>
              <label>Boarding</label>
              <p className="big">{board.time}</p>
              <span>{board.date}</span>
            </div>
          </div>

          <div className="bp-seat-gate">
            <div>
              <label>Seat</label>
              <h2>{boardingPass.seat_no}</h2>
            </div>
            <div>
              <label>Gate</label>
              <h2>{boardingPass.gate}</h2>
            </div>
          </div>
        </div>

        {/* RIGHT SMALL TICKET (tear part) */}
        <div className="ticket-right">
          <div className="bp-small-header">
            {/* <img src="../../../images/logo.png" alt="logo" className="bp-logo-small" /> */}
            <div className="bp-logo-small"></div>
            <p>StarJet Airlines</p>
          </div>

          <div className="bp-small-info">
            <label>PNR</label>
            <p className="big">{boardingPass.PNR}</p>

            <label>Seat</label>
            <p>{boardingPass.seat_no}</p>

            <label>Gate</label>
            <p>{boardingPass.gate}</p>

            <label>Flight</label>
            <p>{boardingPass.flight_no}</p>
          </div>

          <div className="bp-barcode">
            <span>{boardingPass.PNR}</span>
          </div>

          {/* STATUS BADGE */}
          <div className={`bp-status ${boardingPass.booking_status?.toLowerCase()}`}>
            {boardingPass.booking_status?.toUpperCase()}
          </div>

        </div>

      </div>

      <div className="bp-actions">
        <button onClick={handleDownload}>📄 Download / Print</button>
        <button onClick={() => history.goBack()} className="close">Close</button>
      </div>

    </div>
  );
};

export default BoardingPassView;
