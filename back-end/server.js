const express = require("express");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");

const tasksRouter = require("./routes/tasks");
const projectsRouter = require("./routes/projects");
const authRouter = require("./routes/auth");
const settingsRouter = require("./routes/settings");
const statsRouter = require("./routes/stats");
const searchRouter = require("./routes/search");

const app = express();
require("dotenv").config();
const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI;
console.log(`.env file's port is ${process.env.PORT}`);
const CLIENT_BUILD_PATH = path.resolve(__dirname, "../front-end/build");

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/tasks", tasksRouter);
app.use("/api/projects", projectsRouter);
app.use("/api/auth", authRouter);
app.use("/api/settings", settingsRouter);
app.use("/api/stats", statsRouter);
app.use("/api/search", searchRouter);

app.use(express.static(CLIENT_BUILD_PATH));

app.get(/^\/(?!api).*/, (_req, res) => {
  res.sendFile(path.join(CLIENT_BUILD_PATH, "index.html"));
});

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
});

async function connectToDatabase() {
  if (!MONGODB_URI) {
    console.error("Missing MONGODB_URI in environment variables.");
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
}

async function startServer() {
  await connectToDatabase();

  app.listen(PORT, () => {
    console.log(`API listening on http://localhost:${PORT}`);
  });
}

if (require.main === module) {
  startServer().catch((err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
  });
}

module.exports = app;
