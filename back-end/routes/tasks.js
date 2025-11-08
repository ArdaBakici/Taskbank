const express = require("express");
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
  // 1. Extract all task data from request body
  const { 
    title, 
    description, 
    deadline, 
    priority, 
    context, 
    estimatedTime, 
    tags,
    project 
  } = req.body;
  
  // 2. Validate required fields
  if (!title) {
    return res.status(400).json({
      success: false,
      message: "Please provide a task title"
    });
  }
  
  if (!deadline) {
    return res.status(400).json({
      success: false,
      message: "Please provide a task deadline"
    });
  }
  
  if (!context) {
    return res.status(400).json({
      success: false,
      message: "Please provide a task context (office, school, home, daily-life, other)"
    });
  }
  
  // 3. Validate context value
  const validContexts = ['office', 'school', 'home', 'daily-life', 'other'];
  if (!validContexts.includes(context)) {
    return res.status(400).json({
      success: false,
      message: `Invalid context. Must be one of: ${validContexts.join(', ')}`
    });
  }
  
  // 4. Validate priority if provided
  if (priority) {
    const validPriorities = ['low', 'medium', 'high', 'urgent'];
    if (!validPriorities.includes(priority)) {
      return res.status(400).json({
        success: false,
        message: `Invalid priority. Must be one of: ${validPriorities.join(', ')}`
      });
    }
  }
  
  // 5. Create enhanced task object
  const newTask = {
    id: Date.now(), // temporary ID using timestamp
    title: title,
    description: description || "", // optional, default to empty string
    deadline: deadline,
    priority: priority || "medium", // default to medium
    context: context,
    estimatedTime: estimatedTime || null, // optional
    tags: tags || [], // optional, default to empty array
    project: project || null, // optional
    status: "todo",
    createdAt: new Date().toISOString()
  };
  
  // 6. Return success response
  res.status(201).json({
    success: true,
    message: "Task created successfully",
    data: newTask
  });
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
