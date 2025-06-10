const fs = require('fs').promises;
const path = require('path');

class Logger {
    constructor() {
        this.logDir = path.join(__dirname, 'logs');
        this.logFile = path.join(this.logDir, 'app.log');
        this.maxLogSize = 10 * 1024 * 1024; // 10MB
        this.maxLogFiles = 5;
        this.ensureLogDir();
    }
    
    async ensureLogDir() {
        try {
            await fs.mkdir(this.logDir, { recursive: true });
        } catch (error) {
            console.error('Failed to create log directory:', error.message);
        }
    }
    
    formatMessage(level, message, data = null) {
        const timestamp = new Date().toISOString();
        let logEntry = `${timestamp} [${level.toUpperCase()}] ${message}`;
        
        if (data) {
            logEntry += ` ${JSON.stringify(data)}`;
        }
        
        return logEntry + '\n';
    }
    
    async writeLog(level, message, data = null) {
        try {
            const logEntry = this.formatMessage(level, message, data);
            
            // Also output to console for development
            if (level === 'error') {
                console.error(message, data);
            } else if (level === 'warn') {
                console.warn(message, data);
            } else {
                console.log(message, data);
            }
            
            await this.checkLogRotation();
            await fs.appendFile(this.logFile, logEntry);
        } catch (error) {
            console.error('Failed to write log:', error.message);
        }
    }
    
    async checkLogRotation() {
        try {
            const stats = await fs.stat(this.logFile);
            
            if (stats.size > this.maxLogSize) {
                await this.rotateLog();
            }
        } catch (error) {
            // Log file doesn't exist yet, no need to rotate
        }
    }
    
    async rotateLog() {
        try {
            // Move current log to backup
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupFile = path.join(this.logDir, `app.${timestamp}.log`);
            
            await fs.rename(this.logFile, backupFile);
            
            // Clean up old log files
            await this.cleanupOldLogs();
            
            this.info('Log rotated', { backupFile });
        } catch (error) {
            console.error('Failed to rotate log:', error.message);
        }
    }
    
    async cleanupOldLogs() {
        try {
            const files = await fs.readdir(this.logDir);
            const logFiles = files
                .filter(file => file.startsWith('app.') && file.endsWith('.log'))
                .sort()
                .reverse();
            
            if (logFiles.length > this.maxLogFiles) {
                const filesToDelete = logFiles.slice(this.maxLogFiles);
                
                for (const file of filesToDelete) {
                    await fs.unlink(path.join(this.logDir, file));
                }
            }
        } catch (error) {
            console.error('Failed to cleanup old logs:', error.message);
        }
    }
    
    info(message, data = null) {
        return this.writeLog('info', message, data);
    }
    
    warn(message, data = null) {
        return this.writeLog('warn', message, data);
    }
    
    error(message, data = null) {
        return this.writeLog('error', message, data);
    }
    
    debug(message, data = null) {
        if (process.env.NODE_ENV !== 'production') {
            return this.writeLog('debug', message, data);
        }
    }
    
    async getRecentLogs(lines = 100) {
        try {
            const content = await fs.readFile(this.logFile, 'utf8');
            const logLines = content.trim().split('\n');
            return logLines.slice(-lines);
        } catch (error) {
            return [];
        }
    }
}

module.exports = new Logger();