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
  <h2>Last 10 Games</h2>

  {gamesLoading ? (
    <p>Loading recent games...</p>
  ) : gamesError ? (
    <p>{gamesError}</p>
  ) : games.length === 0 ? (
    <p className="placeholder-text">No recent games available.</p>
  ) : (
    <div className="profile-table-wrapper">
      <table className="profile-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Opponent</th>
            <th>Result</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>


      
      {games.slice().sort((a,b)=> b.game_date.localeCompare(a.game_date)).slice(0,10).map((game) => {
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
          <tr key={game.game_id}>
            <td>{game.game_date.slice(0, 10)}</td>
            <td>{isHome ? "vs." : "@"} {opponent}</td>
            <td>{result}</td>
            <td>{teamScore} - {opponentScore}</td>

          </tr>
        );
      })}
      </tbody>
      </table>
    </div>
    
  )}
</section>

    </main>
  );
}

export default TeamPage;
