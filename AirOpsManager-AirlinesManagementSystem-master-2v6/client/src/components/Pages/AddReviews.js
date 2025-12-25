// import React, { useState } from "react";
// import Axios from "axios";
// import "./styles/Signin.css";
// import { useHistory, useParams } from "react-router-dom";
// import Swale from "sweetalert2";
// import withReactContent from "sweetalert2-react-content";

// import {
//   Nav,
//   Logo,
//   LogoContainer,
//   AirlineName,
//   NavMenu,
//   NavLink,
//   NavBtn,
//   NavBtnLink
// } from "../Navbar/NavbarElements";
// import logo from "../../images/logo.png";
// const initialState = {
//   review: "",
// };
// const AddReviews = () => {
//   const Swal = withReactContent(Swale);
//   const [state, setState] = useState(initialState);
//   const { review } = state;
//   const { id } = useParams();
//   const history = useHistory();

//   const handleInputChange = (event) => {
//     const { name, value } = event.target;
//     setState({ ...state, [name]: value });
//   };

//   const Add = (event) => {
//     event.preventDefault();
//     Axios.post(`http://localhost:5000/addreview/${id}`, {
//       id: id,
//       review: review,
//     }).then((response) => {
//       if (response.data.msg) {
//         Swal.fire("Invalid Login!", "", "error");
//       } else {
//         Swal.fire("Review Added!", "", "success");
//         setTimeout(() => history.push(`/CustomerPanel/${id}`), 500);
//       }
//     });
//   };
//   return (
//     <div>
//       {/* Navbar */}
//       <Nav>
//         <LogoContainer>
//           <Logo src={logo} alt="Airline Logo" />
//           <AirlineName>StarJet Airlines</AirlineName>
//         </LogoContainer>

//         <NavMenu>
//           <NavLink to={`/ViewProfile/${id}`}>View Profile</NavLink>
//           <NavLink to={`/BookTicket/${id}`}>Book Flight</NavLink>
//           <NavLink to={`/ViewCustomerTickets/${id}`}>View Tickets</NavLink>
//           <NavLink to={`/AddReviews/${id}`}>Add Review</NavLink>
//         </NavMenu>

//         <NavBtn>
//           <NavBtnLink to="/">Logout</NavBtnLink>
//         </NavBtn>
//       </Nav>
//       <div className="Auth-form-container bg-image">
//         <form className="Auth-form" onSubmit={Add}>
//           <div className="Auth-form-content">
//             <h3 className="Auth-form-title">Add Review</h3>
//             <div className="form-group mt-3">
//               <label>Name</label>
//               <input
//                 type="text"
//                 name="name"
//                 className="form-control mt-1"
//                 placeholder="John Doe"
//                 required
//               />
//             </div>
//             <div className="form-group mt-3">
//               <label>Review</label>
//               <input
//                 type="text"
//                 name="review"
//                 value={review}
//                 onChange={handleInputChange}
//                 className="form-control mt-1"
//                 placeholder="e.g Keep up the good work!"
//                 required
//               />
//             </div>
//             <div className="d-grid gap-2 mt-3">
//               <button type="submit" className="btn btn-primary">
//                 Submit Review
//               </button>
//             </div>

//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default AddReviews;


import React, { useState } from "react";
import Axios from "axios";
import "./styles/AddReviews.css";
import { useHistory, useParams , Link} from "react-router-dom";
import Swale from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

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

const initialState = {
  review: "",
};

const AddReviews = () => {
  const Swal = withReactContent(Swale);
  const [state, setState] = useState(initialState);
  const { review } = state;
  const { id } = useParams();
  const history = useHistory();

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setState({ ...state, [name]: value });
  };

  const Add = (event) => {
    event.preventDefault();
    
    // Validate review is not empty
    if (!review || review.trim() === "") {
      Swal.fire("Error", "Please enter a review before submitting.", "error");
      return;
    }
    
    Axios.post(`http://localhost:5000/addreview/${id}`, {
      id: id,
      review: review.trim(),
    })
    .then((response) => {
      // ✅ Fix: Backend returns { msg: "Review added" } on success, { err: "..." } on error
      if (response.data.err) {
        Swal.fire("Error", response.data.err || "Failed to add review. Please try again.", "error");
      } else if (response.data.msg) {
        Swal.fire("Success!", "Review Added Successfully!", "success");
        setTimeout(() => history.push(`/CustomerPanel/${id}`), 1500);
      } else {
        Swal.fire("Success!", "Review Added Successfully!", "success");
        setTimeout(() => history.push(`/CustomerPanel/${id}`), 1500);
      }
    })
    .catch((error) => {
      // ✅ Fix: Handle network errors and API errors
      console.error("Add review error:", error);
      const errorMessage = error.response?.data?.err || error.message || "Network error. Please check your connection and try again.";
      Swal.fire("Error", errorMessage, "error");
    });
  };

  return (
    <div className="page-root">
      {/* Navbar */}
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

      {/* Background + centered form */}
      <div className="Auth-form-container bg-image">
        <form className="Auth-form" onSubmit={Add}>
          <div className="Auth-form-content">
            <h3 className="Auth-form-title">Share Your Experience</h3>
            <p className="Auth-form-subtitle">
              Help us make every StarJet journey even better.
            </p>

            <div className="form-group mt-3">
              <label>Name</label>
              <input
                type="text"
                name="name"
                className="form-control mt-1"
                placeholder="John Doe"
                required
              />
            </div>

            <div className="form-group mt-3">
              <label>Review</label>
              <textarea
                name="review"
                value={review}
                onChange={handleInputChange}
                className="form-control mt-1 textarea-review"
                placeholder="e.g. Great service and smooth flight!"
                required
              />
            </div>

            <div className="d-grid gap-2 mt-4">
              <button type="submit" className="btn-submit-review">
                Submit Review
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddReviews;
