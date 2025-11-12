import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/dashboard.css";
import "../css/forms.css";
import DashboardHeader from "../components/DashboardHeader";

export default function AddTask() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    taskName: "",
    description: "",
    project: "",                // "" means Unassigned
    priority: "medium",
    status: "Not Started",
    deadline: "",
    tags: "",
    context: "other",
  });

  const [projects, setProjects] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadProjects() {
      try {
        const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:4000/api";
        const url = `${apiUrl}/projects`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        if (isMounted) setProjects(data.projects || data || []);
      } catch (err) {
        console.error("Failed to load projects", err);
        if (isMounted) setProjects([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadProjects();
    return () => { isMounted = false; };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required (project is OPTIONAL now)
    const newErrors = {};
    if (!formData.taskName.trim()) newErrors.taskName = "Task name is required";
    if (!formData.deadline) newErrors.deadline = "Deadline is required";
    if (!formData.context) newErrors.context = "Context is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    // Build payload; omit projectId if unassigned
    const base = {
      title: formData.taskName,
      description: formData.description,
      priority: formData.priority,
      status: formData.status,
      deadline: formData.deadline,
      context: formData.context,
      tags: formData.tags ? formData.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
    };
    const taskData = formData.project
      ? { ...base, projectId: Number(formData.project) }
      : { ...base }; // <-- Unassigned: no projectId sent
    // If your backend prefers null instead, use: { ...base, projectId: null }

    try {
      const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:4000/api";
      const response = await fetch(`${apiUrl}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || "Failed to create task");
      }

      await response.json();
      alert("Task created successfully!");
      navigate("/tasks");
    } catch (error) {
      console.error("Error creating task:", error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleCancel = () => navigate(-1);

  return (
    <div className="dashboard-container">
      <DashboardHeader />
      <main>
        <div className="dashboard-title-actions">
          <h2>Create New Task</h2>
        </div>

        <div className="form-card">
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group full-width">
                <label htmlFor="taskName">Task Name *</label>
                <input
                  type="text"
                  id="taskName"
                  name="taskName"
                  value={formData.taskName}
                  onChange={handleChange}
                  placeholder="Enter task name"
                  className={errors.taskName ? "error" : ""}
                />
                {errors.taskName && <span className="error-message">{errors.taskName}</span>}
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
                  placeholder="Enter task description"
                  rows="4"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="project">Project (optional)</label>
                <select
                  id="project"
                  name="project"
                  value={formData.project}
                  onChange={handleChange}
                  disabled={loading}
                >
                  {/* Unassigned first */}
                  <option value="">{loading ? "Loading projects..." : "Unassigned"}</option>
                  {Array.isArray(projects) &&
                    projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                </select>
                {/* No project error since it's optional */}
              </div>

              <div className="form-group">
                <label htmlFor="priority">Priority</label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="status">Status</label>
                <select id="status" name="status" value={formData.status} onChange={handleChange}>
                  <option value="Not Started">Not Started</option>
                  <option value="In Progress">In Progress</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="deadline">Deadline *</label>
                <input
                  type="date"
                  id="deadline"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleChange}
                  className={errors.deadline ? "error" : ""}
                />
                {errors.deadline && <span className="error-message">{errors.deadline}</span>}
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
                  placeholder="e.g., frontend, urgent, bug"
                />
              </div>

              <div className="form-group">
                <label htmlFor="context">Context *</label>
                <select
                  id="context"
                  name="context"
                  value={formData.context}
                  onChange={handleChange}
                  className={errors.context ? "error" : ""}
                >
                  <option value="office">Office</option>
                  <option value="school">School</option>
                  <option value="home">Home</option>
                  <option value="daily-life">Daily Life</option>
                  <option value="other">Other</option>
                </select>
                {errors.context && <span className="error-message">{errors.context}</span>}
              </div>
            </div>

            <div className="dashboard-buttons">
              <button type="button" onClick={handleCancel}>Cancel</button>
              <button type="submit">Save Task</button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
