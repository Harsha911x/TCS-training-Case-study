import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Axios from "axios";
import { toast } from "react-toastify";
import Sidebar from "./Sidebar";
import "./styles/ClientTable.css";

const Client = () => {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [showInfoPopup, setShowInfoPopup] = useState(false);
  const [blockedClient, setBlockedClient] = useState(null);

  const loadData = async () => {
    const response = await Axios.get("http://localhost:5000/api/get");
    setData(response.data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const delClient = async (id) => {
    if (!window.confirm(`Do you really want to delete Client #${id}?`)) return;

    try {
      await Axios.delete(`http://localhost:5000/api/remove/${id}`);
      toast.success("Client deleted successfully!");
      loadData();

    } catch (err) {
      if (err.response?.data?.error === "CLIENT_HAS_BOOKINGS") {
        setBlockedClient(id);
        setShowInfoPopup(true);
      } else {
        toast.error("Failed to delete client");
        console.error(err);
      }
    }
  };

  const filtered = data.filter((c) => {
    return (
      c.fname?.toLowerCase().includes(search.toLowerCase()) ||
      c.lname?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <>
      <Sidebar />

      <div className="client-container">

        <div className="client-header">
          <h2 className="client-title">Client Management</h2>

          <div className="client-actions">
            <input
              type="text"
              className="client-search"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => {
                const value = e.target.value;
                const allowed = /^[A-Za-z @.]*$/;
                if (allowed.test(value)) {
                  setSearch(value);
                }
              }}
            />

            <Link to="/AddEditClient">
              <button className="client-add-btn">+ Add Client</button>
            </Link>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="client-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Client ID</th>
                <th>Full Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Passport</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="no-data">
                    No clients found
                  </td>
                </tr>
              ) : (
                filtered.map((item, index) => (
                  <tr key={item.client_id}>
                    <td>{index + 1}</td>
                    <td>{item.client_id}</td>
                    <td>
                      {item.fname} {item.mname || ""} {item.lname}
                    </td>
                    <td>{item.phone}</td>
                    <td>{item.email}</td>
                    <td>{item.passport}</td>

                    <td className="action-buttons">
                      <Link to={`/Update/${item.client_id}`}>
                        <button className="btn-edit">Edit</button>
                      </Link>

                      <button
                        className="btn-delete"
                        onClick={() => delClient(item.client_id)}
                      >
                        Delete
                      </button>

                      {/* <Link to={`/View/${item.client_id}`}>
                        <button className="btn-view">View</button>
                      </Link> */}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {showInfoPopup && (
          <div className="modal-overlay" onClick={() => setShowInfoPopup(false)}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
              <h3>Cannot Delete Client</h3>

              <p>
                Client <strong>#{blockedClient}</strong> has existing bookings.
                Deleting this client is not allowed.
              </p>

              <button
                className="btn-close"
                onClick={() => setShowInfoPopup(false)}
              >
                OK
              </button>
            </div>
          </div>
        )}

      </div>
    </>
  );
};

export default Client;
