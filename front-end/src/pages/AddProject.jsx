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
    project: "",
    priority: "medium",
    status: "Not Started",
    deadline: "",
    tags: "",
    context: "other",
  });

  const [projects, setProjects] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);

  // Fetch projects from API (like AllTasks fetches tasks)
  useEffect(() => {
    let isMounted = true;

    async function loadProjects() {
      try {
        // Use same API URL pattern as AllTasks
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';
        const url = `${apiUrl}/projects`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (isMounted) {
          // Assuming API returns projects in data.projects array (like tasks API)
          setProjects(data.projects || data || []);
        }
      } catch (error) {
        console.error("Failed to load projects", error);
        if (isMounted) {
          // Fallback to empty array if API fails
          setProjects([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadProjects();
    
    return () => {
      isMounted = false;
    };
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    const newErrors = {};
    
    if (!formData.taskName.trim()) {
      newErrors.taskName = "Task name is required";
    }
    
    if (!formData.project) {
      newErrors.project = "Project selection is required";
    }
    
    if (!formData.deadline) {
      newErrors.deadline = "Deadline is required";
    }
    
    if (!formData.context) {
      newErrors.context = "Context is required";
    }
    
    // If there are errors, set them and don't submit
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Clear any previous errors
    setErrors({});
    
    // Transform data to match backend API expectations
    const taskData = {
      title: formData.taskName,
      description: formData.description,
      projectId: parseInt(formData.project),
      priority: formData.priority,
      status: formData.status,
      deadline: formData.deadline,
      context: formData.context,
      tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [],
    };
    
    try {
      // POST to backend API (like AllTasks fetches from API)
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';
      const response = await fetch(`${apiUrl}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create task');
      }
      
      const result = await response.json();
      console.log("Task created successfully:", result);
      alert("Task created successfully!");
      navigate("/tasks");
      
    } catch (error) {
      console.error("Error creating task:", error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

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
                  disabled={loading}
                >
                  <option value="">
                    {loading ? "Loading projects..." : "Select a project"}
                  </option>
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
                  value={formData.deadline}
                  onChange={handleChange}
                  className={errors.deadline ? "error" : ""}
                />
                {errors.deadline && (
                  <span className="error-message">{errors.deadline}</span>
                )}
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
                {errors.context && (
                  <span className="error-message">{errors.context}</span>
                )}
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