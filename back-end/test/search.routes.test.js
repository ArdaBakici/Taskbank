const chai = require("chai");
const chaiHttp = require("chai-http");
const { expect } = chai;
chai.use(chaiHttp);

const app = require("../server");

describe("Search routes", () => {
  it("GET /api/search finds matches in title and description", async () => {
    const res = await chai.request(app).get("/api/search").query({ q: "design" });

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property("success", true);
    expect(res.body.count).to.equal(res.body.results.length);
    expect(res.body.count).to.be.greaterThan(0);

    res.body.results.forEach(task => {
      const title = task.title?.toLowerCase() || "";
      const description = task.description?.toLowerCase() || "";
      expect(title.includes("design") || description.includes("design")).to.be.true;
    });
  });

  it("GET /api/search matches tags and returns empty when no hits", async () => {
    const tagRes = await chai.request(app).get("/api/search").query({ q: "frontend" });
    expect(tagRes.status).to.equal(200);
    expect(tagRes.body.results.some(task =>
      task.tags?.map(tag => tag.toLowerCase()).includes("frontend")
    )).to.be.true;

    const emptyRes = await chai.request(app).get("/api/search").query({ q: "zzzzz" });
    expect(emptyRes.status).to.equal(200);
    expect(emptyRes.body.count).to.equal(0);
    expect(emptyRes.body.results).to.be.an("array").that.is.empty;
  });
});
