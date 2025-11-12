// src/pages/EditTask.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import "../css/dashboard.css";
import "../css/forms.css";
import DashboardHeader from "../components/DashboardHeader";

export default function EditTask() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  const returnToProject = location.state?.returnToProject;

  const [formData, setFormData] = useState({
    taskName: "",
    description: "",
    project: "",
    priority: "Medium",
    status: "Not Started",
    deadline: "",
    tags: "",
  });

  const [projects, setProjects] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);

  const API_BASE =
    process.env.REACT_APP_API_URL || "http://localhost:4000/api";

  // Load existing task data and available projects
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setLoading(true);
      try {
        // Fetch projects
        const resProjects = await fetch(`${API_BASE}/projects`);
        const projectsData = await resProjects.json();
        if (isMounted) setProjects(projectsData.projects || []);

        // Fetch task by ID
        if (id) {
          const resTask = await fetch(`${API_BASE}/tasks/${id}`);
          const { task } = await resTask.json();
          if (isMounted && task) {
            setFormData({
              taskName: task.title || "",
              description: task.description || "",
              project: task.projectId || "",
              priority: task.urgency || "Medium",
              status: task.status || "Not Started",
              deadline: task.deadline || "",
              tags: Array.isArray(task.tags)
                ? task.tags.join(", ")
                : task.tags || "",
            });
          }
        }
      } catch (error) {
        console.error("Failed to load task data", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [id, API_BASE]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

const handleDelete = async () => {
  if (!id) {
    alert("Task ID missing — cannot delete.");
    return;
  }

  if (window.confirm("Are you sure you want to delete this task?")) {
    try {
      const response = await fetch(`http://localhost:4000/api/tasks/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Failed to delete task");
      } 

      const data = await response.json();
      console.log("Deleted:", data);
      alert("Task deleted successfully!");

      if (returnToProject) {
        navigate(`/projects/edit/${returnToProject}`);
      } else {
        navigate("/tasks");
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      alert(`Failed to delete task: ${error.message}`);
    }
  }
};


  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.taskName.trim())
      newErrors.taskName = "Task name is required";
    if (!formData.project) newErrors.project = "Project selection is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    try {
      // Prepare payload mapping frontend field names -> backend expectation
      const payload = {
        title: formData.taskName.trim(),
        projectId: Number(formData.project) || null,
        priority: formData.priority
          ? formData.priority.toLowerCase()
          : undefined,
        urgency: formData.priority
          ? formData.priority.charAt(0).toUpperCase() +
            formData.priority.slice(1).toLowerCase()
          : undefined,
        description: formData.description || "",
        status: formData.status || "",
        deadline: formData.deadline || "",
        tags: Array.isArray(formData.tags)
          ? formData.tags
          : formData.tags
          ? formData.tags.split(",").map((t) => t.trim()).filter(Boolean)
          : [],
      };

      // Remove undefined keys
      Object.keys(payload).forEach(
        (k) => payload[k] === undefined && delete payload[k]
      );

      console.log("PATCH payload ->", payload);

      const res = await fetch(`${API_BASE}/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      console.log("PATCH response status:", res.status);
      const json = await res.json();
      console.log("PATCH response body:", json);

      if (!res.ok) {
        const errMsg = json?.message || "Failed to update task";
        alert(`Update failed: ${errMsg}`);
        return;
      }

      alert("Task updated successfully!");
      navigate(`/task/${id}`); // refresh TaskView
    } catch (err) {
      console.error("Failed to update task:", err);
      alert("Failed to update task.");
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await fetch(`${API_BASE}/tasks/${id}`, { method: "DELETE" });
        alert("Task deleted successfully!");
        navigate(
          returnToProject ? `/projects/edit/${returnToProject}` : "/tasks"
        );
      } catch (err) {
        console.error(err);
        alert("Failed to delete task.");
      }
    }
  };

  const handleCancel = () => {
    navigate(`/task/${id}`); // go back to the TaskView page for this task // always go back to all tasks
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

  return (
    <div className="dashboard-container">
      <DashboardHeader />
      <main>
        <div className="dashboard-title-actions">
          <h2>Edit Task</h2>
        </div>

        <div className="form-card">
          <form onSubmit={handleSubmit}>
            {/* Task Name */}
            <div className="form-row">
              <div className="form-group full-width">
                <label htmlFor="taskName">Task Name *</label>
                <input
                  type="text"
                  id="taskName"
                  name="taskName"
                  value={formData.taskName}
                  onChange={handleChange}
                  className={errors.taskName ? "error" : ""}
                />
                {errors.taskName && (
                  <span className="error-message">{errors.taskName}</span>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="form-row">
              <div className="form-group full-width">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                />
              </div>
            </div>

            {/* Project & Priority */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="project">Project *</label>
                <select
                  id="project"
                  name="project"
                  value={formData.project}
                  onChange={handleChange}
                  className={errors.project ? "error" : ""}
                >
                  <option value="">Select a project</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                {errors.project && (
                  <span className="error-message">{errors.project}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="priority">Priority</label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>

            {/* Status & Deadline */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="Not Started">Not Started</option>
                  <option value="In Progress">In Progress</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Completed">Completed</option>
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
                />
              </div>
            </div>

            {/* Tags */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="tags">Tags</label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="form-actions">
              <div className="dashboard-buttons">
                <button
                  type="button"
                  onClick={handleDelete}
                  className="delete-button"
                >
                  Delete Task
                </button>
              </div>
              <div className="dashboard-buttons">
                <button type="button" onClick={handleCancel}>
                  Cancel
                </button>
                <button type="submit">Save Changes</button>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
