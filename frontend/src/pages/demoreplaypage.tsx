import { useEffect, useState } from "react";
import { getData } from "../api";

type Game = {
  eventId: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: string | null;
  awayScore: string | null;
  status: string;
  isLive?: boolean;
};

type PlayerStat = {
  playerId: string;
  playerName: string;
  team: string;
  teamAbbr: string;
  statType: string;
  stats: Record<string, string | number | null>;
};

type Snapshot = {
  source: string;
  mode: string;
  capturedAt: string;
  game: Game;
  players: PlayerStat[];
};

type LivePlayersResponse = {
  eventId: string;
  players: PlayerStat[];
};

function DemoReplayPage() {
  const [game, setGame] = useState<Game | null>(null);
  const [players, setPlayers] = useState<PlayerStat[]>([]);
  const [mode, setMode] = useState<"LIVE" | "REPLAY / DEMO" | null>(null);
  const [capturedAt, setCapturedAt] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const games = await getData<Game[]>("/games/live");
        const liveGame = games.find((item) => item.isLive);

        if (liveGame) {
          try {
            const liveData = await getData<LivePlayersResponse>(
              `/games/${liveGame.eventId}/players`
            );

            if (liveData.players.length > 0) {
              setGame(liveGame);
              setPlayers(liveData.players);
              setMode("LIVE");
              return;
            }
          } catch {
            // Use the saved replay if live statistics are unavailable.
          }
        }

        const snapshot = await getData<Snapshot>("/demo/replay");

        setGame(snapshot.game);
        setPlayers(snapshot.players);
        setMode("REPLAY / DEMO");
        setCapturedAt(snapshot.capturedAt);
      } catch {
        setError("No live player statistics or saved replay data are available.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return <p>Loading NFL game data...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!game) {
    return <p>No game data available.</p>;
  }

  return (
    <div>
      <h2>NFL Game Statistics</h2>

      <h3>
        {mode === "LIVE"
          ? "LIVE ESPN DATA"
          : "REPLAY / DEMO DATA"}
      </h3>

      {mode === "REPLAY / DEMO" && (
        <p>
          Saved ESPN snapshot. This is not live data.
          Captured: {new Date(capturedAt).toLocaleString()}
        </p>
      )}

      <h3>
        {game.awayTeam} {game.awayScore} - {game.homeScore} {game.homeTeam}
      </h3>

      <p>Status: {game.status}</p>

      <h3>Player Statistics</h3>

      <table>
        <thead>
          <tr>
            <th>Player</th>
            <th>Team</th>
            <th>Category</th>
            <th>Statistics</th>
          </tr>
        </thead>

        <tbody>
          {players.map((player, index) => (
            <tr key={`${player.playerId}-${player.statType}-${index}`}>
              <td>{player.playerName}</td>
              <td>{player.teamAbbr}</td>
              <td>{player.statType}</td>
              <td>
                {Object.entries(player.stats)
                  .map(([label, value]) => `${label}: ${value ?? "N/A"}`)
                  .join(" | ")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DemoReplayPage;
