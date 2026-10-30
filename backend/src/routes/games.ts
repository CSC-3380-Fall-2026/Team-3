import { Router } from "express";
import db from "../database";

const router = Router();
router.get("/games", (req, res) => {
  const { team, week, season, gameId } = req.query;
  const conditions: string[] = [];
  const values: (string | number)[] = [];
  if (typeof gameId === "string" && gameId.trim() !== "") {
    conditions.push("game_id = ?");
    values.push(gameId.trim());
  }

  if (typeof team === "string" && team.trim() !== "") {
    const teamAbbr = team.trim().toUpperCase();
    conditions.push("(home_team = ? OR away_team = ?)");
    values.push(teamAbbr, teamAbbr);
  }

  if (typeof week === "string" && week.trim() !== "") {
    const weekNumber = Number(week);

    if (!Number.isInteger(weekNumber) || weekNumber < 1) {
      return res.status(400).json({
        error: "Week must be a positive integer"
      });
    }

    conditions.push("week = ?");
    values.push(weekNumber);
  }

  if (typeof season === "string" && season.trim() !== "") {
    const seasonYear = Number(season);

    if (!Number.isInteger(seasonYear) || seasonYear < 1) {
      return res.status(400).json({
        error: "Season must be a positive integer"
      });
    }

    conditions.push("season = ?");
    values.push(seasonYear);
  }

  const sql = `
    SELECT *
    FROM games
    ${conditions.length ? "WHERE " + conditions.join(" AND ") : ""}
    ORDER BY season DESC, week ASC, game_date ASC
  `;

  try {
    const games = db.prepare(sql).all(...values);
    return res.status(200).json(games);
  } catch (error) {
    console.error("Failed to search games:", error);
    return res.status(500).json({
      error: "Failed to retrieve games"
    });
  }
});

export default router;
