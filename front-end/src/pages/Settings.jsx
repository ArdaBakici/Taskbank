import React from "react";
import { useNavigate } from "react-router-dom";
import "../css/dashboard.css";
import DashboardHeader from "../components/DashboardHeader";

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
      <DashboardHeader />

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
