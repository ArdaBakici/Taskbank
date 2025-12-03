import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authenticatedFetch, getUser, setUser } from "../utils/auth"; 
import "../css/dashboard.css";
import DashboardHeader from "../components/DashboardHeader";

export default function ChangeUsername() {
  const navigate = useNavigate();
  const [currentUsername, setCurrentUsername] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [status, setStatus] = useState({
    error: "",
    success: false,
    loading: false,
  });

  useEffect(() => {
    const user = getUser();
    if (user) {
      setCurrentUsername(user.username);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ error: "", success: false, loading: true });

    // ------- VALIDATION -------
    if (!newUsername) {
      return setStatus({ error: "Please enter a new username.", success: false, loading: false });
    }

    if (newUsername.length < 3) {
      return setStatus({ error: "Username must be at least 3 characters.", success: false, loading: false });
    }

    if (newUsername === currentUsername) {
      return setStatus({ error: "New username must be different from the current username.", success: false, loading: false });
    }

    // ------- API CALL -------
    try {
      const response = await authenticatedFetch("/settings/change-username", {
        method: "PATCH",
        body: JSON.stringify({
          newUsername,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return setStatus({ error: data.message || "Failed to change username.", success: false, loading: false });
      }

      // ------- SUCCESS -------
      // Update local storage with new username
      const user = getUser();
      if (user) {
        user.username = data.username;
        setUser(user);
      }

      setNewUsername("");
      setStatus({ error: "", success: true, loading: false });

    } catch (err) {
      return setStatus({ error: "Network error. Try again.", success: false, loading: false });
    }
  };

  return (
    <div className="dashboard-container">
      <DashboardHeader />

      <main className="change-password-page">
        <h2>Change Username</h2>

        <form className="change-password-form" onSubmit={handleSubmit}>
          <label htmlFor="currentUsername">
            Current Username
            <input
              type="text"
              id="currentUsername"
              value={currentUsername}
              disabled
              style={{ backgroundColor: '#f3f4f6', cursor: 'not-allowed' }}
            />
          </label>

          <label htmlFor="newUsername">
            New Username
            <input
              type="text"
              id="newUsername"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="Enter new username"
            />
          </label>

          {status.error && <p className="error-message">{status.error}</p>}

          <div className="change-password-buttons">
            <button type="submit" className="section-footer-button" disabled={status.loading}>
              {status.loading ? "Saving..." : "Save Username"}
            </button>
            <button
              type="button"
              className="section-footer-button cancel"
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
            <h3>Username changed successfully!</h3>
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
