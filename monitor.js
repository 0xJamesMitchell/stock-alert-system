const cron = require('node-cron');
const StockAPI = require('./stockApi');
const AlertManager = require('./alertManager');
const EmailNotifier = require('./emailNotifier');
const PriceHistory = require('./priceHistory');
const logger = require('./logger');

class Monitor {
    constructor() {
        this.stockAPI = new StockAPI();
        this.alertManager = new AlertManager();
        this.emailNotifier = new EmailNotifier();
        this.priceHistory = new PriceHistory();
        this.isRunning = false;
    }
    
    start() {
        if (this.isRunning) {
            console.log('Monitor is already running');
            return;
        }
        
        logger.info('Starting stock price monitor...');
        this.isRunning = true;
        
        const config = require('./config');
        
        cron.schedule(config.getMonitorCronExpression(), async () => {
            logger.info('Starting scheduled price check');
            await this.checkAllStocks();
        });
        
        logger.info(`Monitor scheduled to run every ${config.monitorInterval} minutes`);
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
            
            // Record price in history
            this.priceHistory.addPrice(symbol, stockData.price, stockData.timestamp);
            
            // Get price change info
            const priceChange = this.priceHistory.getPriceChange(symbol);
            if (priceChange) {
                console.log(`${symbol}: $${stockData.price} (${priceChange.change > 0 ? '+' : ''}${priceChange.change.toFixed(2)}, ${priceChange.changePercent.toFixed(2)}%)`);
            }
            
            const triggeredAlerts = this.alertManager.checkAlerts(stockData);
            
            if (triggeredAlerts.length > 0) {
                logger.warn(`${triggeredAlerts.length} alert(s) triggered for ${symbol}`, { 
                    price: stockData.price, 
                    alerts: triggeredAlerts.length 
                });
                
                triggeredAlerts.forEach(alert => {
                    logger.info(`Alert triggered: ${alert.symbol} ${alert.type} $${alert.threshold}`, {
                        currentPrice: alert.currentPrice,
                        threshold: alert.threshold,
                        type: alert.type
                    });
                });
                
                await this.sendNotifications(triggeredAlerts, stockData);
            }
        } catch (error) {
            logger.error(`Error checking stock ${symbol}`, { error: error.message });
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