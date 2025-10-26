import React from "react";
import "../css/dashboard.css";
import logo from "../assets/logo.png";

export default function AllTasks() {
  const tasks = [
    { name: "Task 1", tags: "Tags", deadline: "Deadline" },
    { name: "Task 2", tags: "Tags", deadline: "Deadline" },
    { name: "Task 3", tags: "Tags", deadline: "Deadline" },
    { name: "Task 4", tags: "Tags", deadline: "Deadline" },
    { name: "Task 5", tags: "Tags", deadline: "Deadline" },
    { name: "Task 6", tags: "Tags", deadline: "Deadline" },
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
          <h2>Tasks</h2>
          <div className="dashboard-buttons">
            <button>Create</button>
            <button>Sort</button>
          </div>
        </div>

        <div className="task-list">
          {tasks.map((t, idx) => (
            <div key={idx} className="task-row">
              <div>{t.name}</div>
              <div>{t.tags}</div>
              <div>{t.deadline}</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
