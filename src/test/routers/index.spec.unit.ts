jest.mock('ioredis');

import app from "../../app";
import * as request from "supertest";

describe("index", () => {
  it("renders a blank page for orders", async () => {
    const resp = await request(app).get("/orders");

    expect(resp.status).toEqual(200);
    expect(resp.text).toBe("");
  });

  it("renders the order complete page", async () => {
    const resp = await request(app).get("/orders/order-id/order-complete");

    expect(resp.status).toEqual(200);
    expect(resp.text).toContain("Certificate ordered");
  });

  it("renders a blank page for basket", async () => {
    const resp = await request(app).get("/basket");

    expect(resp.status).toEqual(200);
    expect(resp.text).toBe("");
  });
});
