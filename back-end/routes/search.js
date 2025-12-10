const express = require("express"); 
const { Task } = require("../mongo-schemas"); 
const passport = require("passport");

const router = express.Router();

// Simple search routes for the API
// Notes:
// - This module implements a very small search endpoint used by the front-end
//   to find tasks via a case-insensitive substring search across title,
//   description, and tags.
// - The implementation reads the user's tasks into memory and filters them.
//   This is acceptable for small datasets but not ideal for production scale.
//   Consider using MongoDB text indexes or a dedicated search service for
//   larger data sets (e.g., ElasticSearch, Atlas Search) to improve performance.

// Apply authentication to all routes
router.use(passport.authenticate("jwt", { session: false })); 

// GET /api/search?q=keyword
// Query params:
//   q - (string) search term to match against task title/description/tags
// Response: { success: true, count: <number>, results: [<task objects>] }
router.get("/", async (req, res) => { 
  try {//
    const query = (req.query.q || "").toLowerCase();

    if (!query) {
      return res.json({ success: true, count: 0, results: [] });
    }
    // Load all tasks for the authenticated user and then filter in-memory.
    // This keeps the endpoint simple and dependency-free, but isn't ideal at
    // scale as it loads the entire user task set into memory.
    // If you add larger datasets, consider using a text index query here.
    const tasks = await Task.find({ userId: req.user.userId }); 

    const results = tasks.filter((task) => {
      const titleMatch = task.title?.toLowerCase().includes(query);
      const descriptionMatch = task.description?.toLowerCase().includes(query);
      const tagsMatch = task.tags?.some((tag) =>
        tag.toLowerCase().includes(query)
      );

      return titleMatch || descriptionMatch || tagsMatch;
    });

    return res.json({
      success: true,
      count: results.length,
      results,
    });
  } catch (error) {
    console.error("Search error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Search failed" });
  }
});

module.exports = router;
