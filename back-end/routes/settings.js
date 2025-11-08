const express = require("express");

const router = express.Router();

const settings = {
  theme: "light",
  notifications: true,
  timezone: "UTC",
};

router.get("/", (_req, res) => {
  res.json(settings);
});

router.patch("/", (req, res) => {
  const updates = req.body || {};
  Object.assign(settings, updates);
  res.json({ message: "Settings updated", settings });
});

module.exports = router;
