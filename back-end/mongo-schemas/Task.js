const mongoose = require("mongoose");
const { Schema } = mongoose;

const taskSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    name: { type: String, trim: true },
    description: { type: String, default: "" },
    // Reference to User (owner)
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    // Reference to Project
    projectId: { type: Schema.Types.ObjectId, ref: "Project", default: null },

    tags: { type: [String], default: [] },
    deadline: { type: Date },
    urgency: {
      type: String,
      enum: ["High", "Medium", "Low"],
      default: "Medium",
    },
    status: {
      type: String,
      enum: ["Not Started", "In Progress", "Completed", "On Hold"],
      default: "Not Started",
    },
    assignee: { type: String, trim: true },
    context: {
      type: String,
      enum: ["office", "school", "home", "daily-life", "other"],
      default: "other",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    order: { type: Number, default: 0 },
    completedAt: { type: Date, default: null },

  },
  {
    timestamps: true,
    collection: "tasks",
  }

);

taskSchema.index({ title: "text", description: "text" });
taskSchema.index({ projectId: 1, status: 1, priority: 1 });

module.exports =
  mongoose.models.Task || mongoose.model("Task", taskSchema);
