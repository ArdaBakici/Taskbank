const express = require("express");
const { getTasks } = require("../data/tasks");
const { getProjects } = require("../data/projects");

const router = express.Router();

router.get("/", (_req, res) => {
  const tasks = getTasks();
  const projects = getProjects();

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
});

module.exports = router;
