import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/dashboard.css";
import DashboardHeader from "../components/DashboardHeader";
import { fetchTasks } from "../utils/mockDataLoader";

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

  useEffect(() => {
    let isMounted = true;

    async function loadTasks() {
      try {
        const data = await fetchTasks();
        if (isMounted) {
          setTasks(data);
        }
      } catch (err) {
        console.error("Failed to load tasks", err);
        if (isMounted) {
          setError("Unable to load tasks right now.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadTasks();
    return () => {
      isMounted = false;
    };
  }, []);

  const displayedTasks = useMemo(() => {
    if (typeof limit === "number") {
      return tasks.slice(0, limit);
    }
    return tasks;
  }, [tasks, limit]);

  const renderTags = (tagList) => {
    if (!tagList || tagList.length === 0) return "—";
    return Array.isArray(tagList) ? tagList.join(", ") : tagList;
  };

  const listContent = (
    <>
      <div className="dashboard-title-actions">
        <h2>Tasks</h2>
        <div className="dashboard-buttons">
          <button onClick={() => navigate("/tasks/new")}>Create</button>
          <button>Sort</button>
          {renderActions && renderActions(navigate)}
        </div>
      </div>

      <div className="task-list">
        {loading && <p>Loading tasks...</p>}
        {error && <p>{error}</p>}
        {!loading &&
          !error &&
          displayedTasks.map((t) => (
            <button
              key={t.id}
              type="button"
              className="task-row task-row-button"
              onClick={() => navigate(`/task/${t.id}`)}
            >
              <div>{t.name}</div>
              <div>{renderTags(t.tags)}</div>
              <div>{t.deadline}</div>
            </button>
          ))}
      </div>
    </>
  );

  if (embedded) {
    return listContent;
  }

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
