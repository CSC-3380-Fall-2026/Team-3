import { Router } from "express";
import db from "../database";

const router = Router();

type Team = {
  team_abbr: string;
  team_name: string;
  team_conf: string | null;
  team_division: string | null;
};

type Player = {
  player_id: string;
  player_name: string;
  position: string | null;
  team_abbr: string | null;
};

type Game = {
  game_id: string;
  home_team: string;
  away_team: string;
  home_score: number | null;
  away_score: number | null;
  season: number;
  week: number;
  game_date: string;
  game_status: string;
};

type PlayerStat = {
  player_id: string;
  player_name: string;
  position: string | null;
  team_abbr: string | null;
  season: number;
  week: number;
  game_date: string;
  opponent: string | null;
  passing_yards: number | null;
  passing_tds: number | null;
  interceptions: number | null;
  rushing_yards: number | null;
  rushing_tds: number | null;
  receiving_yards: number | null;
  receiving_tds: number | null;
  receptions: number | null;
  fumbles: number | null;
};

const teamAliases: Record<string, string[]> = {
  ARI: ["cardinals", "arizona"],
  ATL: ["falcons", "atlanta"],
  BAL: ["ravens", "baltimore"],
  BUF: ["bills", "buffalo"],
  CAR: ["panthers", "carolina"],
  CHI: ["bears", "chicago"],
  CIN: ["bengals", "cincinnati"],
  CLE: ["browns", "cleveland"],
  DAL: ["cowboys", "dallas"],
  DEN: ["broncos", "denver"],
  DET: ["lions", "detroit"],
  GB: ["packers", "green bay"],
  HOU: ["texans", "houston"],
  IND: ["colts", "indianapolis"],
  JAX: ["jaguars", "jags", "jacksonville"],
  KC: ["chiefs", "kansas city"],
  LAC: ["chargers", "los angeles chargers"],
  LAR: ["rams", "los angeles rams"],
  LV: ["raiders", "las vegas"],
  MIA: ["dolphins", "miami"],
  MIN: ["vikings", "minnesota"],
  NE: ["patriots", "new england", "pats"],
  NO: ["saints", "new orleans"],
  NYG: ["giants", "new york giants"],
  NYJ: ["jets", "new york jets"],
  PHI: ["eagles", "philadelphia"],
  PIT: ["steelers", "pittsburgh"],
  SF: ["49ers", "niners", "san francisco"],
  SEA: ["seahawks", "seattle"],
  TB: ["buccaneers", "bucs", "tampa bay"],
  TEN: ["titans", "tennessee"],
  WAS: ["commanders", "washington"]
};

const statFields: (keyof PlayerStat)[] = [
  "passing_yards",
  "passing_tds",
  "interceptions",
  "rushing_yards",
  "rushing_tds",
  "receiving_yards",
  "receiving_tds",
  "receptions",
  "fumbles"
];

