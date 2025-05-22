const axios = require('axios');

class StockAPI {
    constructor() {
        this.baseURL = 'https://api.polygon.io/v2';
        this.apiKey = process.env.POLYGON_API_KEY;
    }
    
    async getStockPrice(symbol) {
        try {
            const response = await axios.get(`${this.baseURL}/aggs/ticker/${symbol}/prev?adjusted=true&apikey=${this.apiKey}`);
            
            if (response.data && response.data.results && response.data.results.length > 0) {
                return {
                    symbol: symbol,
                    price: response.data.results[0].c,
                    timestamp: new Date()
                };
            }
            
            throw new Error('No data found for symbol');
        } catch (error) {
            console.error(`Error fetching stock price for ${symbol}:`, error.message);
            
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