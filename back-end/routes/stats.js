const express = require("express");
const { Task, Project } = require("../mongo-schemas");
const passport = require("passport");

const router = express.Router();

// Apply authentication to all routes
router.use(passport.authenticate("jwt", { session: false }));

router.get("/", async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const tasks = await Task.find({ userId });
    const projects = await Project.find({ userId });

    const stats = {
      totalTasks: tasks.length,
      totalProjects: projects.length,
      tasksByStatus: tasks.reduce((acc, task) => {
        acc[task.status] = (acc[task.status] || 0) + 1;
        return acc;
      }, {}),
      projectsByStatus: projects.reduce((acc, project) => {
        acc[project.status] = (acc[project.status] || 0) + 1;
        return acc;
      }, {}),
    };

    res.json(stats);
  } catch (error) {
    console.error("Stats error:", error);
    res.status(500).json({ message: "Failed to retrieve stats" });
  }
});

module.exports = router;