function includesPhrase(question: string, phrase: string): boolean {
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\b${escaped}\\b`, "i").test(question);
}

function formatStat(value: number | null): string {
  return value === null || value === undefined
    ? "Not recorded"
    : String(value);
}

function getTotals(stats: PlayerStat[]) {
  const totals: Record<string, number> = {};

  for (const field of statFields) {
    totals[field] = stats.reduce((total, stat) => {
      const value = stat[field];
      return total + (typeof value === "number" ? value : 0);
    }, 0);
  }

  return totals;
}

function formatPlayerStats(stat: PlayerStat): string {
  return [
    `Passing yards: ${formatStat(stat.passing_yards)}`,
    `Passing touchdowns: ${formatStat(stat.passing_tds)}`,
    `Interceptions: ${formatStat(stat.interceptions)}`,
    `Rushing yards: ${formatStat(stat.rushing_yards)}`,
    `Rushing touchdowns: ${formatStat(stat.rushing_tds)}`,
    `Receiving yards: ${formatStat(stat.receiving_yards)}`,
    `Receiving touchdowns: ${formatStat(stat.receiving_tds)}`,
    `Receptions: ${formatStat(stat.receptions)}`,
    `Fumbles: ${formatStat(stat.fumbles)}`
  ].join("\n");
}

function formatGame(game: Game): string {
  let result = `${game.away_team} vs ${game.home_team}`;

  if (game.home_score !== null && game.away_score !== null) {
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

function formatTeam(team: Team): string {
  return [
    `${team.team_name} (${team.team_abbr})`,
    team.team_conf ? `Conference: ${team.team_conf}` : "",
    team.team_division ? `Division: ${team.team_division}` : ""
  ].filter(Boolean).join("\n");
}

function isGamblingOrFantasyRequest(question: string): boolean {
  const patterns = [
    /\b(bet|betting|wager|wagering|sportsbook|odds|parlay)\b/i,
    /\b(start|sit)\b.*\b(over|instead of|or)\b/i,
    /\b(start|sit)\b.*\b(player|quarterback|running back|receiver|tight end)\b/i,
    /\bwho should i start\b/i,
    /\bwho should i sit\b/i,
    /\bstart or sit\b/i,
    /\bstart\/sit\b/i,
    /\bfantasy lineup\b/i,
    /\bmake a pick\b/i,
    /\bwho should i pick\b/i
  ];

  return patterns.some((pattern) => pattern.test(question));
}

router.post("/chatbot", (req, res) => {
  try {
    const message = req.body?.message;

    if (typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        error: "Please enter a question."
      });
    }

    if (message.length > 1000) {
      return res.status(400).json({
        error: "Your question must be 1000 characters or fewer."
      });
    }

    const question = message.toLowerCase().trim();

    if (isGamblingOrFantasyRequest(question)) {
      return res.json({
        answer:
          "I can't provide betting advice, wagering recommendations, or fantasy start/sit decisions. I can provide factual NFL information, such as a player's recorded statistics, team, or game results."
      });
    }

    const requestedSeason = question.match(/\b(20\d{2})\b/);
    const requestedWeek = question.match(/\bweek\s+(\d{1,2})\b/i);

    const teams = db.prepare("SELECT * FROM teams").all() as Team[];
    const players = db.prepare("SELECT * FROM players").all() as Player[];

    const matchedTeams = teams.filter((team) => {
      const fullName = team.team_name.toLowerCase();
      const abbreviation = team.team_abbr.toLowerCase();
      const aliases = teamAliases[team.team_abbr] || [];

      return (
        includesPhrase(question, fullName) ||
        includesPhrase(question, abbreviation) ||
        aliases.some((alias) => includesPhrase(question, alias))
      );
    });

    const matchedPlayers = players.filter((player) => {
      const name = player.player_name.trim();

      return name.length > 0 && includesPhrase(question, name.toLowerCase());
    });

    if (matchedPlayers.length > 1) {
      return res.json({
        answer:
          "I found multiple players in your question. Ask about one player at a time, and I can provide that player's profile and recorded statistics."
      });
    }

    if (matchedPlayers.length === 1) {
      const player = matchedPlayers[0];

      const allStats = db.prepare(`
        SELECT
          players.player_id,
          players.player_name,
          players.position,
          players.team_abbr,
          games.season,
          games.week,
          games.game_date,
          CASE
            WHEN games.home_team = players.team_abbr THEN games.away_team
            ELSE games.home_team
          END AS opponent,
          player_stats.passing_yards,
          player_stats.passing_tds,
          player_stats.interceptions,
          player_stats.rushing_yards,
          player_stats.rushing_tds,
          player_stats.receiving_yards,
          player_stats.receiving_tds,
          player_stats.receptions,
          player_stats.fumbles
        FROM player_stats
        JOIN players ON player_stats.player_id = players.player_id
        JOIN games ON player_stats.game_id = games.game_id
        WHERE players.player_id = ?
        ORDER BY games.game_date DESC
      `).all(player.player_id) as PlayerStat[];

      const team = teams.find(
        (item) => item.team_abbr === player.team_abbr
      );

      const profile = [
        `Player: ${player.player_name}`,
        `Position: ${player.position || "Not recorded"}`,
        `Team: ${team?.team_name || player.team_abbr || "Not recorded"}`
      ].join("\n");

      if (
        /\b(who is|who's|profile|what position|which position|what team|which team|roster)\b/i.test(question)
      ) {
        return res.json({
          answer: profile
        });
      }

      if (allStats.length === 0) {
        return res.json({
          answer:
            `${profile}\n\nNo player statistics for this player were found in the database.`
        });
      }

      let selectedStats = allStats;

      if (requestedSeason) {
        selectedStats = selectedStats.filter(
          (stat) => stat.season === Number(requestedSeason[1])
        );
      } else if (/\b(this season|current season|season totals)\b/i.test(question)) {
        const latestSeason = Math.max(
          ...allStats.map((stat) => stat.season)
        );

        selectedStats = selectedStats.filter(
          (stat) => stat.season === latestSeason
        );
      }

      if (requestedWeek) {
        selectedStats = selectedStats.filter(
          (stat) => stat.week === Number(requestedWeek[1])
        );
      }

      if (selectedStats.length === 0) {
        return res.json({
          answer:
            `${profile}\n\nNo recorded statistics matched the season or week you requested.`
        });
      }

      const wantsTotals =
        /\b(total|totals|overall|career|season|combined)\b/i.test(question);

      let answer = `${profile}\n\n`;

      if (wantsTotals) {
        const totals = getTotals(selectedStats);

        answer += `Recorded statistics across ${selectedStats.length} game records:\n`;
        answer += [
          `Passing yards: ${totals.passing_yards}`,
          `Passing touchdowns: ${totals.passing_tds}`,
          `Interceptions: ${totals.interceptions}`,
          `Rushing yards: ${totals.rushing_yards}`,
          `Rushing touchdowns: ${totals.rushing_tds}`,
          `Receiving yards: ${totals.receiving_yards}`,
          `Receiving touchdowns: ${totals.receiving_tds}`,
          `Receptions: ${totals.receptions}`,
          `Fumbles: ${totals.fumbles}`
        ].join("\n");
      } else {
        const stat = selectedStats[0];

        answer += `Most recent matching game:\n`;
        answer += `Season ${stat.season}, Week ${stat.week}`;
        answer += stat.opponent ? ` vs ${stat.opponent}` : "";
        answer += `\nDate: ${stat.game_date}\n`;
        answer += formatPlayerStats(stat);
        answer += `\n\nThis is a factual summary of the statistics recorded in the database.`;
      }

      return res.json({ answer });
    }

    if (matchedTeams.length > 0) {
      if (matchedTeams.length >= 2) {
        const firstTeam = matchedTeams[0];
        const secondTeam = matchedTeams[1];

        let games = db.prepare(`
          SELECT *
          FROM games
          WHERE
            (home_team = ? AND away_team = ?)
            OR
            (home_team = ? AND away_team = ?)
          ORDER BY game_date DESC
        `).all(
          firstTeam.team_abbr,
          secondTeam.team_abbr,
          secondTeam.team_abbr,
          firstTeam.team_abbr
        ) as Game[];

        if (requestedSeason) {
          games = games.filter(
            (game) => game.season === Number(requestedSeason[1])
          );
        }

        if (requestedWeek) {
          games = games.filter(
            (game) => game.week === Number(requestedWeek[1])
          );
        }

        if (games.length === 0) {
          return res.json({
            answer:
              `I found ${firstTeam.team_name} and ${secondTeam.team_name}, but no matching head-to-head game records were found for the requested season or week.`
          });
        }

        return res.json({
          answer:
            `Historical games: ${firstTeam.team_name} vs ${secondTeam.team_name}\n\n` +
            games.slice(0, 10).map(formatGame).join("\n\n")
        });
      }

      const team = matchedTeams[0];

      let games = db.prepare(`
        SELECT *
        FROM games
        WHERE home_team = ? OR away_team = ?
        ORDER BY game_date DESC
      `).all(team.team_abbr, team.team_abbr) as Game[];

      if (requestedSeason) {
        games = games.filter(
          (game) => game.season === Number(requestedSeason[1])
        );
      }

      if (requestedWeek) {
        games = games.filter(
          (game) => game.week === Number(requestedWeek[1])
        );
      }

      let answer = `${formatTeam(team)}\n`;

      if (games.length === 0) {
        answer +=
          "\nNo matching game records were found for the requested season or week.";
      } else {
        answer += `\nRecent recorded games (${Math.min(games.length, 10)} shown):\n\n`;
        answer += games.slice(0, 10).map(formatGame).join("\n\n");
      }

      return res.json({ answer });
    }

    return res.json({
      answer:
        "I couldn't identify a specific NFL team or player in that question. Try asking about a team by its full name or nickname, a player's full name, a game result, or recorded player statistics."
    });
  } catch (error) {
    console.error("Chatbot error:", error);

    return res.status(500).json({
      error: "The chatbot couldn't retrieve information from the database. Please try again."
    });
  }
});

export default router;
