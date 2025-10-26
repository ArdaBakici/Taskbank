import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../css/dashboard.css";
import "../css/forms.css";
import logo from "../assets/logo.png";

export default function EditProject() {
  const navigate = useNavigate();
  const { id } = useParams();

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
  const [loading, setLoading] = useState(true);

  // Load existing project data and available tasks
  useEffect(() => {
    // Load available tasks (fallback data)
    const fallbackTasks = [
      { id: 1, name: "Design homepage mockup", project: "Unassigned" },
      { id: 2, name: "Setup database schema", project: "Unassigned" },
      { id: 3, name: "Create API endpoints", project: "Unassigned" },
      { id: 4, name: "Write unit tests", project: "Unassigned" },
      { id: 5, name: "Deploy to staging", project: "Unassigned" },
    ];

    setAvailableTasks(fallbackTasks);

    // Load existing project data (mock data for now)
    if (id) {
      // TODO: Replace with actual API call when backend is ready
      const mockProject = {
        id: id,
        projectName: "Sprint 1 Development",
        description: "Complete all frontend components for Taskbank",
        status: "In Progress",
        deadline: "2025-11-15",
        tags: "frontend, react, sprint1",
        selectedTasks: [1, 2], // IDs of tasks already in this project
      };

      setFormData({
        projectName: mockProject.projectName,
        description: mockProject.description,
        status: mockProject.status,
        deadline: mockProject.deadline,
        tags: mockProject.tags,
        selectedTasks: mockProject.selectedTasks,
      });
    }

    setLoading(false);

    // Try to fetch from Mockaroo if API key available
    const apiKey = process.env.REACT_APP_MOCKAROO_API_KEY;
    if (apiKey) {
      fetch(`https://my.api.mockaroo.com/tasks.json?key=${apiKey}`)
        .then((response) => response.json())
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            setAvailableTasks(data);
          }
        })
        .catch((error) => {
          console.log("Using fallback tasks", error);
        });
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
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

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate required fields
    const newErrors = {};

    if (!formData.projectName.trim()) {
      newErrors.projectName = "Project name is required";
    }

    // If there are errors, set them and don't submit
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Clear any previous errors
    setErrors({});

    // TODO: When backend is ready, PUT/PATCH data to backend instead
    console.log("Updating project:", { id, ...formData });
    alert("Project updated successfully!");
    navigate("/projects");
  };

  const handleCancel = () => {
    navigate("/projects");
  };

  const handleEditTask = (taskId) => {
    // Navigate to edit task page and pass the current project ID so we can return here
    navigate(`/tasks/edit/${taskId}`, { state: { returnToProject: id } });
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
          <p>Loading project...</p>
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
          <h2>Edit Project</h2>
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
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group full-width">
                <label>Manage Project Tasks</label>
                <div className="task-selection-list">
                  {availableTasks.map((task) => (
                    <div key={task.id} className="task-checkbox-item" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.5rem 0" }}>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <input
                          type="checkbox"
                          id={`task-${task.id}`}
                          checked={formData.selectedTasks.includes(task.id)}
                          onChange={() => handleTaskSelection(task.id)}
                          style={{ marginRight: "0.5rem" }}
                        />
                        <label htmlFor={`task-${task.id}`} style={{ margin: 0, cursor: "pointer" }}>
                          {task.name}
                        </label>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleEditTask(task.id)}
                        className="inline-edit-btn"
                        style={{ fontSize: "0.85em", padding: "0.25rem 0.75rem" }}
                      >
                        Edit
                      </button>
                    </div>
                  ))}
                </div>
                {formData.selectedTasks.length > 0 && (
                  <span className="selection-count">
                    {formData.selectedTasks.length} task(s) selected
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ marginTop: "2rem", display: "flex", justifyContent: "center", width: "100%" }}>
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