
import { useState } from "react";
import SearchPage from "./components/SearchPage";
import PlayerPage from "./pages/playerpage";

function App() {
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);

  return (
    <div>
      <h1>SmartBet</h1>

      {selectedPlayer === null ? (
        <SearchPage onSelectPlayer={setSelectedPlayer} />
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
