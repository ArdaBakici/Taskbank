import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../css/common.css";
import "../css/forms.css";
import logo from "../assets/logo.png"; // import logo

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showResetPopup, setShowResetPopup] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Logged in: ${form.email}`);
    navigate("/home");
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    setShowResetPopup(true);
  };

  const handleResetSubmit = (e) => {
    e.preventDefault();
    if (resetEmail) {
      alert(`Password reset link will be sent to: ${resetEmail}`);
      setShowResetPopup(false);
      setResetEmail("");
    }
  };

  const handleResetCancel = () => {
    setShowResetPopup(false);
    setResetEmail("");
  };

  return (
    <div className="page-container">
      <div className="form-wrapper">
         <div className="logo-container">
            <img src={logo} alt="Taskbank Logo" className="logo" />
        </div>
        <h1>Taskbank</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />
          <div style={{ textAlign: "right", marginBottom: "10px" }}>
            <button 
              type="button" 
              onClick={handleForgotPassword}
              style={{
                background: "none",
                border: "none",
                color: "#007bff",
                cursor: "pointer",
                fontSize: "0.9rem",
                textDecoration: "underline",
                padding: "0"
              }}
            >
              Forgot your password?
            </button>
          </div>
          <button type="submit">Login</button>
        </form>
        <p>
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>

      {/* Password Reset Popup */}
      {showResetPopup && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: "white",
            padding: "30px",
            borderRadius: "8px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            maxWidth: "400px",
            width: "90%"
          }}>
            <h2 style={{ marginTop: 0, marginBottom: "20px" }}>Reset Password</h2>
            <p style={{ marginBottom: "20px", color: "#666" }}>
              Enter your email address and we'll send you a link to reset your password.
            </p>
            <form onSubmit={handleResetSubmit}>
              <input
                type="email"
                placeholder="Email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "10px",
                  marginBottom: "20px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "1rem"
                }}
              />
              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={handleResetCancel}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#f0f0f0",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "1rem"
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#007bff",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "1rem"
                  }}
                >
                  Send Reset Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
