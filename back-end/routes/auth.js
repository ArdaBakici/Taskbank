const express = require("express");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const { User } = require("../mongo-schemas");

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this-in-production";
const JWT_EXPIRES_IN = "7d"; // Token expires in 7 days

/**
 * Generate JWT token for user
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      email: user.email,
      username: user.username,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post(
  "/register",
  [
    body("username")
      .trim()
      .isLength({ min: 3, max: 30 })
      .withMessage("Username must be between 3 and 30 characters"),
    body("email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("Please enter a valid email address"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: errors.array() 
        });
      }

      const { username, email, password } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [{ email }, { username }],
      });

      if (existingUser) {
        if (existingUser.email === email) {
          return res.status(409).json({ 
            message: "Email already registered" 
          });
        }
        if (existingUser.username === username) {
          return res.status(409).json({ 
            message: "Username already taken" 
          });
        }
      }

      // Create new user (password will be hashed by pre-save hook)
      const user = new User({
        username,
        email,
        password,
      });

      await user.save();

      // Generate token
      const token = generateToken(user);

      res.status(201).json({
        message: "User registered successfully",
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
        },
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ 
        message: "Error registering user" 
      });
    }
  }
);

/**
 * POST /api/auth/login
 * Login existing user
 */
router.post(
  "/login",
  [
    body("email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("Please enter a valid email address"),
    body("password")
      .notEmpty()
      .withMessage("Password is required"),
  ],
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: errors.array() 
        });
      }

      const { email, password } = req.body;

      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ 
          message: "Invalid email or password" 
        });
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({ 
          message: "Invalid email or password" 
        });
      }

      // Generate token
      const token = generateToken(user);

      res.json({
        message: "Login successful",
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ 
        message: "Error logging in" 
      });
    }
  }
);

module.exports = router;
