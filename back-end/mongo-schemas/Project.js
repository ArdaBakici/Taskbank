const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    tags: { type: [String], default: [] },
    deadline: { type: Date },
    urgency: {
      type: String,
      enum: ["High", "Medium", "Low"],
      default: "Medium",
    },
    status: {
      type: String,
      enum: ["Not Started", "In Progress", "Planning", "In Review"],
      default: "Planning",
    },
  },
  {
    timestamps: true,
    collection: "projects",
  }
);

projectSchema.index({ name: "text", description: "text" });
projectSchema.index({ status: 1, deadline: 1 });

module.exports =
  mongoose.models.Project || mongoose.model("Project", projectSchema);
