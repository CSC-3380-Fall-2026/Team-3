import type { Game } from "../components/SearchPage";

function GamePage({ game }: { game: Game }) {
  return (
    <div>
      <h1>NFL Game Details</h1>
      <h2>{game.awayTeam} vs {game.homeTeam} - {game.status}</h2>
     <p>{game.awayScore} - {game.homeScore}</p>
  
    </div>
  );
}


export default GamePage;
