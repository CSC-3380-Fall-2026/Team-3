import {Router} from "express";
import db from "../database";

const router = Router();
router.get("/historical-situations", (req, res) => {
    const {playerId, stat, quarter, currentValue, line} = req.query;

    if (
        typeof playerId !== "string" ||
        typeof stat !== "string" ||
        typeof quarter !== "string" ||
        typeof currentValue !== "string"
    ) {
        return res.status(400).json({
            error: "playerId, stat, quarter, and currentValue are required"
        });
    }
    const quarterNumber = Number(quarter);
    const currentStatValue = Number(currentValue);
    const lineNumber = line === undefined ? null:Number(line);
    if (!Number.isInteger(quarterNumber) || quarterNumber < 1 || quarterNumber > 4) {
        return res.status(400).json({
            error: "Quarter has to be 1-4"
        });
    }
    if (!Number.isFinite(currentStatValue)) {
        return res.status(400).json({
            error: "currentValue must be a number"
        });
    }
    if (line !== undefined &&(
        typeof line !== "string" ||
        line.trim() === ""||
        !Number.isFinite(lineNumber)
    )){return res.status(400).json(
        {error: "line has to be a number"
    });}

    const allowedStats = [
        "passing_yards",
        "receiving_yards",
        "rushing_yards"
    ];

    if (!allowedStats.includes(stat)) {
        return res.status(400).json({
            error: "stat must be passing_yards, rushing_yards, or receiving_yards"
        });
    }

    const playerColumnByStat: Record<string, string> = {
        passing_yards: "passer_player_id",
        receiving_yards: "receiver_player_id",
        rushing_yards: "rusher_player_id"
    };

    const playerColumn = playerColumnByStat[stat];
    const tolerance = 15;

    try {
        const sql = `
            SELECT p.game_id,
                   g.season,
                   g.week,
                   g.game_date,
                   g.home_team,
                   g.away_team,
                   SUM(p.${stat}) AS value_at_point,
                   ps.${stat}     AS final_value
            FROM plays p
                     JOIN games g
                          ON g.game_id = p.game_id
                     JOIN player_stats ps
                          ON ps.game_id = p.game_id
                              AND ps.player_id = ?
            WHERE p.${playerColumn} = ?
              AND p.qtr <= ?
              AND ps.${stat} IS NOT NULL
            GROUP BY p.game_id,
                     g.season,
                     g.week,
                     g.game_date,
                     g.home_team,
                     g.away_team,
                     ps.${stat}
            HAVING ABS(SUM(p.${stat}) - ?) <= ?
            ORDER BY g.season DESC, g.week DESC
        `;
        const matches = db.prepare(sql).all(
            playerId,
            playerId,
            quarterNumber,
            currentStatValue,
            tolerance,
        );

        const typedMatches = matches as { final_value: number | null }[];
        const sampleSize = typedMatches.length;

        const averageFinalValue =
            sampleSize === 0
                ? null
                : typedMatches.reduce(
                (sum, match) => sum + Number(match.final_value ?? 0),
                0
            ) / sampleSize;

            const overCount = lineNumber === null
            ? null
            :typedMatches.filter(match => match.final_value !== null && match.final_value>lineNumber).length;
            const underCount = lineNumber === null
            ? null
            :typedMatches.filter(match => match.final_value !== null && match.final_value<lineNumber).length;
            const pushCount = lineNumber === null
            ? null
            :typedMatches.filter(match => match.final_value !== null && match.final_value===lineNumber).length;
        
        const overPercentage =  overCount === null || sampleSize === 0
        ? null
        :(overCount/sampleSize)*100;
        
        const underPercentage =  underCount === null || sampleSize === 0
        ? null
        :(underCount/sampleSize)*100;

        const pushPercentage =  pushCount === null || sampleSize === 0
        ? null
        :(pushCount/sampleSize)*100;

            return res.status(200).json({
            playerId,
            stat,
            quarter: quarterNumber,
            currentValue: currentStatValue,
            tolerance,
            sampleSize,
            averageFinalValue,
            overCount,
            underCount,
            pushCount,
            overPercentage,
            underPercentage,
            pushPercentage,
            line: lineNumber,
            matches
        });
    } catch (error) {
        console.error("Failed to match historical situations:", error);
        return res.status(500).json({
            error: "Failed to match historical situations"
        });
    }
});
export default router;
