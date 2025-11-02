
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
      case "Change Password":
        alert("Open change password modal");
        break;
      case "Notifications":
        setNotifications(!notifications);
        break;
      case "Log Out":
        alert("Logging out...");
        navigate("/login");
        break;
      default:
        break;
    }
  };

  const profileOptions = [
    { name: "Name", icon: <FiUser />, disabled: true },
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
              className={`settings-item ${option.disabled ? "disabled" : ""}`}
              onClick={
                option.disabled ? undefined : () => handleOptionClick(option.name)
              }
            >
              <div className="settings-left">
                <span className="settings-icon">{option.icon}</span>
                <span className="settings-name">{option.name}</span>
              </div>

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
