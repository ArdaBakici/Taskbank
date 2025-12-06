const express = require("express");
const { body, param, validationResult } = require("express-validator");
const { Task } = require("../mongo-schemas");
const mongoose = require("mongoose");
const passport = require("passport");

const router = express.Router();

// Apply authentication to all routes
router.use(passport.authenticate("jwt", { session: false }));

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
  };
  score += statusScores[task.status] || 0;

  // 4. Project assignment factor (tasks in projects get slight boost)
  if (task.projectId) {
    score += 50;
  }

  return score;
};

// GET /api/tasks - List tasks with optional limit and sorting
// GET /api/tasks - List tasks with optional limit, sorting, and filters
router.get("/", async (req, res) => {
  try {
    const numOfTasks = parseInt(req.query.num_of_tasks, 10) || null;
    const sortingMethod = req.query.sorting_method || "id";

    // --- Parse filters from query ---
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

    // --- Build Mongo filter object ---
    const mongoFilter = {
      userId: req.user.userId, // Only return tasks belonging to this user
    };

    // Unassigned tasks: /tasks?unassigned=1
    if (
      req.query.unassigned === "1" ||
      req.query.unassigned === "true" ||
      req.query.unassigned === "yes"
    ) {
      mongoFilter.$or = [
        { projectId: null },
        { projectId: { $exists: false } },
      ];
    }

    // Apply structured filters from ?filters={}
    for (const [filterType, filterValue] of Object.entries(filters)) {
      if (!filterValue) continue;
      const val = String(filterValue);
      switch (filterType.toLowerCase()) {
        case "status":
          mongoFilter.status = val;
          break;

        case "context":
          mongoFilter.context = val;
          break;

        case "project":
        case "projectid":
          if (mongoose.isValidObjectId(val)) {
            mongoFilter.projectId = val;
          }
          break;

        case "tag":
          // match tags case-insensitively
          mongoFilter.tags = {
            $elemMatch: {
              $regex: new RegExp(`^${val}$`, "i"),
            },
          };
          break;

        default:
          break;
      }
    }

    // Total tasks BEFORE any filters (for UI stats)
    const totalBeforeFilters = await Task.countDocuments({ userId: req.user.userId });

    // Fetch tasks AFTER filters (but BEFORE limit)
    let tasks = await Task.find(mongoFilter).exec();
    const totalAfterFilters = tasks.length;

    // --- Separate completed vs active ---
    const completedTasks = tasks.filter((t) => t.status === "Completed");
    const activeTasks = tasks.filter((t) => t.status !== "Completed");

    // --- Sorting helper ---
    const getSortFunction = (method) => {
      const methodLower = (method || "").toLowerCase();

      switch (methodLower) {
        case "smart":
        case "smart_sort":
        case "intelligent": {
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
          return (a, b) =>
            (urgencyOrder[b.urgency] || 0) -
            (urgencyOrder[a.urgency] || 0);
        }

        case "urgency_asc": {
          const urgencyOrderAsc = { High: 3, Medium: 2, Low: 1 };
          return (a,b) =>
            (urgencyOrderAsc[a.urgency] || 0) -
            (urgencyOrderAsc[b.urgency] || 0);
          
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

    // Sort active and completed separately
    const sortedActiveTasks = [...activeTasks].sort(sortFunction);
    const sortedCompletedTasks = [...completedTasks].sort(sortFunction);

    // Active first, then completed at bottom
    const sortedTasks = [...sortedActiveTasks, ...sortedCompletedTasks];

    // Apply limit
    const resultTasks = numOfTasks
      ? sortedTasks.slice(0, numOfTasks)
      : sortedTasks;

    const response = {
      success: true,
      count: resultTasks.length,
      total: totalBeforeFilters,     // total tasks in DB
      sorting_method: sortingMethod,
      tasks: resultTasks,
    };

    // If filters or unassigned were used, include metadata
    if (Object.keys(filters).length > 0 || req.query.unassigned) {
      response.filters = {
        ...filters,
        ...(req.query.unassigned ? { unassigned: true } : {}),
      };
      response.filtered_total = totalAfterFilters; // after filters, before limit
    }

    return res.status(200).json(response);
  } catch (error) {
    console.error("Error listing tasks:", error);
    return res.status(500).json({
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
    const task = await Task.findOne({ _id: id, userId: req.user.userId });

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

// POST /api/tasks - Create a new task
router.post(
  "/",
  [
    body("title")
      .trim()
      .notEmpty()
      .withMessage("title is required to create a task")
      .isLength({ max: 200 })
      .withMessage("title must not exceed 200 characters"),
    body("deadline")
      .notEmpty()
      .withMessage("deadline is required to create a task")
      .isISO8601()
      .withMessage("deadline must be a valid date"),
    body("context")
      .notEmpty()
      .withMessage("context is required")
      .isIn(["office", "school", "home", "daily-life", "other"])
      .withMessage("context must be one of: office, school, home, daily-life, other"),
    body("priority")
      .optional()
      .isIn(["low", "medium", "high", "urgent"])
      .withMessage("priority must be one of: low, medium, high, urgent"),
    body("status")
      .optional()
      .isIn(["Not Started", "In Progress", "Completed", "On Hold"])
      .withMessage("status must be one of: Not Started, In Progress, Completed, On Hold"),
    body("description")
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage("description must not exceed 1000 characters"),
    body("projectId")
      .optional()
      .custom((value) => {
        if (value && !mongoose.Types.ObjectId.isValid(value)) {
          throw new Error("Invalid projectId format");
        }
        return true;
      }),
    body("tags")
      .optional()
      .isArray()
      .withMessage("tags must be an array"),
    body("assignee")
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage("assignee must not exceed 100 characters"),
    body("order")
      .optional()
      .isInt({ min: 0 })
      .withMessage("order must be a non-negative integer"),
  ],
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const payload = req.body || {};

      // --- PRIORITY + URGENCY SYNC ---
      const priorityToUrgency = {
      low: "Low",
      medium: "Medium",
      high: "High",
      urgent: "High",
    };

    const urgency = priorityToUrgency[payload.priority || "medium"];

    // --- PROJECT RELATION (ObjectId) ---
    const projectId = payload.projectId || null;

    // --- CREATE TASK ---
    const newTask = await Task.create({
      title: payload.title,
      name: payload.title,
      description: payload.description || "",
      userId: req.user.userId, // Set the owner to the authenticated user
      projectId, // <-- this is now ObjectId or null
      tags: Array.isArray(payload.tags) ? payload.tags : [],
      deadline: payload.deadline,
      priority: payload.priority || "medium",
      urgency,
      status: payload.status || "Not Started",
      context: payload.context,
      assignee: payload.assignee || "",
      order: payload.order || 0,
    });

    return res.status(201).json({
      success: true,
      task: newTask,
    });
  } catch (err) {
    console.error("Failed to create task:", err);
    return res.status(500).json({ message: "Failed to create task", error: err.message });
  }
});

// PATCH /api/tasks/:id - Update an existing task
router.patch(
  "/:id",
  [
    param("id").isMongoId().withMessage("Invalid task ID"),
    body("title")
      .optional()
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage("title must be between 1 and 200 characters"),
    body("description")
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage("description must not exceed 1000 characters"),
    body("deadline")
      .optional()
      .isISO8601()
      .withMessage("deadline must be a valid date"),
    body("context")
      .optional()
      .isIn(["office", "school", "home", "daily-life", "other"])
      .withMessage("context must be one of: office, school, home, daily-life, other"),
    body("priority")
      .optional()
      .isIn(["low", "medium", "high", "urgent"])
      .withMessage("priority must be one of: low, medium, high, urgent"),
    body("status")
      .optional()
      .isIn(["Not Started", "In Progress", "Completed", "On Hold"])
      .withMessage("status must be one of: Not Started, In Progress, Completed, On Hold"),
    body("projectId")
      .optional()
      .custom((value) => {
        if (value && value !== "none" && !mongoose.Types.ObjectId.isValid(value)) {
          throw new Error("Invalid projectId format");
        }
        return true;
      }),
    body("tags")
      .optional()
      .isArray()
      .withMessage("tags must be an array"),
    body("assignee")
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage("assignee must not exceed 100 characters"),
    body("order")
      .optional()
      .isInt({ min: 0 })
      .withMessage("order must be a non-negative integer"),
  ],
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const id = req.params.id;
      const updates = req.body || {};

      // Sync urgency with priority if provided
      if (updates.priority) {
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

    //  FIX: sanitize projectId so Mongoose doesn't choke on ""
    if (Object.prototype.hasOwnProperty.call(updates, "projectId")) {
      if (!updates.projectId || updates.projectId === "none") {
        updates.projectId = null;
      }
    }

    // Handle completedAt based on status changes
    if (updates.status) {
        // First, get the current task to check its current status
        const currentTask = await Task.findOne({
          _id: id,
          userId: req.user.userId,
        });

        if (!currentTask) {
          return res.status(404).json({
            success: false,
            message: `Task with id ${id} not found.`,
          });
        }

        // If changing TO "Completed" and it wasn't completed before
        if (updates.status === "Completed" && currentTask.status !== "Completed") {
          updates.completedAt = new Date();
        }

        // If changing FROM "Completed" to something else
        if (updates.status !== "Completed" && currentTask.status === "Completed") {
          updates.completedAt = null; // Clear the completion date
        }
      }


    const updatedTask = await Task.findOneAndUpdate(
      { _id: id, userId: req.user.userId },
      updates,
      { new: true }
    );

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

    const deletedTask = await Task.findOneAndDelete({
      _id: id,
      userId: req.user.userId,
    });

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
