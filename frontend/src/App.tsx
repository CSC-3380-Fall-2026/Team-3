import {useState} from "react";
import SearchPage from "./components/SearchPage";
import PlayerPage from "./pages/playerpage";
import TeamPage from "./pages/teampage";
import GamePage from "./pages/gamepage";
import PredictionPageTest from "./pages/predictionpagetest";
import StartSit from "./startsit";

function App() {
    const [currentPage, setCurrentPage] = useState("search"); //current page
    const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
    return (
        <div>
            <h1>SmartBet</h1>
            <nav> {/*page selection*/}
                <a href="#" onClick={() => setCurrentPage("search")}>NFL Data</a>
                <a href="#" onClick={() => setCurrentPage("startsit")}>Start-Sit</a>
                <a href="#" onClick={() => setCurrentPage("predictions")}>Predictions</a>
                <a href="#" onClick={() => setCurrentPage("team")}>Team Page</a>
                <a href="#" onClick={() => setCurrentPage("game")}>Game Page</a>
            </nav>
            {selectedPlayer === null ? (
                <>
                    {currentPage === "search" && (
                        <SearchPage onSelectPlayer={setSelectedPlayer}/>
                    )}
                    {currentPage === "startsit" && <StartSit/>}
                    {currentPage === "predictions" && <PredictionPageTest/>}
                    {currentPage === "team" && <TeamPage/>}
                    {currentPage === "game" && <GamePage/>}
                </>
            ) : (
                <div>
                    <button onClick={() => setSelectedPlayer(null)}>
                        Back to Search
                    </button>
                    <PlayerPage playerName={selectedPlayer}/>
                </div>
            )}
        </div>
    );
}

export default App;
