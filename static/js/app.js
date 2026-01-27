
document.addEventListener('DOMContentLoaded', () => {
    fetchDashboardData();
    setInterval(fetchDashboardData, 30000); // Poll every 30 seconds

    // Theme Toggle Logic
    const themeToggle = document.getElementById('themeToggle');
    const htmlElement = document.documentElement;
    const icon = themeToggle ? themeToggle.querySelector('i') : null;

    // init theme
    if (localStorage.getItem('theme') === 'light') {
        htmlElement.classList.add('light-mode');
        if (icon) {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const isLight = htmlElement.classList.toggle('light-mode');
            const theme = isLight ? 'light' : 'dark';

            localStorage.setItem('theme', theme);
            if (icon) {
                icon.classList.remove(isLight ? 'fa-sun' : 'fa-moon');
                icon.classList.add(isLight ? 'fa-moon' : 'fa-sun');
            }

            // Dispatch event for other components (like Map)
            window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
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
