// import React from "react";
// import { useParams } from "react-router-dom";
// import {
//   Nav,
//   Logo,
//   LogoContainer,
//   AirlineName,
//   NavMenu,
//   NavLink,
//   NavBtn,
//   NavBtnLink
// } from "../Navbar/NavbarElements";
// import logo from "../../images/logo.png"

// const CustomerNavbar = () => {
//   const { id } = useParams();

//   return (
//     <Nav>
//       <LogoContainer>
//         <Logo src={logo} alt="Airline Logo" />
//         <AirlineName>StarJet Airlines</AirlineName>
//       </LogoContainer>

//       <NavMenu>
//         <NavLink to={`/ViewProfile/${id}`}>View Profile</NavLink>
//         <NavLink to={`/BookTicket/${id}`}>Book Flight</NavLink>
//         <NavLink to={`/ViewCustomerTickets/${id}`}>View Tickets</NavLink>
//         <NavLink to={`/AddReviews/${id}`}>Add Review</NavLink>
//       </NavMenu>

//       <NavBtn>
//         <NavBtnLink to="/">Logout</NavBtnLink>
//       </NavBtn>
//     </Nav>
//   );
// };

// export default CustomerNavbar;

import React from "react";
import { useParams, Link } from "react-router-dom";
import {
  Nav,
  Logo,
  LogoContainer,
  AirlineName,
  NavMenu,
  NavLink,
  NavBtn,
  NavBtnLink
} from "../Navbar/NavbarElements";
import logo from "../../images/logo.png";

import Footer from "./Footer";

const pageStyles = {
  wrapper: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #f5f7fb, #e4f0ff)",
    fontFamily:
      'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  content: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "24px 16px 40px",
    paddingTop: "100px",
  },
  hero: {
    background:"linear-gradient(135deg,rgb(74, 121, 216), #e4f0ff)",
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: "24px",
    padding: "24px 40px 8px",
    borderRadius:"20px",
  },
  heroText: {
    flex: "1 1 320px",
  },
  heroTitle: {
    fontSize: "32px",
    fontWeight: 700,
    color: "#0f172a",
    marginBottom: "8px",
  },
  heroSubtitle: {
    fontSize: "14px",
    color: "#4b5563",
    maxWidth: "480px",
    marginBottom: "16px",
  },
  heroCtaRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    alignItems: "center",
  },
  heroPrimaryBtn: {
    padding: "10px 20px",
    borderRadius: "999px",
    border: "none",
    backgroundColor: "#0d47a1",
    color: "#fff",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    textDecoration: "none",
    display: "inline-block",
  },
  heroSecondaryText: {
    fontSize: "13px",
    color: "#6b7280",
  },
  heroImageWrapper: {
    flex: "1 1 320px",
    display: "flex",
    justifyContent: "flex-end",
  },
  heroImage: {
    width: "100%",
    maxWidth: "420px",
    borderRadius: "18px",
    objectFit: "cover",
    boxShadow: "0 12px 30px rgba(15,23,42,0.35)",
  },
  section: {
    marginTop: "32px",
  },
  sectionHeaderRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    gap: "8px",
    marginBottom: "12px",
  },
  sectionTitle: {
    fontSize: "20px",
    fontWeight: 700,
    color: "#0f172a",
  },
  sectionSubtitle: {
    fontSize: "13px",
    color: "#6b7280",
  },
  destinationsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "16px",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 8px 20px rgba(15,23,42,0.10)",
    display: "flex",
    flexDirection: "column",
  },
  cardImage: {
    width: "100%",
    height: "170px",
    objectFit: "cover",
  },
  cardBody: {
    padding: "12px 14px 14px",
  },
  cardTitleRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  cardTitle: {
    fontSize: "15px",
    fontWeight: 700,
    color: "#111827",
  },
  cardBadge: {
    fontSize: "11px",
    padding: "4px 8px",
    borderRadius: "999px",
    backgroundColor: "#e0f2fe",
    color: "#0369a1",
    fontWeight: 600,
  },
  cardMeta: {
    fontSize: "12px",
    color: "#6b7280",
    marginTop: "4px",
  },
  cardPrice: {
    fontSize: "13px",
    color: "#0f172a",
    fontWeight: 600,
    marginTop: "6px",
  },
  offersGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "16px",
  },
  offerCard: {
    backgroundColor: "#0b1120",
    color: "#e5e7eb",
    borderRadius: "16px",
    padding: "14px 16px",
    boxShadow: "0 10px 30px rgba(15,23,42,0.5)",
  },
  offerTitle: {
    fontSize: "15px",
    fontWeight: 700,
    marginBottom: "4px",
  },
  offerText: {
    fontSize: "12px",
    color: "#9ca3af",
    marginBottom: "6px",
  },
  offerTag: {
    display: "inline-block",
    fontSize: "11px",
    padding: "3px 8px",
    borderRadius: "999px",
    backgroundColor: "#1d4ed8",
    color: "#e5e7eb",
    fontWeight: 600,
  },
  whyList: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "12px",
    marginTop: "6px",
  },
  whyItem: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    padding: "10px 12px",
    boxShadow: "0 4px 12px rgba(15,23,42,0.08)",
  },
  whyTitle: {
    fontSize: "14px",
    fontWeight: 700,
    color: "#111827",
    marginBottom: "4px",
  },
  whyText: {
    fontSize: "12px",
    color: "#6b7280",
  },
  // Responsive tweaks
  "@media (maxWidth: 768px)": {
    heroTitle: {
      fontSize: "24px",
    },
  },
};

