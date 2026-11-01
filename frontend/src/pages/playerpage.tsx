
import { useEffect, useState } from "react";
import { getData } from "../api";

type Player = {
  player_id: string;
  player_name: string;
  position: string | null;
  team_abbr: string | null;
};

type PlayerStats = {
  player_id: string;
  game_id: string;
  team_abbr: string | null;
  passing_yards: number | null;
  passing_tds: number | null;
  passing_interceptions: number | null;
  rushing_yards: number | null;
  rushing_tds: number | null;
  receptions: number | null;
  receiving_yards: number | null;
  receiving_tds: number | null;
  fumbles_lost: number | null;
  season: number;
  week: number;
  game_date: string | null;
};

type PlayerProfileResponse = {
  player: Player;
  stats: PlayerStats[];
};

type PlayerPageProps = {
  playerName: string;
};

function PlayerPage({ playerName }: PlayerPageProps) {
  const [player, setPlayer] = useState<Player | null>(null);
  const [stats, setStats] = useState<PlayerStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadPlayer() {
      setLoading(true);
      setError("");
      setPlayer(null);
      setStats([]);

      try {
        const matches = await getData<Player[]>(
          `/players/search?name=${encodeURIComponent(playerName)}`
        );

        const selectedPlayer =
          matches.find(
            (p) => p.player_name.toLowerCase() === playerName.toLowerCase()
          ) || matches[0];

        if (!selectedPlayer) {
          throw new Error("Player not found in the database.");
        }

        const profile = await getData<PlayerProfileResponse>(
          `/players/${encodeURIComponent(selectedPlayer.player_id)}/stats`
        );

        if (active) {
          setPlayer(profile.player);
          setStats(profile.stats);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load player information."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadPlayer();

    return () => {
      active = false;
    };
  }, [playerName]);

  if (loading) {
    return <p role="status">Loading player profile...</p>;
  }

  if (error) {
    return <p role="alert">{error}</p>;
  }

  if (!player) {
    return <p>Player not found.</p>;
  }

  const total = (field: keyof PlayerStats) =>
    stats.reduce((sum, game) => sum + Number(game[field] || 0), 0);

  return (
    <main className="profile-page">
      <header className="profile-header">
        <div className="profile-avatar">
          {player.position || "NFL"}
        </div>
        <div>
          <p className="profile-label">PLAYER PROFILE</p>
          <h1>{player.player_name}</h1>
          <p>
            {player.team_abbr || "Team unavailable"} ·{" "}
            {player.position || "Position unavailable"}
          </p>
        </div>
      </header>

      <section className="profile-section">
        <h2>Stored Statistics</h2>
        {stats.length === 0 ? (
          <p>No stored game statistics are available for this player.</p>
        ) : (
          <div className="stats-grid">
            <div className="stat-card">
              <p>Passing Yards</p>
              <h3>{total("passing_yards").toLocaleString()}</h3>
            </div>
            <div className="stat-card">
              <p>Passing Touchdowns</p>
              <h3>{total("passing_tds")}</h3>
            </div>
            <div className="stat-card">
              <p>Interceptions</p>
              <h3>{total("passing_interceptions")}</h3>
            </div>
            <div className="stat-card">
              <p>Rushing Yards</p>
              <h3>{total("rushing_yards").toLocaleString()}</h3>
            </div>
            <div className="stat-card">
              <p>Receptions</p>
              <h3>{total("receptions")}</h3>
            </div>
            <div className="stat-card">
              <p>Receiving Yards</p>
              <h3>{total("receiving_yards").toLocaleString()}</h3>
            </div>
          </div>
        )}
      </section>

      <section className="profile-section">
        <h2>Game-by-Game Performance</h2>
        {stats.length === 0 ? (
          <p>No game history is available.</p>
        ) : (
          <div className="profile-table-wrapper">
            <table className="profile-table">
              <thead>
                <tr>
                  <th>Season</th>
                  <th>Week</th>
                  <th>Passing Yards</th>
                  <th>Passing TDs</th>
                  <th>Rushing Yards</th>
                  <th>Receiving Yards</th>
                </tr>
              </thead>
              <tbody>
                {stats.map((game) => (
                  <tr key={`${game.game_id}-${game.player_id}`}>
                    <td>{game.season}</td>
                    <td>{game.week}</td>
                    <td>{game.passing_yards ?? 0}</td>
                    <td>{game.passing_tds ?? 0}</td>
                    <td>{game.rushing_yards ?? 0}</td>
                    <td>{game.receiving_yards ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

export default PlayerPage;

