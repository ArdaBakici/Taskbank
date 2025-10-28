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

  // Load available tasks
  useEffect(() => {
    const fallbackTasks = [
      { id: 1, name: "Design homepage mockup", project: "Unassigned" },
      { id: 2, name: "Setup database schema", project: "Unassigned" },
      { id: 3, name: "Create API endpoints", project: "Unassigned" },
      { id: 4, name: "Write unit tests", project: "Unassigned" },
      { id: 5, name: "Deploy to staging", project: "Unassigned" },
      { id: 6, name: "User authentication flow", project: "Unassigned" },
      { id: 7, name: "Implement responsive navigation", project: "Unassigned" },
      { id: 8, name: "Setup CI/CD pipeline", project: "Unassigned" },
      { id: 9, name: "Create user profile page", project: "Unassigned" },
      { id: 10, name: "Add search functionality", project: "Unassigned" },
      { id: 11, name: "Configure email notifications", project: "Unassigned" },
      { id: 12, name: "Optimize database queries", project: "Unassigned" },
      { id: 13, name: "Write API documentation", project: "Unassigned" },
      { id: 14, name: "Implement dark mode", project: "Unassigned" },
      { id: 15, name: "Add data export feature", project: "Unassigned" },
      { id: 16, name: "Setup error logging", project: "Unassigned" },
      { id: 17, name: "Create admin dashboard", project: "Unassigned" },
      { id: 18, name: "Implement file upload", project: "Unassigned" },
      { id: 19, name: "Add analytics tracking", project: "Unassigned" },
      { id: 20, name: "Setup backup system", project: "Unassigned" },
    ];

    // Set fallback data immediately
    setAvailableTasks(fallbackTasks);

    // Try to fetch from Mockaroo, but don't fail if it doesn't work
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
  }, []);

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
    
    // TODO When backend is ready, POST data to backend instead
    console.log("Creating project:", formData);
    alert("Project created successfully!");
    navigate("/projects");
  };

  const handleCancel = () => {
    navigate("/projects");
  };

  return (
    <div className="dashboard-container">
      <DashboardHeader />

      <main>
        <div className="dashboard-title-actions">
          <h2>Create New Project</h2>
          <div className="dashboard-buttons">
            <button onClick={handleCancel}>Cancel</button>
            <button onClick={handleSubmit}>Save Project</button>
          </div>
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
                <label>Select Tasks to Add to Project</label>
                <div className="task-selection-list">
                  {availableTasks.map((task) => (
                    <div key={task.id} className="task-checkbox-item">
                      <input
                        type="checkbox"
                        id={`task-${task.id}`}
                        checked={formData.selectedTasks.includes(task.id)}
                        onChange={() => handleTaskSelection(task.id)}
                      />
                      <label htmlFor={`task-${task.id}`}>{task.name}</label>
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
          </form>
        </div>
      </main>
    </div>
  );
}
