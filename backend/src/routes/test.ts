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

export default router;