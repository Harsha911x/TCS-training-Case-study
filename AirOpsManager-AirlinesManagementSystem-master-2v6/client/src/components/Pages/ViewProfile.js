import React, { useState, useEffect } from "react";
import Axios from "axios";
import {
  MDBCol,
  MDBContainer,
  MDBRow,
  MDBCard,
  MDBCardTitle,
  MDBCardBody,
  MDBCardImage,
} from "mdb-react-ui-kit";
import "./styles/CustomerPanel.css";
import { useHistory, useParams, Link } from "react-router-dom";

import {
  Nav,
  Logo,
  LogoContainer,
  AirlineName,
  NavMenu,
  NavLink,
  NavBtn,
  NavBtnLink,
} from "../Navbar/NavbarElements";
import logo from "../../images/logo.png";

const ViewProfile = () => {
  const { id } = useParams();
  const history = useHistory();
  const [data, setData] = useState({});

  useEffect(() => {
    Axios.get(`http://localhost:5000/api/get/${id}`).then((resp) =>
      setData({ ...resp.data[0] })
    );
  }, [id]); // add id as dependency

  const handleUpdateAccount = () => {
    // change route if your update page is different
    history.push(`/UpdateProfile/${id}`);
  };

  const handleDeleteAccount = async () => {
    const confirm = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    );
    if (!confirm) return;

    try {
      await Axios.delete(`http://localhost:5000/api/delete/${id}`); // adjust URL if needed
      alert("Account deleted successfully.");
      history.push("/");
    } catch (err) {
      console.error(err);
      alert("Failed to delete account. Please try again.");
    }
  };

  return (
    <div>
      {/* Navbar */}
      <Nav>
        <LogoContainer>
          <Link
            to={`/CustomerPanel/${id}`}
            style={{
              display: "flex",
              alignItems: "center",
              textDecoration: "none",
            }}
          >
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

      {/* Profile Section */}
      <div className="profile-page">
        <MDBContainer className="profile-container" >
          <MDBRow className="justify-content-center">
            <MDBCol md="10" lg="8" xl="7">
              <MDBCard className="profile-card" style={{
                position: "absolute",
                top: "200px",
                left: "350px",
                zIndex: 9999,
                background: "white",
                padding: "20px",
                border: "1px solid #ccc",
                width:900,
              }}>
                <MDBCardBody className="p-4">
                  <div className="profile-header">
                    <div className="profile-avatar-wrapper">
                      <MDBCardImage
                        className="profile-avatar"
                        src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-profiles/avatar-1.webp"
                        alt="Customer avatar"
                        fluid
                      />
                    </div>
                    <div className="profile-main-info">
                      <MDBCardTitle className="profile-name">
                        {data.fname} {data.mname} {data.lname}
                      </MDBCardTitle>
                      <p className="profile-tagline">
                        StarJet Frequent Flyer · Valued Customer
                      </p>

                      <div className="profile-contact-grid">
                        <div>
                          <span className="profile-label">Phone</span>
                          <p className="profile-value">{data.phone}</p>
                        </div>
                        <div>
                          <span className="profile-label">Email</span>
                          <p className="profile-value">{data.email}</p>
                        </div>
                        <div>
                          <span className="profile-label">Passport</span>
                          <p className="profile-value">{data.passport}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <hr className="profile-divider" />

                  <div className="profile-actions">
                    <button
                      type="button"
                      className="btn-profile btn-update"
                      onClick={handleUpdateAccount}
                    >
                      ✏️ Update Account
                    </button>
                    {/* <button
                      type="button"
                      className="btn-profile btn-delete"
                      onClick={handleDeleteAccount}
                    >
                      🗑 Delete Account
                    </button> */}
                    <Link to={`/CustomerPanel/${id}`}>
                      <button
                        type="button"
                        className="btn-profile btn-secondary"
                      >
                        ⬅ Back to Main
                      </button>
                    </Link>
                  </div>
                </MDBCardBody>
              </MDBCard>
            </MDBCol>
          </MDBRow>
        </MDBContainer>
      </div>
    </div>
  );
};

export default ViewProfile;



