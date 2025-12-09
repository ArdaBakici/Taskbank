const chai = require("chai");
const chaiHttp = require("chai-http");
const { expect } = chai;
chai.use(chaiHttp);

const app = require("../server");
const { getAuthHeader } = require("./helpers/auth");

describe("PROJECT TASK ORDERING", () => {
  
  let projectId;
  let taskA, taskB, taskC;
  let authHeader;

  // making a project
  before(async () => {
    authHeader = await getAuthHeader();

    const res = await chai.request(app).post("/api/projects").set(authHeader).send({
      name: "Ordering Test Project",
      deadline: "2025-12-31",
      status: "Planning",
      tags: []
    });

    projectId = res.body.project?._id || res.body.project?.id;
  });

  it("should create 3 tasks in the project", async () => {
    // A
    const a = await chai.request(app).post("/api/tasks").set(authHeader).send({
      title: "Task A",
      projectId,
      deadline: "2025-12-31",
      context: "office"
    });
    taskA = a.body.task || a.body;

    const b = await chai.request(app).post("/api/tasks").set(authHeader).send({
      title: "Task B",
      projectId,
      deadline: "2025-12-31",
      context: "office"
    });
    taskB = b.body.task || b.body;

    const c = await chai.request(app).post("/api/tasks").set(authHeader).send({
      title: "Task C",
      projectId,
      deadline: "2025-12-31",
      context: "office"
    });
    taskC = c.body.task || c.body;

    expect(taskA.id || taskA._id).to.exist;
    expect(taskB.id || taskB._id).to.exist;
    expect(taskC.id || taskC._id).to.exist;
  });

  it("should update orders of tasks using PATCH", async () => {
    // expected order: C, A, B  → order: 0, 1, 2
    const idA = taskA.id || taskA._id;
    const idB = taskB.id || taskB._id;
    const idC = taskC.id || taskC._id;

    await chai.request(app).patch(`/api/tasks/${idC}`).set(authHeader).send({ order: 0 });
    await chai.request(app).patch(`/api/tasks/${idA}`).set(authHeader).send({ order: 1 });
    await chai.request(app).patch(`/api/tasks/${idB}`).set(authHeader).send({ order: 2 });

    // verifying
    const c = await chai.request(app).get(`/api/tasks/${idC}`).set(authHeader);
    const a = await chai.request(app).get(`/api/tasks/${idA}`).set(authHeader);
    const b = await chai.request(app).get(`/api/tasks/${idB}`).set(authHeader);

    expect(c.body.task.order).to.equal(0);
    expect(a.body.task.order).to.equal(1);
    expect(b.body.task.order).to.equal(2);
  });

  it("GET /api/projects/:id/tasks should return tasks in sorted order", async () => {
    const res = await chai.request(app).get(`/api/projects/${projectId}/tasks`).set(authHeader);

    expect(res.status).to.equal(200);
    expect(res.body).to.be.an("array");

    // result: C(0), A(1), B(2)
    const titles = res.body.map(t => t.title);
    // Order should reflect the patched orders: C(0), A(1), B(2)
    expect(titles[0]).to.equal("Task C");
    expect(titles[1]).to.equal("Task A");
    expect(titles[2]).to.equal("Task B");
  });
});
