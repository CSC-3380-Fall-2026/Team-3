import { mockTeam } from "../data/profilemockdata";
import "./profilepages.css";

function TeamPage() {
  const team = mockTeam;
  const player = team.featuredPlayer;
  return (
    <main className="profile-page">
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
    </main>
  );
}

export default TeamPage;
