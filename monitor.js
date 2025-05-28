const cron = require('node-cron');
const StockAPI = require('./stockApi');
const AlertManager = require('./alertManager');
const EmailNotifier = require('./emailNotifier');

class Monitor {
    constructor() {
        this.stockAPI = new StockAPI();
        this.alertManager = new AlertManager();
        this.emailNotifier = new EmailNotifier();
        this.isRunning = false;
    }
    
    start() {
        if (this.isRunning) {
            console.log('Monitor is already running');
            return;
        }
        
        console.log('Starting stock price monitor...');
        this.isRunning = true;
        
        cron.schedule('*/5 * * * *', async () => {
            console.log('Checking stock prices...');
            await this.checkAllStocks();
        });
        
        console.log('Monitor scheduled to run every 5 minutes');
    }
    
    async checkAllStocks() {
        try {
            const alerts = this.alertManager.getAlerts();
            const uniqueSymbols = [...new Set(alerts.map(alert => alert.symbol))];
            
            for (const symbol of uniqueSymbols) {
                await this.checkStock(symbol);
                await this.sleep(1000);
            }
        } catch (error) {
            console.error('Error during monitoring check:', error);
        }
    }
    
    async checkStock(symbol) {
        try {
            const stockData = await this.stockAPI.getStockPrice(symbol);
            const triggeredAlerts = this.alertManager.checkAlerts(stockData);
            
            if (triggeredAlerts.length > 0) {
                console.log(`🚨 ${triggeredAlerts.length} alert(s) triggered for ${symbol} at $${stockData.price}`);
                
                triggeredAlerts.forEach(alert => {
                    console.log(`Alert: ${alert.symbol} ${alert.type} $${alert.threshold} - Current: $${alert.currentPrice}`);
                });
                
                await this.sendNotifications(triggeredAlerts, stockData);
            }
        } catch (error) {
            console.error(`Error checking stock ${symbol}:`, error.message);
        }
    }
    
    async sendNotifications(alerts, stockData) {
        for (const alert of alerts) {
            console.log(`📧 Notification sent for ${alert.symbol}: Price ${alert.type} $${alert.threshold} (Current: $${stockData.price})`);
            
            try {
                await this.emailNotifier.sendAlert(alert, stockData.price);
            } catch (error) {
                console.error(`Failed to send email for ${alert.symbol}:`, error.message);
            }
        }
    }
    
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    stop() {
        console.log('Stopping monitor...');
        this.isRunning = false;
    }
}

module.exports = Monitor;