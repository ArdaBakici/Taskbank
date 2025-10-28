import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../css/dashboard.css";
import "../css/forms.css";
import DashboardHeader from "../components/DashboardHeader";
import {
  fetchProjectById,
  fetchTasksByProject,
  fetchTasks, // For all available tasks
} from "../utils/mockDataLoader";

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
    let isMounted = true;

    async function loadData() {
      setLoading(true);

      try {
        // Load all available tasks first
        const allTasks = await fetchTasks();
        if (isMounted) {
          setAvailableTasks(allTasks || []);
        }

        // Load the specific project if ID exists
        if (id) {
          const [projectData, projectTasks] = await Promise.all([
            fetchProjectById(id),
            fetchTasksByProject(id),
          ]);

          if (isMounted && projectData) {
            // Get IDs of tasks already in this project
            const selectedTaskIds = projectTasks.map(task => task.id);

            // Map project properties to form data
            setFormData({
              projectName: projectData.name || "", // ProjectView uses 'name'
              description: projectData.description || "",
              status: projectData.status || "Planning",
              deadline: projectData.deadline || "",
              tags: projectData.tags 
                ? (Array.isArray(projectData.tags) 
                    ? projectData.tags.join(", ") 
                    : projectData.tags)
                : "",
              selectedTasks: selectedTaskIds,
            });
          }
        }
      } catch (error) {
        console.error("Failed to load project data", error);
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
        <DashboardHeader />
        <main>
          <p>Loading project...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <DashboardHeader />

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
                          {task.title || task.name}
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