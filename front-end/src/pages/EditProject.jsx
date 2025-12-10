// React and routing imports
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { authenticatedFetch } from "../utils/auth";
import "../css/dashboard.css";
import "../css/forms.css";
import DashboardHeader from "../components/DashboardHeader";

// Drag and drop functionality for task reordering
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

/**
 * Sortable task item component for drag-and-drop reordering
 * Displays individual tasks with drag handle, name, and action buttons
 */

function SortableTaskItem({ task, index, onEdit, onRemove }) {
  // Setup drag and drop functionality for this task item
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    touchAction: "none",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`task-reorder-item ${isDragging ? "dragging" : ""}`}
      data-task-id={task._id}
    >
      <div className="task-reorder-content">
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
          onClick={() => onEdit(task._id)}
          className="inline-edit-btn"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => onRemove(task._id)}
          className="inline-remove-btn"
        >
          Remove
        </button>
      </div>
    </div>
  );
}

/**
 * EditProject component - Allows editing existing projects
 * Features: Basic project info editing, task assignment/reordering, project deletion
 */
export default function EditProject() {
  const navigate = useNavigate();
  const { id } = useParams(); // Get project ID from URL

  // Form state for project details
  const [formData, setFormData] = useState({
    projectName: "",
    description: "",
    status: "Planning",
    deadline: "",
    tags: "",
    selectedTasks: [], // Array of task IDs assigned to this project
  });

  // UI state management
  const [errors, setErrors] = useState({}); // Form validation errors
  const [availableTasks, setAvailableTasks] = useState([]); // All tasks from backend
  const [loading, setLoading] = useState(true); // Loading indicator
  const [showDeleteModal, setShowDeleteModal] = useState(false); // Delete confirmation modal
  const [popup, setPopup] = useState({ show: false, message: "", type: "success" }); // Success/error notifications

  // Track original task assignments to determine what changed
  const [initialSelectedTaskIds, setInitialSelectedTaskIds] = useState([]);

  // Load initial project data and available tasks on component mount
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        // Fetch all available tasks first
        const taskRes = await authenticatedFetch("/tasks");
        const taskJson = await taskRes.json();
        const allTasks = taskJson.tasks || taskJson;

        setAvailableTasks(allTasks || []);

        // If editing existing project, load its data
        if (id) {
          // Get project basic info
          const projRes = await authenticatedFetch(`/projects/${id}`);
          if (!projRes.ok) throw new Error("Failed to load project");
          const projectData = await projRes.json();

          // Get tasks assigned to this project
          const projTasksRes = await authenticatedFetch(`/projects/${id}/tasks`);
          if (!projTasksRes.ok) throw new Error("Failed to load project tasks");
          const projectTasks = await projTasksRes.json();

          if (projectData) {
            // Extract task IDs from project tasks for tracking assignments
            const selectedTaskIds = (projectTasks || []).map((t) => t._id);

            // Populate form with existing project data
            setFormData({
              projectName: projectData.name || "",
              description: projectData.description || "",
              status: projectData.status || "Planning",
              // Format date for HTML date input (YYYY-MM-DD)
              deadline: projectData.deadline
              ? projectData.deadline.slice(0, 10) : "",
              // Convert tags array to comma-separated string for display
              tags: projectData.tags
                ? Array.isArray(projectData.tags)
                  ? projectData.tags.join(", ")
                  : projectData.tags
                : "",
              selectedTasks: selectedTaskIds,
            });
            // Remember original assignments to track changes
            setInitialSelectedTaskIds(selectedTaskIds);
          }
        }


      } catch (err) {
        console.error("Failed to load project data", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id]);

  // Form input handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear validation error when user starts typing
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Handle task assignment/unassignment
  const handleTaskSelection = (taskId) => {
    setFormData((prev) => {
      const alreadySelected = prev.selectedTasks.includes(taskId);

      // If removing from project, update local state to reflect change
      if (alreadySelected) {
        unassignTaskLocally(taskId);
      }

      return {
        ...prev,
        // Toggle task selection
        selectedTasks: alreadySelected
          ? prev.selectedTasks.filter((id) => id !== taskId)
          : [...prev.selectedTasks, taskId],
      };
    });
  };


  // Save project changes
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    const newErrors = {};

    if (!formData.projectName.trim()) {
      newErrors.projectName = "Project name is required";
    }

    if (!formData.deadline) {
      newErrors.deadline = "Deadline is required";
    }

    // Stop if validation fails
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const projectPayload = {
      name: formData.projectName,
      description: formData.description,
      status: formData.status,
      deadline: formData.deadline || null,
      tags: formData.tags
        ? formData.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : [],
    };

    try {
      // Step 1: Update the project's basic information
      const res = await authenticatedFetch(`/projects/${id}`, {
        method: "PATCH",
        body: JSON.stringify(projectPayload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(
          body.message || `Failed to update project (HTTP ${res.status})`
        );
      }

      const projectId = id;

      // Step 2: Determine which tasks need to be assigned/unassigned
      const toAssign = formData.selectedTasks.filter(
        (taskId) => !initialSelectedTaskIds.includes(taskId)
      );

      const toUnassign = initialSelectedTaskIds.filter(
        (taskId) => !formData.selectedTasks.includes(taskId)
      );

      await Promise.all([
        // 새로 추가된 task들 → projectId 설정
        ...toAssign.map((taskId) =>
          authenticatedFetch(`/tasks/${taskId}`, {
            method: "PATCH",
            body: JSON.stringify({ projectId }),
          }).then(async (r) => {
            if (!r.ok) {
              const body = await r.json().catch(() => ({}));
              throw new Error(
                body.message ||
                  `Failed to assign task ${taskId} to project (HTTP ${r.status})`
              );
            }
          })
        ),

        // 제거된 task들 → projectId null
        ...toUnassign.map((taskId) =>
          authenticatedFetch(`/tasks/${taskId}`, {
            method: "PATCH",
            body: JSON.stringify({ projectId: null }),
          }).then(async (r) => {
            if (!r.ok) {
              const body = await r.json().catch(() => ({}));
              throw new Error(
                body.message ||
                  `Failed to unassign task ${taskId} from project (HTTP ${r.status})`
              );
            }
          })
        ),
      ]);

      // Step 3: Update task ordering based on drag-and-drop sequence
      // formData.selectedTasks contains task IDs in the order they were arranged
      await Promise.all(
        formData.selectedTasks.map((taskId, index) =>
          authenticatedFetch(`/tasks/${taskId}`, {
            method: "PATCH",
            body: JSON.stringify({ order: index }), // Set order: 0, 1, 2, etc.
          }).then(async (r) => {
            if (!r.ok) {
              const body = await r.json().catch(() => ({}));
              throw new Error(
                body.message ||
                  `Failed to update order for task ${taskId} (HTTP ${r.status})`
              );
            }
          })
        )
      );

      navigate("/projects");
    } catch (error) {
      console.error("Error updating project:", error);
      setPopup({ show: true, message: `Error updating project: ${error.message}`, type: "error" });
    }
  };



  // Delete project with different modes for handling associated tasks
  const handleDeleteProject = async (mode) => {
    try {
      let url = `/projects/${id}`;

      // Add query parameters based on deletion mode
      if (mode === "delete-tasks") url += "?deleteTasks=true"; // Delete project and all its tasks
      if (mode === "unassign-tasks") url += "?unassignTasks=true"; // Delete project but keep tasks unassigned

      const response = await authenticatedFetch(url, {
        method: "DELETE",
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Failed to delete project");
      }

      navigate("/projects");
    } catch (error) {
      setPopup({ show: true, message: "Error: " + error.message, type: "error" });
    }
  };

  // Navigation helpers
  const handleCancel = () => navigate("/projects");
  const handleEditTask = (taskId) =>
    navigate(`/tasks/edit/${taskId}`, { state: { returnToProject: id } });

  // Update task's project assignment in local state (optimistic update)
  const unassignTaskLocally = (taskId) => {
    setAvailableTasks(prev =>
      prev.map(t =>
        t._id === taskId ? { ...t, projectId: null } : t
      )
    );
  };
  
  // Helper functions for task organization
  // Get selected tasks in the order they should appear (for drag-and-drop list)
  const orderedSelectedTasks = formData.selectedTasks
    .map((taskId) => Array.isArray(availableTasks) ? availableTasks.find((t) => t._id === taskId) : null)
    .filter(Boolean);

const selectedIds = formData.selectedTasks;

// Filter tasks to show only unassigned ones (available for selection)
const unselectedTasks = Array.isArray(availableTasks)
  ? availableTasks.filter((t) => {
      // Check if task is already assigned to another project
      const assigned =
        t.projectId !== null && t.projectId !== undefined;

      // Check if task is selected for this project
      const selectedForThisProject = selectedIds.includes(t._id);

      // Show only unassigned tasks that aren't selected for this project
      return !assigned && !selectedForThisProject;
    })
  : [];



  // Handle drag and drop reordering of selected tasks
  const onDragEnd = (event) => {
    const { active, over } = event;
    // Exit early if no valid drop target or no actual movement
    if (!over || active.id === over.id) return;

    setFormData((prev) => {
      const current = prev.selectedTasks;
      const oldIndex = current.indexOf(active.id);
      const newIndex = current.indexOf(over.id);
      // Ensure both items exist in the array
      if (oldIndex === -1 || newIndex === -1) return prev;

      // Reorder the selectedTasks array using dnd-kit's arrayMove utility
      return { ...prev, selectedTasks: arrayMove(current, oldIndex, newIndex) };
    });
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
            {/* Basic Fields */}
            <div className="form-row">
              <div className="form-group full-width">
                <label>Project Name *</label>
                <input
                  type="text"
                  name="projectName"
                  required
                  value={formData.projectName}
                  onChange={handleChange}
                  className={errors.projectName ? "error" : ""}
                />
                {errors.projectName && (
                  <span className="error-message">{errors.projectName}</span>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group full-width">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Status</label>
                <select
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
                <label>Deadline <span className="required">*</span></label>

                <input
                  type="date"
                  name="deadline"
                  required
                  value={formData.deadline}
                  onChange={handleChange}
                  className={errors.deadline ? "input-error" : ""}
                />
 
                {errors.deadline && (
                  <p className="error-text">{errors.deadline}</p>
                )}
              </div>

            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Tags</label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Selected Tasks */}
            {orderedSelectedTasks.length > 0 && (
              <div className="form-row">
                <div className="form-group full-width">
                  <label>Project Tasks (Drag to Reorder)</label>

                  <DndContext
                    collisionDetection={closestCenter}
                    onDragEnd={onDragEnd}
                  >
                    <SortableContext
                      items={formData.selectedTasks}
                      strategy={verticalListSortingStrategy}
                    >
                      <div
                        className="task-reorder-list"
                        style={{ touchAction: "none" }}
                      >
                        {orderedSelectedTasks.map((task, index) => (
                          <SortableTaskItem
                            key={task._id}
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

            {/* Unselected Tasks */}
            {unselectedTasks.length > 0 && (
              <div className="form-row">
                <div className="form-group full-width">
                  <label>Available Tasks</label>
                  <div className="task-selection-list">
                    {unselectedTasks.map((task) => {
                      const isChecked = formData.selectedTasks.includes(task._id);
                      return (
                        <div key={task._id} className="task-checkbox-item">
                          <div style={{ display: "flex", alignItems: "center" }}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleTaskSelection(task._id)}
                              style={{ marginRight: "0.5rem" }}
                            />
                            <label style={{ margin: 0, cursor: "pointer" }}>
                              {task.title || task.name}
                            </label>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleEditTask(task._id)}
                            className="inline-edit-btn"
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

            {/* ACTION BUTTONS */}
            <div className="form-actions">
              <div className="dashboard-buttons">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  className="delete-button"
                >
                  Delete Project
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

      {/* DELETE MODAL */}
      {showDeleteModal && (
        <div className="tb-modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="tb-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Project</h3>
            <p className="tb-modal-text">
              What would you like to do with this project's tasks?
            </p>

            <div className="tb-modal-buttons">
              <button
                className="tb-btn-delete"
                onClick={() => handleDeleteProject("delete-tasks")}
              >
                Delete Project + All Tasks
              </button>

              <button
                className="tb-btn-secondary"
                onClick={() => handleDeleteProject("unassign-tasks")}
              >
                Delete Project + Unassign Tasks
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
    </div>
  );
}
