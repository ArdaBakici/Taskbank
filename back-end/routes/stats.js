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

    // Basic counts
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === "Completed").length;
    const activeTasks = totalTasks - completedTasks;
    
    // Calculate completion rate
    const completionRate = totalTasks > 0 
      ? ((completedTasks / totalTasks) * 100).toFixed(1)
      : 0;

    // ✨ IMPROVED: Calculate on-time completion using completedAt
    const completedWithDeadline = tasks.filter(t => 
      t.status === "Completed" && t.deadline && t.completedAt // Must have all three
    );
    
    const completedOnTime = completedWithDeadline.filter(t => {
      const deadline = new Date(t.deadline);
      const completionDate = new Date(t.completedAt); // Now using completedAt!
      return completionDate <= deadline;
    }).length;

    const onTimeRate = completedWithDeadline.length > 0
      ? ((completedOnTime / completedWithDeadline.length) * 100).toFixed(1)
      : 0;

    // Calculate overdue tasks (active tasks past deadline)
    const now = new Date();
    const overdueTasks = tasks.filter(t => {
      if (t.status === "Completed" || !t.deadline) return false;
      return new Date(t.deadline) < now;
    }).length;

    // Average tasks completed per day
    const daysSinceFirstTask = tasks.length > 0
      ? Math.max(
          Math.ceil((Date.now() - new Date(tasks[0].createdAt).getTime()) / (1000 * 60 * 60 * 24)),
          1
        )
      : 1;
    const avgTasksPerDay = (completedTasks / daysSinceFirstTask).toFixed(1);

    // Task distribution by priority
    const tasksByPriority = tasks.reduce((acc, task) => {
      const priority = task.priority || 'medium';
      acc[priority] = (acc[priority] || 0) + 1;
      return acc;
    }, {});

    const stats = {
      totalTasks,
      totalProjects: projects.length,
      completedTasks,
      activeTasks,
      overdueTasks,
      completionRate: parseFloat(completionRate),
      onTimeRate: parseFloat(onTimeRate),
      avgTasksPerDay: parseFloat(avgTasksPerDay),
      tasksByStatus: tasks.reduce((acc, task) => {
        acc[task.status] = (acc[task.status] || 0) + 1;
        return acc;
      }, {}),
      tasksByPriority,
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
