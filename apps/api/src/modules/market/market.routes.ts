import type { FastifyInstance } from "fastify";
import { marketService } from "./market.service.js";

export async function registerMarketRoutes(app: FastifyInstance) {
  app.get("/api/v1/market/quotes", async (request) => {
    const defaultSymbols = ["AAPL$US", "TSLA$US", "NVDA$US"];
    const { symbols } = request.query as { symbols?: string };
    const symbolList = symbols ? symbols.split(",") : defaultSymbols;

    const items = await marketService.getQuotes(symbolList);
    return {
      items,
      refreshedAt: new Date().toISOString(),
    };
  });
}
