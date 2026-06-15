import { useRef, useEffect, useState } from 'react';
import './StockHeatmap.css';

/**
 * Returns a color based on daily change percent.
 * Deep red for large drops, deep green for large gains.
 */
function getHeatColor(dailyChangePercent) {
    if (dailyChangePercent === null || dailyChangePercent === undefined || isNaN(dailyChangePercent)) {
        return '#b0b8c1'; // Toss Grey400 neutral
    }

    // Clamp to ±5% for daily moves (daily range is tighter than total return)
    const clamped = Math.max(-5, Math.min(5, dailyChangePercent));
    const t = (clamped + 5) / 10;

    const colors = [
        { r: 127, g: 17, b: 17 },
        { r: 185, g: 28, b: 28 },
        { r: 240, g: 68, b: 82 }, // Toss Error Red
        { r: 248, g: 113, b: 113 }, // Light Red
        { r: 176, g: 184, b: 193 }, // Toss Grey400 (neutral)
        { r: 116, g: 224, b: 154 }, // Light Green
        { r: 3, g: 178, b: 108 },   // Toss Success Green
        { r: 2, g: 140, b: 80 },
        { r: 2, g: 110, b: 60 },
    ];

    const positions = [0, 0.15, 0.3, 0.42, 0.5, 0.58, 0.7, 0.85, 1.0];

    let i = 0;
    for (; i < positions.length - 1; i++) {
        if (t <= positions[i + 1]) break;
    }
    i = Math.min(i, positions.length - 2);

    const segT = (t - positions[i]) / (positions[i + 1] - positions[i]);
    const c1 = colors[i];
    const c2 = colors[i + 1];

    const r = Math.round(c1.r + (c2.r - c1.r) * segT);
    const g = Math.round(c1.g + (c2.g - c1.g) * segT);
    const b = Math.round(c1.b + (c2.b - c1.b) * segT);

    return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Proper Aspect-Ratio Squarify Algorithm
 * Creates visually balanced blocks (close to squares) to maximize readability.
 */
function squarify(items, rect) {
    if (items.length === 0) return [];
    if (items.length === 1) {
        return [{ ...items[0], layout: { ...rect } }];
    }

    const totalWeight = items.reduce((s, i) => s + i.weight, 0);
    if (totalWeight <= 0) return [];

    const targetArea = rect.w * rect.h;
    const scale = targetArea / totalWeight;

    // Sort items descending by weight and calculate area
    const sorted = [...items]
        .sort((a, b) => b.weight - a.weight)
        .map(item => ({ ...item, area: item.weight * scale }));

    const results = [];
    let remaining = sorted;
    let currentRect = { ...rect };

    // Calculates the worst aspect ratio of a given row
    const getWorstRatio = (row, sideLength) => {
        let maxArea = 0;
        let minArea = Infinity;
        let sumArea = 0;
        for (const item of row) {
            if (item.area > maxArea) maxArea = item.area;
            if (item.area < minArea) minArea = item.area;
            sumArea += item.area;
        }
        if (sumArea === 0 || minArea === 0) return Infinity;
        
        const s2 = sumArea * sumArea;
        const w2 = sideLength * sideLength;
        return Math.max((w2 * maxArea) / s2, s2 / (w2 * minArea));
    };

    while (remaining.length > 0) {
        const isHorizontal = currentRect.w >= currentRect.h;
        const sideLength = isHorizontal ? currentRect.h : currentRect.w;

        let row = [];
        let i = 0;

        // Build the row while it improves the worst aspect ratio
        while (i < remaining.length) {
            const nextRow = [...row, remaining[i]];
            if (row.length === 0) {
                row = nextRow;
                i++;
                continue;
            }

            const currentRatio = getWorstRatio(row, sideLength);
            const nextRatio = getWorstRatio(nextRow, sideLength);

            if (nextRatio <= currentRatio) {
                row = nextRow;
                i++;
            } else {
                break;
            }
        }

        // Layout the row
        const rowArea = row.reduce((sum, item) => sum + item.area, 0);
        const rowThickness = rowArea / sideLength;

        let offset = 0;
        for (const item of row) {
            const itemLength = item.area / rowThickness;
            if (isHorizontal) {
                results.push({
                    ...item,
                    layout: {
                        x: currentRect.x,
                        y: currentRect.y + offset,
                        w: rowThickness,
                        h: itemLength
                    }
                });
            } else {
                results.push({
                    ...item,
                    layout: {
                        x: currentRect.x + offset,
                        y: currentRect.y,
                        w: itemLength,
                        h: rowThickness
                    }
                });
            }
            offset += itemLength;
        }

        // Update remaining items and remaining rect space
        remaining = remaining.slice(i);
        if (isHorizontal) {
            currentRect.x += rowThickness;
            currentRect.w -= rowThickness;
        } else {
            currentRect.y += rowThickness;
            currentRect.h -= rowThickness;
        }
    }

    return results;
}

export default function StockHeatmap({ holdings, exchangeRate }) {
    const containerRef = useRef(null);
    const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const { width } = entry.contentRect;
                setContainerSize({ w: width, h: Math.max(320, width * 0.45) });
            }
        });
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    // Aggregate holdings by ticker (same ticker in multiple brokers → one tile)
    const tickerMap = {};
    holdings.filter(stock => stock.shares > 0).forEach(stock => {
        const price = stock.currentPrice || stock.avgCost;
        const prevClose = stock.prevClose || stock.avgCost;

        if (tickerMap[stock.ticker]) {
            const existing = tickerMap[stock.ticker];
            existing.shares += stock.shares;
            existing.totalValue += stock.shares * price;
            existing.totalCost += stock.shares * stock.avgCost;
            existing.prevTotalValue += stock.shares * prevClose;
            // Keep the most recent price (same ticker = same price)
            existing.price = price;
            existing.prevClose = prevClose;
        } else {
            tickerMap[stock.ticker] = {
                ticker: stock.ticker,
                name: stock.name,
                sector: stock.sector || 'Uncategorized',
                shares: stock.shares,
                price,
                prevClose,
                totalValue: stock.shares * price,
                totalCost: stock.shares * stock.avgCost,
                prevTotalValue: stock.shares * prevClose,
            };
        }
    });

    const items = Object.values(tickerMap).map(item => {
        const returnAmount = item.totalValue - item.totalCost;
        const returnPercent = item.totalCost > 0 ? (returnAmount / item.totalCost) * 100 : 0;
        const avgCost = item.shares > 0 ? item.totalCost / item.shares : 0;
        // Daily change
        const dailyChange = item.totalValue - item.prevTotalValue;
        const dailyChangePercent = item.prevTotalValue > 0 ? (dailyChange / item.prevTotalValue) * 100 : 0;

        return {
            ...item,
            avgCost,
            returnAmount,
            returnPercent,
            dailyChange,
            dailyChangePercent,
            weight: item.totalValue, // treemap sizing
        };
    });

    const totalPortfolioValue = items.reduce((sum, item) => sum + item.totalValue, 0);

    // Group items by sector
    const sectorMap = {};
    items.forEach(item => {
        if (!sectorMap[item.sector]) {
            sectorMap[item.sector] = { ticker: item.sector, sector: item.sector, weight: 0, items: [] };
        }
        sectorMap[item.sector].weight += item.weight;
        sectorMap[item.sector].items.push(item);
    });
    const sectors = Object.values(sectorMap);

    // Compute hierarchical treemap layout
    const layoutItems = [];
    if (containerSize.w > 0 && sectors.length > 0) {
        const sectorLayouts = squarify(sectors, { x: 0, y: 0, w: containerSize.w, h: containerSize.h || 320 });
        
        sectorLayouts.forEach(sectorNode => {
            const padTop = 22; // Height of sector header
            const padSides = 2; // Gap around sectors
            const padBottom = 2;
            
            const innerRect = {
                x: sectorNode.layout.x + padSides,
                y: sectorNode.layout.y + padTop,
                w: Math.max(0, sectorNode.layout.w - padSides * 2),
                h: Math.max(0, sectorNode.layout.h - padTop - padBottom)
            };
            
            const itemLayouts = squarify(sectorNode.items, innerRect);
            
            layoutItems.push({
                type: 'sector',
                sector: sectorNode.sector,
                layout: { ...sectorNode.layout },
            });
            
            itemLayouts.forEach(item => {
                layoutItems.push({
                    type: 'item',
                    ...item
                });
            });
        });
    }

    const formatCurrencyUSD = (val) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

    const formatCurrencyKRW = (val) =>
        new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(val * (exchangeRate || 1350));

    const formatPercent = (val) =>
        `${val >= 0 ? '+' : ''}${val.toFixed(2)}%`;

    return (
        <div className="heatmap-section toss-card" style={{ overflow: 'hidden' }}>
            <div className="heatmap-header">
                <h2>Portfolio Heatmap</h2>
                <div className="heatmap-legend">
                    <span>▼ Drop</span>
                    <div className="legend-bar" />
                    <span>▲ Rise</span>
                    {totalPortfolioValue > 0 && (
                        <span className="legend-total tabular-nums" style={{ marginLeft: '12px', fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                            Total: {formatCurrencyUSD(totalPortfolioValue)}
                        </span>
                    )}
                </div>
            </div>
            <div className="heatmap-container" ref={containerRef}>
                {items.length === 0 ? (
                    <div className="heatmap-empty">
                        <span>Add stocks to see your portfolio heatmap</span>
                    </div>
                ) : (
                    <div style={{ position: 'relative', width: '100%', height: `${containerSize.h || 320}px` }}>
                        {/* 1. Render Sectors */}
                        {layoutItems.filter(item => item.type === 'sector').map(sectorItem => {
                            const { layout, sector } = sectorItem;
                            return (
                                <div key={`sector-${sector}`} className="heatmap-sector" style={{
                                    position: 'absolute',
                                    left: `${layout.x}px`,
                                    top: `${layout.y}px`,
                                    width: `${layout.w}px`,
                                    height: `${layout.h}px`,
                                    border: '1.5px solid var(--border-default)',
                                    pointerEvents: 'none',
                                    zIndex: 1,
                                    boxSizing: 'border-box'
                                }}>
                                    <div className="sector-title" style={{ padding: '2px 4px', fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textTransform: 'uppercase' }}>
                                        {sector}
                                    </div>
                                </div>
                            );
                        })}

                        {/* 2. Render Items */}
                        {layoutItems.filter(item => item.type === 'item').map((item, idx) => {
                            const { layout } = item;
                            const bgColor = getHeatColor(item.dailyChangePercent);
                            const tileW = layout.w - 2; // small gap between tiles
                            const tileH = layout.h - 2;
                            const portfolioPct = totalPortfolioValue > 0
                                ? (item.totalValue / totalPortfolioValue) * 100
                                : 0;

                            // Dynamic font size proportional to box size and ticker length
                            // Ensure text fits width-wise based on string length (~0.65em per char)
                            const textWidthFactor = Math.max(item.ticker.length * 0.65 + 0.5, 3.0);
                            let fontSize = Math.min(tileW / textWidthFactor, tileH / 3);
                            // Cap limits
                            fontSize = Math.min(Math.max(fontSize, 0), 54);
                            const showText = fontSize > 8; // Hide text if tile is too tiny
                            const pctFontSize = fontSize * 0.55;

                            return (
                                <div
                                    key={item.ticker}
                                    className="heatmap-tile"
                                    style={{
                                        position: 'absolute',
                                        left: `${layout.x}px`,
                                        top: `${layout.y}px`,
                                        width: `${tileW}px`,
                                        height: `${tileH}px`,
                                        backgroundColor: bgColor,
                                        animationDelay: `${idx * 60}ms`,
                                        zIndex: 2,
                                    }}
                                >
                                    {showText && (
                                        <div className="tile-primary" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', pointerEvents: 'none' }}>
                                            <span className="tile-ticker" style={{ fontSize: `${fontSize}px`, fontWeight: '700', lineHeight: 1.1 }}>{item.ticker}</span>
                                            <span className="tile-change" style={{ fontSize: `${pctFontSize}px`, fontWeight: '600', marginTop: '2px', lineHeight: 1 }}>{formatPercent(item.dailyChangePercent)}</span>
                                        </div>
                                    )}

                                    {/* Tooltip */}
                                    <div className="tile-tooltip">
                                        <strong>{item.ticker}</strong> — {item.name}<br />
                                        Sector: {item.sector}<br />
                                        Shares: {item.shares} · Avg Cost: {formatCurrencyUSD(item.avgCost)}<br />
                                        Price: {formatCurrencyUSD(item.price)}<br />
                                        Value: {formatCurrencyUSD(item.totalValue)} ({formatCurrencyKRW(item.totalValue)})<br />
                                        Today: <span style={{ color: item.dailyChangePercent >= 0 ? 'var(--success)' : 'var(--error)' }}>
                                            {formatPercent(item.dailyChangePercent)}
                                        </span><br />
                                        Total Return: <span style={{ color: item.returnPercent >= 0 ? 'var(--success)' : 'var(--error)' }}>
                                            {formatCurrencyUSD(item.returnAmount)} ({formatPercent(item.returnPercent)})
                                        </span><br />
                                        Weight: {portfolioPct.toFixed(1)}%
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
