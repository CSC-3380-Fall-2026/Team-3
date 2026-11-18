
import { useEffect, useState } from "react";
import { getData } from "./api";

type Player = {
  player_id: string;
  player_name: string;
  position: string;
  team_abbr: string;
};

type PlayerStats = {
  game_id: string;
  passing_yards: number | null;
  passing_tds: number | null;
  passing_interceptions: number | null;
  rushing_yards: number | null;
  rushing_tds: number | null;
  receptions: number | null;
  receiving_yards: number | null;
  receiving_tds: number | null;
  fumbles_lost: number | null;
};

type StatsResponse = {
  player: Player;
  stats: PlayerStats[];
};

type Scoring = "Standard" | "Half-PPR" | "Full-PPR";

type Ranking = {
  player: Player;
  games: number;
  total: number;
  average: number | null;
};

function calculateFantasyPoints(
  stats: PlayerStats,
  scoring: Scoring
): number {
  const ppr =
    scoring === "Full-PPR"
      ? 1
      : scoring === "Half-PPR"
      ? 0.5
      : 0;

  return (
    (stats.passing_yards ?? 0) / 25 +
    (stats.passing_tds ?? 0) * 4 -
    (stats.passing_interceptions ?? 0) * 2 +
    (stats.rushing_yards ?? 0) / 10 +
    (stats.rushing_tds ?? 0) * 6 +
    (stats.receiving_yards ?? 0) / 10 +
    (stats.receiving_tds ?? 0) * 6 +
    (stats.receptions ?? 0) * ppr -
    (stats.fumbles_lost ?? 0) * 2
  );
}

