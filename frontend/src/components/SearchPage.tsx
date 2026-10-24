import {useState} from "react";
import {teams, players, games} from "../data/mockdata";

type SearchPageProps = {
  onSelectPlayer: (playerName: string) => void;
};

function SearchPage({ onSelectPlayer }: SearchPageProps) {
  const [search, setSearch] = useState("");
  const searchTerm = search.toLowerCase();
  const filteredPlayers = players.filter((player)=>
    player.toLowerCase().includes(searchTerm));

const filteredTeams = teams.filter((team)=>
  team.toLowerCase().includes(searchTerm));

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
      {filteredTeams.map((team) => (
        <p key={team}>{team}</p>
      ))}

      <h2>Upcoming Games</h2>
      {filteredGames.map((game) => (
        <p key={game}>{game}</p>
      ))}
  </div>
  );
}

export default SearchPage;
