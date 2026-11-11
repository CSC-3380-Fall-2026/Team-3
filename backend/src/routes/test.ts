import {Router} from "express";
import db from "../database";

const router = Router();

router.get("/test", (req, res) => {
    console.log("Test request received");

    res.status(200).json({
        message: "Backend is running",
    });
});

router.get("/teams", (req, res) => {
    const teams = db.prepare("SELECT * FROM teams").all();
    res.json(teams);
});


router.get("/teams/:teamAbbr/games", (req, res) => {
  const { teamAbbr } = req.params;

  const games = db.prepare(`
    SELECT
      game_id,
      game_date,
      home_team,
      away_team,
      home_score,
      away_score
    FROM games
    WHERE (home_team = ? OR away_team = ?)
      AND game_status = 'final'
      AND home_score IS NOT NULL
      AND away_score IS NOT NULL
    ORDER BY game_date DESC
    LIMIT 3
  `).all(teamAbbr, teamAbbr);

  res.json(games);
});

router.get("/players/search", (req, res) => {
    const name = String(req.query.name || "").trim();

    if (!name) {
        return res.status(400).json({
            error: "Player name is required",
        });
    }

    const players = db
        .prepare(`
            SELECT player_id, player_name, position, team_abbr
            FROM players
            WHERE LOWER(player_name) LIKE LOWER(?)
            ORDER BY player_name
        `)
        .all(`%${name}%`);

    res.json(players);
});

router.get("/players/:playerId/stats", (req, res) => {
    const { playerId } = req.params;

    const player = db.prepare(`
        SELECT player_id, player_name, position, team_abbr
        FROM players
        WHERE player_id = ?
    `).get(playerId);

    if (!player) {
        return res.status(404).json({
            error: "Player not found"
        });
    }

    const stats = db.prepare(`
        SELECT
            ps.*,
            g.season,
            g.week,
            g.game_date
        FROM player_stats ps
        JOIN games g ON ps.game_id = g.game_id
        WHERE ps.player_id = ?
        ORDER BY g.season DESC, g.week DESC
    `).all(playerId);

    res.json({
        player,
        stats
    });
});

export default router;