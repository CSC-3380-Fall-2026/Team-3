import { describe, it, expect, vi, afterEach } from "vitest";
import request from "supertest";
import app from "../app";

describe("ESPN Live Data Integration", () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("returns live NFL games with valid team information", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn().mockResolvedValue({
                ok: true,
                json: async () => ({
                    events: [
                        {
                            id: "401000001",
                            status: {
                                type: {
                                    state: "in",
                                    description: "In Progress"
                                },
                                displayClock: "8:32",
                                period: 2
                            },
                            competitions: [
                                {
                                    competitors: [
                                        {
                                            homeAway: "home",
                                            team: {
                                                displayName: "Kansas City Chiefs"
                                            },
                                            score: "14"
                                        },
                                        {
                                            homeAway: "away",
                                            team: {
                                                displayName: "Buffalo Bills"
                                            },
                                            score: "10"
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                })
            })
        );

        const response = await request(app).get("/api/games/live");

        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(1);
        expect(response.body[0].eventId).toBe("401000001");
        expect(response.body[0].homeTeam).toBe("Kansas City Chiefs");
        expect(response.body[0].awayTeam).toBe("Buffalo Bills");
        expect(response.body[0].isLive).toBe(true);
        expect(response.body[0].homeScore).toBe("14");
    });

    it("returns an empty array when ESPN has no games", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn().mockResolvedValue({
                ok: true,
                json: async () => ({ events: [] })
            })
        );

        const response = await request(app).get("/api/games/live");

        expect(response.status).toBe(200);
        expect(response.body).toEqual([]);
    });

    it("returns 502 when ESPN is unavailable", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn().mockResolvedValue({
                ok: false
            })
        );

        const response = await request(app).get("/api/games/live");

        expect(response.status).toBe(502);
        expect(response.body.error).toBe("Failed to fetch ESPN games");
    });

    it("returns player information from ESPN", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn()
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({
                        header: {
                            competitions: [
                                {
                                    competitors: [
                                        {
                                            team: {
                                                id: "12",
                                                displayName: "Kansas City Chiefs",
                                                abbreviation: "KC"
                                            }
                                        },
                                        {
                                            team: {
                                                id: "2",
                                                displayName: "Buffalo Bills",
                                                abbreviation: "BUF"
                                            }
                                        }
                                    ]
                                }
                            ]
                        },
                        boxscore: {
                            players: []
                        }
                    })
                })
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({
                        athletes: [
                            {
                                items: [
                                    {
                                        id: "3139477",
                                        displayName: "Patrick Mahomes",
                                        position: {
                                            abbreviation: "QB"
                                        }
                                    }
                                ]
                            }
                        ]
                    })
                })
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({
                        athletes: []
                    })
                })
        );

        const response = await request(app)
            .get("/api/games/401000001/players");

        expect(response.status).toBe(200);
        expect(response.body.eventId).toBe("401000001");
        expect(response.body.teams).toHaveLength(2);
        expect(response.body.players.length).toBeGreaterThan(0);
        expect(
            response.body.players.some(
                (player: any) => player.playerName === "Patrick Mahomes"
            )
        ).toBe(true);
    });

    it("rejects invalid ESPN event IDs", async () => {
        const response = await request(app)
            .get("/api/games/not-a-number/players");

        expect(response.status).toBe(400);
        expect(response.body.error).toBe("Invalid ESPN event ID");
    });

    it("returns 502 when ESPN game details are unavailable", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn().mockResolvedValue({
                ok: false
            })
        );

        const response = await request(app)
            .get("/api/games/401000001/players");

        expect(response.status).toBe(502);
        expect(response.body.error).toBe(
            "Unable to retrieve game data from ESPN"
        );
    });
});
