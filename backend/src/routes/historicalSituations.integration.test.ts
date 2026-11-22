import { describe, it, expect, vi } from "vitest";
import express from "express";
import request from "supertest";

const mockAll = vi.fn();

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

  it("returns historical results from the database query", async () => {
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
        currentValue: "100",
        line: "225"
      });

    expect(response.status).toBe(200);
    expect(response.body.sampleSize).toBe(3);
    expect(response.body.averageFinalValue).toBe(250);
    expect(response.body.overCount).toBe(2);
    expect(response.body.underCount).toBe(1);
  });
});
