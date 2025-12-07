import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authenticatedFetch } from "../utils/auth";
import "../css/dashboard.css";
import DashboardHeader from "../components/DashboardHeader";

export default function ProjectSearch() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadProjects() {
      try {
        setLoading(true);

        const response = await authenticatedFetch('/projects');

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Search by name OR tags
        const filtered = data.projects.filter((p) => {
          const nameMatch = p.name.toLowerCase().includes(query.toLowerCase());
          const tagsMatch =
            (p.tags || [])
              .join(" ")
              .toLowerCase()
              .includes(query.toLowerCase());

          return nameMatch || tagsMatch;
        });

        setProjects(filtered);
      } catch (err) {
        console.error("Failed to load projects", err);
        setError("Unable to load projects right now.");
      } finally {
        setLoading(false);
      }
    }

    loadProjects();
  }, [query]);

  const renderTags = (tagList) => {
    if (!tagList || tagList.length === 0) return "—";
    return Array.isArray(tagList) ? tagList.join(", ") : tagList;
  };

  const formatDeadline = (deadline) => {
    if (!deadline) return "—";
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
          <h2>Search Projects</h2>
        </div>

        {/* EXACT SAME SPACING AS TASK SEARCH */}
        <div className="form-group full-width">
          <input
            id="project-search"
            type="text"
            placeholder="Search by project name or tags..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {/* SAME LIST CLASS AS TASKS */}
        <div className="task-list">
          {loading && <p>Loading projects...</p>}
          {error && <p>{error}</p>}

          {!loading &&
            !error &&
            projects.map((project) => (
              <button
                key={project._id}
                type="button"
                className="task-row task-row-button"
                onClick={() => navigate(`/project/${project._id}`)}
              >
                <div>{project.name}</div>
                <div>{renderTags(project.tags)}</div>
                <div>{formatDeadline(project.deadline)}</div>
              </button>
            ))}

          {!loading && !error && projects.length === 0 && (
            <p>No projects found.</p>
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
