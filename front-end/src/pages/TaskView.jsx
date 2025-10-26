// src/pages/TaskView.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../css/dashboard.css";
import "../css/forms.css";
import logo from "../assets/logo.png";

export default function TaskView() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTask() {
      setLoading(true);
      try {
        // Replace with real API call using id
        const mockData = {
          id,
          title: "Design homepage",
          description: "Create a modern, responsive homepage for the web app.",
          deadline: "2025-10-31",
          urgency: "High",
          project: "Website Revamp",
          status: "In Progress",
        };
        setTask(mockData);
      } catch (error) {
        console.error("Error loading task:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchTask();
  }, [id]);

  const handleEdit = () => {
    navigate(`/tasks/edit/${id}`);
  };

  const handleBack = () => {
    navigate("/tasks");
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <header className="dashboard-header">
          <h1>Taskbank</h1>
          <div className="logo-box">
            <img src={logo} alt="Logo" className="logo-image" />
          </div>
        </header>
        <main>
          <p>Loading task...</p>
        </main>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="dashboard-container">
        <header className="dashboard-header">
          <h1>Taskbank</h1>
          <div className="logo-box">
            <img src={logo} alt="Logo" className="logo-image" />
          </div>
        </header>
        <main>
          <p>Task not found.</p>
          <button onClick={handleBack}>Back to Tasks</button>
        </main>
      </div>
    );
  }

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
          <h2>Task Details</h2>
          <div className="dashboard-buttons">
            <button onClick={handleBack}>Back to Tasks</button>
            <button onClick={handleEdit}>Edit Task</button>
          </div>
        </div>

        <div className="form-card">
          <div className="form-row">
            <div className="form-group full-width">
              <label>Title</label>
              <p>{task.title}</p>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group full-width">
              <label>Description</label>
              <p>{task.description}</p>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Status</label>
              <p>{task.status}</p>
            </div>
            <div className="form-group">
              <label>Deadline</label>
              <p>{task.deadline}</p>
            </div>
            <div className="form-group">
              <label>Urgency</label>
              <p>{task.urgency}</p>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group full-width">
              <label>Project</label>
              <p>{task.project}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
