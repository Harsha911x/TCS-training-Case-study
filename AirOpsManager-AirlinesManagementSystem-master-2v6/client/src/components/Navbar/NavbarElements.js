import { FaBars } from "react-icons/fa";
import { NavLink as Link } from "react-router-dom";
import styled from "styled-components";

/* MAIN NAVBAR */
export const Nav = styled.nav`
  height: 90px;
  width: 100%;
  display: flex;
  align-items: center;
  padding: 0 30px;
  justify-content: space-between;

  /* Premium frosted effect */
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(12px);

  position: fixed;
  top: 0;
  z-index: 999;

  box-shadow: 0px 4px 15px rgba(0,0,0,0.5);
`;

/* LOGO */
export const Logo = styled.img`
  width: 65px;
  height: 65px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 12px;

  transition: 0.3s ease;

  &:hover {
    transform: scale(1.08);
  }
`;

/* AIRLINE NAME */
export const AirlineName = styled.h2`
  color: #fff;
  font-size: 28px;
  font-weight: 800;
  letter-spacing: 1px;
  margin-left: 10px;

  text-shadow: 0px 0px 8px rgba(255,255,255,0.4);

  @media (max-width: 768px) {
    font-size: 22px;
  }
`;

/* LOGO + NAME CONTAINER */
export const LogoContainer = styled.div`
  display: flex;
  align-items: center;
`;

/* NAV LINKS */
export const NavLink = styled(Link)`
  font-size: 19px;
  color: #fff;
  display: flex;
  align-items: center;
  text-decoration: none;
  padding: 0 1rem;
  height: 100%;
  font-weight: 600;
  cursor: pointer;
  transition: 0.3s ease-in-out;

  &:hover {
    color: #15cdfc;
    transform: translateY(-3px);
  }

  &.active {
    color: #15cdfc;
  }
`;

/* MOBILE MENU ICON */
export const Bars = styled(FaBars)`
  display: none;
  color: #fff;

  @media (max-width: 768px) {
    display: block;
    position: absolute;
    right: 20px;
    font-size: 28px;
    cursor: pointer;
  }
`;

/* MENU ITEMS */
export const NavMenu = styled.div`
  display: flex;
  align-items: center;

  @media (max-width: 768px) {
    display: none;
  }
`;

/* LOGOUT BUTTON */
export const NavBtn = styled.div`
  display: flex;
  align-items: center;

  @media (max-width: 768px) {
    display: none;
  }
`;

export const NavBtnLink = styled(Link)`
  border-radius: 10px;
  background: #ff4e4e;
  padding: 10px 22px;
  color: #fff;
  font-size: 17px;
  font-weight: 700;
  text-decoration: none;
  transition: 0.3s ease-in-out;

  &:hover {
    background: #ffffff;
    color: #000;
  }
`;
