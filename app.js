
document.addEventListener('DOMContentLoaded', () => {
    fetchDashboardData();
    setInterval(fetchDashboardData, 30000); // Poll every 30 seconds
});

async function fetchDashboardData() {
    try {
        const response = await fetch('/api/readings/');
        const data = await response.json();
        
        if (data && data.length > 0) {
            updateStats(data);
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

function updateStats(readings) {
    // In a real app we might want to get the "latest" reading per sensor
    // For now, let's just grab the most recent reading from the list
    const latest = readings[0]; 

    // Update AQI
    const aqiElement = document.querySelector('.stat-card:nth-child(1) .stat-value');
    if (aqiElement) aqiElement.textContent = latest.aqi;

    const aqiStatus = document.querySelector('.stat-card:nth-child(1) div:nth-child(2) div:nth-child(2)');
    if (aqiStatus) {
        if (latest.aqi <= 50) {
            aqiStatus.textContent = "EXCELLENT";
            aqiStatus.style.color = "var(--success)";
        } else if (latest.aqi <= 100) {
            aqiStatus.textContent = "MODERATE";
            aqiStatus.style.color = "var(--warning)";
        } else {
            aqiStatus.textContent = "POOR";
            aqiStatus.style.color = "var(--danger)";
        }
    }

    // Update CO/CO2
    const coElement = document.querySelector('.stat-card:nth-child(2) .stat-value span:first-child');
    if (coElement) coElement.textContent = latest.co;

    // Update Temp
    const tempElement = document.querySelector('.stat-card:nth-child(3) div:first-child div:first-child');
    if (tempElement) tempElement.textContent = `${latest.temperature}°C`;

    // Update Humidity
    const humElement = document.querySelector('.stat-card:nth-child(3) .text-align-right div:first-child');
    // Note: The selector above might be tricky with inline styles, let's use a more robust one or assumes order
    const humContainer = document.querySelector('.stat-card:nth-child(3) > div:last-child > div:last-child > div:first-child');
     if (humContainer) humContainer.textContent = `${latest.humidity}%`;
}
