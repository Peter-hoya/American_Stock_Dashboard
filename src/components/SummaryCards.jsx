import './SummaryCards.css';

export default function SummaryCards({ totalValue, returnAmount, returnPercentage, dailyChangeAmount, dailyChangePercentage, exchangeRate }) {
    const isPositiveReturn = returnAmount >= 0;
    const isPositiveDaily = dailyChangeAmount >= 0;

    const formatCurrencyUSD = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
    const formatCurrencyKRW = (val) => new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(val * exchangeRate);
    const formatPercent = (val) => `${val >= 0 ? '+' : ''}${val.toFixed(2)}%`;

    return (
        <div className="summary-cards">
            {/* Total Asset Value */}
            <div className="summary-card toss-card">
                <h3 className="card-title">Total Portfolio Value</h3>
                <div className="card-value tabular-nums">{formatCurrencyUSD(totalValue)}</div>
                <div className="card-subtitle tabular-nums" style={{ marginTop: '4px', color: 'var(--text-secondary)' }}>
                    {formatCurrencyKRW(totalValue)}
                </div>
            </div>

            {/* Total Return */}
            <div className="summary-card toss-card">
                <h3 className="card-title">Total Return</h3>
                <div className={`card-value tabular-nums ${isPositiveReturn ? 'text-profit' : 'text-loss'}`}>
                    {returnAmount >= 0 ? '+' : ''}{formatCurrencyUSD(returnAmount)}
                </div>
                <div className={`card-subtitle tabular-nums ${isPositiveReturn ? 'text-profit' : 'text-loss'}`} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span>{returnAmount >= 0 ? '+' : ''}{formatCurrencyKRW(returnAmount)}</span>
                    <span style={{ fontSize: '0.9em', opacity: 0.8 }}>({formatPercent(returnPercentage)})</span>
                </div>
            </div>

            {/* Daily Change */}
            <div className="summary-card toss-card">
                <h3 className="card-title">Today's Change</h3>
                <div className={`card-value tabular-nums ${isPositiveDaily ? 'text-profit' : 'text-loss'}`}>
                    {dailyChangeAmount >= 0 ? '+' : ''}{formatCurrencyUSD(dailyChangeAmount)}
                </div>
                <div className={`card-subtitle tabular-nums ${isPositiveDaily ? 'text-profit' : 'text-loss'}`} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span>{dailyChangeAmount >= 0 ? '+' : ''}{formatCurrencyKRW(dailyChangeAmount)}</span>
                    <span style={{ fontSize: '0.9em', opacity: 0.8 }}>({formatPercent(dailyChangePercentage)})</span>
                </div>
            </div>
        </div>
    );
}
