const express = require("express");
const {
  getTasks,
  findTaskById,
  addTask,
  updateTask,
  deleteTask,
} = require("../data/tasks");

const router = express.Router();

// Helper function to calculate smart sort score
const calculateSmartScore = (task) => {
  let score = 0;
  const now = new Date();
  const deadline = new Date(task.deadline);
  const daysRemaining = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
  
  // 1. Days remaining factor (higher score = more urgent)
  // Tasks overdue or due very soon get highest priority
  if (daysRemaining < 0) {
    score += 1000; // Overdue tasks - highest priority
  } else if (daysRemaining <= 1) {
    score += 800; // Due today or tomorrow
  } else if (daysRemaining <= 3) {
    score += 600; // Due within 3 days
  } else if (daysRemaining <= 7) {
    score += 400; // Due within a week
  } else if (daysRemaining <= 14) {
    score += 200; // Due within 2 weeks
  } else if (daysRemaining <= 30) {
    score += 100; // Due within a month
  }
  // Tasks due further out get lower scores
  
  // 2. Priority/Urgency factor
  const priorityScores = {
    "urgent": 300,
    "high": 250,
    "High": 250,
    "medium": 150,
    "Medium": 150,
    "low": 50,
    "Low": 50
  };
  score += priorityScores[task.priority] || priorityScores[task.urgency] || 0;
  
  // 3. Status factor (in progress tasks should be prioritized)
  const statusScores = {
    "In Progress": 200,
    "Not Started": 100,
    "Completed": -1000, // Move completed tasks to bottom
    "On Hold": 50,
    "Blocked": 75
  };
  score += statusScores[task.status] || 0;
  
  // 4. Project assignment factor (tasks in projects get slight boost)
  if (task.projectId && task.projectId > 0) {
    score += 50;
  }
  
  return score;
};

// GET /api/tasks - List tasks with optional limit and sorting
router.get("/", (req, res) => {
  try {
    // Get query parameters
    const numOfTasks = parseInt(req.query.num_of_tasks) || null;
    const sortingMethod = req.query.sorting_method || "id"; // default: sort by id
    
    // Parse filters from JSON string
    let filters = {};
    if (req.query.filters) {
      try {
        filters = JSON.parse(req.query.filters);
      } catch (e) {
        return res.status(400).json({
          success: false,
          message: "Invalid filters JSON format",
        });
      }
    }
    
    // Get all tasks
    let tasks = getTasks();
    
    // Helper function to apply a single filter
    const applyFilter = (taskList, filterType, filterVal) => {
      if (!filterType || !filterVal) return taskList;
      
      switch (filterType.toLowerCase()) {
        case "status":
          return taskList.filter(task => 
            task.status && task.status.toLowerCase() === filterVal.toLowerCase()
          );
        
        case "context":
          return taskList.filter(task => 
            task.context && task.context.toLowerCase() === filterVal.toLowerCase()
          );
        
        case "project":
        case "projectid":
          const projectId = parseInt(filterVal);
          if (!isNaN(projectId)) {
            return taskList.filter(task => task.projectId === projectId);
          }
          return taskList;
        
        case "tag":
          return taskList.filter(task => 
            task.tags && 
            Array.isArray(task.tags) && 
            task.tags.some(tag => tag.toLowerCase() === filterVal.toLowerCase())
          );
        
        default:
          return taskList;
      }
    };
    
    // Apply all filters
    for (const [filterType, filterValue] of Object.entries(filters)) {
      tasks = applyFilter(tasks, filterType, filterValue);
    }
    
    // Separate completed and non-completed tasks
    const completedTasks = tasks.filter(t => t.status === "Completed");
    const activeTasks = tasks.filter(t => t.status !== "Completed");
    
    // Define sort function based on sorting method
    const getSortFunction = (method) => {
      const methodLower = method.toLowerCase();
      
      switch (methodLower) {
        case "smart":
        case "smart_sort":
        case "intelligent":
          // Precompute scores for efficiency
          const scoreMap = new Map();
          return (a, b) => {
            if (!scoreMap.has(a.id)) scoreMap.set(a.id, calculateSmartScore(a));
            if (!scoreMap.has(b.id)) scoreMap.set(b.id, calculateSmartScore(b));
            return scoreMap.get(b.id) - scoreMap.get(a.id);
          };
        case "order":
        return (a, b) => (a.order ?? 0) - (b.order ?? 0);

        case "deadline":
        case "deadline_asc":
          return (a, b) => new Date(a.deadline) - new Date(b.deadline);
        
        case "deadline_desc":
          return (a, b) => new Date(b.deadline) - new Date(a.deadline);
        
        case "urgency":
        case "urgency_desc":
          const urgencyOrder = { "High": 3, "Medium": 2, "Low": 1 };
          return (a, b) => (urgencyOrder[b.urgency] || 0) - (urgencyOrder[a.urgency] || 0);
        
        case "urgency_asc":
          const urgencyOrderAsc = { "High": 3, "Medium": 2, "Low": 1 };
          return (a, b) => (urgencyOrderAsc[a.urgency] || 0) - (urgencyOrderAsc[b.urgency] || 0);
        
        case "status":
          return (a, b) => (a.status || "").localeCompare(b.status || "");
        
        case "title":
        case "name":
          return (a, b) => (a.title || a.name || "").localeCompare(b.title || b.name || "");
        
        case "project":
        case "projectid":
          return (a, b) => (a.projectId || 0) - (b.projectId || 0);
        
        case "id_desc":
          return (a, b) => b.id - a.id;
        
        case "id":
        case "id_asc":
        default:
          return (a, b) => a.id - b.id;
      }
    };
    
    const sortFunction = getSortFunction(sortingMethod);
    
    // Sort both groups separately
    const sortedActiveTasks = [...activeTasks].sort(sortFunction);
    const sortedCompletedTasks = [...completedTasks].sort(sortFunction);
    
    // Combine: active tasks first, then completed tasks
    const sortedTasks = [...sortedActiveTasks, ...sortedCompletedTasks];
    
    // Apply limit if num_of_tasks is specified
    const resultTasks = numOfTasks ? sortedTasks.slice(0, numOfTasks) : sortedTasks;
    
    const response = {
      success: true,
      count: resultTasks.length,
      total: getTasks().length, // Total tasks before filtering
      sorting_method: sortingMethod,
      tasks: resultTasks
    };
    
    // Add filter info if filtering was applied
    if (Object.keys(filters).length > 0) {
      response.filters = filters;
      response.filtered_total = sortedTasks.length; // Total after filtering, before limit
    }
    
    res.status(200).json(response);
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