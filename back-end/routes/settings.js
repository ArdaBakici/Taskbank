const express = require("express");
const passport = require("passport");

const router = express.Router();

// Apply authentication to all routes
router.use(passport.authenticate("jwt", { session: false }));

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
