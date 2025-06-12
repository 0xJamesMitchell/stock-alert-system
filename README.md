# Stock Alert System

A simple web-based stock price monitoring and alert system built with Node.js and Express.

## Features

- Real-time stock price monitoring with mock data fallback
- Customizable price alerts (above/below thresholds)
- Web interface for managing alerts
- Dashboard view with stock lookup and monitoring overview
- Automatic monitoring with configurable intervals
- Email notifications (optional)
- Price history tracking and statistics
- Structured logging with rotation
- Environment-based configuration
- JSON-based data storage

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd stock-alert-system
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

4. (Optional) Copy and configure environment variables:
```bash
cp .env.example .env
# Edit .env with your API keys and email settings
```

5. For development with auto-reload:
```bash
npm run dev
```

## Usage

1. Open your browser and navigate to `http://localhost:3000`
2. **Alerts page**: Add stock symbols and set price thresholds
3. **Dashboard page**: View real-time stock data and monitoring overview
4. Choose whether to alert when price goes above or below the threshold
5. The system will automatically monitor prices and log alerts

## Pages

- `/` - Main alerts management interface
- `/dashboard.html` - Stock dashboard with lookup and monitoring overview

## API Endpoints

### Alerts
- `GET /api/alerts` - Get all alerts
- `POST /api/alerts` - Create a new alert
- `DELETE /api/alerts/:id` - Remove an alert

### Stock Data
- `GET /api/stock/:symbol` - Get current stock price
- `GET /api/history/:symbol?limit=100` - Get price history for a symbol
- `GET /api/stats/:symbol` - Get price statistics for a symbol

### System
- `GET /api/logs?lines=100` - Get recent log entries

## Configuration

The system uses environment variables for configuration. Copy `.env.example` to `.env` and configure:

### Stock Data API
- `POLYGON_API_KEY` - Optional Polygon.io API key for real stock data
- `API_TIMEOUT` - API request timeout in milliseconds (default: 10000)

### Email Notifications
- `EMAIL_HOST` - SMTP server host
- `EMAIL_PORT` - SMTP server port (default: 587)
- `EMAIL_USER` - SMTP username
- `EMAIL_PASS` - SMTP password
- `NOTIFICATION_EMAIL` - Email address to receive alerts

### Monitoring
- `MONITOR_INTERVAL` - Minutes between price checks (default: 5)
- `MAX_HISTORY_RECORDS` - Maximum price records per symbol (default: 1000)

### Server
- `PORT` - Server port (default: 3000)

## Project Structure

```
├── server.js          # Main server file
├── config.js          # Configuration management
├── logger.js          # Logging system with rotation
├── stockApi.js        # Stock price API integration
├── alertManager.js    # Alert storage and management
├── emailNotifier.js   # Email notification service
├── monitor.js         # Background monitoring service
├── priceHistory.js    # Price history tracking
├── public/            # Frontend files
│   ├── index.html     # Main alerts interface
│   ├── dashboard.html # Stock dashboard
│   ├── style.css      # Styles for both pages
│   ├── app.js         # Alerts page functionality
│   └── dashboard.js   # Dashboard functionality
├── .env.example       # Environment configuration template
└── package.json
```

## Data Storage

- `alerts.json` - Active alerts configuration
- `price_history.json` - Historical price data
- `logs/` - Application logs with automatic rotation

## License

MIT