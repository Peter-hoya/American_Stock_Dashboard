import React, { useState, useEffect, useRef } from 'react';
import StockHeatmap from './StockHeatmap';
import SummaryCards from './SummaryCards';
import StockTable from './StockTable';
import AddStockModal from './AddStockModal';
import BrokerView from './BrokerView';
import { TICKER_SECTOR_MAP } from '../utils/stockCategories';

export default function Dashboard() {
    const [currentDate, setCurrentDate] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingStock, setEditingStock] = useState(null);
    const [activeTab, setActiveTab] = useState('portfolio'); // 'portfolio' | 'brokers'

    const INITIAL_USER_HOLDINGS = [
        { id: 'k-1', ticker: 'AAPL', name: 'Apple Inc.', shares: 37, avgCost: 200.6455, currentPrice: 0, prevClose: 0, broker: '키움증권', sector: 'Technology' },
        { id: 'k-2', ticker: 'AMZN', name: 'Amazon.com Inc.', shares: 16, avgCost: 182.3607, currentPrice: 0, prevClose: 0, broker: '키움증권', sector: 'Consumer Cyclical' },
        { id: 'k-3', ticker: 'ASML', name: 'ASML Holding N.V.', shares: 6, avgCost: 715.7116, currentPrice: 0, prevClose: 0, broker: '키움증권', sector: 'Technology' },
        { id: 'k-4', ticker: 'GOOGL', name: 'Alphabet Inc.', shares: 30, avgCost: 167.5248, currentPrice: 0, prevClose: 0, broker: '키움증권', sector: 'Communication Services' },
        { id: 'k-5', ticker: 'NVDA', name: 'NVIDIA Corp.', shares: 15, avgCost: 145.2503, currentPrice: 0, prevClose: 0, broker: '키움증권', sector: 'Technology' },
        { id: 'k-6', ticker: 'SPCE', name: 'Virgin Galactic Holdings', shares: 5, avgCost: 11.6986, currentPrice: 0, prevClose: 0, broker: '키움증권', sector: 'Industrials' },
        
        { id: 'm-1', ticker: 'SPCE', name: 'Virgin Galactic Holdings', shares: 16, avgCost: 78.7068, currentPrice: 0, prevClose: 0, broker: '미래에셋증권', sector: 'Industrials' },
        { id: 'm-2', ticker: 'AAPL', name: 'Apple Inc.', shares: 8, avgCost: 186.0475, currentPrice: 0, prevClose: 0, broker: '미래에셋증권', sector: 'Technology' },
        { id: 'm-3', ticker: 'GOOGL', name: 'Alphabet Inc.', shares: 20, avgCost: 127.0575, currentPrice: 0, prevClose: 0, broker: '미래에셋증권', sector: 'Communication Services' },
        
        { id: 'n-1', ticker: 'GOOGL', name: 'Alphabet Inc.', shares: 9, avgCost: 364.5388, currentPrice: 0, prevClose: 0, broker: 'NH증권', sector: 'Communication Services' },
        { id: 'n-2', ticker: 'AMZN', name: 'Amazon.com Inc.', shares: 3, avgCost: 219.0166, currentPrice: 0, prevClose: 0, broker: 'NH증권', sector: 'Consumer Cyclical' },
        { id: 'n-3', ticker: 'AAPL', name: 'Apple Inc.', shares: 4, avgCost: 270.7775, currentPrice: 0, prevClose: 0, broker: 'NH증권', sector: 'Technology' },
        
        { id: 't-1', ticker: 'GOOGL', name: 'Alphabet Inc.', shares: 5, avgCost: 368.91, currentPrice: 0, prevClose: 0, broker: '토스증권', sector: 'Communication Services' },
        { id: 't-2', ticker: 'NVDA', name: 'NVIDIA Corp.', shares: 1.25429, avgCost: 181.68, currentPrice: 0, prevClose: 0, broker: '토스증권', sector: 'Technology' },
        { id: 't-3', ticker: 'TSLA', name: 'Tesla Inc.', shares: 0.074757, avgCost: 423.24, currentPrice: 0, prevClose: 0, broker: '토스증권', sector: 'Consumer Cyclical' },
        { id: 't-4', ticker: 'AAPL', name: 'Apple Inc.', shares: 0.022486, avgCost: 198.28, currentPrice: 0, prevClose: 0, broker: '토스증권', sector: 'Technology' },
        
        { id: 's-1', ticker: 'ISRG', name: 'Intuitive Surgical, Inc.', shares: 0.148597, avgCost: 61.8966, currentPrice: 0, prevClose: 0, broker: '삼성증권', sector: 'Healthcare' },
        
        { id: 'sh-1', ticker: 'GOOGL', name: 'Alphabet Inc.', shares: 6, avgCost: 173.02, currentPrice: 0, prevClose: 0, broker: '신한투자증권', sector: 'Communication Services' },
        { id: 'sh-2', ticker: 'WMT', name: 'Walmart Inc.', shares: 1, avgCost: 97.77, currentPrice: 0, prevClose: 0, broker: '신한투자증권', sector: 'Consumer Defensive' },
        
        { id: 'ka-1', ticker: 'GOOGL', name: 'Alphabet Inc.', shares: 0.018, avgCost: 113.15, currentPrice: 0, prevClose: 0, broker: '카카오페이증권', sector: 'Communication Services' },
        { id: 'ka-2', ticker: 'T', name: 'AT&T Inc.', shares: 0.04, avgCost: 16.38, currentPrice: 0, prevClose: 0, broker: '카카오페이증권', sector: 'Communication Services' },
        { id: 'ka-3', ticker: 'TSLL', name: 'TSLL', shares: 0.06, avgCost: 19.6, currentPrice: 0, prevClose: 0, broker: '카카오페이증권', sector: 'Consumer Cyclical' },
        { id: 'ka-4', ticker: 'DIS', name: 'The Walt Disney Company', shares: 0.007, avgCost: 91.85, currentPrice: 0, prevClose: 0, broker: '카카오페이증권', sector: 'Communication Services' },
        { id: 'ka-5', ticker: 'NVDA', name: 'NVIDIA Corp.', shares: 0.003, avgCost: 185.9, currentPrice: 0, prevClose: 0, broker: '카카오페이증권', sector: 'Technology' }
    ];

    // Load holdings from localStorage or use defaults
    const [holdings, setHoldings] = useState(() => {
        const isInitialized = localStorage.getItem('userHoldingsInitialized_v3');
        if (!isInitialized) {
            return INITIAL_USER_HOLDINGS;
        }
        const saved = localStorage.getItem('stockDashboardHoldings');
        if (saved) {
            const parsed = JSON.parse(saved);
            // Retroactively apply auto-category for older holdings without sector info
            return parsed.map(stock => {
                if (!stock.sector || stock.sector === 'Uncategorized') {
                    const matchedSector = TICKER_SECTOR_MAP[stock.ticker?.toUpperCase()];
                    if (matchedSector) {
                        return { ...stock, sector: matchedSector };
                    }
                }
                return stock;
            });
        }
        return INITIAL_USER_HOLDINGS;
    });

    const [exchangeRate, setExchangeRate] = useState(1350);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const holdingsRef = useRef(holdings);
    useEffect(() => { holdingsRef.current = holdings; }, [holdings]);

    // Save core holding data to localStorage whenever it changes
    useEffect(() => {
        const toSave = holdings.map(h => ({ id: h.id, ticker: h.ticker, name: h.name, shares: h.shares, avgCost: h.avgCost, broker: h.broker || '', sector: h.sector || 'Uncategorized' }));
        localStorage.setItem('stockDashboardHoldings', JSON.stringify(toSave));
        localStorage.setItem('userHoldingsInitialized_v3', 'true');
    }, [holdings]);

    // Fetch Real Data from Yahoo Finance Proxy
    const fetchMarketData = async () => {
        setIsRefreshing(true);
        try {
            // Fetch KRW Exchange Rate via Proxy
            const krwRes = await fetch('/api/finance/KRW=X');
            if (krwRes.ok) {
                const krwData = await krwRes.json();
                const rate = krwData?.chart?.result?.[0]?.meta?.regularMarketPrice;
                if (rate) setExchangeRate(rate);
            }

            // Fetch Stock Data
            const updatedHoldings = await Promise.all(holdingsRef.current.map(async (stock) => {
                try {
                    const res = await fetch(`/api/finance/${stock.ticker}?interval=1m`);
                    if (!res.ok) return stock;
                    const data = await res.json();
                    const meta = data?.chart?.result?.[0]?.meta;
                    if (meta) {
                        return {
                            ...stock,
                            currentPrice: meta.regularMarketPrice,
                            prevClose: meta.chartPreviousClose || meta.previousClose || meta.regularMarketPrice
                        };
                    }
                } catch (err) {
                    console.error(`Failed to fetch ${stock.ticker}`, err);
                }
                return stock;
            }));

            setHoldings(updatedHoldings);
        } catch (error) {
            console.error("Market data fetch error:", error);
        } finally {
            setIsRefreshing(false);
        }
    };

    // Initial fetch and interval (every 60 seconds)
    useEffect(() => {
        const formatter = new Intl.DateTimeFormat('ko-KR', {
            year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
        });
        setCurrentDate(formatter.format(new Date()));

        fetchMarketData();
        const interval = setInterval(fetchMarketData, 60000);
        return () => clearInterval(interval);
    }, []);

    const handleAddStock = (newStock) => {
        if (newStock.id) {
            setHoldings(holdings.map(stock => stock.id === newStock.id ? newStock : stock));
        } else {
            const added = { ...newStock, id: Date.now().toString(), currentPrice: newStock.avgCost, prevClose: newStock.avgCost };
            setHoldings([...holdings, added]);
        }
        setEditingStock(null);
        // Trigger an immediate background fetch to get the real price for the new stock
        setTimeout(fetchMarketData, 500);
    };

    const handleDeleteStock = (id) => {
        setHoldings(holdings.filter(stock => stock.id !== id));
    };

    // Derived State calculations
    const totalValue = holdings.reduce((sum, stock) => sum + (stock.shares * (stock.currentPrice || stock.avgCost)), 0);
    const totalCost = holdings.reduce((sum, stock) => sum + (stock.shares * stock.avgCost), 0);
    const totalReturn = totalValue - totalCost;
    const returnPercentage = totalCost > 0 ? (totalReturn / totalCost) * 100 : 0;

    // Calculate Today's Change
    const previousTotalValue = holdings.reduce((sum, stock) => sum + (stock.shares * (stock.prevClose || stock.avgCost)), 0);
    const dailyChangeAmount = totalValue - previousTotalValue;
    const dailyChangePercentage = previousTotalValue > 0 ? (dailyChangeAmount / previousTotalValue) * 100 : 0;

    // Predefined broker list + any custom ones from holdings
    const BROKER_PRESETS = ['미래에셋증권', '토스증권', '삼성증권', '키움증권', 'NH증권', '신한투자증권', '카카오페이증권'];
    const customBrokers = holdings.map(h => h.broker).filter(b => b && !BROKER_PRESETS.includes(b));
    const brokerList = [...BROKER_PRESETS, ...new Set(customBrokers)];

    // Predefined sector list + custom
    const SECTOR_PRESETS = ['Technology', 'Financials', 'Healthcare', 'Consumer Cyclical', 'Energy', 'Industrials', 'Materials', 'Real Estate', 'Utilities', 'Communication Services', 'Consumer Defensive'];
    const customSectors = holdings.map(h => h.sector).filter(s => s && s !== 'Uncategorized' && !SECTOR_PRESETS.includes(s));
    const sectorList = [...SECTOR_PRESETS, ...new Set(customSectors)];

    return (
        <main className="main-content">
            <header className="dashboard-header" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ margin: 0, paddingBottom: '8px' }}>American Stock Dashboard</h1>
                    <div className="date-display" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>{currentDate} Market Status</span>
                        {isRefreshing && <span style={{ fontSize: '13px', color: 'var(--primary)' }}>Refreshing...</span>}
                        <button onClick={fetchMarketData} style={{ padding: '6px 12px', fontSize: '13px', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-secondary)', borderRadius: '6px', cursor: 'pointer', border: '1px solid var(--border-default)', transition: 'background-color 0.2s' }}>Refresh Data</button>
                    </div>
                </div>
                {exchangeRate && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                        <span style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: '500' }}>USD/KRW Rate</span>
                        <span className="tabular-nums" style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)' }}>
                            {new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(Math.round(exchangeRate))}
                        </span>
                    </div>
                )}
            </header>

            {/* Overview Cards */}
            <div className="summary-cards-container">
                <SummaryCards
                    totalValue={totalValue}
                    returnAmount={totalReturn}
                    returnPercentage={returnPercentage}
                    dailyChangeAmount={dailyChangeAmount}
                    dailyChangePercentage={dailyChangePercentage}
                    exchangeRate={exchangeRate}
                />
            </div>

            {/* Tab Navigation */}
            <div className="tab-nav" style={{ display: 'flex', gap: '4px', background: 'var(--bg-secondary)', borderRadius: '12px', padding: '4px' }}>
                <button
                    className={`tab-btn ${activeTab === 'portfolio' ? 'tab-active' : ''}`}
                    onClick={() => setActiveTab('portfolio')}
                    style={{
                        flex: 1,
                        padding: '12px 0',
                        fontSize: '15px',
                        fontWeight: activeTab === 'portfolio' ? '600' : '500',
                        color: activeTab === 'portfolio' ? 'var(--text-primary)' : 'var(--text-secondary)',
                        backgroundColor: activeTab === 'portfolio' ? 'var(--bg-primary)' : 'transparent',
                        border: 'none',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: activeTab === 'portfolio' ? 'var(--shadow-subtle)' : 'none',
                    }}
                >
                    Portfolio
                </button>
                <button
                    className={`tab-btn ${activeTab === 'brokers' ? 'tab-active' : ''}`}
                    onClick={() => setActiveTab('brokers')}
                    style={{
                        flex: 1,
                        padding: '12px 0',
                        fontSize: '15px',
                        fontWeight: activeTab === 'brokers' ? '600' : '500',
                        color: activeTab === 'brokers' ? 'var(--text-primary)' : 'var(--text-secondary)',
                        backgroundColor: activeTab === 'brokers' ? 'var(--bg-primary)' : 'transparent',
                        border: 'none',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: activeTab === 'brokers' ? 'var(--shadow-subtle)' : 'none',
                    }}
                >
                    Brokerages
                </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'portfolio' ? (
                <>
                    {/* Portfolio Heatmap */}
                    <StockHeatmap holdings={holdings} exchangeRate={exchangeRate} />

                    {/* Stock Table */}
                    <div className="stock-table-container toss-card" style={{ padding: '0', flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                        <div className="table-header">
                            <h2 style={{ fontSize: '20px', fontWeight: '700' }}>My Holdings</h2>
                            <button onClick={() => { setEditingStock(null); setIsAddModalOpen(true); }} className="add-stock-btn">
                                + Add Stock
                            </button>
                        </div>
                        <StockTable holdings={holdings} onDelete={handleDeleteStock} onEdit={(stock) => { setEditingStock(stock); setIsAddModalOpen(true); }} />
                    </div>
                </>
            ) : (
                <BrokerView holdings={holdings} exchangeRate={exchangeRate} />
            )}

            <AddStockModal
                isOpen={isAddModalOpen}
                onClose={() => { setIsAddModalOpen(false); setEditingStock(null); }}
                onAdd={handleAddStock}
                editingStock={editingStock}
                brokerList={brokerList}
                sectorList={sectorList}
            />
        </main>
    );
}
