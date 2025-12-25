// index.js - JSON-backed replacement for your MySQL backend (routes unchanged)
const express = require("express");
const app = express();
const fs = require("fs-extra");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

// Import discount calculator
const {
  calculatePriceWithDiscounts,
  getCustomerTier
} = require("./utils/discountCalculator");

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

const DATA_DIR = path.join(__dirname, "data");
fs.ensureDirSync(DATA_DIR);

// Helper read / write with safe fallback
async function read(file) {
  const p = path.join(DATA_DIR, `${file}.json`);
  try {
    return await fs.readJSON(p);
  } catch (e) {
    await fs.writeJSON(p, []);
    return [];
  }
}
async function write(file, data) {
  const p = path.join(DATA_DIR, `${file}.json`);
  await fs.writeJSON(p, data, { spaces: 2 });
}

// Helper to get next id for arrays with numeric id field
async function nextId(file, idField) {
  const arr = await read(file);
  if (!arr || arr.length === 0) return 1;
  return arr.reduce((m, it) => (Number(it[idField]) > m ? Number(it[idField]) : m), 0) + 1;
}

// mimic SQL LIKE 'x%'
function startsWithLike(value, patternPrefix) {
  if (value == null) return false;
  return String(value).startsWith(String(patternPrefix));
}

// mimic rand() order
function randomChoice(arr) {
  if (!arr || arr.length === 0) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}

// Simple PNR generator: 6-char alphanumeric
function generatePNR() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let pnr = "";
  for (let i = 0; i < 6; i++) {
    pnr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pnr;
}

/* ------------------ ROUTES (kept same paths) ------------------ */

//select
app.get("/api/get", async (req, res) => {
  try {
    // original SQL: select * from client; (we'll read clients.json)
    const data = await read("clients");
    res.send(data);
  } catch (e) { res.send({ err: e.message }) }
});

app.get("/airplane/api/get", async (req, res) => {
  try {
    const data = await read("airplane");
    res.send(data);
  } catch (e) { res.send({ err: e.message }) }
});

app.get("/flightStatus/api/get", async (req, res) => {
  try {
    const data = await read("flightstatus");
    res.send(data);
  } catch (e) { res.send({ err: e.message }) }
});

app.get("/airport/api/get", async (req, res) => {
  try {
    const data = await read("airport");
    res.send(data);
  } catch (e) { res.send({ err: e.message }) }
});

app.get("/gates/api/get", async (req, res) => {
  try {
    const data = await read("gates");
    res.send(data);
  } catch (e) { res.send({ err: e.message }) }
});

app.get("/reviews/api/get", async (req, res) => {
  try {
    // original used view 'reviews' -> customer_review rows
    const data = await read("customer_review");
    res.send(data);
  } catch (e) { res.send({ err: e.message }) }
});

app.get("/schedule/api/get", async (req, res) => {
  try {
    const data = await read("schedule");
    res.send(data);
  } catch (e) { res.send({ err: e.message }) }
});

app.get("/flight/api/get", async (req, res) => {
  try {
    const data = await read("flight");
    res.send(data);
  } catch (e) { res.send({ err: e.message }) }
});

app.get("/ticket/api/get", async (req, res) => {
  try {
    const data = await read("ticket");
    res.send(data);
  } catch (e) { res.send({ err: e.message }) }
});

app.get("/booking/api/get", async (req, res) => {
  try {
    const bookings = await read("booking");
    const flights = await read("flight");
    const schedules = await read("schedule");

    const now = new Date();

    const out = bookings.map(b => {
      let hoursBeforeDeparture = null;

      if (b.flight_no) {
        const flight = flights.find(f => Number(f.flight_no) === Number(b.flight_no));
        if (flight && flight.schedule_id) {
          const sch = schedules.find(s => Number(s.schedule_id) === Number(flight.schedule_id));
          if (sch?.departure_time) {
            const dep = new Date(sch.departure_time.replace(" ", "T"));
            if (!isNaN(dep.getTime())) {
              hoursBeforeDeparture =
                (dep.getTime() - now.getTime()) / (1000 * 60 * 60);
            }
          }
        }
      }

      return {
        ...b,

        // ✅ expose refund-related fields
        refund_amount: b.refund_amount ?? null,
        cancellation_charge_amount: b.cancellation_charge_amount ?? null,
        cancellation_charge_percent: b.cancellation_charge_percent ?? null,

        // optional but useful for UI
        hours_before_departure: hoursBeforeDeparture
      };
    });

    res.send(out);
  } catch (e) {
    res.send({ err: e.message });
  }
});

/* ------------------ INSERTS ------------------ */

app.post('/api/post', async (req, res) => {
  try {
    const { client_id, fname, mname, lname, phone, email, passport } = req.body;
    const clients = await read("clients");

    // Auto-generate ID if not provided
    const id = client_id ? Number(client_id) : await nextId("clients", "client_id");

    // Default password
    const DEFAULT_PASSWORD = "Admin@123";

    const newClient = {
      client_id: id,
      fname,
      mname,
      lname,
      phone,
      email,
      passport,
      password: DEFAULT_PASSWORD
    };

    clients.push(newClient);
    await write("clients", clients);

    res.send({ msg: "Inserted", client_id: id });

  } catch (e) {
    res.send({ err: e.message })
  }
});

app.post('/airplane/api/post', async (req, res) => {
  try {
    const { airplane_id, airline, model, max_seats } = req.body;

    if (!airline?.trim() || !model?.trim() || !max_seats) {
      return res.send({ err: "All fields are required." });
    }

    const arr = await read("airplane");

    const newAirplane = {
      airplane_id: Number(airplane_id),
      airline: airline.trim(),
      model: model.trim(),
      max_seats: Number(max_seats)
    };

    arr.push(newAirplane);

    await write("airplane", arr);

    return res.send({
      msg: "Airplane inserted successfully",
      airplane: newAirplane
    });

  } catch (e) {
    res.send({ err: e.message });
  }
});



app.put("/airplane/api/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { airline, model, max_seats } = req.body;

    if (!airline?.trim()) return res.send({ err: "Airline missing" });
    if (!model?.trim()) return res.send({ err: "Model missing" });

    const arr = await read("airplane");
    const idx = arr.findIndex(x => Number(x.airplane_id) === Number(id));

    if (idx !== -1) {
      arr[idx] = {
        airplane_id: Number(id),
        airline: airline.trim(),
        model: model.trim(),
        max_seats: Number(max_seats)
      };

      await write("airplane", arr);
      return res.send({ msg: "Updated" });
    }

    res.send({ err: "Not found" });

  } catch (e) {
    res.send({ err: e.message })
  }
});


app.post('/schedule/api/post', async (req, res) => {
  try {
    const { schedule_id, departure_time, arrival_time, duration_time } = req.body;
    const arr = await read("schedule");
    arr.push({ schedule_id: Number(schedule_id), departure_time, arrival_time, duration_time: duration_time || null });
    await write("schedule", arr);
    res.send({ msg: "Inserted" });
  } catch (e) { res.send({ err: e.message }) }
});
app.put("/flight/api/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      flight_no,
      schedule_id,
      flightstatus_id,
      airplane_id,
      fares,
      from_airport,
      to_airport,
      airline
    } = req.body;

    const arr = await read("flight");
    const idx = arr.findIndex(x => Number(x.flight_no) === Number(id));

    if (idx !== -1) {
      arr[idx] = {
        flight_no: Number(flight_no),
        schedule_id: Number(schedule_id),
        flightstatus_id: Number(flightstatus_id),
        airplane_id: Number(airplane_id),
        fares: fares != null ? Number(fares) : null,
        from_airport,
        to_airport,
        airline
      };

      await write("flight", arr);
      res.send({ msg: "Updated" });
    } else {
      res.send({ err: "Not found" });
    }
  } catch (e) { res.send({ err: e.message }) }
});
app.post('/flight/api/post', async (req, res) => {
  try {
    const {
      flight_no,
      schedule_id,
      flightstatus_id,
      airplane_id,
      fares,
      from_airport,
      to_airport,
      airline
    } = req.body;

    const arr = await read("flight");

    arr.push({
      flight_no: Number(flight_no),
      schedule_id: Number(schedule_id),
      flightstatus_id: Number(flightstatus_id),
      airplane_id: Number(airplane_id),
      fares: fares != null ? Number(fares) : null,
      from_airport: from_airport || null,
      to_airport: to_airport || null,
      airline: airline || null
    });

    await write("flight", arr);
    res.send({ msg: "Inserted" });

  } catch (e) {
    res.send({ err: e.message })
  }
});

/* ------------------ DELETE ------------------ */

app.delete('/api/remove/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const clients = await read("clients");
    const bookings = await read("booking"); // 🔴 IMPORTANT

    // 🔹 Check if client has any booking
    const hasBooking = bookings.some(
      b => Number(b.client_id) === Number(id)
    );

    if (hasBooking) {
      return res.status(400).send({
        error: "CLIENT_HAS_BOOKINGS",
        message: "Client has existing bookings"
      });
    }

    // 🔹 Delete client if safe
    const updatedClients = clients.filter(
      c => Number(c.client_id) !== Number(id)
    );

    await write("clients", updatedClients);

    res.send({ msg: "Deleted" });

  } catch (e) {
    res.status(500).send({ err: e.message });
  }
});

app.delete('/airplane/api/remove/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let arr = await read("airplane");
    arr = arr.filter(x => Number(x.airplane_id) !== Number(id));
    await write("airplane", arr);
    res.send({ msg: "Deleted" });
  } catch (e) { res.send({ err: e.message }) }
});

app.delete('/schedule/api/remove/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let arr = await read("schedule");
    arr = arr.filter(x => Number(x.schedule_id) !== Number(id));
    await write("schedule", arr);
    res.send({ msg: "Deleted" });
  } catch (e) { res.send({ err: e.message }) }
});

app.delete('/flight/api/remove/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let arr = await read("flight");
    arr = arr.filter(x => Number(x.flight_no) !== Number(id));
    await write("flight", arr);
    res.send({ msg: "Deleted" });
  } catch (e) { res.send({ err: e.message }) }
});

/* ------------------ VIEWS / GET BY ID ------------------ */

app.get("/api/get/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const arr = await read("clients");
    const found = arr.filter(x => Number(x.client_id) === Number(id));
    res.send(found);
  } catch (e) { res.send({ err: e.message }) }
});

app.get("/airplane/api/get/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const arr = await read("airplane");
    const found = arr.filter(x => Number(x.airplane_id) === Number(id));
    res.send(found);
  } catch (e) { res.send({ err: e.message }) }
});

