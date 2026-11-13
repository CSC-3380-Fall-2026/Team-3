import { Router } from "express";

const router = Router();

const SPORTS_GAME_ODDS_URL =
  "https://api.sportsgameodds.com/v2/events?leagueID=NFL&oddsAvailable=true";

router.get("/player-props", async (_req, res) => {
    const apiKey = process.env.SPORTSGAMEODDS_API_KEY;

    if (!apiKey) {
        return res.status(503).json({
            error: "SPORTSGAMEODDS_API_KEY is not set",
        });
    }

        try {
            const response = await fetch(SPORTS_GAME_ODDS_URL, {
                headers: { "x-api-key": apiKey },
            });

            if (!response.ok) {
                return res.status(502).json({
                    error: "Failed to fetch SportsGameOdds events",
                });
            }

            const data = await response.json();

            const props = [];

for (const event of data.data ?? []) {
  for (const market of Object.values(event.odds ?? {}) as any[]) {
    if (!market?.playerID || market.ended || market.cancelled) {
      continue;
    }

    const books = market.byBookmaker ?? {};

    for (const sportsbook of Object.keys(books)) {
      const book = books[sportsbook];

      if (!book?.available || !book.odds) {
        continue;
      }

      const odds = Number(book.odds);

if (!Number.isInteger(odds) || Math.abs(odds) < 100) {
  continue;
}

const impliedProbability =
  odds > 0 ? 100 / (odds + 100) : -odds / (-odds + 100);

      props.push({
        eventId: event.eventID,
        playerId: market.playerID,
        marketId: market.oddID,
        market: market.marketName,
        side: market.sideID,
        sportsbook,
        line: book.overUnder ?? book.spread ?? null,
        odds: book.odds,
        impliedProbability,
        updatedAt: book.lastUpdatedAt ?? null,
      });
    }
  }
}

type Quote = (typeof props)[number];

const markets = new Map<string, Quote[]>();

for (const quote of props) {
  const key = `${quote.eventId}:${quote.marketId}`;
  const quotes = markets.get(key) ?? [];

  quotes.push(quote);
  markets.set(key, quotes);
}

const comparisons = Array.from(markets.values()).map((quotes) => {
  const { eventId, playerId, marketId, market, side } = quotes[0];
  const bestByLine = new Map<number | null, Quote>();

  for (const quote of quotes) {
    const line = quote.line === null ? null : Number(quote.line);

    if (line !== null && !Number.isFinite(line)) {
      continue;
    }

    const best = bestByLine.get(line);

    if (!best || quote.impliedProbability < best.impliedProbability) {
      bestByLine.set(line, quote);
    }
  }

  const bestPriceByLine = Array.from(bestByLine.values());
  const lines = Array.from(bestByLine.keys()).filter(
    (line): line is number => line !== null
  );

  let bestLine = bestByLine.get(null) ?? null;

  if (lines.length > 0 && side === "over") {
    bestLine = bestByLine.get(Math.min(...lines)) ?? null;
  }

  if (lines.length > 0 && side === "under") {
    bestLine = bestByLine.get(Math.max(...lines)) ?? null;
  }

  return {
    eventId,
    playerId,
    marketId,
    market,
    side,
    quotes,
    bestPriceByLine,
    bestLine,
  };
});

return res.json({ props, comparisons });
        } catch (error) {
            console.error("SportsGameOdds error:", error);

            return res.status(500).json({
                error: "Unable to retrieve NFL events",
            });
        }
    });

    export default router;