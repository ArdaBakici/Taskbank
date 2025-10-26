import React from "react";
import { useNavigate } from "react-router-dom";
import "../css/dashboard.css";
import "../css/ProjectView.css";
import logo from "../assets/logo.png";

export default function ProjectView() {
  const navigate = useNavigate();

  // Example project data
  const project = {
    name: "Website Revamp",
    description: "Revamp the company website with new design and features.",
    deadline: "30 Nov 2025",
    urgency: "High",
    tasks: [
      { id: 1, name: "Design homepage", tags: "UI, Frontend", deadline: "25 Oct 2025" },
      { id: 2, name: "Implement login", tags: "Backend, Auth", deadline: "28 Oct 2025" },
      { id: 3, name: "Set up database", tags: "DB, Backend", deadline: "30 Oct 2025" },
    ],
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <h1>Taskbank</h1>
        <div className="logo-box">
          <img src={logo} alt="Logo" className="logo-image" />
        </div>
      </header>

      <main>
        {/* Project title and buttons */}
        <div className="dashboard-title-actions">
          <h2>{project.name}</h2>
          <div className="dashboard-buttons">
            <button className="btn-edit">Edit Project</button>
            <button className="btn-return" onClick={() => navigate("/projects")}>Return</button>
          </div>
        </div>

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
          {project.tasks.map((task) => (
            <div key={task.id} className="task-row">
              <div>{task.name}</div>
              <div>{task.tags}</div>
              <div>{task.deadline}</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
