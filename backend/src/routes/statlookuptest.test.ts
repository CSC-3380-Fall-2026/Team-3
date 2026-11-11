import { describe, it, expect, vi } from "vitest";
import request from "supertest";

vi.mock("../database", async () => {
    const Database = (await import("better-sqlite3")).default;
    const db = new Database(":memory:");

    db.pragma("foreign_keys = ON");

    db.exec(`
        CREATE TABLE teams (
            team_abbr TEXT PRIMARY KEY NOT NULL,
            team_name TEXT NOT NULL,
            team_conf TEXT,
            team_division TEXT
        );

        CREATE TABLE players (
            player_id TEXT PRIMARY KEY NOT NULL,
            player_name TEXT NOT NULL,
            position TEXT,
            team_abbr TEXT,
            FOREIGN KEY (team_abbr) REFERENCES teams(team_abbr)
        );

        CREATE TABLE games (
            game_id TEXT PRIMARY KEY NOT NULL,
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

        CREATE TABLE player_stats (
            player_id TEXT NOT NULL,
            game_id TEXT NOT NULL,
            team_abbr TEXT,
            passing_yards REAL,
            passing_tds INTEGER,
            passing_interceptions INTEGER,
            rushing_yards REAL,
            rushing_tds INTEGER,
            receptions INTEGER,
            receiving_yards REAL,
            receiving_tds INTEGER,
            fumbles_lost INTEGER,
            PRIMARY KEY (player_id, game_id)
        );
    `);

    db.prepare(`
        INSERT INTO teams (team_abbr, team_name)
        VALUES (?, ?)
    `).run("KC", "Kansas City Chiefs");

    db.prepare(`
        INSERT INTO players (player_id, player_name, position, team_abbr)
        VALUES (?, ?, ?, ?)
    `).run("player1", "Patrick Mahomes", "QB", "KC");

    db.prepare(`
        INSERT INTO players (player_id, player_name, position, team_abbr)
        VALUES (?, ?, ?, ?)
    `).run("player2", "Test Player", "QB", "KC");

    db.prepare(`
        INSERT INTO games (
            game_id, season, week, game_date, home_team, away_team
        )
        VALUES (?, ?, ?, ?, ?, ?)
    `).run("game1", 2026, 1, "2026-09-10", "KC", "BUF");

    db.prepare(`
        INSERT INTO player_stats (
            player_id, game_id, team_abbr,
            passing_yards, passing_tds, passing_interceptions
        )
        VALUES (?, ?, ?, ?, ?, ?)
    `).run("player1", "game1", "KC", 275, 3, 1);

    return { default: db };
});

import app from "../app";

describe("Player Stats Lookup", () => {
    it("finds a player by name", async () => {
        const response = await request(app)
            .get("/api/players/search")
            .query({ name: "Patrick" });

        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(1);
        expect(response.body[0].player_name).toBe("Patrick Mahomes");
        expect(response.body[0].player_id).toBe("player1");
    });

    it("returns a player's stored statistics", async () => {
        const response = await request(app)
            .get("/api/players/player1/stats");

        expect(response.status).toBe(200);
        expect(response.body.player.player_name).toBe("Patrick Mahomes");
        expect(response.body.stats).toHaveLength(1);
        expect(response.body.stats[0].passing_yards).toBe(275);
        expect(response.body.stats[0].passing_tds).toBe(3);
        expect(response.body.stats[0].season).toBe(2026);
        expect(response.body.stats[0].week).toBe(1);
    });

    it("returns an empty stats array for a player without statistics", async () => {
        const response = await request(app)
            .get("/api/players/player2/stats");

        expect(response.status).toBe(200);
        expect(response.body.player.player_name).toBe("Test Player");
        expect(response.body.stats).toEqual([]);
    });

    it("returns 404 when the player does not exist", async () => {
        const response = await request(app)
            .get("/api/players/unknown/stats");

        expect(response.status).toBe(404);
        expect(response.body.error).toBe("Player not found");
    });

    it("returns 400 when the player search name is missing", async () => {
        const response = await request(app)
            .get("/api/players/search");

        expect(response.status).toBe(400);
        expect(response.body.error).toBe("Player name is required");
    });
});
