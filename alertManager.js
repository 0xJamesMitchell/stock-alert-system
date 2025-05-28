const fs = require('fs').promises;
const path = require('path');

class AlertManager {
    constructor() {
        this.alertsFile = path.join(__dirname, 'alerts.json');
        this.alerts = [];
        this.loadAlerts();
    }
    
    async loadAlerts() {
        try {
            const data = await fs.readFile(this.alertsFile, 'utf8');
            this.alerts = JSON.parse(data);
            console.log(`Loaded ${this.alerts.length} alerts from storage`);
        } catch (error) {
            if (error.code === 'ENOENT') {
                console.log('No existing alerts file, starting fresh');
            } else {
                console.error('Error loading alerts file:', error.message);
            }
            this.alerts = [];
        }
    }
    
    async saveAlerts() {
        try {
            await fs.writeFile(this.alertsFile, JSON.stringify(this.alerts, null, 2));
        } catch (error) {
            console.error('Error saving alerts:', error);
        }
    }
    
    addAlert(alert) {
        if (!alert.symbol || !alert.threshold || !alert.type) {
            throw new Error('Missing required alert parameters');
        }
        
        if (!['above', 'below'].includes(alert.type)) {
            throw new Error('Alert type must be "above" or "below"');
        }
        
        const threshold = parseFloat(alert.threshold);
        if (isNaN(threshold) || threshold <= 0) {
            throw new Error('Threshold must be a positive number');
        }
        
        const newAlert = {
            id: Date.now() + Math.random(),
            symbol: alert.symbol.toUpperCase().trim(),
            threshold: threshold,
            type: alert.type,
            active: true,
            createdAt: new Date().toISOString()
        };
        
        this.alerts.push(newAlert);
        this.saveAlerts();
        return newAlert;
    }
    
    removeAlert(id) {
        this.alerts = this.alerts.filter(alert => alert.id !== id);
        this.saveAlerts();
    }
    
    getAlerts() {
        return this.alerts;
    }
    
    checkAlerts(stockData) {
        const triggeredAlerts = [];
        
        this.alerts.forEach(alert => {
            if (!alert.active || alert.symbol !== stockData.symbol) return;
            
            const shouldTrigger = (
                (alert.type === 'above' && stockData.price >= alert.threshold) ||
                (alert.type === 'below' && stockData.price <= alert.threshold)
            );
            
            if (shouldTrigger) {
                triggeredAlerts.push({
                    ...alert,
                    currentPrice: stockData.price,
                    triggeredAt: new Date().toISOString()
                });
            }
        });
        
        return triggeredAlerts;
    }
}

module.exports = AlertManager;