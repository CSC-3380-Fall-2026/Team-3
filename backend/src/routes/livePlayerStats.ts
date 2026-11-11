import { Router } from "express";
const router = Router();
const ESPN_BASE =
  "https://site.api.espn.com/apis/site/v2/sports/football/nfl";

router.get("/games/:eventId/players", async (req, res) => {
  const { eventId } = req.params;
  if (!/^\d+$/.test(eventId)) {
    return res.status(400).json({
      error: "Invalid ESPN event ID",
    });
  }

  try {
    const summaryResponse = await fetch(
      `${ESPN_BASE}/summary?event=${eventId}`
    );

    if (!summaryResponse.ok) {
      return res.status(502).json({
        error: "Unable to retrieve game data from ESPN",
      });
    }

    const data: any = await summaryResponse.json();
    const competitors =
      data.header?.competitions?.[0]?.competitors ?? [];
    const teams = competitors.map((competitor: any) => ({
      id: competitor.team?.id,
      name: competitor.team?.displayName ?? "Unknown",
      abbreviation: competitor.team?.abbreviation ?? "Unknown",
    }));

    const rosterResults = await Promise.all(
      teams.map(async (team: any) => {
        const teamId = team.id || team.abbreviation;
        try {
          const response = await fetch(
            `${ESPN_BASE}/teams/${encodeURIComponent(teamId)}/roster`
          );
          if (!response.ok) {
            return [];
          }
          const roster: any = await response.json();
          const groups = roster.athletes ?? [];
          const teamPlayers: any[] = [];
          for (const group of groups) {
            const athletes = Array.isArray(group.items)
              ? group.items
              : Array.isArray(group.athletes)
                ? group.athletes
                : group.id
                  ? [group]
                  : [];
            for (const athlete of athletes) {
              if (!athlete.id) continue;
              teamPlayers.push({
                playerId: String(athlete.id),
                playerName:
                  athlete.displayName ??
                  athlete.fullName ??
                  athlete.name ??
                  "Unknown",
                team: team.name,
                teamAbbr: team.abbreviation,
                position:
                  athlete.position?.abbreviation ??
                  athlete.position?.name ??
                  group.position?.abbreviation ??
                  group.position?.name ??
                  "Unknown",
                statType: "Player Info",
                stats: {
                  Position:
                    athlete.position?.abbreviation ??
                    athlete.position?.name ??
                    group.position?.abbreviation ??
                    group.position?.name ??
                    "Unknown",
                },
              });
            }
          }
          return teamPlayers;
        } catch {
          return [];
        }
      })
    );

    const players = rosterResults.flat();
    const boxscoreTeams = data.boxscore?.players ?? [];
    for (const team of boxscoreTeams) {
      for (const category of team.statistics ?? []) {
        const labels: string[] = category.labels ?? [];
        const statType = category.name ?? "unknown";
        for (const athlete of category.athletes ?? []) {
          const playerId = athlete.athlete?.id;
          if (!playerId) continue;
          const id = String(playerId);
          const existingPlayer = players.find(
            (player: any) => player.playerId === id
          );
          if (!existingPlayer) {
            players.push({
              playerId: id,
              playerName:
                athlete.athlete?.displayName ?? "Unknown",
              team:
                team.team?.displayName ?? "Unknown",
              teamAbbr:
                team.team?.abbreviation ?? "Unknown",
              position: "Unknown",
              statType: "Player Info",
              stats: {
                Position: "Unknown",
              },
            });
          }
          const stats: Record<
            string,
            string | number | null
          > = {};
          labels.forEach((label, index) => {
            stats[label] = athlete.stats?.[index] ?? null;
          });
          players.push({
            playerId: id,
            playerName:
              athlete.athlete?.displayName ?? "Unknown",
            team:
              team.team?.displayName ?? "Unknown",
            teamAbbr:
              team.team?.abbreviation ?? "Unknown",
            statType,
            stats,
          });
        }
      }
    }

    if (players.length === 0) {
      return res.status(404).json({
        error: "No player information is available for this game",
      });
    }

    return res.json({
      eventId,
      teams,
      players,
    });
  } catch (error) {
    console.error("ESPN player data error:", error);

    return res.status(500).json({
      error: "Unable to retrieve player information",
    });
  }
});

export default router;

