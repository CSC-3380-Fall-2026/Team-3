import {useState} from "react";
import SearchPage from "./components/SearchPage" ;
import type { Game } from "./components/SearchPage";

import NFLDataPage from "./pages/nfldatapage";

function App() {
  return (
    <div>
      <h1>SmartBet</h1>
      <NFLDataPage />
import { useState } from "react";
import "./App.css";

import SearchPage from "./components/SearchPage";
import PlayerPage from "./pages/playerpage";
import TeamPage from "./pages/teampage";
import GamePage from "./pages/gamepage";
import PredictionPageTest from "./pages/predictionpagetest";
import StartSit from "./startsit";
import DemoReplayPage from "./pages/demoreplaypage";

function App() {
    const [currentPage, setCurrentPage] = useState("search"); //current page
    const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
    const [selectedGame, setSelectedGame] = useState<Game | null>(null);
    return (
import StatusPanel from "./components/StatusPanel";

type Page = "search" | "startsit" | "predictions" | "team" | "game";

const navigation: { id: Page; label: string }[] = [
  { id: "search", label: "NFL Data" },
  { id: "startsit", label: "Start / Sit" },
  { id: "predictions", label: "Predictions" },
  { id: "team", label: "Teams" },
  { id: "game", label: "Games" },
];

function App() {
  const [currentPage, setCurrentPage] = useState<Page>("search");
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [showTeams, setShowTeams] = useState(false);

  const navigate = (page: Page) => {
    setCurrentPage(page);
    setSelectedPlayer(null);
  };

      {showTeams ? (
        <div>
            <h1>SmartBet</h1>
            <nav> {/*page selection*/}
                <a href="#" onClick={() => setCurrentPage("search")}>NFL Data</a>
                <a href="#" onClick={() => setCurrentPage("startsit")}>Start-Sit</a>
                <a href="#" onClick={() => setCurrentPage("predictions")}>Predictions</a>
                <a href="#" onClick={() => setCurrentPage("team")}>Team Page</a>
                <a href="#" onClick={() => {setCurrentPage("game")}}>Game Page</a>
                <a href="#" onClick={() => setCurrentPage("game")}>Game Page</a>
                <a href="#" onClick={() => setCurrentPage("status")}>
    System Status
</a>
                <a href="#" onClick={() => setCurrentPage("demo")}>ESPN Replay Demo</a>
            </nav>
            {selectedPlayer === null ? (
                <>
                    {currentPage === "search" && (
                        <SearchPage onSelectPlayer={setSelectedPlayer} onSelectGame={ (game) => {setSelectedGame(game); setCurrentPage("game");}}  />
                    )}
                    {currentPage === "startsit" && <StartSit/>}
                    {currentPage === "predictions" && <PredictionPageTest/>}
                    {currentPage === "team" && <TeamPage/>}
                    {currentPage === "game" && selectedGame !== null && <GamePage game={selectedGame} />}
                    {currentPage === "game" && <GamePage/>}
                    {currentPage === "status" && <StatusPanel />}
                    {currentPage === "demo" && <DemoReplayPage/>}
                </>
            ) : (
                <div>
                    <button onClick={() => setSelectedPlayer(null)}>
                        Back to Search
                    </button>
                    <PlayerPage playerName={selectedPlayer}/>
                </div>
            )}
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
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-inner">
          <a
            href="#"
            className="app-logo"
            onClick={(event) => {
              event.preventDefault();
              navigate("search");
            }}
          >
            SMART<span>BET</span>
          </a>

          <nav className="app-nav" aria-label="Main navigation">
            {navigation.map((item) => (
              <button
                key={item.id}
                type="button"
                className={
                  currentPage === item.id && selectedPlayer === null
                    ? "active"
                    : ""
                }
                onClick={() => navigate(item.id)}
                aria-current={
                  currentPage === item.id && selectedPlayer === null
                    ? "page"
                    : undefined
                }
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="app-main">
        {selectedPlayer !== null ? (
          <>
            <button
              type="button"
              onClick={() => setSelectedPlayer(null)}
              className="back-button"
            >
              ← Back to NFL Data
            </button>

            <PlayerPage playerName={selectedPlayer} />
          </>
        ) : (
          <>
            {currentPage === "search" && (
              <SearchPage onSelectPlayer={setSelectedPlayer} />
            )}

            {currentPage === "startsit" && <StartSit />}

            {currentPage === "predictions" && <PredictionPageTest />}

            {currentPage === "team" && <TeamPage />}

            {currentPage === "game" && (
              <GamePage
                sofascoreGameID=""
                homeTeam="Home"
                awayTeam="Away"
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;
export default App;

