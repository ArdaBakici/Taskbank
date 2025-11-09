const express = require("express");
const router = express.Router();
const { getTasks } = require("../data/tasks");

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

// TODO (Sid): implement get_task(task_id)
router.get("/:id", (_req, res) => {
  res
    .status(501)
    .json({ message: "GET /api/tasks/:id is reserved for Sid to implement." });
});

// TODO (Sihyun): implement add_task
router.post("/", (_req, res) => {
  res
    .status(501)
    .json({ message: "POST /api/tasks is reserved for Sihyun to implement." });
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
