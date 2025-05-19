document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('stock-form');
    const alertsContainer = document.getElementById('alerts-container');
    
    let alerts = [];
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const symbol = document.getElementById('symbol').value.toUpperCase();
        const priceThreshold = parseFloat(document.getElementById('price-threshold').value);
        const alertType = document.getElementById('alert-type').value;
        
        const newAlert = {
            id: Date.now(),
            symbol: symbol,
            threshold: priceThreshold,
            type: alertType,
            active: true
        };
        
        alerts.push(newAlert);
        renderAlerts();
        form.reset();
    });
    
    function renderAlerts() {
        if (alerts.length === 0) {
            alertsContainer.innerHTML = '<p>No alerts configured yet.</p>';
            return;
        }
        
        alertsContainer.innerHTML = alerts.map(alert => `
            <div class="alert-item">
                <span>${alert.symbol} - ${alert.type} $${alert.threshold}</span>
                <button onclick="removeAlert(${alert.id})">Remove</button>
            </div>
        `).join('');
    }
    
    window.removeAlert = function(id) {
        alerts = alerts.filter(alert => alert.id !== id);
        renderAlerts();
    };
});