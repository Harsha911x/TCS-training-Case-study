import React, { useState } from "react";
import Axios from "axios";
import { useHistory, Link } from "react-router-dom";
import Swale from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import "./styles/CustomerSignin.css"; // 👈 new CSS file

const initialState = {
  emailLogin: "",
  passwordLogin: "",
};

// To hold client_id like your original code
const initial = {
  id: "",
};

const Signin = () => {
  const Swal = withReactContent(Swale);
  const [state, setState] = useState(initialState);
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const { emailLogin, passwordLogin } = state;

  const history = useHistory();

  const loadData = async () => {
    const response = await Axios.post(
      "http://localhost:5000/getcustomerlogin",
      {
        email: emailLogin,
        password: passwordLogin,
      }
    );
    if (
      Array.isArray(response.data) &&
      response.data.length > 0 &&
      response.data[0].client_id != null
    ) {
      initial.id = response.data[0].client_id;
    } else {
      initial.id = "";
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setState({ ...state, [name]: value });
  };

  const Login = async (event) => {
    event.preventDefault();
    // Ensure we fetch client_id before redirect
    await loadData();

    Axios.post("http://localhost:5000/customerlogin", {
      email: emailLogin,
      password: passwordLogin,
    }).then((response) => {
      if (response.data.msg) {
        Swal.fire("Invalid Login!", "", "error");
      } else {
        Swal.fire("Login Success!", "", "success");
        setTimeout(() => history.push(`/CustomerPanel/${initial.id}`), 500);
      }
    });
  };

  return (
    <div className="customer-bg">
      <form className="customer-form" onSubmit={Login}>
        <h3 className="customer-title">Customer Sign In</h3>
        <p className="customer-subtitle">
          Access your bookings and manage your trips.
        </p>

        {/* Email */}
        <div className="customer-form-group">
          <label className="customer-label">Email</label>
          <input
            type="email"
            name="emailLogin"
            value={emailLogin}
            onChange={handleInputChange}
            required
            placeholder="e.g. john@example.com"
            className="customer-input"
          />
        </div>

        {/* Password */}
        <div className="customer-form-group">
          <label className="customer-label">Password</label>
          <input
            type="password"
            name="passwordLogin"
            value={passwordLogin}
            onChange={handleInputChange}
            required
            placeholder="Enter your password"
            className="customer-input"
          />
        </div>

        {/* Button */}
        <div className="customer-button-wrapper">
          <button
            type="submit"
            className={`customer-btn ${
              isButtonHovered ? "customer-btn-hover" : ""
            }`}
            onMouseEnter={() => setIsButtonHovered(true)}
            onMouseLeave={() => setIsButtonHovered(false)}
          >
            Login
          </button>
        </div>

        {/* Signup link */}
        <p className="customer-helper">
          Not registered?
          <Link to="/sign-up" className="customer-link">
            {" "}
            Signup
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Signin;