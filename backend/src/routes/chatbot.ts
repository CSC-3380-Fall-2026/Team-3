import { Router } from "express";
import db from "../database";

const router = Router();

type Team = {
  team_abbr: string;
  team_name: string;
  team_conf: string;
  team_division: string;
};

type Player = {
  player_id: string;
  player_name: string;
  position: string;
  team_abbr: string;
};

type Game = {
  game_id: string;
  season: number;
  week: number;
  game_date: string;
  home_team: string;
  away_team: string;
  home_score: number | null;
  away_score: number | null;
  game_status: string;
};

type PlayerStat = {
  player_name: string;
  position: string;
  team_abbr: string;
  passing_yards: number | null;
  passing_tds: number | null;
  passing_interceptions: number | null;
  rushing_yards: number | null;
  rushing_tds: number | null;
  receptions: number | null;
  receiving_yards: number | null;
  receiving_tds: number | null;
  fumbles_lost: number | null;
  season: number;
  week: number;
  game_date: string;
  home_team: string;
  away_team: string;
};

type StatTotals = {
  passing_yards: number | null;
  passing_tds: number | null;
  passing_interceptions: number | null;
  rushing_yards: number | null;
  rushing_tds: number | null;
  receptions: number | null;
  receiving_yards: number | null;
  receiving_tds: number | null;
  fumbles_lost: number | null;
};

function formatStat(label: string, value: number | null): string {
  return `${label}: ${value === null ? "Not recorded" : value}`;
}

function getTotals(stats: PlayerStat[]): StatTotals {
  const fields: (keyof StatTotals)[] = [
    "passing_yards",
    "passing_tds",
    "passing_interceptions",
    "rushing_yards",
    "rushing_tds",
    "receptions",
    "receiving_yards",
    "receiving_tds",
    "fumbles_lost"
  ];

  const totals = {} as StatTotals;

  for (const field of fields) {
    const values = stats
      .map((stat) => stat[field])
      .filter((value): value is number => value !== null);

    totals[field] = values.length
      ? values.reduce((sum, value) => sum + value, 0)
      : null;
  }

  return totals;
}

function formatPlayerStats(totals: StatTotals): string {
  return [
    formatStat("Passing yards", totals.passing_yards),
    formatStat("Passing touchdowns", totals.passing_tds),
    formatStat("Interceptions", totals.passing_interceptions),
    formatStat("Rushing yards", totals.rushing_yards),
    formatStat("Rushing touchdowns", totals.rushing_tds),
    formatStat("Receptions", totals.receptions),
    formatStat("Receiving yards", totals.receiving_yards),
    formatStat("Receiving touchdowns", totals.receiving_tds),
    formatStat("Fumbles lost", totals.fumbles_lost)
  ].join("\n");
}

function formatGame(game: Game): string {
  const hasScore =
    game.home_score !== null && game.away_score !== null;

  let result = `${game.away_team} vs ${game.home_team}`;

  if (hasScore) {
    result += ` | ${game.away_team} ${game.away_score} - ${game.home_team} ${game.home_score}`;

    if (game.home_score > game.away_score) {
      result += ` | Winner: ${game.home_team}`;
    } else if (game.away_score > game.home_score) {
      result += ` | Winner: ${game.away_team}`;
    } else {
      result += " | Result: Tie";
    }
  } else {
    result += " | Score unavailable";
  }

  result += ` | Season ${game.season}, Week ${game.week}`;
  result += ` | ${game.game_date}`;
  result += ` | Status: ${game.game_status}`;

  return result;
}

