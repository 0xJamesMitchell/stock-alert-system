const express = require('express');
const path = require('path');
const config = require('./config');
const StockAPI = require('./stockApi');
const AlertManager = require('./alertManager');
const Monitor = require('./monitor');
const PriceHistory = require('./priceHistory');

const app = express();
const stockAPI = new StockAPI();
const alertManager = new AlertManager();
const priceHistory = new PriceHistory();
const monitor = new Monitor();

app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/stock/:symbol', async (req, res) => {
    try {
        const { symbol } = req.params;
        const stockData = await stockAPI.getStockPrice(symbol);
        res.json(stockData);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch stock data' });
    }
});

app.get('/api/alerts', (req, res) => {
    res.json(alertManager.getAlerts());
});

app.post('/api/alerts', (req, res) => {
    try {
        const { symbol, threshold, type } = req.body;
        const newAlert = alertManager.addAlert({ symbol, threshold, type });
        res.json(newAlert);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create alert' });
    }
});

app.delete('/api/alerts/:id', (req, res) => {
    try {
        const { id } = req.params;
        alertManager.removeAlert(parseFloat(id));
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete alert' });
    }
});

app.get('/api/history/:symbol', (req, res) => {
    try {
        const { symbol } = req.params;
        const limit = parseInt(req.query.limit) || 100;
        const history = priceHistory.getHistory(symbol.toUpperCase(), limit);
        res.json(history);
    } catch (error) {
        res.status(500).json({ error: 'Failed to get price history' });
    }
});

app.get('/api/stats/:symbol', (req, res) => {
    try {
        const { symbol } = req.params;
        const stats = priceHistory.getStats(symbol.toUpperCase());
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: 'Failed to get price stats' });
    }
});

app.listen(config.port, () => {
    console.log(`\n🚀 Stock Alert System started`);
    config.log();
    console.log(`\n📊 Server running on port ${config.port}`);
    monitor.start();
});