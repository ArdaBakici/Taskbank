import React from "react";
import { useNavigate } from "react-router-dom";
import "../css/dashboard.css";
import DashboardHeader from "../components/DashboardHeader";

export default function Stats() {
  const navigate = useNavigate();

  const metrics = {
    tasksCompleted: 10,
    projectsFinished: 2,
    mostCommonTag: "School",
  };

  const graphBars = [3, 6, 4, 8, 5, 7, 9, 6, 10, 12, 9, 11];

  return (
    <div className="dashboard-container">
      <DashboardHeader />

      <main className="stats-main">
        <h2>Statistics</h2>
        <div className="stats-metric">
          <span>Tasks Completed:</span>
          <strong>{metrics.tasksCompleted}</strong>
        </div>
        <div className="stats-metric">
          <span>Projects Finished:</span>
          <strong>{metrics.projectsFinished}</strong>
        </div>
        <div className="stats-metric">
          <span>Most Common Tag:</span>
          <strong>{metrics.mostCommonTag}</strong>
        </div>

        <h3>Tasks Completed Graph (Past Month)</h3>
        <div className="stats-graph">
          {graphBars.map((value, idx) => (
            <div
              key={idx}
              className="stats-bar"
              style={{ height: `${value * 8}px` }}
            />
          ))}
        </div>

        <button
          className="section-footer-button stats-return"
          onClick={() => navigate("/home")}
        >
          Return
        </button>
      </main>
    </div>
  );
}
