document.addEventListener('DOMContentLoaded', function() {
    loadMonitoredStocks();
    setInterval(loadMonitoredStocks, 30000); // refresh every 30 seconds
});

async function lookupStock() {
    const symbol = document.getElementById('lookup-symbol').value.toUpperCase().trim();
    const stockInfo = document.getElementById('stock-info');
    
    if (!symbol) {
        alert('Please enter a stock symbol');
        return;
    }
    
    try {
        stockInfo.innerHTML = '<p>Loading...</p>';
        
        const response = await fetch(`/api/stock/${symbol}`);
        const stockData = await response.json();
        
        if (response.ok) {
            const statsResponse = await fetch(`/api/stats/${symbol}`);
            const stats = statsResponse.ok ? await statsResponse.json() : null;
            
            stockInfo.innerHTML = `
                <div class="stock-card">
                    <h3>${stockData.symbol}</h3>
                    <div class="price">$${stockData.price}</div>
                    <div class="timestamp">Last updated: ${new Date(stockData.timestamp).toLocaleString()}</div>
                    ${stockData.source ? `<div class="source">Source: ${stockData.source}</div>` : ''}
                    ${stockData.mock ? '<div class="mock-indicator">Mock Data</div>' : ''}
                    ${stats ? `
                        <div class="stats">
                            <div>Records: ${stats.count}</div>
                            <div>Min: $${stats.min.toFixed(2)}</div>
                            <div>Max: $${stats.max.toFixed(2)}</div>
                            <div>Avg: $${stats.average.toFixed(2)}</div>
                        </div>
                    ` : ''}
                </div>
            `;
        } else {
            stockInfo.innerHTML = '<p class="error">Failed to fetch stock data</p>';
        }
    } catch (error) {
        console.error('Error:', error);
        stockInfo.innerHTML = '<p class="error">Error fetching stock data</p>';
    }
}

async function loadMonitoredStocks() {
    try {
        const response = await fetch('/api/alerts');
        const alerts = await response.json();
        
        const monitoredStocks = document.getElementById('monitored-stocks');
        
        if (alerts.length === 0) {
            monitoredStocks.innerHTML = '<p>No stocks being monitored</p>';
            return;
        }
        
        const symbols = [...new Set(alerts.map(alert => alert.symbol))];
        const stocksHtml = await Promise.all(symbols.map(async (symbol) => {
            try {
                const stockResponse = await fetch(`/api/stock/${symbol}`);
                const stockData = await stockResponse.json();
                
                const alertsForSymbol = alerts.filter(alert => alert.symbol === symbol);
                
                return `
                    <div class="stock-summary">
                        <div class="symbol">${symbol}</div>
                        <div class="price">$${stockData.price}</div>
                        <div class="alerts">${alertsForSymbol.length} alert(s)</div>
                        <div class="timestamp">${new Date(stockData.timestamp).toLocaleString()}</div>
                    </div>
                `;
            } catch (error) {
                return `
                    <div class="stock-summary error">
                        <div class="symbol">${symbol}</div>
                        <div class="error">Failed to load</div>
                    </div>
                `;
            }
        }));
        
        monitoredStocks.innerHTML = stocksHtml.join('');
        
    } catch (error) {
        console.error('Error loading monitored stocks:', error);
        document.getElementById('monitored-stocks').innerHTML = '<p class="error">Error loading data</p>';
    }
}

// Auto-refresh when Enter is pressed in lookup field
document.getElementById('lookup-symbol').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        lookupStock();
    }
});