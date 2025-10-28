// src/pages/TaskView.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../css/dashboard.css";
import "../css/forms.css";
import DashboardHeader from "../components/DashboardHeader";
import {
  fetchTaskById,
  fetchProjectById,
} from "../utils/mockDataLoader";

export default function TaskView() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadTask() {
      setLoading(true);
      try {
        const fetchedTask = await fetchTaskById(id);
        if (!isMounted) return;
        setTask(fetchedTask || null);
        if (fetchedTask && fetchedTask.projectId) {
          const relatedProject = await fetchProjectById(
            fetchedTask.projectId
          );
          if (isMounted) {
            setProject(relatedProject || null);
          }
        } else if (isMounted) {
          setProject(null);
        }
      } catch (error) {
        console.error("Failed to load task", error);
        if (isMounted) {
          setTask(null);
          setProject(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadTask();
    return () => {
      isMounted = false;
    };
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
              <p>{project ? project.name : "Unassigned"}</p>
            </div>
          </div>
        </div>

        <button
          className="section-footer-button"
          onClick={handleBack}
        >
          Return
        </button>
      </main>
    </div>
  );
}
