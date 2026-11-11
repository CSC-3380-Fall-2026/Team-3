import { useEffect, useState } from "react";
import { getData } from "../api";

interface ESPNGame {
  eventId: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: string | null;
  awayScore: string | null;
  status: string;
  gameClock: string;
  period: number;
  gameState: string;
  isLive: boolean;
  isOver: boolean;
}

interface ESPNPlayer {
  playerId?: string;
  playerName?: string;
  team?: string;
  teamAbbr?: string;
  statType: string;
  stats: Record<string, string | number | null>;
}

interface PlayerData {
  playerId: string;
  playerName: string;
  team: string;
  statCategories: Record<
    string,
    Record<string, string | number | null>
  >;
}

function PredictionResultsPage() {
  const [games, setGames] = useState<ESPNGame[]>([]);
  const [selectedGameId, setSelectedGameId] = useState("");
  const [players, setPlayers] = useState<ESPNPlayer[]>([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState("");
  const [loadingGames, setLoadingGames] = useState(true);
  const [loadingPlayers, setLoadingPlayers] = useState(false);
  const [gameError, setGameError] = useState("");
  const [playerError, setPlayerError] = useState("");

useEffect(() => {
  let cancelled = false;
  const loadGames = async () => {
    try {
      const data = await getData<ESPNGame[]>("/games/live");
      if (cancelled) return;

      setGames(data);

      setSelectedGameId((current) =>
        data.some((game) => game.eventId === current)
          ? current
          : data[0]?.eventId ?? ""
      );

      setGameError("");
    } catch {
      if (!cancelled) {
        setGameError("Unable to retrieve NFL games from ESPN.");
      }
    } finally {
      if (!cancelled) {
        setLoadingGames(false);
      }
    }
  };

  loadGames();

  const interval = setInterval(loadGames, 30000);

  return () => {
    cancelled = true;
    clearInterval(interval);
  };
}, []);
  
 useEffect(() => {
  if (!selectedGameId) return;

  let cancelled = false;

  setPlayers([]);
  setSelectedPlayerId("");
  setPlayerError("");
  setLoadingPlayers(true);

  const loadPlayers = async () => {
    try {
      const data = await getData<{
        eventId: string;
        players: ESPNPlayer[];
      }>(`/games/${selectedGameId}/players`);

      if (cancelled) return;

      setPlayers(data.players);
      setPlayerError("");
    } catch (error) {
      if (cancelled) return;

      if (error instanceof Error && error.message.includes("404")) {
        setPlayerError(
          "Player statistics are not available for this game yet."
        );
      } else {
        setPlayerError(
          "Unable to retrieve player statistics from ESPN."
        );
      }
    } finally {
      if (!cancelled) {
        setLoadingPlayers(false);
      }
    }
  };

  loadPlayers();

  const interval = setInterval(loadPlayers, 30000);

  return () => {
    cancelled = true;
    clearInterval(interval);
  };
}, [selectedGameId]);
  const selectedGame = games.find(
    (game) => game.eventId === selectedGameId
  );

  const selectedPlayer = groupedPlayers.find(
    (player) => player.playerId === selectedPlayerId
  );

  return (
    <main>
      <h1>SmartBet Predictions</h1>

      <h2>Select an NFL Game</h2>

      {loadingGames && <p>Loading NFL games from ESPN...</p>}

      {gameError && <p>{gameError}</p>}

      {!loadingGames && !gameError && games.length === 0 && (
        <p>No NFL games are currently available from ESPN.</p>
      )}

      {games.length > 0 && (
        <select
          value={selectedGameId}
          onChange={(event) => setSelectedGameId(event.target.value)}
        >
          {games.map((game) => (
            <option key={game.eventId} value={game.eventId}>
              {game.awayTeam} vs. {game.homeTeam}
            </option>
          ))}
        </select>
      )}

      {selectedGame && (
        <section>
          <h2>
            {selectedGame.awayTeam} vs. {selectedGame.homeTeam}
          </h2>

          <h3>Game Information</h3>

          <p>
            Score: {selectedGame.awayTeam}{" "}
            {selectedGame.awayScore ?? "-"} -{" "}
            {selectedGame.homeScore ?? "-"}{" "}
            {selectedGame.homeTeam}
          </p>

          <p>Status: {selectedGame.status}</p>

          {selectedGame.isLive && (
            <>
              <p>Quarter: {selectedGame.period}</p>
              <p>Time Remaining: {selectedGame.gameClock}</p>
              <p>Game is currently live.</p>
            </>
          )}

          {selectedGame.gameState === "pre" && (
            <p>Game has not started yet.</p>
          )}

          {selectedGame.isOver && (
            <p>Game has ended.</p>
          )}
        </section>
      )}

      {selectedGame && (
        <section>
          <h2>Select a Player</h2>

          {loadingPlayers && (
            <p>Loading player statistics from ESPN...</p>
          )}

          {playerError && <p>{playerError}</p>}

          {!loadingPlayers && groupedPlayers.length > 0 && (
            <select
              value={selectedPlayerId}
              onChange={(event) =>
                setSelectedPlayerId(event.target.value)
              }
            >
              <option value="">Select a player</option>

              {groupedPlayers.map((player) => (
                <option
                  key={player.playerId}
                  value={player.playerId}
                >
                  {player.playerName} ({player.team})
                </option>
              ))}
            </select>
          )}

          {!loadingPlayers &&
            !playerError &&
            groupedPlayers.length === 0 &&
            !loadingPlayers && (
              <p>No player statistics are currently available.</p>
            )}
        </section>
      )}

      {selectedPlayer && (
        <section>
          <h2>{selectedPlayer.playerName}</h2>
          <p>Team: {selectedPlayer.team}</p>

          <h3>Actual Player Statistics</h3>

          {Object.entries(selectedPlayer.statCategories).map(
            ([category, stats]) => (
              <div key={category}>
                <h4>{category}</h4>

                <table>
                  <thead>
                    <tr>
                      <th>Statistic</th>
                      <th>Value</th>
                    </tr>
                  </thead>

                  <tbody>
                    {Object.entries(stats).map(([name, value]) => (
                      <tr key={name}>
                        <td>{name}</td>
                        <td>{value ?? "N/A"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </section>
      )}
    </main>
  );
}

export default PredictionResultsPage;