app.get("/flightStatus/api/get/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const arr = await read("flightstatus");
    const found = arr.filter(x => Number(x.flightstatus_id) === Number(id));
    res.send(found);
  } catch (e) { res.send({ err: e.message }) }
});

app.get("/airport/api/get/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const arr = await read("airport");
    const found = arr.filter(x => String(x.airport_code) === String(id));
    res.send(found);
  } catch (e) { res.send({ err: e.message }) }
});

app.get("/gates/api/get/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const arr = await read("gates");
    const found = arr.filter(x => Number(x.gate_no) === Number(id));
    res.send(found);
  } catch (e) { res.send({ err: e.message }) }
});

app.get("/reviews/api/get/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const arr = await read("customer_review");
    const found = arr.filter(x => Number(x.client_id) === Number(id));
    res.send(found);
  } catch (e) { res.send({ err: e.message }) }
});

app.get("/schedule/api/get/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const arr = await read("schedule");
    const found = arr.filter(x => Number(x.schedule_id) === Number(id));
    res.send(found);
  } catch (e) { res.send({ err: e.message }) }
});

app.get("/flight/api/get/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const arr = await read("flight");
    const found = arr.filter(x => Number(x.flight_no) === Number(id));
    res.send(found);
  } catch (e) { res.send({ err: e.message }) }
});

app.get("/ticket/api/get/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const arr = await read("ticket");
    const found = arr.filter(x => Number(x.ticket_id) === Number(id));
    res.send(found);
  } catch (e) { res.send({ err: e.message }) }
});

/* ------------------ UPDATE ------------------ */

app.put("/api/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { client_id, fname, mname, lname, phone, email, passport } = req.body;
    const arr = await read("clients");
    const idx = arr.findIndex(x => Number(x.client_id) === Number(id));
    if (idx !== -1) {
      // keep same set as original SQL update - accept client may change its id
      arr[idx] = { client_id, fname, mname, lname, phone, email, passport, password: arr[idx].password || null };
      await write("clients", arr);
      res.send({ msg: "Updated" });
    } else res.send({ err: "Not found" });
  } catch (e) { res.send({ err: e.message }) }
});


app.put("/schedule/api/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { schedule_id, departure_time, arrival_time, duration_time } = req.body;
    const arr = await read("schedule");
    const idx = arr.findIndex(x => Number(x.schedule_id) === Number(id));
    if (idx !== -1) {
      arr[idx] = { schedule_id, departure_time, arrival_time, duration_time };
      await write("schedule", arr);
      res.send({ msg: "Updated" });
    } else res.send({ err: "Not found" });
  } catch (e) { res.send({ err: e.message }) }
});

app.put("/ticket/api/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { ticket_id, seat_no, departure_time, gate_no, airport_code } = req.body;
    const arr = await read("ticket");
    const idx = arr.findIndex(x => Number(x.ticket_id) === Number(id));
    if (idx !== -1) {
      arr[idx] = { ticket_id, seat_no, departure_time, gate_no, airport_code };
      await write("ticket", arr);
      res.send({ msg: "Updated" });
    } else res.send({ err: "Not found" });
  } catch (e) { res.send({ err: e.message }) }
});

/* ------------------ AUTH / LOGIN ------------------ */

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const admins = await read("admin"); // admin.json
    const found = admins.find(a => a.username === username && a.password === password);
    if (found) res.send([found]);
    else res.send({ msg: 'Invalid Admin Login' });
  } catch (e) { res.send({ err: e.message }) }
});

app.post("/customerlogin", async (req, res) => {
  try {
    const username = req.body.email;
    const password = req.body.password;
    const clients = await read("clients");
    const found = clients.filter(c => String(c.email) === String(username) && String(c.password) === String(password));
    if (found.length > 0) res.send(found);
    else res.send({ msg: 'Invalid Customer Login' });
  } catch (e) { res.send({ err: e.message }) }
});

app.post("/getcustomerlogin", async (req, res) => {
  try {
    const username = req.body.email;
    const password = req.body.password;
    const clients = await read("clients");
    const found = clients.find(c => String(c.email) === String(username) && String(c.password) === String(password));
    if (found) res.send([{ client_id: found.client_id }]);
    else res.send({ msg: 'Invalid Customer Login' });
  } catch (e) { res.send({ err: e.message }) }
});

/* ------------------ SIGNUP ------------------ */

app.post("/signup", async (req, res) => {
  try {
    const { fname, mname, lname, phone, email, passport, password } = req.body;
    const clients = await read("clients");
    const id = await nextId("clients", "client_id");
    const newClient = { client_id: id, fname, mname, lname, phone, email, passport, password };
    clients.push(newClient);
    await write("clients", clients);
    res.send({ msg: "Signed up", client_id: id });
  } catch (e) { res.send({ err: e.message }) }
});

app.get("/CustomerPanel/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const clients = await read("clients");
    const found = clients.find(c => Number(c.client_id) === Number(id));
    if (found) res.send([{ fname: found.fname }]);
    else res.send([]);
  } catch (e) { res.send({ err: e.message }) }
});

/* ------------------ BOOKING FLOW ------------------ */

app.post('/BookTicket', async (req, res) => {
  try {
    const { departure, arrival, departureDate, returnDate, class: classs, price } = req.body;
    const airports = await read("airport");

    // Map airport names to codes
    const fromAirport = airports.find(a => a.airport_name === departure);
    const toAirport = airports.find(a => a.airport_name === arrival);

    const fb = await read("flightbooking");
    const id = await nextId("flightbooking", "fb_id");
    fb.push({
      fb_id: id,
      departure,
      arrival,
      departureDate,
      returnDate,
      class: classs,
      price,
      from_airport_code: fromAirport ? fromAirport.airport_code : null,
      to_airport_code: toAirport ? toAirport.airport_code : null
    });
    await write("flightbooking", fb);
    res.send({ msg: "Inserted", fb_id: id });
  } catch (e) { res.send({ err: e.message }) }
});

app.get("/SearchFlights", async (req, res) => {
  try {
    const fb = await read("flightbooking");
    const out = fb.map(({ fb_id, departure, arrival, departureDate, returnDate, class: cls, price, from_airport_code, to_airport_code }) => ({
      fb_id, departure, arrival, departureDate, returnDate, class: cls, price,
      from_airport_code, to_airport_code
    }));
    res.send(out);
  } catch (e) { res.send({ err: e.message }) }
});

app.delete('/removeSearch', async (req, res) => {
  try {
    await write("flightbooking", []);
    res.send({ msg: "Deleted" });
  } catch (e) { res.send({ err: e.message }) }
});

/* AvailableFlights — Safe version: show only valid flights, filter by route and date */
app.post("/AvailableFlights", async (req, res) => {
  try {
    const departureDate = req.body.departureDate;
    const returnDate = req.body.returnDate;
    const fares = req.body.fares;
    const from_airport = req.body.from_airport; // airport code (e.g., "BOM")
    const to_airport = req.body.to_airport;     // airport code (e.g., "CCU")

    const flights = await read("flight");
    const schedules = await read("schedule");
    const fstatus = await read("flightstatus");
    const airplanes = await read("airplane");

    // Remove flights with missing relations
    const joined = flights
      .map(f => {
        const s = schedules.find(sc => Number(sc.schedule_id) === Number(f.schedule_id));
        const fs = fstatus.find(st => Number(st.flightstatus_id) === Number(f.flightstatus_id));
        const a = airplanes.find(ap => Number(ap.airplane_id) === Number(f.airplane_id));

        // Skip rows where any dependency is missing
        if (!s || !fs || !a) return null;

        return { f, s, fs, a };
      })
      .filter(Boolean);

    // Normalize dates: schedule format is "2025-01-03 06:10:00" (ISO)
    // Extract date part: "2025-01-03 06:10:00" → "2025-01-03"
    function normalizeScheduleDate(datetime) {
      if (!datetime) return "";
      return datetime.split(" ")[0];
    }

    let result = joined.filter(row => {
      const sDepISO = normalizeScheduleDate(row.s.departure_time);
      const sArrISO = normalizeScheduleDate(row.s.arrival_time);
      // Frontend now sends ISO format dates directly (YYYY-MM-DD)
      const matchDep = !departureDate || sDepISO === departureDate;
      const matchArr = !returnDate || sArrISO === returnDate;
      const matchFare =
        !fares || fares === "" || fares === "All Prices"
          ? true
          : String(row.f.fares) === String(fares);

      // Filter by route (from_airport and to_airport codes)
      const matchFrom = !from_airport || row.f.from_airport === from_airport;
      const matchTo = !to_airport || row.f.to_airport === to_airport;

      return matchDep && matchArr && matchFare && matchFrom && matchTo;
    });

    // If no flights match → return empty array (don't show all flights)
    // This ensures users only see flights matching their search

    // Final formatting
    result = result.map(row => ({
      flight_no: row.f.flight_no,
      airline: row.f.airline || null,
      from_airport: row.f.from_airport || null,
      to_airport: row.f.to_airport || null,
      airplane_id: row.a.airplane_id,
      model: row.a.model,
      max_seats: row.a.max_seats,
      departure_time: row.s.departure_time,
      arrival_time: row.s.arrival_time,
      status: row.fs.status,
      fares: row.f.fares,
      schedule_id: row.f.schedule_id,
    }));

    res.send(result);

  } catch (e) {
    res.send({ err: e.message });
  }
});

app.post("/UpdateFlightBooking", async (req, res) => {
  try {
    const id = Number(req.body.id);
    const fb = await read("flightbooking");
    const flights = await read("flight");
    // find flight with schedule_id == id
    const chosen = flights.find(f => Number(f.schedule_id) === Number(id));
    if (!chosen) return res.send({ msg: "No flight found" });

    const idx = fb.findIndex(x => x.flight_no == null || x.flight_no === undefined);
    if (idx === -1) return res.send({ msg: "No booking to update" });

    fb[idx].flight_no = chosen.flight_no;
    await write("flightbooking", fb);
    res.send({ msg: "Updated", flight_no: chosen.flight_no });
  } catch (e) { res.send({ err: e.message }) }
});

/* ------------------ INVOICE / TICKET ------------------ */

app.get("/invoice/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const clients = await read("clients");
    const found = clients.find(c => Number(c.client_id) === Number(id));
    if (found) res.send([{ fname: found.fname, lname: found.lname }]);
    else res.send([]);
  } catch (e) { res.send({ err: e.message }) }
});

