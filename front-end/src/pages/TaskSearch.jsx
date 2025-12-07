import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authenticatedFetch } from "../utils/auth";
import "../css/dashboard.css";
import DashboardHeader from "../components/DashboardHeader";

export default function SearchTasks() {
  const navigate = useNavigate();
  const [allTasks, setAllTasks] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1) Load ALL tasks once on mount
  useEffect(() => {
    async function loadAllTasks() {
      try {
        setLoading(true);

        // Same tasks endpoint used by AllTasks.jsx
        const response = await authenticatedFetch("/tasks?sorting_method=id");

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        const all = data.tasks || [];
        setAllTasks(all);   // store full list
        setTasks(all);      // initially show all tasks
      } catch (err) {
        console.error("Failed to load tasks", err);
        setError("Unable to load tasks right now.");
      } finally {
        setLoading(false);
      }
    }

    loadAllTasks();

  }, []); // runs only once on mount

  // 2) Filter tasks locally when query changes
  useEffect(() => {
    // If query is empty, show all tasks
    if (!query.trim()) {
      setTasks(allTasks);
      return;
    }

  const lower = query.toLowerCase();

  const filtered = allTasks.filter((task) => {
    const nameMatch = (task.name || "").toLowerCase().includes(lower);
    const tagsMatch = (task.tags || [])
      .join(" ")
      .toLowerCase()
      .includes(lower);

    return nameMatch || tagsMatch;
  });

  setTasks(filtered);
}, [query, allTasks]);


  const renderTags = (tagList) => {
    if (!tagList || tagList.length === 0) return "—";
    return Array.isArray(tagList) ? tagList.join(", ") : tagList;
  };

  const formatDeadline = (deadline) => {
    if (!deadline) return "No deadline";
    try {
      const date = new Date(deadline);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (e) {
      return "Invalid date";
    }
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
            onChange={(e) => {
                setQuery(e.target.value);
              }}
          />
        </div>

        <div className="task-list">
          {loading && <p>Loading tasks...</p>}
          {error && <p>{error}</p>}
          {!loading &&
            !error &&
            tasks.map((task) => (
              <button
                key={task._id}
                type="button"
                className="task-row task-row-button"
                onClick={() => navigate(`/task/${task._id}`)}
              >
                <div>{task.name}</div>
                <div>{renderTags(task.tags)}</div>
                <div>{formatDeadline(task.deadline)}</div>
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
