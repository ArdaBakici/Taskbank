const express = require("express");
const {
  getProjects,
  findProjectById,
  addProject,
  updateProject,
  deleteProject,
} = require("../data/projects");
const {
  getTasks, findTaskById, addTask, updateTask, deleteTask
} = require("../data/tasks");


const router = express.Router();

// TODO (Arda): implement list_projects(number_of_projects, sorting_method)
router.get("/", (_req, res) => {
  res
    .status(501)
    .json({ message: "GET /api/projects is reserved for Arda to implement." });
});

// TODO (Sid): implement get_project
router.get("/:id", (_req, res) => {
  res.status(501).json({
    message: "GET /api/projects/:id is reserved for Sid to implement.",
  });
});

// TODO (Sihyun): implement add_project
router.post("/", (req, res) => {
  const payload = req.body || {};
  
  // Validate name (already exists)
  if (!payload.name) {
    return res.status(400).json({ message: "name is required to create a project" });
  }
  
  // Validate deadline (Task 128)
  if (!payload.deadline) {
    return res.status(400).json({ message: "deadline is required to create a project" });
  }
  
  // Create project with defaults
  const newProject = addProject({
    ...payload,
    urgency: payload.priority || "Medium",  // default priority
    status: payload.status || "Planning"      // default status
  });
  
  return res.status(201).json(newProject);
});


// TODO (Sihyun): implement edit_project

router.patch("/:id", (req, res) => {
  const projectId = Number(req.params.id);
  const updated = updateProject(projectId, req.body || {});
  if (!updated) {
    return res.status(404).json({ message: "Project not found" });
  }
  return res.json(updated);
});

// Detach a task from a project
router.delete("/:projectId/tasks/:taskId", (req, res) => {
  const projectId = Number(req.params.projectId);
  const taskId = Number(req.params.taskId);

  const project = findProjectById(projectId);
  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }

  const task = findTaskById(taskId);
  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }

  // Check if the task actually belongs to this project
  if (task.projectId !== projectId) {
    return res.status(409).json({ message: "Task does not belong to this project" });
  }

  // Detach the task (keep the task, just remove link)
  updateTask(taskId, { projectId: null });

  return res.json({ message: "Task detached successfully" });
});



// TODO (Srijan): implement delete_project
router.delete("/:id", (_req, res) => {
  res.status(501).json({
    message: "DELETE /api/projects/:id is reserved for Srijan to implement.",
  });
});

module.exports = router;
