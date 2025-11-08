const express = require("express");
const router = express.Router();

// TODO (Arda): implement list_tasks with limit & sorting support
router.get("/", (_req, res) => {
  res
    .status(501)
    .json({ message: "GET /api/tasks is reserved for Arda to implement." });
});

// TODO (Sid): implement get_task(task_id)
router.get("/:id", (_req, res) => {
  res
    .status(501)
    .json({ message: "GET /api/tasks/:id is reserved for Sid to implement." });
});

// TODO (Sihyun): implement add_task
router.post("/", (req, res) => {

  // extract basic task data from request body
  
  const {title}=req.body 

  //validate required field
    if (!title) {
    return res.status(400).json({
      success: false,
      message: "Please provide a task title"
    });
  }
//create mock task obj (no db yet )
    const newTask = {
    id: Date.now(), // temporary ID using timestamp
    title: title,
    status: "todo",
    createdAt: new Date().toISOString()
  };

  //return success
    res.status(201).json({
    success: true,
    message: "Task created successfully",
    data: newTask
  });


  

});

// TODO (Sid): implement edit_task
router.patch("/:id", (_req, res) => {
  res
    .status(501)
    .json({ message: "PATCH /api/tasks/:id is reserved for Sid to implement." });
});

// TODO (Srijan): implement delete_task
router.delete("/:id", (_req, res) => {
  res.status(501).json({
    message: "DELETE /api/tasks/:id is reserved for Srijan to implement.",
  });
});

module.exports = router;
