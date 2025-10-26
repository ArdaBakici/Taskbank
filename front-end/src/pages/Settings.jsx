import React from "react";
import { useNavigate } from "react-router-dom";
import "../css/dashboard.css";
import logo from "../assets/logo.png";

export default function Settings() {
  const navigate = useNavigate();

  const profileOptions = [
    "Name",
    "Change Password",
    "Notifications: On",
    "Log Out",
  ];

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Taskbank</h1>
        <div className="logo-box">
          <img src={logo} alt="Logo" className="logo-image" />
        </div>
      </header>

      <main className="settings-main">
        <h2>User Profile</h2>

        <ul className="settings-list">
          {profileOptions.map((option) => (
            <li key={option}>{option}</li>
          ))}
        </ul>

        <button
          className="section-footer-button settings-return"
          onClick={() => navigate("/home")}
        >
          Return
        </button>
      </main>
    </div>
  );
}
