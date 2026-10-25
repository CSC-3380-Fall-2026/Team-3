import { describe, it, expect} from "vitest";
import { mockPredictions } from "./predictionmockdata";

describe("Prediction mock data", () => {
  it("contains predictions for Tyler Shough and Bijan Robinson", () => {
    const playerNames = mockPredictions.map(
      (prediction) => prediction.player
    );

    expect(playerNames).toContain("Tyler Shough");
    expect(playerNames).toContain("Bijan Robinson");
  });

  it("has valid betting lines and estimated probabilities", () => {
    mockPredictions.forEach((prediction) => {
      expect(prediction.bettingLine).toBeGreaterThan(0);
      expect(prediction.estimatedProbability).toBeGreaterThanOrEqual(0);
      expect(prediction.estimatedProbability).toBeLessThanOrEqual(100);
    });
  });
});
