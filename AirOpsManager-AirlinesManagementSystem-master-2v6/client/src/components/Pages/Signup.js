import React, { Component } from "react";
import Axios from "axios";
import "./styles/Signin.css";
import { withRouter, Link } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

class Signup extends Component {
  Swal = withReactContent(Swal);

  constructor(props) {
    super(props);
    this.state = {
      fname: "",
      mname: "",
      lname: "",
      countryCode: "+91",
      phone: "",
      email: "",
      passport: "",
      password: "",
      confirmPass: "",
    };
  }

  // ---------- Helpers ----------

  allowOnlyAlphabets = (e) => {
    e.target.value = e.target.value.replace(/[^A-Za-z]/g, "");
  };

  allowOnlyDigits = (e) => {
    e.target.value = e.target.value.replace(/[^0-9]/g, "");
  };

  isValidPassword = (password) => {
    // At least 1 uppercase, 1 lowercase, 1 number, min 8 chars
    const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return pattern.test(password);
  };

  // Simple Caesar cipher encryption (shift 4)
  encrypt = (text) => {
    let s = 4;
    let result = "";

    for (let i = 0; i < text.length; i++) {
      let char = text[i];
      let code = char.charCodeAt(0);

      // Uppercase A-Z
      if (code >= 65 && code <= 90) {
        result += String.fromCharCode(((code - 65 + s) % 26) + 65);
      }
      // Lowercase a-z
      else if (code >= 97 && code <= 122) {
        result += String.fromCharCode(((code - 97 + s) % 26) + 97);
      } else {
        // Non-letters unchanged
        result += char;
      }
    }
    return result;
  };

  handleInput = (field, value) => {
    this.setState({ [field]: value });
  };

  // ---------- Submit ----------

  register = (e) => {
    e.preventDefault();

    const {
      fname,
      mname,
      lname,
      countryCode,
      phone,
      email,
      passport,
      password,
      confirmPass,
    } = this.state;

    if (password !== confirmPass) {
      Swal.fire("Password doesn't match Confirm Password!", "", "error");
      return;
    }

    if (!this.isValidPassword(password)) {
      Swal.fire(
        "Weak Password",
        "Password must be at least 8 characters and include one uppercase letter, one lowercase letter and one number.",
        "warning"
      );
      return;
    }

    // PHONE VALIDATIONS
if (!phone || phone.length !== 10) {
  Swal.fire("Phone number must be exactly 10 digits!", "", "error");
  return;
}

// Reject numbers like 0000000000, 1111111111, etc.
if (/^(\d)\1+$/.test(phone)) {
  Swal.fire("Phone number cannot contain all repeating digits!", "", "error");
  return;
}
// PASSPORT VALIDATION
if (!passport || passport.length < 6) {
  Swal.fire("Passport number must be at least 6 characters!", "", "error");
  return;
}

// Cannot start with 0
if (passport[0] === "0") {
  Swal.fire("Passport number cannot start with 0!", "", "error");
  return;
}

// Must be alphanumeric only
if (!/^[A-Za-z0-9]+$/.test(passport)) {
  Swal.fire("Passport number must be alphanumeric only!", "", "error");
  return;
}
// Cannot start with 0
if (phone.startsWith("0")) {
  Swal.fire("Phone number cannot start with 0!", "", "error");
  return;
}

    const encryptedPassword = this.encrypt(password);
    const fullPhone = countryCode + phone;

    Axios.post("http://localhost:5000/signup", {
      fname,
      mname,
      lname,
      phone: fullPhone,
      email,
      passport,
      password,
    })
      .then((response) => {
        console.log(response);
        if (response.data && response.data.err) {
          Swal.fire("Error in Signup!", response.data.err, "error");
        } else {
          Swal.fire("Registered Successfully!", "", "success");
          setTimeout(() => this.props.history.push("/CustomerSignin"), 600);
        }
      })
      .catch((err) => {
        console.error(err);
        Swal.fire("Error in Signup!", "", "error");
      });
  };

  // ---------- Render ----------

  render() {
    return (
      <div className="bg-image">
        <div className="Auth-form-container">
          <form className="Auth-form" onSubmit={this.register}>
            <div className="Auth-form-content">
              <h3 className="Auth-form-title">Create Your Account</h3>
              {/* <p className="Auth-form-subtitle">
                Sign up to book and manage your flights.
              </p> */}

              {/* Name row */}
              <div className="form-row">
                <div className="form-group mt-2">
                  <label>First Name</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    placeholder="Jane"
                    onInput={this.allowOnlyAlphabets}
                    onChange={(e) =>
                      this.handleInput("fname", e.target.value)
                    }
                  />
                </div>

                <div className="form-group mt-2">
                  <label>Middle Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder=" "
                    onInput={this.allowOnlyAlphabets}
                    onChange={(e) =>
                      this.handleInput("mname", e.target.value)
                    }
                  />
                </div>

                <div className="form-group mt-2">
                  <label>Last Name</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    placeholder="Smith"
                    onInput={this.allowOnlyAlphabets}
                    onChange={(e) =>
                      this.handleInput("lname", e.target.value)
                    }
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="form-group mt-2">
                <label>Phone Number</label>
                <div className="phone-row">
                  <select
                    className="form-select country-select"
                    value={this.state.countryCode}
                    onChange={(e) =>
                      this.handleInput("countryCode", e.target.value)
                    }
                  >
                    <option value="+1">+1</option>
                    <option value="+44">+44</option>
                    <option value="+91">+91</option>
                    <option value="+61">+61</option>
                    <option value="+971">+971</option>
                  </select>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    className="form-control"
                    placeholder="9876543210"
                    onInput={this.allowOnlyDigits}
                    onChange={(e) =>
                      this.handleInput("phone", e.target.value)
                    }
                  />
                </div>
              </div>

              {/* Email */}
              <div className="form-group mt-2">
                <label>Email</label>
                <input
                  type="email"
                  required
                  className="form-control"
                  placeholder="john@example.com"
                  onChange={(e) =>
                    this.handleInput("email", e.target.value)
                  }
                />
              </div>

              {/* Passport */}
              <div className="form-group mt-2">
                <label>Passport Number</label>
                <input
                  type="text"
                  required
                  maxLength={12}
                  className="form-control"
                  placeholder="A1234567"
                  onChange={(e) =>
                    this.handleInput("passport", e.target.value)
                  }
                />
              </div>

              {/* Password & Confirm Password side by side */}
              <div className="form-row">
                <div className="form-group mt-2">
                  <label>Password</label>
                  <input
                    type="password"
                    required
                    className="form-control"
                    placeholder="Create a strong password"
                    onChange={(e) =>
                      this.handleInput("password", e.target.value)
                    }
                   
                  />
                  <small className="password-hint">
                    Min 8 characters, 1 uppercase, 1 lowercase & 1 number.
                  </small>
                </div>

                <div className="form-group mt-2">
                  <label>Confirm Password</label>
                  <input
                    type="password"
                    required
                    className="form-control"
                    placeholder="Re-enter password"
                    onChange={(e) =>
                      this.handleInput("confirmPass", e.target.value)
                    }
                  />
                </div>
              </div>

              {/* Submit */}
              <div className="d-grid gap-2 mt-3">
                <button type="submit" className="btn btn-primary btn-lg">
                  Create Account
                </button>
              </div>

              <p className="login-text">
                Already have an account?{" "}
                <Link to="/CustomerSignin" className="auth-link">
                  Login
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    );
  }
}

export default withRouter(Signup);

