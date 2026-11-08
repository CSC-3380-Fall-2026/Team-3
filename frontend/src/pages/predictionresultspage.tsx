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
    getData<ESPNGame[]>("/games/live")
      .then((data) => {
        setGames(data);

        if (data.length > 0) {
          setSelectedGameId(data[0].eventId);
        }
      })
      .catch(() => {
        setGameError("Unable to retrieve NFL games from ESPN.");
      })
      .finally(() => {
        setLoadingGames(false);
      });
  }, []);

  useEffect(() => {
    if (!selectedGameId) return;

    setPlayers([]);
    setSelectedPlayerId("");
    setPlayerError("");
    setLoadingPlayers(true);

    getData<{ eventId: string; players: ESPNPlayer[] }>(
      `/games/${selectedGameId}/players`
    )
      .then((data) => {
        setPlayers(data.players);
      })
      .catch((error: Error) => {
        if (error.message.includes("404")) {
          setPlayerError(
            "Player statistics are not available for this game yet."
          );
        } else {
          setPlayerError(
            "Unable to retrieve player statistics from ESPN."
          );
        }
      })
      .finally(() => {
        setLoadingPlayers(false);
      });
  }, [selectedGameId]);

  const groupedPlayers = Object.values(
    players.reduce<Record<string, PlayerData>>((groups, player) => {
      if (!player.playerId || !player.playerName) {
        return groups;
      }

      if (!groups[player.playerId]) {
        groups[player.playerId] = {
          playerId: player.playerId,
          playerName: player.playerName,
          team: player.team ?? "Unknown",
          statCategories: {},
        };
      }

      groups[player.playerId].statCategories[player.statType] =
        player.stats;

      return groups;
    }, {})
  );

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
