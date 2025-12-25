import React from "react";
import "./styles/Contact.css";
import Footer from "./Footer";
import { MDBRow, MDBCol } from "mdb-react-ui-kit";
import marker from "../../images/marker.jpg";
import mobilenotch from "../../images/mobile-notch.png";
import timecheck from "../../images/time-check.png";

const Contact = () => {
  return (
    <>
      {/* HEADER */}
      <section className="poppins">
        <div className="row py-4" style={{ backgroundColor: "rgb(246,246,246)" }}>
          <div className="col-12 d-flex justify-content-center">
            <h2>Contact Us</h2>
          </div>
        </div>
      </section>

      {/* MAIN AREA */}
      <section className="poppins mt-4">
        <div className="container-fluid">

          {/* Title */}
          <div className="row text-center">
            <h2 className="mt-3">How to find us</h2>
            <h5 className="grey-text">Address and Direction</h5>
          </div>

          {/* IMAGE + TEXT (Same layout as ABOUT page) */}
          <div className="row mt-5">

            {/* LEFT IMAGE */}
            <div
              className="col-lg-6 align-items-center d-flex justify-content-center"
              style={{
                width: "700px",
                height: "650px",
                marginLeft: "50px"
              }}
            >
              <img
                src={require("../../images/contact.jpg")}
                className="img-fluid"
                style={{ borderRadius: "20px" }}
                alt="contact"
              />
            </div>

            {/* RIGHT TEXT */}
            <div className="col-lg-6" style={{ paddingTop: "130px" }}>

              {/* Address */}
              <div className="row mb-4">
                <div className="col-1">
                  <img src={marker} height="25" width="20" />
                </div>
                <div className="col-10">
                  <b style={{ fontSize: "23px" }}>Our Address</b>
                  <p style={{ fontSize: "18px" }}>
                    604, Neelkanth Corporate Park, Kirol Road, Vidhyavihar (West), Mumbai-400086.
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="row mb-4">
                <div className="col-1">
                  <img src={mobilenotch} height="25" width="25" />
                </div>
                <div className="col-10">
                  <b style={{ fontSize: "23px" }}>Phone</b>
                  <p style={{ fontSize: "18px" }}>022 67872022</p>
                </div>
              </div>

              {/* Hours */}
              <div className="row mb-4">
                <div className="col-1">
                  <img src={timecheck} height="45" width="45" />
                </div>
                <div className="col-10">
                  <b style={{ fontSize: "23px" }}>Open Hours</b>
                  <p style={{ fontSize: "18px" }}>Mon–Sat 8:00am – 4:30pm</p>
                </div>
              </div>

              {/* Button */}
              <button
                type="button"
                className="btn btn-primary fs-4 px-5 mt-4"
                data-bs-toggle="modal"
                data-bs-target="#staticBackdrop"
              >
                Contact Us
              </button>

            </div>
          </div>
        </div>
      </section>

      {/* MAP SECTION */}
<section className="poppins mt-5 mb-5">
  <div className="container">

    <div className="row d-flex align-items-center justify-content-center">

      {/* Heading */}
      <div className="col-lg-6 text-center d-flex flex-column justify-content-center">
        <h2>Our Address</h2>
        <h5>Providing a free visit of our Airways and Offices</h5>
      </div>

      {/* Map */}
      <div >
        <iframe 
          src="https://maps.google.com/maps?width=100%25&amp;height=575&amp;hl=en&amp;q=St-4,604, Neelkanth Corporate Park, Kirol Road, Vidhyavihar (West), Mumbai-400086&amp;t=&amp;z=14&amp;ie=UTF8&amp;iwloc=B&amp;output=embed"
          height="600"
          width="100%"
          loading="lazy"
          style={{ borderRadius: "20px"}}
        ></iframe>
      </div>

    </div>

  </div>
</section>

      <Footer />
    </>
  );
};

export default Contact;