const express = require("express");
const {
  getTasks,
  findTaskById,
  addTask,
  updateTask,
  deleteTask,
} = require("../data/tasks");

const router = express.Router();

// GET /api/tasks - List tasks with optional limit and sorting
router.get("/", (req, res) => {
  try {
    // Get query parameters
    const numOfTasks = parseInt(req.query.num_of_tasks) || null;
    const sortingMethod = req.query.sorting_method || "id"; // default: sort by id
    
    // Get all tasks
    let tasks = getTasks();
    
    // Apply sorting based on sorting_method
    const sortedTasks = [...tasks].sort((a, b) => {
      switch (sortingMethod.toLowerCase()) {
        case "deadline":
        case "deadline_asc":
          // Sort by deadline ascending (earliest first)
          return new Date(a.deadline) - new Date(b.deadline);
        
        case "deadline_desc":
          // Sort by deadline descending (latest first)
          return new Date(b.deadline) - new Date(a.deadline);
        
        case "urgency":
        case "urgency_desc":
          // Sort by urgency: High > Medium > Low
          const urgencyOrder = { "High": 3, "Medium": 2, "Low": 1 };
          return (urgencyOrder[b.urgency] || 0) - (urgencyOrder[a.urgency] || 0);
        
        case "urgency_asc":
          // Sort by urgency: Low > Medium > High
          const urgencyOrderAsc = { "High": 3, "Medium": 2, "Low": 1 };
          return (urgencyOrderAsc[a.urgency] || 0) - (urgencyOrderAsc[b.urgency] || 0);
        
        case "status":
          // Sort by status alphabetically
          return (a.status || "").localeCompare(b.status || "");
        
        case "title":
        case "name":
          // Sort by title/name alphabetically
          return (a.title || a.name || "").localeCompare(b.title || b.name || "");
        
        case "assignee":
          // Sort by assignee alphabetically
          return (a.assignee || "").localeCompare(b.assignee || "");
        
        case "project":
        case "projectid":
          // Sort by project ID
          return (a.projectId || 0) - (b.projectId || 0);
        
        case "id":
        case "id_asc":
        default:
          // Sort by ID ascending (default)
          return a.id - b.id;
        
        case "id_desc":
          // Sort by ID descending
          return b.id - a.id;
      }
    });
    
    // Apply limit if num_of_tasks is specified
    const resultTasks = numOfTasks ? sortedTasks.slice(0, numOfTasks) : sortedTasks;
    
    res.status(200).json({
      success: true,
      count: resultTasks.length,
      total: tasks.length,
      sorting_method: sortingMethod,
      tasks: resultTasks
    });
  } catch (error) {
    console.error("Error listing tasks:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve tasks",
      error: error.message
    });
  }
});

// GET /api/tasks/:id - Get a specific task by ID
router.get("/:id", (req, res) => {
  const id = Number(req.params.id); // extract and convert id from URL
  const task = findTaskById(id); // find the task

  if (!task) {
    return res.status(404).json({ 
      success: false, 
      message: `Task with id ${id} not found.` 
    });
  }

  res.status(200).json({
    success: true,
    task,
  });
});

// POST /api/tasks - Create a new task with properties
router.post("/", (req, res) => {
  const payload = req.body || {};
  
  // Validate required fields
  if (!payload.title) {
    return res
      .status(400)
      .json({ message: "title is required to create a task" });
  }
  
  // Validate deadline
  if (!payload.deadline) {
    return res
      .status(400)
      .json({ message: "deadline is required to create a task" });
  }
  
  // Validate context
  if (!payload.context) {
    return res
      .status(400)
      .json({ message: "context is required (office, school, home, daily-life, other)" });
  }
  
  // Validate context value
  const validContexts = ['office', 'school', 'home', 'daily-life', 'other'];
  if (!validContexts.includes(payload.context)) {
    return res
      .status(400)
      .json({ message: `Invalid context. Must be one of: ${validContexts.join(', ')}` });
  }
  
  // Validate priority if provided
  if (payload.priority) {
    const validPriorities = ['low', 'medium', 'high', 'urgent'];
    if (!validPriorities.includes(payload.priority)) {
      return res
        .status(400)
        .json({ message: `Invalid priority. Must be one of: ${validPriorities.join(', ')}` });
    }
  }
  
  // Map priority to urgency for data model
  const priorityToUrgency = {
    'low': 'Low',
    'medium': 'Medium',
    'high': 'High',
    'urgent': 'High'
  };
  
  const urgency = priorityToUrgency[payload.priority || 'medium'];
  
  // Create task with validated data
  const newTask = addTask({
    ...payload,
    projectId: Number(payload.projectId),
    urgency: urgency,
    priority: payload.priority || "medium",
  });
  
  return res.status(201).json(newTask);
});

// PATCH /api/tasks/:id - Update an existing task
router.patch("/:id", (req, res) => {
  try {
    const id = Number(req.params.id);
    const updates = req.body || {};

    // Validate priority if provided
    if (updates.priority) {
      const validPriorities = ['low', 'medium', 'high', 'urgent'];
      if (!validPriorities.includes(updates.priority)) {
        return res
          .status(400)
          .json({ message: `Invalid priority. Must be one of: ${validPriorities.join(', ')}` });
      }
      
      // Map priority to urgency for data model
      const priorityToUrgency = {
        'low': 'Low',
        'medium': 'Medium',
        'high': 'High',
        'urgent': 'High'
      };
      
      updates.urgency = priorityToUrgency[updates.priority];
    }
    
    // Validate context if provided
    if (updates.context) {
      const validContexts = ['office', 'school', 'home', 'daily-life', 'other'];
      if (!validContexts.includes(updates.context)) {
        return res
          .status(400)
          .json({ message: `Invalid context. Must be one of: ${validContexts.join(', ')}` });
      }
    }

    const updatedTask = updateTask(id, updates);

    if (!updatedTask) {
      return res.status(404).json({
        success: false,
        message: `Task with id ${id} not found.`,
      });
    }

    res.status(200).json({
      success: true,
      task: updatedTask,
    });

  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update task",
      error: error.message,
    });
  }
});

// DELETE /api/tasks/:id - Delete a task
router.delete("/:id", (req, res) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: "Invalid task ID" });
    }

    const deletedTask = deleteTask(id);

    if (!deletedTask) {
      return res.status(404).json({
        success: false,
        message: `Task with id ${id} not found.`,
      });
    }

    res.status(200).json({
      success: true,
      message: "Task deleted successfully.",
      deleted: deletedTask,
    });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete task.",
      error: error.message,
    });
  }
});

module.exports = router;