import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../css/dashboard.css";
import "../css/ProjectView.css";
import DashboardHeader from "../components/DashboardHeader";
import {
  fetchProjectById,
  fetchTasksByProject,
} from "../utils/mockDataLoader";

export default function ProjectView() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [projectTasks, setProjectTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadProject() {
      setLoading(true);
      setError(null);
      try {
        const [projectData, tasksData] = await Promise.all([
          fetchProjectById(id),
          fetchTasksByProject(id),
        ]);
        if (!isMounted) return;
        setProject(projectData || null);
        setProjectTasks(tasksData || []);
      } catch (err) {
        console.error("Failed to load project", err);
        if (isMounted) {
          setProject(null);
          setProjectTasks([]);
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




  const renderTags = (tagList) => {
    if (!tagList || tagList.length === 0) return "—";
    return Array.isArray(tagList) ? tagList.join(", ") : tagList;
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
            <div className="project-details">
              <p>{project.description}</p>
              <p><strong>Deadline:</strong> {project.deadline}</p>
              <p><strong>Urgency:</strong> {project.urgency}</p>
            </div>

            {/* Tasks section */}
            <div className="dashboard-title-actions">
              <h3>Tasks of Project</h3>
              <div className="dashboard-buttons">
                <button>Sort</button>
              </div>
            </div>

            <div className="task-list">
              {projectTasks.map((task) => (
                <div key={task.id} className="task-row">
                  <div>{task.name}</div>
                  <div>{renderTags(task.tags)}</div>
                  <div>{task.deadline}</div>
                </div>
              ))}
            </div>
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
