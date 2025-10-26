import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../css/dashboard.css";
import "../css/forms.css";
import logo from "../assets/logo.png";

export default function EditTask() {
  const navigate = useNavigate();
  const { id } = useParams();

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

  // Load existing task data and available projects
  useEffect(() => {
    // Fallback projects data
    const fallbackProjects = [
      { id: 1, name: "Website Redesign" },
      { id: 2, name: "Mobile App Development" },
      { id: 3, name: "Marketing Campaign" },
      { id: 4, name: "Database Migration" },
      { id: 5, name: "Customer Portal" },
    ];

    setProjects(fallbackProjects);

    // Load existing task data (mock data for now)
    if (id) {
      // TODO: Replace with actual API call when backend is ready
      const mockTask = {
        id: id,
        taskName: "Complete Sprint 1",
        description: "Finish frontend components for Taskbank",
        project: "2",
        priority: "High",
        status: "In Progress",
        deadline: "2025-10-30",
        tags: "frontend, urgent",
      };

      setFormData({
        taskName: mockTask.taskName,
        description: mockTask.description,
        project: mockTask.project,
        priority: mockTask.priority,
        status: mockTask.status,
        deadline: mockTask.deadline,
        tags: mockTask.tags,
      });
    }

    setLoading(false);

    // Try to fetch projects from Mockaroo if API key available
    const apiKey = process.env.REACT_APP_MOCKAROO_API_KEY;
    if (apiKey) {
      fetch(`https://my.api.mockaroo.com/projects.json?key=${apiKey}`)
        .then((response) => response.json())
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            setProjects(data);
          }
        })
        .catch((error) => {
          console.log("Using fallback projects", error);
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

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate required fields
    const newErrors = {};

    if (!formData.taskName.trim()) {
      newErrors.taskName = "Task name is required";
    }

    if (!formData.project) {
      newErrors.project = "Project selection is required";
    }

    // If there are errors, set them and don't submit
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Clear any previous errors
    setErrors({});

    // TODO: When backend is ready, PUT/PATCH data to backend instead
    console.log("Updating task:", { id, ...formData });
    alert("Task updated successfully!");
    navigate("/tasks");
  };

  const handleCancel = () => {
    navigate("/tasks");
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
          <p>Loading task...</p>
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
          <h2>Edit Task</h2>
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
                {errors.taskName && (
                  <span className="error-message">{errors.taskName}</span>
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
                  placeholder="Enter task description"
                  rows="4"
                />
              </div>
            </div>

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
                  {Array.isArray(projects) &&
                    projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
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