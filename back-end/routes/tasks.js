const express = require("express");
const { Task } = require("../mongo-schemas");

const router = express.Router();

// Helper function to calculate smart sort score
const calculateSmartScore = (task) => {
  let score = 0;
  const now = new Date();
  const deadline = task.deadline ? new Date(task.deadline) : null;

  if (deadline && !isNaN(deadline.getTime())) {
    const daysRemaining = Math.ceil(
      (deadline - now) / (1000 * 60 * 60 * 24)
    );

    // 1. Days remaining factor (higher score = more urgent)
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
  }

  // 2. Priority / Urgency factor
  const priorityScores = {
    urgent: 300,
    high: 250,
    High: 250,
    medium: 150,
    Medium: 150,
    low: 50,
    Low: 50,
  };
  score += priorityScores[task.priority] || priorityScores[task.urgency] || 0;

  // 3. Status factor
  const statusScores = {
    "In Progress": 200,
    "Not Started": 100,
    Completed: -1000, // Move completed tasks to bottom
    "On Hold": 50,
    Blocked: 75,
  };
  score += statusScores[task.status] || 0;

  // 4. Project assignment factor (tasks in projects get slight boost)
  if (task.projectId) {
    score += 50;
  }

  return score;
};

// GET /api/tasks - List tasks with optional limit and sorting
router.get("/", async (req, res) => {
  try {
    const numOfTasks = parseInt(req.query.num_of_tasks, 10) || null;
    const sortingMethod = req.query.sorting_method || "id";

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

    let tasks = await Task.find();
    const totalBeforeFilters = tasks.length;

    // Optional: support /tasks?unassigned=1
    if (
      req.query.unassigned === "1" ||
      req.query.unassigned === "true" ||
      req.query.unassigned === "yes"
    ) {
      tasks = tasks.filter((t) => !t.projectId);
    }

    // Helper function to apply a single filter
    const applyFilter = (taskList, filterType, filterVal) => {
      if (!filterType || !filterVal) return taskList;

      switch (filterType.toLowerCase()) {
        case "status":
          return taskList.filter(
            (task) =>
              task.status &&
              task.status.toLowerCase() === filterVal.toLowerCase()
          );

        case "context":
          return taskList.filter(
            (task) =>
              task.context &&
              task.context.toLowerCase() === filterVal.toLowerCase()
          );

        case "project":
        case "projectid":
          return taskList.filter(
            (task) =>
              task.projectId &&
              String(task.projectId) === String(filterVal)
          );

        case "tag":
          return taskList.filter(
            (task) =>
              task.tags &&
              Array.isArray(task.tags) &&
              task.tags.some(
                (tag) => tag.toLowerCase() === filterVal.toLowerCase()
              )
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
    const completedTasks = tasks.filter((t) => t.status === "Completed");
    const activeTasks = tasks.filter((t) => t.status !== "Completed");

    // Define sort function based on sorting method
    const getSortFunction = (method) => {
      const methodLower = method.toLowerCase();

      switch (methodLower) {
        case "smart":
        case "smart_sort":
        case "intelligent": {
          // Precompute scores for efficiency
          const scoreMap = new Map();
          return (a, b) => {
            const keyA = String(a._id);
            const keyB = String(b._id);
            if (!scoreMap.has(keyA)) scoreMap.set(keyA, calculateSmartScore(a));
            if (!scoreMap.has(keyB)) scoreMap.set(keyB, calculateSmartScore(b));
            return scoreMap.get(keyB) - scoreMap.get(keyA);
          };
        }

        case "order":
          return (a, b) => (a.order ?? 0) - (b.order ?? 0);

        case "deadline":
        case "deadline_asc":
          return (a, b) =>
            new Date(a.deadline || 0) - new Date(b.deadline || 0);

        case "deadline_desc":
          return (a, b) =>
            new Date(b.deadline || 0) - new Date(a.deadline || 0);

        case "urgency":
        case "urgency_desc": {
          const urgencyOrder = { High: 3, Medium: 2, Low: 1 };
          return (
            (urgencyOrder[b.urgency] || 0) - (urgencyOrder[a.urgency] || 0)
          );
        }

        case "urgency_asc": {
          const urgencyOrderAsc = { High: 3, Medium: 2, Low: 1 };
          return (
            (urgencyOrderAsc[a.urgency] || 0) -
            (urgencyOrderAsc[b.urgency] || 0)
          );
        }

        case "status":
          return (a, b) =>
            (a.status || "").localeCompare(b.status || "");

        case "title":
        case "name":
          return (a, b) =>
            (a.title || a.name || "").localeCompare(
              b.title || b.name || ""
            );

        case "project":
        case "projectid":
          return (a, b) => {
            const aKey = a.projectId ? String(a.projectId) : "";
            const bKey = b.projectId ? String(b.projectId) : "";
            return aKey.localeCompare(bKey);
          };

        case "id_desc":
          return (a, b) =>
            String(b._id).localeCompare(String(a._id));

        case "id":
        case "id_asc":
        default:
          return (a, b) =>
            String(a._id).localeCompare(String(b._id));
      }
    };

    const sortFunction = getSortFunction(sortingMethod);

    // Sort both groups separately
    const sortedActiveTasks = [...activeTasks].sort(sortFunction);
    const sortedCompletedTasks = [...completedTasks].sort(sortFunction);

    // Combine: active tasks first, then completed tasks
    const sortedTasks = [...sortedActiveTasks, ...sortedCompletedTasks];

    // Apply limit if num_of_tasks is specified
    const resultTasks = numOfTasks
      ? sortedTasks.slice(0, numOfTasks)
      : sortedTasks;

    const response = {
      success: true,
      count: resultTasks.length,
      total: totalBeforeFilters, // Total tasks before filtering
      sorting_method: sortingMethod,
      tasks: resultTasks,
    };

    // Add filter info if filtering was applied
    if (
      Object.keys(filters).length > 0 ||
      req.query.unassigned
    ) {
      response.filters = {
        ...filters,
        ...(req.query.unassigned ? { unassigned: true } : {}),
      };
      response.filtered_total = sortedTasks.length; // Total after filtering, before limit
    }

    res.status(200).json(response);
  } catch (error) {
    console.error("Error listing tasks:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve tasks",
      error: error.message,
    });
  }
});

// GET /api/tasks/:id - Get a specific task by ID
router.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: `Task with id ${id} not found.`,
      });
    }

    res.status(200).json({
      success: true,
      task,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: "Invalid task id format",
    });
  }
});

