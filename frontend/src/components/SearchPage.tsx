import {useEffect, useState} from "react";
import {players, games} from "../data/mockdata";
import {getData} from "../api";

type SearchPageProps = {
  onSelectPlayer: (playerName: string) => void;
};

type Team = {
  team_abbr: string;
  team_name: string;
  };

function SearchPage({ onSelectPlayer }: SearchPageProps) {
  const [search, setSearch] = useState("");
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
    useEffect(() => {
    let active = true;
  
    async function loadTeams() {
      try {
        const data = await getData<Team[]>("/teams");
        if (active) {
          setTeams(data);
        }
      } catch {
        if (active) {
          setError("Unable to load teams. Please try again later.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }
  
    loadTeams();
  
    return () => {
      active = false;
    };
  }, []);

  const searchTerm = search.toLowerCase();
  const filteredPlayers = players.filter((player)=>
    player.toLowerCase().includes(searchTerm));

  const filteredTeams = teams.filter((team: Team)=>
    team.team_name.toLowerCase().includes(searchTerm) ||
    team.team_abbr.toLowerCase().includes(searchTerm));

const filteredGames = games.filter((game)=>
  game.toLowerCase().includes(searchTerm));

return (
  <div>
  <h1>SmartBet Search</h1>
  
  <input 
    type="text"
    placeholder="Search players, teams, or games"
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    />

    <h2>Players</h2>
      {search !== "" && filteredPlayers.length === 0 ? (
  <p>No players found.</p>
) : (
  filteredPlayers.map((player) => (
  <button
    key={player}
    type="button"
    onClick={() => onSelectPlayer(player)}
  >
    {player}
  </button>
))
)}

<h2>Teams</h2>
    {loading ? (
      <p role="status">Loading teams...</p>
    ) : error ? (
      <p role="alert">{error}</p>
    ) : filteredTeams.length === 0 ? (
      <p role="status">No teams found.</p>
    ) : (
      filteredTeams.map((team) => (
        <p key={team.team_abbr}>{team.team_name}</p>
      ))
    )}

      <h2>Upcoming Games</h2>
      {filteredGames.map((game) => (
        <p key={game}>{game}</p>
      ))}
  </div>
  );
}

export default SearchPage;
