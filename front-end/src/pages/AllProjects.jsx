import React from "react";
import "../css/dashboard.css";
import logo from "../assets/logo.png"; // adjust the path to your logo


export default function AllProjects() {
  const projects = [
    { name: "Project 1", tags: "Tags", deadline: "Deadline" },
    { name: "Project 2", tags: "Tags", deadline: "Deadline" },
    { name: "Project 3", tags: "Tags", deadline: "Deadline" },
    { name: "Project 4", tags: "Tags", deadline: "Deadline" },
    { name: "Project 5", tags: "Tags", deadline: "Deadline" },
    { name: "Project 6", tags: "Tags", deadline: "Deadline" },
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
        <div className="dashboard-title-actions">
          <h2>Projects</h2>
          <div className="dashboard-buttons">
            <button>Create</button>
            <button>Sort</button>
          </div>
        </div>

        <div className="project-list">
          {projects.map((p, idx) => (
            <div key={idx} className="project-row">
              <div>{p.name}</div>
              <div>{p.tags}</div>
              <div>{p.deadline}</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
