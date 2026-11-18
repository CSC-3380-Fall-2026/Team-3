import { Router } from "express";
import fs from "fs/promises";
import path from "path";

const router = Router();

const SNAPSHOT_PATH = path.resolve(
  __dirname,
  "../../data/demo-snapshot.json"
);

const ESPN_SCOREBOARD =
  "https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard";

const ESPN_SUMMARY =
  "https://site.api.espn.com/apis/site/v2/sports/football/nfl/summary";

router.post("/demo/capture/:eventId", async (req, res) => {
  const { eventId } = req.params;

  if (!/^\d+$/.test(eventId)) {
    return res.status(400).json({ error: "Invalid ESPN event ID" });
  }

  try {
    const [scoreboardResponse, summaryResponse] = await Promise.all([
      fetch(ESPN_SCOREBOARD),
      fetch(`${ESPN_SUMMARY}?event=${eventId}`),
    ]);

    if (!scoreboardResponse.ok || !summaryResponse.ok) {
      return res.status(502).json({
        error: "Unable to retrieve snapshot data from ESPN",
      });
    }

    const scoreboard: any = await scoreboardResponse.json();
    const summary: any = await summaryResponse.json();

    const event = (scoreboard.events ?? []).find(
      (item: any) => item.id === eventId
    );

    if (!event) {
      return res.status(404).json({
        error: "Game not found in the ESPN scoreboard",
      });
    }

    const competition = event.competitions?.[0];

    const home = competition?.competitors?.find(
      (team: any) => team.homeAway === "home"
    );

    const away = competition?.competitors?.find(
      (team: any) => team.homeAway === "away"
    );

    const players: any[] = [];

    for (const team of summary.boxscore?.players ?? []) {
      for (const category of team.statistics ?? []) {
        const labels: string[] = category.labels ?? [];

        for (const athlete of category.athletes ?? []) {
          const stats: Record<string, string | number | null> = {};

          labels.forEach((label, index) => {
            stats[label] = athlete.stats?.[index] ?? null;
          });

          players.push({
            playerId: athlete.athlete?.id ?? null,
            playerName: athlete.athlete?.displayName ?? "Unknown",
            team: team.team?.displayName ?? "Unknown",
            teamAbbr: team.team?.abbreviation ?? "Unknown",
            statType: category.name ?? "unknown",
            stats,
          });
        }
      }
    }

    if (players.length === 0) {
      return res.status(404).json({
        error: "No player statistics available to capture",
      });
    }

    const snapshot = {
      source: "ESPN",
      mode: "REPLAY_DEMO",
      capturedAt: new Date().toISOString(),
      game: {
        eventId,
        homeTeam: home?.team?.displayName ?? "Unknown",
        awayTeam: away?.team?.displayName ?? "Unknown",
        homeScore: home?.score ?? null,
        awayScore: away?.score ?? null,
        status: event.status?.type?.description ?? "Unknown",
        gameState: event.status?.type?.state ?? "unknown",
        date: event.date ?? null,
      },
      players,
    };

    await fs.mkdir(path.dirname(SNAPSHOT_PATH), { recursive: true });

    await fs.writeFile(
      SNAPSHOT_PATH,
      JSON.stringify(snapshot, null, 2),
      "utf8"
    );

    return res.json({
      message: "Real ESPN snapshot captured successfully",
      snapshot,
    });
  } catch (error) {
    console.error("Demo snapshot capture error:", error);

    return res.status(500).json({
      error: "Unable to capture demo snapshot",
    });
  }
});

router.get("/demo/replay", async (_req, res) => {
  try {
    const contents = await fs.readFile(SNAPSHOT_PATH, "utf8");
    const snapshot = JSON.parse(contents);

    return res.json(snapshot);
  } catch (error: any) {
    if (error.code === "ENOENT") {
      return res.status(404).json({
        error: "No demo snapshot has been captured yet",
      });
    }

    return res.status(500).json({
      error: "Unable to load demo snapshot",
    });
  }
});

export default router;
