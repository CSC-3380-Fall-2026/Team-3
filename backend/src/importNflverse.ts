import db from "./database";
import {createReadStream} from "fs";
import {parse} from "csv-parse";
import {resolve} from 'node:path';

const playerStatsPath = resolve(__dirname, "../../data/stats_player_week_2026.csv");
const playByPlayPath = resolve(__dirname, "../../data/play_by_play_2026.csv");

const parser = createReadStream(playerStatsPath)
    .pipe(parse({
        columns: true,
        skip_empty_lines: true
    }));

const parserGame = createReadStream(playByPlayPath)
    .pipe(parse({
        columns: true,
        skip_empty_lines: true
    }));

const parserPlays = createReadStream(playByPlayPath)
    .pipe(parse({
        columns: true,
        skip_empty_lines: true
    }));

const insertGame = db.prepare(`
    INSERT INTO games (game_id, season, week, game_type, game_date,
                       home_team, away_team, home_score, away_score, game_status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(game_id) DO
    UPDATE SET
        home_score = excluded.home_score,
        away_score = excluded.away_score,
        game_status = excluded.game_status
`);

const insertPlayer = db.prepare(`
    INSERT INTO players (player_id, player_name, position, team_abbr)
    VALUES (?, ?, ?, ?) ON CONFLICT(player_id) DO
    UPDATE SET
        player_name = excluded.player_name,
        position = excluded.position,
        team_abbr = excluded.team_abbr
`);

const insertPlay = db.prepare(`
    INSERT INTO plays(game_id, play_id, qtr, game_seconds_remaining, down, ydstogo, yardline_100, posteam,
                      score_differential, passer_player_id, receiver_player_id, rusher_player_id, passing_yards,
                      receiving_yards, rushing_yards, complete_pass)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(game_id,play_id) DO
    UPDATE SET
        qtr = excluded.qtr,
        game_seconds_remaining = excluded.game_seconds_remaining,
        down = excluded.down,
        ydstogo = excluded.ydstogo,
        yardline_100 = excluded.yardline_100,
        posteam = excluded.posteam,
        score_differential = excluded.score_differential,
        passer_player_id = excluded.passer_player_id,
        receiver_player_id = excluded.receiver_player_id,
        rusher_player_id = excluded.rusher_player_id,
        passing_yards = excluded.passing_yards,
        receiving_yards = excluded.receiving_yards,
        rushing_yards = excluded.rushing_yards,
        complete_pass = excluded.complete_pass
`)

const seenGames = new Set<string>();
const seenPlayers = new Set<string>();

async function importGamesFromPbp() {
    for await (const row of parserGame) {
        const gameID = row.game_id;

        if (seenGames.has(gameID)) {
            continue;
        }
        seenGames.add(gameID);
        insertGame.run(
            gameID,
            Number(row.season),
            Number(row.week),
            row.season_type,
            row.game_date,
            row.home_team,
            row.away_team,
            Number(row.home_score),
            Number(row.away_score),
            "final"
        );
    }

    console.log(`Imported ${seenGames.size} games`);
}

async function importPlayersFromWeekly() {
    for await (const row of parser) {
        const playerID = row.player_id;

        if (!seenPlayers.has(playerID)) {
            seenPlayers.add(playerID);

            insertPlayer.run(
                playerID,
                row.player_display_name,
                row.position,
                row.team
            );

        }
        insertPlayerStats.run(
            playerID,
            row.game_id,
            row.team,
            Number(row.passing_yards),
            Number(row.passing_tds),
            Number(row.passing_interceptions),
            Number(row.rushing_yards),
            Number(row.rushing_tds),
            Number(row.receptions),
            Number(row.receiving_yards),
            Number(row.receiving_tds),
            Number(row.fumbles_lost_total)
        );
    }
    console.log(`Imported ${seenPlayers.size} players`);
}

async function importPlaysFromPbp() {
    let playCount = 0;

    for await(const row of parserPlays) {
        insertPlay.run(
            row.game_id,
            Number(row.play_id),
            Number(row.qtr),
            Number(row.game_seconds_remaining),
            Number(row.down),
            Number(row.yardstogo),
            Number(row.yardline_100),
            row.posteam,
            Number(row.score_differential),
            row.passer_player_id,
            row.receiver_player_id,
            row.rusher_player_id,
            Number(row.passing_yards),
            Number(row.receiving_yards),
            Number(row.rushing_yards),
            Number(row.complete_pass)
        );
        playCount++;
    }
    console.log(`Imported ${playCount} plays`);
}

const insertPlayerStats = db.prepare(`
    INSERT INTO player_stats (player_id,
                              game_id,
                              team_abbr,
                              passing_yards,
                              passing_tds,
                              passing_interceptions,
                              rushing_yards,
                              rushing_tds,
                              receptions,
                              receiving_yards,
                              receiving_tds,
                              fumbles_lost)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(player_id, game_id)DO
    UPDATE SET
        team_abbr = excluded.team_abbr,
        passing_yards = excluded.passing_yards,
        passing_tds = excluded.passing_tds,
        passing_interceptions = excluded.passing_interceptions,
        rushing_yards = excluded.rushing_yards,
        rushing_tds = excluded.rushing_tds,
        receptions = excluded.receptions,
        receiving_yards = excluded.receiving_yards,
        receiving_tds = excluded.receiving_tds,
        fumbles_lost = excluded.fumbles_lost
`)

async function main() {
    await importGamesFromPbp();
    await importPlayersFromWeekly();
    await importPlaysFromPbp();
}

main();