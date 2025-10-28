import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/dashboard.css";
import "../css/forms.css";
import logo from "../assets/logo.png";

export default function AddTask() {
  const navigate = useNavigate();
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

  // Fallback data in case fetch from mockaroo fails
  useEffect(() => {
    const fallbackProjects = [
      { id: 1, name: "Website Redesign" },
      { id: 2, name: "Mobile App Development" },
      { id: 3, name: "Marketing Campaign" },
      { id: 4, name: "Database Migration" },
      { id: 5, name: "Customer Portal" },
    ];

    // Set fallback data immediately
    setProjects(fallbackProjects);

    // Try to fetch from Mockaroo, but don't fail if it doesn't work
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
    
    // TODO When backend is ready, POST data to backend instead
    console.log("Creating task:", formData);
    alert("Task created successfully!");
    navigate("/tasks");
  };

  const handleCancel = () => {
    navigate(-1);
  };

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
                  {Array.isArray(projects) && projects.map((project) => (
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

            <div className="dashboard-buttons">
              <button onClick={handleCancel}>Cancel</button>
              <button onClick={handleSubmit}>Save Task</button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
