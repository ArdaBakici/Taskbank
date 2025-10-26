import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../css/common.css";
import "../css/forms.css";
import logo from "../assets/logo.png"; // import logo

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Logged in: ${form.email}`);
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
          <button type="submit">Login</button>
        </form>
        <p>
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
}
