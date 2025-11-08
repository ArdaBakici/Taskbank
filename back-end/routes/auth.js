const express = require("express");

const router = express.Router();

// TODO (Arda): implement login
router.post("/login", (_req, res) => {
  res.status(501).json({
    message: "POST /api/auth/login is reserved for Arda to implement.",
  });
});

// TODO (Arda): implement register
router.post("/register", (_req, res) => {
  res.status(501).json({
    message: "POST /api/auth/register is reserved for Arda to implement.",
  });
});

module.exports = router;
