import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { authenticatedFetch } from "../utils/auth";
import "../css/dashboard.css";
import "../css/ProjectView.css";
import DashboardHeader from "../components/DashboardHeader";
import AllTasks from "./AllTasks";

async function fetchProjectById(id) {
  const res = await authenticatedFetch(`/projects/${id}`);
  if (!res.ok) throw new Error("Failed to fetch project");
  return res.json();
}

export default function ProjectView() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadProject() {
      setLoading(true);
      setError(null);
      try {
        const projectData = await fetchProjectById(id);
        setProject(projectData || null);
      } catch (err) {
        console.error("Failed to load project", err);
        setProject(null);
        setError("Unable to load project details right now.");
      } finally {
        setLoading(false);
      }
    }

    loadProject();
  }, [id]);

  const handleReturn = () => navigate(-1);
  const handleEdit = () => navigate(`/projects/edit/${id}`);

  const formatDeadline = (deadline) => {
    if (!deadline) return "No deadline set";
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
        {/* Project title and buttons */}
        <div className="dashboard-title-actions">
          <h2>{project ? project.name : loading ? "Loading..." : "Project not found"}</h2>
          <div className="dashboard-buttons">
            <button className="btn-edit" onClick={handleEdit}>Edit Project</button>
          </div>
        </div>

        {loading && <p>Loading project...</p>}
        {error && <p>{error}</p>}

        {!loading && project ? (
          <>
            {/* Project description and details */}
            <div className="form-card">
              <div className="form-row">
                <div className="form-group full-width">
                  <label>Description</label>
                  <p>{project.description || "No description"}</p>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Status</label>
                  <p>{project.status}</p>
                </div>
                <div className="form-group">
                  <label>Deadline</label>
                  <p>{formatDeadline(project.deadline)}</p>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group full-width">
                  <label>Tags</label>
                  <p>{project.tags && project.tags.length > 0 ? project.tags.join(", ") : "No tags"}</p>
                </div>
              </div>
            </div>

            {/* Tasks section */}
            <div className="dashboard-title-actions">
              <h3>Tasks of Project</h3>
            </div>

            <AllTasks 
              embedded={true} 
              filterBy="project" 
              filterValue={id} 
              showFooter={false}
              buttons_bitmap={0b0110} // Show Sort (bit 1) and Filter (bit 2) buttons
              hideFilterDisplay={true}
            />

            <button
              className="section-footer-button"
              onClick={handleReturn}
            >
              Return
            </button>
          </>
        ) : !loading ? (
          <div className="project-details">
            <p>We could not find this project.</p>
          </div>
        ) : null}
      </main>
    </div>
  );
}
