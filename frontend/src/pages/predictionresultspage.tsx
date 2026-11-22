
import { mockPredictions } from "../data/predictionmockdata";

type HistoricalGame = {
  opponent: string;
  yards: number;
};

type Prediction = {
  player: string;
  team: string;
  opponent: string;
  position: string;
  gameSituation: {
    quarter: string;
    timeRemaining: string;
    score: string;
    down: string;
    fieldPosition: string;
  };
  statistic: string;
  bettingLine: number;
  projectedValue: number;
  predictedOutcome: string;
  estimatedProbability: number;
  overOdds?: number;
  underOdds?: number;
  similarSituations: HistoricalGame[];
};

function impliedProbability(odds?: number): number | null {
  if (
    odds === undefined ||
    !Number.isFinite(odds) ||
    Math.abs(odds) < 100
  ) {
    return null;
  }

  if (odds < 0) {
    return (Math.abs(odds) / (Math.abs(odds) + 100)) * 100;
  }

  return (100 / (odds + 100)) * 100;
}

function formatOdds(odds?: number): string {
  if (odds === undefined) return "Unavailable";
  return odds > 0 ? `+${odds}` : String(odds);
}

function PredictionResultsPage() {
  const predictions: Prediction[] = mockPredictions;

  return (
    <main style={{ maxWidth: "1100px", margin: "0 auto" }}>
      <h1>SmartBet Prediction Results</h1>

      <p>
        Explore player prop outcomes using comparable historical
        situations and sportsbook betting lines.
      </p>

      <p>
        <strong>Demo Data:</strong> These examples are not live
        sportsbook predictions.
      </p>

      {predictions.length === 0 && (
        <p>No prediction results are available.</p>
      )}

      {predictions.map((prediction, predictionIndex) => {
        const games = prediction.similarSituations;
        const sampleSize = games.length;

        const totalYards = games.reduce(
          (sum, game) => sum + game.yards,
          0
        );

        const historicalAverage =
          sampleSize > 0 ? totalYards / sampleSize : null;

        const gamesOver = games.filter(
          (game) => game.yards > prediction.bettingLine
        ).length;

        const gamesUnder = games.filter(
          (game) => game.yards < prediction.bettingLine
        ).length;

        const gamesPush = games.filter(
          (game) => game.yards === prediction.bettingLine
        ).length;

        const decidedGames = gamesOver + gamesUnder;

        const overRate =
          decidedGames > 0
            ? (gamesOver / decidedGames) * 100
            : null;

        const underRate =
          decidedGames > 0
            ? (gamesUnder / decidedGames) * 100
            : null;

        const overImplied = impliedProbability(
          prediction.overOdds
        );

        const underImplied = impliedProbability(
          prediction.underOdds
        );

        return (
          <section
            key={`${prediction.player}-${predictionIndex}`}
            style={{
              margin: "28px 0",
              padding: "24px",
              border: "1px solid #59636e",
              borderRadius: "10px",
            }}
          >
            <header>
              <h2>{prediction.player}</h2>

              <p>
                {prediction.position} | {prediction.team} vs.{" "}
                {prediction.opponent}
              </p>
            </header>

            <h3>Current Player Situation</h3>

            <p>
              <strong>Quarter:</strong>{" "}
              {prediction.gameSituation.quarter}
            </p>

            <p>
              <strong>Time Remaining:</strong>{" "}
              {prediction.gameSituation.timeRemaining}
            </p>

            <p>
              <strong>Score:</strong>{" "}
              {prediction.gameSituation.score}
            </p>

            <p>
              <strong>Down:</strong>{" "}
              {prediction.gameSituation.down}
            </p>

            <p>
              <strong>Field Position:</strong>{" "}
              {prediction.gameSituation.fieldPosition}
            </p>

            <hr />

            <h3>Sportsbook Betting Line</h3>

            <p>
              <strong>Market:</strong> {prediction.statistic}
            </p>

            <p>
              <strong>Line:</strong> {prediction.bettingLine}
            </p>

            <p>
              <strong>Over Odds:</strong>{" "}
              {formatOdds(prediction.overOdds)}
            </p>

            <p>
              <strong>Under Odds:</strong>{" "}
              {formatOdds(prediction.underOdds)}
            </p>

            <hr />

            <h3>Historical Comparison</h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(170px, 1fr))",
                gap: "16px",
                marginBottom: "20px",
              }}
            >
              <div>
                <h4>Comparable Games</h4>
                <p>{sampleSize}</p>
              </div>

              <div>
                <h4>Average Final Outcome</h4>
                <p>
                  {historicalAverage === null
                    ? "No data"
                    : historicalAverage.toFixed(1)}
                </p>
              </div>

              <div>
                <h4>Over Hit Rate</h4>
                <p>
                  {overRate === null
                    ? "No data"
                    : `${overRate.toFixed(1)}%`}
                </p>
              </div>

              <div>
                <h4>Under Hit Rate</h4>
                <p>
                  {underRate === null
                    ? "No data"
                    : `${underRate.toFixed(1)}%`}
                </p>
              </div>
            </div>

            <p>
              Historical Results: {gamesOver} Over,{" "}
              {gamesUnder} Under, {gamesPush} Push
            </p>

            <h4>Comparable Historical Games</h4>

            {sampleSize === 0 ? (
              <p>No comparable historical games available.</p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table>
                  <thead>
                    <tr>
                      <th>Opponent</th>
                      <th>Final {prediction.statistic}</th>
                      <th>Result</th>
                    </tr>
                  </thead>

                  <tbody>
                    {games.map((game, index) => (
                      <tr key={`${game.opponent}-${index}`}>
                        <td>{game.opponent}</td>
                        <td>{game.yards}</td>
                        <td>
                          {game.yards > prediction.bettingLine
                            ? "Over"
                            : game.yards < prediction.bettingLine
                            ? "Under"
                            : "Push"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <hr />

            <h3>Sportsbook Implied Probability</h3>

            <p>
              <strong>Over:</strong>{" "}
              {overImplied === null
                ? "Unavailable — sportsbook odds required"
                : `${overImplied.toFixed(2)}%`}
            </p>

            <p>
              <strong>Under:</strong>{" "}
              {underImplied === null
                ? "Unavailable — sportsbook odds required"
                : `${underImplied.toFixed(2)}%`}
            </p>

            <p>
              <small>
                Implied probabilities are calculated from American
                odds and include the sportsbook margin.
              </small>
            </p>

            <hr />

            <h3>Prediction Summary</h3>

            <p>
              <strong>Example Projected Value:</strong>{" "}
              {prediction.projectedValue}
            </p>

            <p>
              <strong>Example Predicted Outcome:</strong>{" "}
              {prediction.predictedOutcome}
            </p>

            <p>
              <strong>Example Estimated Probability:</strong>{" "}
              {prediction.estimatedProbability}%
            </p>

            <p>
              <small>
                The example estimate is separate from the
                sportsbook implied probability and historical
                hit rate.
              </small>
            </p>
          </section>
        );
      })}
    </main>
  );
}

export default PredictionResultsPage;
