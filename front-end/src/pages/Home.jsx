import React from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch } from "react-icons/fi"; // Feather search icon
import "../css/dashboard.css";
import DashboardHeader from "../components/DashboardHeader";
import AllTasks from "./AllTasks";
import AllProjects from "./AllProjects";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="dashboard-container">
      <DashboardHeader />

      <main>
        <section className="home-section">
          <AllTasks
            embedded
            limit={10}
            renderActions={(navigateFn) => (
              <button
                className="search-button"
                title="Search Tasks"
                onClick={() => navigateFn("/tasks/search")}
              >
                <FiSearch size={18} />
              </button>
            )}
          />

          <button
            className="section-footer-button"
            onClick={() => navigate("/tasks")}
          >
            All Tasks
          </button>
        </section>

        <section className="home-section">
          <AllProjects embedded limit={10} />

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
