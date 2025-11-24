import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authenticatedFetch } from "../utils/auth";
import "../css/dashboard.css";
import DashboardHeader from "../components/DashboardHeader";

export default function SearchTasks() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadTasks() {
      try {
        setLoading(true);

        // Call backend search endpoint
        const url = `/search?q=${encodeURIComponent(query)}`;
        const response = await authenticatedFetch(url);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (isMounted) setTasks(data.results || []);
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
  }, [query]); // ✅ Re-run whenever query changes

  const renderTags = (tagList) => {
    if (!tagList || tagList.length === 0) return "—";
    return Array.isArray(tagList) ? tagList.join(", ") : tagList;
  };

  return (
    <div className="dashboard-container">
      <DashboardHeader />

      <main>
        <div className="dashboard-title-actions">
          <h2>Search Tasks</h2>
        </div>

        <div className="form-group full-width">
          <input
            id="task-search"
            type="text"
            placeholder="Search by task name or tags..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="task-list">
          {loading && <p>Loading tasks...</p>}
          {error && <p>{error}</p>}
          {!loading &&
            !error &&
            tasks.map((task) => (
              <button
                key={task.id}
                type="button"
                className="task-row task-row-button"
                onClick={() => navigate(`/task/${task.id}`)}
              >
                <div>{task.name}</div>
                <div>{renderTags(task.tags)}</div>
                <div>{task.deadline}</div>
              </button>
            ))}
          {!loading && !error && tasks.length === 0 && <p>No tasks found.</p>}
        </div>

        <button
          className="section-footer-button tasks-return"
          onClick={() => navigate("/home")}
        >
          Return
        </button>
      </main>
    </div>
  );
}