app.get("/invoicefares", async (req, res) => {
  try {
    const fb = await read("flightbooking");
    const out = fb.map(({ flight_no, departure, price }) => ({ flight_no, departure, price }));
    res.send(out);
  } catch (e) { res.send({ err: e.message }) }
});

app.post("/invoiceconfirm", async (req, res) => {
  try {
    const id = Number(req.body.id); // schedule_id
    const departure = req.body.departure; // airport_name in original SQL

    const schedules = await read("schedule");
    const airports = await read("airport");
    const temp = await read("tempseatgen");
    const tickets = await read("ticket");
    const bookings = await read("booking");

    const s = schedules.find(sc => Number(sc.schedule_id) === Number(id));
    const a = airports.find(ap => String(ap.airport_name) === String(departure));
    const seat = randomChoice(temp)?.nm || "A01";

    const ticket_id = await nextId("ticket", "ticket_id");
    const newTicket = {
      ticket_id,
      seat_no: seat,
      departure_time: s ? s.departure_time : null,
      gate_no: a ? a.gate_no : null,
      airport_code: a ? a.airport_code : null
    };
    tickets.push(newTicket);
    await write("ticket", tickets);

    // simulate trigger that inserts booking (airport_code, ticket_id)
    bookings.push({ client_id: null, airport_code: newTicket.airport_code, ticket_id: newTicket.ticket_id, flight_no: null, fares: null });
    await write("booking", bookings);

    res.send({ msg: "Ticket & booking created", ticket: newTicket });
  } catch (e) { res.send({ err: e.message }) }
});

app.post("/invoiceconfirmAgain", async (req, res) => {
  try {
    const client_id = Number(req.body.id);
    const flight_no = String(req.body.flight_no);
    const fares = req.body.fares;

    const bookings = await read("booking");
    const idx = bookings.findIndex(b => (b.client_id == null && b.flight_no == null && b.fares == null));
    if (idx === -1) return res.send({ msg: "No empty booking record" });

    bookings[idx].client_id = client_id;
    bookings[idx].flight_no = flight_no;
    bookings[idx].fares = fares;
    await write("booking", bookings);
    res.send({ msg: "Booking updated", booking: bookings[idx] });
  } catch (e) { res.send({ err: e.message }) }
});

/* ------------------ SHOW PASS / JOIN ------------------ */

app.get("/showPass/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const bookings = await read("booking");
    const clients = await read("clients");
    const airports = await read("airport");
    const schedules = await read("schedule");
    const flights = await read("flight");
    const boardingpasses = await read("boardingpass");

    const userBookings = bookings.filter(b => Number(b.client_id) === id);
    const out = userBookings.map(b => {
      const c = clients.find(x => Number(x.client_id) === Number(b.client_id));
      const a = airports.find(x => String(x.airport_code) === String(b.airport_code));
      const flight = flights.find(f => Number(f.flight_no) === Number(b.flight_no));
      const schedule = flight ? schedules.find(s => Number(s.schedule_id) === Number(flight.schedule_id)) : null;
      const bp = boardingpasses.find(bp => Number(bp.booking_id) === Number(b.booking_id));

      // Use passenger name from booking if available, otherwise use client name
      let passengerFirstName = null;
      let passengerLastName = null;

      if (b.passenger_name) {
        const nameParts = b.passenger_name.split(" ");
        passengerFirstName = nameParts[0] || null;
        passengerLastName = nameParts.slice(1).join(" ") || null;
      } else if (c) {
        passengerFirstName = c.fname;
        passengerLastName = c.lname;
      }

      return {
        booking_id: b.booking_id || null,
        fname: passengerFirstName,
        lname: passengerLastName,
        passenger_name: b.passenger_name || (c ? `${c.fname} ${c.lname}`.trim() : null),
        airport_code: b.airport_code,
        flight_no: b.flight_no,
        gate_no: bp ? bp.gate : (a ? a.gate_no : null),
        seat_no: b.seat_no || (bp ? bp.seat_no : null), // Get from booking first, then boarding pass
        departure_time: schedule ? schedule.departure_time : null,
        arrival_time: schedule ? schedule.arrival_time : null,
        airline: flight ? flight.airline : null,
        from_airport: flight ? flight.from_airport : null,
        to_airport: flight ? flight.to_airport : null,
        PNR: b.PNR || null,
        booking_status: b.booking_status || null,
        boarding_time: bp ? bp.boarding_time : null
      };
    });
    res.send(out);
  } catch (e) { res.send({ err: e.message }) }
});

/* ------------------ REVIEWS ------------------ */

app.post("/addreview/:id", async (req, res) => {
  try {
    const id = Number(req.body.id);
    const review = req.body.review;
    const arr = await read("customer_review");
    arr.push({ client_id: id, review });
    await write("customer_review", arr);
    res.send({ msg: "Review added" });
  } catch (e) { res.send({ err: e.message }) }
});

app.get("/getreview", async (req, res) => {
  try {
    const reviews = await read("customer_review");
    const clients = await read("clients");
    const out = reviews.map(r => {
      const c = clients.find(cl => Number(cl.client_id) === Number(r.client_id));
      return { fname: c ? c.fname : null, lname: c ? c.lname : null, review: r.review };
    });
    res.send(out);
  } catch (e) { res.send({ err: e.message }) }
});

/* ------------------ STATS ------------------ */

app.get("/getstats", async (req, res) => {
  try {
    const booking = await read("booking");
    const countt = booking.filter(b => b.client_id != null).length;
    const summ = booking.reduce((s, b) => s + (b.fares ? Number(b.fares) : 0), 0);
    res.send([{ countt, summ }]);
  } catch (e) { res.send({ err: e.message }) }
});

/* ------------------ SEAT SELECTION + AVAILABILITY ------------------ */

// Get merged seat map (layout + availability) for a given flight
app.get("/SeatMap/:flight_no", async (req, res) => {
  try {
    const flightNo = Number(req.params.flight_no);

    const flights = await read("flight");
    const airplanes = await read("airplane");
    const seatmapAll = await read("seatmap");
    const seatavailability = await read("seatavailability");

    const flight = flights.find(f => Number(f.flight_no) === flightNo);
    if (!flight) return res.status(404).send({ msg: "Flight not found" });

    const airplane = airplanes.find(a => Number(a.airplane_id) === Number(flight.airplane_id));
    if (!airplane) return res.status(404).send({ msg: "Airplane not found for flight" });

    const modelMap = seatmapAll.find(m => String(m.model) === String(airplane.model));
    if (!modelMap) return res.status(404).send({ msg: "Seat map not defined for model " + airplane.model });

    const availabilityForFlight = seatavailability.filter(
      s => String(s.flight_no) === String(flightNo)
    );

    // Also check confirmed bookings to mark seats as booked
    const bookings = await read("booking");
    const confirmedBookings = bookings.filter(b =>
      Number(b.flight_no) === Number(flightNo) &&
      (b.booking_status === "confirmed" || b.booking_status === "success")
    );

    const statusIndex = Object.create(null);

    // First, mark all seats from confirmed bookings as "booked"
    for (const booking of confirmedBookings) {
      if (booking.seat_no) {
        statusIndex[String(booking.seat_no)] = "booked";
      }
    }

    // Then, apply seatavailability status (held seats, etc.)
    for (const s of availabilityForFlight) {
      // Only override if not already marked as booked from confirmed bookings
      if (!statusIndex[String(s.seat_no)] || statusIndex[String(s.seat_no)] !== "booked") {
        statusIndex[String(s.seat_no)] = s.status || "available";
      }
    }

    const layout = (modelMap.layout || []).map(seat => ({
      ...seat,
      status: statusIndex[String(seat.seat_no)] || "available"
    }));

    res.send({
      flight_no: flightNo,
      airplane_id: airplane.airplane_id,
      model: airplane.model,
      rows: modelMap.rows,
      seats: modelMap.seats,
      layout
    });
  } catch (e) {
    res.send({ err: e.message });
  }
});

// Hold (lock) a seat for a booking during payment
app.post("/SeatHold", async (req, res) => {
  try {
    const flight_no = Number(req.body.flight_no);
    const seat_no = String(req.body.seat_no);
    const booking_id = req.body.booking_id != null ? Number(req.body.booking_id) : null;

    if (!flight_no || !seat_no) {
      return res.status(400).send({ msg: "flight_no and seat_no are required" });
    }

    const seatavailability = await read("seatavailability");
    const idx = seatavailability.findIndex(
      s => Number(s.flight_no) === flight_no && String(s.seat_no) === seat_no
    );

    if (idx !== -1) {
      const existing = seatavailability[idx];
      if (existing.status === "booked") {
        return res.status(409).send({ msg: "Seat already booked" });
      }
      if (existing.status === "held" && existing.booking_id && existing.booking_id !== booking_id) {
        return res.status(409).send({ msg: "Seat currently held for another booking" });
      }
      seatavailability[idx] = {
        ...existing,
        status: "held",
        booking_id
      };
    } else {
      seatavailability.push({
        flight_no,
        seat_no,
        status: "held",
        booking_id
      });
    }

    await write("seatavailability", seatavailability);
    res.send({ msg: "Seat held", flight_no, seat_no, booking_id });
  } catch (e) {
    res.send({ err: e.message });
  }
});

// Release a held seat (e.g. on payment failure or cancellation)
app.post("/SeatRelease", async (req, res) => {
  try {
    const flight_no = Number(req.body.flight_no);
    const seat_no = String(req.body.seat_no);

    if (!flight_no || !seat_no) {
      return res.status(400).send({ msg: "flight_no and seat_no are required" });
    }

    const seatavailability = await read("seatavailability");
    const idx = seatavailability.findIndex(
      s => Number(s.flight_no) === flight_no && String(s.seat_no) === seat_no
    );

    if (idx !== -1) {
      seatavailability[idx] = {
        flight_no,
        seat_no,
        status: "available",
        booking_id: null
      };
      await write("seatavailability", seatavailability);
    }

    res.send({ msg: "Seat released", flight_no, seat_no });
  } catch (e) {
    res.send({ err: e.message });
  }
});

/* ------------------ BOOKING WITH SEAT + PAYMENTS + PNR ------------------ */

