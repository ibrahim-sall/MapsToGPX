const map = L.map('map').setView([48.8566, 2.3522], 6);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
}).addTo(map);

let currentPolyline = null;
let currentGPXData = null;

function loadGPXFromString(gpxData) {
    const parser = new DOMParser();
    const gpx = parser.parseFromString(gpxData, "application/xml");
    const trackPoints = gpx.querySelectorAll("trkpt");
    const latlngs = Array.from(trackPoints).map(pt => [
        parseFloat(pt.getAttribute("lat")),
        parseFloat(pt.getAttribute("lon"))
    ]);
    if (currentPolyline) {
        map.removeLayer(currentPolyline);
    }
    if (latlngs.length > 0) {
        currentPolyline = L.polyline(latlngs, { color: 'blue' }).addTo(map);
        map.fitBounds(currentPolyline.getBounds());
    } else {
        currentPolyline = null;
    }
}

//Generate GPX 
document.getElementById('gpxForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const formData = new FormData(this);
    fetch('/generate_gpx', {
        method: 'POST',
        body: formData
    })
        .then(response => response.text())
        .then(gpxData => {
            currentGPXData = gpxData;
            loadGPXFromString(gpxData);
            document.getElementById('downloadBtn').style.display = 'inline-block';
        })
        .catch(error => {
            alert("Error generating GPX: " + error);
        });
});

// Download GPX button handler
document.getElementById('downloadBtn').addEventListener('click', function () {
    if (!currentGPXData) return;
    const blob = new Blob([currentGPXData], { type: 'application/gpx+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'route.gpx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});
