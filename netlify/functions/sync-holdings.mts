import type { Context, Config } from "@netlify/functions";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async (req: Request, context: Context) => {
  // CORS check and OPTIONS request handling
  if (req.method === "OPTIONS") {
    return new Response("OK", {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      },
    });
  }

  if (req.method === "GET") {
    try {
      // Find the first alert setting (default)
      const setting = await prisma.dashboardAlertSetting.findFirst();
      return new Response(JSON.stringify(setting || { email: "", isEnabled: false, targetValue: 100000000 }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error: any) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const { holdings, email, isEnabled, targetValue } = await req.json();

    // 1. Sync Alert Settings if email is provided
    if (email) {
      await prisma.dashboardAlertSetting.upsert({
        where: { email },
        update: {
          isEnabled: isEnabled !== undefined ? isEnabled : true,
          targetValue: targetValue || 100000000,
        },
        create: {
          email,
          isEnabled: isEnabled !== undefined ? isEnabled : true,
          targetValue: targetValue || 100000000,
        },
      });
    }

    // 2. Sync Holdings
    if (Array.isArray(holdings)) {
      // Group holdings by ticker first, since the client can have duplicate tickers across different brokers.
      // But the database has a unique constraint on ticker.
      // We will sum the shares and compute the weighted average cost.
      const aggregatedMap = new Map<string, { name: string; shares: number; totalCost: number; sector: string }>();

      for (const h of holdings) {
        if (!h.ticker) continue;
        const ticker = h.ticker.toUpperCase();
        const shares = Number(h.shares) || 0;
        const avgCost = Number(h.avgCost) || 0;
        const name = h.name || h.ticker;
        const sector = h.sector || "Uncategorized";

        const existing = aggregatedMap.get(ticker);
        if (existing) {
          const newShares = existing.shares + shares;
          const newTotalCost = existing.totalCost + (shares * avgCost);
          aggregatedMap.set(ticker, {
            name,
            shares: newShares,
            totalCost: newTotalCost,
            sector,
          });
        } else {
          aggregatedMap.set(ticker, {
            name,
            shares,
            totalCost: shares * avgCost,
            sector,
          });
        }
      }

      const dbHoldings = Array.from(aggregatedMap.entries()).map(([ticker, data]) => ({
        ticker,
        name: data.name,
        shares: data.shares,
        avgCost: data.shares > 0 ? data.totalCost / data.shares : 0,
        sector: data.sector,
      }));

      // Delete all current holdings and insert the updated set inside a transaction
      await prisma.$transaction([
        prisma.dashboardHolding.deleteMany(),
        prisma.dashboardHolding.createMany({
          data: dbHoldings,
        }),
      ]);
    }

    return new Response(JSON.stringify({ success: true, message: "Holdings and settings synchronized successfully" }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });

  } catch (error: any) {
    console.error("Sync error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
};

export const config: Config = {
  path: "/api/sync-holdings",
};
