import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../css/dashboard.css";
import "../css/ProjectView.css";
import DashboardHeader from "../components/DashboardHeader";
import { getProjectById, getTasksByProject } from "../mockData";

export default function ProjectView() {
  const navigate = useNavigate();
  const { id } = useParams();
  const project = getProjectById(id);
  const projectTasks = getTasksByProject(id);

  const handleReturn = () => navigate("/projects");

  return (
    <div className="dashboard-container">
      <DashboardHeader />

      <main>
        {/* Project title and buttons */}
        <div className="dashboard-title-actions">
          <h2>{project ? project.name : "Project not found"}</h2>
          <div className="dashboard-buttons">
            <button className="btn-edit">Edit Project</button>
            <button className="btn-return" onClick={handleReturn}>Return</button>
          </div>
        </div>

        {project ? (
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
                  <div>{task.tags}</div>
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
        ) : (
          <div className="project-details">
            <p>We could not find this project.</p>
          </div>
        )}
      </main>
    </div>
  );
}
