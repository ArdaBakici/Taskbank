const chai = require("chai");
const chaiHttp = require("chai-http");
const { expect } = chai;
chai.use(chaiHttp);

const app = require("../server");

describe("PROJECT TASK ORDERING", () => {
  
  let projectId;
  let taskA, taskB, taskC;

  // making a project
  before(async () => {
    const res = await chai.request(app).post("/api/projects").send({
      name: "Ordering Test Project",
      deadline: "2025-12-31",
      status: "Planning",
      tags: []
    });

    projectId = res.body.id;
  });

  it("should create 3 tasks in the project", async () => {
    // A
    const a = await chai.request(app).post("/api/tasks").send({
      title: "Task A",
      projectId,
      deadline: "2025-12-31",
      context: "office"
    });
    taskA = a.body;

    const b = await chai.request(app).post("/api/tasks").send({
      title: "Task B",
      projectId,
      deadline: "2025-12-31",
      context: "office"
    });
    taskB = b.body;

    const c = await chai.request(app).post("/api/tasks").send({
      title: "Task C",
      projectId,
      deadline: "2025-12-31",
      context: "office"
    });
    taskC = c.body;

    expect(taskA.id).to.exist;
    expect(taskB.id).to.exist;
    expect(taskC.id).to.exist;
  });

  it("should update orders of tasks using PATCH", async () => {
    // expected order: C, A, B  → order: 0, 1, 2
    await chai.request(app).patch(`/api/tasks/${taskC.id}`).send({ order: 0 });
    await chai.request(app).patch(`/api/tasks/${taskA.id}`).send({ order: 1 });
    await chai.request(app).patch(`/api/tasks/${taskB.id}`).send({ order: 2 });

    // verifying
    const c = await chai.request(app).get(`/api/tasks/${taskC.id}`);
    const a = await chai.request(app).get(`/api/tasks/${taskA.id}`);
    const b = await chai.request(app).get(`/api/tasks/${taskB.id}`);

    expect(c.body.task.order).to.equal(0);
    expect(a.body.task.order).to.equal(1);
    expect(b.body.task.order).to.equal(2);
  });

  it("GET /api/projects/:id/tasks should return tasks in sorted order", async () => {
    const res = await chai.request(app).get(`/api/projects/${projectId}/tasks`);

    expect(res.status).to.equal(200);
    expect(res.body).to.be.an("array");

    // result: C(0), A(1), B(2)
    const titles = res.body.map(t => t.title);

    expect(titles).to.deep.equal(["Task C", "Task A", "Task B"]);
  });
});
