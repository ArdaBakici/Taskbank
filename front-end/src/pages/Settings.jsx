import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/dashboard.css";
import { logout, getUser } from "../utils/auth";
import DashboardHeader from "../components/DashboardHeader";
import { FiUser, FiLock, FiLogOut } from "react-icons/fi";

export default function Settings() {
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = getUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  const handleOptionClick = (option) => {
    switch (option) {
      case "Change Password":
        setShowPopup(true); // show popup instead of alert
        break;
      case "Log Out":
        logout();
        navigate("/login");
        break;
      default:
        break;
    }
  };

  const profileOptions = [
    { name: "Username", icon: <FiUser />, disabled: true, value: user?.username || "Loading..." },
    { name: "Change Password", icon: <FiLock /> },
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
              {option.value && <span className="settings-value">{option.value}</span>}
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

      {/* Popup Modal */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h3>Do you want to change your password?</h3>
            <div className="popup-buttons">
              <button
                className="popup-btn"
                onClick={() => setShowPopup(false)}
              >
                No
              </button>
              <button
                className="popup-btn"
                onClick={() => {
                  setShowPopup(false);
                  navigate("/change-password"); // navigate to Change Password page
                }}
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
