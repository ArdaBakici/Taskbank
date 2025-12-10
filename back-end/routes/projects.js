const express = require("express");
const { body, param, validationResult } = require("express-validator");
const { Project, Task } = require("../mongo-schemas");
const mongoose = require("mongoose");
const passport = require("passport");

const router = express.Router();

// ----------------------------------------------------------------------------------
// Projects route handlers
// These endpoints allow authenticated users to manage projects. The router is scoped
// so that responses always contain only the resources belonging to the authenticated
// user (via `req.user.userId`).
//
// Important notes:
// - Sorting is handled server-side using `sorting_method` query param (see switch).
// - Paging-like behavior can be approximated using `num_of_projects` query param.
// - Status can be used to filter server-side via the `status` query param.
// - All routes are protected and require a valid JWT via Passport (see router.use).
// ----------------------------------------------------------------------------------

// Apply authentication to all routes
router.use(passport.authenticate("jwt", { session: false }));

/* ---------------------------------------------
   GET /api/projects - List projects (sorted)

   Query Parameters (optional):
     - num_of_projects: integer -> limit the number of returned projects
     - sorting_method: string -> controls server-side sort order; examples:
         "deadline", "deadline_desc", "name" (see switch cases below)
       If omitted, the backend falls back to newest-first (createdAt desc).
     - status: string -> filter projects by status (e.g. "Planning", "Completed")

   Response Shape:
     { success: true, count: <number>, projects: [<project objects>] }

   Notes:
     - The server uses the authenticated user's ID to scope results. If the
       `status` param is provided, only projects matching that status are returned.
     - Sorting occurs before applying the limit when `num_of_projects` is used.
--------------------------------------------- */
router.get("/", async (req, res) => {
  try {
    const { num_of_projects, sorting_method, status } = req.query;

    // Build the sort object for mongoose's .sort() based on sorting_method
    // Allowed methods are limited in the switch below to avoid arbitrary input
    // being passed directly to Mongoose as a sort object.
    let sort = {};

    switch ((sorting_method || "").toLowerCase()) {
      // The string value used by front-end must match these options (e.g., 'deadline').
      case "deadline":
      case "deadline_asc":
        // Sort by earliest deadline first
        sort.deadline = 1;
        break;

      case "deadline_desc":
        // Sort by latest deadlines first
        sort.deadline = -1;
        break;

      case "name":
        // Sort alphabetically by name (ascending)
        sort.name = 1;
        break;

      default:
        // If no known sorting method provided, fall back to newest first
        sort.createdAt = -1; // newest first
        break;
    }

    // Build Mongo filter object - always scope by the user so no user sees
    // another user's projects. The `status` query param, if provided, is also
    // applied to the filter so the client can ask for a specific project status.
    const filter = { userId: req.user.userId };
    if (status) {
      filter.status = status;
    }

    // Attach the sort to the mongoose query so the DB returns results in the
    // requested order. We avoid sending arbitrary sort objects from the client
    // (we only set the sort fields above via the switch) to prevent abuse.
    let query = Project.find(filter).sort(sort);

    // The optional `num_of_projects` param limits the result count
    // (useful for embedded lists like Home where we only show a few projects).
    if (num_of_projects) {
      query = query.limit(Number(num_of_projects));
    }

    // Execute the DB query and return the projects in a single list.
    const projects = await query.exec();

    // Return a stable response that clients rely on for UI display and counts
    return res.status(200).json({
      success: true,
      count: projects.length,
      projects,
    });
  } catch (error) {
    console.error("Error listing projects:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve projects",
      error: error.message,
    });
  }
});

