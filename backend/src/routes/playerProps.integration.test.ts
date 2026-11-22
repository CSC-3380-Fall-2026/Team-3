import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import express from "express";
import request from "supertest";

const app = express();

beforeEach(() => {
  vi.stubEnv("SPORTSGAMEODDS_API_KEY", "");
});

import playerPropsRoutes from "./playerProps";

app.use("/api", playerPropsRoutes);

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("Player props data integration tests", () => {
  it("returns 503 when the API key is missing", async () => {
    const response = await request(app)
      .get("/api/player-props");

    expect(response.status).toBe(503);
    expect(response.body.error).toContain("API_KEY is not set");
  });

  it("does not expose an API key in the error response", async () => {
    const response = await request(app)
      .get("/api/player-props");

    expect(JSON.stringify(response.body)).not.toContain("secret");
  });
});