// Create a booking record tied to a selected seat (before payment)
app.post("/booking/createWithSeat", async (req, res) => {
  try {
    const client_id = Number(req.body.client_id);
    const flight_no = Number(req.body.flight_no);
    const airport_code = String(req.body.airport_code || "");
    const fares = req.body.fares != null ? Number(req.body.fares) : null;
    const seat_no = String(req.body.seat_no || "");
    const seat_class = String(req.body.seat_class || "");
    const passenger_name = String(req.body.passenger_name || "");
    const passenger_age = req.body.passenger_age != null ? Number(req.body.passenger_age) : null;

    if (!client_id || !flight_no || !airport_code || !seat_no) {
      return res.status(400).send({ msg: "client_id, flight_no, airport_code, seat_no are required" });
    }

    // ✅ Fix: Validate seat class matches the seat map
    const flights = await read("flight");
    const airplanes = await read("airplane");
    const seatmapAll = await read("seatmap");

    const flight = flights.find(f => Number(f.flight_no) === flight_no);
    if (!flight) {
      return res.status(404).send({ msg: "Flight not found" });
    }

    const airplane = airplanes.find(a => Number(a.airplane_id) === Number(flight.airplane_id));
    if (!airplane) {
      return res.status(404).send({ msg: "Airplane not found for flight" });
    }

    const modelMap = seatmapAll.find(m => String(m.model) === String(airplane.model));
    if (!modelMap) {
      return res.status(404).send({ msg: "Seat map not found for airplane model" });
    }

    const seatInMap = modelMap.layout.find(s => String(s.seat_no) === String(seat_no));
    if (!seatInMap) {
      return res.status(400).send({ msg: `Seat ${seat_no} not found in seat map` });
    }

    // ✅ Fix: Validate that the seat_class matches the seat's actual class
    const normalizedRequestedClass = seat_class.toLowerCase().includes("business") ? "Business" :
      seat_class.toLowerCase().includes("economy") ? "Economy" : null;
    const normalizedSeatClass = seatInMap.seat_class.toLowerCase().includes("business") ? "Business" :
      seatInMap.seat_class.toLowerCase().includes("economy") ? "Economy" : null;

    if (normalizedRequestedClass && normalizedSeatClass && normalizedRequestedClass !== normalizedSeatClass) {
      return res.status(400).send({
        msg: `Seat class mismatch: Seat ${seat_no} belongs to ${normalizedSeatClass} class, but ${normalizedRequestedClass} was requested.`
      });
    }

    const bookings = await read("booking");
    const booking_id = await nextId("booking", "booking_id");

    const newBooking = {
      booking_id,
      client_id,
      airport_code,
      ticket_id: null,
      flight_no,
      fares,
      seat_no,
      seat_class: normalizedSeatClass || seat_class,
      passenger_name: passenger_name || null,
      passenger_age: passenger_age || null,
      booking_status: "pending",
      PNR: null
    };

    bookings.push(newBooking);
    await write("booking", bookings);

    // Also hold the seat for this booking
    const seatavailability = await read("seatavailability");
    const idx = seatavailability.findIndex(
      s => Number(s.flight_no) === flight_no && String(s.seat_no) === seat_no
    );
    if (idx !== -1) {
      seatavailability[idx] = { ...seatavailability[idx], status: "held", booking_id };
    } else {
      seatavailability.push({ flight_no, seat_no, status: "held", booking_id });
    }
    await write("seatavailability", seatavailability);

    res.send({ msg: "Booking created", booking: newBooking });
  } catch (e) {
    res.send({ err: e.message });
  }
});

/* ------------------ ENHANCED MULTIPLE SEAT BOOKING WITH DISCOUNTS ------------------ */

/**
 * Helper: Count client's confirmed bookings from last month
 * Assumption: booking_status === "confirmed" and we check flight departure dates
 * In production, you'd add a created_at timestamp to bookings for more accurate tracking
 */
async function getClientBookingsLastMonth(client_id) {
  try {
    const bookings = await read("booking");
    const schedules = await read("schedule");
    const flights = await read("flight");

    // Get current date and last month range
    const now = new Date();
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    // Filter confirmed bookings for this client
    const clientBookings = bookings.filter(b =>
      Number(b.client_id) === Number(client_id) &&
      (b.booking_status === "confirmed" || b.booking_status === "success")
    );

    // Count bookings where flight departure was in last month
    let count = 0;
    for (const booking of clientBookings) {
      const flight = flights.find(f => Number(f.flight_no) === Number(booking.flight_no));
      if (flight) {
        const schedule = schedules.find(s => Number(s.schedule_id) === Number(flight.schedule_id));
        if (schedule && schedule.departure_time) {
          try {
            const depDate = new Date(schedule.departure_time.replace(" ", "T"));
            if (depDate >= lastMonthStart && depDate <= lastMonthEnd) {
              count++;
            }
          } catch (e) {
            // If date parsing fails, skip
          }
        }
      }
    }

    return count;
  } catch (error) {
    console.error("Error calculating last month bookings:", error);
    return 0;
  }
}

/**
 * NEW ENDPOINT: Create booking with multiple seats and discount calculation
 * POST /booking/createMultipleSeats
 */
app.post("/booking/createMultipleSeats", async (req, res) => {
  try {
    const client_id = Number(req.body.client_id);
    const flight_no = Number(req.body.flight_no);
    const airport_code = String(req.body.airport_code || "");
    const basePricePerSeat = req.body.basePricePerSeat != null ? Number(req.body.basePricePerSeat) : null;
    const seats = Array.isArray(req.body.seats) ? req.body.seats : [];
    const departureTime = req.body.departureTime || null;

    // Validation
    if (!client_id || !flight_no || !airport_code) {
      return res.status(400).send({
        err: "client_id, flight_no, and airport_code are required"
      });
    }

    if (!basePricePerSeat || basePricePerSeat <= 0) {
      return res.status(400).send({
        err: "basePricePerSeat must be greater than 0"
      });
    }

    if (!seats || seats.length < 1 || seats.length > 10) {
      return res.status(400).send({
        err: "Must book between 1 and 10 seats"
      });
    }

    // Validate flight exists
    const flights = await read("flight");
    const flight = flights.find(f => Number(f.flight_no) === flight_no);
    if (!flight) {
      return res.status(404).send({ err: "Flight not found" });
    }

    // Get schedule for departure time if not provided
    let actualDepartureTime = departureTime;
    if (!actualDepartureTime) {
      const schedules = await read("schedule");
      const schedule = schedules.find(s => Number(s.schedule_id) === Number(flight.schedule_id));
      if (schedule) {
        actualDepartureTime = schedule.departure_time;
      }
    }

    // Validate all seats exist and are available
    const airplanes = await read("airplane");
    const seatmapAll = await read("seatmap");
    const seatavailability = await read("seatavailability");

    const airplane = airplanes.find(a => Number(a.airplane_id) === Number(flight.airplane_id));
    if (!airplane) {
      return res.status(404).send({ err: "Airplane not found for flight" });
    }

    const modelMap = seatmapAll.find(m => String(m.model) === String(airplane.model));
    if (!modelMap) {
      return res.status(404).send({ err: "Seat map not found for airplane model" });
    }

    // Validate each seat
    const validatedSeats = [];
    for (const seatReq of seats) {
      const seat_no = String(seatReq.seat_no || "");
      const seat_class = String(seatReq.seat_class || "");

      if (!seat_no) {
        return res.status(400).send({ err: `Invalid seat: seat_no is required` });
      }

      const seatInMap = modelMap.layout.find(s => String(s.seat_no) === String(seat_no));
      if (!seatInMap) {
        return res.status(400).send({ err: `Seat ${seat_no} not found in seat map` });
      }

      const normalizedRequestedClass = seat_class.toLowerCase().includes("business") ? "Business" :
        seat_class.toLowerCase().includes("economy") ? "Economy" : null;
      const normalizedSeatClass = seatInMap.seat_class.toLowerCase().includes("business") ? "Business" :
        seatInMap.seat_class.toLowerCase().includes("economy") ? "Economy" : null;

      if (normalizedRequestedClass && normalizedSeatClass && normalizedRequestedClass !== normalizedSeatClass) {
        return res.status(400).send({
          err: `Seat ${seat_no} belongs to ${normalizedSeatClass} class, but ${normalizedRequestedClass} was requested.`
        });
      }

      const existingSeat = seatavailability.find(
        s => Number(s.flight_no) === flight_no && String(s.seat_no) === seat_no
      );
      if (existingSeat && existingSeat.status === "booked") {
        return res.status(400).send({ err: `Seat ${seat_no} is already booked` });
      }

      const passenger_name = String(seatReq.passenger_name || "");
      const passenger_age = seatReq.passenger_age != null ? Number(seatReq.passenger_age) : null;

      validatedSeats.push({
        seat_no,
        seat_class: normalizedSeatClass || seat_class,
        passenger_name: passenger_name || null,
        passenger_age: passenger_age || null
      });
    }

    // Calculate customer tier based on last month's bookings
    const bookingsLastMonth = await getClientBookingsLastMonth(client_id);

    // Calculate price with all discounts
    const priceBreakdown = calculatePriceWithDiscounts({
      basePricePerSeat,
      seatCount: validatedSeats.length,
      bookingsLastMonth,
      departureTime: actualDepartureTime
    });

    // Create bookings for each seat
    const bookings = await read("booking");
    const createdBookings = [];

    const groupBookingDate = new Date().toISOString().replace('T', ' ').substring(0, 19);


    // Get the starting booking_id to ensure unique IDs for all seats in this transaction
    // Calculate max ID from current bookings to avoid conflicts
    const maxBookingId = bookings.length > 0
      ? Math.max(...bookings.map(b => Number(b.booking_id) || 0))
      : 0;
    let currentBookingId = maxBookingId + 1;

    for (const seat of validatedSeats) {
      const booking_id = currentBookingId;
      currentBookingId++; // Increment for next seat

      const newBooking = {
        booking_id,
        client_id,
        airport_code,
        ticket_id: null,
        flight_no,
        fares: basePricePerSeat,
        seat_no: seat.seat_no,
        seat_class: seat.seat_class,
        passenger_name: seat.passenger_name || null,
        passenger_age: seat.passenger_age || null,
        booking_status: "pending",
        PNR: null,
        // NEW: Store discount breakdown
        seat_count: validatedSeats.length,
        base_total: priceBreakdown.baseTotal,
        quantity_discount_percent: priceBreakdown.quantityDiscount.percent,
        quantity_discount_amount: priceBreakdown.quantityDiscount.amount,
        tier_discount_percent: priceBreakdown.tierDiscount.percent,
        tier_discount_amount: priceBreakdown.tierDiscount.amount,
        tier: priceBreakdown.tierDiscount.tier,
        advance_discount_percent: priceBreakdown.advanceDiscount.percent,
        advance_discount_amount: priceBreakdown.advanceDiscount.amount,
        total_discount_amount: priceBreakdown.totalDiscountAmount,
        final_total: priceBreakdown.finalTotal,
        booking_date: groupBookingDate
      };

      bookings.push(newBooking);
      createdBookings.push(newBooking);

      // Hold the seat for this booking
      const idx = seatavailability.findIndex(
        s => Number(s.flight_no) === flight_no && String(s.seat_no) === seat.seat_no
      );
      if (idx !== -1) {
        seatavailability[idx] = { ...seatavailability[idx], status: "held", booking_id };
      } else {
        seatavailability.push({
          flight_no,
          seat_no: seat.seat_no,
          status: "held",
          booking_id
        });
      }
    }

    await write("booking", bookings);
    await write("seatavailability", seatavailability);

    res.send({
      msg: "Multiple seat booking created successfully",
      bookings: createdBookings,
      priceBreakdown: {
        ...priceBreakdown,
        seatsBooked: validatedSeats.length
      },
      summary: {
        totalSeats: validatedSeats.length,
        baseTotal: priceBreakdown.baseTotal,
        totalDiscount: priceBreakdown.totalDiscountAmount,
        finalTotal: priceBreakdown.finalTotal,
        savings: priceBreakdown.savings
      }
    });

  } catch (e) {
    console.error("Error creating multiple seat booking:", e);
    res.status(500).send({ err: e.message || "Failed to create booking" });
  }
});

