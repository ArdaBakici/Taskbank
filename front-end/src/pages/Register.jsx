import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../css/common.css";
import "../css/forms.css";
import logo from "../assets/logo.png"; // import logo

export default function Register() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Registered: ${form.username}`);
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
            type="text"
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            required
          />
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
          <button type="submit">Register</button>
        </form>
        <p>
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
}
