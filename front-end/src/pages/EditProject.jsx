import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { authenticatedFetch } from "../utils/auth";
import "../css/dashboard.css";
import "../css/forms.css";
import DashboardHeader from "../components/DashboardHeader";

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
    touchAction: "none",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`task-reorder-item ${isDragging ? "dragging" : ""}`}
      data-task-id={task.id}
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
    selectedTasks: [],
  });

  const [errors, setErrors] = useState({});
  const [availableTasks, setAvailableTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [initialSelectedTaskIds, setInitialSelectedTaskIds] = useState([]);
  const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:4000/api";



  // Load initial project data
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setLoading(true);
      try {
        // Load all tasks
        const taskRes = await fetch("http://localhost:4000/api/tasks");
        const taskJson = await taskRes.json();
        const allTasks = taskJson.tasks || taskJson;

        if (isMounted) setAvailableTasks(allTasks || []);

        if (id) {
          // Load project details
          const projRes = await fetch(
            `http://localhost:4000/api/projects/${id}`
          );
          const projectData = await projRes.json();

          // Load project tasks
          const projTasksRes = await authenticatedFetch(`/projects/${id}/tasks`);
          const projectTasks = await projTasksRes.json();

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
              setInitialSelectedTaskIds(selectedTaskIds);

            
            
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

  // Inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleTaskSelection = (taskId) => {
    setFormData((prev) => {
      const alreadySelected = prev.selectedTasks.includes(taskId);

      // If removing from project → mark as unassigned
      if (alreadySelected) {
        unassignTaskLocally(taskId);
      }

      return {
        ...prev,
        selectedTasks: alreadySelected
          ? prev.selectedTasks.filter((id) => id !== taskId)
          : [...prev.selectedTasks, taskId],
      };
    });
  };


  // Save project
  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};

    if (!formData.projectName.trim()) {
      newErrors.projectName = "Project name is required";
    }

    if (!formData.deadline) {
      newErrors.deadline = "Deadline is required";
    }

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
      // 1) 프로젝트 자체 업데이트
      const res = await fetch(`${apiUrl}/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(projectPayload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(
          body.message || `Failed to update project (HTTP ${res.status})`
        );
      }

      // 2) task assign / unassign 동기화
      const projectId = Number(id);

      const toAssign = formData.selectedTasks.filter(
        (taskId) => !initialSelectedTaskIds.includes(taskId)
      );

      const toUnassign = initialSelectedTaskIds.filter(
        (taskId) => !formData.selectedTasks.includes(taskId)
      );

      await Promise.all([
        // 새로 추가된 task들 → projectId 설정
        ...toAssign.map((taskId) =>
          fetch(`${apiUrl}/tasks/${taskId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
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
          fetch(`${apiUrl}/tasks/${taskId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
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

      // 🔹 3) 드래그로 정해진 순서를 order 필드로 저장
      // formData.selectedTasks: [taskId1, taskId2, taskId3, ...] (드래그 후 최종 순서)
      await Promise.all(
        formData.selectedTasks.map((taskId, index) =>
          fetch(`${apiUrl}/tasks/${taskId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ order: index }), // 0,1,2,...
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

      alert("Project updated successfully!");
      navigate("/projects");
    } catch (error) {
      console.error("Error updating project:", error);
      alert(`Error updating project: ${error.message}`);
    }
  };



  // Delete Project with mode
  const handleDeleteProject = async (mode) => {
    try {
      let url = `http://localhost:4000/api/projects/${id}`;

      if (mode === "delete-tasks") url += "?deleteTasks=true";
      if (mode === "unassign-tasks") url += "?unassignTasks=true";

      const response = await fetch(url, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Failed to delete project");
      }

      alert("Project deleted successfully!");
      navigate("/projects");
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  const handleCancel = () => navigate("/projects");
  const handleEditTask = (taskId) =>
    navigate(`/tasks/edit/${taskId}`, { state: { returnToProject: id } });

  const unassignTaskLocally = (taskId) => {
    setAvailableTasks(prev =>
      prev.map(t =>
        t.id === taskId ? { ...t, projectId: null } : t
      )
    );
  };
  // Helpers
  const orderedSelectedTasks = formData.selectedTasks
    .map((taskId) => availableTasks.find((t) => t.id === taskId))
    .filter(Boolean);

  const selectedIds = formData.selectedTasks.map(Number);

  const unselectedTasks = availableTasks.filter((t) => {
    const assigned = t.projectId !== null && t.projectId !== undefined;
    const selectedForThisProject = selectedIds.includes(Number(t.id));
    return !assigned && !selectedForThisProject;
  });


  const onDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setFormData((prev) => {
      const current = prev.selectedTasks;
      const oldIndex = current.indexOf(active.id);
      const newIndex = current.indexOf(over.id);
      if (oldIndex === -1 || newIndex === -1) return prev;

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

            {/* Unselected Tasks */}
            {unselectedTasks.length > 0 && (
              <div className="form-row">
                <div className="form-group full-width">
                  <label>Available Tasks</label>
                  <div className="task-selection-list">
                    {unselectedTasks.map((task) => {
                      const isChecked = formData.selectedTasks.includes(task.id);
                      return (
                        <div key={task.id} className="task-checkbox-item">
                          <div style={{ display: "flex", alignItems: "center" }}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleTaskSelection(task.id)}
                              style={{ marginRight: "0.5rem" }}
                            />
                            <label style={{ margin: 0, cursor: "pointer" }}>
                              {task.title || task.name}
                            </label>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleEditTask(task.id)}
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
    </div>
  );
}
