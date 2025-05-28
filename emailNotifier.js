const nodemailer = require('nodemailer');

class EmailNotifier {
    constructor() {
        this.transporter = null;
        this.initializeTransporter();
    }
    
    initializeTransporter() {
        if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.log('Email configuration not found, notifications disabled');
            return;
        }
        
        this.transporter = nodemailer.createTransporter({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT || 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }
    
    async sendAlert(alert, currentPrice) {
        if (!this.transporter) {
            console.log('Email not configured, skipping notification');
            return false;
        }
        
        try {
            const subject = `Stock Alert: ${alert.symbol} price ${alert.type} $${alert.threshold}`;
            const text = `
Stock Alert Triggered!

Symbol: ${alert.symbol}
Alert Type: Price ${alert.type} $${alert.threshold}
Current Price: $${currentPrice}
Triggered At: ${new Date().toLocaleString()}

This is an automated message from your Stock Alert System.
            `.trim();
            
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: process.env.NOTIFICATION_EMAIL || process.env.EMAIL_USER,
                subject: subject,
                text: text
            };
            
            await this.transporter.sendMail(mailOptions);
            console.log(`Email notification sent for ${alert.symbol}`);
            return true;
        } catch (error) {
            console.error('Failed to send email notification:', error.message);
            return false;
        }
    }
    
    async testConnection() {
        if (!this.transporter) {
            return false;
        }
        
        try {
            await this.transporter.verify();
            console.log('Email configuration is valid');
            return true;
        } catch (error) {
            console.error('Email configuration error:', error.message);
            return false;
        }
    }
}

module.exports = EmailNotifier;