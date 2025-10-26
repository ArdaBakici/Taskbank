import React from "react";
import { useNavigate } from "react-router-dom";
import "../css/dashboard.css";
import logo from "../assets/logo.png";

export default function Home() {
  const navigate = useNavigate();

  const tasks = [
    { name: "Task 1", tags: "Tags", deadline: "Deadline" },
    { name: "Task 2", tags: "Tags", deadline: "Deadline" },
  ];

  const projects = [
    { name: "Project 1", tags: "Tags", deadline: "Deadline" },
    { name: "Project 2", tags: "Tags", deadline: "Deadline" },
  ];

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Taskbank</h1>
        <div className="logo-box">
          <img src={logo} alt="Logo" className="logo-image" />
        </div>
      </header>

      <main>
        <section className="home-section">
          <div className="dashboard-title-actions">
            <h2>Tasks</h2>
            <div className="dashboard-buttons">
              <button onClick={() => navigate("/tasks/new")}>Create</button>
              <button>Sort</button>
            </div>
          </div>

          <div className="task-list">
            {tasks.map((task, idx) => (
              <div key={idx} className="task-row">
                <div>{task.name}</div>
                <div>{task.tags}</div>
                <div>{task.deadline}</div>
              </div>
            ))}
          </div>

          <button
            className="section-footer-button"
            onClick={() => navigate("/tasks")}
          >
            All Tasks
          </button>
        </section>

        <section className="home-section">
          <div className="dashboard-title-actions">
            <h2>Projects</h2>
            <div className="dashboard-buttons">
              <button onClick={() => navigate("/projects/new")}>Create</button>
              <button>Sort</button>
            </div>
          </div>

          <div className="project-list">
            {projects.map((project, idx) => (
              <div key={idx} className="project-row">
                <div>{project.name}</div>
                <div>{project.tags}</div>
                <div>{project.deadline}</div>
              </div>
            ))}
          </div>

          <button
            className="section-footer-button"
            onClick={() => navigate("/projects")}
          >
            All Projects
          </button>
        </section>

        <div className="home-bottom-buttons">
          <button onClick={() => navigate("/stats")}>Stats</button>
          <button onClick={() => navigate("/settings")}>Settings</button>
        </div>
      </main>
    </div>
  );
}
