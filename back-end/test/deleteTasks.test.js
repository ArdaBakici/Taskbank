const chai = require('chai');
const chaiHttp = require('chai-http');
const { expect } = chai;
chai.use(chaiHttp);

// Import the main app
const app = require('../server');

describe('API basic behaviors - Delete Tasks', () => {

  describe('DELETE /api/tasks routes', () => {

    it('DELETE /api/tasks/:id deletes an existing task', async () => {
      // First create a task to delete
      const createRes = await chai.request(app).post('/api/tasks').send({
        title: "Task to be deleted",
        deadline: "2025-12-31",
        context: "office"
      });

      expect(createRes.status).to.equal(201);
      const createdId = createRes.body.id;

      // Delete the task
      const deleteRes = await chai.request(app).delete(`/api/tasks/${createdId}`);

      expect(deleteRes.status).to.equal(200);
      expect(deleteRes.body).to.have.property('success', true);
      expect(deleteRes.body).to.have.property('message')
        .that.includes('deleted');
      expect(deleteRes.body).to.have.nested.property('deleted.id', createdId);
    });


    it('DELETE /api/tasks/:id returns 404 when task does not exist', async () => {
      const res = await chai.request(app).delete('/api/tasks/9999999');

      expect(res.status).to.equal(404);
      expect(res.body).to.have.property('success', false);
      expect(res.body.message).to.include('not found');
    });


    it('DELETE /api/tasks/:id returns 400 for invalid ID type', async () => {
      const res = await chai.request(app).delete('/api/tasks/abc');

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('success', false);
      expect(res.body.message).to.equal('Invalid task ID');
    });


    it('DELETE /api/tasks/:id does not delete other tasks accidentally', async () => {
      // Create two tasks
      const task1 = await chai.request(app).post('/api/tasks').send({
        title: "Keep me",
        deadline: "2025-01-01",
        context: "office"
      });

      const task2 = await chai.request(app).post('/api/tasks').send({
        title: "Delete me only",
        deadline: "2025-01-01",
        context: "office"
      });

      const id1 = task1.body.id;
      const id2 = task2.body.id;

      // Delete only task2
      const deleteRes = await chai.request(app).delete(`/api/tasks/${id2}`);
      expect(deleteRes.status).to.equal(200);

      // Ensure task1 still exists
      const checkRes = await chai.request(app).get(`/api/tasks/${id1}`);
      expect(checkRes.status).to.equal(200);
      expect(checkRes.body.task.id).to.equal(id1);
    });


    it('DELETE /api/tasks/:id returns correct JSON structure', async () => {
      // Create a fresh task
      const newTask = await chai.request(app).post('/api/tasks').send({
        title: "Check JSON structure",
        deadline: "2025-12-12",
        context: "home"
      });

      const newId = newTask.body.id;

      const res = await chai.request(app).delete(`/api/tasks/${newId}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.have.keys(['success', 'message', 'deleted']);
      expect(res.body.deleted).to.be.an('object');
    });

  });

});