/**
 * GET endpoint to preview price with discounts before booking
 * GET /booking/calculatePrice?basePricePerSeat=5000&seatCount=3&clientId=12&flightNo=1005
 */
app.get("/booking/calculatePrice", async (req, res) => {
  try {
    const basePricePerSeat = Number(req.query.basePricePerSeat);
    const seatCount = Number(req.query.seatCount);
    const clientId = Number(req.query.clientId);
    const flightNo = Number(req.query.flightNo);

    if (!basePricePerSeat || basePricePerSeat <= 0) {
      return res.status(400).send({ err: "basePricePerSeat is required and must be > 0" });
    }

    if (!seatCount || seatCount < 1 || seatCount > 10) {
      return res.status(400).send({ err: "seatCount must be between 1 and 10" });
    }

    // Get departure time if flightNo provided
    let departureTime = null;
    if (flightNo) {
      const flights = await read("flight");
      const flight = flights.find(f => Number(f.flight_no) === flightNo);
      if (flight) {
        const schedules = await read("schedule");
        const schedule = schedules.find(s => Number(s.schedule_id) === Number(flight.schedule_id));
        if (schedule) {
          departureTime = schedule.departure_time;
        }
      }
    }

    // Get client tier
    let bookingsLastMonth = 0;
    if (clientId) {
      bookingsLastMonth = await getClientBookingsLastMonth(clientId);
    }

    // Calculate price breakdown
    const priceBreakdown = calculatePriceWithDiscounts({
      basePricePerSeat,
      seatCount,
      bookingsLastMonth,
      departureTime
    });

    res.send({
      priceBreakdown,
      clientTier: priceBreakdown.tierDiscount.tier,
      bookingsLastMonth
    });

  } catch (e) {
    console.error("Error calculating price:", e);
    res.status(500).send({ err: e.message || "Failed to calculate price" });
  }
});

// Initialize a payment for a booking
app.post("/payment/init", async (req, res) => {
  try {
    const booking_id = Number(req.body.booking_id);
    const amount = Number(req.body.amount);
    const method = String(req.body.method || "UPI"); // UPI, Card, NetBanking, Wallet

    if (!booking_id || !amount) {
      return res.status(400).send({ msg: "booking_id and amount are required" });
    }

    const bookings = await read("booking");
    const booking = bookings.find(b => Number(b.booking_id) === booking_id);
    if (!booking) return res.status(404).send({ msg: "Booking not found" });

    const payments = await read("payment");
    const payment_id = await nextId("payment", "payment_id");
    const transaction_id = "TXN" + Date.now() + Math.floor(Math.random() * 1000);
    const timestamp = new Date().toISOString();

    const payment = {
      payment_id,
      booking_id,
      amount,
      method,
      transaction_id,
      payment_status: "initiated",
      timestamp
    };

    payments.push(payment);
    await write("payment", payments);

    // mark booking as payment_initiated (without touching older bookings)
    booking.booking_status = booking.booking_status || "payment_initiated";
    await write("booking", bookings);

    res.send({ msg: "Payment initiated", payment });
  } catch (e) {
    res.send({ err: e.message });
  }
});

// Confirm or fail a payment, generate PNR, and finalize seat
app.post("/payment/confirm", async (req, res) => {
  try {
    const booking_id = Number(req.body.booking_id);
    const success = Boolean(req.body.success);

    if (!booking_id) {
      return res.status(400).send({ msg: "booking_id is required" });
    }

    const payments = await read("payment");
    const bookings = await read("booking");
    const seatavailability = await read("seatavailability");
    const boardingpasses = await read("boardingpass");
    const flights = await read("flight");
    const airports = await read("airport");
    const schedules = await read("schedule");

    const booking = bookings.find(b => Number(b.booking_id) === booking_id);
    if (!booking) return res.status(404).send({ msg: "Booking not found" });

    // get latest payment row for this booking (highest payment_id)
    const payForBooking = payments
      .filter(p => Number(p.booking_id) === booking_id)
      .sort((a, b) => Number(b.payment_id) - Number(a.payment_id))[0];

    if (!payForBooking) return res.status(404).send({ msg: "Payment not found for booking" });

    if (success) {
      payForBooking.payment_status = "success";
      const pnr = generatePNR();
      booking.PNR = pnr;
      booking.booking_status = "confirmed";

      // NEW: If this is a multiple seat booking, update ALL bookings in the same transaction
      // Identify related bookings by: same client_id, flight_no, and matching criteria
      let relatedBookings = [];

      console.log(`[Payment Confirm] Processing booking ${booking_id}: seat_count=${booking.seat_count}, booking_date=${booking.booking_date}`);

      if (booking.seat_count && booking.seat_count > 1) {
        console.log(`[Payment Confirm] Multiple seat booking detected (${booking.seat_count} seats). Finding related bookings...`);
        console.log(`[Payment Confirm] Reference booking: ID=${booking_id}, seat=${booking.seat_no}, seat_count=${booking.seat_count}, date=${booking.booking_date}`);

        // Method 1: Match by seat_count and booking_date (most reliable for new bookings)
        relatedBookings = bookings.filter(b => {
          const matches =
            Number(b.client_id) === Number(booking.client_id) &&
            Number(b.flight_no) === Number(booking.flight_no) &&
            b.seat_count === booking.seat_count &&
            b.booking_date === booking.booking_date &&
            b.booking_status === "pending";

          // Exclude the primary booking (by ID or by seat if IDs are same)
          const isPrimary = Number(b.booking_id) === Number(booking_id) ||
            (b.booking_id === booking.booking_id && b.seat_no === booking.seat_no);

          return matches && !isPrimary;
        });

        console.log(`[Payment Confirm] Method 1 (seat_count + date): Found ${relatedBookings.length} bookings`);

        // Method 2: If no matches, try matching by base_total and final_total (same transaction)
        if (relatedBookings.length === 0 && booking.base_total && booking.final_total) {
          relatedBookings = bookings.filter(b =>
            Number(b.client_id) === Number(booking.client_id) &&
            Number(b.flight_no) === Number(booking.flight_no) &&
            b.base_total === booking.base_total &&
            b.final_total === booking.final_total &&
            b.booking_status === "pending" &&
            Number(b.booking_id) !== Number(booking_id)
          );
        }

        // Method 3: Fallback - match bookings created within 5 seconds of each other
        if (relatedBookings.length === 0 && booking.booking_date) {
          try {
            const bookingDateObj = new Date(booking.booking_date.replace(" ", "T"));
            const fiveSecondsBefore = new Date(bookingDateObj.getTime() - 5000);
            const fiveSecondsAfter = new Date(bookingDateObj.getTime() + 5000);

            relatedBookings = bookings.filter(b => {
              if (Number(b.client_id) !== Number(booking.client_id) ||
                Number(b.flight_no) !== Number(booking.flight_no) ||
                b.booking_status !== "pending" ||
                Number(b.booking_id) === Number(booking_id)) {
                return false;
              }

              if (b.booking_date) {
                try {
                  const bDate = new Date(b.booking_date.replace(" ", "T"));
                  return bDate >= fiveSecondsBefore && bDate <= fiveSecondsAfter;
                } catch (e) {
                  return false;
                }
              }
              return false;
            });
          } catch (e) {
            console.error("Error matching by date:", e);
          }
        }

        console.log(`[Payment Confirm] Booking ${booking_id}: Found ${relatedBookings.length} related bookings (seat_count: ${booking.seat_count}, booking_date: ${booking.booking_date})`);

        // FALLBACK: If no matches found, try finding ALL pending bookings for same client/flight
        if (relatedBookings.length === 0) {
          console.log(`[Payment Confirm] WARNING: No related bookings found with exact matching. Trying fallback...`);
          console.log(`[Payment Confirm] Booking details: client_id=${booking.client_id}, flight_no=${booking.flight_no}, seat_count=${booking.seat_count}, booking_date=${booking.booking_date}`);

          // Find ALL pending bookings for same client/flight
          const allPendingForClientFlight = bookings.filter(b =>
            Number(b.client_id) === Number(booking.client_id) &&
            Number(b.flight_no) === Number(booking.flight_no) &&
            b.booking_status === "pending" &&
            Number(b.booking_id) !== Number(booking_id)
          );

          console.log(`[Payment Confirm] Found ${allPendingForClientFlight.length} total pending bookings for this client/flight`);

          if (allPendingForClientFlight.length > 0) {
            // If we have seat_count, try to match exactly that many
            if (booking.seat_count && booking.seat_count > 1) {
              // Sort by booking_date to get the ones created closest to this booking
              const sortedByDate = allPendingForClientFlight.sort((a, b) => {
                if (!a.booking_date && !b.booking_date) return 0;
                if (!a.booking_date) return 1;
                if (!b.booking_date) return -1;
                try {
                  const aDate = new Date(a.booking_date.replace(" ", "T"));
                  const bDate = new Date(b.booking_date.replace(" ", "T"));
                  const refDate = booking.booking_date ? new Date(booking.booking_date.replace(" ", "T")) : new Date();
                  return Math.abs(aDate - refDate) - Math.abs(bDate - refDate);
                } catch (e) {
                  return 0;
                }
              });

              // Take up to seat_count - 1 bookings (since primary booking is already confirmed)
              relatedBookings = sortedByDate.slice(0, booking.seat_count - 1);
              console.log(`[Payment Confirm] Using ${relatedBookings.length} bookings based on date proximity (expected: ${booking.seat_count - 1})`);
            } else {
              // No seat_count, but we have pending bookings - use them all (they're likely from same transaction)
              relatedBookings = allPendingForClientFlight;
              console.log(`[Payment Confirm] Using all ${relatedBookings.length} pending bookings for this client/flight`);
            }
          }
        }

        // Update all related bookings with same PNR and confirmed status
        if (relatedBookings.length > 0) {
          relatedBookings.forEach(relatedBooking => {
            relatedBooking.PNR = pnr;
            relatedBooking.booking_status = "confirmed";
            console.log(`[Payment Confirm] ✓ Updated booking ${relatedBooking.booking_id} (seat: ${relatedBooking.seat_no}) to confirmed with PNR ${pnr}`);

            // Mark all related seats as booked in seatavailability
            if (relatedBooking.seat_no) {
              const idx = seatavailability.findIndex(
                s =>
                  Number(s.flight_no) === Number(relatedBooking.flight_no) &&
                  String(s.seat_no) === String(relatedBooking.seat_no)
              );
              if (idx !== -1) {
                seatavailability[idx] = {
                  ...seatavailability[idx],
                  status: "booked",
                  booking_id: relatedBooking.booking_id
                };
              } else {
                seatavailability.push({
                  flight_no: relatedBooking.flight_no,
                  seat_no: relatedBooking.seat_no,
                  status: "booked",
                  booking_id: relatedBooking.booking_id
                });
              }
            }
          });
          console.log(`[Payment Confirm] Successfully updated ${relatedBookings.length} related bookings`);
        } else {
          console.log(`[Payment Confirm] No related bookings to update (single seat booking or no matches found)`);
        }
      } else {
        console.log(`[Payment Confirm] Single seat booking (seat_count: ${booking.seat_count || 1})`);
      }

      // mark held seat as booked for the primary booking
      if (booking.seat_no) {
        const idx = seatavailability.findIndex(
          s =>
            Number(s.flight_no) === Number(booking.flight_no) &&
            String(s.seat_no) === String(booking.seat_no)
        );
        if (idx !== -1) {
          seatavailability[idx] = {
            ...seatavailability[idx],
            status: "booked",
            booking_id
          };
        } else {
          seatavailability.push({
            flight_no: booking.flight_no,
            seat_no: booking.seat_no,
            status: "booked",
            booking_id
          });
        }
      }

      // Create boarding pass for primary booking
      const flight = flights.find(f => Number(f.flight_no) === Number(booking.flight_no));
      const schedule = flight ? schedules.find(s => Number(s.schedule_id) === Number(flight.schedule_id)) : null;
      const airport = airports.find(a => String(a.airport_code) === String(booking.airport_code));

      if (schedule && airport) {
        const depTime = new Date(schedule.departure_time);
        const boardingTime = new Date(depTime.getTime() - 30 * 60 * 1000); // 30 minutes before departure

        const boardingPassId = await nextId("boardingpass", "boarding_pass_id");
        boardingpasses.push({
          boarding_pass_id: boardingPassId,
          booking_id: booking_id,
          seat_no: booking.seat_no,
          gate: airport.gate_no,
          boarding_time: boardingTime.toISOString().replace('T', ' ').substring(0, 19)
        });

        // NEW: Create boarding passes for all related bookings in multiple seat transaction
        if (booking.seat_count && booking.seat_count > 1) {
          const relatedBookings = bookings.filter(b =>
            Number(b.client_id) === Number(booking.client_id) &&
            Number(b.flight_no) === Number(booking.flight_no) &&
            b.booking_date === booking.booking_date &&
            b.seat_count === booking.seat_count &&
            b.booking_id !== booking_id
          );

          for (const relatedBooking of relatedBookings) {
            const relatedBoardingPassId = await nextId("boardingpass", "boarding_pass_id");
            boardingpasses.push({
              boarding_pass_id: relatedBoardingPassId,
              booking_id: relatedBooking.booking_id,
              seat_no: relatedBooking.seat_no,
              gate: airport.gate_no,
              boarding_time: boardingTime.toISOString().replace('T', ' ').substring(0, 19)
            });
          }
        }

        await write("boardingpass", boardingpasses);
      }
    } else {
      payForBooking.payment_status = "failed";
      booking.booking_status = "cancelled";

      // release seat if it was held
      if (booking.seat_no) {
        const idx = seatavailability.findIndex(
          s =>
            Number(s.flight_no) === Number(booking.flight_no) &&
            String(s.seat_no) === String(booking.seat_no)
        );
        if (idx !== -1) {
          seatavailability[idx] = {
            flight_no: booking.flight_no,
            seat_no: booking.seat_no,
            status: "available",
            booking_id: null
          };
        }
      }
    }

    await write("payment", payments);
    await write("seatavailability", seatavailability);
    await write("booking", bookings);

    // Generate invoice URL for auto-download
    const invoiceUrl = `/invoice/generate/${booking_id}`;

    res.send({
      msg: "Payment processed",
      booking,
      payment: payForBooking,
      invoiceUrl: invoiceUrl
    });
  } catch (e) {
    res.send({ err: e.message });
  }
});

