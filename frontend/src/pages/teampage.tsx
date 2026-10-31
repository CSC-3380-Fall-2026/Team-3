import { useEffect, useState } from "react";
import { getData } from "../api";
// import "./profilepages.css";

type Team = {
  team_abbr: string;
  team_name: string;
  team_conf: string | null;
  team_division: string | null;
};

type TeamPageProps = {
  teamAbbr?: string;
};

function TeamPage({ teamAbbr }: TeamPageProps) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
        <h2>Team Overview</h2>
        <div className="stats-grid">
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
  <p className="placeholder-text">
    Recent game results are not available yet.
  </p>
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