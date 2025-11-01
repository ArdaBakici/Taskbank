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

// dnd-kit imports
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function SortableTaskItem({ task, index, onEdit, onRemove }) {
  // Let dnd-kit control the item
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    touchAction: "none", // prevent scroll-while-drag on touch
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`task-reorder-item ${isDragging ? "dragging" : ""}`}
      data-task-id={task.id}
    >
      <div className="task-reorder-content">
        {/* Drag handle: spread draggable attributes/listeners here */}
        <span
          className="drag-handle"
          style={{ cursor: "grab", marginRight: "0.5rem", userSelect: "none" }}
          {...attributes}
          {...listeners}
        >
          ☰
        </span>
        <span className="task-order-number">{index + 1}.</span>
        <span className="task-name" style={{ marginLeft: "0.5rem" }}>
          {task.title || task.name}
        </span>
      </div>
      <div className="task-actions">
        <button
          type="button"
          onClick={() => onEdit(task.id)}
          className="inline-edit-btn"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => onRemove(task.id)}
          className="inline-remove-btn"
        >
          Remove
        </button>
      </div>
    </div>
  );
}

export default function EditProject() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    projectName: "",
    description: "",
    status: "Planning",
    deadline: "",
    tags: "",
    selectedTasks: [], // ordered array of task IDs
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
        const allTasks = await fetchTasks();
        if (isMounted) setAvailableTasks(allTasks || []);

        if (id) {
          const [projectData, projectTasks] = await Promise.all([
            fetchProjectById(id),
            fetchTasksByProject(id),
          ]);

          if (isMounted && projectData) {
            const selectedTaskIds = (projectTasks || []).map((t) => t.id);
            setFormData({
              projectName: projectData.name || "",
              description: projectData.description || "",
              status: projectData.status || "Planning",
              deadline: projectData.deadline || "",
              tags: projectData.tags
                ? Array.isArray(projectData.tags)
                  ? projectData.tags.join(", ")
                  : projectData.tags
                : "",
              selectedTasks: selectedTaskIds,
            });
          }
        }
      } catch (err) {
        console.error("Failed to load project data", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleTaskSelection = (taskId) => {
    setFormData((prev) => {
      const isSelected = prev.selectedTasks.includes(taskId);
      return {
        ...prev,
        selectedTasks: isSelected
          ? prev.selectedTasks.filter((id) => id !== taskId)
          : [...prev.selectedTasks, taskId], // append to end
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.projectName.trim()) {
      newErrors.projectName = "Project name is required";
    }
    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    console.log("Updating project with ordered tasks:", { id, ...formData });
    alert("Project updated successfully!");
    navigate("/projects");
  };

  const handleCancel = () => navigate("/projects");
  const handleEditTask = (taskId) =>
    navigate(`/tasks/edit/${taskId}`, { state: { returnToProject: id } });

  // Helpers to map IDs <-> task objects
  const getOrderedSelectedTasks = () =>
    formData.selectedTasks
      .map((taskId) => availableTasks.find((t) => t.id === taskId))
      .filter(Boolean);

  const getUnselectedTasks = () =>
    availableTasks.filter((t) => !formData.selectedTasks.includes(t.id));

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

  // dnd-kit: when a drag ends, reorder the selectedTasks array
  const onDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setFormData((prev) => {
      const current = prev.selectedTasks;
      const oldIndex = current.indexOf(active.id);
      const newIndex = current.indexOf(over.id);
      if (oldIndex === -1 || newIndex === -1) return prev;

      const reordered = arrayMove(current, oldIndex, newIndex);
      return { ...prev, selectedTasks: reordered };
    });
  };

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

            {/* Selected Tasks - Reorderable (touch + mouse) */}
            {orderedSelectedTasks.length > 0 && (
              <div className="form-row">
                <div className="form-group full-width">
                  <label>Project Tasks (Drag to Reorder)</label>
                  <p className="field-hint">
                    Tasks are executed in this order. Drag to change priority.
                  </p>

                  <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                    <SortableContext
                      // the list of item ids in order
                      items={formData.selectedTasks}
                      strategy={verticalListSortingStrategy}
                    >
                      <div
                        className="task-reorder-list"
                        style={{ touchAction: "none" }}
                      >
                        {orderedSelectedTasks.map((task, index) => (
                          <SortableTaskItem
                            key={task.id}
                            task={task}
                            index={index}
                            onEdit={handleEditTask}
                            onRemove={handleTaskSelection}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
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
                    {unselectedTasks.map((task) => {
                      const isChecked = formData.selectedTasks.includes(task.id);
                      return (
                        <div key={task.id} className="task-checkbox-item">
                          <div style={{ display: "flex", alignItems: "center" }}>
                            <input
                              type="checkbox"
                              id={`task-${task.id}`}
                              checked={isChecked}
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
                            style={{
                              fontSize: "0.85em",
                              padding: "0.25rem 0.75rem",
                            }}
                          >
                            Edit
                          </button>
                        </div>
                      );
                    })}
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
            <div
              style={{
                marginTop: "2rem",
                display: "flex",
                justifyContent: "center",
                width: "100%",
              }}
            >
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
