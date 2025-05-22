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

// Custom autocomplete using backend proxy
function setupAutocomplete(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;

    let dropdown = null;

    input.addEventListener('input', function () {
        const value = input.value;
        if (value.length < 2) {
            if (dropdown) dropdown.remove();
            return;
        }
        fetch(`/autocomplete?input=${encodeURIComponent(value)}`)
            .then(res => res.json())
            .then(suggestions => {
                if (dropdown) dropdown.remove();
                dropdown = document.createElement('div');
                dropdown.className = 'autocomplete-dropdown';
                dropdown.style.position = 'absolute';
                dropdown.style.background = '#fff';
                dropdown.style.border = '1px solid #ccc';
                dropdown.style.zIndex = 1000;
                dropdown.style.width = input.offsetWidth + 'px';
                dropdown.style.maxHeight = '200px';
                dropdown.style.overflowY = 'auto';

                suggestions.forEach(s => {
                    const item = document.createElement('div');
                    item.textContent = s;
                    item.style.padding = '4px';
                    item.style.cursor = 'pointer';
                    item.addEventListener('mousedown', function (e) {
                        e.preventDefault();
                        input.value = s;
                        dropdown.remove();
                        dropdown = null;
                    });
                    dropdown.appendChild(item);
                });

                const rect = input.getBoundingClientRect();
                dropdown.style.left = rect.left + window.scrollX + 'px';
                dropdown.style.top = rect.bottom + window.scrollY + 'px';

                document.body.appendChild(dropdown);
            });
    });

    input.addEventListener('blur', function () {
        setTimeout(() => {
            if (dropdown) {
                dropdown.remove();
                dropdown = null;
            }
        }, 100);
    });
}

setupAutocomplete('origin');
setupAutocomplete('destination');
setupAutocomplete('waypoints');
