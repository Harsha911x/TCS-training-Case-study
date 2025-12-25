

import React, { Component } from "react";
import Axios from "axios";
import { withRouter } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import "./styles/AdminSignin.css"; // 👈 new CSS file

class Signin extends Component {
  Swal = withReactContent(Swal);

  constructor(props) {
    super(props);
    this.state = {
      usernameLogin: "",
      passwordLogin: "",
    };
  }

  handleUsernameChange = (event) => {
    this.setState({
      usernameLogin: event.target.value,
    });
  };

  handlePasswordChange = (event) => {
    this.setState({
      passwordLogin: event.target.value,
    });
  };

  Login = (event) => {
    event.preventDefault();
    Axios.post("http://localhost:5000/login", {
      username: this.state.usernameLogin,
      password: this.state.passwordLogin,
    }).then((response) => {
      if (response.data.msg) {
        this.Swal.fire("Invalid Login!", "", "error");
      } else {
        this.Swal.fire("Login Success!", "", "success");
        setTimeout(() => this.props.history.push("/AdminPanel"), 500);
      }
    });
  };

  render() {
    return (
      <div className="admin-bg">
        <form className="admin-form" onSubmit={this.Login}>
          <h3 className="admin-title">Admin Sign In</h3>
          <p className="admin-subtitle">Admin access to airline management</p>

          {/* Username */}
          <div className="admin-form-group">
            <label className="admin-label">Username</label>
            <input
              type="text"
              onChange={this.handleUsernameChange}
              required
              placeholder="Enter your username"
              className="admin-input"
            />
          </div>

          {/* Password */}
          <div className="admin-form-group">
            <label className="admin-label">Password</label>
            <input
              type="password"
              onChange={this.handlePasswordChange}
              required
              placeholder="Enter your password"
              className="admin-input"
            />
          </div>

          {/* Button */}
          <div className="admin-button-wrapper">
            <button type="submit" className="admin-btn">
              Login
            </button>
          </div>

          {/* Forgot Password */}
          <p className="admin-forgot">
            {" "}
            <a href="Home" className="admin-link">
              
            </a>
          </p>
        </form>
      </div>
    );
  }
}

export default withRouter(Signin);