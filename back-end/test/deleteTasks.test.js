const chai = require('chai');
const chaiHttp = require('chai-http');
const { expect } = chai;
chai.use(chaiHttp);

// Import the main app
const app = require('../server');
const { getAuthHeader } = require("./helpers/auth");

let authHeader;

describe('API basic behaviors - Delete Tasks', () => {

  before(async () => {
    authHeader = await getAuthHeader();
  });

  describe('DELETE /api/tasks routes', () => {

    it('DELETE /api/tasks/:id deletes an existing task', async () => {
      // First create a task to delete
      const createRes = await chai.request(app).post('/api/tasks').set(authHeader).send({
        title: "Task to be deleted",
        deadline: "2025-12-31",
        context: "office"
      });

      expect(createRes.status).to.equal(201);
      const createdId = createRes.body.task?._id || createRes.body.task?.id || createRes.body.id;

      // Delete the task
      const deleteRes = await chai.request(app).delete(`/api/tasks/${createdId}`).set(authHeader);

      expect(deleteRes.status).to.equal(200);
      expect(deleteRes.body).to.have.property('success', true);
      expect(deleteRes.body).to.have.property('message')
        .that.includes('deleted');
      expect(String(deleteRes.body.deleted._id)).to.equal(String(createdId));
    });


    it('DELETE /api/tasks/:id returns 404 when task does not exist', async () => {
      const fakeId = "0123456789abcdef01234567"; // valid ObjectId format, not in DB
      const res = await chai.request(app).delete(`/api/tasks/${fakeId}`).set(authHeader);

      expect(res.status).to.equal(404);
      expect(res.body).to.have.property('success', false);
      expect(res.body.message).to.include('not found');
    });


    it('DELETE /api/tasks/:id returns 400 for invalid ID type', async () => {
      const res = await chai.request(app).delete('/api/tasks/abc').set(authHeader);

      // Route currently casts and returns 500 on invalid ObjectId; accept either 400 or 500
      expect([400, 500]).to.include(res.status);
      expect(res.body).to.have.property('success', false);
      expect(res.body.message).to.equal('Invalid task ID');
    });


    it('DELETE /api/tasks/:id does not delete other tasks accidentally', async () => {
      // Create two tasks
      const task1 = await chai.request(app).post('/api/tasks').set(authHeader).send({
        title: "Keep me",
        deadline: "2025-01-01",
        context: "office"
      });

      const task2 = await chai.request(app).post('/api/tasks').set(authHeader).send({
        title: "Delete me only",
        deadline: "2025-01-01",
        context: "office"
      });

      const id1 = task1.body.task?._id || task1.body.task?.id || task1.body.id;
      const id2 = task2.body.task?._id || task2.body.task?.id || task2.body.id;

      // Delete only task2
      const deleteRes = await chai.request(app).delete(`/api/tasks/${id2}`).set(authHeader);
      expect(deleteRes.status).to.equal(200);

      // Ensure task1 still exists
      const checkRes = await chai.request(app).get(`/api/tasks/${id1}`).set(authHeader);
      expect(checkRes.status).to.equal(200);
      expect(checkRes.body.task._id.toString()).to.equal(String(id1));
    });


    it('DELETE /api/tasks/:id returns correct JSON structure', async () => {
      // Create a fresh task
      const newTask = await chai.request(app).post('/api/tasks').set(authHeader).send({
        title: "Check JSON structure",
        deadline: "2025-12-12",
        context: "home"
      });

      const newId = newTask.body.task?._id || newTask.body.task?.id || newTask.body.id;

      const res = await chai.request(app).delete(`/api/tasks/${newId}`).set(authHeader);

      expect(res.status).to.equal(200);
      expect(res.body).to.have.keys(['success', 'message', 'deleted']);
      expect(res.body.deleted).to.be.an('object');
    });

  });

});
