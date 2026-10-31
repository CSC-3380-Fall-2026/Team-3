import { useState } from "react";
import SearchPage from "./components/SearchPage";
import PlayerPage from "./pages/playerpage";
import TeamPage from "./pages/teampage";

function App() {
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [showTeams, setShowTeams] = useState(false);

  return (
    <div>
      <h1>SmartBet</h1>

      {showTeams ? (
        <div>
          <button onClick={() => setShowTeams(false)}>
            Back to Search
          </button>

          <TeamPage />
        </div>
      ) : selectedPlayer === null ? (
        <div>
          <button onClick={() => setShowTeams(true)}>
            Teams
          </button>

          <SearchPage onSelectPlayer={setSelectedPlayer} />
        </div>
      ) : (
        <div>
          <button onClick={() => setSelectedPlayer(null)}>
            Back to Search
          </button>

          <PlayerPage playerName={selectedPlayer} />
        </div>
      )}
    </div>
  );
}

export default App;