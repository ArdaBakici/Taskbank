// test/editProject.routes.test.js
// Tests for backend routes used by the EditProject page (sihyun)
const chai = require("chai");
const chaiHttp = require("chai-http");
const { expect } = chai;
chai.use(chaiHttp);

// Import Express app
const app = require("../server");

describe("EDIT PROJECT – Backend API Tests", () => {
  let projectId;
  let task1;
  let task2;

  // Before all tests: create a project and attach two tasks to it
  before(async () => {
    // 1) Create a new project
    const projectRes = await chai.request(app).post("/api/projects").send({
      name: "EditProject Test Project",
      deadline: "2025-12-31",
      status: "Planning",
      tags: ["test", "edit-project"],
    });

    expect(projectRes.status).to.equal(201);
    projectId = projectRes.body.id;
    expect(projectId).to.be.a("number");

    // 2) Create two tasks and assign them to the project
    const t1 = await chai.request(app).post("/api/tasks").send({
      title: "Task One for EditProject",
      deadline: "2025-12-31",
      context: "office",
      projectId,
    });
    expect(t1.status).to.equal(201);
    task1 = t1.body;

    const t2 = await chai.request(app).post("/api/tasks").send({
      title: "Task Two for EditProject",
      deadline: "2025-12-31",
      context: "office",
      projectId,
    });
    expect(t2.status).to.equal(201);
    task2 = t2.body;
  });

  it("GET /api/projects/:id returns the project details used in EditProject", async () => {
    const res = await chai.request(app).get(`/api/projects/${projectId}`);

    expect(res.status).to.equal(200);
    // The route returns the raw project object (without a success field)
    expect(res.body).to.have.property("id", projectId);
    expect(res.body).to.have.property("name", "EditProject Test Project");
    expect(res.body).to.have.property("deadline", "2025-12-31");
  });

  it("GET /api/projects/:id/tasks returns all tasks associated with the project", async () => {
    const res = await chai.request(app).get(`/api/projects/${projectId}/tasks`);

    expect(res.status).to.equal(200);
    expect(res.body).to.be.an("array");

    const ids = res.body.map((t) => t.id);
    expect(ids).to.include(task1.id);
    expect(ids).to.include(task2.id);

    // Ensure all returned tasks belong to this project
    res.body.forEach((task) => {
      expect(task.projectId).to.equal(projectId);
    });
  });

  it("PATCH /api/projects/:id updates name, status, deadline, and tags", async () => {
    const updatedPayload = {
      name: "EditProject Updated Name",
      description: "Updated description from unit test",
      status: "In Progress",
      deadline: "2026-01-01",
      tags: ["updated"],
    };

    const res = await chai.request(app)
      .patch(`/api/projects/${projectId}`)
      .send(updatedPayload);

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property("id", projectId);
    expect(res.body).to.have.property("name", updatedPayload.name);
    expect(res.body).to.have.property("status", updatedPayload.status);
    expect(res.body).to.have.property("deadline", updatedPayload.deadline);

    // Verify that the updated fields persist when fetching again
    const check = await chai.request(app).get(`/api/projects/${projectId}`);
    expect(check.status).to.equal(200);
    expect(check.body.name).to.equal(updatedPayload.name);
    expect(check.body.status).to.equal(updatedPayload.status);
    expect(check.body.deadline).to.equal(updatedPayload.deadline);
  });

  it("DELETE /api/projects/:id?unassignTasks=true deletes the project and unassigns its tasks", async () => {
    // 1) Delete the project and unassign associated tasks
    const res = await chai
      .request(app)
      .delete(`/api/projects/${projectId}`)
      .query({ unassignTasks: "true" });

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property("message").that.includes("Project deleted");
    expect(res.body).to.have.property("project");
    expect(res.body.project.id).to.equal(projectId);

    // The API returns the number of tasks that were unassigned
    expect(res.body.unassignedTasks).to.be.a("number");
    expect(res.body.unassignedTasks).to.be.greaterThan(0);

    // 2) The project should no longer exist
    const projRes = await chai.request(app).get(`/api/projects/${projectId}`);
    expect(projRes.status).to.equal(404);

    // 3) The tasks previously belonging to the project should now be unassigned
    const t1Res = await chai.request(app).get(`/api/tasks/${task1.id}`);
    const t2Res = await chai.request(app).get(`/api/tasks/${task2.id}`);

    expect(t1Res.status).to.equal(200);
    expect(t2Res.status).to.equal(200);

    expect(t1Res.body.task.projectId).to.be.oneOf([null, undefined]);
    expect(t2Res.body.task.projectId).to.be.oneOf([null, undefined]);
  });
});
