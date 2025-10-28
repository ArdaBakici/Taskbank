import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/dashboard.css";
import DashboardHeader from "../components/DashboardHeader";
import { fetchProjects } from "../utils/mockDataLoader";
export default function AllProjects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadProjects() {
      try {
        const data = await fetchProjects();
        if (isMounted) {
          setProjects(data);
        }
      } catch (err) {
        console.error("Failed to load projects", err);
        if (isMounted) {
          setError("Unable to load projects right now.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadProjects();
    return () => {
      isMounted = false;
    };
  }, []);

  const renderTags = (tagList) => {
    if (!tagList || tagList.length === 0) return "—";
    return Array.isArray(tagList) ? tagList.join(", ") : tagList;
  };

  return (
    <div className="dashboard-container">
      <DashboardHeader />

      <main>
        <div className="dashboard-title-actions">
          <h2>Projects</h2>
          <div className="dashboard-buttons">
            <button onClick={() => navigate("/projects/new")}>Create</button>
            <button>Sort</button>
          </div>
        </div>

        <div className="project-list">
          {loading && <p>Loading projects...</p>}
          {error && <p>{error}</p>}
          {!loading &&
            !error &&
            projects.map((p) => (
              <button
                key={p.id}
                type="button"
                className="project-row project-row-button"
                onClick={() => navigate(`/project/${p.id}`)}
              >
                <div>{p.name}</div>
                <div>{renderTags(p.tags)}</div>
                <div>{p.deadline}</div>
              </button>
            ))}
        </div>

        <button
          className="section-footer-button projects-return"
          onClick={() => navigate("/home")}
        >
          Return
        </button>
      </main>
    </div>
  );
}
