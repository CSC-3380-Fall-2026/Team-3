import { useState } from "react";

type historicalResults = {
  playerId: string;
  stat: string;
  quarter: number;
  currentValue: number;
  sampleSize:number;
  averageFinalValue: number|null;
  line: number|null;
  overCount: number|null;
  underCount: number|null;
  pushCount:number|null;
  overPercentage:number|null;
  underPercentage:number|null;
  pushPercentage:number|null; 
  matches: {
    game_id: string;
    season: number
    week:number;
    home_team: string;
    away_team: string;
    value_at_point: number;
    final_value:number;
}[];
};

function PredictionResultsPage() {
  const [playerName, setPlayerName] = useState("");
  const [searchResults, setSearchResults] = useState<
  {
    player_id: string;
    player_name: string;
    position: string;
    team_abbr: string;
  }[]
  >([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string|null>(null);
  const [statistic, setStatistic] = useState("passing_yards");
  const [quarter, setQuarter] = useState(1);
  const [currentValue, setCurrentValue] = useState("");
  const [line, setLine] = useState("");
  const [historicalResults, setHistoricalResults] = 
    useState<historicalResults | null>(null);

  return (
    <main style={{ maxWidth: "1100px", margin: "0 auto" }}>
      <h1>SmartBet Prediction Results</h1>
      <label htmlFor="player-name">Player Name </label>
      <input
      id = "player-name"
      type = "text"
      placeholder="Search for NFL Players"
      value={playerName}
      onChange={(event) => setPlayerName(event.target.value)}
      />
      <button
      type="button"
      onClick={async ()=>{
        const response = await fetch(
          `/api/players/search?name=${encodeURIComponent(playerName)}`
        );
        const players = await response.json();
        setSearchResults(players);
      }}
      >Search players</button>
      {searchResults.map((player) => (
        <button 
        type="button"
        key={player.player_id}
        onClick={() => setSelectedPlayerId(player.player_id)}
        >
          {player.player_name} - {player.position} ({player.team_abbr})
          </button>
      ))}
      {selectedPlayerId&&(
        <p>
          <strong>Selected Players:</strong>{" "}
          {searchResults.find(
            (player) => player.player_id === selectedPlayerId
          )?.player_name}
        </p>
      )}
      <label>
        Stat:
        <select 
        value={statistic}
        onChange={(event) => setStatistic(event.target.value)}
        >
          <option value={"passing_yards"}>Passing Yards</option>
          <option value={"rushing_yards"}>Rushing Yards</option>
          <option value={"receiving_yards"}>Receiving Yards</option>
        </select>
      </label>
      <label>
        Quarter:
        <select 
        value={quarter}
        onChange={(event) => setQuarter(Number(event.target.value))}
        >
          <option value={1}>1st Quarter</option>
          <option value={2}>2nd Quarter</option>
          <option value={3}>3rd Quarter</option>
          <option value={4}>4th Quarter</option>
        </select>
      </label>
      <label>
        Current Yards:
        <input 
        type="number"
        value={currentValue}
        onChange={(event) => setCurrentValue(event.target.value)}
        placeholder="Enter Current # of yards"
        >
        </input>
      </label>
      <label>
        Over or Under Line:
        <input 
        type="number"
        value={line}
        onChange={(event) => setLine(event.target.value)}
        placeholder="Enter line"
        >
        </input>
      </label>
      <button type="button"
      onClick={async() => {
        if(!selectedPlayerId||currentValue ===""|| line ===""){
          alert("Select a player & enter current yards");
          return;
        }
        
        const parameters = new URLSearchParams(
          {
            playerId: selectedPlayerId,
            stat: statistic,
            quarter: String(quarter),
            currentValue: currentValue,
            line: line,
            
          }
        );
         const response = await fetch(
          `/api/historical-situations?${parameters.toString()}`
        );
        const data = await response.json();
        setHistoricalResults(data);
      }}
      
      >
        Find Historical Scenarios
      </button>
      {historicalResults&&(
        <section>
          <h2>Comparable Historical Scenarios</h2>
          <p>Games:{historicalResults.sampleSize}</p>
          <p>Average Final Yards:{historicalResults.averageFinalValue??"No data"}</p>
          <p>Games Over: {historicalResults.overCount ?? "No data"}</p>
          <p>Games Under: {historicalResults.underCount ?? "No data"}</p>
          <p>Pushes: {historicalResults.pushCount ?? "No data"}</p>
          <p>Over Percentage: {historicalResults.overPercentage ?? "No data"}</p>
          <p>Under Percentage: {historicalResults.underPercentage ?? "No data"}</p>
          <p>Push Percentage: {historicalResults.pushPercentage ?? "No data"}</p>
          <h3>Game Matches:</h3>
          {historicalResults.matches.map((game) => (
        <p key={game.game_id}>
        
          Week {game.week}: {game.away_team} @ {game.home_team}
            - Through Q{historicalResults.quarter}: {game.value_at_point} yards
            - Final: {game.final_value} yards
          </p>
      ))}
        </section>
      )}
    </main>
  );
}

export default PredictionResultsPage;
