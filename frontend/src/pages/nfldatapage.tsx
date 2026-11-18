
import {useEffect, useState} from "react";

type Team = {
  team_abbr: string;
  team_name: string;
  team_conf: string | null;
  team_division: string | null;
};

type Game = {
  game_id: string;
  season: number;
  week: number;
  home_team: string;
  away_team: string;
  home_score: number | null;
  away_score: number | null;
  game_status: string | null;
};

function NFLDataPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const [teamsResponse, gamesResponse] = await Promise.all([
          fetch("/api/teams"),
          fetch("/api/games"),
        ]);

        if (!teamsResponse.ok || !gamesResponse.ok) {
          throw new Error("Could not load NFL data from the backend.");
        }

        const teamsData: Team[] = await teamsResponse.json();
        const gamesData: Game[] = await gamesResponse.json();

        setTeams(teamsData);
        setGames(gamesData);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Something went wrong."
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return <p>Loading NFL data...</p>;
  }

  if (error) {
    return <p role="alert">{error}</p>;
  }

  return (
    <main>
      <h1>NFL Data</h1>
      <section>
        <h2>Teams</h2>
        {teams.length === 0 ? (
          <p>No teams available.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Team</th>
                <th>Abbreviation</th>
                <th>Conference</th>
                <th>Division</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((team) => (
                <tr key={team.team_abbr}>
                  <td>{team.team_name}</td>
                  <td>{team.team_abbr}</td>
                  <td>{team.team_conf ?? "N/A"}</td>
                  <td>{team.team_division ?? "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
      <section>
        <h2>Games</h2>

        {games.length === 0 ? (
          <p>No games available.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Season</th>
                <th>Week</th>
                <th>Away Team</th>
                <th>Home Team</th>
                <th>Score</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {games.map((game) => (
                <tr key={game.game_id}>
                  <td>{game.season}</td>
                  <td>{game.week}</td>
                  <td>{game.away_team}</td>
                  <td>{game.home_team}</td>
                  <td>
                    {game.away_score ?? "-"} - {game.home_score ?? "-"}
                  </td>
                  <td>{game.game_status ?? "Unknown"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}

export default NFLDataPage;
