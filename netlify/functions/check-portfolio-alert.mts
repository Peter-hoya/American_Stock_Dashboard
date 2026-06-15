import type { Config } from "@netlify/functions";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Helper to fetch price from Yahoo Finance
async function fetchPrice(ticker: string): Promise<number | null> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}`;
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.chart?.result?.[0]?.meta?.regularMarketPrice || null;
  } catch (error) {
    console.error(`Error fetching price for ${ticker}:`, error);
    return null;
  }
}

export default async (req: Request) => {
  let nextRunStr = "";
  try {
    const body = await req.json();
    nextRunStr = body?.next_run || "";
  } catch (e) {
    // In some local environments or invocations, the request body might be empty
  }

  console.log("Portfolio alert cron job started. Next run scheduled at:", nextRunStr);

  try {
    // 1. Fetch active alert settings
    const activeAlerts = await prisma.dashboardAlertSetting.findMany({
      where: { isEnabled: true },
    });

    if (activeAlerts.length === 0) {
      console.log("No active alert settings found. Skipping checks.");
      return;
    }

    // 2. Fetch all holdings
    const holdings = await prisma.dashboardHolding.findMany();
    if (holdings.length === 0) {
      console.log("No holdings found in database. Skipping checks.");
      return;
    }

    // 3. Fetch USD/KRW Exchange Rate
    const exchangeRate = await fetchPrice("KRW=X") || 1350; // Fallback to 1350 if fetch fails
    console.log(`Current USD/KRW Exchange Rate: ${exchangeRate}`);

    // 4. Fetch prices for all holding tickers
    let totalPortfolioValueUSD = 0;
    const tickers = holdings.map(h => h.ticker);

    console.log(`Fetching prices for tickers: ${tickers.join(", ")}`);
    const pricePromises = holdings.map(async (h) => {
      const price = await fetchPrice(h.ticker);
      if (price !== null) {
        totalPortfolioValueUSD += h.shares * price;
        console.log(`Ticker: ${h.ticker}, Shares: ${h.shares}, Price: $${price}, Value: $${(h.shares * price).toFixed(2)}`);
      } else {
        // Fallback to average cost if fetch fails
        totalPortfolioValueUSD += h.shares * h.avgCost;
        console.log(`Ticker: ${h.ticker} fetch failed. Falling back to avgCost: $${h.avgCost}`);
      }
    });

    await Promise.all(pricePromises);

    const totalPortfolioValueKRW = totalPortfolioValueUSD * exchangeRate;
    console.log(`Total Portfolio Value: $${totalPortfolioValueUSD.toFixed(2)} USD (₩${totalPortfolioValueKRW.toLocaleString("ko-KR")} KRW)`);

    // 5. Check alerts
    const todayKST = new Date().toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul" });
    const resendKey = Netlify.env.get("RESEND_API_KEY");

    for (const alert of activeAlerts) {
      if (totalPortfolioValueKRW >= alert.targetValue) {
        // Prevent duplicate alerts on the same day (KST)
        let alreadySentToday = false;
        if (alert.lastAlertSentAt) {
          const lastSentKST = new Date(alert.lastAlertSentAt).toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul" });
          if (lastSentKST === todayKST) {
            alreadySentToday = true;
          }
        }

        if (alreadySentToday) {
          console.log(`Alert already sent today to ${alert.email}. Skipping email dispatch.`);
          continue;
        }

        console.log(`Threshold reached for ${alert.email} (Threshold: ₩${alert.targetValue.toLocaleString()}, Current: ₩${totalPortfolioValueKRW.toLocaleString()})`);

        if (!resendKey) {
          console.warn("RESEND_API_KEY is not configured in Netlify Environment Variables. Skipping actual email send.");
          // Update DB lastAlertSentAt anyway to simulate a successful send locally
          await prisma.dashboardAlertSetting.update({
            where: { id: alert.id },
            data: { lastAlertSentAt: new Date() },
          });
          continue;
        }

        // Send email via Resend
        try {
          const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${resendKey}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              from: "portfolio-alert@resend.dev",
              to: alert.email,
              subject: "🎉 [American Stock Dashboard] 포트폴리오 1억원 달성! 🎉",
              html: `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 32px 24px; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
                  <h2 style="color: #004797; margin-top: 0; margin-bottom: 16px; font-size: 22px; font-weight: 700;">🎉 포트폴리오 1억원 달성 축하드립니다!</h2>
                  <p style="font-size: 16px; line-height: 1.6; color: #334155; margin-bottom: 24px;">
                    설정하신 미국 주식 포트폴리오의 총 평가액이 <strong>1억원(₩${alert.targetValue.toLocaleString()})</strong>을 돌파했습니다!
                  </p>
                  
                  <div style="background-color: #f8fafc; padding: 20px; border-radius: 12px; margin: 24px 0; border: 1px solid #e2e8f0;">
                    <span style="font-size: 14px; color: #64748b; display: block; margin-bottom: 6px; font-weight: 500;">현재 총 평가액 (한화)</span>
                    <strong style="font-size: 28px; color: #0f172a; font-weight: 800;">₩${Math.round(totalPortfolioValueKRW).toLocaleString("ko-KR")}</strong>
                  </div>

                  <div style="background-color: #f1f5f9; padding: 16px; border-radius: 8px; font-size: 14px; color: #475569; line-height: 1.6;">
                    <span style="font-weight: bold; display: block; margin-bottom: 6px;">실시간 기준 정보:</span>
                    • USD 총 평가액: $${totalPortfolioValueUSD.toFixed(2)}<br/>
                    • 적용 환율: ₩${exchangeRate.toFixed(2)} / USD
                  </div>
                  
                  <p style="font-size: 12px; color: #94a3b8; margin-top: 32px; border-top: 1px solid #e2e8f0; padding-top: 16px; line-height: 1.4;">
                    본 메일은 American Stock Dashboard의 백그라운드 스케줄러를 통해 발송되었습니다.<br/>
                    설정을 변경하시려면 대시보드 웹사이트에 방문해 주세요.
                  </p>
                </div>
              `
            })
          });

          if (res.ok) {
            console.log(`Email successfully sent to ${alert.email}`);
            await prisma.dashboardAlertSetting.update({
              where: { id: alert.id },
              data: { lastAlertSentAt: new Date() },
            });
          } else {
            const errBody = await res.text();
            console.error(`Failed to send email via Resend to ${alert.email}:`, errBody);
          }
        } catch (sendErr) {
          console.error(`Error during Resend email dispatch to ${alert.email}:`, sendErr);
        }
      }
    }
  } catch (error) {
    console.error("Cron job runtime error:", error);
  }
};

export const config: Config = {
  schedule: "@hourly",
};
