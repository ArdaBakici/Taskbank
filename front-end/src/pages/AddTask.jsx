// React and routing imports
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authenticatedFetch } from "../utils/auth";
import "../css/dashboard.css";
import "../css/forms.css";
import DashboardHeader from "../components/DashboardHeader";

/**
 * AddTask component - Create new tasks with project assignment
 * Features: Form validation, project selection, tag support, context categories
 */
export default function AddTask() {
  const navigate = useNavigate();
  
  // Form data state - all task properties
  const [formData, setFormData] = useState({
    taskName: "",
    description: "",
    project: "",                // Empty string means unassigned
    priority: "medium",         // Default priority level
    status: "Not Started",      // Default status for new tasks
    deadline: "",
    tags: "",                   // Comma-separated string
    context: "other",           // Default context category
  });

  // UI state management
  const [projects, setProjects] = useState([]); // Available projects for assignment
  const [errors, setErrors] = useState({});     // Form validation errors
  const [loading, setLoading] = useState(true); // Projects loading state
  const [popup, setPopup] = useState({ show: false, message: "", type: "success" }); // Success/error notifications

  // Load available projects on component mount
  useEffect(() => {
    async function loadProjects() {
      try {
        const response = await authenticatedFetch('/projects');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        // Handle different API response formats
        setProjects(data.projects || data || []);
      } catch (err) {
        console.error("Failed to load projects", err);
        setProjects([]); // Fallback to empty array on error
      } finally {
        setLoading(false);
      }
    }
    loadProjects();
  }, []);

  // Handle form input changes and clear validation errors
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing in a field
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Handle form submission with validation and API call
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields (project is optional)
    const newErrors = {};
    if (!formData.taskName.trim()) newErrors.taskName = "Task name is required";
    if (!formData.deadline) newErrors.deadline = "Deadline is required";
    if (!formData.context) newErrors.context = "Context is required";

    // Stop submission if validation fails
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    // Build API payload with proper field mapping
    const base = {
      title: formData.taskName,      // Backend expects 'title' not 'taskName'
      description: formData.description,
      priority: formData.priority,
      status: formData.status,
      deadline: formData.deadline,
      context: formData.context,
      // Convert comma-separated tags to array
      tags: formData.tags ? formData.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
    };
    
    // Only include projectId if a project is selected (not unassigned)
    const taskData = formData.project
      ? { ...base, projectId: formData.project }  // Assigned to project
      : { ...base };                              // Unassigned task
    // Alternative: use { ...base, projectId: null } if backend prefers explicit null

    try {
      // Send task creation request to backend
      const response = await authenticatedFetch('/tasks', {
        method: "POST",
        body: JSON.stringify(taskData),
      });

      // Handle API error responses
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || "Failed to create task");
      }

      await response.json();
      // Navigate to tasks list on successful creation
      navigate("/tasks");
    } catch (error) {
      console.error("Error creating task:", error);
      // Show error popup to user
      setPopup({ show: true, message: `Error: ${error.message}`, type: "error" });
    }
  };

  // Cancel form and go back to previous page
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
            {/* Task Name - Required Field */}
            <div className="form-row">
              <div className="form-group full-width">
                <label htmlFor="taskName">Task Name *</label>
                <input
                  type="text"
                  id="taskName"
                  name="taskName"
                  required
                  value={formData.taskName}
                  onChange={handleChange}
                  placeholder="Enter task name"
                  className={errors.taskName ? "error" : ""}
                />
                {errors.taskName && <span className="error-message">{errors.taskName}</span>}
              </div>
            </div>

            {/* Task Description - Optional */}
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

            {/* Project Assignment (Optional) and Priority */}
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
                  {/* Unassigned option is default */}
                  <option value="">{loading ? "Loading projects..." : "Unassigned"}</option>
                  {Array.isArray(projects) &&
                    projects.map((project) => (
                      <option key={project._id} value={project._id}>
                        {project.name}
                      </option>
                    ))}
                </select>
                {/* No validation error since project is optional */}
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

            {/* Status and Deadline */}
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
                  required
                  value={formData.deadline}
                  onChange={handleChange}
                  className={errors.deadline ? "error" : ""}
                />
                {errors.deadline && <span className="error-message">{errors.deadline}</span>}
              </div>
            </div>

            {/* Tags and Context */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="tags">Tags</label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  placeholder="e.g., frontend, urgent, bug" // Example of comma-separated format
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

            {/* Form Action Buttons */}
            <div className="dashboard-buttons">
              <button type="button" onClick={handleCancel}>Cancel</button>
              <button type="submit">Save Task</button>
            </div>
          </form>
        </div>
      </main>

      {/* Error/Success Popup Notification */}
      {popup.show && (
        <div className="tb-modal-overlay" onClick={() => setPopup({ ...popup, show: false })}>
          <div className="tb-modal" onClick={(e) => e.stopPropagation()}>
            <h3>{popup.type === "success" ? "✓ Success" : "✗ Error"}</h3>
            <p className="tb-modal-text">{popup.message}</p>
            <div className="tb-modal-buttons">
              <button
                className={popup.type === "success" ? "tb-btn-secondary" : "tb-btn-cancel"}
                onClick={() => setPopup({ ...popup, show: false })}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
