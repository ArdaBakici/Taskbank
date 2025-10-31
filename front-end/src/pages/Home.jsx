import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch } from "react-icons/fi"; // Feather search icon
import "../css/dashboard.css";
import DashboardHeader from "../components/DashboardHeader";
import { fetchProjects, fetchTasks } from "../utils/mockDataLoader";

export default function Home() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const [taskData, projectData] = await Promise.all([
          fetchTasks(),
          fetchProjects(),
        ]);
        if (isMounted) {
          setTasks(taskData);
          setProjects(projectData);
        }
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const featuredTasks = tasks.slice(0, 2);
  const featuredProjects = projects.slice(0, 2);

  const renderTags = (tagList) => {
    if (!tagList || tagList.length === 0) return "—";
    return Array.isArray(tagList) ? tagList.join(", ") : tagList;
  };

  return (
    <div className="dashboard-container">
      <DashboardHeader />

      <main>
        {/* TASKS SECTION */}
        <section className="home-section">
          <div className="dashboard-title-actions">
            <h2>Tasks</h2>
            <div className="dashboard-buttons">
              <button onClick={() => navigate("/tasks/new")}>Create</button>
              <button>Sort</button>
              <button
                className="search-button"
                title="Search Tasks"
                onClick={() => navigate("/tasks/search")}
              >
                <FiSearch size={18} />
              </button>
            </div>
          </div>

          <div className="task-list">
            {loading ? (
              <p>Loading tasks...</p>
            ) : (
              featuredTasks.map((task) => (
                <button
                  key={task.id}
                  type="button"
                  className="task-row task-row-button"
                  onClick={() => navigate(`/task/${task.id}`)}
                >
                  <div>{task.name}</div>
                  <div>{renderTags(task.tags)}</div>
                  <div>{task.deadline}</div>
                </button>
              ))
            )}
          </div>

          <button
            className="section-footer-button"
            onClick={() => navigate("/tasks")}
          >
            All Tasks
          </button>
        </section>

        {/* PROJECTS SECTION */}
        <section className="home-section">
          <div className="dashboard-title-actions">
            <h2>Projects</h2>
            <div className="dashboard-buttons">
              <button onClick={() => navigate("/projects/new")}>Create</button>
              <button>Sort</button>
            </div>
          </div>

          <div className="project-list">
            {loading ? (
              <p>Loading projects...</p>
            ) : (
              featuredProjects.map((project) => (
                <button
                  key={project.id}
                  type="button"
                  className="project-row project-row-button"
                  onClick={() => navigate(`/project/${project.id}`)}
                >
                  <div>{project.name}</div>
                  <div>{renderTags(project.tags)}</div>
                  <div>{project.deadline}</div>
                </button>
              ))
            )}
          </div>

          <button
            className="section-footer-button"
            onClick={() => navigate("/projects")}
          >
            All Projects
          </button>
        </section>

        {/* BOTTOM BUTTONS */}
        <div className="home-bottom-buttons">
          <button onClick={() => navigate("/stats")}>Stats</button>
          <button onClick={() => navigate("/settings")}>Settings</button>
        </div>
      </main>
    </div>
  );
}
