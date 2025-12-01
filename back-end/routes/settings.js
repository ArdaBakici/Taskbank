const express = require("express");
const passport = require("passport");
const { User } = require("../mongo-schemas");
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
router.patch("/change-password", async (req, res) => {
  try {
    const userId = req.user.userId;   // from passport JWT
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Old password and new password are required." });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Check old password
    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Current password is incorrect." });
    }

    // Prevent reusing the same password
    const samePassword = await user.comparePassword(newPassword);
    if (samePassword) {
      return res
        .status(400)
        .json({
          message: "New password must be different from the current password.",
        });
    }

    // Set new password (will be hashed by pre-save hook)
    user.password = newPassword;
    await user.save();

    return res.json({ message: "Password changed successfully." });
  } catch (error) {
    console.error("Change password error:", error);
    return res.status(500).json({ message: "Failed to change password." });
  }
});
module.exports = router;
