import {useEffect, useState} from "react";
import {players} from "../data/mockdata";
import {getData} from "../api";

type SearchPageProps = {
  onSelectPlayer: (playerName: string) => void;
  onSelectGame: (Game: Game) => void;
  onSelectTeam: (Team: string) => void;
};

type Player = {
  player_id: string;
  player_name: string;
  position: string;
  team_abbr: string;
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

function SearchPage({ onSelectPlayer, onSelectGame, onSelectTeam }: SearchPageProps) {
  const [search, setSearch] = useState("");
  const [subSearch, setSubSearch] = useState("");
  const [searchResults, setSearchResults] = useState<Player[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
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

  const searchTerm = subSearch.toLowerCase();
  const filteredPlayers = players.filter((player)=>
    player.toLowerCase().includes(searchTerm));

  const filteredTeams = teams.filter((team: Team)=>
    team.team_name.toLowerCase().includes(searchTerm) ||
    team.team_abbr.toLowerCase().includes(searchTerm));

const filteredGames = games.filter((game)=>
  game.homeTeam.toLowerCase().includes(searchTerm) ||
  game.awayTeam.toLowerCase().includes(searchTerm));

    useEffect(() => {
      if (!subSearch.trim()) {
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
            `/players/search?name=${encodeURIComponent(subSearch.trim())}`
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
    }, [subSearch]);

return (
  <div className="searchPage">
  <h1>SmartBet Search</h1>
  
  <input 
    type="text"
    placeholder="Search players, teams, or games"
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    />
    <button
      type = "button"
      onClick={() => setSubSearch(search.trim())}>
      Search
    </button>
    {subSearch !== ""&&(
    <section>
    <h2>Players</h2>
      {subSearch !== "" && searchResults.length === 0 ? (
  <p>No players found.</p>
) : (
  searchResults.map((player) => (
  <button
    key={player.player_id}
    type="button"
    onClick={() => onSelectPlayer(player.player_name)}
  >
    {player.player_name}
  </button>
))
)}
</section>
    )}
<section className="games">
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
     {game.status} - {game.awayTeam} {game.awayScore} vs {game.homeTeam} {game.homeScore}
  </button>
))
)}
</section>
<section className="teams">
<h2>Teams</h2>
    {loading ? (
      <p role="status">Loading teams...</p>
    ) : error ? (
      <p role="alert">{error}</p>
    ) : filteredTeams.length === 0 ? (
      <p role="status">No teams found.</p>
    ) : (
      filteredTeams.map((team) => (
        <button key={team.team_abbr}
        type="button"
        onClick={()=> onSelectTeam(team.team_abbr)}>
          {team.team_name}
        </button>
      ))
    )}
    
</section>
  </div>
  );
}

export default SearchPage;
