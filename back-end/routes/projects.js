const express = require("express");
const router = express.Router();

// TODO (Arda): implement list_projects(number_of_projects, sorting_method)
router.get("/", (_req, res) => {
  res
    .status(501)
    .json({ message: "GET /api/projects is reserved for Arda to implement." });
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
