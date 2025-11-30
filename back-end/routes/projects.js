const express = require("express");
const { Project, Task } = require("../mongo-schemas");
const mongoose = require("mongoose");
const passport = require("passport");

const router = express.Router();

// Apply authentication to all routes
router.use(passport.authenticate("jwt", { session: false }));

/* ---------------------------------------------
   GET /api/projects - List projects (sorted)
---------------------------------------------- */
router.get("/", async (req, res) => {
  try {
    const { num_of_projects, sorting_method } = req.query;

    let sort = {};

    switch ((sorting_method || "").toLowerCase()) {
      case "deadline":
      case "deadline_asc":
        sort.deadline = 1;
        break;

      case "deadline_desc":
        sort.deadline = -1;
        break;

      case "status":
        sort.status = 1;
        break;

      case "name":
        sort.name = 1;
        break;

      default:
        sort.createdAt = -1; // newest first
        break;
    }

    let query = Project.find({ userId: req.user.userId }).sort(sort);

    if (num_of_projects) {
      query = query.limit(Number(num_of_projects));
    }

    const projects = await query.exec();

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
router.post("/", async (req, res) => {
  try {
    const payload = req.body || {};

    // Validation
    if (!payload.name) {
      return res.status(400).json({ message: "name is required to create a project" });
    }

    if (!payload.deadline) {
      return res.status(400).json({ message: "deadline is required to create a project" });
    }

    const allowedStatuses = [
      "On Hold",
      "In Progress",
      "Planning",
      "Completed",
      "Cancelled",
    ];
    if (payload.status && !allowedStatuses.includes(payload.status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

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
router.patch("/:id", async (req, res) => {
  try {
    const projectId = req.params.id;

    if (!mongoose.isValidObjectId(projectId)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }

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
