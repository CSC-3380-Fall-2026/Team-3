import { describe, it, expect, beforeEach, vi } from "vitest";
import request from "supertest";
import express from "express";

const mocks = vi.hoisted(() => ({
  db: null as any
}));

vi.mock("../database", async () => {
  const Database = (await import("better-sqlite3")).default;
  mocks.db = new Database(":memory:");
  return { default: mocks.db };
});

import gamesRouter from "./games";

describe("Game Search API", () => {
  const app = express();

  app.use("/api", gamesRouter);

  beforeEach(() => {
    mocks.db.exec("DROP TABLE IF EXISTS games");

    mocks.db.exec(`
      CREATE TABLE games (
        game_id TEXT PRIMARY KEY,
        season INTEGER,
        week INTEGER,
        game_date TEXT,
        home_team TEXT,
        away_team TEXT
      )
    `);

    const insert = mocks.db.prepare(`
      INSERT INTO games
      (game_id, season, week, game_date, home_team, away_team)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    insert.run("1", 2026, 5, "2026-10-01", "KC", "BUF");
    insert.run("2", 2026, 6, "2026-10-08", "NO", "ATL");
    insert.run("3", 2025, 5, "2025-10-01", "DAL", "PHI");
  });

  it("searches games by team", async () => {
    const response = await request(app).get("/api/games?team=KC");
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
  });

  it("searches games by week", async () => {
    const response = await request(app).get("/api/games?week=5");
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
  });

  it("searches games by season", async () => {
    const response = await request(app).get("/api/games?season=2026");
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
  });

  it("searches games by game ID", async () => {
    const response = await request(app).get("/api/games?gameId=3");
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].game_id).toBe("3");
  });

  it("combines multiple search filters", async () => {
    const response = await request(app).get(
      "/api/games?team=KC&week=5&season=2026"
    );
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
  });

  it("returns an empty array when no games match", async () => {
    const response = await request(app).get("/api/games?team=MIA");
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(0);
  });

  it("rejects an invalid week", async () => {
    const response = await request(app).get("/api/games?week=abc");
    expect(response.status).toBe(400);
  });

  it("rejects a week of zero", async () => {
    const response = await request(app).get("/api/games?week=0");
    expect(response.status).toBe(400);
  });

  it("rejects a negative week", async () => {
    const response = await request(app).get("/api/games?week=-1");
    expect(response.status).toBe(400);
  });

  it("rejects an invalid season", async () => {
    const response = await request(app).get("/api/games?season=abc");
    expect(response.status).toBe(400);
  });

  it("rejects a season of zero", async () => {
    const response = await request(app).get("/api/games?season=0");
    expect(response.status).toBe(400);
  });

  it("searches for a team regardless of letter case", async () => {
    const response = await request(app).get("/api/games?team=kc");
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
  });
});

