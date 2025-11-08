const express = require("express");
const {
  getTasks,
  findTaskById,
  addTask,
  updateTask,
  deleteTask,
} = require("../data/tasks");

const router = express.Router();

// TODO (Arda): implement list_tasks with limit & sorting support
router.get("/", (_req, res) => {
  res
    .status(501)
    .json({ message: "GET /api/tasks is reserved for Arda to implement." });
});

// TODO (Sid): implement get_task(task_id)
router.get("/:id", (_req, res) => {
  res
    .status(501)
    .json({ message: "GET /api/tasks/:id is reserved for Sid to implement." });
});

// TODO (Sihyun): implement add_task
// POST /api/tasks - Create a new task with properties

router.post("/", (req, res) => {
  const payload = req.body || {};
  
  // Validate required fields (Task 126)
  if (!payload.projectId || !payload.title) {
    return res
      .status(400)
      .json({ message: "projectId and title are required to create a task" });
  }
  
  // NEW: Validate deadline (Task 127)
  if (!payload.deadline) {
    return res
      .status(400)
      .json({ message: "deadline is required to create a task" });
  }
  
  // NEW: Validate context (Task 127)
  if (!payload.context) {
    return res
      .status(400)
      .json({ message: "context is required (office, school, home, daily-life, other)" });
  }
  
  // NEW: Validate context value (Task 127)
  const validContexts = ['office', 'school', 'home', 'daily-life', 'other'];
  if (!validContexts.includes(payload.context)) {
    return res
      .status(400)
      .json({ message: `Invalid context. Must be one of: ${validContexts.join(', ')}` });
  }
  
  // NEW: Validate priority if provided (Task 127)
  if (payload.priority) {
    const validPriorities = ['low', 'medium', 'high', 'urgent'];
    if (!validPriorities.includes(payload.priority)) {
      return res
        .status(400)
        .json({ message: `Invalid priority. Must be one of: ${validPriorities.join(', ')}` });
    }
  }
  
  // Create task with validated data
  const newTask = addTask({
    ...payload,
    projectId: Number(payload.projectId),
    priority: payload.priority || "medium", // default priority
  });
  
  return res.status(201).json(newTask);
});


// TODO (Sid): implement edit_task
router.patch("/:id", (_req, res) => {
  res
    .status(501)
    .json({ message: "PATCH /api/tasks/:id is reserved for Sid to implement." });
});

// TODO (Srijan): implement delete_task
router.delete("/:id", (_req, res) => {
  res.status(501).json({
    message: "DELETE /api/tasks/:id is reserved for Srijan to implement.",
  });
});

module.exports = router;
