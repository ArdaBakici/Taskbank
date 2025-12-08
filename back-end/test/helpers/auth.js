const chai = require("chai");
const app = require("../../server");

const createdUsers = [];

async function getAuthHeader() {
  const unique = Date.now();
  const email = `test_${unique}@example.com`;
  const password = "Passw0rd!";
  const username = `user_${unique}`;

  const res = await chai.request(app).post("/api/auth/register").send({ email, password, username });
  const token = res.body?.token;
  const userId = res.body?.user?.id || res.body?.user?._id;
  if (!token) {
    throw new Error("Failed to acquire auth token for tests");
  }
  if (userId) {
    createdUsers.push({ userId, email });
  }
  const header = { Authorization: `Bearer ${token}`, __userId: userId, __email: email };
  return header;
}

module.exports = { getAuthHeader, createdUsers };
