const chai = require('chai');
const chaiHttp = require('chai-http');
const { expect } = chai;
chai.use(chaiHttp);

// Import the main app
const app = require('../server');

describe('API basic behaviors', () => {

  describe('Tasks routes', () => {
    it('GET /api/tasks returns tasks sorted by id ascending by default', async () => {
      const res = await chai.request(app).get('/api/tasks');
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('success', true);
      expect(res.body).to.have.property('tasks');
      const tasks = res.body.tasks;
      expect(tasks.length).to.be.greaterThan(0);
      // verify ascending by id for first few items
      for (let i = 1; i < Math.min(tasks.length, 5); i++) {
        expect(tasks[i].id).to.be.at.least(tasks[i - 1].id);
      }
    });

    it('GET /api/tasks with invalid filters JSON returns 400', async () => {
      const res = await chai.request(app).get('/api/tasks').query({ filters: 'not-json' });
      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('message').that.includes('Invalid filters JSON');
    });

    it('GET /api/tasks/:id returns a known task', async () => {
      const res = await chai.request(app).get('/api/tasks/101');
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('success', true);
      expect(res.body).to.have.nested.property('task.id', 101);
    });

    it('GET /api/tasks with smart sorting executes scoring logic', async () => {
      const res = await chai.request(app).get('/api/tasks').query({ sorting_method: 'smart' });
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('tasks');
    });
  });
});