// Get boarding pass details for a booking
app.get("/boardingpass/:booking_id", async (req, res) => {
  try {
    const booking_id = Number(req.params.booking_id);
    const bookings = await read("booking");
    const boardingpasses = await read("boardingpass");
    const flights = await read("flight");
    const schedules = await read("schedule");
    const clients = await read("clients");
    const airports = await read("airport");

    const booking = bookings.find(b => Number(b.booking_id) === booking_id);
    if (!booking) return res.status(404).send({ msg: "Booking not found" });

    const bp = boardingpasses.find(bp => Number(bp.booking_id) === booking_id);
    const flight = flights.find(f => Number(f.flight_no) === Number(booking.flight_no));
    const schedule = flight ? schedules.find(s => Number(s.schedule_id) === Number(flight.schedule_id)) : null;
    const client = clients.find(c => Number(c.client_id) === Number(booking.client_id));
    const fromAirport = flight ? airports.find(a => String(a.airport_code) === String(flight.from_airport)) : null;
    const toAirport = flight ? airports.find(a => String(a.airport_code) === String(flight.to_airport)) : null;

    if (!bp || !schedule || !client) {
      return res.status(404).send({ msg: "Boarding pass not found or incomplete data" });
    }

    // Use passenger name from booking if available, otherwise use client name
    const passengerName = booking.passenger_name || (client ? `${client.fname} ${client.mname || ''} ${client.lname}`.trim() : "N/A");

    // Split passenger name for backward compatibility with BoardingPass.js
    const nameParts = passengerName.split(" ");
    const passengerFirstName = nameParts[0] || "";
    const passengerLastName = nameParts.slice(1).join(" ") || "";

    res.send({
      boarding_pass_id: bp.boarding_pass_id,
      booking_id: booking_id,
      PNR: booking.PNR,
      passenger_name: passengerName,
      fname: passengerFirstName, // For backward compatibility
      lname: passengerLastName,   // For backward compatibility
      flight_no: booking.flight_no,
      airline: flight ? flight.airline : null,
      from_airport: flight ? flight.from_airport : null,
      from_airport_name: fromAirport ? fromAirport.airport_name : null,
      from_city: fromAirport ? fromAirport.city : null,
      to_airport: flight ? flight.to_airport : null,
      to_airport_name: toAirport ? toAirport.airport_name : null,
      to_city: toAirport ? toAirport.city : null,
      seat_no: bp.seat_no,
      gate: bp.gate,
      departure_time: schedule.departure_time,
      arrival_time: schedule.arrival_time,
      boarding_time: bp.boarding_time,
      booking_status: booking.booking_status
    });
  } catch (e) {
    res.send({ err: e.message });
  }
});

/* ------------------ AUTO FLIGHT STATUS UPDATE ------------------ */

// Auto-update flight statuses based on departure times
async function autoUpdateFlightStatuses() {
  try {
    const flights = await read("flight");
    const schedules = await read("schedule");
    const now = new Date();

    for (const flight of flights) {
      if (!flight.schedule_id) continue;

      const schedule = schedules.find(s => Number(s.schedule_id) === Number(flight.schedule_id));
      if (!schedule || !schedule.departure_time || !schedule.arrival_time) continue;

      const depTime = new Date(schedule.departure_time.replace(" ", "T"));
      const arrTime = new Date(schedule.arrival_time.replace(" ", "T"));

      if (isNaN(depTime.getTime()) || isNaN(arrTime.getTime())) continue;

      const minutesToDeparture = (depTime.getTime() - now.getTime()) / (1000 * 60);
      const minutesSinceArrival = (now.getTime() - arrTime.getTime()) / (1000 * 60);

      let newStatusId = flight.flightstatus_id;

      // Update status based on time
      if (minutesSinceArrival > 0) {
        // Flight has landed
        newStatusId = 62; // Landed
      } else if (minutesToDeparture < 0 && minutesSinceArrival <= 0) {
        // Flight is in the air (departed but not landed)
        newStatusId = 61; // Departed
      } else if (minutesToDeparture >= 0 && minutesToDeparture <= 30) {
        // Within 30 minutes of departure - boarding
        newStatusId = 64; // Boarding
      } else if (minutesToDeparture > 30 && minutesToDeparture <= 60) {
        // Within 1 hour - could be delayed or on time (keep current if delayed)
        if (flight.flightstatus_id !== 63) { // Don't override delayed status
          newStatusId = 65; // On Time
        }
      } else {
        // More than 1 hour away - on time (unless already marked delayed)
        if (flight.flightstatus_id !== 63) {
          newStatusId = 65; // On Time
        }
      }

      // Only update if status changed
      if (Number(flight.flightstatus_id) !== Number(newStatusId)) {
        flight.flightstatus_id = newStatusId;
        console.log(`[Auto Status Update] Flight ${flight.flight_no}: Updated to status ${newStatusId}`);
      }
    }

    await write("flight", flights);
  } catch (e) {
    console.error("Error auto-updating flight statuses:", e);
  }
}

// Run auto-update every minute
setInterval(autoUpdateFlightStatuses, 60000); // 60000ms = 1 minute
// Also run immediately on server start
autoUpdateFlightStatuses();

/* ------------------ CANCELLATION + REFUNDS ------------------ */

