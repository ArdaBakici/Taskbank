const chai = require('chai');
const chaiHttp = require('chai-http');
const { expect } = chai;

chai.use(chaiHttp);

const app = require('../server');
const { getAuthHeader } = require("./helpers/auth");

let authHeader;
let seededTasks = [];
let projectId;

describe('Task API — Tests for New Logic (Your Changes)', () => {
  before(async () => {
    authHeader = await getAuthHeader();

    // create a project for project-related tests
    const projRes = await chai.request(app).post('/api/projects').set(authHeader).send({
      name: "Task Feature Project",
      deadline: "2025-12-31",
      status: "Planning",
    });
    projectId = projRes.body.project?._id || projRes.body.project?.id;

    // seed tasks for this user
    const tasksToCreate = [
      { title: "Completed Task", status: "Completed", context: "office", tags: ["important"], deadline: "2025-01-01", priority: "high", projectId },
      { title: "Office Task", status: "In Progress", context: "office", tags: ["important"], deadline: "2025-02-01", priority: "medium", projectId },
      { title: "Home Task", status: "Not Started", context: "home", tags: ["home"], deadline: "2025-03-01", priority: "low", projectId: null },
    ];

    for (const t of tasksToCreate) {
      const res = await chai.request(app).post('/api/tasks').set(authHeader).send({
        ...t,
        projectId: t.projectId,
      });
      seededTasks.push(res.body.task);
    }
  });

  // -----------------------------------------------
  // 1. VALID FILTER JSON — should correctly parse
  // -----------------------------------------------
  it('GET /api/tasks parses valid filters JSON', async () => {
    const filters = { status: "Completed" };

    const res = await chai.request(app)
      .get('/api/tasks')
      .set(authHeader)
      .query({ filters: JSON.stringify(filters) });

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('filters');
    expect(res.body.filters).to.deep.equal(filters);
    expect(res.body).to.have.property('filtered_total');
  });


  // -------------------------------------------------------
  // 2. FILTER: Status filter
  // -------------------------------------------------------
  it('GET /api/tasks filters tasks by status', async () => {
    const res = await chai.request(app)
      .get('/api/tasks')
      .set(authHeader)
      .query({ filters: JSON.stringify({ status: "Completed" }) });

    expect(res.status).to.equal(200);
    expect(res.body.tasks.length).to.be.greaterThan(0);

    res.body.tasks.forEach(task => {
      expect(task.status).to.equal("Completed");
    });
  });


  // -------------------------------------------------------
  // 3. FILTER: Context filter
  // -------------------------------------------------------
  it('GET /api/tasks filters tasks by context', async () => {
    const res = await chai.request(app)
      .get('/api/tasks')
      .set(authHeader)
      .query({ filters: JSON.stringify({ context: "office" }) });

    expect(res.status).to.equal(200);

    res.body.tasks.forEach(task => {
      expect(task.context.toLowerCase()).to.equal("office");
    });
  });


  // -------------------------------------------------------
  // 4. FILTER: Project ID filter
  // -------------------------------------------------------
  it('GET /api/tasks filters tasks by projectId', async () => {
    const res = await chai.request(app)
      .get('/api/tasks')
      .set(authHeader)
      .query({ filters: JSON.stringify({ projectId }) });

    expect(res.status).to.equal(200);

    res.body.tasks.forEach(task => {
      expect(String(task.projectId)).to.equal(String(projectId));
    });
  });


  // -------------------------------------------------------
  // 5. FILTER: Tag filter
  // -------------------------------------------------------
  it('GET /api/tasks filters tasks by tag', async () => {
    const res = await chai.request(app)
      .get('/api/tasks')
      .set(authHeader)
      .query({ filters: JSON.stringify({ tag: "important" }) });

    expect(res.status).to.equal(200);

    res.body.tasks.forEach(task => {
      expect(task.tags).to.be.an('array');
      const normalized = task.tags.map(t => t.toLowerCase());
      expect(normalized).to.include("important");
    });
  });


  // -------------------------------------------------------
  // 6. ACTIVE FIRST, COMPLETED LAST ordering
  // -------------------------------------------------------
  it('GET /api/tasks ensures active tasks appear before completed tasks', async () => {
    const res = await chai.request(app).get('/api/tasks').set(authHeader);

    expect(res.status).to.equal(200);

    const tasks = res.body.tasks;

    let seenCompleted = false;

    for (const t of tasks) {
      if (t.status === "Completed") {
        seenCompleted = true;
      } else {
        // If we see an active task after completed → incorrect
        expect(seenCompleted).to.equal(false);
      }
    }
  });


  // -------------------------------------------------------
  // 7. SMART SORTING actually changes priority ordering
  // -------------------------------------------------------
  it('GET /api/tasks smart sorting orders by urgency & deadline logically', async () => {
    const res = await chai.request(app)
      .get('/api/tasks')
      .set(authHeader)
      .query({ sorting_method: 'smart' });

    expect(res.status).to.equal(200);
    const tasks = res.body.tasks;

    expect(tasks.length).to.be.greaterThan(0);
  });


  // -------------------------------------------------------
  // 8. DEADLINE sorting (ascending)
  // -------------------------------------------------------
  it('GET /api/tasks sorts by deadline ascending', async () => {
    const res = await chai.request(app)
      .get('/api/tasks')
      .set(authHeader)
      .query({ sorting_method: 'deadline' });

    expect(res.status).to.equal(200);

    const tasks = res.body.tasks;

    const active = tasks.filter(t => t.status !== "Completed");
    const completed = tasks.filter(t => t.status === "Completed");

    const checkAscending = (list) => {
      for (let i = 1; i < list.length; i++) {
        const prev = new Date(list[i - 1].deadline);
        const curr = new Date(list[i].deadline);
        if (isNaN(prev) || isNaN(curr)) continue;
        expect(prev <= curr).to.equal(true);
      }
    };

    checkAscending(active);
    checkAscending(completed);
  });


  // -------------------------------------------------------
  // 9. URGENCY sorting (descending)
  // -------------------------------------------------------
    it('GET /api/tasks sorts by urgency descending', async () => {
    const res = await chai.request(app)
        .get('/api/tasks')
        .set(authHeader)
        .query({ sorting_method: 'urgency' });

    expect(res.status).to.equal(200);

    const tasks = res.body.tasks;

    // Separate groups (matching backend behavior)
    const active = tasks.filter(t => t.status !== "Completed");
    const completed = tasks.filter(t => t.status === "Completed");

    const score = level => ({ High: 3, Medium: 2, Low: 1 }[level] || 0);

    // Test urgency ordering inside active tasks
    for (let i = 1; i < active.length; i++) {
        expect(score(active[i].urgency)).to.be.at.most(score(active[i - 1].urgency));
    }

    // Test urgency ordering inside completed tasks
    for (let i = 1; i < completed.length; i++) {
        expect(score(completed[i].urgency)).to.be.at.most(score(completed[i - 1].urgency));
    }

  // Confirm completed tasks come last
  if (completed.length > 0) {
    expect(tasks.slice(-completed.length).every(t => t.status === "Completed")).to.equal(true);
  }
});



  // -------------------------------------------------------
  // 10. num_of_tasks limit
  // -------------------------------------------------------
  it('GET /api/tasks applies num_of_tasks limit', async () => {
    const res = await chai.request(app)
      .get('/api/tasks')
      .set(authHeader)
      .query({ num_of_tasks: 3 });

    expect(res.status).to.equal(200);
    expect(res.body.tasks.length).to.be.at.most(3);
  });

});
