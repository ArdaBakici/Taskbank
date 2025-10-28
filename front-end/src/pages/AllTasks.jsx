import React from "react";
import { useNavigate } from "react-router-dom";
import "../css/dashboard.css";
import DashboardHeader from "../components/DashboardHeader";
import { tasks } from "../mockData";

export default function AllTasks() {
  const navigate = useNavigate();

  return (
    <div className="dashboard-container">
      <DashboardHeader />

      <main>
        <div className="dashboard-title-actions">
          <h2>Tasks</h2>
          <div className="dashboard-buttons">
            <button onClick={() => navigate("/tasks/new")}>Create</button>
            <button>Sort</button>
          </div>
        </div>

        <div className="task-list">
          {tasks.map((t) => (
            <button
              key={t.id}
              type="button"
              className="task-row task-row-button"
              onClick={() => navigate(`/task/${t.id}`)}
            >
              <div>{t.name}</div>
              <div>{t.tags}</div>
              <div>{t.deadline}</div>
            </button>
          ))}
        </div>

        <button
          className="section-footer-button tasks-return"
          onClick={() => navigate("/home")}
        >
          Return
        </button>
      </main>
    </div>
  );
}
