// React and routing imports
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authenticatedFetch } from "../utils/auth"; 
import "../css/dashboard.css";
import DashboardHeader from "../components/DashboardHeader";

/**
 * ChangePassword component - Allows users to change their password
 * Features: Password validation, show/hide password toggles, success feedback
 */
export default function ChangePassword() {
  const navigate = useNavigate();
  
  // Form input state
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Password visibility toggles for each field
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  // UI status state for error/success handling
  const [status, setStatus] = useState({
    error: "",      // Error message to display
    success: false, // Whether password change was successful
    loading: false, // Loading state during API call
  });

// Handle form submission with validation and API call
const handleSubmit = async (e) => {
  e.preventDefault();
  // Reset status and show loading
  setStatus({ error: "", success: false, loading: true });

  // ------- CLIENT-SIDE VALIDATION -------
  
  // Check if all fields are filled
  if (!oldPassword || !newPassword || !confirmPassword) {
    return setStatus({ error: "Please fill out all fields.", success: false, loading: false });
  }

  // Minimum password length requirement
  if (newPassword.length < 6) {
    return setStatus({ error: "New password must be at least 6 characters.", success: false, loading: false });
  }

  // Ensure new password is different from old password
  if (newPassword === oldPassword) {
    return setStatus({ error: "New password must be different from the current password.", success: false, loading: false });
  }

  // Confirm password fields match
  if (newPassword !== confirmPassword) {
    return setStatus({ error: "New passwords do not match.", success: false, loading: false });
  }

  // ------- API CALL TO BACKEND -------
  try {
    // Send password change request to backend
    const response = await authenticatedFetch("/settings/change-password", {
      method: "PATCH",
      body: JSON.stringify({
        oldPassword,
        newPassword,
      }),
    });

    const data = await response.json();

    // Handle API error responses
    if (!response.ok) {
      return setStatus({ error: data.message || "Failed to change password.", success: false, loading: false });
    }

    // ------- SUCCESS - Clear form and show success message -------
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setStatus({ error: "", success: true, loading: false });

  } catch (err) {
    // Handle network/connection errors
    return setStatus({ error: "Network error. Try again.", success: false, loading: false });
  }
};


  return (
    <div className="dashboard-container">
      <DashboardHeader />

      <main className="change-password-page">
        <h2>Change Password</h2>

        <form className="change-password-form" onSubmit={handleSubmit}>
          {/* Current Password Field with Show/Hide Toggle */}
          <label htmlFor="oldPassword">
            Current Password
            <div style={{ marginBottom: "1.25rem", position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type={showOld ? "text" : "password"} // Toggle between text and password
                id="oldPassword"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Enter current password"
                style={{ paddingRight: '60px', flex: 1 }} // Space for show/hide button
              />
              {/* Show/Hide button for current password */}
              <button
                type="button"
                onClick={() => setShowOld(!showOld)}
                style={{
                  position: 'absolute',
                  right: '8px',
                  padding: '6px 12px',
                  fontSize: '0.8rem',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  background: 'white',
                  cursor: 'pointer',
                  color: '#666',
                  fontWeight: '500'
                }}
              >
                {showOld ? "Hide" : "Show"}
              </button>
            </div>
          </label>

         {/* New Password Field with Show/Hide Toggle */}
         <label htmlFor="newPassword">
            New Password
            <div style={{ marginBottom: "1.25rem", position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type={showNew ? "text" : "password"} // Toggle visibility
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                style={{ paddingRight: '60px', flex: 1 }}
              />
              {/* Show/Hide button for new password */}
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                style={{
                  position: 'absolute',
                  right: '8px',
                  padding: '6px 12px',
                  fontSize: '0.8rem',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  background: 'white',
                  cursor: 'pointer',
                  color: '#666',
                  fontWeight: '500'
                }}
              >
                {showNew ? "Hide" : "Show"}
              </button>
            </div>
          </label>

         {/* Confirm New Password Field with Show/Hide Toggle */}
         <label htmlFor="confirmPassword">
            Confirm New Password
            <div style={{ marginBottom: "1.25rem", position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type={showConfirm ? "text" : "password"} // Toggle visibility
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                style={{ paddingRight: '60px', flex: 1 }}
              />
              {/* Show/Hide button for password confirmation */}
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                style={{
                  position: 'absolute',
                  right: '8px',
                  padding: '6px 12px',
                  fontSize: '0.8rem',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  background: 'white',
                  cursor: 'pointer',
                  color: '#666',
                  fontWeight: '500'
                }}
              >
                {showConfirm ? "Hide" : "Show"}
              </button>
            </div>
          </label>

          {/* Display validation errors */}
          {status.error && <p className="error-message">{status.error}</p>}

          {/* Form action buttons */}
          <div className="change-password-buttons">
            <button type="submit" className="section-footer-button">
              Save Password
            </button>
            <button
              type="button"
              className="section-footer-button"
              onClick={() => navigate("/settings")} // Return to settings page
            >
              Cancel
            </button>
          </div>
        </form>
      </main>

      {/* Success Notification Popup - Shows after successful password change */}
      {status.success && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h3>Password changed successfully!</h3>
            <button
              className="popup-btn"
              onClick={() => navigate("/settings")} // Return to settings page
            >
              Return
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
