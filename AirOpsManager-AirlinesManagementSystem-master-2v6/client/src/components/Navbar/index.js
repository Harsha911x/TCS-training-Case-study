import React from "react";
import {
  Nav,
  Logo,
  NavLink,
  NavMenu,
  NavBtn,
  NavBtnLink,
  LogoContainer,
  AirlineName,
} from "./NavbarElements";

import { Link } from "react-router-dom";
import Dropdown from "react-bootstrap/Dropdown";
import logo from "../../images/logo.png";

const Navbar = () => {
  return (
    <div>
      <Nav>
        <LogoContainer>
                <Logo src={logo} alt="Airline Logo" />
                <AirlineName>StarJet Airlines</AirlineName>
              </LogoContainer>
        {/* LOGO + AIRLINE NAME
        <NavLink to="/" style={{ display: "flex", alignItems: "center" }}>
          <img
            src={require("../../images/logo.png")}
            alt="logo"
            style={{
              width: "120px",
              height: "110px",
              marginRight: "20px",
            }}
          />
          <AirlineName>FAST          Airlines</AirlineName>
        </NavLink> */}

        {/* MAIN MENU */}
        <NavMenu>
          <NavLink to="/BookTicket">View Flights</NavLink>
          <NavLink to="/about">About</NavLink>
          <NavLink to="/contact-us">Contact</NavLink>
        </NavMenu>

        {/* CLIENT LOGIN (Dropdown) */}
        <NavBtn>
          <Dropdown>
            <Dropdown.Toggle
              id="dropdown-basic"
              style={{
                backgroundColor: "#6C63FF",
                padding: "10px 20px",
                borderRadius: "8px",
                border: "none",
                fontSize: "17px",
                fontWeight: "600",
                marginTop: "1px",
              }}
            >
              Client Login
            </Dropdown.Toggle>

            <Dropdown.Menu>
              <Dropdown.Item as={Link} to="/sign-up">
                Sign Up
              </Dropdown.Item>
              <Dropdown.Item as={Link} to="/CustomerSignin">
                Sign In
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </NavBtn>

        {/* ADMIN LOGIN BUTTON - SAME DESIGN */}
        <NavBtn>
          <NavBtnLink to="/signin">ADMIN Sign In</NavBtnLink>
        </NavBtn>

      </Nav>
    </div>
  );
};

export default Navbar;