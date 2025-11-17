const chai = require("chai");
const chaiHttp = require("chai-http");
const { expect } = chai;
chai.use(chaiHttp);

const app = require("../server");
const { getTasks } = require("../data/tasks");
const { getProjects } = require("../data/projects");

describe("Stats routes", () => {
  it("GET /api/stats returns totals and grouped counts", async () => {
    const res = await chai.request(app).get("/api/stats");

    expect(res.status).to.equal(200);
    expect(res.body).to.be.an("object");
    expect(res.body).to.have.all.keys(
      "totalTasks",
      "totalProjects",
      "tasksByStatus",
      "projectsByStatus"
    );

    const tasks = getTasks();
    const projects = getProjects();

    expect(res.body.totalTasks).to.equal(tasks.length);
    expect(res.body.totalProjects).to.equal(projects.length);

    const expectedTaskBuckets = tasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {});
    const expectedProjectBuckets = projects.reduce((acc, project) => {
      acc[project.status] = (acc[project.status] || 0) + 1;
      return acc;
    }, {});

    expect(res.body.tasksByStatus).to.deep.equal(expectedTaskBuckets);
    expect(res.body.projectsByStatus).to.deep.equal(expectedProjectBuckets);
  });
});
