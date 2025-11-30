const express = require("express"); 
const { Task } = require("../mongo-schemas"); 
const passport = require("passport");

const router = express.Router();

// Apply authentication to all routes
router.use(passport.authenticate("jwt", { session: false })); 

// GET /api/search?q=keyword
router.get("/", async (req, res) => { 
  try {//
    const query = (req.query.q || "").toLowerCase();

    if (!query) {
      return res.json({ success: true, count: 0, results: [] });
    }
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
