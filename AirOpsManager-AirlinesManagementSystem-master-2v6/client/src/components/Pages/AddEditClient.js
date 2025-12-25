import React, { useEffect, useState } from "react";
import { useParams, useHistory, Link } from "react-router-dom";
import "./styles/AddEdit.css";
import Axios from "axios";
import { toast } from "react-toastify";

const initialState = {
  client_id: "",
  fname: "",
  mname: "",
  lname: "",
  phone: "",
  email: "",
  passport: "",
};

const AddEditClient = () => {
  const [state, setState] = useState(initialState);
  const { client_id, fname, mname, lname, phone, email, passport } = state;

  const history = useHistory();
  const { id } = useParams();

  /* ---------------- LOAD DATA IN UPDATE MODE ---------------- */
  useEffect(() => {
    if (id) {
      Axios.get(`http://localhost:5000/api/get/${id}`).then((resp) =>
        setState({ ...resp.data[0] })
      );
    } else {
      const newId = Math.floor(100000 + Math.random() * 900000);
      setState((prev) => ({ ...prev, client_id: newId }));
    }
  }, [id]);

  /* ---------------- VALIDATION HELPERS ---------------- */
  const onlyLetters = (value) => /^[A-Za-z ]*$/.test(value);
  const onlyDigits = (value) => /^[0-9]*$/.test(value);
  const validEmail = (email) => /^[^\s@]+@[^\s@]+\.(com|in)$/i.test(email);

  /* ---------------- HANDLE INPUT CHANGE ---------------- */
  const handleInputChange = (event) => {
    const { name, value } = event.target;

    // Name fields → only letters
    if (["fname", "lname", "mname"].includes(name)) {
      if (!onlyLetters(value)) return;
    }

    // Phone → digits only, max 10
    if (name === "phone") {
      if (!onlyDigits(value) || value.length > 10) return;
    }

    // Passport → uppercase
    if (name === "passport") {
      let val=value.toUpperCase();

      val=val.replace(/[^A-Z0-9]/g,"");

      setState({ ...state, passport: val});
      return ;
    }

    setState({ ...state, [name]: value });
  };

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = (event) => {
  event.preventDefault();

  // -------- NAME VALIDATION --------
  if (!fname.trim()) return toast.error("First Name cannot be blank.");
  if (!lname.trim()) return toast.error("Last Name cannot be blank.");

  // -------- PHONE VALIDATION --------
  if (phone.length !== 10) {
    return toast.error("Phone number must be exactly 10 digits.");
  }

  if (phone.startsWith("0")) {
    return toast.error("Phone number cannot start with 0.");
  }

  // Reject numbers like 0000000000, 1111111111...
  if (/^(\d)\1{9}$/.test(phone)) {
    return toast.error("Phone number cannot have all repeating digits.");
  }

  // -------- EMAIL VALIDATION --------
  if (!validEmail(email)) {
    return toast.error("Email must end with .com or .in");
  }

  if (/^[0-9]/.test(email)) {
    return toast.error("Email cannot start with a number.");
  }

  // -------- PASSPORT VALIDATION --------
  if (!passport.trim()) {
    return toast.error("Passport number cannot be empty.");
  }

  if (passport.startsWith("0")) {
    return toast.error("Passport number cannot start with 0.");
  }

  if (!/^[A-Z0-9]+$/.test(passport)) {
    return toast.error("Passport must contain only letters and numbers.");
  }

  // -------- PAYLOAD --------
  const payload = {
    client_id,
    fname,
    mname,
    lname,
    phone,
    email,
    passport,
  };

  if (!id) {
    Axios.post("http://localhost:5000/api/post", payload)
      .then(() => toast.success("Client Added Successfully"))
      .catch((err) => toast.error(err.response?.data));
  } else {
    Axios.put(`http://localhost:5000/api/update/${id}`, payload)
      .then(() => toast.success("Client Updated Successfully"))
      .catch((err) => toast.error(err.response?.data));
  }

  setTimeout(() => history.push("/Client"), 500);
};

  return (
    <div className="form-page">
      <form className="client-form" onSubmit={handleSubmit}>

        <h2>{id ? "Update Client" : "Add New Client"}</h2>

        <label>Client ID</label>
        <input type="text" name="client_id" value={client_id} readOnly />

        <label>First Name</label>
        <input
          type="text"
          name="fname"
          value={fname}
          placeholder="Enter First Name"
          onChange={handleInputChange}
          required
        />

        <label>Middle Name</label>
        <input
          type="text"
          name="mname"
          value={mname}
          placeholder="Enter Middle Name"
          onChange={handleInputChange}
        />

        <label>Last Name</label>
        <input
          type="text"
          name="lname"
          value={lname}
          placeholder="Enter Last Name"
          onChange={handleInputChange}
          required
        />

        <label>Phone (10 digits)</label>
        <input
          type="text"
          name="phone"
          value={phone}
          placeholder="Enter Phone Number"
          onChange={handleInputChange}
          required
        />

        <label>Email (.com / .in)</label>
        <input
          type="email"
          name="email"
          value={email}
          placeholder="Enter Email"
          onChange={handleInputChange}
          required
        />

        <label>Passport</label>
        <input
          type="text"
          name="passport"
          value={passport}
          placeholder="Enter Passport Number"
          onChange={handleInputChange}
          required
        />

        <div className="btn-row">
          <button type="submit" className="save-btn">
            {id ? "Update" : "Add"}
          </button>

          <Link to="/Client" className="back-btn">Back</Link>
        </div>
      </form>
    </div>
  );
};

export default AddEditClient;
