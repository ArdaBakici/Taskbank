const chai = require("chai");
const chaiHttp = require("chai-http");
const { expect } = chai;
chai.use(chaiHttp);

const app = require("../server");
const { getAuthHeader } = require("./helpers/auth");
const mongoose = require("mongoose");

let authHeader;
let seededTasks = [];
let seededProjects = [];

describe("Stats routes", () => {
  before(async () => {
    authHeader = await getAuthHeader();

    // seed data for this user
    const proj = await chai
      .request(app)
      .post("/api/projects")
      .set(authHeader)
      .send({
        name: "Stats Project",
        deadline: "2025-12-31",
        status: "Planning",
      });
    const projectId = proj.body.project?._id || proj.body.project?.id;
    seededProjects = [proj.body.project];

    const t1 = await chai.request(app).post("/api/tasks").set(authHeader).send({
      title: "Active Task",
      status: "In Progress",
      deadline: "2025-12-31",
      context: "office",
      priority: "high",
      projectId,
    });
    const t2 = await chai.request(app).post("/api/tasks").set(authHeader).send({
      title: "Completed Task",
      status: "Completed",
      deadline: "2025-01-01",
      context: "home",
      priority: "medium",
      projectId,
    });
    seededTasks = [t1.body.task, t2.body.task];
  });

  it("GET /api/stats returns totals and grouped counts", async () => {
    const res = await chai.request(app).get("/api/stats").set(authHeader);

    expect(res.status).to.equal(200);
    expect(res.body).to.be.an("object");
    expect(res.body).to.include.keys("totalTasks", "totalProjects", "tasksByStatus", "projectsByStatus");

    expect(res.body.totalTasks).to.equal(seededTasks.length);
    expect(res.body.totalProjects).to.equal(seededProjects.length);

    const expectedTaskBuckets = seededTasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {});
    const expectedProjectBuckets = seededProjects.reduce((acc, project) => {
      const status = project.status || "Planning";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    expect(res.body.tasksByStatus).to.deep.equal(expectedTaskBuckets);
    expect(res.body.projectsByStatus).to.deep.equal(expectedProjectBuckets);
  });
});
