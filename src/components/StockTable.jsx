import './StockTable.css';

export default function StockTable({ holdings, onDelete, onEdit }) {
    const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
    const formatPercent = (val) => `${val >= 0 ? '+' : ''}${val.toFixed(2)}%`;

    // Aggregate holdings by ticker
    const aggregatedMap = {};
    holdings.forEach(stock => {
        if (!aggregatedMap[stock.ticker]) {
            aggregatedMap[stock.ticker] = {
                ticker: stock.ticker,
                name: stock.name,
                sector: stock.sector || 'Uncategorized',
                shares: 0,
                totalCostAmt: 0,
                currentPrice: stock.currentPrice || stock.avgCost,
            };
        }
        aggregatedMap[stock.ticker].shares += stock.shares;
        aggregatedMap[stock.ticker].totalCostAmt += stock.shares * stock.avgCost;
        // ensure currentPrice is the latest
        aggregatedMap[stock.ticker].currentPrice = stock.currentPrice || stock.avgCost;
    });

    const aggregatedList = Object.values(aggregatedMap).map(item => {
        return {
            ...item,
            avgCost: item.shares > 0 ? item.totalCostAmt / item.shares : 0,
        };
    });

    // Sort by total value descending
    aggregatedList.sort((a, b) => (b.shares * b.currentPrice) - (a.shares * a.currentPrice));

    return (
        <div className="table-responsive">
            <table className="stock-table">
                <thead>
                    <tr>
                        <th>Ticker</th>
                        <th>Sector</th>
                        <th className="text-right">Shares</th>
                        <th className="text-right">Avg Cost</th>
                        <th className="text-right">Current Price</th>
                        <th className="text-right">Total Value</th>
                        <th className="text-right">Total Return</th>
                    </tr>
                </thead>
                <tbody>
                    {aggregatedList.length === 0 ? (
                        <tr>
                            <td colSpan="7" className="empty-state">No holdings added yet.</td>
                        </tr>
                    ) : (
                        aggregatedList.map((stock) => {
                            const price = stock.currentPrice;
                            const totalCost = stock.totalCostAmt;
                            const totalValue = stock.shares * price;
                            const returnAmount = totalValue - totalCost;
                            const returnPercentage = totalCost > 0 ? (returnAmount / totalCost) * 100 : 0;
                            const isProfit = returnAmount >= 0;

                            return (
                                <tr key={stock.ticker} className="stock-row">
                                    <td className="stock-ticker" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div className="ticker-logo" style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', fontSize: '14px', color: 'var(--text-secondary)' }}>
                                            {stock.ticker.substring(0, 2)}
                                        </div>
                                        <div>
                                            <div className="ticker-symbol" style={{ fontWeight: '600' }}>{stock.ticker}</div>
                                            <div className="ticker-name" style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{stock.name}</div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="text-secondary" style={{ fontSize: '13px' }}>{stock.sector}</span>
                                    </td>
                                    <td className="text-right tabular-nums">
                                        {Number.isInteger(stock.shares) ? stock.shares : stock.shares.toFixed(4)}
                                    </td>
                                    <td className="text-right tabular-nums text-secondary">{formatCurrency(stock.avgCost)}</td>
                                    <td className="text-right tabular-nums fw-bold">{formatCurrency(price)}</td>
                                    <td className="text-right tabular-nums">{formatCurrency(totalValue)}</td>
                                    <td className={`text-right tabular-nums ${isProfit ? 'text-profit' : 'text-loss'}`}>
                                        <div>{formatCurrency(returnAmount)}</div>
                                        <div className="text-sm">({formatPercent(returnPercentage)})</div>
                                    </td>
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>
        </div>
    );
}
