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
router.post("/", (_req, res) => {
  res
    .status(501)
    .json({ message: "POST /api/tasks is reserved for Sihyun to implement." });
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
