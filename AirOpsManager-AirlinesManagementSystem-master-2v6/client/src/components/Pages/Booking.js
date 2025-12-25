import React, { useState, useEffect, useMemo } from "react";
import Axios from "axios";
import Sidebar from "./Sidebar";
import { toast } from "react-toastify";

import "./styles/Tables.css";

export default function Booking() {
  const [bookings, setBookings] = useState([]);
  const [clients, setClients] = useState([]);
  const [flights, setFlights] = useState([]);
  const [airports, setAirports] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [selectedRefund, setSelectedRefund] = useState(null);

  // UI state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [airlineFilter, setAirlineFilter] = useState("");
  const [fromAirportFilter, setFromAirportFilter] = useState("");
  const [toAirportFilter, setToAirportFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [fareMin, setFareMin] = useState("");
  const [fareMax, setFareMax] = useState("");

  const [sortField, setSortField] = useState("date");
  const [sortDir, setSortDir] = useState("asc");

  const [page, setPage] = useState(1);
  const pageSize = 10;

  // NEW: Advanced filters collapsible
  const [showFilters, setShowFilters] = useState(false);

  // ----------- LOAD DATA FROM BACKEND -----------
  useEffect(() => {
    const loadAll = async () => {
      try {
        const [
          bookingRes,
          clientRes,
          flightRes,
          airportRes,
          scheduleRes,
        ] = await Promise.all([
          Axios.get("http://localhost:5000/booking/api/get"),
          Axios.get("http://localhost:5000/api/get"),
          Axios.get("http://localhost:5000/flight/api/get"),
          Axios.get("http://localhost:5000/airport/api/get"),
          Axios.get("http://localhost:5000/schedule/api/get"),
        ]);

        setBookings(bookingRes.data || []);
        setClients(clientRes.data || []);
        setFlights(flightRes.data || []);
        setAirports(airportRes.data || []);
        setSchedules(scheduleRes.data || []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load booking data");
      }
    };

    loadAll();
  }, []);

  // ----------- HELPER MAPS -----------
  const n = (v) => Number(v ?? 0);

  const getPerSeatDiscount = (totalDiscount, seats) =>
    Number((n(totalDiscount) / n(seats || 1)).toFixed(2));


  const getInvoiceType = (r) => {

    if (r.status.toLowerCase() === "confirmed") return "PAID";
    if (r.status.toLowerCase() === "cancelled" && r.refund_amount > 0) return "REFUNDED";
    return null;
  };

  const getSeatCount = (r) => Number(r.seat_count) > 1 ? Number(r.seat_count) : 1;

  const getPerSeatFare = (r) => {
    const total = Number(r.final_total ?? r.fares ?? 0);
    const seats = getSeatCount(r);
    return Number((total / seats).toFixed(2));
  };

  const getPerSeatRefund = (r) => {
    const total = Number(r.refund_amount ?? 0);
    const seats = getSeatCount(r);
    return Number((total / seats).toFixed(2));
  };

  const getPerSeatCancellation = (r) => {
    const total = Number(r.cancellation_charge_amount ?? 0);
    const seats = getSeatCount(r);
    return Number((total / seats).toFixed(2));
  };


  const formatINR = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount);


  const airlineLogos = {
    "IndiGo": require("../../images/IndiGo.png"),
    "Air India": require("../../images/AirIndia.png"),
    "Vistara": require("../../images/Vistara.png"),
    "SpiceJet": require("../../images/SpiceJet.png"),
    "Akasa Air": require("../../images/Akasa.png"),
    "Go First": require("../../images/gofirst.png"),
  };
  const imageToBase64 = (imgSrc) =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        canvas.getContext("2d").drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      };
      img.onerror = reject;
      img.src = imgSrc;
    });

  const clientMap = useMemo(() => {
    const m = {};
    clients.forEach((c) => {
      m[Number(c.client_id)] = c;
    });
    return m;
  }, [clients]);

  const flightMap = useMemo(() => {
    const m = {};
    flights.forEach((f) => {
      m[Number(f.flight_no)] = f;
    });
    return m;
  }, [flights]);

  const airportMap = useMemo(() => {
    const m = {};
    airports.forEach((a) => {
      m[String(a.airport_code)] = a;
    });
    return m;
  }, [airports]);

  const scheduleMap = useMemo(() => {
    const m = {};
    schedules.forEach((s) => {
      m[Number(s.schedule_id)] = s;
    });
    return m;
  }, [schedules]);

  const getDateOnly = (dt) => {
    if (!dt) return "";
    return String(dt).split(" ")[0]; // "2025-01-03 06:10:00" => "2025-01-03"
  };

  const niceStatus = (s) => {
    if (!s) return "Pending";
    const lower = String(s).toLowerCase();
    if (lower === "confirmed") return "Confirmed";
    if (lower === "cancelled" || lower === "canceled") return "Cancelled";
    if (lower === "pending") return "Pending";
    return s;
  };

  const getWatermarkText = (r) => {
    const status = r.status?.toLowerCase();
    if (status === "confirmed") return "PAID";
    if (status === "cancelled" && r.refund_amount > 0) return "REFUNDED";
    return "CANCELLED";
  };

  const downloadRefundPDF = async (r) => {
    try {
      const { default: jsPDF } = await import("jspdf");

      const doc = new jsPDF("p", "mm", "a4");

      // ================= WATERMARK =================
      const watermarkText = getWatermarkText(r);

      doc.saveGraphicsState();
      doc.setTextColor(200, 200, 200);
      doc.setFontSize(60);
      doc.text(watermarkText, 105, 150, {
        align: "center",
        angle: 45,
        opacity: 0.15,
      });
      doc.restoreGraphicsState();

      // ================= LOGO =================
      try {
        const logoSrc = airlineLogos[r.airline];
        if (logoSrc) {
          const logoBase64 = await imageToBase64(logoSrc);
          doc.addImage(logoBase64, "PNG", 14, 10, 32, 18);
        }
      } catch { }

      // ================= HEADER =================
      doc.setFontSize(16);
      doc.text("StarJet Airlines Pvt. Ltd.", 50, 16);

      doc.setFontSize(10);
      doc.text("Registered Office: Mumbai, Maharashtra, India", 50, 22);
      doc.text("GSTIN: 27ABCDE1234F1Z5", 50, 27);

      doc.line(14, 34, 196, 34);

      // ================= INVOICE META =================
      const isConfirmed = r.status.toLowerCase() === "confirmed";
      const invoiceTitle = isConfirmed ? "PAYMENT INVOICE" : "REFUND INVOICE";
      const invoicePrefix = isConfirmed ? "PAY" : "REF";

      doc.setFontSize(12);
      doc.text(invoiceTitle, 14, 44);

      doc.setFontSize(10);
      doc.text(`Invoice No: ${invoicePrefix}-${r.booking_id}`, 14, 52);
      doc.text(`Invoice Date: ${new Date().toLocaleDateString()}`, 14, 58);

      doc.text(`Booking ID: ${r.booking_id}`, 120, 52);
      doc.text(`PNR: ${r.pnr}`, 120, 58);

      doc.line(14, 64, 196, 64);

      // ================= PASSENGER =================
      doc.setFontSize(11);
      doc.text("Passenger Details", 14, 74);

      doc.setFontSize(10);
      doc.text(`Name: ${r.passenger_name || r.client_name}`, 14, 82);
      doc.text(`Flight No: ${r.flight_no}`, 14, 88);
      doc.text(`Seat: ${r.seat_no}`, 14, 94);
      doc.text(`Class: ${r.seat_class || "-"}`, 14, 100);

      doc.line(14, 106, 196, 106);

      // ================= SUMMARY =================
      const labelX = 14;
      const valueX = 170;
      let y = 126;

      doc.setFontSize(11);

      if (isConfirmed) {
        doc.text("Payment Summary", labelX, 116);
        doc.setFontSize(10);

        const seats = getSeatCount(r);

        // Base Fare
        doc.text("Base Fare", labelX, y);
        doc.text(`Rs. ${getPerSeatFare(r).toFixed(2)}`, valueX, y);
        y += 8;

        // Seat count
        doc.text("Seats", labelX, y);
        doc.text(`${seats}`, valueX, y);
        y += 8;

        // Quantity Discount
        if (n(r.quantity_discount_amount) > 0) {
          doc.text(
            `Quantity Discount (${n(r.quantity_discount_percent)}%)`,
            labelX,
            y
          );
          doc.text(
            `- Rs. ${getPerSeatDiscount(r.quantity_discount_amount, seats).toFixed(2)}`,
            valueX,
            y
          );
          y += 8;
        }

        // Tier Discount
        if (n(r.tier_discount_amount) > 0) {
          doc.text(
            `Tier Discount (${r.tier || "—"})`,
            labelX,
            y
          );
          doc.text(
            `- Rs. ${getPerSeatDiscount(r.tier_discount_amount, seats).toFixed(2)}`,
            valueX,
            y
          );
          y += 8;
        }

        // Advance Booking Discount
        if (n(r.advance_discount_amount) > 0) {
          doc.text(
            `Advance Booking Discount (${n(r.advance_discount_percent)}%)`,
            labelX,
            y
          );
          doc.text(
            `- Rs. ${getPerSeatDiscount(r.advance_discount_amount, seats).toFixed(2)}`,
            valueX,
            y
          );
          y += 8;
        }

        // Divider
        doc.line(14, y, 196, y);
        y += 8;

        // Final Paid
        doc.setFontSize(12);
        doc.text("Total Paid", labelX, y);
        doc.text(`Rs. ${getPerSeatFare(r).toFixed(2)}`, valueX, y);
      } else {
        doc.text("Refund Summary", labelX, 116);

        doc.setFontSize(10);
        doc.text("Original Fare", labelX, y);
        doc.text(`Rs. ${getPerSeatFare(r).toFixed(2)}`, valueX, y);
        y += 10;

        doc.text(
          `Cancellation Charge (${r.cancellation_charge_percent}%)`,
          labelX,
          y
        );
        doc.text(`- Rs. ${getPerSeatCancellation(r).toFixed(2)}`, valueX, y);
        y += 10;

        doc.line(14, y, 196, y);
        y += 10;

        doc.setFontSize(12);
        doc.text("Refund Amount", labelX, y);
        doc.text(`Rs. ${getPerSeatRefund(r).toFixed(2)}`, valueX, y);
      }

      // ================= FOOTER =================
      doc.setFontSize(9);
      doc.text(
        isConfirmed
          ? "This is a system-generated payment invoice and does not require a signature."
          : "This is a system-generated refund invoice and does not require a signature.",
        14,
        180
      );
      doc.text("For support, contact: support@starjetairlines.com", 14, 186);

      doc.save(
        `${invoicePrefix.toLowerCase()}-invoice-${r.booking_id}.pdf`
      );
    } catch (e) {
      console.error(e);
      toast.error("Failed to download invoice");
    }
  };

  // ----------- ENRICH BOOKINGS -----------
  const enrichedBookings = useMemo(() => {
    return (bookings || [])
      // Only bookings which have a booking_status present
      .filter(
        (b) => b.booking_status !== undefined && b.booking_status !== null
      )
      .map((b) => {
        const client = clientMap[Number(b.client_id)] || {};
        const flight = flightMap[Number(b.flight_no)] || {};
        const schedule = scheduleMap[Number(flight.schedule_id)] || {};
        const fromA = airportMap[String(flight.from_airport)] || {};
        const toA = airportMap[String(flight.to_airport)] || {};

        const fullName = `${client.fname || ""} ${client.mname || ""} ${client.lname || ""
          }`
          .replace(/\s+/g, " ")
          .trim();

        const depDate = getDateOnly(schedule.departure_time);
        const status = niceStatus(b.booking_status);
        const fares = b.fares != null ? Number(b.fares) : 0;

        return {
          ...b,
          client_name: fullName || `Client ${b.client_id}`,
          email: client.email || "",
          phone: client.phone || "",
          airline: flight.airline || "",
          from_airport: flight.from_airport || "",
          to_airport: flight.to_airport || "",
          from_city: fromA.city || "",
          to_city: toA.city || "",
          departure_date: depDate,
          departure_time_full: schedule.departure_time || "",
          status,
          pnr: b.PNR || "-",
          seat_no: b.seat_no || "-",
          fares,
          refund_amount: b.refund_amount,
          hours_before_departure: b.hours_before_departure,

          // sort helpers
          _sortName: (fullName || "").toLowerCase(),
          _sortAirline: (flight.airline || "").toLowerCase(),
          _sortFare: fares,
          _sortStatus: status.toLowerCase(),
          _sortPNR: (b.PNR || "").toLowerCase(),
          _sortDate: depDate || "",
        };
      });
  }, [bookings, clientMap, flightMap, airportMap, scheduleMap]);

  // ----------- FILTER OPTIONS -----------
  const airlineOptions = useMemo(() => {
    const set = new Set();
    enrichedBookings.forEach((r) => {
      if (r.airline) set.add(r.airline);
    });
    return Array.from(set).sort();
  }, [enrichedBookings]);

  const fromAirportOptions = useMemo(() => {
    const set = new Set();
    enrichedBookings.forEach((r) => {
      if (r.from_airport) set.add(r.from_airport);
    });
    return Array.from(set).sort();
  }, [enrichedBookings]);

  const toAirportOptions = useMemo(() => {
    const set = new Set();
    enrichedBookings.forEach((r) => {
      if (r.to_airport) set.add(r.to_airport);
    });
    return Array.from(set).sort();
  }, [enrichedBookings]);

  // ----------- FILTER + SEARCH + SORT -----------
  const processedBookings = useMemo(() => {
    let rows = [...enrichedBookings];

    // Search – no blank spaces allowed as only input
    const s = search.trim().toLowerCase();
    if (s.length > 0) {
      rows = rows.filter((r) => {
        return (
          r.client_name.toLowerCase().includes(s) ||
          String(r.client_id).includes(s) ||
          String(r.flight_no || "").includes(s) ||
          r.pnr.toLowerCase().includes(s) ||
          (r.email || "").toLowerCase().includes(s)
        );
      });
    }

    // Status filter
    if (statusFilter !== "all") {
      rows = rows.filter(
        (r) => r._sortStatus === statusFilter.toLowerCase()
      );
    }

    // Airline filter
    if (airlineFilter) {
      rows = rows.filter((r) => r.airline === airlineFilter);
    }

    // From airport
    if (fromAirportFilter) {
      rows = rows.filter((r) => r.from_airport === fromAirportFilter);
    }

    // To airport
    if (toAirportFilter) {
      rows = rows.filter((r) => r.to_airport === toAirportFilter);
    }

    // Date range
    if (dateFrom) {
      rows = rows.filter(
        (r) => !r.departure_date || r.departure_date >= dateFrom
      );
    }
    if (dateTo) {
      rows = rows.filter(
        (r) => !r.departure_date || r.departure_date <= dateTo
      );
    }

    // Fare range
    const minFare = fareMin !== "" ? Number(fareMin) : null;
    const maxFare = fareMax !== "" ? Number(fareMax) : null;

    if (minFare !== null) {
      rows = rows.filter((r) => (r.fares || 0) >= minFare);
    }
    if (maxFare !== null) {
      rows = rows.filter((r) => (r.fares || 0) <= maxFare);
    }

    // Sorting
    rows.sort((a, b) => {
      let valA;
      let valB;

      switch (sortField) {
        case "name":
          valA = a._sortName;
          valB = b._sortName;
          break;
        case "airline":
          valA = a._sortAirline;
          valB = b._sortAirline;
          break;
        case "fare":
          valA = a._sortFare;
          valB = b._sortFare;
          break;
        case "status":
          valA = a._sortStatus;
          valB = b._sortStatus;
          break;
        case "pnr":
          valA = a._sortPNR;
          valB = b._sortPNR;
          break;
        case "date":
        default:
          valA = a._sortDate;
          valB = b._sortDate;
          break;
      }

      if (valA < valB) return sortDir === "asc" ? -1 : 1;
      if (valA > valB) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return rows;
  }, [
    enrichedBookings,
    search,
    statusFilter,
    airlineFilter,
    fromAirportFilter,
    toAirportFilter,
    dateFrom,
    dateTo,
    fareMin,
    fareMax,
    sortField,
    sortDir,
  ]);

  // Reset page on filters change
  useEffect(() => {
    setPage(1);
  }, [
    search,
    statusFilter,
    airlineFilter,
    fromAirportFilter,
    toAirportFilter,
    dateFrom,
    dateTo,
    fareMin,
    fareMax,
    sortField,
    sortDir,
  ]);

  // Pagination
  const totalPages = Math.max(
    1,
    Math.ceil(processedBookings.length / pageSize)
  );
  const startIndex = (page - 1) * pageSize;
  const pageRows = processedBookings.slice(
    startIndex,
    startIndex + pageSize
  );

  // PDF EXPORT
  const handleExportPDF = async () => {
    try {
      const { default: jsPDF } = await import("jspdf");
      const autoTable = (await import("jspdf-autotable")).default;

      const doc = new jsPDF("p", "mm", "a4");
      doc.setFontSize(16);
      doc.text("Booking Report", 14, 18);
      doc.setFontSize(11);
      doc.text(
        `Total Records: ${processedBookings.length}`,
        14,
        26
      );

      const tableColumns = [
        "Booking ID",
        "PNR",
        "Name",
        "Airline",
        "Route",
        "Dep Date",
        "Fare",
        "Refund",
        "Status",
      ];

      const tableRows = processedBookings.map((r) => [
        r.booking_id,
        r.pnr,
        r.client_name,
        r.airline,
        `${r.from_airport} → ${r.to_airport}`,
        r.departure_date || "-",
        r.fares != null ? `₹${getPerSeatFare(r)}` : "-",
        r.status.toLowerCase() === "cancelled"
          ? `₹${r.refund_amount ?? 0}`
          : "-",
        r.status,
      ]);

      autoTable(doc, {
        head: [tableColumns],
        body: tableRows,
        startY: 32,
        styles: { fontSize: 9 },
        headStyles: {
          fillColor: [10, 80, 160],
          textColor: 255,
        },
        alternateRowStyles: { fillColor: [240, 248, 255] },
      });

      doc.save("booking-report.pdf");
    } catch (err) {
      console.error(err);
      toast.error("Failed to export PDF (check jsPDF installation)");
    }
  };

  // ----------- RENDER -----------
  return (
    <>
      <Sidebar />

      <div className="client-container">
        {/* HEADER */}
        <div className="client-header">
          <h2 className="client-title">Bookings</h2>

          <div className="client-actions">
            {/* Search */}
            <input
              className="client-search"
              placeholder="Search by Name / PNR / Client ID / Flight"
              value={search}
              onChange={(e) => {
                const val = e.target.value;
                // Block only-spaces input
                if (val !== "" && val.trim() === "") return;
                setSearch(val);
              }}
            />

            {/* Status Filter */}
            <select
              className="client-search"
              style={{ width: "140px" }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {/* Airline Filter */}
            <select
              className="client-search"
              style={{ width: "150px" }}
              value={airlineFilter}
              onChange={(e) => setAirlineFilter(e.target.value)}
            >
              <option value="">All Airlines</option>
              {airlineOptions.map((al) => (
                <option key={al} value={al}>
                  {al}
                </option>
              ))}
            </select>

            {/* Sort Field */}
            <select
              className="client-search"
              style={{ width: "150px" }}
              value={sortField}
              onChange={(e) => setSortField(e.target.value)}
            >
              <option value="date">Sort by Date</option>
              <option value="name">Sort by Name</option>
              <option value="airline">Sort by Airline</option>
              <option value="fare">Sort by Fare</option>
              <option value="status">Sort by Status</option>
              <option value="pnr">Sort by PNR</option>
            </select>

            {/* Sort Direction */}
            <button
              type="button"
              className="client-add-btn"
              style={{ padding: "8px 10px" }}
              onClick={() =>
                setSortDir((d) => (d === "asc" ? "desc" : "asc"))
              }
            >
              {sortDir === "asc" ? "↑ Asc" : "↓ Desc"}
            </button>

            {/* Advanced Filter Toggle */}
            <button
              type="button"
              className="client-add-btn"
              onClick={() => setShowFilters((open) => !open)}
            >
              {showFilters ? "Hide Filters" : "Show Filters"}
            </button>

            {/* Export PDF */}
            <button
              type="button"
              className="client-add-btn"
              onClick={handleExportPDF}
            >
              Export PDF
            </button>
          </div>
        </div>

        {/* COLLAPSIBLE ADVANCED FILTERS PANEL */}
        <div
          className={
            "filters-collapsible-wrapper " + (showFilters ? "open" : "closed")
          }
        >
          <div className="filters-inner-row">
            {/* From Airport */}
            <select
              className="client-search"
              style={{ width: "160px" }}
              value={fromAirportFilter}
              onChange={(e) => setFromAirportFilter(e.target.value)}
            >
              <option value="">From Airport</option>
              {fromAirportOptions.map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </select>

            {/* To Airport */}
            <select
              className="client-search"
              style={{ width: "160px" }}
              value={toAirportFilter}
              onChange={(e) => setToAirportFilter(e.target.value)}
            >
              <option value="">To Airport</option>
              {toAirportOptions.map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </select>

            {/* Date range */}
            <input
              type="date"
              className="client-search"
              style={{ width: "160px" }}
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
            <input
              type="date"
              className="client-search"
              style={{ width: "160px" }}
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />

            {/* Fare range */}
            <input
              type="number"
              className="client-search"
              style={{ width: "130px" }}
              placeholder="Min Fare"
              value={fareMin}
              onChange={(e) => {
                const v = e.target.value;
                if (v === "" || /^[0-9]+$/.test(v)) setFareMin(v);
              }}
            />
            <input
              type="number"
              className="client-search"
              style={{ width: "130px" }}
              placeholder="Max Fare"
              value={fareMax}
              onChange={(e) => {
                const v = e.target.value;
                if (v === "" || /^[0-9]+$/.test(v)) setFareMax(v);
              }}
            />
          </div>
        </div>

        {/* TABLE */}
        <div className="table-wrapper">
          <table className="client-table">
            <thead>
              <tr>
                <th>S. No</th>
                <th>Booking ID</th>
                <th>PNR</th>
                <th>Client</th>
                <th>Flight</th>
                <th>Route</th>
                <th>Dep Date</th>
                <th>Seat</th>
                <th>Fare</th>
                <th>Refund</th>
                <th>Invoice</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 ? (
                <tr>
                  <td colSpan="11" className="no-data">
                    No booking records found.
                  </td>
                </tr>
              ) : (
                pageRows.map((r, idx) => {
                  const status = r.status.toLowerCase();
                  const invoiceType = getInvoiceType(r); // PAID | REFUNDED | null

                  return (
                    <tr key={r.booking_id}>
                      <td>{startIndex + idx + 1}</td>
                      <td>{r.booking_id}</td>
                      <td>{r.pnr}</td>

                      <td>
                        {r.client_name}
                        <br />
                        <span style={{ fontSize: "11px", color: "#64748b" }}>
                          ID: {r.client_id} • {r.email}
                        </span>
                      </td>

                      <td>
                        {r.airline}
                        <br />
                        <span style={{ fontSize: "11px", color: "#64748b" }}>
                          Flight: {r.flight_no || "-"}
                        </span>
                      </td>

                      <td>
                        {r.from_airport} → {r.to_airport}
                        <br />
                        <span style={{ fontSize: "11px", color: "#64748b" }}>
                          {r.from_city} → {r.to_city}
                        </span>
                      </td>

                      <td>
                        {r.departure_date || "-"}
                        <br />
                        <span style={{ fontSize: "11px", color: "#64748b" }}>
                          {r.departure_time_full || ""}
                        </span>
                      </td>

                      <td>{r.seat_no}</td>

                      {/* FARE (PER SEAT – SAFE) */}
                      <td>
                        {formatINR(getPerSeatFare(r))}
                      </td>

                      {/* REFUND */}
                      <td>
                        {status === "cancelled" ? (
                          r.refund_amount > 0 ? (
                            <span style={{ color: "#2563eb", fontWeight: 700 }}>
                              {formatINR(getPerSeatRefund(r))}
                            </span>
                          ) : (
                            <span style={{ color: "#6b7280", fontWeight: 600 }}>
                              No refund
                            </span>
                          )
                        ) : (
                          <span style={{ color: "#9ca3af" }}>—</span>
                        )}
                      </td>

                      {/* INVOICE */}
                      <td>
                        {invoiceType ? (
                          <button
                            className="btn btn-refund"
                            onClick={() => {
                              setSelectedRefund(r);
                              setShowRefundModal(true);
                            }}
                          >
                            Invoice
                          </button>
                        ) : (
                          <span style={{ color: "#9ca3af" }}>—</span>
                        )}
                      </td>

                      {/* STATUS */}
                      <td>
                        <span className={`status-badge ${status}`}>
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div
          style={{
            marginTop: "12px",
            display: "flex",
            justifyContent: "center",
            gap: "16px",
            alignItems: "center",
          }}
        >
          <button
            type="button"
            className="btn-edit"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            ← Prev
          </button>
          <span style={{ fontSize: "14px", color: "#64748b" }}>
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            className="btn-edit"
            disabled={page === totalPages}
            onClick={() =>
              setPage((p) => Math.min(totalPages, p + 1))
            }
          >
            Next →
          </button>
        </div>
      </div>

      {/* Inline CSS for badges + collapsible animation */}
      <style>
        {`
          .status-badge {
            padding: 4px 8px;
            border-radius: 999px;
            font-size: 12px;
            font-weight: 600;
            text-transform: capitalize;
          }
          .status-badge.confirmed { background:#dcfce7; color:#166534; }
          .status-badge.cancelled { background:#fee2e2; color:#b91c1c; }
          .status-badge.pending { background:#fef9c3; color:#854d0e; }

          .filters-collapsible-wrapper {
            overflow: hidden;
            transition: max-height 0.3s ease, opacity 0.3s ease, margin-bottom 0.3s ease;
          }
          .filters-collapsible-wrapper.closed {
            max-height: 0;
            opacity: 0;
            margin-bottom: 0;
            pointer-events: none;
          }
          .filters-collapsible-wrapper.open {
            max-height: 120px;
            opacity: 1;
            margin-bottom: 10px;
          }
          .filters-inner-row {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
          }
        `}
      </style>
      {showRefundModal && selectedRefund && (() => {
        const isConfirmed = selectedRefund.status.toLowerCase() === "confirmed";
        const seats = getSeatCount(selectedRefund);

        return (
          <div className="modal-overlay" onClick={() => setShowRefundModal(false)}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
              <h3>{isConfirmed ? "Payment Invoice" : "Refund Invoice"}</h3>

              {/* COMMON DETAILS */}
              <div className="invoice-row">
                <span>Booking ID</span>
                <strong>{selectedRefund.booking_id}</strong>
              </div>

              <div className="invoice-row">
                <span>PNR</span>
                <strong>{selectedRefund.pnr}</strong>
              </div>

              <div className="invoice-row">
                <span>Passenger</span>
                <strong>
                  {selectedRefund.passenger_name || selectedRefund.client_name}
                </strong>
              </div>

              <div className="invoice-row">
                <span>Flight</span>
                <strong>{selectedRefund.flight_no}</strong>
              </div>

              <div className="invoice-row">
                <span>Class</span>
                <strong>{selectedRefund.seat_class || "-"}</strong>
              </div>

              <hr />

              {/* ================= CONFIRMED ================= */}
              {isConfirmed && (() => {
                const seats = getSeatCount(selectedRefund);

                return (
                  <>
                    <div className="invoice-row">
                      <span>Base Fare (per seat)</span>
                      <strong>{formatINR(selectedRefund.fares)}</strong>
                    </div>

                    <div className="invoice-row">
                      <span>Seats</span>
                      <strong>{seats}</strong>
                    </div>

                    {/* Quantity Discount */}
                    {selectedRefund.quantity_discount_amount > 0 && (
                      <div className="invoice-row">
                        <span>
                          Quantity Discount ({selectedRefund.quantity_discount_percent}%)
                        </span>
                        <strong style={{ color: "#b91c1c" }}>
                          -{formatINR(
                            getPerSeatDiscount(
                              selectedRefund.quantity_discount_amount,
                              seats
                            )
                          )}
                        </strong>
                      </div>
                    )}

                    {/* Tier Discount */}
                    {selectedRefund.tier_discount_amount > 0 && (
                      <div className="invoice-row">
                        <span>Tier Discount ({selectedRefund.tier})</span>
                        <strong style={{ color: "#b91c1c" }}>
                          -{formatINR(
                            getPerSeatDiscount(
                              selectedRefund.tier_discount_amount,
                              seats
                            )
                          )}
                        </strong>
                      </div>
                    )}

                    {/* Advance Booking Discount */}
                    {selectedRefund.advance_discount_amount > 0 && (
                      <div className="invoice-row">
                        <span>
                          Advance Booking Discount ({selectedRefund.advance_discount_percent}%)
                        </span>
                        <strong style={{ color: "#b91c1c" }}>
                          -{formatINR(
                            getPerSeatDiscount(
                              selectedRefund.advance_discount_amount,
                              seats
                            )
                          )}
                        </strong>
                      </div>
                    )}

                    <div className="invoice-row total">
                      <span>Total Paid (per seat)</span>
                      <strong style={{ color: "#166534" }}>
                        {formatINR(getPerSeatFare(selectedRefund))}
                      </strong>
                    </div>
                  </>
                );
              })()}

              {/* ================= CANCELLED ================= */}
              {!isConfirmed && (
                <>
                  <div className="invoice-row">
                    <span>Original Fare (per seat)</span>
                    <strong>{formatINR(getPerSeatFare(selectedRefund))}</strong>
                  </div>

                  <div className="invoice-row">
                    <span>
                      Cancellation ({selectedRefund.cancellation_charge_percent}%)
                    </span>
                    <strong style={{ color: "#b91c1c" }}>
                      -{formatINR(getPerSeatCancellation(selectedRefund))}
                    </strong>
                  </div>

                  <div className="invoice-row total">
                    <span>Refund Amount (per seat)</span>
                    <strong style={{ color: "#166534" }}>
                      {formatINR(getPerSeatRefund(selectedRefund))}
                    </strong>
                  </div>
                </>
              )}

              {/* ACTIONS */}
              <div className="modal-actions">
                <button
                  className="btn btn-refund"
                  onClick={() => downloadRefundPDF(selectedRefund)}
                >
                  Download PDF
                </button>

                <button
                  className="btn btn-delete"
                  onClick={() => setShowRefundModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </>
  );
}