router.post("/chatbot", (req, res) => {
  const message =
    typeof req.body?.message === "string"
      ? req.body.message.trim()
      : "";

  if (!message) {
    return res.status(400).json({
      error: "A question is required."
    });
  }

  if (message.length > 1000) {
    return res.status(400).json({
      error: "Question must be 1000 characters or fewer."
    });
  }

  try {
    const question = message.toLowerCase();

    if (
      /\b(bet|betting|gambling|wager|sportsbook|odds|player props)\b/i.test(question)
    ) {
      return res.json({
        answer:
          "I can help with factual NFL information, including player statistics, teams, games, and historical results!",
        sources: ["SmartBet NFL information"]
      });
    }

    const requestedSeason = Number(
      question.match(/\b(20\d{2})\b/)?.[1]
    ) || null;

    const weekMatch = question.match(/\b(?:week|wk)\s*(\d{1,2})\b/);
    const requestedWeek = weekMatch
      ? Number(weekMatch[1])
      : null;

    const isCareer =
      /\b(career|all[- ]time|career totals)\b/i.test(question);

    const wantsSeasonTotals =
      isCareer ||
      /\b(season|seasonal|total|totals|year)\b/i.test(question) ||
      requestedSeason !== null;

    const teams = db.prepare(`
      SELECT team_abbr, team_name, team_conf, team_division
      FROM teams
    `).all() as Team[];

    const matchedTeams = teams.filter((team) => {
      return (
        question.includes(team.team_name.toLowerCase()) ||
        new RegExp(`\\b${team.team_abbr}\\b`, "i").test(question)
      );
    });

    const players = db.prepare(`
      SELECT player_id, player_name, position, team_abbr
      FROM players
    `).all() as Player[];

    const matchedPlayers = players.filter((player) => {
      return question.includes(player.player_name.toLowerCase());
    });

    if (matchedPlayers.length > 1) {
      return res.json({
        answer:
          "I found multiple players mentioned in your question. Please ask about one player at a time and include their full name.",
        sources: ["SmartBet SQLite database"]
      });
    }

    if (matchedPlayers.length === 1) {
      const player = matchedPlayers[0];

      const allStats = db.prepare(`
        SELECT
          p.player_name,
          p.position,
          ps.team_abbr,
          ps.passing_yards,
          ps.passing_tds,
          ps.passing_interceptions,
          ps.rushing_yards,
          ps.rushing_tds,
          ps.receptions,
          ps.receiving_yards,
          ps.receiving_tds,
          ps.fumbles_lost,
          g.season,
          g.week,
          g.game_date,
          g.home_team,
          g.away_team
        FROM player_stats ps
        JOIN players p ON p.player_id = ps.player_id
        JOIN games g ON g.game_id = ps.game_id
        WHERE ps.player_id = ?
        ORDER BY g.game_date DESC
      `).all(player.player_id) as PlayerStat[];

      if (
        /\b(position|who is|what team|which team)\b/i.test(question)
      ) {
        return res.json({
          answer:
            `${player.player_name} is listed as a ${player.position} for ${player.team_abbr}.`,
          sources: ["SmartBet SQLite database"]
        });
      }

      if (allStats.length === 0) {
        return res.json({
          answer:
            `I found ${player.player_name} in the player database, but there are no recorded game statistics available for this player.`,
          sources: ["SmartBet SQLite database"]
        });
      }

      let selectedStats = allStats;

      if (requestedSeason !== null) {
        selectedStats = selectedStats.filter(
          (stat) => stat.season === requestedSeason
        );
      } else if (wantsSeasonTotals && !isCareer) {
        const latestSeason = Math.max(
          ...selectedStats.map((stat) => stat.season)
        );

        selectedStats = selectedStats.filter(
          (stat) => stat.season === latestSeason
        );
      }

      if (requestedWeek !== null) {
        selectedStats = selectedStats.filter(
          (stat) => stat.week === requestedWeek
        );
      }

      if (selectedStats.length === 0) {
        return res.json({
          answer:
            `I found ${player.player_name}, but there are no recorded statistics matching the requested season or week in the database.`,
          sources: ["SmartBet SQLite database"]
        });
      }

      const latest = selectedStats[0];

      let answer: string;

      if (wantsSeasonTotals || requestedWeek !== null) {
        const totals = getTotals(selectedStats);

        const period = isCareer
          ? "Career totals across recorded games"
          : requestedSeason !== null
            ? `Season ${requestedSeason} statistics`
            : requestedWeek !== null
              ? `Season ${latest.season}, Week ${requestedWeek} statistics`
              : `Season ${latest.season} statistics`;

        answer = [
          `${player.player_name} (${player.position}, ${player.team_abbr})`,
          period,
          `Games with recorded statistics: ${selectedStats.length}`,
          "",
          formatPlayerStats(totals)
        ].join("\n");
      } else {
        answer = [
          `${player.player_name} (${player.position}, ${player.team_abbr})`,
          "Most recent recorded game statistics",
          `Season ${latest.season}, Week ${latest.week}`,
          `Game: ${latest.away_team} vs ${latest.home_team}`,
          `Game date: ${latest.game_date}`,
          "",
          formatPlayerStats(latest)
        ].join("\n");
      }

      return res.json({
        answer,
        sources: ["SmartBet SQLite database"]
      });
    }

    if (matchedTeams.length > 0) {
      let games: Game[];

      if (matchedTeams.length >= 2) {
        const first = matchedTeams[0].team_abbr;
        const second = matchedTeams[1].team_abbr;

        games = db.prepare(`
          SELECT *
          FROM games
          WHERE (
            home_team = ? AND away_team = ?
          ) OR (
            home_team = ? AND away_team = ?
          )
          ORDER BY game_date DESC
        `).all(first, second, second, first) as Game[];
      } else {
        const abbreviation = matchedTeams[0].team_abbr;

        games = db.prepare(`
          SELECT *
          FROM games
          WHERE home_team = ? OR away_team = ?
          ORDER BY game_date DESC
        `).all(abbreviation, abbreviation) as Game[];
      }

      if (requestedSeason !== null) {
        games = games.filter(
          (game) => game.season === requestedSeason
        );
      }

      if (requestedWeek !== null) {
        games = games.filter(
          (game) => game.week === requestedWeek
        );
      }

      const teamInfo = matchedTeams
        .map((team) =>
          `${team.team_name} (${team.team_abbr}) - ${team.team_conf}, ${team.team_division}`
        )
        .join("\n");

      const gameInfo = games.length
        ? games.slice(0, 10).map(formatGame).join("\n")
        : "No matching game records were found in the database.";

      const heading = matchedTeams.length >= 2
        ? "Historical matchup results:"
        : "Recent recorded games:";

      return res.json({
        answer: `${teamInfo}\n\n${heading}\n${gameInfo}`,
        sources: ["SmartBet SQLite database"]
      });
    }

    return res.json({
      answer:
        "I couldn't identify a specific player or team in your question. Try asking about a player's full name, a team's name, a historical matchup, or a specific NFL season or week. I can only answer using information available in the database.",
      sources: ["SmartBet NFL information"]
    });

  } catch (error) {
    console.error("Chatbot error:", error);

    return res.status(500).json({
      error: "Unable to retrieve NFL information right now."
    });
  }
});

export default router;
