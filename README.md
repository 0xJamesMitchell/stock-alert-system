# Stock Alert System

A simple web-based stock price monitoring and alert system built with Node.js and Express.

## Features

- Real-time stock price monitoring
- Customizable price alerts (above/below thresholds)
- Web interface for managing alerts
- Automatic monitoring every 5 minutes
- JSON-based alert storage

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

4. For development with auto-reload:
```bash
npm run dev
```

## Usage

1. Open your browser and navigate to `http://localhost:3000`
2. Add stock symbols and set price thresholds
3. Choose whether to alert when price goes above or below the threshold
4. The system will automatically monitor prices and log alerts to the console

## API Endpoints

- `GET /api/alerts` - Get all alerts
- `POST /api/alerts` - Create a new alert
- `DELETE /api/alerts/:id` - Remove an alert
- `GET /api/stock/:symbol` - Get current stock price

## Configuration

The system uses mock data by default. To use real stock data, set up a Polygon.io API key:

```bash
export POLYGON_API_KEY=your_api_key_here
```

## Project Structure

```
├── server.js          # Main server file
├── stockApi.js        # Stock price API integration
├── alertManager.js    # Alert storage and management
├── monitor.js         # Background monitoring service
├── public/            # Frontend files
│   ├── index.html
│   ├── style.css
│   └── app.js
└── package.json
```

## License

MIT