// script.js

const map = L.map('map').setView([12.8613164, 74.8666783], 13); // Center map on start point

// Add OpenStreetMap Layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

const apiKey = '5b3ce3597851110001cf6248c614392c8bad4e38b3e1e5db7b019342'; // Replace with your OpenRouteService API key

let startMarker = null;
let endMarker = null;
let routeLine = null;

// Helper to calculate distance between two coordinates (in meters)
function getDistance(coord1, coord2) {
    const [lat1, lon1] = coord1;
    const [lat2, lon2] = coord2;
    const R = 6371000; // Radius of Earth in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Helper to draw a route between two points
async function getRoute(start, end) {
    const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}&start=${start[1]},${start[0]}&end=${end[1]},${end[0]}`;
    const response = await fetch(url);
    const data = await response.json();

    console.log("API Response: ", data); // Debugging the API response

    if (routeLine) {
        map.removeLayer(routeLine);
    }

    if (data.features && data.features.length > 0) {
        const route = data.features[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
        routeLine = L.polyline(route, { color: 'blue' }).addTo(map);

        // Update each traffic light based on the closest distance along the route:
        trafficLights.forEach((light, index) => {
            let minDistance = Infinity;
            route.forEach(point => {
                const distance = getDistance(point, light.coord);
                if (distance < minDistance) {
                    minDistance = distance;
                }
            });
            if (minDistance <= 300) {
                light.isGreen = true;
                light.marker.setIcon(L.divIcon({ className: 'traffic-light-green', html: '🟢' }));
                console.log(`Traffic Light ${index + 1} turned GREEN!`);
            } else {
                light.isGreen = false;
                light.marker.setIcon(L.divIcon({ className: 'traffic-light-red', html: '🔴' }));
                console.log(`Traffic Light ${index + 1} is RED!`);
            }
        });
    } else {
        alert("No route found. Check coordinates or API key!");
    }
}

// Fixed End Point
const end = [12.8984749, 74.8463546];
endMarker = L.marker(end).addTo(map).bindPopup("🏥 Destination: Hospital").openPopup();

// Add Traffic Light Markers
const trafficLights = [
    { coord: [12.8838481, 74.8637507], isGreen: false },
    { coord: [12.8907031, 74.8541444], isGreen: false }
];

trafficLights.forEach(light => {
    light.marker = L.marker(light.coord, {icon: L.divIcon({className: 'traffic-light-red', html: '🔴'})})
        .addTo(map)
        .bindPopup("🚦 Traffic Light");
});

// Allow user to set start position by clicking on the map
map.on('click', function(e) {
    const { lat, lng } = e.latlng;
    const start = [lat, lng];

    if (startMarker) {
        map.removeLayer(startMarker);
    }

    startMarker = L.marker(start).addTo(map).bindPopup("🚑 Start: Ambulance").openPopup();
    getRoute(start, end);
});