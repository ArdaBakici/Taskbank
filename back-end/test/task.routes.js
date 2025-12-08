const chai = require('chai');
const chaiHttp = require('chai-http');
const { expect } = chai;
chai.use(chaiHttp);

// Import the main app
const app = require('../server');
const { getAuthHeader } = require("./helpers/auth");

let authHeader;
let seededTask;

describe('API basic behaviors', () => {
  before(async () => {
    authHeader = await getAuthHeader();
    const res = await chai.request(app).post('/api/tasks').set(authHeader).send({
      title: "Basic Task",
      deadline: "2025-12-31",
      context: "office",
    });
    seededTask = res.body.task;
  });

  describe('Tasks routes', () => {
    it('GET /api/tasks returns tasks sorted by id ascending by default', async () => {
      const res = await chai.request(app).get('/api/tasks').set(authHeader);
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('success', true);
      expect(res.body).to.have.property('tasks');
      const tasks = res.body.tasks;
      expect(tasks.length).to.be.greaterThan(0);
    });

    it('GET /api/tasks with invalid filters JSON returns 400', async () => {
      const res = await chai.request(app).get('/api/tasks').set(authHeader).query({ filters: 'not-json' });
      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('message').that.includes('Invalid filters JSON');
    });

    it('GET /api/tasks/:id returns a known task', async () => {
      const res = await chai.request(app).get(`/api/tasks/${seededTask._id || seededTask.id}`).set(authHeader);
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('success', true);
      expect(String(res.body.task._id || res.body.task.id)).to.equal(String(seededTask._id || seededTask.id));
    });

    it('GET /api/tasks with smart sorting executes scoring logic', async () => {
      const res = await chai.request(app).get('/api/tasks').set(authHeader).query({ sorting_method: 'smart' });
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('tasks');
    });
  });
});
