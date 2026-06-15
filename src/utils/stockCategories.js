// Auto-populate map for common US stock tickers to their GICS Sectors
export const TICKER_SECTOR_MAP = {
    // Technology
    'AAPL': 'Technology', 'MSFT': 'Technology', 'NVDA': 'Technology', 'AVGO': 'Technology', 'ORCL': 'Technology', 'ADBE': 'Technology', 'CRM': 'Technology', 'AMD': 'Technology', 'QCOM': 'Technology', 'INTC': 'Technology', 'TXN': 'Technology', 'IBM': 'Technology', 'NOW': 'Technology', 'INTU': 'Technology', 'AMAT': 'Technology', 'MU': 'Technology', 'ASML': 'Technology',
    // Communication Services
    'GOOGL': 'Communication Services', 'GOOG': 'Communication Services', 'META': 'Communication Services', 'NFLX': 'Communication Services', 'DIS': 'Communication Services', 'CMCSA': 'Communication Services', 'VZ': 'Communication Services', 'T': 'Communication Services',
    // Consumer Cyclical
    'AMZN': 'Consumer Cyclical', 'TSLA': 'Consumer Cyclical', 'HD': 'Consumer Cyclical', 'MCD': 'Consumer Cyclical', 'NKE': 'Consumer Cyclical', 'SBUX': 'Consumer Cyclical', 'LVS': 'Consumer Cyclical', 'TSLL': 'Consumer Cyclical',
    // Financials
    'BRK.B': 'Financials', 'JPM': 'Financials', 'V': 'Financials', 'MA': 'Financials', 'BAC': 'Financials', 'WFC': 'Financials', 'MS': 'Financials', 'GS': 'Financials', 'AXP': 'Financials', 'C': 'Financials', 'BLK': 'Financials',
    // Healthcare
    'LLY': 'Healthcare', 'UNH': 'Healthcare', 'JNJ': 'Healthcare', 'ABBV': 'Healthcare', 'MRK': 'Healthcare', 'PFE': 'Healthcare', 'TMO': 'Healthcare', 'ABT': 'Healthcare', 'DHR': 'Healthcare', 'ISRG': 'Healthcare',
    // Consumer Defensive
    'WMT': 'Consumer Defensive', 'PG': 'Consumer Defensive', 'KO': 'Consumer Defensive', 'PEP': 'Consumer Defensive', 'COST': 'Consumer Defensive', 'PM': 'Consumer Defensive', 'MO': 'Consumer Defensive',
    // Industrials
    'CAT': 'Industrials', 'GE': 'Industrials', 'HON': 'Industrials', 'BA': 'Industrials', 'UPS': 'Industrials', 'LMT': 'Industrials', 'RTX': 'Industrials', 'DE': 'Industrials', 'SPCE': 'Industrials',
    // Energy
    'XOM': 'Energy', 'CVX': 'Energy', 'COP': 'Energy', 'EOG': 'Energy', 'SLB': 'Energy', 'OXY': 'Energy',
    // Utilities
    'NEE': 'Utilities', 'DUK': 'Utilities', 'SO': 'Utilities', 'D': 'Utilities', 'EXC': 'Utilities',
    // Real Estate
    'PLD': 'Real Estate', 'AMT': 'Real Estate', 'EQIX': 'Real Estate', 'CCI': 'Real Estate', 'PSA': 'Real Estate', 'O': 'Real Estate',
    // Materials
    'LIN': 'Materials', 'SHW': 'Materials', 'FCX': 'Materials', 'NEM': 'Materials', 'ECL': 'Materials', 'DOW': 'Materials'
};

export const STOCK_DETAILS = [
    { ticker: 'AAPL', name: 'Apple', sector: 'Technology' },
    { ticker: 'MSFT', name: 'Microsoft', sector: 'Technology' },
    { ticker: 'NVDA', name: 'NVIDIA', sector: 'Technology' },
    { ticker: 'AMZN', name: 'Amazon', sector: 'Consumer Cyclical' },
    { ticker: 'GOOGL', name: 'Alphabet A', sector: 'Communication Services' },
    { ticker: 'GOOG', name: 'Alphabet C', sector: 'Communication Services' },
    { ticker: 'META', name: 'Meta', sector: 'Communication Services' },
    { ticker: 'TSLA', name: 'Tesla', sector: 'Consumer Cyclical' },
    { ticker: 'ASML', name: 'ASML Holding', sector: 'Technology' },
    { ticker: 'SPCE', name: 'Virgin Galactic', sector: 'Industrials' },
    { ticker: 'ISRG', name: 'Intuitive Surgical', sector: 'Healthcare' },
    { ticker: 'WMT', name: 'Walmart', sector: 'Consumer Defensive' },
    { ticker: 'T', name: 'AT&T', sector: 'Communication Services' },
    { ticker: 'DIS', name: 'Walt Disney', sector: 'Communication Services' },
    { ticker: 'TSLL', name: 'Direxion Daily TSLA Bull 1.5X', sector: 'Consumer Cyclical' }
];

export const getDetailsFromTicker = (t) => STOCK_DETAILS.find(s => s.ticker.toUpperCase() === t.toUpperCase());

export const getDetailsFromName = (n) => {
    if (!n || n.length < 2) return null;
    return STOCK_DETAILS.find(s => s.name.toLowerCase().includes(n.toLowerCase()));
};
