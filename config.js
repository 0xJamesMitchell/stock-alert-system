require('dotenv').config();

class Config {
    constructor() {
        this.port = process.env.PORT || 3000;
        this.polygonApiKey = process.env.POLYGON_API_KEY;
        this.monitorInterval = parseInt(process.env.MONITOR_INTERVAL) || 5;
        this.maxHistoryRecords = parseInt(process.env.MAX_HISTORY_RECORDS) || 1000;
        
        // Email configuration
        this.email = {
            host: process.env.EMAIL_HOST,
            port: parseInt(process.env.EMAIL_PORT) || 587,
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
            notificationEmail: process.env.NOTIFICATION_EMAIL
        };
        
        // API configuration
        this.api = {
            timeout: parseInt(process.env.API_TIMEOUT) || 10000,
            retryAttempts: parseInt(process.env.API_RETRY_ATTEMPTS) || 3,
            rateLimitDelay: parseInt(process.env.API_RATE_LIMIT_DELAY) || 1000
        };
    }
    
    isEmailConfigured() {
        return !!(this.email.host && this.email.user && this.email.pass);
    }
    
    hasPolygonKey() {
        return !!this.polygonApiKey;
    }
    
    getMonitorCronExpression() {
        return `*/${this.monitorInterval} * * * *`;
    }
    
    validate() {
        const warnings = [];
        
        if (!this.hasPolygonKey()) {
            warnings.push('No Polygon API key configured, using mock data');
        }
        
        if (!this.isEmailConfigured()) {
            warnings.push('Email not configured, notifications will only appear in logs');
        }
        
        if (this.monitorInterval < 1) {
            warnings.push('Monitor interval too low, using minimum of 1 minute');
            this.monitorInterval = 1;
        }
        
        return warnings;
    }
    
    log() {
        console.log('Configuration:');
        console.log(`  Port: ${this.port}`);
        console.log(`  Monitor interval: ${this.monitorInterval} minutes`);
        console.log(`  Polygon API: ${this.hasPolygonKey() ? 'Configured' : 'Not configured (using mock data)'}`);
        console.log(`  Email notifications: ${this.isEmailConfigured() ? 'Configured' : 'Not configured'}`);
        console.log(`  Max history records: ${this.maxHistoryRecords}`);
        
        const warnings = this.validate();
        if (warnings.length > 0) {
            console.log('\nWarnings:');
            warnings.forEach(warning => console.log(`  ⚠️  ${warning}`));
        }
    }
}

module.exports = new Config();