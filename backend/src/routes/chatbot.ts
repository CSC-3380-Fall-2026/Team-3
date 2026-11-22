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

function formatStat(label: string, value: number | null): string {
  return `${label}: ${value === null ? "Not recorded" : value}`;
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
          "I can help with factual NFL information, including real player statistics, teams, and historical game results. I don't provide gambling or betting recommendations.",
        sources: ["SmartBet NFL information"]
      });
    }

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
          "I found multiple matching players. Please include the player's full name so I can identify the correct record.",
        sources: ["SmartBet SQLite database"]
      });
    }

    if (matchedPlayers.length === 1) {
      const player = matchedPlayers[0];

      const stats = db.prepare(`
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
        LIMIT 10
      `).all(player.player_id) as PlayerStat[];

      if (
        question.includes("position") ||
        question.includes("who is") ||
        question.includes("what team")
      ) {
        return res.json({
          answer:
            `${player.player_name} is a ${player.position} for ${player.team_abbr}.`,
          sources: ["SmartBet SQLite database"]
        });
      }

      if (stats.length === 0) {
        return res.json({
          answer:
            `I found ${player.player_name} in the player database, but there are no recorded game statistics available for this player.`,
          sources: ["SmartBet SQLite database"]
        });
      }

      const latest = stats[0];

      const answer = [
        `${player.player_name} (${player.position}, ${player.team_abbr})`,
        `Season ${latest.season}, Week ${latest.week}`,
        `Game: ${latest.away_team} vs ${latest.home_team}`,
        "",
        formatStat("Passing yards", latest.passing_yards),
        formatStat("Passing touchdowns", latest.passing_tds),
        formatStat("Interceptions", latest.passing_interceptions),
        formatStat("Rushing yards", latest.rushing_yards),
        formatStat("Rushing touchdowns", latest.rushing_tds),
        formatStat("Receptions", latest.receptions),
        formatStat("Receiving yards", latest.receiving_yards),
        formatStat("Receiving touchdowns", latest.receiving_tds),
        formatStat("Fumbles lost", latest.fumbles_lost),
        "",
        `Game date: ${latest.game_date}`
      ].join("\n");

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
          LIMIT 10
        `).all(first, second, second, first) as Game[];
      } else {
        const abbreviation = matchedTeams[0].team_abbr;

        games = db.prepare(`
          SELECT *
          FROM games
          WHERE home_team = ? OR away_team = ?
          ORDER BY game_date DESC
          LIMIT 10
        `).all(abbreviation, abbreviation) as Game[];
      }

      const teamInfo = matchedTeams
        .map((team) =>
          `${team.team_name} (${team.team_abbr}) - ${team.team_conf}, ${team.team_division}`
        )
        .join("\n");

      const gameInfo = games.length
        ? games.map((game) => {
            if (
              game.home_score === null ||
              game.away_score === null
            ) {
              return `${game.away_team} vs ${game.home_team} - Score unavailable (${game.game_date})`;
            }

            return `${game.away_team} ${game.away_score} - ${game.home_team} ${game.home_score} (${game.game_date})`;
          }).join("\n")
        : "No game records were found.";

      return res.json({
        answer: `${teamInfo}\n\nRecent recorded games:\n${gameInfo}`,
        sources: ["SmartBet SQLite database"]
      });
    }

    return res.json({
      answer:
        "I couldn't identify a specific player or team in your question. Try asking about a player's full name, a team's name, or a historical NFL game.",
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
