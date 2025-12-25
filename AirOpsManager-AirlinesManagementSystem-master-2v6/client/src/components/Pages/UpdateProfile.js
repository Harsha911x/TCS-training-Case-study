// client/src/components/Pages/UpdateProfile.js
import React, { useEffect, useState } from "react";
import Axios from "axios";
import { useParams, useHistory, Link } from "react-router-dom";
import {
    MDBContainer,
    MDBRow,
    MDBCol,
    MDBCard,
    MDBCardBody
} from "mdb-react-ui-kit";

import "./styles/UpdateProfile.css";

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

const UpdateProfile = () => {
    const { id } = useParams();
    const history = useHistory();

    const [form, setForm] = useState({
        client_id: id || "",
        fname: "",
        mname: "",
        lname: "",
        phone: "",
        email: "",
        passport: ""
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!id) {
            setError("Profile id missing in URL.");
            setLoading(false);
            return;
        }

        setLoading(true);
        Axios.get(`http://localhost:5000/api/get/${id}`)
            .then((resp) => {
                const d = Array.isArray(resp.data) ? resp.data[0] : resp.data;
                if (!d) {
                    setError("Profile not found");
                } else {
                    setForm({
                        client_id: d.client_id ?? id,
                        fname: d.fname ?? "",
                        mname: d.mname ?? "",
                        lname: d.lname ?? "",
                        phone: d.phone ?? "",
                        email: d.email ?? "",
                        passport: d.passport ?? ""
                    });
                }
            })
            .catch((err) => {
                console.error("Failed to load profile:", err);
                setError("Failed to load profile");
            })
            .finally(() => setLoading(false));
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        // basic validation
        if (!form.fname || !form.lname || !form.email) {
            alert("Please fill required fields: First name, Last name and Email");
            return;
        }


        if (!form.phone || form.phone.length !== 13) {
            alert("Phone number must having +<countrycode> and followed by exactly 10 digits");
            return;
        }

        setSaving(true);
        setError(null);
        try {
            // server expects: client_id, fname, mname, lname, phone, email, passport
            const payload = {
                client_id: form.client_id,
                fname: form.fname,
                mname: form.mname,
                lname: form.lname,
                phone: form.phone,
                email: form.email,
                passport: form.passport
            };

            const resp = await Axios.put(`http://localhost:5000/api/update/${id}`, payload);
            // server returns { msg: "Updated" } on success
            if (resp && resp.data && resp.data.err) {
                throw new Error(resp.data.err);
            }

            // redirect back to view profile so it re-fetches fresh data
            history.push(`/ViewProfile/${id}`);
        } catch (err) {
            console.error("Update failed:", err);
            setError(err.message || "Failed to update profile");
            alert("Failed to update profile: " + (err.message || ""));
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div style={{ padding: 24 }}>Loading profile...</div>;

    return (
        <div className="up-root">
            {/* keep your original navbar for consistency */}
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

            <div className="up-page">
                <MDBContainer className="up-container">
                    <MDBRow className="justify-content-center">
                        <MDBCol md="10" lg="8" xl="7">
                            <MDBCard className="up-card" style={{
                                position: "absolute",
                                top: "200px",
                                left: "350px",
                                zIndex: 9999,
                                background: "white",
                                padding: "20px",
                                border: "1px solid #ccc",
                                width: 900,
                            }}>
                                <MDBCardBody className="up-cardbody">
                                    <h3 className="up-title">Update Profile</h3>

                                    {error && <div className="up-error">{error}</div>}

                                    <form className="up-form" onSubmit={handleSave}>
                                        <div className="up-grid">
                                            <label className="up-label">
                                                Client ID
                                                <input name="client_id" value={form.client_id} onChange={handleChange} readOnly className="up-input" />
                                            </label>

                                            <label className="up-label">
                                                First name *
                                                <input name="fname" value={form.fname} onChange={handleChange} className="up-input" onInput={(e) => {
                                                    e.target.value = e.target.value.replace(/[^A-Za-z]/g, "").slice(0, 10);
                                                }} />
                                            </label>

                                            <label className="up-label">
                                                Middle name
                                                <input name="mname" value={form.mname} onChange={handleChange} className="up-input" onInput={(e) => {
                                                    e.target.value = e.target.value.replace(/[^A-Za-z]/g, "").slice(0, 10);
                                                }} />
                                            </label>

                                            <label className="up-label">
                                                Last name *
                                                <input name="lname" value={form.lname} onChange={handleChange} className="up-input" onInput={(e) => {
                                                    e.target.value = e.target.value.replace(/[^A-Za-z]/g, "").slice(0, 10);
                                                }} />
                                            </label>

                                            <label className="up-label">
                                                Phone
                                                <input name="phone" value={form.phone} onChange={handleChange} className="up-input" onInput={(e) => {
                                                    e.target.value = e.target.value.replace(/[^+0-9]/g, "").slice(0, 13);
                                                }} />
                                            </label>

                                            <label className="up-label">
                                                Email *
                                                <input name="email" type="email" value={form.email} onChange={handleChange} className="up-input" />
                                            </label>

                                            <label className="up-label full">
                                                Passport
                                                <input name="passport" value={form.passport} onChange={handleChange} className="up-input" />
                                            </label>
                                        </div>

                                        <div className="up-actions">
                                            <Link to={`/ViewProfile/${id}`} className="up-cancel">Cancel</Link>
                                            <button type="submit" className="up-save" disabled={saving}>
                                                {saving ? "Saving..." : "Save changes"}
                                            </button>
                                        </div>
                                    </form>
                                </MDBCardBody>
                            </MDBCard>
                        </MDBCol>
                    </MDBRow>
                </MDBContainer>
            </div>
        </div>
    );
};

export default UpdateProfile;