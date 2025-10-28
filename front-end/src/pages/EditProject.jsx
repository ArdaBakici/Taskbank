import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../css/dashboard.css";
import "../css/forms.css";
import DashboardHeader from "../components/DashboardHeader";
import {
  fetchProjectById,
  fetchTasksByProject,
  fetchTasks,
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
    selectedTasks: [], // This will now maintain order
  });

  const [errors, setErrors] = useState({});
  const [availableTasks, setAvailableTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [draggedOverTaskId, setDraggedOverTaskId] = useState(null);

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
            // Get IDs of tasks already in this project, maintaining their order
            const selectedTaskIds = projectTasks.map(task => task.id);

            setFormData({
              projectName: projectData.name || "",
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
          : [...prev.selectedTasks, taskId], // Add to end of list
      };
    });
  };

  // Drag and Drop Handlers
  const handleDragStart = (e, taskId) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = "move";
    // Add a semi-transparent effect
    e.currentTarget.style.opacity = "0.5";
  };

  const handleDragEnd = (e) => {
    e.currentTarget.style.opacity = "1";
    setDraggedTaskId(null);
    setDraggedOverTaskId(null);
  };

  const handleDragOver = (e, taskId) => {
    e.preventDefault(); // Necessary to allow drop
    e.dataTransfer.dropEffect = "move";
    
    if (taskId !== draggedTaskId) {
      setDraggedOverTaskId(taskId);
    }
  };

  const handleDragLeave = (e) => {
    setDraggedOverTaskId(null);
  };

  const handleDrop = (e, dropTaskId) => {
    e.preventDefault();
    
    if (draggedTaskId === dropTaskId) {
      return;
    }

    setFormData((prev) => {
      const newSelectedTasks = [...prev.selectedTasks];
      const draggedIndex = newSelectedTasks.indexOf(draggedTaskId);
      const dropIndex = newSelectedTasks.indexOf(dropTaskId);

      // Remove dragged item
      newSelectedTasks.splice(draggedIndex, 1);
      // Insert at new position
      newSelectedTasks.splice(dropIndex, 0, draggedTaskId);

      return {
        ...prev,
        selectedTasks: newSelectedTasks,
      };
    });

    setDraggedOverTaskId(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};

    if (!formData.projectName.trim()) {
      newErrors.projectName = "Project name is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    // The selectedTasks array now contains the ordered task IDs
    console.log("Updating project with ordered tasks:", { id, ...formData });
    alert("Project updated successfully!");
    navigate("/projects");
  };

  const handleCancel = () => {
    navigate("/projects");
  };

  const handleEditTask = (taskId) => {
    navigate(`/tasks/edit/${taskId}`, { state: { returnToProject: id } });
  };

  // Get selected tasks in order
  const getOrderedSelectedTasks = () => {
    return formData.selectedTasks
      .map(taskId => availableTasks.find(task => task.id === taskId))
      .filter(task => task !== undefined);
  };

  // Get unselected tasks
  const getUnselectedTasks = () => {
    return availableTasks.filter(task => !formData.selectedTasks.includes(task.id));
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

  const orderedSelectedTasks = getOrderedSelectedTasks();
  const unselectedTasks = getUnselectedTasks();

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

            {/* Selected Tasks - Reorderable */}
            {orderedSelectedTasks.length > 0 && (
              <div className="form-row">
                <div className="form-group full-width">
                  <label>Project Tasks (Drag to Reorder)</label>
                  <p className="field-hint">
                    Tasks are executed in this order. Drag to change priority.
                  </p>
                  <div className="task-reorder-list">
                    {orderedSelectedTasks.map((task, index) => (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        onDragEnd={handleDragEnd}
                        onDragOver={(e) => handleDragOver(e, task.id)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, task.id)}
                        className={`task-reorder-item ${
                          draggedTaskId === task.id ? "dragging" : ""
                        } ${draggedOverTaskId === task.id ? "drag-over" : ""}`}
                      >
                        <div className="task-reorder-content">
                          <span className="drag-handle">☰</span>
                          <span className="task-order-number">{index + 1}.</span>
                          <span className="task-name">{task.title || task.name}</span>
                        </div>
                        <div className="task-actions">
                          <button
                            type="button"
                            onClick={() => handleEditTask(task.id)}
                            className="inline-edit-btn"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleTaskSelection(task.id)}
                            className="inline-remove-btn"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Available Tasks to Add */}
            {unselectedTasks.length > 0 && (
              <div className="form-row">
                <div className="form-group full-width">
                  <label>Available Tasks</label>
                  <p className="field-hint">Click to add tasks to this project</p>
                  <div className="task-selection-list">
                    {unselectedTasks.map((task) => (
                      <div key={task.id} className="task-checkbox-item">
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <input
                            type="checkbox"
                            id={`task-${task.id}`}
                            checked={false}
                            onChange={() => handleTaskSelection(task.id)}
                            style={{ marginRight: "0.5rem" }}
                          />
                          <label 
                            htmlFor={`task-${task.id}`} 
                            style={{ margin: 0, cursor: "pointer" }}
                          >
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
                </div>
              </div>
            )}

            {formData.selectedTasks.length === 0 && (
              <div className="form-row">
                <div className="form-group full-width">
                  <p className="no-tasks-message">
                    No tasks selected. Add tasks from the available tasks below.
                  </p>
                </div>
              </div>
            )}

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