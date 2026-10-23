import { mockPredictions } from "../data/predictionmockdata";
function PredictionResultsPage() {
  return (
    <main>
    <h1> SmartBet Predictions </h1>
        {mockPredictions.map((prediction) => {
        const gamesOver = prediction.similarSituations.filter(
          (game) => game.yards > prediction.bettingLine
        ).length;

        const historicalOverRate = Math.round(
          (gamesOver / prediction.similarSituations.length) * 100
        );

        return (
          <section key={prediction.player}>
            <h2>{prediction.player}</h2>
            <p>
              {prediction.team} vs. {prediction.opponent}
            </p>
            <p>Position: {prediction.position}</p>

            <h3>Current Game Situation</h3>
            <p>Quarter: {prediction.gameSituation.quarter}</p>
            <p>Time Remaining: {prediction.gameSituation.timeRemaining}</p>
            <p>Score: {prediction.gameSituation.score}</p>
            <p>Down: {prediction.gameSituation.down}</p>
            <p>Field Position: {prediction.gameSituation.fieldPosition}</p>

            <h3>Similar Historical Situations</h3>
            <table>
              <thead>
                <tr>
                  <th>Opponent</th>
                  <th>{prediction.statistic}</th>
                  <th>Result</th>
                </tr>
              </thead>
              <tbody>
                {prediction.similarSituations.map((game, index) => (
                  <tr key={`${game.opponent}-${index}`}>
                    <td>{game.opponent}</td>
                    <td>{game.yards}</td>
                    <td>
                      {game.yards > prediction.bettingLine ? "Over" : "Under"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <p>
              Historical over rate: {gamesOver} of{" "}
              {prediction.similarSituations.length} games (
              {historicalOverRate}%)
            </p>
            
            <h3>Predicted Outcome</h3>
            <p>Statistic: {prediction.statistic}</p>
            <p>Example Betting Line: {prediction.bettingLine} yards</p>
            <p>Projected Value: {prediction.projectedValue} yards</p>
            <p>Predicted Outcome: {prediction.predictedOutcome}</p>
            <p>
              Estimated Probability: {prediction.estimatedProbability}%
            </p>
          </section>
        );
      })}
    </main>
);
}
export default PredictionResultsPage;
