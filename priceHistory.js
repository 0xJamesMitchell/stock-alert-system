const fs = require('fs').promises;
const path = require('path');

class PriceHistory {
    constructor() {
        this.historyFile = path.join(__dirname, 'price_history.json');
        this.history = {};
        this.loadHistory();
        this.maxRecords = 1000; // keep last 1000 records per symbol
    }
    
    async loadHistory() {
        try {
            const data = await fs.readFile(this.historyFile, 'utf8');
            this.history = JSON.parse(data);
            console.log(`Loaded price history for ${Object.keys(this.history).length} symbols`);
        } catch (error) {
            if (error.code === 'ENOENT') {
                console.log('No existing price history file, starting fresh');
            } else {
                console.error('Error loading price history:', error.message);
            }
            this.history = {};
        }
    }
    
    async saveHistory() {
        try {
            await fs.writeFile(this.historyFile, JSON.stringify(this.history, null, 2));
        } catch (error) {
            console.error('Error saving price history:', error);
        }
    }
    
    addPrice(symbol, price, timestamp = new Date()) {
        if (!symbol || typeof price !== 'number') {
            return;
        }
        
        if (!this.history[symbol]) {
            this.history[symbol] = [];
        }
        
        const priceRecord = {
            price: price,
            timestamp: timestamp.toISOString()
        };
        
        this.history[symbol].push(priceRecord);
        
        // keep only the last maxRecords entries
        if (this.history[symbol].length > this.maxRecords) {
            this.history[symbol] = this.history[symbol].slice(-this.maxRecords);
        }
        
        this.saveHistory();
    }
    
    getHistory(symbol, limit = 100) {
        if (!this.history[symbol]) {
            return [];
        }
        
        return this.history[symbol].slice(-limit);
    }
    
    getLatestPrice(symbol) {
        const symbolHistory = this.history[symbol];
        if (!symbolHistory || symbolHistory.length === 0) {
            return null;
        }
        
        return symbolHistory[symbolHistory.length - 1];
    }
    
    getPriceChange(symbol, hours = 24) {
        const symbolHistory = this.history[symbol];
        if (!symbolHistory || symbolHistory.length < 2) {
            return null;
        }
        
        const now = new Date();
        const cutoffTime = new Date(now.getTime() - (hours * 60 * 60 * 1000));
        
        const recent = symbolHistory[symbolHistory.length - 1];
        const older = symbolHistory.find(record => 
            new Date(record.timestamp) <= cutoffTime
        );
        
        if (!older) {
            return null;
        }
        
        return {
            current: recent.price,
            previous: older.price,
            change: recent.price - older.price,
            changePercent: ((recent.price - older.price) / older.price) * 100
        };
    }
    
    getStats(symbol) {
        const symbolHistory = this.history[symbol];
        if (!symbolHistory || symbolHistory.length === 0) {
            return null;
        }
        
        const prices = symbolHistory.map(record => record.price);
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        const avg = prices.reduce((sum, price) => sum + price, 0) / prices.length;
        
        return {
            count: prices.length,
            min: min,
            max: max,
            average: avg,
            latest: prices[prices.length - 1]
        };
    }
}

module.exports = PriceHistory;