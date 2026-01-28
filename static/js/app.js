
document.addEventListener('DOMContentLoaded', () => {
    // Mobile Sidebar Toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');

    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('mobile-visible');
            if (overlay) overlay.classList.toggle('active');
        });
    }

    if (overlay) {
        overlay.addEventListener('click', () => {
            sidebar.classList.remove('mobile-visible');
            overlay.classList.remove('active');
        });
    }

    fetchDashboardData();
    setInterval(fetchDashboardData, 30000); // Poll every 30 seconds

    // Theme Toggle Logic
    // --- Theme Logic ---
    const themeToggle = document.getElementById('themeToggle'); // Header Icon
    const settingsToggle = document.getElementById('settingsThemeToggle'); // Settings Switch
    const htmlElement = document.documentElement;
    const icon = themeToggle ? themeToggle.querySelector('i') : null;

    // Helper to Apply Theme
    function applyTheme(isLight) {
        const theme = isLight ? 'light' : 'dark';

        if (isLight) {
            htmlElement.classList.add('light-mode');
            if (icon) {
                icon.classList.remove('fa-sun');
                icon.classList.add('fa-moon');
            }
        } else {
            htmlElement.classList.remove('light-mode');
            if (icon) {
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
            }
        }

        localStorage.setItem('theme', theme);

        // Sync Settings Switch if it exists
        if (settingsToggle) {
            settingsToggle.checked = !isLight; // Dark = Checked
        }

        // Dispatch event
        window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
    }

    // Init Theme
    const savedTheme = localStorage.getItem('theme');
    const isLightInit = savedTheme === 'light';

    // Set initial state without dispatching event strictly needed, but verify sync
    if (isLightInit) {
        htmlElement.classList.add('light-mode');
        if (icon) {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
        if (settingsToggle) settingsToggle.checked = false;
    } else {
        if (settingsToggle) settingsToggle.checked = true;
    }

    // Header Toggle Event
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const isLightNow = htmlElement.classList.contains('light-mode');
            applyTheme(!isLightNow); // Toggle
        });
    }

    // Settings Toggle Event
    if (settingsToggle) {
        settingsToggle.addEventListener('change', (e) => {
            const isDark = e.target.checked;
            applyTheme(!isDark); // Checked(Dark) -> isLight=False
        });
    }

    // --- Analytics Chart Logic ---
    const ctx = document.getElementById('analyticsChart');
    if (ctx) {
        let chartType = 'line'; // Default
        let analyticsChart;

        const chartData = {
            labels: ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'],
            datasets: [
                {
                    label: 'Sensor A (Dwntwn)',
                    data: [42, 45, 48, 55, 60, 58, 52, 48, 50, 55],
                    borderColor: '#00E396', // Green
                    backgroundColor: 'rgba(0, 227, 150, 0.2)',
                    borderWidth: 2,
                    pointBackgroundColor: '#00E396',
                    tension: 0.4,
                    fill: false
                },
                {
                    label: 'Sensor B (Park)',
                    data: [30, 32, 35, 38, 40, 38, 35, 32, 30, 32],
                    borderColor: '#008FFB', // Blue
                    backgroundColor: 'rgba(0, 143, 251, 0.2)',
                    borderWidth: 2,
                    pointBackgroundColor: '#008FFB',
                    tension: 0.4,
                    fill: false
                },
                {
                    label: 'Sensor C (Indstryl)',
                    data: [65, 70, 75, 80, 85, 90, 85, 80, 75, 70],
                    borderColor: '#FEB019', // Orange
                    backgroundColor: 'rgba(254, 176, 25, 0.2)',
                    borderWidth: 2,
                    pointBackgroundColor: '#FEB019',
                    tension: 0.4,
                    fill: false
                }
            ]
        };

        const config = {
            type: chartType,
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: { color: '#fff' }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        ticks: { color: '#aaa' }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: '#aaa' }
                    }
                },
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
            }
        };

        analyticsChart = new Chart(ctx, config);

        // Global function for toggle button
        window.updateChartType = function (type) {
            const curveBtn = document.getElementById('curveBtn');
            const barBtn = document.getElementById('barBtn');

            // Toggle Active Classes
            if (type === 'line') {
                curveBtn.classList.add('active');
                barBtn.classList.remove('active');

                analyticsChart.config.type = 'line';
            } else {
                barBtn.classList.add('active');
                curveBtn.classList.remove('active');

                analyticsChart.config.type = 'bar';
            }
            analyticsChart.update();
        };

        // Sensor Filter Logic
        const sensorFilter = document.getElementById('sensorFilter');
        if (sensorFilter) {
            sensorFilter.addEventListener('change', (e) => {
                const val = e.target.value;

                analyticsChart.data.datasets.forEach((dataset, index) => {
                    if (val === 'all') {
                        // Show all
                        dataset.hidden = false;
                    } else {
                        // Show only matching index
                        dataset.hidden = index !== parseInt(val);
                    }
                });
                analyticsChart.update();
            });
        }

        // --- Heatmap Logic ---
        const heatmapGrid = document.getElementById('heatmapGrid');
        if (heatmapGrid) {
            // Generate 7 days * 24 hours = 168 cells
            for (let i = 0; i < 168; i++) {
                const cell = document.createElement('div');
                cell.className = 'heat-cell';

                // Random intensity
                const intensity = Math.random();
                let color;

                if (intensity < 0.6) {
                    // Good: Green
                    color = `rgba(0, 227, 150, ${0.2 + (Math.random() * 0.4)})`;
                } else if (intensity < 0.85) {
                    // Moderate: Yellow
                    color = `rgba(254, 176, 25, ${0.3 + (Math.random() * 0.5)})`;
                } else {
                    // Poor: Red
                    color = `rgba(255, 69, 96, ${0.4 + (Math.random() * 0.6)})`;
                }

                cell.style.backgroundColor = color;

                // Tooltip title
                const day = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][Math.floor(i / 24)];
                const hour = i % 24; // 0-23
                cell.title = `${day} ${hour}:00 - AQI: ${Math.floor(intensity * 100)}`;

                heatmapGrid.appendChild(cell);
            }
        }

        // Listen for Theme Change to update chart colors
        window.addEventListener('themeChanged', (e) => {
            const isLight = e.detail.theme === 'light';
            const textColor = isLight ? '#333' : '#fff';
            const gridColor = isLight ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)';

            analyticsChart.options.plugins.legend.labels.color = textColor;
            analyticsChart.options.scales.x.ticks.color = textColor;
            analyticsChart.options.scales.y.ticks.color = textColor;
            analyticsChart.options.scales.y.grid.color = gridColor;
            analyticsChart.update();
        });
    }

    // --- Blog Form Logic ---
    const addTitleBtn = document.getElementById('addTitleBtn');
    const blogForm = document.getElementById('blogForm');
    const closeFormBtn = document.getElementById('closeFormBtn'); // New Close Button
    const clearBtn = document.getElementById('clearBtn');
    const sendBtn = document.getElementById('sendBtn');
    const dropZone = document.getElementById('dropZone');

    if (addTitleBtn && blogForm) {
        addTitleBtn.addEventListener('click', () => {
            // Toggle form visibility
            if (blogForm.style.display === 'none') {
                blogForm.style.display = 'block';
            } else {
                blogForm.style.display = 'none';
            }
        });
    }

    // Close button logic
    if (closeFormBtn && blogForm) {
        closeFormBtn.addEventListener('click', () => {
            blogForm.style.display = 'none';
        });
    }

    if (clearBtn) {
        // Character Counts
        const postTitle = document.getElementById('postTitle');
        const titleCount = document.getElementById('titleCount');
        const postDesc = document.getElementById('postDesc');
        const descCount = document.getElementById('descCount');

        if (postTitle && titleCount) {
            postTitle.addEventListener('input', function () {
                titleCount.textContent = `${this.value.length}/90`;
            });
        }

        if (postDesc && descCount) {
            postDesc.addEventListener('input', function () {
                descCount.textContent = `${this.value.length}/2000`;
            });
        }
    }

    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            // Clear inputs
            document.getElementById('postTitle').value = '';
            document.getElementById('postDesc').value = '';
            // Hide form
            blogForm.style.display = 'none';
        });
    }

    // Drag & Drop Visuals
    if (dropZone) {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, preventDefaults, false);
        });

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, highlight, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, unhighlight, false);
        });

        function highlight(e) {
            dropZone.classList.add('dragover');
        }

        function unhighlight(e) {
            dropZone.classList.remove('dragover');
        }

        dropZone.addEventListener('drop', (e) => {
            // Handle file drop if needed (just visual for now)
            // const dt = e.dataTransfer;
            // const files = dt.files;
        });
    }
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

    // Update CO/CO2 - Not in dashboard currently
    // const coElement = document.querySelector('.stat-card:nth-child(2) .stat-value span:first-child');
    // if (coElement) coElement.textContent = latest.co;

    // Update Temp - 2nd Card
    const tempElement = document.querySelector('.stat-card:nth-child(2) .stat-value');
    if (tempElement) tempElement.textContent = `${latest.temperature}°C`;

    // Update Humidity - 3rd Card
    const humElement = document.querySelector('.stat-card:nth-child(3) .stat-value');
    if (humElement) humElement.textContent = `${latest.humidity}%`;

    // Check Danger Levels
    checkDangerLevel(latest);
}

