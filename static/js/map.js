document.addEventListener('DOMContentLoaded', () => {
    // Initialize Leaflet Map
    // Coordinates for Chennai: 13.0856° N, 80.2379° E
    const map = L.map('map', {
        zoomControl: false // Hide default zoom controls to match design (or add custom ones if needed)
    }).setView([13.0856, 80.2379], 13);

    // Add Dark Matter Tiles (CartoDB) - Free and nice dark theme
    // Base Map Layers
    const darkTiles = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    const lightTiles = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

    // Determine initial theme
    const isLight = document.documentElement.classList.contains('light-mode') || localStorage.getItem('theme') === 'light';
    const initialTiles = isLight ? lightTiles : darkTiles;

    const tileLayer = L.tileLayer(initialTiles, {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
    }).addTo(map);

    // Listen for Theme Changes
    window.addEventListener('themeChanged', (e) => {
        const theme = e.detail.theme;
        if (theme === 'light') {
            tileLayer.setUrl(lightTiles);
        } else {
            tileLayer.setUrl(darkTiles);
        }
    });

    // Add Marker
    let marker = L.marker([13.0856, 80.2379]).addTo(map)
        .bindPopup('<b>Sensor 1</b><br>Status: Online', {
            autoClose: false,
            closeOnClick: false
        })
        .openPopup();

    // Add Sensor 2 Marker
    L.marker([13.0774, 80.2425]).addTo(map)
        .bindPopup('<b>Sensor 2</b><br>Status: Online')
        .openPopup();

    // Add Custom Zoom Control to match the UI placement
    L.control.zoom({
        position: 'topright'
    }).addTo(map);

    // Fix for map not rendering correctly if container size changes
    setTimeout(() => {
        map.invalidateSize();
    }, 100);


    // --- Search Functionality ---

    const searchInput = document.getElementById('searchInput');

    if (searchInput) {
        searchInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                const query = this.value;
                if (query.length > 2) {
                    searchLocation(query);
                }
            }
        });
    }

    async function searchLocation(query) {
        // Appending "Chennai" and using viewbox to restrict/prioritize Chennai results
        // Approx bounding box for Chennai: 80.10, 12.85 (SW) to 80.35, 13.20 (NE)
        // Format: viewbox=<left>,<top>,<right>,<bottom>  (top/bottom might be inverted depending on API, usually minLon,maxLat,maxLon,minLat or similar. Nominatim uses x1,y1,x2,y2)
        // Correct Nominatim viewbox standard: left,top,right,bottom -> minLon, maxLat, maxLon, minLat
        // But for safe construction, we'll append "Chennai" to the query as the primary filter.

        const encodedQuery = encodeURIComponent(query + ', Chennai');
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedQuery}&bounded=1&viewbox=80.15,13.20,80.35,12.90`;

        try {
            // Add loading state opacity
            document.getElementById('map').style.opacity = '0.7';

            const response = await fetch(url);
            const data = await response.json();

            if (data && data.length > 0) {
                const result = data[0];
                const lat = parseFloat(result.lat);
                const lon = parseFloat(result.lon);

                // Update Map
                map.setView([lat, lon], 15);
                marker.setLatLng([lat, lon]);

                // Update Label if it exists
                const labelTitle = document.querySelector('.map-overlay h4');
                if (labelTitle) {
                    // Extract a readable name (e.g. first part of display_name)
                    const name = result.name || query.toUpperCase();
                    labelTitle.innerText = `STREET VIEW: ${name.toUpperCase()}`;
                }

                // Clear input
                // searchInput.value = ''; 
            } else {
                alert('Location not found in Chennai. Please try another specific area name.');
            }
        } catch (error) {
            console.error('Search error:', error);
            alert('Error searching for location.');
        } finally {
            document.getElementById('map').style.opacity = '1';
        }
    }
});
