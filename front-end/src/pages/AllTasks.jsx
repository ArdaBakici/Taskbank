// src/pages/AllTasks.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiCircle,
  FiCheckCircle,
  FiLoader,
  FiPauseCircle,
  FiAlertCircle,
  FiFileText
} from "react-icons/fi";
import "../css/dashboard.css";
import DashboardHeader from "../components/DashboardHeader";

export default function AllTasks({
  embedded = false,
  limit,
  renderActions,
  showFooter = true,
}) {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
    // Load Tasks

  useEffect(() => {
    let isMounted = true;

    async function loadTasks() {
      try {
        const apiUrl =
          process.env.REACT_APP_API_URL || "http://localhost:4000/api";
        const params = new URLSearchParams();

        if (embedded && limit) params.append("num_of_tasks", limit);

        const url = `${apiUrl}/tasks?${params.toString()}`;
        const response = await fetch(url);
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();

        if (isMounted) setTasks(data.tasks || []);
      } catch (err) {
        console.error("Failed to load tasks", err);
        if (isMounted) setError("Unable to load tasks right now.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadTasks();
    return () => {
      isMounted = false;
    };
  }, [embedded, limit]);
  
  // Helpers

  const renderTags = (tagList) =>
    !tagList || tagList.length === 0
      ? "—"
      : Array.isArray(tagList)
      ? tagList.join(", ")
      : tagList;

  const getStatusIcon = (status) => {
    const icons = {
      "In Progress": <FiLoader className="status-icon-inprogress" />,
      "Not Started": <FiCircle className="status-icon-notstarted" />,
      Completed: <FiCheckCircle className="status-icon-completed" />,
      "On Hold": <FiPauseCircle className="status-icon-onhold" />,
      Blocked: <FiAlertCircle className="status-icon-blocked" />,
    };
    return icons[status] || <FiFileText className="status-icon-default" />;
  };

  const parseLocalDate = (dateStr) => {
    if (!dateStr) return null;
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day); // Local timezone
  };

  const isOverdue = (deadline, status) => {
    if (status === "Completed" || !deadline) return false;

    const today = new Date();
    const d = parseLocalDate(deadline);

    today.setHours(0, 0, 0, 0);
    d.setHours(0, 0, 0, 0);

    return d < today;
  };

  const isDueTomorrow = (deadline, status) => {
    if (status === "Completed" || !deadline) return false;

    const today = new Date();
    const d = parseLocalDate(deadline);

    today.setHours(0, 0, 0, 0);
    d.setHours(0, 0, 0, 0);

    const diffDays = (d - today) / (1000 * 60 * 60 * 24);
    return diffDays === 1;
  };

  // Render Content

  const listContent = (
    <>
      <div className="dashboard-title-actions">
        <h2>Tasks</h2>

        <div className="dashboard-buttons">
          <button onClick={() => navigate("/tasks/new")}>Create</button>
          {renderActions && renderActions(navigate)}
        </div>
      </div>

      <div className="task-list">
        {loading && <p>Loading tasks...</p>}
        {error && <p>{error}</p>}
        {!loading && !error && tasks.length === 0 && <p>No tasks found.</p>}

        {!loading &&
          !error &&
          tasks.length > 0 &&
          tasks.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`task-row task-row-button ${
                isOverdue(t.deadline, t.status)
                  ? "task-overdue"
                  : isDueTomorrow(t.deadline, t.status)
                  ? "task-due-soon"
                  : ""
              }`}
              onClick={() => navigate(`/task/${t.id}`)}
            >
              <div>
                <span className="task-status-icon">
                  {getStatusIcon(t.status)}
                </span>
                {t.name}
              </div>
              <div>{renderTags(t.tags)}</div>
              <div>{t.deadline}</div>
            </button>
          ))}
      </div>
    </>
  );

  if (embedded) return listContent;

  return (
    <div className="dashboard-container">
      <DashboardHeader />

      <main>
        {listContent}

        {showFooter && (
          <button
            className="section-footer-button tasks-return"
            onClick={() => navigate("/home")}
          >
            Return
          </button>
        )}
      </main>
    </div>
  );
}
