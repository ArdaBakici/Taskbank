import React from "react";
import { useNavigate } from "react-router-dom";
import "../css/dashboard.css";
import DashboardHeader from "../components/DashboardHeader";
import { tasks, projects } from "../mockData";

export default function Home() {
  const navigate = useNavigate();

  const featuredTasks = tasks.slice(0, 2);
  const featuredProjects = projects.slice(0, 2);

  return (
    <div className="dashboard-container">
      <DashboardHeader />

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
            {featuredTasks.map((task) => (
              <button
                key={task.id}
                type="button"
                className="task-row task-row-button"
                onClick={() => navigate(`/task/${task.id}`)}
              >
                <div>{task.name}</div>
                <div>{task.tags}</div>
                <div>{task.deadline}</div>
              </button>
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
            {featuredProjects.map((project) => (
              <button
                key={project.id}
                type="button"
                className="project-row project-row-button"
                onClick={() => navigate(`/project/${project.id}`)}
              >
                <div>{project.name}</div>
                <div>{project.tags}</div>
                <div>{project.deadline}</div>
              </button>
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