/* ---------------------------------------------
   GET /api/projects/:id
---------------------------------------------- */
router.get("/:id", async (req, res) => {
  try {
    const projectId = req.params.id;

    if (!mongoose.isValidObjectId(projectId)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }

    const project = await Project.findOne({
      _id: projectId,
      userId: req.user.userId,
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    return res.json(project);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to retrieve project" });
  }
});

/* ---------------------------------------------
   GET /api/projects/:projectId/tasks
---------------------------------------------- */
router.get("/:projectId/tasks", async (req, res) => {
  try {
    const projectId = req.params.projectId;

    if (!mongoose.isValidObjectId(projectId)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }

    const project = await Project.findOne({
      _id: projectId,
      userId: req.user.userId,
    });
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const tasks = await Task.find({
      projectId,
      userId: req.user.userId,
    }).sort({ order: 1 });
    return res.json(tasks);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to retrieve tasks" });
  }
});

/* ---------------------------------------------
   POST /api/projects - Create a new project
---------------------------------------------- */
router.post(
  "/",
  [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("name is required to create a project")
      .isLength({ max: 200 })
      .withMessage("name must not exceed 200 characters"),
    body("description")
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage("description must not exceed 1000 characters"),
    body("deadline")
      .notEmpty()
      .withMessage("deadline is required to create a project")
      .isISO8601()
      .withMessage("deadline must be a valid date"),
    body("status")
      .optional()
      .isIn(["On Hold", "In Progress", "Planning", "Completed", "Cancelled"])
      .withMessage("status must be one of: On Hold, In Progress, Planning, Completed, Cancelled"),
    body("tags")
      .optional()
      .isArray()
      .withMessage("tags must be an array"),
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

      // Create project
    const project = await Project.create({
      name: payload.name,
      description: payload.description || "",
      userId: req.user.userId,
      tags: payload.tags || [],
      deadline: payload.deadline,
      status: payload.status || "Planning",
    });

    return res.status(201).json({
      success: true,
      project,
    });
  } catch (error) {
    console.error("Error creating project:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create project",
      error: error.message,
    });
  }
});

/* ---------------------------------------------
   PATCH /api/projects/:id - Update a project
---------------------------------------------- */
router.patch(
  "/:id",
  [
    param("id").isMongoId().withMessage("Invalid project ID"),
    body("name")
      .optional()
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage("name must be between 1 and 200 characters"),
    body("description")
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage("description must not exceed 1000 characters"),
    body("deadline")
      .optional()
      .isISO8601()
      .withMessage("deadline must be a valid date"),
    body("status")
      .optional()
      .isIn(["On Hold", "In Progress", "Planning", "Completed", "Cancelled"])
      .withMessage("status must be one of: On Hold, In Progress, Planning, Completed, Cancelled"),
    body("tags")
      .optional()
      .isArray()
      .withMessage("tags must be an array"),
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

      const projectId = req.params.id;

      const updated = await Project.findOneAndUpdate(
      { _id: projectId, userId: req.user.userId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Project not found" });
    }

    return res.json(updated);
  } catch (error) {
    console.error("Error updating project:", error);
    return res.status(500).json({ message: "Failed to update project" });
  }
});

/* ---------------------------------------------
   DELETE /api/projects/:projectId/tasks/:taskId
   Detach task from project
---------------------------------------------- */
router.delete("/:projectId/tasks/:taskId", async (req, res) => {
  try {
    const { projectId, taskId } = req.params;

    if (!mongoose.isValidObjectId(projectId) || !mongoose.isValidObjectId(taskId)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const task = await Task.findOne({
      _id: taskId,
      userId: req.user.userId,
    });
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (task.projectId?.toString() !== projectId) {
      return res.status(409).json({ message: "Task does not belong to this project" });
    }

    task.projectId = null;
    await task.save();

    return res.json({ message: "Task detached successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to detach task" });
  }
});

/* ---------------------------------------------
   DELETE /api/projects/:id - Delete project
---------------------------------------------- */
router.delete("/:id", async (req, res) => {
  try {
    const projectId = req.params.id;

    if (!mongoose.isValidObjectId(projectId)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }

    const deleteTasks = req.query.deleteTasks === "true";
    const unassignTasks = req.query.unassignTasks === "true";

    const project = await Project.findOne({
      _id: projectId,
      userId: req.user.userId,
    });
    if (!project) return res.status(404).json({ message: "Project not found" });

    const projectTasks = await Task.find({
      projectId,
      userId: req.user.userId,
    });

    if (deleteTasks) {
      await Task.deleteMany({ projectId, userId: req.user.userId });
    }

    if (unassignTasks) {
      await Task.updateMany(
        { projectId, userId: req.user.userId },
        { $set: { projectId: null } }
      );
    }

    await Project.findOneAndDelete({
      _id: projectId,
      userId: req.user.userId,
    });

    return res.json({
      message: "Project deleted successfully",
      deletedTasks: deleteTasks ? projectTasks.length : 0,
      unassignedTasks: unassignTasks ? projectTasks.length : 0,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to delete project" });
  }
});

module.exports = router;
