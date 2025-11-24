const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this-in-production";

/**
 * Middleware to verify JWT token and attach user info to request
 */
const authenticate = (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ 
        message: "Access denied. No token provided." 
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Attach user info to request
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      username: decoded.username,
    };
    
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token." });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired." });
    }
    return res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = authenticate;
