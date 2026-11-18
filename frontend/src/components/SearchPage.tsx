import {useEffect, useState} from "react";
import {players} from "../data/mockdata";
import {getData} from "../api";

type SearchPageProps = {
  onSelectPlayer: (playerName: string) => void;
  onSelectGame: (Game: Game) => void;
};

type Team = {
  team_abbr: string;
  team_name: string;
  };

  export type Game = {
    eventId: string;
    homeTeam: string;
    awayTeam: string;
    homeScore: string;
    awayScore: string;
    status: string;
    };

function SearchPage({ onSelectPlayer, onSelectGame }: SearchPageProps) {
  const [search, setSearch] = useState("");
  const [teams, setTeams] = useState<Team[]>([]);
  const [games, setGames] = useState<Game[]>([]);
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

  useEffect(() => {
    let active = true;
  
    async function loadGames() {
      try {
        const data = await getData<Game[]>("/games/live");
        if (active) {
          setGames(data);
        }
      } catch {
        if (active) {
          setError("Unable to load games. Please try again later.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }
  
    loadGames();
  
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
  game.homeTeam.toLowerCase().includes(searchTerm) ||
  game.awayTeam.toLowerCase().includes(searchTerm));

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

<h2>Games</h2>
      {search !== "" && filteredGames.length === 0 ? (
  <p>No games found.</p>
) : (
  filteredGames.map((game) => (
  <button
    key ={game.eventId}
    type="button"
    onClick={() => onSelectGame(game)}
  >
    {game.awayTeam} vs {game.homeTeam} - {game.status}
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

  </div>
  );
}

export default SearchPage;
