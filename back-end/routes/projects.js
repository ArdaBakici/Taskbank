const express = require("express");
const router = express.Router();
const { getProjects } = require("../data/projects");

// GET /api/projects - List projects with optional limit and sorting
router.get("/", (req, res) => {
  try {
    // Get query parameters
    const numOfProjects = parseInt(req.query.num_of_projects) || null;
    const sortingMethod = req.query.sorting_method || "id"; // default: sort by id
    
    // Get all projects
    let projects = getProjects();
    
    // Apply sorting based on sorting_method
    const sortedProjects = [...projects].sort((a, b) => {
      switch (sortingMethod.toLowerCase()) {
        case "deadline":
        case "deadline_asc":
          // Sort by deadline ascending (earliest first)
          return new Date(a.deadline) - new Date(b.deadline);
        
        case "deadline_desc":
          // Sort by deadline descending (latest first)
          return new Date(b.deadline) - new Date(a.deadline);
        
        case "urgency":
        case "urgency_desc":
          // Sort by urgency: High > Medium > Low
          const urgencyOrder = { "High": 3, "Medium": 2, "Low": 1 };
          return (urgencyOrder[b.urgency] || 0) - (urgencyOrder[a.urgency] || 0);
        
        case "urgency_asc":
          // Sort by urgency: Low > Medium > High
          const urgencyOrderAsc = { "High": 3, "Medium": 2, "Low": 1 };
          return (urgencyOrderAsc[a.urgency] || 0) - (urgencyOrderAsc[b.urgency] || 0);
        
        case "status":
          // Sort by status alphabetically
          return (a.status || "").localeCompare(b.status || "");
        
        case "name":
          // Sort by name alphabetically
          return (a.name || "").localeCompare(b.name || "");
        
        case "id":
        case "id_asc":
        default:
          // Sort by ID ascending (default)
          return a.id - b.id;
        
        case "id_desc":
          // Sort by ID descending
          return b.id - a.id;
      }
    });
    
    // Apply limit if num_of_projects is specified
    const resultProjects = numOfProjects ? sortedProjects.slice(0, numOfProjects) : sortedProjects;
    
    res.status(200).json({
      success: true,
      count: resultProjects.length,
      total: projects.length,
      sorting_method: sortingMethod,
      projects: resultProjects
    });
  } catch (error) {
    console.error("Error listing projects:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve projects",
      error: error.message
    });
  }
});

// TODO (Sid): implement get_project
router.get("/:id", (_req, res) => {
  res.status(501).json({
    message: "GET /api/projects/:id is reserved for Sid to implement.",
  });
});

// TODO (Sihyun): implement add_project
router.post("/", (_req, res) => {
  res.status(501).json({
    message: "POST /api/projects is reserved for Sihyun to implement.",
  });
});

// TODO (Sihyun): implement edit_project
router.patch("/:id", (_req, res) => {
  res.status(501).json({
    message: "PATCH /api/projects/:id is reserved for Sihyun to implement.",
  });
});

// TODO (Srijan): implement delete_project
router.delete("/:id", (_req, res) => {
  res.status(501).json({
    message: "DELETE /api/projects/:id is reserved for Srijan to implement.",
  });
});

module.exports = router;
