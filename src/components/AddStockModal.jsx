import { useState, useEffect } from 'react';
import { TICKER_SECTOR_MAP, getDetailsFromTicker, getDetailsFromName } from '../utils/stockCategories';
import './AddStockModal.css';

export default function AddStockModal({ isOpen, onClose, onAdd, editingStock, brokerList = [], sectorList = [] }) {
    const [ticker, setTicker] = useState('');
    const [name, setName] = useState('');
    const [shares, setShares] = useState('');
    const [avgCost, setAvgCost] = useState('');
    const [broker, setBroker] = useState('');
    const [customBroker, setCustomBroker] = useState('');
    const [sector, setSector] = useState('Uncategorized');
    const [customSector, setCustomSector] = useState('');

    useEffect(() => {
        if (editingStock) {
            setTicker(editingStock.ticker);
            setName(editingStock.name || '');
            setShares(editingStock.shares.toString());
            setAvgCost(editingStock.avgCost.toString());
            setBroker(editingStock.broker || '');
            setCustomBroker('');
            setSector(editingStock.sector || 'Uncategorized');
            setCustomSector('');
        } else {
            setTicker('');
            setName('');
            setShares('');
            setAvgCost('');
            setBroker('');
            setCustomBroker('');
            setSector('Uncategorized');
            setCustomSector('');
        }
    }, [editingStock, isOpen]);

    if (!isOpen) return null;

    const handleTickerChange = (e) => {
        const val = e.target.value.toUpperCase();
        setTicker(val);
        
        if (!editingStock) {
            const details = getDetailsFromTicker(val);
            if (details) {
                if (!name) setName(details.name);
                if (sector === 'Uncategorized' || !sector) setSector(details.sector);
            } else if (TICKER_SECTOR_MAP[val]) {
                if (sector === 'Uncategorized' || !sector) setSector(TICKER_SECTOR_MAP[val]);
            }
        }
    };

    const handleNameChange = (e) => {
        const val = e.target.value;
        setName(val);
        
        if (!editingStock) {
            const details = getDetailsFromName(val);
            if (details) {
                if (!ticker) setTicker(details.ticker);
                if (sector === 'Uncategorized' || !sector) setSector(details.sector);
            }
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!ticker || !shares || !avgCost) return;

        const finalBroker = broker === '__custom__' ? customBroker : broker;
        const finalSector = sector === '__custom__' ? customSector : sector;

        onAdd({
            ...(editingStock || {}),
            ticker: ticker.toUpperCase(),
            name: name || ticker.toUpperCase(),
            shares: Number(shares),
            avgCost: Number(avgCost),
            currentPrice: editingStock ? editingStock.currentPrice : Number(avgCost),
            broker: finalBroker || '',
            sector: finalSector || 'Uncategorized',
        });

        // Reset and close
        setTicker('');
        setName('');
        setShares('');
        setAvgCost('');
        setBroker('');
        setCustomBroker('');
        setSector('Uncategorized');
        setCustomSector('');
        onClose();
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content toss-card">
                <div className="modal-header">
                    <h2>{editingStock ? 'Edit Holding' : 'Add New Holding'}</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="ticker">Ticker Symbol</label>
                            <input
                                type="text"
                                id="ticker"
                                value={ticker}
                                onChange={handleTickerChange}
                                placeholder="e.g. AAPL"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="broker">Brokerage</label>
                            <select
                                id="broker"
                                value={broker}
                                onChange={(e) => setBroker(e.target.value)}
                                className="form-select"
                            >
                                <option value="">Select broker</option>
                                {brokerList.map(b => (
                                    <option key={b} value={b}>{b}</option>
                                ))}
                                <option value="__custom__">+ New broker</option>
                            </select>
                            {broker === '__custom__' && (
                                <input
                                    type="text"
                                    value={customBroker}
                                    onChange={(e) => setCustomBroker(e.target.value)}
                                    placeholder="증권사명 입력"
                                    style={{ marginTop: '8px' }}
                                />
                            )}
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="name">Company Name (Optional)</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={handleNameChange}
                            placeholder="e.g. Apple Inc."
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="sector">Sector</label>
                        <select
                            id="sector"
                            value={sector}
                            onChange={(e) => setSector(e.target.value)}
                            className="form-select"
                        >
                            <option value="Uncategorized">Uncategorized</option>
                            {sectorList.map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                            <option value="__custom__">+ New Sector</option>
                        </select>
                        {sector === '__custom__' && (
                            <input
                                type="text"
                                value={customSector}
                                onChange={(e) => setCustomSector(e.target.value)}
                                placeholder="섹터명 입력"
                                style={{ marginTop: '8px' }}
                            />
                        )}
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="shares">Shares</label>
                            <input
                                type="number"
                                id="shares"
                                value={shares}
                                onChange={(e) => setShares(e.target.value)}
                                min="0.01"
                                step="0.01"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="avgCost">Average Cost ($)</label>
                            <input
                                type="number"
                                id="avgCost"
                                value={avgCost}
                                onChange={(e) => setAvgCost(e.target.value)}
                                min="0.01"
                                step="0.01"
                                required
                            />
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-primary">{editingStock ? 'Save Changes' : 'Add Holding'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
