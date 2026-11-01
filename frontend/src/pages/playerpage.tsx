import { mockPlayer } from "../data/profilemockdata";

type PlayerPageProps = {
  playerName: string;
};

function PlayerPage({ playerName }: PlayerPageProps) {
  const player = {
    ...mockPlayer,
    name: playerName,
  };

  return (
    <main className="profile-page">
      <header className="profile-header">
        <div className="profile-avatar">{player.number}</div>
        <div>
          <p className="profile-label">PLAYER PROFILE</p>
          <h1>{player.name}</h1>
          <p>
            Demo profile — statistics and team information are placeholder
            data and do not represent the selected player.
          </p>
          <p>
            {player.team} · {player.position}
          </p>
          <span className="profile-status">{player.status}</span>
        </div>
      </header>
      <section className="profile-section">
        <h2>Season Statistics</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <p>Passing Yards</p>
            <h3>{player.stats.passingYards.toLocaleString()}</h3>
          </div>
          <div className="stat-card">
            <p>Touchdowns</p>
            <h3>{player.stats.touchdowns}</h3>
          </div>
          <div className="stat-card">
            <p>Interceptions</p>
            <h3>{player.stats.interceptions}</h3>
          </div>
          <div className="stat-card">
            <p>Completion %</p>
            <h3>{player.stats.completionPercentage}%</h3>
          </div>
        </div>
      </section>
      <section className="profile-section">
        <h2>Recent Performance</h2>
        <div className="profile-table-wrapper">
          <table className="profile-table">
            <thead>
              <tr>
                <th>Opponent</th>
                <th>Passing Yards</th>
                <th>Touchdowns</th>
              </tr>
            </thead>
            <tbody>
              {player.recentGames.map((game) => (
                <tr key={game.opponent}>
                  <td>{game.opponent}</td>
                  <td>{game.passingYards}</td>
                  <td>{game.touchdowns}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="profile-section">
        <h2>Betting & Projections</h2>
        <p className="placeholder-text">
          Future feature: display player betting lines, projected statistics,
          historical trends, and estimated probabilities.
        </p>
      </section>
    </main>
  );
}

export default PlayerPage;
