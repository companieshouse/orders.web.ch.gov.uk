import app from "../../app";
import * as request from "supertest";

describe("index", () => {
  it("renders a a blank page for orders", async () => {
    const resp = await request(app).get("/orders");

    expect(resp.status).toEqual(200);
    expect(resp.text).toBe("");
  });

  it("renders a a blank page for basket", async () => {
    const resp = await request(app).get("/basket");

    expect(resp.status).toEqual(200);
    expect(resp.text).toBe("");
  });
});
