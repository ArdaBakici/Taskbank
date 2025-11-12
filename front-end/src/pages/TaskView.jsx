// src/pages/TaskView.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../css/dashboard.css";
import "../css/forms.css";
import DashboardHeader from "../components/DashboardHeader";

export default function TaskView() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [task, setTask] = useState(null);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:4000/api";

  useEffect(() => {
    let isMounted = true;

    async function loadTask() {
      setLoading(true);
      try {
        // Fetch task from backend
        const resTask = await fetch(`${API_BASE}/tasks/${id}`);
        if (!resTask.ok) throw new Error("Failed to fetch task");
        const dataTask = await resTask.json();
        const fetchedTask = dataTask.task;

        if (!isMounted) return;
        setTask(fetchedTask || null);

        // Fetch project from backend if task has a projectId
        let relatedProject = null;
        if (fetchedTask && fetchedTask.projectId) {
          const resProject = await fetch(`${API_BASE}/projects/${fetchedTask.projectId}`);
          if (resProject.ok) {
            const dataProject = await resProject.json();
            relatedProject = dataProject || null;
          }
        }
        if (isMounted) setProject(relatedProject);
      } catch (error) {
        console.error("Failed to load task", error);
        if (isMounted) {
          setTask(null);
          setProject(null);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadTask();

    return () => {
      isMounted = false;
    };
  }, [id, API_BASE]);

  const handleEdit = () => navigate(`/tasks/edit/${id}`);
  const handleBack = () => navigate("/home");

  if (loading) {
    return (
      <div className="dashboard-container">
        <DashboardHeader />
        <main>
          <p>Loading task...</p>
        </main>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="dashboard-container">
        <DashboardHeader />
        <main>
          <p>Task not found.</p>
          <button onClick={handleBack}>Back to Tasks</button>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <DashboardHeader />
      <main>
        <div className="dashboard-title-actions">
          <h2>Task Details</h2>
          <div className="dashboard-buttons">
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
              <p>{project ? project.name : "Unassigned"}</p>
            </div>
          </div>
        </div>

        <button className="section-footer-button" onClick={handleBack}>
          Return
        </button>
      </main>
    </div>
  );
}