// Calculate cancellation charges
function calculateCancellationCharges(bookingAmount, hoursBeforeDeparture) {
  let chargePercent = 0;

  if (hoursBeforeDeparture > 48) {
    // More than 48 hours: 10% charge
    chargePercent = 10;
  } else if (hoursBeforeDeparture > 24) {
    // 24-48 hours: 25% charge
    chargePercent = 25;
  } else if (hoursBeforeDeparture > 12) {
    // 12-24 hours: 50% charge
    chargePercent = 50;
  } else if (hoursBeforeDeparture > 0) {
    // Less than 12 hours: 75% charge
    chargePercent = 75;
  } else {
    // After departure: 100% charge (no refund)
    chargePercent = 100;
  }

  const chargeAmount = (bookingAmount * chargePercent) / 100;
  const refundAmount = bookingAmount - chargeAmount;

  return {
    chargePercent,
    chargeAmount,
    refundAmount,
    bookingAmount
  };
}

// Cancel a booking and trigger refund logic
app.post("/booking/cancel", async (req, res) => {
  try {
    const booking_id = Number(req.body.booking_id);
    if (!booking_id) {
      return res.status(400).send({ msg: "booking_id is required" });
    }

    const bookings = await read("booking");
    const flights = await read("flight");
    const schedules = await read("schedule");
    const payments = await read("payment");
    const seatavailability = await read("seatavailability");

    const booking = bookings.find(b => Number(b.booking_id) === booking_id);
    if (!booking) return res.status(404).send({ msg: "Booking not found" });

    // Determine if before departure using flight -> schedule
    let beforeDeparture = false;
    let hoursBeforeDeparture = null;
    if (booking.flight_no) {
      const flight = flights.find(f => Number(f.flight_no) === Number(booking.flight_no));
      if (flight && flight.schedule_id) {
        const sch = schedules.find(s => Number(s.schedule_id) === Number(flight.schedule_id));
        if (sch && sch.departure_time) {
          // schedule.departure_time e.g. "2025-01-03 06:10:00"
          const dep = new Date(sch.departure_time.replace(" ", "T"));
          const now = new Date();
          if (!isNaN(dep.getTime())) {
            const diffMs = dep.getTime() - now.getTime();
            hoursBeforeDeparture = diffMs / (1000 * 60 * 60);
            if (diffMs > 0) {
              beforeDeparture = true;
            }
          }
        }
      }
    }

    // Calculate cancellation charges
    const bookingAmount = booking.final_total || booking.fares || 0;
    const cancellationCharges = calculateCancellationCharges(
      bookingAmount,
      hoursBeforeDeparture !== null ? hoursBeforeDeparture : -1
    );

    // Mark booking cancelled
    booking.booking_status = "cancelled";
    booking.cancellation_charge_percent = cancellationCharges.chargePercent;
    booking.cancellation_charge_amount = cancellationCharges.chargeAmount;
    booking.refund_amount = cancellationCharges.refundAmount;

    // Find latest successful payment for this booking
    const payment = payments
      .filter(p => Number(p.booking_id) === booking_id)
      .sort((a, b) => Number(b.payment_id || 0) - Number(a.payment_id || 0))[0];

    let refundInfo = null;

    if (payment && payment.payment_status === "success") {
      if (beforeDeparture) {
        const method = String(payment.method || "").toUpperCase();
        if (method === "UPI") {
          // Instant refund for UPI
          payment.payment_status = "refunded";
          payment.refund_timestamp = new Date().toISOString();
          refundInfo = {
            type: "instant",
            method: payment.method,
            status: payment.payment_status
          };
        } else if (method === "CARD" || method === "DEBIT" || method === "CREDIT") {
          // 2–5 day processing for cards
          const days = 2 + Math.floor(Math.random() * 4); // 2..5
          payment.payment_status = "refund_pending";
          payment.refund_eta_days = days;
          refundInfo = {
            type: "delayed",
            method: payment.method,
            status: payment.payment_status,
            eta_days: days
          };
        } else {
          // NetBanking / Wallet etc. — treat as delayed refund
          const days = 2 + Math.floor(Math.random() * 4);
          payment.payment_status = "refund_pending";
          payment.refund_eta_days = days;
          refundInfo = {
            type: "delayed",
            method: payment.method,
            status: payment.payment_status,
            eta_days: days
          };
        }
      } else {
        // After departure: no refund applicable
        payment.payment_status = payment.payment_status || "success";
        payment.refund_eta_days = 0;
        refundInfo = {
          type: "no_refund",
          method: payment.method,
          status: payment.payment_status
        };
      }
    }

    // Release any seats associated with this booking
    for (let i = 0; i < seatavailability.length; i++) {
      const s = seatavailability[i];
      if (Number(s.booking_id) === booking_id) {
        seatavailability[i] = {
          flight_no: s.flight_no,
          seat_no: s.seat_no,
          status: "available",
          booking_id: null
        };
      }
    }

    // Update flight status if needed (check if flight has bookings)
    if (booking.flight_no) {
      const flight = flights.find(f => Number(f.flight_no) === Number(booking.flight_no));
      if (flight) {
        // Check if flight has any confirmed bookings left
        const confirmedBookingsForFlight = bookings.filter(b =>
          Number(b.flight_no) === Number(booking.flight_no) &&
          (b.booking_status === "confirmed" || b.booking_status === "success") &&
          Number(b.booking_id) !== Number(booking_id)
        );

        // If no confirmed bookings left and flight hasn't departed, consider updating status
        if (confirmedBookingsForFlight.length === 0 && beforeDeparture) {
          const schedule = schedules.find(s => Number(s.schedule_id) === Number(flight.schedule_id));
          if (schedule && schedule.departure_time) {
            const dep = new Date(schedule.departure_time.replace(" ", "T"));
            const now = new Date();
            const minutesToDeparture = (dep.getTime() - now.getTime()) / (1000 * 60);

            // Only update if flight is more than 1 hour away (don't change boarding/departed status)
            if (minutesToDeparture > 60 && flight.flightstatus_id !== 63) {
              // Keep current status, but this cancellation might affect availability
              console.log(`[Cancellation] Flight ${flight.flight_no}: Booking cancelled, ${confirmedBookingsForFlight.length} confirmed bookings remaining`);
            }
          }
        }
      }
    }

    await write("booking", bookings);
    await write("payment", payments);
    await write("seatavailability", seatavailability);
    await write("flight", flights);

    res.send({
      msg: "Booking cancelled",
      booking,
      refund: refundInfo,
      beforeDeparture,
      cancellationCharges: {
        chargePercent: cancellationCharges.chargePercent,
        chargeAmount: cancellationCharges.chargeAmount,
        refundAmount: cancellationCharges.refundAmount,
        bookingAmount: cancellationCharges.bookingAmount
      }
    });
  } catch (e) {
    res.send({ err: e.message });
  }
});

// Get cancellation charges preview before cancelling
app.get("/booking/cancellationCharges/:booking_id", async (req, res) => {
  try {
    const booking_id = Number(req.params.booking_id);
    if (!booking_id) {
      return res.status(400).send({ err: "booking_id is required" });
    }

    const bookings = await read("booking");
    const flights = await read("flight");
    const schedules = await read("schedule");

    const booking = bookings.find(b => Number(b.booking_id) === booking_id);
    if (!booking) {
      return res.status(404).send({ err: "Booking not found" });
    }

    let hoursBeforeDeparture = null;
    if (booking.flight_no) {
      const flight = flights.find(f => Number(f.flight_no) === Number(booking.flight_no));
      if (flight && flight.schedule_id) {
        const sch = schedules.find(s => Number(s.schedule_id) === Number(flight.schedule_id));
        if (sch && sch.departure_time) {
          const dep = new Date(sch.departure_time.replace(" ", "T"));
          const now = new Date();
          if (!isNaN(dep.getTime())) {
            const diffMs = dep.getTime() - now.getTime();
            hoursBeforeDeparture = diffMs / (1000 * 60 * 60);
          }
        }
      }
    }

    const bookingAmount = booking.final_total || booking.fares || 0;

    if (bookingAmount <= 0) {
      console.warn(`[Cancellation Charges] Booking ${booking_id} has invalid amount: ${bookingAmount}`);
    }

    const cancellationCharges = calculateCancellationCharges(
      bookingAmount,
      hoursBeforeDeparture !== null ? hoursBeforeDeparture : -1
    );

    console.log(`[Cancellation Charges] Booking ${booking_id}: Amount=${bookingAmount}, HoursBefore=${hoursBeforeDeparture}, Charge=${cancellationCharges.chargePercent}%`);

    res.send({
      booking_id,
      cancellationCharges,
      hoursBeforeDeparture: hoursBeforeDeparture !== null ? hoursBeforeDeparture : -1
    });
  } catch (e) {
    console.error("Error getting cancellation charges:", e);
    console.error("Error stack:", e.stack);
    res.status(500).send({ err: e.message || "Failed to get cancellation charges" });
  }
});

// Helper: get latest payment / refund status for a booking
app.get("/payment/status/:booking_id", async (req, res) => {
  try {
    const booking_id = Number(req.params.booking_id);
    if (!booking_id) {
      return res.status(400).send({ msg: "booking_id is required" });
    }

    const bookings = await read("booking");
    const payments = await read("payment");

    const booking = bookings.find(b => Number(b.booking_id) === booking_id);
    if (!booking) return res.status(404).send({ msg: "Booking not found" });

    const payment = payments
      .filter(p => Number(p.booking_id) === booking_id)
      .sort((a, b) => Number(b.payment_id || 0) - Number(a.payment_id || 0))[0] || null;

    res.send({
      booking_id,
      booking_status: booking.booking_status || null,
      PNR: booking.PNR || null,
      latest_payment: payment
    });
  } catch (e) {
    res.send({ err: e.message });
  }
});



app.get("/booking/api/getFull", async (req, res) => {
  try {
    const bookings = await read("booking");
    const clients = await read("clients");
    const flights = await read("flight");
    const airports = await read("airport");
    const schedules = await read("schedule");
    const payments = await read("payment");

    const out = bookings.map(b => {
      const client = clients.find(c => Number(c.client_id) === Number(b.client_id));
      const flight = flights.find(f => Number(f.flight_no) === Number(b.flight_no));
      const schedule = flight ? schedules.find(s => Number(s.schedule_id) === Number(flight.schedule_id)) : null;
      const airport = airports.find(a => String(a.airport_code) === String(b.airport_code));

      // latest payment
      const payment = payments
        .filter(p => Number(p.booking_id) === Number(b.booking_id))
        .sort((a, b) => Number(b.payment_id) - Number(a.payment_id))[0] || null;

      return {
        booking_id: b.booking_id,
        client_id: b.client_id,
        passenger_name: client ? `${client.fname} ${client.lname}` : "Unknown",

        flight_no: b.flight_no,
        airline: flight ? flight.airline : null,
        from_airport: flight ? flight.from_airport : null,
        to_airport: flight ? flight.to_airport : null,

        departure_time: schedule ? schedule.departure_time : null,
        arrival_time: schedule ? schedule.arrival_time : null,

        airport_code: b.airport_code,
        city: airport ? airport.city : null,

        ticket_id: b.ticket_id,
        fares: b.fares,

        seat_no: b.seat_no || "-",
        booking_status: b.booking_status || "pending",
        PNR: b.PNR || "-",

        payment_status: payment ? payment.payment_status : "Not Paid",
        payment_method: payment ? payment.method : null
      };
    });

    res.send(out);

  } catch (e) {
    res.send({ err: e.message });
  }
});



