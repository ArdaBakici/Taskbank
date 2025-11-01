import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/dashboard.css";
import DashboardHeader from "../components/DashboardHeader";

export default function ChangePassword() {
  const navigate = useNavigate();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!oldPassword || !newPassword || !confirmPassword) {
      setError("Please fill out all fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    if (newPassword === oldPassword) {
      setError("New password must be different from the current password.");
      return;
    }

    // Replace this with actual API call later
    console.log("Password changed successfully!");
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowSuccessPopup(true); // show success popup
  };

  return (
    <div className="dashboard-container">
      <DashboardHeader />

      <main className="change-password-page">
        <h2>Change Password</h2>

        <form className="change-password-form" onSubmit={handleSubmit}>
          <label htmlFor="oldPassword">
            Current Password
            <input
              type="password"
              id="oldPassword"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="Enter current password"
            />
          </label>

          <label htmlFor="newPassword">
            New Password
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
            />
          </label>

          <label htmlFor="confirmPassword">
            Confirm New Password
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
            />
          </label>

          {error && <p className="error-message">{error}</p>}

          <div className="change-password-buttons">
            <button type="submit" className="section-footer-button">
              Save Password
            </button>
            <button
              type="button"
              className="section-footer-button"
              onClick={() => navigate("/settings")}
            >
              Cancel
            </button>
          </div>
        </form>
      </main>

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h3>Password changed successfully!</h3>
            <button
              className="popup-btn"
              onClick={() => navigate("/settings")}
            >
              Return
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
