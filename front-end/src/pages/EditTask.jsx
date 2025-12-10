// EditTask component - Allows editing existing tasks
// Features: Task info editing, project assignment, task deletion
import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { authenticatedFetch } from "../utils/auth";
import "../css/dashboard.css";
import "../css/forms.css";
import DashboardHeader from "../components/DashboardHeader";

/**
 * EditTask component - Edit existing task information
 * Supports navigation back to project view if accessed from project context
 */
export default function EditTask() {
  const navigate = useNavigate();
  const { id } = useParams(); // Get task ID from URL
  const location = useLocation();

  // Check if we came from a project edit page (for proper navigation back)
  const returnToProject = location.state?.returnToProject;

  // Form data state - matches task properties
  const [formData, setFormData] = useState({
    taskName: "",
    description: "",
    project: "none", // "none" means unassigned
    priority: "Medium",
    status: "Not Started",
    deadline: "",
    tags: "", // Comma-separated string for display
    context: "other",
  });

  // UI state management
  const [projects, setProjects] = useState([]); // Available projects for assignment
  const [errors, setErrors] = useState({}); // Form validation errors
  const [loading, setLoading] = useState(true); // Loading indicator
  const [popup, setPopup] = useState({ show: false, message: "", type: "success" }); // Success/error notifications
  const [showDeleteModal, setShowDeleteModal] = useState(false); // Delete confirmation modal

  // Load task data and available projects on component mount
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        // Fetch all available projects for dropdown selection
        const resProjects = await authenticatedFetch('/projects');
        const projectsData = await resProjects.json();
        setProjects(projectsData.projects || []);

        // Fetch the specific task to edit
        if (id) {
          const resTask = await authenticatedFetch(`/tasks/${id}`);
          const { task } = await resTask.json();
          if (task) {
            // Populate form with existing task data
            setFormData({
              taskName: task.title || "",
              description: task.description || "",
              project: task.projectId || "none", // Convert null to "none" for select
              priority: task.urgency || "Medium", // Backend uses 'urgency' field
              status: task.status || "Not Started",
              deadline: task.deadline ? task.deadline.slice(0, 10) : "", // Format for date input
              tags: Array.isArray(task.tags)
                ? task.tags.join(", ") // Convert array to comma-separated string
                : task.tags || "",
              context: task.context || "other",
            });
          }
        }
      } catch (error) {
        console.error("Failed to load task data", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear validation error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Initialize delete process - show confirmation modal
  const handleDelete = () => {
    if (!id) {
      setPopup({ show: true, message: "Task ID missing — cannot delete.", type: "error" });
      return;
    }
    setShowDeleteModal(true);
  };

  // Confirm and execute task deletion
  const confirmDelete = async () => {
    setShowDeleteModal(false);
    try {
      const response = await authenticatedFetch(`/tasks/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Failed to delete task");
      }

      const data = await response.json();
      console.log("Deleted:", data);

      // Navigate back to appropriate page after successful deletion
      if (returnToProject) {
        // Return to project edit page if we came from there
        navigate(`/projects/edit/${returnToProject}`);
      } else {
        // Otherwise go to main tasks list
        navigate("/tasks");
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      setPopup({ show: true, message: `Failed to delete task: ${error.message}`, type: "error" });
    }
  };

  // Handle form submission and task update
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    const newErrors = {};
    if (!formData.taskName.trim())
      newErrors.taskName = "Task name is required";

    // Stop submission if validation fails
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    try {
      // Prepare payload - map frontend fields to backend expectations
      const payload = {
        title: formData.taskName.trim(), // Backend expects 'title' not 'taskName'
        projectId: formData.project === "none" ? null : formData.project,
        // Backend has both 'priority' and 'urgency' fields
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
        // Convert comma-separated tags back to array
        tags: Array.isArray(formData.tags)
          ? formData.tags
          : formData.tags
          ? formData.tags.split(",").map((t) => t.trim()).filter(Boolean)
          : [],
        context: formData.context || "",
      };

      // Clean up payload - remove undefined values
      Object.keys(payload).forEach(
        (k) => payload[k] === undefined && delete payload[k]
      );

      console.log("PATCH payload ->", payload);

      // Send update request to backend
      const res = await authenticatedFetch(`/tasks/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });

      console.log("PATCH response status:", res.status);
      const json = await res.json();
      console.log("PATCH response body:", json);

      // Handle API response
      if (!res.ok) {
        const errMsg = json?.message || "Failed to update task";
        setPopup({ show: true, message: `Update failed: ${errMsg}`, type: "error" });
        return;
      }

      // Success - navigate back to previous page
      navigate(-1);
    } catch (err) {
      console.error("Failed to update task:", err);
      setPopup({ show: true, message: "Failed to update task.", type: "error" });
    }
  };

  // Cancel editing and return to previous page
  const handleCancel = () => {
    navigate(-1);
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
                  required
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
                <label htmlFor="project">Project </label>
                <select
                  id="project"
                  name="project"
                  value={formData.project}
                  onChange={handleChange}
                  className={errors.project ? "error" : ""}
                >
                  <option value="none">Unassigned</option>
                  {projects.map((p) => (
                    <option key={p._id} value={p._id}>
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
                <label htmlFor="deadline">Deadline *</label>
                <input
                  type="date"
                  id="deadline"
                  name="deadline"
                  required
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

              <div className="form-group">
                <label htmlFor="context">Context</label>
                <select
                  id="context"
                  name="context"
                  value={formData.context}
                  onChange={handleChange}
                >
                  <option value="office">Office</option>
                  <option value="school">School</option>
                  <option value="home">Home</option>
                  <option value="daily-life">Daily Life</option>
                  <option value="other">Other</option>
                </select>              </div>
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
                  Cancel</button>
                <button type="submit">Save Changes</button>
              </div>
            </div>
          </form>
        </div>
      </main>

      {/* POPUP NOTIFICATION */}
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

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteModal && (
        <div className="tb-modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="tb-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Task</h3>
            <p className="tb-modal-text">
              Are you sure you want to delete this task? This action cannot be undone.
            </p>
            <div className="tb-modal-buttons">
              <button
                className="tb-btn-delete"
                onClick={confirmDelete}
              >
                Delete
              </button>
              <button
                className="tb-btn-cancel"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
