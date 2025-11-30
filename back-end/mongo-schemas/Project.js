const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    // Reference to User (owner)
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    tags: { type: [String], default: [] },
    deadline: { type: Date },
    status: {
      type: String,
      enum: ["On Hold", "In Progress", "Planning", "Completed", "Cancelled"],
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
