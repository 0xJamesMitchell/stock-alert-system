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
        } catch (error) {
            console.log('No existing alerts file, starting fresh');
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
        const newAlert = {
            id: Date.now() + Math.random(),
            symbol: alert.symbol.toUpperCase(),
            threshold: parseFloat(alert.threshold),
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