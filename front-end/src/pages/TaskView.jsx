// src/pages/TaskView.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { authenticatedFetch } from "../utils/auth";
import "../css/dashboard.css";
import "../css/forms.css";
import DashboardHeader from "../components/DashboardHeader";

export default function TaskView() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [task, setTask] = useState(null);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadTask() {
      setLoading(true);
      try {
        // Fetch task from backend
        const resTask = await authenticatedFetch(`/tasks/${id}`);
        if (!resTask.ok) throw new Error("Failed to fetch task");
        const dataTask = await resTask.json();
        const fetchedTask = dataTask.task;

        if (!isMounted) return;
        setTask(fetchedTask || null);

        // Fetch project from backend if task has a projectId
        let relatedProject = null;

        
        if (fetchedTask && fetchedTask.projectId) {
          const projectId = typeof fetchedTask.projectId === "object"
            ? fetchedTask.projectId.toString()
            : fetchedTask.projectId;

          const resProject = await authenticatedFetch(`/projects/${projectId}`);
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
  }, [id]);

  const handleEdit = () => navigate(`/tasks/edit/${id}`);
  const handleBack = () => navigate(-1);

  const formatDeadline = (deadline) => {
    if (!deadline) return "";
    try {
      const date = new Date(deadline);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (e) {
      return "Invalid date";
    }
  };

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
              <p>{formatDeadline(task.deadline)}</p>
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
