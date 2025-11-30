import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authenticatedFetch } from "../utils/auth"; 
import "../css/dashboard.css";
import DashboardHeader from "../components/DashboardHeader";

export default function ChangePassword() {
  const navigate = useNavigate();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [status, setStatus] = useState({
    error: "",
    success: false,
    loading: false,
  });

const handleSubmit = async (e) => {
  e.preventDefault();
  setStatus({ error: "", success: false, loading: true });

  // ------- VALIDATION -------
  if (!oldPassword || !newPassword || !confirmPassword) {
    return setStatus({ error: "Please fill out all fields.", success: false, loading: false });
  }

  if (newPassword.length < 6) {
    return setStatus({ error: "New password must be at least 6 characters.", success: false, loading: false });
  }

  if (newPassword === oldPassword) {
    return setStatus({ error: "New password must be different from the current password.", success: false, loading: false });
  }

  if (newPassword !== confirmPassword) {
    return setStatus({ error: "New passwords do not match.", success: false, loading: false });
  }

  // ------- API CALL -------
  try {
    const response = await authenticatedFetch("/settings/change-password", {
      method: "PATCH",
      body: JSON.stringify({
        oldPassword,
        newPassword,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return setStatus({ error: data.message || "Failed to change password.", success: false, loading: false });
    }

    // ------- SUCCESS -------
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setStatus({ error: "", success: true, loading: false });

  } catch (err) {
    return setStatus({ error: "Network error. Try again.", success: false, loading: false });
  }
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
              type={showOld ? "text" : "password"}
              id="oldPassword"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="Enter current password"
            />
            <button
              type="button"
              className="toggle-password-btn"
              onClick={() => setShowOld(!showOld)}
            >
              {showOld ? "Hide" : "Show"}
            </button>
          </label>

         <label htmlFor="newPassword">
            New Password
            <input
              type={showNew ? "text" : "password"}
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
            />
            <button
              type="button"
              className="toggle-password-btn"
              onClick={() => setShowNew(!showNew)}
            >
              {showNew ? "Hide" : "Show"}
            </button>
          </label>

         <label htmlFor="confirmPassword">
            Confirm New Password
            <input
              type={showConfirm ? "text" : "password"}
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
            />
            <button
              type="button"
              className="toggle-password-btn"
              onClick={() => setShowConfirm(!showConfirm)}
            >
              {showConfirm ? "Hide" : "Show"}
            </button>
          </label>

          {status.error && <p className="error-message">{status.error}</p>}

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
      {status.success && (
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
