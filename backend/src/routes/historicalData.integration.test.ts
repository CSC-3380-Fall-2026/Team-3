import { describe, it, expect, vi } from "vitest";
import request from "supertest";

vi.mock("../database", async () => {
    const Database = (await import("better-sqlite3")).default;
    const db = new Database(":memory:");

    db.exec(`
        CREATE TABLE games (
            game_id TEXT PRIMARY KEY,
            season INTEGER NOT NULL,
            week INTEGER NOT NULL,
            game_type TEXT,
            game_date TEXT,
            home_team TEXT NOT NULL,
            away_team TEXT NOT NULL,
            home_score INTEGER,
            away_score INTEGER,
            game_status TEXT
        );

        INSERT INTO games (
            game_id, season, week, game_date,
            home_team, away_team, home_score, away_score, game_status
        ) VALUES
        ('game1', 2026, 1, '2026-09-10', 'KC', 'BUF', 27, 20, 'Final'),
        ('game2', 2026, 2, '2026-09-17', 'KC', 'DEN', 24, 17, 'Final'),
        ('game3', 2025, 1, '2025-09-07', 'BUF', 'KC', 21, 28, 'Final');
    `);

    return { default: db };
});

import app from "../app";

describe("Historical Game Integration", () => {
    it("returns stored historical games", async () => {
        const response = await request(app).get("/api/games");

        expect(response.status).toBe(200);
        expect(response.body.length).toBe(3);
    });

    it("filters games by team", async () => {
        const response = await request(app)
            .get("/api/games")
            .query({ team: "KC" });

        expect(response.status).toBe(200);
        expect(response.body.length).toBe(3);

        expect(
            response.body.every(
                (game: any) =>
                    game.home_team === "KC" || game.away_team === "KC"
            )
        ).toBe(true);
    });

    it("filters games by season and week", async () => {
        const response = await request(app)
            .get("/api/games")
            .query({ season: "2026", week: "1" });

        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(1);
        expect(response.body[0].game_id).toBe("game1");
    });

    it("rejects invalid week values", async () => {
        const response = await request(app)
            .get("/api/games")
            .query({ week: "zero" });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe(
            "Week must be a positive integer"
        );
    });

    it("rejects invalid season values", async () => {
        const response = await request(app)
            .get("/api/games")
            .query({ season: "invalid" });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe(
            "Season must be a positive integer"
        );
    });
});
