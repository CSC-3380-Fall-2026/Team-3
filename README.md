# SmartBet: Team 3
# Anthony Lee, Dominic Thriffley, DJ Thompson, Lucas Gaudiosi, Michael Vocke
Project Manager: Dominic Thriffiley (dthriffiley)\
Communications Lead: Lucas Gaudiosi (LucasGaudiosi)\
Git Master: DeJohn Thompson (Git Master)\
Design Lead: Michael Vocke ([GitHub Name])\
Quality Assurance Tester: Anthony Lee ([GitHub Name])

# About Our Software
SmartBet is a planned sports analytics website for researching live NFL games, comparing sportsbook odds, and making fantasy football lineup decisions. Our goal is to give users access to historical performance data and situational analysis in one place, without a paywall.

Users will be able to compare a player’s current game performance with similar situations from previous games. These comparisons will show historical outcomes, estimated probabilities, and how often the player finished above or below a given betting line. Users will also be able to compare odds across sportsbooks and ask our chatbot questions about players, teams, and game scenarios.

For fantasy football, SmartBet will include a Start-Sit tool that ranks players by projected fantasy points using the user’s selected scoring format.

## Planned core features

Live and Historical NFL Data
	- View live scores and player statistics.
	- Search for players, teams, and games.
	- Explore historical NFL data from nflverse.
	- Compare available sportsbook lines and odds.

Sports Data Chatbot and Situational Prediction Engine
	- Ask questions about NFL players, games, and historical performance.
	- Compare current player statistics with similar situations from past games.
	- Review the range of final outcomes from those comparable situations.
	- Compare historical over/under frequencies and estimated probabilities with sportsbook odds.

Fantasy Football Start-Sit Tool
	- Compare up to five players.
	- Choose Standard, Half-PPR, or Full PPR scoring.
	- Convert projected player statistics into fantasy point estimates.
	- Rank players by projected fantasy points to help with lineup decisions.

Potential Future Features
	- Support for additional sports and leagues.
	- Pregame and long-term betting analysis.
	- Social media sharing.
	- Full fantasy roster and league analysis.

**Responsible Gambling**
SmartBet will provide statistical analysis for informational purposes. Historical results and projections do not guarantee future outcomes. We plan to include responsible gambling reminders throughout the site.


## Platforms Tested on
	- MacOS 
	- Android
	- iOS
	- Linux
	- Windows
  
# Important Links
Kanban Board:(https://github.com/users/dthriffiley/projects/1/views/1)
Designs: [link]\
Styles Guide(s): [link]

## How to Run Dev and Test Environment
### How to Download:
`git clone` https://github.com/CSC-3380-Fall-2026/Team-3.git, then `cd Team-3`.

### Dependencies:
Node.js v24.14.0 (Download from nodejs.org)
npm 11.9.0 (comes with Node.js)

### Install:
From the Team-3 folder: 
cd backend and `npm install` THEN cd ../frontend and `npm install`.

### Run:
Open two terminals In the first terminal; `cd backend`, then `npm run dev`, and wait for "Server running on port 3000" & In the second terminal: `cd frontend`, then `npm run dev`, then open http://localhost:5173.

### Platforms Tested:
macOS on macbook

Planned APIs and Data:
NFLVERSE - historical NFL play-by-play
ESPN API - live game data and scores + odds
OPENAI API - Sports Data Chatbot
