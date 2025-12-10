const express = require("express");
const { Task, Project } = require("../mongo-schemas");
const passport = require("passport");

const router = express.Router();

// Stats routes return aggregated metrics for the authenticated user.
// The route below computes a small set of useful statistics for the dashboard UI:
// - counts (total, active, completed)
// - completion rate, on-time completion rate, average tasks per day
// - distribution by status and priority

// Apply authentication to all routes
router.use(passport.authenticate("jwt", { session: false }));

router.get("/", async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Fetch user's tasks and projects from DB
    const tasks = await Task.find({ userId });
    const projects = await Project.find({ userId });

    // Basic counts
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === "Completed").length;
    const activeTasks = totalTasks - completedTasks;
    
    // Calculate completion rate as percentage of tasks with status 'Completed'
    const completionRate = totalTasks > 0 
      ? ((completedTasks / totalTasks) * 100).toFixed(1)
      : 0;

    // Calculate on-time completion
    // Only consider tasks which have both a deadline and a completedAt timestamp.
    // completedAt is used instead of relying on the updatedAt field to determine
    // whether the task was completed before its deadline.
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

    // Calculate overdue tasks - active tasks with a deadline in the past
    const now = new Date();
    const overdueTasks = tasks.filter(t => {
      if (t.status === "Completed" || !t.deadline) return false;
      return new Date(t.deadline) < now;
    }).length;

    // Average tasks completed per day — computed using the time since the first task
    // NOTE: This uses the first item in the `tasks` array; if tasks are not
    // returned in creation order a more rigorous approach would sort by creation
    // date and compute duration between earliest task and now. This implementation
    // is intentionally simple for demo purposes.
    const daysSinceFirstTask = tasks.length > 0
      ? Math.max(
          Math.ceil((Date.now() - new Date(tasks[0].createdAt).getTime()) / (1000 * 60 * 60 * 24)),
          1
        )
      : 1;
    const avgTasksPerDay = (completedTasks / daysSinceFirstTask).toFixed(1);

    // Task distribution by priority — useful for visualizations and quick filters
    const tasksByPriority = tasks.reduce((acc, task) => {
      const priority = task.priority || 'medium';
      acc[priority] = (acc[priority] || 0) + 1;
      return acc;
    }, {});

    // Build the response object with the aggregated metrics
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
