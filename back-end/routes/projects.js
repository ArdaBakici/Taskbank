const { Project } = require("../mongo-schemas");


const express = require("express");
const {
  getProjects,
  findProjectById,
  addProject,
  updateProject,
  deleteProject,
} = require("../data/projects");
const {
  getTasks, findTaskById, addTask, updateTask, deleteTask
} = require("../data/tasks");


const router = express.Router();
// const { getProjects } = require("../data/projects");

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

router.get("/:id", (req, res) => {
  const projectId = Number(req.params.id);
  const project = findProjectById(projectId);

  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }

  res.json(project);
});

router.get("/:projectId/tasks", (req, res) => {
  const projectId = Number(req.params.projectId);
  const project = findProjectById(projectId);

  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }

  // Return tasks that belong to this project
  const projectTasks = getTasks()
    .filter(task => task.projectId === projectId)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));  
  res.json(projectTasks);
});


// POST /api/projects - Create a new project
router.post("/", async (req, res) => {
  try {
    const payload = req.body || {};

    //
    // VALIDATION (this stays, but INSIDE the route)
    //

    // Validate name
    if (!payload.name) {
      return res.status(400).json({ message: "name is required to create a project" });
    }

    // Validate deadline
    if (!payload.deadline) {
      return res.status(400).json({ message: "deadline is required to create a project" });
    }

    // Optionally validate urgency value
    const allowedUrgencies = ["High", "Medium", "Low"];
    if (payload.urgency && !allowedUrgencies.includes(payload.urgency)) {
      return res.status(400).json({ message: "Invalid urgency value" });
    }

    // Optionally validate status
    const allowedStatuses = ["Not Started", "In Progress", "Planning", "In Review"];
    if (payload.status && !allowedStatuses.includes(payload.status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    //
    // CREATE PROJECT IN MONGO
    //
    const project = await Project.create({
      name: payload.name,
      description: payload.description || "",
      tags: payload.tags || [],
      deadline: payload.deadline,    // string OK, mongoose will convert
      urgency: payload.urgency || "Medium",
      status: payload.status || "Planning",
    });

    // SUCCESS RESPONSE
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

// TODO (Sihyun): implement edit_project

router.patch("/:id", (req, res) => {
  const projectId = Number(req.params.id);
  const updated = updateProject(projectId, req.body || {});
  if (!updated) {
    return res.status(404).json({ message: "Project not found" });
  }
  return res.json(updated);
});

// Detach a task from a project
router.delete("/:projectId/tasks/:taskId", (req, res) => {
  const projectId = Number(req.params.projectId);
  const taskId = Number(req.params.taskId);

  const project = findProjectById(projectId);
  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }

  const task = findTaskById(taskId);
  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }

  // Check if the task actually belongs to this project
  if (task.projectId !== projectId) {
    return res.status(409).json({ message: "Task does not belong to this project" });
  }

  // Detach the task (keep the task, just remove link)
  updateTask(taskId, { projectId: null });

  return res.json({ message: "Task detached successfully" });
});



// DELETE /api/projects/:id
router.delete("/:id", (req, res) => {
  const projectId = Number(req.params.id);
  const deleteTasks = req.query.deleteTasks === "true";
  const unassignTasks = req.query.unassignTasks === "true";

  const project = findProjectById(projectId);
  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }

  // Get all tasks that belong to this project
  const allTasks = getTasks();
  const projectTasks = allTasks.filter(t => t.projectId === projectId);

  // Option 1 — delete all tasks
  if (deleteTasks) {
    projectTasks.forEach(t => deleteTask(t.id));
  }

  // Option 2 — unassign tasks (set projectId = null)
  if (unassignTasks) {
    projectTasks.forEach(t => updateTask(t.id, { projectId: null }));
  }

  // Delete the actual project
  const removedProject = deleteProject(projectId);

  return res.json({
    message: "Project deleted successfully",
    project: removedProject,
    deletedTasks: deleteTasks ? projectTasks.length : 0,
    unassignedTasks: unassignTasks ? projectTasks.length : 0
  });
});

module.exports = router;
