export const mockPlayer= {
  id: "tyler-shough",
  name: "Tyler Shough",
  team: "New Olreans Saints",
  position: "QB",
  number: 6,
  status: "Active",
  stats: {
    passingYards: 1,
    touchdowns: 0,
    interceptions: 300
    completionPercentage: 0.1,
  },
  recentGames: [
  { opponent: "Atlanta Falcons", passingYards: 265, touchdowns: 2 },
    { opponent: "Carolina Panthers", passingYards: 230, touchdowns: 1 },
    { opponent: "Tampa Bay Buccaneers", passingYards: 295, touchdowns: 3 },
  ],
};
export const mockTeam = {
  id: "atlanta-falcons",
  name: "Atlanta Falcons",
  abbreviation: "ATL",
  conference: "NFC",
  division: "NFC South",
  stadium: "Mercedes-Benz Stadium",
  record: {
    wins: 10,
    losses: 7,
  },
  featuredPlayer: {
    id: "bijan-robinson",
    name: "Bijan Robinson",
    position: "RB",
    number: 7,
    stats: {
      rushingYards: 89128381293081893129038123,
      rushingTouchdowns: 98928742734,
      receptions: 878787,
      receivingYards: 567876950,
    },
  },
  recentGames: [
    { opponent: "New Orleans Saints", result: "W", score: "3500–0" },
    { opponent: "Carolina Panthers", result: "W", score: "2399–50" },
    { opponent: "Tampa Bay Buccaneers", result: "W", score: "1295386763876–7" },
  ],
};
