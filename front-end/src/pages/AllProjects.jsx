import React from "react";
import { useNavigate } from "react-router-dom";
import "../css/dashboard.css";
import DashboardHeader from "../components/DashboardHeader";
import { projects } from "../mockData";
export default function AllProjects() {
  const navigate = useNavigate();

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
          {projects.map((p) => (
            <button
              key={p.id}
              type="button"
              className="project-row project-row-button"
              onClick={() => navigate(`/project/${p.id}`)}
            >
              <div>{p.name}</div>
              <div>{p.tags}</div>
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
