import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/dashboard.css";
import "../css/forms.css";
import DashboardHeader from "../components/DashboardHeader";

export default function AddProject() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    projectName: "",
    description: "",
    status: "Planning",
    deadline: "",
    tags: "",
    selectedTasks: [],
  });

  const [errors, setErrors] = useState({});
  const [availableTasks, setAvailableTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:4000/api";

  // Load UNASSIGNED tasks from backend (preferred: /tasks?unassigned=1)
  useEffect(() => {
    let isMounted = true;

    async function loadTasks() {
      setLoadingTasks(true);
      try {
        // Try server-side filter first
        let res = await fetch(`${apiUrl}/tasks?unassigned=1`);
        if (!res.ok) {
          // Fallback to fetching all tasks, filter client-side
          res = await fetch(`${apiUrl}/tasks`);
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();

        // Normalize: data may be {tasks:[...]} or just [...]
        const tasks = Array.isArray(data) ? data : data.tasks || [];

        // Fallback filter: keep tasks with no project assigned
        const unassigned = tasks.filter(
          (t) => t.projectId == null || t.projectId === "" || t.project === "Unassigned"
        );

        if (isMounted) setAvailableTasks(unassigned);
      } catch (e) {
        console.error("Failed to load tasks:", e);
        if (isMounted) setAvailableTasks([]);
      } finally {
        if (isMounted) setLoadingTasks(false);
      }
    }

    loadTasks();
    return () => {
      isMounted = false;
    };
  }, [apiUrl]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleTaskSelection = (taskId) => {
    setFormData((prev) => {
      const isSelected = prev.selectedTasks.includes(taskId);
      return {
        ...prev,
        selectedTasks: isSelected
          ? prev.selectedTasks.filter((id) => id !== taskId)
          : [...prev.selectedTasks, taskId],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    const newErrors = {};
    if (!formData.projectName.trim()) newErrors.projectName = "Project name is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setSubmitting(true);

    // Build project payload
    const projectPayload = {
      name: formData.projectName, // backend may expect `name`; if it expects `title`, swap this key
      description: formData.description,
      status: formData.status,
      deadline: formData.deadline || null,
      tags: formData.tags
        ? formData.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : [],
    };

    try {
      // 1) Create project
      const createRes = await fetch(`${apiUrl}/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(projectPayload),
      });

      if (!createRes.ok) {
        const err = await createRes.json().catch(() => ({}));
        throw new Error(err.message || `Failed to create project (HTTP ${createRes.status})`);
      }

      const created = await createRes.json();
      // Normalize id field (could be id or project.id)
      const projectId =
        created?.id ?? created?.project?.id ?? created?.projectId ?? created?.data?.id;

      if (!projectId) {
        throw new Error("Project created but no id returned by backend.");
      }

      // 2) If tasks were selected, assign them to the new project
      if (formData.selectedTasks.length > 0) {
        // Prefer a bulk endpoint if your backend supports it:
        // await fetch(`${apiUrl}/projects/${projectId}/tasks`, { method:"POST", body: JSON.stringify({ taskIds: formData.selectedTasks }) })
        // Otherwise, PATCH each task’s projectId
        await Promise.all(
          formData.selectedTasks.map(async (taskId) => {
            const res = await fetch(`${apiUrl}/tasks/${taskId}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ projectId }),
            });
            if (!res.ok) {
              const e = await res.json().catch(() => ({}));
              throw new Error(
                e.message || `Failed to assign task ${taskId} to project (HTTP ${res.status})`
              );
            }
            return res.json().catch(() => ({}));
          })
        );
      }

      alert("Project created successfully!");
      navigate("/projects");
    } catch (error) {
      console.error("Error creating project:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => navigate(-1);

  return (
    <div className="dashboard-container">
      <DashboardHeader />

      <main>
        <div className="dashboard-title-actions">
          <h2>Create New Project</h2>
        </div>

        <div className="form-card">
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group full-width">
                <label htmlFor="projectName">Project Name *</label>
                <input
                  type="text"
                  id="projectName"
                  name="projectName"
                  value={formData.projectName}
                  onChange={handleChange}
                  placeholder="Enter project name"
                  className={errors.projectName ? "error" : ""}
                  disabled={submitting}
                />
                {errors.projectName && (
                  <span className="error-message">{errors.projectName}</span>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group full-width">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter project description"
                  rows="4"
                  disabled={submitting}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  disabled={submitting}
                >
                  <option value="Planning">Planning</option>
                  <option value="In Progress">In Progress</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="deadline">Deadline</label>
                <input
                  type="date"
                  id="deadline"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleChange}
                  disabled={submitting}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="tags">Tags</label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  placeholder="e.g., web, mobile, urgent"
                  disabled={submitting}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group full-width">
                <label>Select Tasks to Add to Project</label>
                <div className="task-selection-list">
                  {loadingTasks ? (
                    <div style={{ opacity: 0.7 }}>Loading tasks…</div>
                  ) : availableTasks.length === 0 ? (
                    <div style={{ opacity: 0.7 }}>No unassigned tasks found.</div>
                  ) : (
                    availableTasks.map((task) => {
                      const label = task.title || task.name || `Task #${task.id}`;
                      return (
                        <div key={task.id} className="task-checkbox-item">
                          <input
                            type="checkbox"
                            id={`task-${task.id}`}
                            checked={formData.selectedTasks.includes(task.id)}
                            onChange={() => handleTaskSelection(task.id)}
                            disabled={submitting}
                          />
                          <label htmlFor={`task-${task.id}`}>{label}</label>
                        </div>
                      );
                    })
                  )}
                </div>
                {formData.selectedTasks.length > 0 && (
                  <span className="selection-count">
                    {formData.selectedTasks.length} task(s) selected
                  </span>
                )}
              </div>
            </div>

            <div className="dashboard-buttons">
              <button type="button" onClick={handleCancel} disabled={submitting}>
                Cancel
              </button>
              <button type="submit" disabled={submitting}>
                {submitting ? "Saving…" : "Save Project"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
