import { MarketQuote } from "@odin-pulse/shared";
import { env } from "../../config/env.js";
import { getRedisClient } from "../../lib/redis.js";

const CACHE_TTL = 60; // 1 minute cache
const REDIS_KEY_PREFIX = "market:quote:";

export class MarketService {
  private async fetchFromITick(symbol: string, region: string = "US"): Promise<Partial<MarketQuote>> {
    const token = env.ITICK_API_KEY;
    if (!token) {
      throw new Error("ITICK_API_KEY not configured");
    }

    const url = `https://api.itick.org/stock/quote?type=stock&region=${region}&code=${symbol}`;
    const response = await fetch(url, {
      headers: {
        "accept": "application/json",
        "token": token
      }
    });

    if (!response.ok) {
      throw new Error(`iTick API failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Mapping iTick response to our MarketQuote
    // data.ld: latest, data.ch: change, data.chp: change percent, etc.
    return {
      symbol: `${symbol}$${region}`,
      price: data.ld || 0,
      change: data.ch || 0,
      changePercent: data.chp || 0,
      high: data.h || 0,
      low: data.l || 0,
      volume: data.v || 0,
      updatedAt: new Date().toISOString(),
    };
  }

  async getQuotes(symbols: string[]): Promise<MarketQuote[]> {
    const redis = await getRedisClient();
    const results: MarketQuote[] = [];

    for (const sym of symbols) {
      const cacheKey = `${REDIS_KEY_PREFIX}${sym}`;
      const cached = await redis.get(cacheKey);

      if (cached) {
        results.push(JSON.parse(cached));
        continue;
      }

      try {
        // Simple parser for "AAPL$US" format
        const [code, region] = sym.split("$");
        const quote = await this.fetchFromITick(code, region || "US");
        
        const fullQuote: MarketQuote = {
          symbol: sym,
          name: code, // Ideally we fetch names too, but using code for now
          price: quote.price || 0,
          change: quote.change || 0,
          changePercent: quote.changePercent || 0,
          high: quote.high || 0,
          low: quote.low || 0,
          volume: quote.volume || 0,
          updatedAt: quote.updatedAt || new Date().toISOString(),
          assetType: "stock",
        };

        await redis.set(cacheKey, JSON.stringify(fullQuote), {
          EX: CACHE_TTL
        });
        results.push(fullQuote);
      } catch (err) {
        console.error(`Failed to fetch quote for ${sym}:`, err);
      }
    }

    return results;
  }
}

export const marketService = new MarketService();
