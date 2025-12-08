const mongoose = require("mongoose");
const { connectToDatabase } = require("../server");
const { User, Task, Project } = require("../mongo-schemas");

exports.mochaHooks = {
  async beforeAll() {
    await connectToDatabase();
  },
  async afterAll() {
    // Clean up test data created via helpers (users with test_* email/user_*, and their tasks/projects)
    try {
      const testUsers = await User.find({
        $or: [
          { email: /^test_/i },
          { username: /^user_/i },
        ],
      }).select("_id");

      const userIds = testUsers.map((u) => u._id);
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
