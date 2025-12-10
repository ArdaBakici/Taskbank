// React and routing imports
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../utils/auth";
import "../css/common.css";
import "../css/forms.css";
import logo from "../assets/logo.png"; // App logo

// Login component - User authentication page
export default function Login() {
  // Form state and UI controls
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState(""); // Login error messages
  const [loading, setLoading] = useState(false); // Submit loading state
  const navigate = useNavigate();

  // Handle form input changes and clear errors
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(""); // Clear error when user types
  };

  // Handle login form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Authenticate user and navigate to home on success
      await login(form.email, form.password);
      navigate("/home");
    } catch (err) {
      // Display login error message
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="form-wrapper">
         {/* App logo */}
         <div className="logo-container">
            <img src={logo} alt="Taskbank Logo" className="logo" />
        </div>
        <h1>Taskbank</h1>
        
        {/* Error message display */}
        {error && (
          <div style={{
            backgroundColor: "#fee",
            border: "1px solid #fcc",
            color: "#c33",
            padding: "10px",
            borderRadius: "4px",
            marginBottom: "15px"
          }}>
            {error}
          </div>
        )}
        
        {/* Login form */}
        <form onSubmit={handleSubmit}>
          {/* Email input */}
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            disabled={loading}
          />
          
          {/* Password input */}
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            disabled={loading}
          />
          
          {/* Submit button with loading state */}
          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        
        {/* Link to registration page */}
        <p>
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
}
