import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/dashboard.css";
import DashboardHeader from "../components/DashboardHeader";
import { fetchTasks } from "../utils/mockDataLoader";

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
        const data = await fetchTasks();
        if (isMounted) setTasks(data);
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
  }, []);

  const renderTags = (tagList) => {
    if (!tagList || tagList.length === 0) return "—";
    return Array.isArray(tagList) ? tagList.join(", ") : tagList;
  };

  const filteredTasks = tasks.filter((task) => {
    const q = query.toLowerCase();
    const nameMatch = task.name.toLowerCase().includes(q);
    const tagsMatch =
      task.tags &&
      task.tags.some((tag) => tag.toLowerCase().includes(q));
    return nameMatch || tagsMatch;
  });

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
            filteredTasks.map((task) => (
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
          {!loading && !error && filteredTasks.length === 0 && (
            <p>No tasks found.</p>
          )}
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