// Notification System
const notifBadge = document.getElementById('notifBadge');
const notifList = document.getElementById('notifList');
const notificationBtn = document.getElementById('notificationBtn');
const notificationDropdown = document.getElementById('notificationDropdown');
const clearNotifs = document.getElementById('clearNotifs');

let notifications = [];

function checkDangerLevel(data) {
    if (data.aqi > 100) {
        // Check if already notified to avoid spam (simple check)
        const msg = `Critical Warning: High AQI (${data.aqi}) detected!`;
        const exists = notifications.some(n => n.message === msg);

        if (!exists) {
            addNotification(msg, 'danger');
        }
    }
}

function addNotification(message, type) {
    // Add to array
    notifications.unshift({ message, type, time: new Date() });

    // Show Badge
    if (notifBadge) notifBadge.classList.remove('hidden');

    // Render list
    renderNotifications();
}

function renderNotifications() {
    if (!notifList) return;

    notifList.innerHTML = '';

    if (notifications.length === 0) {
        notifList.innerHTML = '<div class="empty-state" style="padding:10px; color:var(--text-secondary); font-size:12px;">No new alerts</div>';
        return;
    }

    notifications.forEach(n => {
        const item = document.createElement('div');
        item.className = `notif-item ${n.type}`;
        item.innerHTML = `
            <i class="fa-solid fa-triangle-exclamation notif-icon"></i>
            <div>
                <div style="font-weight: 600;">High AQI Alert</div>
                <div style="color: var(--text-secondary);">${n.message}</div>
                <div style="font-size: 10px; color: #666; margin-top: 4px;">Just now</div>
            </div>
        `;
        notifList.appendChild(item);
    });
}

// Toggle Dropdown
if (notificationBtn && notificationDropdown) {
    notificationBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        notificationDropdown.classList.toggle('hidden');
    });

    // Close on outside click
    window.addEventListener('click', () => {
        if (!notificationDropdown.classList.contains('hidden')) {
            notificationDropdown.classList.add('hidden');
        }
    });

    notificationDropdown.addEventListener('click', (e) => {
        e.stopPropagation(); // prevent closing when clicking inside
    });
}

// Clear Notifications
if (clearNotifs) {
    clearNotifs.addEventListener('click', () => {
        notifications = [];
        renderNotifications();
        if (notifBadge) notifBadge.classList.add('hidden');
    });
}
