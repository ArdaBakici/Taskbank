import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/dashboard.css";
import DashboardHeader from "../components/DashboardHeader";
import { FiUser, FiLock, FiBell, FiLogOut } from "react-icons/fi";

export default function Settings() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(true);

  const handleOptionClick = (option) => {
    switch (option) {
      case "Name":
        alert("Open edit name modal"); // keep as is
        break;
      case "Change Password":
        alert("Open change password modal"); // keep as is
        break;
      case "Notifications":
        setNotifications(!notifications);
        break;
      case "Log Out":
        // do nothing for now; will implement in a different branch
        break;
      default:
        break;
    }
  };

  const profileOptions = [
    { name: "Name", icon: <FiUser /> },
    { name: "Change Password", icon: <FiLock /> },
    { name: "Notifications", icon: <FiBell /> },
    { name: "Log Out", icon: <FiLogOut /> },
  ];

  return (
    <div className="dashboard-container">
      <DashboardHeader />

      <main className="settings-main">
        <h2>User Profile</h2>

        <ul className="settings-list">
          {profileOptions.map((option) => (
            <li
              key={option.name}
              className="settings-item"
              onClick={() => handleOptionClick(option.name)}
            >
              <div className="settings-left">
                <span className="settings-icon">{option.icon}</span>
                <span className="settings-name">{option.name}</span>
              </div>

              {/* Notifications value is outside left group for right alignment */}
              {option.name === "Notifications" && (
                <span className="settings-value">
                  {notifications ? "On" : "Off"}
                </span>
              )}
            </li>
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
