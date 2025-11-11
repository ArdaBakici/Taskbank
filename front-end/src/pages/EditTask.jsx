import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import "../css/dashboard.css";
import "../css/forms.css";
import DashboardHeader from "../components/DashboardHeader";
import { fetchTaskById, fetchProjects } from "../utils/mockDataLoader"; // Import the same functions

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

  // Load existing task data and available projects
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setLoading(true);
      
      try {
        // Load projects first
        const projectsList = await fetchProjects();
        if (isMounted) {
          setProjects(projectsList || []);
        }

        // Load the specific task if ID exists
        if (id) {
          const task = await fetchTaskById(id);
          
          if (isMounted && task) {
            // Map task properties to form data
            setFormData({
              taskName: task.title || "", // TaskView uses 'title'
              description: task.description || "",
              project: task.projectId || "", // TaskView uses 'projectId'
              priority: task.urgency || "Medium", // TaskView uses 'urgency'
              status: task.status || "Not Started",
              deadline: task.deadline || "",
              tags: task.tags || "", // Assuming tags exist in your data
            });
          }
        }
      } catch (error) {
        console.error("Failed to load task data", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
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
    
    if (returnToProject) {
      navigate(`/projects/edit/${returnToProject}`);
    } else {
      navigate("/tasks");
    }
  };

  const handleCancel = () => {
    if (returnToProject) {
      navigate(`/projects/edit/${returnToProject}`);
    } else {
      navigate("/tasks");
    }
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

            <div className="form-actions">
              <div className="dashboard-buttons">
                <button type="button" onClick={handleDelete} className="delete-button">
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