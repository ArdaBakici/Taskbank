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
    let isMounted = true;

    async function loadProject() {
      setLoading(true);
      setError(null);
      try {
        const projectData = await fetchProjectById(id);
        if (!isMounted) return;
        setProject(projectData || null);
      } catch (err) {
        console.error("Failed to load project", err);
        if (isMounted) {
          setProject(null);
          setError("Unable to load project details right now.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadProject();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleReturn = () => navigate(-1);
  const handleEdit = () => navigate(`/projects/edit/${id}`);

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
            <div className="project-details">
              <p>{project.description}</p>
              <p><strong>Deadline:</strong> {project.deadline}</p>
              <p><strong>Urgency:</strong> {project.urgency}</p>
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