/* ------------------ UTILITY: Fix Pending Bookings ------------------ */

/**
 * POST endpoint to fix pending bookings that should be confirmed
 * This is a utility endpoint to fix existing bookings where payment was confirmed
 * but related bookings weren't updated
 * POST /booking/fixPendingBookings
 * Body: { booking_id: number } - The confirmed booking_id to use as reference
 */
app.post("/booking/fixPendingBookings", async (req, res) => {
  try {
    const reference_booking_id = Number(req.body.booking_id);

    if (!reference_booking_id) {
      return res.status(400).send({ err: "booking_id is required" });
    }

    const bookings = await read("booking");
    const referenceBooking = bookings.find(b => Number(b.booking_id) === reference_booking_id);

    if (!referenceBooking) {
      return res.status(404).send({ err: "Reference booking not found" });
    }

    if (referenceBooking.booking_status !== "confirmed") {
      return res.status(400).send({ err: "Reference booking must be confirmed" });
    }

    // Find all related pending bookings
    let relatedBookings = [];

    if (referenceBooking.seat_count && referenceBooking.seat_count > 1) {
      // Match by seat_count and booking_date
      relatedBookings = bookings.filter(b =>
        Number(b.client_id) === Number(referenceBooking.client_id) &&
        Number(b.flight_no) === Number(referenceBooking.flight_no) &&
        b.seat_count === referenceBooking.seat_count &&
        b.booking_date === referenceBooking.booking_date &&
        b.booking_status === "pending" &&
        Number(b.booking_id) !== Number(reference_booking_id)
      );

      // If no matches, try by base_total and final_total
      if (relatedBookings.length === 0 && referenceBooking.base_total && referenceBooking.final_total) {
        relatedBookings = bookings.filter(b =>
          Number(b.client_id) === Number(referenceBooking.client_id) &&
          Number(b.flight_no) === Number(referenceBooking.flight_no) &&
          b.base_total === referenceBooking.base_total &&
          b.final_total === referenceBooking.final_total &&
          b.booking_status === "pending" &&
          Number(b.booking_id) !== Number(reference_booking_id)
        );
      }
    }

    // Update all related bookings
    const updated = [];
    relatedBookings.forEach(relatedBooking => {
      relatedBooking.PNR = referenceBooking.PNR;
      relatedBooking.booking_status = "confirmed";
      updated.push(relatedBooking.booking_id);
    });

    await write("booking", bookings);

    res.send({
      msg: `Fixed ${updated.length} pending bookings`,
      reference_booking_id,
      updated_booking_ids: updated
    });

  } catch (e) {
    console.error("Error fixing pending bookings:", e);
    res.status(500).send({ err: e.message || "Failed to fix pending bookings" });
  }
});

/* ------------------ INVOICE GENERATION ------------------ */

// Generate invoice HTML for a booking (can be converted to PDF on client side)
app.get("/invoice/generate/:booking_id", async (req, res) => {
  try {
    const booking_id = Number(req.params.booking_id);
    if (!booking_id) {
      return res.status(400).send({ err: "booking_id is required" });
    }

    const bookings = await read("booking");
    const flights = await read("flight");
    const schedules = await read("schedule");
    const clients = await read("clients");
    const airports = await read("airport");
    const payments = await read("payment");

    const booking = bookings.find(b => Number(b.booking_id) === booking_id);
    if (!booking) return res.status(404).send({ err: "Booking not found" });

    // Find all related bookings (same PNR, same transaction)
    let relatedBookings = [booking];
    if (booking.PNR) {
      // Find all bookings with same PNR, client_id, flight_no, and booking_date
      const related = bookings.filter(b =>
        b.PNR === booking.PNR &&
        Number(b.client_id) === Number(booking.client_id) &&
        Number(b.flight_no) === Number(booking.flight_no) &&
        b.booking_date === booking.booking_date &&
        Number(b.booking_id) !== Number(booking_id)
      );
      relatedBookings = [booking, ...related];
    } else if (booking.seat_count && booking.seat_count > 1) {
      // If no PNR yet, match by seat_count and booking_date
      const related = bookings.filter(b =>
        Number(b.client_id) === Number(booking.client_id) &&
        Number(b.flight_no) === Number(booking.flight_no) &&
        b.seat_count === booking.seat_count &&
        b.booking_date === booking.booking_date &&
        Number(b.booking_id) !== Number(booking_id)
      );
      relatedBookings = [booking, ...related];
    }

    const flight = flights.find(f => Number(f.flight_no) === Number(booking.flight_no));
    const schedule = flight ? schedules.find(s => Number(s.schedule_id) === Number(flight.schedule_id)) : null;
    const client = clients.find(c => Number(c.client_id) === Number(booking.client_id));
    const fromAirport = flight ? airports.find(a => String(a.airport_code) === String(flight.from_airport)) : null;
    const toAirport = flight ? airports.find(a => String(a.airport_code) === String(flight.to_airport)) : null;
    const payment = payments
      .filter(p => Number(p.booking_id) === booking_id)
      .sort((a, b) => Number(b.payment_id || 0) - Number(a.payment_id || 0))[0] || null;

    // Generate passenger list HTML
    const passengerRows = relatedBookings.map(b => {
      const passengerName = b.passenger_name || (client ? `${client.fname} ${client.lname}` : "N/A");
      return `
        <tr>
          <td>${passengerName}</td>
          <td>${b.passenger_age || "N/A"}</td>
          <td>${b.seat_no || "N/A"}</td>
          <td>${b.seat_class || "N/A"}</td>
        </tr>
      `;
    }).join("");

    // Generate HTML invoice
    const invoiceHTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Invoice - Booking ${booking_id}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .header { text-align: center; margin-bottom: 30px; }
    .header h1 { color: #1a237e; margin: 0; }
    .info-section { margin-bottom: 20px; }
    .info-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
    .info-label { font-weight: bold; }
    .details-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .details-table th, .details-table td { border: 1px solid #ddd; padding: 10px; text-align: left; }
    .details-table th { background-color: #1a237e; color: white; }
    .total-section { text-align: right; margin-top: 20px; font-size: 18px; font-weight: bold; }
    .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>StarJet Airlines Airways</h1>
    <h2>Invoice</h2>
  </div>
  
  <div class="info-section">
    <div class="info-row">
      <span class="info-label">Invoice Number:</span>
      <span>INV-${booking_id}-${Date.now()}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Invoice Date:</span>
      <span>${new Date().toLocaleDateString()}</span>
    </div>
    <div class="info-row">
      <span class="info-label">PNR:</span>
      <span>${booking.PNR || "N/A"}</span>
    </div>
  </div>

  <div class="info-section">
    <h3>Passenger Details</h3>
    <table class="details-table">
      <thead>
        <tr>
          <th>Passenger Name</th>
          <th>Age</th>
          <th>Seat Number</th>
          <th>Class</th>
        </tr>
      </thead>
      <tbody>
        ${passengerRows}
      </tbody>
    </table>
    <div class="info-row" style="margin-top: 15px;">
      <span class="info-label">Email:</span>
      <span>${client ? client.email || "N/A" : "N/A"}</span>
    </div>
  </div>

  <div class="info-section">
    <h3>Flight Details</h3>
    <div class="info-row">
      <span class="info-label">Flight Number:</span>
      <span>${booking.flight_no || "N/A"}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Airline:</span>
      <span>${flight ? flight.airline || "N/A" : "N/A"}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Route:</span>
      <span>${fromAirport ? fromAirport.city : flight ? flight.from_airport : "N/A"} → ${toAirport ? toAirport.city : flight ? flight.to_airport : "N/A"}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Departure:</span>
      <span>${schedule ? schedule.departure_time : "N/A"}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Arrival:</span>
      <span>${schedule ? schedule.arrival_time : "N/A"}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Total Seats:</span>
      <span>${relatedBookings.length}</span>
    </div>
  </div>

  <table class="details-table">
    <thead>
      <tr>
        <th>Description</th>
        <th>Amount</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Base Fare</td>
        <td>₹${(booking.fares || 0).toLocaleString()}</td>
      </tr>
      ${booking.quantity_discount_amount ? `<tr><td>Quantity Discount (${booking.quantity_discount_percent}%)</td><td>-₹${booking.quantity_discount_amount.toLocaleString()}</td></tr>` : ""}
      ${booking.tier_discount_amount ? `<tr><td>${booking.tier || ""} Tier Discount (${booking.tier_discount_percent}%)</td><td>-₹${booking.tier_discount_amount.toLocaleString()}</td></tr>` : ""}
      ${booking.advance_discount_amount ? `<tr><td>Advance Booking Discount (${booking.advance_discount_percent}%)</td><td>-₹${booking.advance_discount_amount.toLocaleString()}</td></tr>` : ""}
      <tr>
        <td><strong>Total Amount</strong></td>
        <td><strong>₹${(booking.final_total || booking.fares || 0).toLocaleString()}</strong></td>
      </tr>
    </tbody>
  </table>

  <div class="info-section">
    <h3>Payment Details</h3>
    <div class="info-row">
      <span class="info-label">Payment Method:</span>
      <span>${payment ? payment.method || "N/A" : "N/A"}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Transaction ID:</span>
      <span>${payment ? payment.transaction_id || "N/A" : "N/A"}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Payment Status:</span>
      <span>${payment ? payment.payment_status || "N/A" : "N/A"}</span>
    </div>
  </div>

  <div class="footer">
    <p>Thank you for choosing StarJet Airlines!</p>
    <p>This is a computer-generated invoice and does not require a signature.</p>
  </div>
</body>
</html>`;

    res.setHeader("Content-Type", "text/html");
    res.setHeader("Content-Disposition", `attachment; filename="invoice-${booking_id}.html"`);
    res.send(invoiceHTML);
  } catch (e) {
    res.send({ err: e.message });
  }
});

/* ------------------ START SERVER ------------------ */

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}!`);
});