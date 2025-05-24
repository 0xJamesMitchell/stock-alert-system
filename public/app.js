document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('stock-form');
    const alertsContainer = document.getElementById('alerts-container');
    
    loadAlerts();
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const symbol = document.getElementById('symbol').value.toUpperCase();
        const threshold = parseFloat(document.getElementById('price-threshold').value);
        const type = document.getElementById('alert-type').value;
        
        try {
            const response = await fetch('/api/alerts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ symbol, threshold, type })
            });
            
            if (response.ok) {
                form.reset();
                loadAlerts();
            } else {
                alert('Failed to create alert');
            }
        } catch (error) {
            console.error('Error creating alert:', error);
            alert('Failed to create alert');
        }
    });
    
    async function loadAlerts() {
        try {
            const response = await fetch('/api/alerts');
            const alerts = await response.json();
            renderAlerts(alerts);
        } catch (error) {
            console.error('Error loading alerts:', error);
        }
    }
    
    function renderAlerts(alerts) {
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
    
    window.removeAlert = async function(id) {
        try {
            const response = await fetch(`/api/alerts/${id}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                loadAlerts();
            } else {
                alert('Failed to remove alert');
            }
        } catch (error) {
            console.error('Error removing alert:', error);
            alert('Failed to remove alert');
        }
    };
});