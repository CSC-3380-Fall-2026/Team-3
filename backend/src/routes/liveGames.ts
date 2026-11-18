
import { Router } from "express";

const router = Router();

const ESPN_URL =
  "https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard";

router.get("/games/live", async (_req, res) => {
  try {
    const response = await fetch(ESPN_URL);

    if (!response.ok) {
      return res.status(502).json({
        error: "Failed to fetch ESPN games",
      });
    }

    const data = await response.json();

    const games = (data.events ?? []).map((event: any) => {
      const competition = event.competitions?.[0];

      const home = competition?.competitors?.find(
        (team: any) => team.homeAway === "home"
      );

      const away = competition?.competitors?.find(
        (team: any) => team.homeAway === "away"
      );

      const state = event.status?.type?.state ?? "unknown";

      return {
        eventId: event.id,
        homeTeam: home?.team?.displayName ?? "Unknown",
        awayTeam: away?.team?.displayName ?? "Unknown",
        homeScore: home?.score ?? null,
        awayScore: away?.score ?? null,
        status: event.status?.type?.description ?? "Unknown",
        gameClock: event.status?.displayClock ?? "0:00",
        period: event.status?.period ?? 0,
        gameState: state,
        isLive: state === "in",
        isOver: state === "post",
      };
    });

    return res.json(games);
  } catch (error) {
    console.error("ESPN live games error:", error);

    return res.status(500).json({
      error: "Unable to retrieve NFL games",
    });
  }
});

export default router;
