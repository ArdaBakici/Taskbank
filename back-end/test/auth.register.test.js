const chai = require("chai");
const chaiHttp = require("chai-http");
const { expect } = chai;
chai.use(chaiHttp);

const app = require("../server");

// Debug: surface env values for educational purposes
/* eslint-disable no-console */
console.log("MONGODB_URI:", process.env.MONGODB_URI);
console.log("JWT_SECRET:", process.env.JWT_SECRET);

describe("Auth register smoke test", () => {
  it("POST /api/auth/register creates a user and returns a token", async () => {
    const unique = Date.now();
    const email = `test_${unique}@example.com`;
    const password = "Passw0rd!";
    const username = `user_${unique}`;

    const res = await chai
      .request(app)
      .post("/api/auth/register")
      .send({ email, password, username });

    console.log("register status:", res.status);
    console.log("register body:", res.body);

    expect(res.status).to.equal(201);
    expect(res.body).to.have.property("token").that.is.a("string");
    expect(res.body).to.have.nested.property("user.id");
    expect(res.body).to.have.nested.property("user.email", email);
    expect(res.body).to.have.nested.property("user.username", username);
  });
});
