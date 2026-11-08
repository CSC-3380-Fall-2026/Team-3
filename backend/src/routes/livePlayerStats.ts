
import { Router } from "express";

const router = Router();

router.get("/games/:eventId/players", async (req, res) => {
  const { eventId } = req.params;

  if (!/^\d+$/.test(eventId)) {
    return res.status(400).json({ error: "Invalid ESPN event ID" });
  }

  try {
    const url =
      `https://site.api.espn.com/apis/site/v2/sports/football/nfl/summary?event=${eventId}`;

    const response = await fetch(url);

    if (!response.ok) {
      return res.status(502).json({
        error: "Unable to retrieve game data from ESPN",
      });
    }

    const data: any = await response.json();
    const teams = data.boxscore?.players ?? [];

    if (!teams.length) {
      return res.status(404).json({
        error: "No player statistics available for this game",
      });
    }

    const players: any[] = [];

    for (const team of teams) {
      for (const category of team.statistics ?? []) {
        const labels: string[] = category.labels ?? [];
        const statType = category.name ?? "unknown";

        for (const athlete of category.athletes ?? []) {
          const stats: Record<string, string | number> = {};

          labels.forEach((label, index) => {
            stats[label] = athlete.stats?.[index] ?? null;
          });

          players.push({
            playerId: athlete.athlete?.id,
            playerName: athlete.athlete?.displayName,
            team: team.team?.displayName,
            teamAbbr: team.team?.abbreviation,
            statType,
            stats,
          });
        }
      }
    }

    return res.json({
      eventId,
      players,
    });
  } catch (error) {
    console.error("ESPN player stats error:", error);

    return res.status(500).json({
      error: "Unable to retrieve player statistics",
    });
  }
});

export default router;
