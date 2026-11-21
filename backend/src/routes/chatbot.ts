import { Router } from "express";
import OpenAI from "openai";
import db from "../database";

const router = Router();

const STOP_WORDS = new Set([
  "what", "when", "where", "who", "which", "how",
  "did", "does", "was", "were", "the", "and", "for",
  "with", "from", "that", "this", "about", "tell",
  "show", "give", "has", "have", "had", "his", "her",
  "their", "they", "game", "games", "player", "players",
  "stats", "statistics", "season", "week"
]);

router.post("/chatbot", async (req, res) => {
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

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(503).json({
      error: "Chatbot is not configured. The server API key is missing."
    });
  }

  try {
    const question = message.toLowerCase();

    const teams = db.prepare(`
      SELECT team_abbr, team_name, team_conf, team_division
      FROM teams
    `).all() as {
      team_abbr: string;
      team_name: string;
      team_conf: string;
      team_division: string;
    }[];

    const matchedTeams = teams.filter((team) => {
      const fullName = team.team_name.toLowerCase();
      const abbreviation = team.team_abbr.toLowerCase();

      return (
        question.includes(fullName) ||
        new RegExp(`\\b${abbreviation}\\b`, "i").test(question)
      );
    });

    const terms = [
      ...new Set(
        question.match(/[a-z0-9']{3,}/g) ?? []
      )
    ]
      .filter((term) => !STOP_WORDS.has(term))
      .slice(0, 8);

    let matchedPlayers: {
      player_id: string;
      player_name: string;
      position: string;
      team_abbr: string;
    }[] = [];

    if (terms.length > 0) {
      const conditions = terms
        .map(() => "LOWER(player_name) LIKE ?")
        .join(" OR ");

      matchedPlayers = db.prepare(`
        SELECT player_id, player_name, position, team_abbr
        FROM players
        WHERE ${conditions}
        ORDER BY player_name
        LIMIT 12
      `).all(
        ...terms.map((term) => `%${term}%`)
      ) as typeof matchedPlayers;
    }

    let games: Record<string, unknown>[] = [];

    if (matchedTeams.length > 0) {
      const abbreviations = matchedTeams.map(
        (team) => team.team_abbr
      );

      const placeholders = abbreviations.map(
        () => "?"
      ).join(", ");

      games = db.prepare(`
        SELECT *
        FROM games
        WHERE home_team IN (${placeholders})
           OR away_team IN (${placeholders})
        ORDER BY game_date DESC
        LIMIT 15
      `).all(
        ...abbreviations,
        ...abbreviations
      ) as Record<string, unknown>[];
    } else if (matchedPlayers.length > 0) {
      const playerIds = matchedPlayers.map(
        (player) => player.player_id
      );

      const placeholders = playerIds.map(
        () => "?"
      ).join(", ");

      games = db.prepare(`
        SELECT DISTINCT g.*
        FROM games g
        JOIN player_stats ps ON ps.game_id = g.game_id
        WHERE ps.player_id IN (${placeholders})
        ORDER BY g.game_date DESC
        LIMIT 15
      `).all(...playerIds) as Record<string, unknown>[];
    } else {
      games = db.prepare(`
        SELECT *
        FROM games
        ORDER BY game_date DESC
        LIMIT 10
      `).all() as Record<string, unknown>[];
    }

    let playerStats: Record<string, unknown>[] = [];

    if (matchedPlayers.length > 0) {
      const playerIds = matchedPlayers.map(
        (player) => player.player_id
      );

      const placeholders = playerIds.map(
        () => "?"
      ).join(", ");

      playerStats = db.prepare(`
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
        WHERE ps.player_id IN (${placeholders})
        ORDER BY g.game_date DESC
        LIMIT 40
      `).all(...playerIds) as Record<string, unknown>[];
    }

    const context = {
      source: "SmartBet SQLite database",
      teams: matchedTeams,
      players: matchedPlayers,
      games,
      playerStats
    };

    const openai = new OpenAI({
      apiKey
    });

    const response = await openai.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-6.2-astra",
      instructions: `
You are the SmartBet NFL information assistant.

Answer factual questions about NFL teams, games, players,
historical results, and player statistics.

Use ONLY the database information supplied with the question.
Do not invent statistics, scores, players, game results, or dates.
If the supplied information does not answer the question,
clearly explain that the information is unavailable.

Distinguish between a missing statistic and a statistic of zero.
Do not treat missing values as zero.
Do not claim that a player participated in a game unless the
provided records support that conclusion.

Never provide gambling, betting, wagering, sportsbook,
odds, player prop, or betting prediction recommendations.
Politely explain that you can help with factual NFL information instead.

Keep answers clear, conversational, and concise.
      `,
      input: `
Question:
${message}

Database information:
${JSON.stringify(context)}
      `
    });

    return res.json({
      answer: response.output_text,
      sources: [
        "SmartBet SQLite database"
      ]
    });
  } catch (error) {
    console.error("Chatbot error:", error);

    return res.status(500).json({
      error: "Unable to generate an answer right now."
    });
  }
});

export default router;
