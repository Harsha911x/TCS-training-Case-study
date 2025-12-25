import React from "react";
import "./styles/Home.css";
import Slider from "./Slider";
import Footer from "./Footer";

const Home = () => {
  return (
    <>
      <Slider />

      {/* -----------------------------------
          TOP 3 FEATURE CARDS
      ------------------------------------ */}
      <div className="container-fluid mt-5 px-5">
        <h2 className="text-center fw-bold">Discover the wonders of the world</h2>
        <p className="text-center mb-5">
          Journey with us on a unique adventure to discover the world
        </p>

        <div className="row justify-content-between text-center">

          <div className="col-lg-3 top-feature-card mb-4">
            <img
              src={require("../../images/Destinations_Dekstop.png")}
              alt=""
            />
            <h5>Discover the destinations you can travel with StarJet Airline</h5>
          </div>

          <div className="col-lg-3 top-feature-card mb-4">
            <img
              src={require("../../images/Fasttrack_Desktop.jpg")}
              alt=""
            />
            <h5>Enjoy our Fast Track Service</h5>
          </div>

          <div className="col-lg-3 top-feature-card mb-4">
            <img
              src={require("../../images/Alfursan_Destop.jpg")}
              alt=""
            />
            <h5>Learn more about our loyalty program</h5>
          </div>

        </div>
      </div>

      {/* -----------------------------------
          MIDDLE SECTION
          LEFT TEXT + RIGHT STACKED CARDS
      ------------------------------------ */}
      <div className="section-wrapper">
        <div className="inner-section">

          {/* LEFT AREA */}
          <div className="left-area">
            <h1>Exceptional experiences with StarJet Airline</h1>
            <p>
              Explore the world, earn rewards and live the best adventures 
              with StarJet Airline.
            </p>
          </div>

          {/* RIGHT AREA */}
          <div className="right-area">

            {/* Card 1 */}
            <div className="right-box">
              <img src={require("../../images/Large-Sustainability.jpg")} />
              <div>
                <h5>Ensure a sustainable future</h5>
                <p>
                  Help us reduce our carbon footprint and get rewarded!
                </p>
                <button className="btn btn-primary btn-sm">Learn more</button>
              </div>
            </div>

            {/* Card 2 */}
            <div className="right-box">
              <img src={require("../../images/Large-experiences.jpg")} />
              <div>
                <h5>Time flies on board StarJet Airline</h5>
                <p>
                  Enjoy dining, entertainment, and a relaxing experience.
                </p>
                <button className="btn btn-primary btn-sm">Learn more</button>
              </div>
            </div>

            {/* Card 3 */}
            <div className="right-box">
              <img src={require("../../images/Large-Upgrade.jpg")} />
              <div>
                <h5>Let's get you upgraded</h5>
                <p>
                  Upgrade to a higher class and enjoy premium comfort.
                </p>
                <button className="btn btn-primary btn-sm">Learn more</button>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* -----------------------------------
          CTA BANNER
      ------------------------------------ */}
      <div className="container">
        <div className="cta-banner mt-5">
          <div className="cta-overlay">
            <div className="cta-content">
              <h1>Start your journey with StarJet Airline</h1>
              <h4>Exclusive offers and amazing rewards await</h4>
              <button className="cta-btn">Join Now</button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Home;