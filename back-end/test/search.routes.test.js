const chai = require("chai");
const chaiHttp = require("chai-http");
const { expect } = chai;
chai.use(chaiHttp);

const app = require("../server");
const { getAuthHeader } = require("./helpers/auth");

let authHeader;
let seededTasks = [];

describe("Search routes", () => {
  before(async () => {
    authHeader = await getAuthHeader();
    // seed a couple of tasks
    const t1 = await chai
      .request(app)
      .post("/api/tasks")
      .set(authHeader)
      .send({
        title: "Design homepage",
        description: "Build hero layout",
        tags: ["frontend", "ui"],
        deadline: "2025-12-31",
        context: "office",
      });
    const t2 = await chai
      .request(app)
      .post("/api/tasks")
      .set(authHeader)
      .send({
        title: "Backend API integration",
        description: "Connect to frontend",
        tags: ["backend"],
        deadline: "2025-12-31",
        context: "office",
      });
    seededTasks = [t1.body.task, t2.body.task];
  });

  it("GET /api/search finds matches in title and description", async () => {
    const res = await chai.request(app).get("/api/search").set(authHeader).query({ q: "design" });

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property("success", true);
    expect(res.body.count).to.equal(res.body.results.length);
    expect(res.body.count).to.be.greaterThan(0);

    res.body.results.forEach(task => {
      const title = task.title?.toLowerCase() || "";
      const description = task.description?.toLowerCase() || "";
      expect(title.includes("design") || description.includes("design")).to.be.true;
    });
  });

  it("GET /api/search matches tags and returns empty when no hits", async () => {
    const tagRes = await chai.request(app).get("/api/search").set(authHeader).query({ q: "frontend" });
    expect(tagRes.status).to.equal(200);
    expect(tagRes.body.results.some(task =>
      task.tags?.map(tag => tag.toLowerCase()).includes("frontend")
    )).to.be.true;

    const emptyRes = await chai.request(app).get("/api/search").set(authHeader).query({ q: "zzzzz" });
    expect(emptyRes.status).to.equal(200);
    expect(emptyRes.body.count).to.equal(0);
    expect(emptyRes.body.results).to.be.an("array").that.is.empty;
  });
});
