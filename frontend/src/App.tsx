import { useState } from "react";
import "./App.css";

import SearchPage from "./components/SearchPage";
import PlayerPage from "./pages/playerpage";
import TeamPage from "./pages/teampage";
import GamePage from "./pages/gamepage";
import type { Game } from "./components/SearchPage";
import PredictionPageTest from "./pages/predictionpagetest";
import StartSit from "./startsit";
import ChatbotPage from "./pages/chatbotpage";

type Page = "search" | "startsit" | "predictions" | "team" | "game" | "chatbot";

const navigation: { id: Page; label: string }[] = [
  { id: "search", label: "NFL Data" },
  { id: "startsit", label: "Start / Sit" },
  { id: "predictions", label: "Predictions" },
  { id: "team", label: "Teams" },
  { id: "game", label: "Games" },
  { id: "chatbot", label: "SmartBet NFL Chatbot" },
];

function App() {
  const [currentPage, setCurrentPage] = useState<Page>("search");
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  const navigate = (page: Page) => {
    setCurrentPage(page);
    setSelectedPlayer(null);
  };

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
              <SearchPage
                onSelectPlayer={setSelectedPlayer}
                onSelectGame={(game) => {
                  setSelectedGame(game);
                  setCurrentPage("game");
                }}
              />
            )}

            {currentPage === "startsit" && <StartSit />}

            {currentPage === "predictions" && <PredictionPageTest />}

            {currentPage === "team" && <TeamPage />}

            {currentPage === "game" && selectedGame !== null && (
              <GamePage game={selectedGame} />
            )}

            {currentPage === "chatbot" && <ChatbotPage />}
          </>
        )}
      </main>
    </div>
  );
}

export default App;
