const express = require("express");
const {
  getProjects,
  findProjectById,
  addProject,
  updateProject,
  deleteProject,
} = require("../data/projects");
const { getTasks } = require("../data/tasks");

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
  
  // NEW: Validate deadline (Task 128)
  if (!payload.deadline) {
    return res.status(400).json({ message: "deadline is required to create a project" });
  }
  
  // NEW: Validate priority if provided (Task 128)
  if (payload.priority) {
    const validPriorities = ['low', 'medium', 'high', 'urgent'];
    if (!validPriorities.includes(payload.priority)) {
      return res.status(400).json({ 
        message: `Invalid priority. Must be one of: ${validPriorities.join(', ')}` 
      });
    }
  }
  
  // NEW: Validate status if provided (Task 128)
  if (payload.status) {
    const validStatuses = ['planning', 'active', 'on-hold', 'completed', 'archived'];
    if (!validStatuses.includes(payload.status)) {
      return res.status(400).json({ 
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
      });
    }
  }
  
  // Create project with defaults
  const newProject = addProject({
    ...payload,
    priority: payload.priority || "medium",  // default priority
    status: payload.status || "planning"      // default status
  });
  
  return res.status(201).json(newProject);
});

// TODO (Sihyun): implement edit_project
router.patch("/:id", (_req, res) => {
  res.status(501).json({
    message: "PATCH /api/projects/:id is reserved for Sihyun to implement.",
  });
});

// TODO (Srijan): implement delete_project
router.delete("/:id", (_req, res) => {
  res.status(501).json({
    message: "DELETE /api/projects/:id is reserved for Srijan to implement.",
  });
});

module.exports = router;
