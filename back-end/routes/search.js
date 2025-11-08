const express = require("express");

const router = express.Router();

// TODO (Srijan): implement search
router.get("/", (_req, res) => {
  res.status(501).json({
    message: "GET /api/search is reserved for Srijan to implement.",
  });
});

module.exports = router;
