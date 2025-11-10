// Map functionality for Elite Furniture Gallery

let map;
let marker;

// Default location (Karachi, Pakistan - you can change this)
const defaultLocation = {
    lat: 24.8607,
    lng: 67.0011,
    address: "Karachi, Pakistan"
};

// Initialize map
function initMap() {
    // Get location from Firebase or use default
    loadLocation();
}

// Load location from Firebase
function loadLocation() {
    if (typeof database === 'undefined') {
        console.error('Database not initialized, using default location');
        displayMap(defaultLocation);
        return;
    }

    database.ref('settings/location').once('value')
        .then((snapshot) => {
            const locationData = snapshot.val();
            if (locationData && locationData.lat && locationData.lng) {
                displayMap(locationData);
            } else {
                // No location in database, use default
                displayMap(defaultLocation);
            }
        })
        .catch((error) => {
            console.error('Error loading location:', error);
            displayMap(defaultLocation);
        });
}

// Display map with location
function displayMap(location) {
    // Initialize the map
    map = L.map('map').setView([location.lat, location.lng], 13);

    // Add tile layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);

    // Custom marker icon
    const customIcon = L.divIcon({
        className: 'custom-marker',
        html: '<div style="background: linear-gradient(135deg, #8B4513, #D2691E); color: white; width: 40px; height: 40px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 3px 10px rgba(0,0,0,0.3);"><i class="fas fa-couch" style="transform: rotate(45deg); font-size: 18px;"></i></div>',
        iconSize: [40, 40],
        iconAnchor: [20, 40]
    });

    // Add marker
    marker = L.marker([location.lat, location.lng], { icon: customIcon }).addTo(map);

    // Add popup
    marker.bindPopup(`
        <div style="text-align: center; padding: 10px;">
            <strong style="color: #8B4513; font-size: 16px;">Elite Furniture Gallery</strong><br>
            <span style="color: #666; font-size: 14px;">${location.address || 'Our Showroom Location'}</span><br>
            <a href="https://www.google.com/maps?q=${location.lat},${location.lng}" target="_blank" style="color: #e67e22; text-decoration: none; font-size: 13px; margin-top: 5px; display: inline-block;">
                <i class="fas fa-external-link-alt"></i> Open in Google Maps
            </a>
        </div>
    `).openPopup();

    // Update address display
    const addressElement = document.getElementById('showroomAddress');
    if (addressElement) {
        addressElement.textContent = location.address || 'Karachi, Pakistan';
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Small delay to ensure Firebase is ready
    setTimeout(() => {
        initMap();
    }, 1000);
});