function StartSit() {
  const [search, setSearch] = useState("");
  const [scoring, setScoring] = useState<Scoring>("Full-PPR");
  const [searchResults, setSearchResults] = useState<Player[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [comparisonLoading, setComparisonLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [comparisonError, setComparisonError] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [activePlayer, setActivePlayer] = useState<string | null>(null);

  useEffect(() => {
    if (!search.trim()) {
      setSearchResults([]);
      setSearchLoading(false);
      setSearchError("");
      return;
    }

    let cancelled = false;

    setSearchLoading(true);
    setSearchResults([]);
    setSearchError("");

    const timer = setTimeout(async () => {
      try {
        const data = await getData<Player[]>(
          `/players/search?name=${encodeURIComponent(search.trim())}`
        );

        if (!cancelled) {
          setSearchResults(data);
        }
      } catch {
        if (!cancelled) {
          setSearchError("Unable to search players.");
          setSearchResults([]);
        }
      } finally {
        if (!cancelled) {
          setSearchLoading(false);
        }
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [search]);

  function clearComparison() {
    setShowResults(false);
    setRankings([]);
    setComparisonError("");
    setActivePlayer(null);
  }

  function addPlayer(player: Player) {
    if (selectedPlayers.length >= 5) return;

    if (
      selectedPlayers.some(
        (selected) => selected.player_id === player.player_id
      )
    ) {
      return;
    }

    setSelectedPlayers((current) => [...current, player]);
    setSearch("");
    clearComparison();
  }

  function removePlayer(playerId: string) {
    setSelectedPlayers((current) =>
      current.filter((player) => player.player_id !== playerId)
    );
    clearComparison();
  }

  async function comparePlayers() {
    if (selectedPlayers.length === 0 || comparisonLoading) return;

    setComparisonLoading(true);
    setComparisonError("");
    setShowResults(false);

    try {
      const results = await Promise.all(
        selectedPlayers.map(async (player): Promise<Ranking> => {
          const response = await getData<StatsResponse>(
            `/players/${encodeURIComponent(player.player_id)}/stats`
          );

          const games = response.stats;

          const total = games.reduce(
            (sum, game) =>
              sum + calculateFantasyPoints(game, scoring),
            0
          );

          return {
            player,
            games: games.length,
            total,
            average:
              games.length > 0 ? total / games.length : null,
          };
        })
      );

      results.sort((a, b) => {
        if (a.average === null && b.average === null) return 0;
        if (a.average === null) return 1;
        if (b.average === null) return -1;

        return b.average - a.average;
      });

      setRankings(results);
      setShowResults(true);
    } catch {
      setComparisonError(
        "Unable to load player statistics. Make sure the backend is running."
      );
    } finally {
      setComparisonLoading(false);
    }
  }

  function reset() {
    setSearch("");
    setScoring("Full-PPR");
    setSelectedPlayers([]);
    clearComparison();
  }

  const recommended = rankings.find(
    (ranking) => ranking.average !== null
  );

  return (
    <div className="start-sit-page">
      <h1>Start / Sit Analyzer</h1>

      <p>
        Compare players using historical NFL statistics and fantasy
        scoring.
      </p>

      <button type="button" onClick={reset}>
        Reset
      </button>

      <hr />

      <h2>Select Scoring Format</h2>

      <label htmlFor="scoring">Scoring:</label>

      <select
        id="scoring"
        value={scoring}
        onChange={(event) => {
          setScoring(event.target.value as Scoring);
          clearComparison();
        }}
      >
        <option value="Standard">Standard</option>
        <option value="Half-PPR">Half-PPR</option>
        <option value="Full-PPR">Full-PPR</option>
      </select>

      <h2>Select Players</h2>

      <p>{selectedPlayers.length} of 5 players selected</p>

      <label htmlFor="player-search">Search players:</label>

      <input
        id="player-search"
        type="search"
        value={search}
        placeholder="Enter player name"
        disabled={selectedPlayers.length >= 5}
        onChange={(event) => setSearch(event.target.value)}
      />

      {search.trim() !== "" && (
        <div>
          {searchLoading && <p>Searching...</p>}

          {searchError && (
            <p role="alert">{searchError}</p>
          )}

          {!searchLoading &&
            !searchError &&
            searchResults.length === 0 && (
              <p>No players found.</p>
            )}

          {!searchLoading &&
            searchResults.map((player) => (
              <div key={player.player_id}>
                <button
                  type="button"
                  disabled={selectedPlayers.some(
                    (selected) =>
                      selected.player_id === player.player_id
                  )}
                  onClick={() => addPlayer(player)}
                >
                  Add {player.player_name} ({player.position} -{" "}
                  {player.team_abbr})
                </button>
              </div>
            ))}
        </div>
      )}

      <h3>Selected Players</h3>

      {selectedPlayers.length === 0 && (
        <p>No players selected yet.</p>
      )}

      {selectedPlayers.map((player) => (
        <div key={player.player_id}>
          <strong>{player.player_name}</strong>{" "}
          ({player.position} - {player.team_abbr}){" "}
          <button
            type="button"
            onClick={() => removePlayer(player.player_id)}
          >
            Remove
          </button>
        </div>
      ))}

      <br />

      <button
        type="button"
        disabled={
          selectedPlayers.length === 0 || comparisonLoading
        }
        onClick={comparePlayers}
      >
        {comparisonLoading
          ? "Calculating..."
          : "Compare Players"}
      </button>

      {comparisonError && (
        <p role="alert">{comparisonError}</p>
      )}

      {showResults && (
        <section>
          <hr />

          <h2>Start/Sit Comparison</h2>

          <p>Scoring Format: {scoring}</p>

          {recommended ? (
            <div>
              <h3>Recommended Starter</h3>

              <p>
                <strong>
                  {recommended.player.player_name}
                </strong>
              </p>

              <p>
                Average Fantasy Points:{" "}
                <strong>
                  {recommended.average?.toFixed(2)}
                </strong>
              </p>

              <p>
                Based on {recommended.games} recorded games.
              </p>
            </div>
          ) : (
            <p>
              No historical player statistics are available yet.
              Rankings will appear after game data is imported.
            </p>
          )}

          <h3>Player Rankings</h3>

          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Player</th>
                <th>Position</th>
                <th>Games</th>
                <th>Avg Points</th>
                <th>Total Points</th>
              </tr>
            </thead>

            <tbody>
              {rankings.map((ranking, index) => (
                <tr key={ranking.player.player_id}>
                  <td>
                    {ranking.average === null
                      ? "—"
                      : index + 1}
                  </td>

                  <td>
                    <button
                      type="button"
                      onClick={() =>
                        setActivePlayer(
                          activePlayer === ranking.player.player_id
                            ? null
                            : ranking.player.player_id
                        )
                      }
                      aria-expanded={
                        activePlayer === ranking.player.player_id
                      }
                    >
                      {ranking.player.player_name}
                    </button>
                  </td>

                  <td>{ranking.player.position}</td>

                  <td>{ranking.games}</td>

                  <td>
                    {ranking.average === null
                      ? "No data"
                      : ranking.average.toFixed(2)}
                  </td>

                  <td>
                    {ranking.games === 0
                      ? "—"
                      : ranking.total.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {activePlayer && (
            <div>
              {rankings
                .filter(
                  (ranking) =>
                    ranking.player.player_id === activePlayer
                )
                .map((ranking) => (
                  <div key={ranking.player.player_id}>
                    <h3>{ranking.player.player_name}</h3>

                    <p>
                      Team: {ranking.player.team_abbr}
                    </p>

                    <p>
                      Position: {ranking.player.position}
                    </p>

                    <p>
                      Games Recorded: {ranking.games}
                    </p>

                    <p>
                      Total Fantasy Points:{" "}
                      {ranking.games > 0
                        ? ranking.total.toFixed(2)
                        : "No data"}
                    </p>

                    <p>
                      Average Fantasy Points:{" "}
                      {ranking.average === null
                        ? "No data"
                        : ranking.average.toFixed(2)}
                    </p>
                  </div>
                ))}
            </div>
          )}

          <p>
            <small>
              Rankings are based on historical fantasy points
              per game, not predictions of future performance.
            </small>
          </p>
        </section>
      )}
    </div>
  );
}

export default StartSit;
