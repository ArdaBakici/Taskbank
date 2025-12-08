const mongoose = require("mongoose");
const { connectToDatabase } = require("../server");
const { User, Task, Project } = require("../mongo-schemas");
const { createdUsers } = require("./helpers/auth");

exports.mochaHooks = {
  async beforeAll() {
    await connectToDatabase();
  },
  async afterAll() {
    // Clean up test data created via helpers (only the users we created)
    try {
      const userIds = createdUsers.map((u) => u.userId).filter(Boolean);
      if (userIds.length) {
        await Promise.all([
          Task.deleteMany({ userId: { $in: userIds } }),
          Project.deleteMany({ userId: { $in: userIds } }),
          User.deleteMany({ _id: { $in: userIds } }),
        ]);
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Test cleanup error:", err.message);
    } finally {
      try {
        await mongoose.connection.close();
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Error closing mongoose connection:", err.message);
      }
    }
  },
};
