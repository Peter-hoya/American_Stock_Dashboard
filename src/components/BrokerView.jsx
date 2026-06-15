import './BrokerView.css';

// Consistent color per broker name
const BROKER_COLOR_MAP = {
    '미래에셋증권': '#3182f6',
    '토스증권': '#03b26c',
    '삼성증권': '#1b64da',
    '키움증권': '#f04452',
    'NH증권': '#f59e0b',
    '신한투자증권': '#0ea5e9',
    '카카오페이증권': '#8b5cf6',
    'Unassigned': '#b0b8c1',
};

const FALLBACK_COLORS = ['#ec4899', '#14b8a6', '#6366f1', '#d946ef'];

function getBrokerColor(brokerName, index) {
    return BROKER_COLOR_MAP[brokerName] || FALLBACK_COLORS[index % FALLBACK_COLORS.length];
}

export default function BrokerView({ holdings, exchangeRate }) {
    const formatCurrencyUSD = (val) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
    const formatCurrencyKRW = (val) =>
        new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(val * (exchangeRate || 1350));
    const formatPercent = (val) =>
        `${val >= 0 ? '+' : ''}${val.toFixed(2)}%`;

    // Group holdings by broker
    const brokerMap = {};
    holdings.forEach(stock => {
        const brokerName = stock.broker || 'Unassigned';
        if (!brokerMap[brokerName]) {
            brokerMap[brokerName] = [];
        }
        brokerMap[brokerName].push(stock);
    });

    // Calculate broker-level stats
    const totalPortfolioValue = holdings.reduce((sum, s) => sum + (s.shares * (s.currentPrice || s.avgCost)), 0);

    const brokerData = Object.entries(brokerMap).map(([name, stocks], index) => {
        const totalValue = stocks.reduce((sum, s) => sum + (s.shares * (s.currentPrice || s.avgCost)), 0);
        const totalCost = stocks.reduce((sum, s) => sum + (s.shares * s.avgCost), 0);
        const returnAmount = totalValue - totalCost;
        const returnPercent = totalCost > 0 ? (returnAmount / totalCost) * 100 : 0;
        const weight = totalPortfolioValue > 0 ? (totalValue / totalPortfolioValue) * 100 : 0;
        const color = getBrokerColor(name, index);

        return { name, stocks, totalValue, totalCost, returnAmount, returnPercent, weight, color };
    });

    // Sort by total value descending
    brokerData.sort((a, b) => b.totalValue - a.totalValue);

    return (
        <div className="broker-view">
            {brokerData.map((broker) => {
                const isProfit = broker.returnAmount >= 0;

                return (
                    <div key={broker.name} className="broker-card toss-card">
                        <div className="broker-card-header">
                            <h3>
                                <span className="broker-icon" style={{ backgroundColor: broker.color }}>
                                    {broker.name.charAt(0)}
                                </span>
                                {broker.name}
                            </h3>
                            <div className="broker-stats">
                                <div className="broker-stat">
                                    <span className="broker-stat-label">Total Value</span>
                                    <span className="broker-stat-value" style={{ color: 'var(--text-primary)' }}>
                                        {formatCurrencyUSD(broker.totalValue)}
                                    </span>
                                </div>
                                <div className="broker-stat">
                                    <span className="broker-stat-label">Return</span>
                                    <span className="broker-stat-value" style={{ color: isProfit ? 'var(--success)' : 'var(--error)' }}>
                                        {formatPercent(broker.returnPercent)}
                                    </span>
                                </div>
                                <div className="broker-stat">
                                    <span className="broker-stat-label">P&L</span>
                                    <span className="broker-stat-value" style={{ color: isProfit ? 'var(--success)' : 'var(--error)' }}>
                                        {formatCurrencyUSD(broker.returnAmount)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Proportion bar */}
                        <div className="broker-proportion">
                            <div className="proportion-bar-bg">
                                <div
                                    className="proportion-bar-fill"
                                    style={{
                                        width: `${broker.weight}%`,
                                        backgroundColor: broker.color,
                                    }}
                                />
                            </div>
                            <div className="proportion-label">
                                <span>Portfolio Weight</span>
                                <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                                    {broker.weight.toFixed(1)}% · {formatCurrencyKRW(broker.totalValue)}
                                </span>
                            </div>
                        </div>

                        {/* Mini holdings table */}
                        <table className="broker-holdings-table">
                            <thead>
                                <tr>
                                    <th>Ticker</th>
                                    <th className="text-right">Shares</th>
                                    <th className="text-right">Avg Cost</th>
                                    <th className="text-right">Current</th>
                                    <th className="text-right">Value</th>
                                    <th className="text-right">Return</th>
                                </tr>
                            </thead>
                            <tbody>
                                {broker.stocks.map(stock => {
                                    const price = stock.currentPrice || stock.avgCost;
                                    const totalCost = stock.shares * stock.avgCost;
                                    const totalValue = stock.shares * price;
                                    const ret = totalValue - totalCost;
                                    const retPct = totalCost > 0 ? (ret / totalCost) * 100 : 0;
                                    const stockProfit = ret >= 0;

                                    return (
                                        <tr key={stock.id}>
                                            <td>
                                                <div className="ticker-cell">{stock.ticker}</div>
                                                <div className="name-cell">{stock.name}</div>
                                            </td>
                                            <td className="text-right">{stock.shares}</td>
                                            <td className="text-right">{formatCurrencyUSD(stock.avgCost)}</td>
                                            <td className="text-right" style={{ fontWeight: '600' }}>{formatCurrencyUSD(price)}</td>
                                            <td className="text-right">{formatCurrencyUSD(totalValue)}</td>
                                            <td className="text-right" style={{ color: stockProfit ? 'var(--success)' : 'var(--error)' }}>
                                                <div>{formatCurrencyUSD(ret)}</div>
                                                <div style={{ fontSize: '12px' }}>({formatPercent(retPct)})</div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                );
            })}
        </div>
    );
}
