
import db from "./database";

const ESPN_URL =
  "https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?dates=2026&limit=500";

// ESPN and our database use different abbreviations for some teams.
const teamAbbreviations: Record<string, string> = {
  LAR: "LA",
  WSH: "WAS",
};

function getTeamAbbr(abbr: string): string {
  return teamAbbreviations[abbr] || abbr;
}

async function importGames() {
  const response = await fetch(ESPN_URL);

  if (!response.ok) {
    throw new Error(`ESPN request failed: ${response.status}`);
  }

  const data = await response.json();

  const insertGame = db.prepare(`
    INSERT INTO games (
      game_id, season, week, game_type, game_date,
      home_team, away_team, home_score, away_score, game_status
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(game_id) DO UPDATE SET
      home_score = excluded.home_score,
      away_score = excluded.away_score,
      game_status = excluded.game_status
  `);

  let imported = 0;
  let skipped = 0;

  for (const event of data.events) {
    if (
  !event.status?.type?.completed ||
  ![2, 3].includes(event.season?.type)
) {
  skipped++;
  continue;
}

    const competition = event.competitions?.[0];
    const home = competition?.competitors?.find(
      (team: any) => team.homeAway === "home"
    );
    const away = competition?.competitors?.find(
      (team: any) => team.homeAway === "away"
    );

    if (!home || !away) {
      skipped++;
      continue;
    }

    const homeTeam = getTeamAbbr(home.team.abbreviation);
    const awayTeam = getTeamAbbr(away.team.abbreviation);

    if (
      ["AFC", "NFC"].includes(homeTeam) ||
      ["AFC", "NFC"].includes(awayTeam)
    ) {
      skipped++;
      continue;
    }

    const homeScore = Number(home.score);
    const awayScore = Number(away.score);

    if (!Number.isFinite(homeScore) || !Number.isFinite(awayScore)) {
      skipped++;
      continue;
    }

    insertGame.run(
      String(event.id),
      event.season.year,
      event.week.number,
      event.season.type,
      event.date,
      homeTeam,
      awayTeam,
      homeScore,
      awayScore,
      "final"
    );

    imported++;
  }

  console.log(`Imported or updated ${imported} games.`);
  console.log(`Skipped ${skipped} games.`);
}

importGames()
  .catch((error) => {
    console.error("Game import failed:", error);
    process.exitCode = 1;
  })
  .finally(() => {
    db.close();
  });
