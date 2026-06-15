-- CreateTable
CREATE TABLE "dashboard_holdings" (
    "id" SERIAL NOT NULL,
    "ticker" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shares" DOUBLE PRECISION NOT NULL,
    "avgCost" DOUBLE PRECISION NOT NULL,
    "sector" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dashboard_holdings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dashboard_alert_settings" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "targetValue" DOUBLE PRECISION NOT NULL DEFAULT 100000000,
    "last_alert_sent_at" TIMESTAMP(3),
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dashboard_alert_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "dashboard_holdings_ticker_key" ON "dashboard_holdings"("ticker");

-- CreateIndex
CREATE UNIQUE INDEX "dashboard_alert_settings_email_key" ON "dashboard_alert_settings"("email");
