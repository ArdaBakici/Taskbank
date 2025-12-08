const chai = require("chai");
const app = require("../../server");

async function getAuthHeader() {
  const unique = Date.now();
  const email = `test_${unique}@example.com`;
  const password = "Passw0rd!";
  const username = `user_${unique}`;

  const res = await chai.request(app).post("/api/auth/register").send({ email, password, username });
  const token = res.body?.token;
  if (!token) {
    throw new Error("Failed to acquire auth token for tests");
  }
  return { Authorization: `Bearer ${token}` };
}

module.exports = { getAuthHeader };
