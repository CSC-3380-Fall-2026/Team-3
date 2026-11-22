import { describe, it, expect, vi, beforeEach } from "vitest";
import express from "express";
import request from "supertest";

const { mockAll } = vi.hoisted(() => ({
  mockAll: vi.fn()
}));

vi.mock("../database", () => ({
  default: {
    prepare: vi.fn(() => ({
      all: mockAll
    }))
  }
}));

import historicalSituationsRoutes from "./historicalSituations";

const app = express();
app.use("/api", historicalSituationsRoutes);

beforeEach(() => {
  mockAll.mockReset();
});

describe("Historical situations integration tests", () => {
  it("rejects missing required parameters", async () => {
    const response = await request(app)
      .get("/api/historical-situations");

    expect(response.status).toBe(400);
  });

  it("rejects an invalid quarter", async () => {
    const response = await request(app)
      .get("/api/historical-situations")
      .query({
        playerId: "player1",
        stat: "passing_yards",
        quarter: "5",
        currentValue: "100"
      });

    expect(response.status).toBe(400);
  });

  it("rejects an unsupported statistic", async () => {
    const response = await request(app)
      .get("/api/historical-situations")
      .query({
        playerId: "player1",
        stat: "touchdowns",
        quarter: "2",
        currentValue: "100"
      });

    expect(response.status).toBe(400);
  });

  it("rejects a non-numeric current value", async () => {
    const response = await request(app)
      .get("/api/historical-situations")
      .query({
        playerId: "player1",
        stat: "passing_yards",
        quarter: "2",
        currentValue: "invalid"
      });

    expect(response.status).toBe(400);
  });

  it("returns factual historical results from the database query", async () => {
    mockAll.mockReturnValue([
      { final_value: 200 },
      { final_value: 250 },
      { final_value: 300 }
    ]);

    const response = await request(app)
      .get("/api/historical-situations")
      .query({
        playerId: "player1",
        stat: "passing_yards",
        quarter: "2",
        currentValue: "100"
      });

    expect(response.status).toBe(200);
    expect(response.body.sampleSize).toBe(3);
    expect(response.body.averageFinalValue).toBe(250);
  });
});
