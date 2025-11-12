const express = require("express");
const { getTasks } = require("../data/tasks");
const router = express.Router();

// GET /api/search?q=keyword
router.get("/", (req, res) => {
  try {
    const query = (req.query.q || "").toLowerCase();

    // ✅ Use getTasks() as in AllTasks, so deleted tasks are already filtered
    const tasks = getTasks(); // this only returns active tasks

    // Search only within active tasks
    const results = tasks.filter(task => {
      const titleMatch = task.title?.toLowerCase().includes(query);
      const descriptionMatch = task.description?.toLowerCase().includes(query);
      const tagsMatch = task.tags?.some(tag => tag.toLowerCase().includes(query));
      return titleMatch || descriptionMatch || tagsMatch;
    });

    res.json({ success: true, count: results.length, results });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ success: false, message: "Search failed" });
  }
});

module.exports = router;
