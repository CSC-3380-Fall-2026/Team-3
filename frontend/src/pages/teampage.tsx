import { useState } from "react";
import { mockTeam } from "../data/profilemockdata";
// import "./profilepages.css";

const teamNames = [
  "Arizona Cardinals",
  "Atlanta Falcons",
  "Baltimore Ravens",
  "Buffalo Bills",
  "Carolina Panthers",
  "Chicago Bears",
  "Cincinnati Bengals",
  "Cleveland Browns",
  "Dallas Cowboys",
  "Denver Broncos",
  "Detroit Lions",
  "Green Bay Packers",
  "Houston Texans",
  "Indianapolis Colts",
  "Jacksonville Jaguars",
  "Kansas City Chiefs",
  "Las Vegas Raiders",
  "Los Angeles Chargers",
  "Los Angeles Rams",
  "Miami Dolphins",
  "Minnesota Vikings",
  "New England Patriots",
  "New Orleans Saints",
  "New York Giants",
  "New York Jets",
  "Philadelphia Eagles",
  "Pittsburgh Steelers",
  "San Francisco 49ers",
  "Seattle Seahawks",
  "Tampa Bay Buccaneers",
  "Tennessee Titans",
  "Washington Commanders",
];

function TeamPage() {
  const [search, setSearch] = useState("");
  const [selectedTeam, setSelectedTeam] = useState(mockTeam.name);
  const team = mockTeam;
  const player = team.featuredPlayer;
  const filteredTeams = teamNames.filter((name) =>
    name.toLowerCase().includes(search.trim().toLowerCase())
  );

  return (
    <main className="profile-page">
import { useEffect, useState } from "react";
import { getData } from "../api";
// import "./profilepages.css";

type Team = {
  team_abbr: string;
  team_name: string;
  team_conf: string | null;
  team_division: string | null;
};

type Game = {
  game_id: string;
  game_date: string;
  home_team: string;
  away_team: string;
  home_score: number;
  away_score: number;
};

type TeamPageProps = {
  teamAbbr?: string;
};

function TeamPage({ teamAbbr }: TeamPageProps) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [games, setGames] = useState<Game[]>([]);
  const [gamesLoading, setGamesLoading] = useState(true);
  const [gamesError, setGamesError] = useState("");

  useEffect(() => {
    getData<Team[]>("/teams")
      .then((data) => {
        setTeams(data);
      })
      .catch(() => {
        setError("Unable to load team information.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

useEffect(() => {
  const selectedTeam = teamAbbr || teams.find(
    (team) => team.team_abbr !== "TEST"
  )?.team_abbr;

  if (!selectedTeam) {
    return;
  }

  setGamesLoading(true);
  setGamesError("");

  getData<Game[]>(`/teams/${selectedTeam}/games`)
    .then((data) => {
      setGames(data);
    })
    .catch(() => {
      setGamesError("Unable to load recent games.");
    })
    .finally(() => {
      setGamesLoading(false);
    });
}, [teamAbbr, teams]);


  if (loading) {
    return <p>Loading teams...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (teams.length === 0) {
    return <p>No teams found.</p>;
  }

const team = teamAbbr
  ? teams.find((team) => team.team_abbr === teamAbbr)
  : teams.find((team) => team.team_abbr !== "TEST");

if (!team) {
  return <p>Team not found.</p>;
}
    return (
    <main className="profile-page">
      <header className="profile-header">
        <div className="profile-avatar team-avatar">
          {team.team_abbr}
        </div>
        <div>
          <p className="profile-label">TEAM PROFILE</p>
          <h1>{team.team_name}</h1>
          <p>
            {team.team_conf || "Conference unavailable"} ·{" "}
            {team.team_division || "Division unavailable"}
          </p>
        </div>
      </header>

      <section className="profile-section">
        <h2>Find a Team</h2>
        <label htmlFor="team-search">Search NFL teams</label>
        <input
          id="team-search"
          type="search"
          placeholder="Enter a team name..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <div className="stats-grid">
          {filteredTeams.map((name) => (
            <button
              key={name}
              type="button"
              className="stat-card"
              aria-pressed={selectedTeam === name}
              onClick={() => setSelectedTeam(name)}
            >
              {name}
            </button>
          ))}
        </div>
        {filteredTeams.length === 0 && (
          <p className="placeholder-text">No teams found.</p>
        )}
      </section>
      {selectedTeam === team.name ? (
        <>
          <header className="profile-header">
            <div className="profile-avatar team-avatar">
              {team.abbreviation}
            </div>
            <div>
              <p className="profile-label">TEAM PROFILE</p>
              <h1>{team.name}</h1>
              <p>
                {team.conference} · {team.division}
              </p>
              <p className="stadium-name">{team.stadium}</p>
            </div>
          </header>
          <section className="profile-section">
            <h2>Team Overview</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <p>Wins</p>
                <h3>{team.record.wins}</h3>
              </div>
              <div className="stat-card">
                <p>Losses</p>
                <h3>{team.record.losses}</h3>
              </div>
              <div className="stat-card">
                <p>Games Played</p>
                <h3>{team.record.wins + team.record.losses}</h3>
              </div>
              <div className="stat-card">
                <p>Win Percentage</p>
                <h3>
                  {(
                    (team.record.wins /
                      (team.record.wins + team.record.losses)) *
                    100
                  ).toFixed(1)}
                  %
                </h3>
              </div>
            </div>
          </section>
          <section className="profile-section">
            <h2>Featured Player</h2>
            <div className="profile-header">
              <div className="profile-avatar">{player.number}</div>
              <div>
                <p className="profile-label">{player.position}</p>
                <h2>{player.name}</h2>
                <p>{team.name}</p>
              </div>
            </div>
            <div className="stats-grid player-stats">
              <div className="stat-card">
                <p>Rushing Yards</p>
                <h3>{player.stats.rushingYards.toLocaleString()}</h3>
              </div>
              <div className="stat-card">
                <p>Rushing TDs</p>
                <h3>{player.stats.rushingTouchdowns}</h3>
              </div>
              <div className="stat-card">
                <p>Receptions</p>
                <h3>{player.stats.receptions}</h3>
              </div>
              <div className="stat-card">
                <p>Receiving Yards</p>
                <h3>{player.stats.receivingYards}</h3>
              </div>
            </div>
          </section>
          <section className="profile-section">
            <h2>Recent Games</h2>
            <div className="profile-table-wrapper">
              <table className="profile-table">
                <thead>
                  <tr>
                    <th>Opponent</th>
                    <th>Result</th>
                    <th>Score</th>
                  </tr>
                </thead>
                <tbody>
                  {team.recentGames.map((game) => (
                    <tr key={game.opponent}>
                      <td>{game.opponent}</td>
                      <td>
                        <span
                          className={
                            game.result === "W" ? "win-result" : "loss-result"
                          }
                        >
                          {game.result === "W" ? "Win" : "Loss"}
                        </span>
                      </td>
                      <td>{game.score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          <section className="profile-section">
            <h2>Team Analytics</h2>
            <p className="placeholder-text">
              Future feature: display team statistics, upcoming matchups,
              sportsbook odds, and historical betting trends.
            </p>
          </section>
        </>
      ) : (
        <section className="profile-section">
          <p className="profile-label">TEAM PROFILE</p>
          <h1>{selectedTeam}</h1>
          <p className="placeholder-text">
            Team stats, players, and games are not available for this team yet.
          </p>
        </section>
      )}
          <div className="stat-card">
            <p>Team</p>
            <h3>{team.team_name}</h3>
          </div>
          <div className="stat-card">
            <p>Abbreviation</p>
            <h3>{team.team_abbr}</h3>
          </div>
          <div className="stat-card">
            <p>Conference</p>
            <h3>{team.team_conf || "N/A"}</h3>
          </div>
          <div className="stat-card">
            <p>Division</p>
            <h3>{team.team_division || "N/A"}</h3>
          </div>
        </div>
      </section>

      <section className="profile-section">
  <h2>Featured Player</h2>
  <p className="placeholder-text">
    Featured player information is not available yet.
  </p>
</section>


<section className="profile-section">
  <h2>Recent Games</h2>

  {gamesLoading ? (
    <p>Loading recent games...</p>
  ) : gamesError ? (
    <p>{gamesError}</p>
  ) : games.length === 0 ? (
    <p className="placeholder-text">No recent games available.</p>
  ) : (
    <div className="stats-grid">
      {games.map((game) => {
        const isHome = game.home_team === team.team_abbr;
        const opponent = isHome ? game.away_team : game.home_team;
        const teamScore = isHome ? game.home_score : game.away_score;
        const opponentScore = isHome ? game.away_score : game.home_score;

        const result =
          teamScore > opponentScore
            ? "Win"
            : teamScore < opponentScore
              ? "Loss"
              : "Tie";

        return (
          <div className="stat-card" key={game.game_id}>
            <p>vs. {opponent}</p>
            <h3>{result}</h3>
            <p>{teamScore} - {opponentScore}</p>
            <p>{game.game_date.slice(0, 10)}</p>
          </div>
        );
      })}
    </div>
  )}
</section>


<section className="profile-section">
  <h2>Team Analytics</h2>
  <p className="placeholder-text">
    Future feature: display team statistics, upcoming matchups,
    sportsbook odds, and historical betting trends.
  </p>
</section>
    </main>
  );
}

export default TeamPage;