// POST /api/tasks - Create a new task with properties
router.post("/", async (req, res) => {
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
    return res.status(400).json({
      message:
        "context is required (office, school, home, daily-life, other)",
    });
  }

  // Validate context value
  const validContexts = [
    "office",
    "school",
    "home",
    "daily-life",
    "other",
  ];
  if (!validContexts.includes(payload.context)) {
    return res.status(400).json({
      message: `Invalid context. Must be one of: ${validContexts.join(
        ", "
      )}`,
    });
  }

  // Validate priority if provided
  if (payload.priority) {
    const validPriorities = ["low", "medium", "high", "urgent"];
    if (!validPriorities.includes(payload.priority)) {
      return res.status(400).json({
        message: `Invalid priority. Must be one of: ${validPriorities.join(
          ", "
        )}`,
      });
    }
  }

  // Map priority to urgency for data model
  const priorityToUrgency = {
    low: "Low",
    medium: "Medium",
    high: "High",
    urgent: "High",
  };

  const urgency = priorityToUrgency[payload.priority || "medium"];

  try {
    const newTask = await Task.create({
      ...payload,
      projectId: payload.projectId || null, // should be a Project _id string or null
      urgency,
      priority: payload.priority || "medium",
      name: payload.title ?? payload.name,
      tags: Array.isArray(payload.tags) ? payload.tags : [],
    });

    return res.status(201).json(newTask);
  } catch (err) {
    console.error("Failed to create task:", err);
    return res.status(500).json({ message: "Failed to create task" });
  }
});

// PATCH /api/tasks/:id - Update an existing task
router.patch("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const updates = req.body || {};

    // Validate priority if provided
    if (updates.priority) {
      const validPriorities = ["low", "medium", "high", "urgent"];
      if (!validPriorities.includes(updates.priority)) {
        return res.status(400).json({
          message: `Invalid priority. Must be one of: ${validPriorities.join(
            ", "
          )}`,
        });
      }

      const priorityToUrgency = {
        low: "Low",
        medium: "Medium",
        high: "High",
        urgent: "High",
      };
      updates.urgency = priorityToUrgency[updates.priority];
    }

    // keep title/name sync logic
    if (updates.title || updates.name) {
      updates.title = updates.title ?? updates.name;
      updates.name = updates.title;
    }

    const updatedTask = await Task.findByIdAndUpdate(id, updates, {
      new: true,
    });

    if (!updatedTask) {
      return res.status(404).json({
        success: false,
        message: `Task with id ${id} not found.`,
      });
    }

    res.status(200).json({ success: true, task: updatedTask });
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
router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const deletedTask = await Task.findByIdAndDelete(id);

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
