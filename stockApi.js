const axios = require('axios');

class StockAPI {
    constructor() {
        this.baseURL = 'https://api.polygon.io/v2';
        this.apiKey = process.env.POLYGON_API_KEY;
    }
    
    async getStockPrice(symbol) {
        if (!symbol || typeof symbol !== 'string') {
            throw new Error('Invalid stock symbol provided');
        }
        
        try {
            if (!this.apiKey) {
                console.log(`Using mock data for ${symbol} (no API key configured)`);
                return this.getMockPrice(symbol);
            }
            
            const response = await axios.get(
                `${this.baseURL}/aggs/ticker/${symbol}/prev?adjusted=true&apikey=${this.apiKey}`,
                { timeout: 10000 }
            );
            
            if (response.data && response.data.results && response.data.results.length > 0) {
                return {
                    symbol: symbol,
                    price: response.data.results[0].c,
                    timestamp: new Date(),
                    source: 'polygon'
                };
            }
            
            throw new Error('No data found for symbol');
        } catch (error) {
            if (error.code === 'ECONNABORTED') {
                console.error(`Timeout fetching ${symbol}, using mock data`);
            } else if (error.response) {
                console.error(`API error for ${symbol}: ${error.response.status} - ${error.response.statusText}`);
            } else {
                console.error(`Network error for ${symbol}: ${error.message}`);
            }
            
            return this.getMockPrice(symbol);
        }
    }
    
    getMockPrice(symbol) {
        const mockPrices = {
            'AAPL': 175.50 + (Math.random() - 0.5) * 10,
            'GOOGL': 142.30 + (Math.random() - 0.5) * 20,
            'TSLA': 248.75 + (Math.random() - 0.5) * 30,
            'MSFT': 378.85 + (Math.random() - 0.5) * 15,
        };
        
        const basePrice = mockPrices[symbol] || 100 + Math.random() * 200;
        
        return {
            symbol: symbol,
            price: parseFloat(basePrice.toFixed(2)),
            timestamp: new Date(),
            mock: true
        };
    }
}

module.exports = StockAPI;