const CustomerNavbar = () => {
  const { id } = useParams();

  return (
    <div style={pageStyles.wrapper}>
      {/* Navbar */}
      <Nav>
        <LogoContainer>
          <Link to={`/CustomerPanel/${id}`} style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
            <Logo src={logo} alt="Airline Logo" />
            <AirlineName>StarJet Airlines</AirlineName>
          </Link>
        </LogoContainer>

        <NavMenu>
          <NavLink to={`/ViewProfile/${id}`}>View Profile</NavLink>
          <NavLink to={`/BookTicket/${id}`}>Book Flight</NavLink>
          <NavLink to={`/ViewCustomerTickets/${id}`}>View Tickets</NavLink>
          <NavLink to={`/AddReviews/${id}`}>Add Review</NavLink>
        </NavMenu>

        <NavBtn>
          <NavBtnLink to="/">Logout</NavBtnLink>
        </NavBtn>
      </Nav>

      {/* Page Content */}
      <main style={pageStyles.content}>
        {/* Hero Section */}
        <section style={pageStyles.hero}>
          <div style={pageStyles.heroText}>
            <h1 style={pageStyles.heroTitle}>
              Welcome aboard, StarJet Explorer.
            </h1>
            <p style={pageStyles.heroSubtitle}>
              Discover handpicked destinations, flexible fares and seamless
              booking for your next journey. Your next adventure is just one
              click away.
            </p>
            <div style={pageStyles.heroCtaRow}>
              <Link
                to={`/BookTicket/${id}`}
                style={pageStyles.heroPrimaryBtn}
              >
                Book a Flight
              </Link>
              <span style={pageStyles.heroSecondaryText}>
                ✈️ No change fee on most StarSaver fares.
              </span>
            </div>
          </div>

          <div style={pageStyles.heroImageWrapper}>
            <img
              style={pageStyles.heroImage}
              src="https://www.shutterstock.com/image-photo/stunning-view-airplane-window-600nw-2496023657.jpg"
              alt="Airplane view"
            />
          </div>
        </section>

        {/* Popular Destinations */}
        <section style={pageStyles.section}>
          <div style={pageStyles.sectionHeaderRow}>
            <h2 style={pageStyles.sectionTitle}>Popular Destinations</h2>
            <span style={pageStyles.sectionSubtitle}>
              Curated routes with great fares and timings.
            </span>
          </div>

          <div style={pageStyles.destinationsGrid}>
            {/* Destination 1 */}
            <article style={pageStyles.card}>
              <img
                src="https://cf.bstatic.com/xdata/images/hotel/max1024x768/615840570.jpg?k=dc452d890726edd24360afe0365101432e2e7e67d34bc2d31e410752687eecc9&o="
                alt="Dubai"
                style={pageStyles.cardImage}
              />
              <div style={pageStyles.cardBody}>
                <div style={pageStyles.cardTitleRow}>
                  <h3 style={pageStyles.cardTitle}>Dubai</h3>
                  <span style={pageStyles.cardBadge}>Trending</span>
                </div>
                <p style={pageStyles.cardMeta}>
                  Daily non-stop flights · 7h 15m average
                </p>
                <p style={pageStyles.cardPrice}>From ₹24,999 one-way*</p>
              </div>
            </article>

            {/* Destination 2 */}
            <article style={pageStyles.card}>
              <img
                src="https://img.static-af.com/transform/45cb9a13-b167-4842-8ea8-05d0cc7a4d04/"
                alt="Paris"
                style={pageStyles.cardImage}
              />
              <div style={pageStyles.cardBody}>
                <div style={pageStyles.cardTitleRow}>
                  <h3 style={pageStyles.cardTitle}>Paris</h3>
                  <span style={pageStyles.cardBadge}>New Route</span>
                </div>
                <p style={pageStyles.cardMeta}>
                  Via Doha · Carefully timed layovers
                </p>
                <p style={pageStyles.cardPrice}>From ₹37,499 return*</p>
              </div>
            </article>

            {/* Destination 3 */}
            <article style={pageStyles.card}>
              <img
                src="https://images.goway.com/production/featured_images/shutterstock_1116483092.jpg"
                alt="Singapore"
                style={pageStyles.cardImage}
              />
              <div style={pageStyles.cardBody}>
                <div style={pageStyles.cardTitleRow}>
                  <h3 style={pageStyles.cardTitle}>Singapore</h3>
                  <span style={pageStyles.cardBadge}>Best Value</span>
                </div>
                <p style={pageStyles.cardMeta}>
                  Morning & evening departures every day
                </p>
                <p style={pageStyles.cardPrice}>From ₹18,999 one-way*</p>
              </div>
            </article>

            {/* Destination 4 */}
            <article style={pageStyles.card}>
              <img
                src="https://cdn.britannica.com/61/93061-050-99147DCE/Statue-of-Liberty-Island-New-York-Bay.jpg"
                alt="New York"
                style={pageStyles.cardImage}
              />
              <div style={pageStyles.cardBody}>
                <div style={pageStyles.cardTitleRow}>
                  <h3 style={pageStyles.cardTitle}>New York</h3>
                  <span style={pageStyles.cardBadge}>Long Haul</span>
                </div>
                <p style={pageStyles.cardMeta}>
                  Carefully selected partner connections
                </p>
                <p style={pageStyles.cardPrice}>From ₹52,999 return*</p>
              </div>
            </article>
          </div>
        </section>

        {/* Offers Section */}
        <section style={pageStyles.section}>
          <div style={pageStyles.sectionHeaderRow}>
            <h2 style={pageStyles.sectionTitle}>Current Offers</h2>
            <span style={pageStyles.sectionSubtitle}>
              Save more when you fly with StarJet.
            </span>
          </div>

          <div style={pageStyles.offersGrid}>
            <div style={pageStyles.offerCard}>
              <h3 style={pageStyles.offerTitle}>StarSaver Weekend Deals</h3>
              <p style={pageStyles.offerText}>
                Exclusive fares every Friday–Sunday on select domestic routes.
                Limited seats, book early.
              </p>
              <span style={pageStyles.offerTag}>Up to 25% off</span>
            </div>

            <div style={pageStyles.offerCard}>
              <h3 style={pageStyles.offerTitle}>Student & Youth Fares</h3>
              <p style={pageStyles.offerText}>
                Extra baggage allowance and flexible date changes for students
                travelling abroad.
              </p>
              <span style={pageStyles.offerTag}>ID required</span>
            </div>

            <div style={pageStyles.offerCard}>
              <h3 style={pageStyles.offerTitle}>StarPoints Loyalty</h3>
              <p style={pageStyles.offerText}>
                Earn points on every booking and redeem them for seat upgrades,
                extra baggage and more.
              </p>
              <span style={pageStyles.offerTag}>Join for free</span>
            </div>
          </div>
        </section>

        {/* Why StarJet Section */}
        <section style={pageStyles.section}>
          <h2 style={pageStyles.sectionTitle}>Why fly with StarJet?</h2>
          <div style={pageStyles.whyList}>
            <div style={pageStyles.whyItem}>
              <h3 style={pageStyles.whyTitle}>On-time Performance</h3>
              <p style={pageStyles.whyText}>
                Carefully planned schedules and quick turnarounds to keep your
                flights on time, consistently.
              </p>
            </div>
            <div style={pageStyles.whyItem}>
              <h3 style={pageStyles.whyTitle}>Transparent Pricing</h3>
              <p style={pageStyles.whyText}>
                No hidden charges. See your total fare upfront, including taxes
                and surcharges.
              </p>
            </div>
            <div style={pageStyles.whyItem}>
              <h3 style={pageStyles.whyTitle}>Dedicated Support</h3>
              <p style={pageStyles.whyText}>
                24/7 customer support to help you with bookings, changes and
                special assistance.
              </p>
            </div>
            <div style={pageStyles.whyItem}>
              <h3 style={pageStyles.whyTitle}>Seamless Experience</h3>
              <p style={pageStyles.whyText}>
                Easy web check-in, seat selection and ticket management from
                your dashboard.
              </p>
            </div>
          </div>
        </section>

        <p style={{ fontSize: "10px", color: "#9ca3af", marginTop: "18px" }}>
          *Sample fares shown for illustration only. Actual prices may vary at
          the time of booking.
        </p>
      </main>
      <Footer></Footer>
    </div>
  );
};

export default CustomerNavbar;