from flask import Flask, request, render_template, send_file
import requests
import os
import xml.etree.ElementTree as ET
import polyline

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/generate_gpx', methods=['POST'])
def generate_gpx():
    api_key = os.getenv('API_KEY') 
    if not api_key:
        return "API key not set in environment variables.", 500

    origin = request.form['origin']
    destination = request.form['destination']
    waypoints = request.form['waypoints']

    url = f'https://maps.googleapis.com/maps/api/directions/json?origin={origin}&destination={destination}&waypoints={waypoints}&avoid=highways|tolls&key={api_key}'
    response = requests.get(url)

    if response.status_code == 200:
        data = response.json()
        if data.get('routes'):
            routes = data['routes']
            selected_index = int(request.form['route_index']) - 1
            if selected_index < 0 or selected_index >= len(routes):
                return "Invalid route selection.", 400

            selected_route = routes[selected_index]
            polyline_points = []

            for leg in selected_route['legs']:
                for step in leg['steps']:
                    polyline_points.extend(polyline.decode(step['polyline']['points']))

            gpx = ET.Element("gpx", version="1.1", creator="web_interface.py", xmlns="http://www.topografix.com/GPX/1/1")
            trk = ET.SubElement(gpx, "trk")
            ET.SubElement(trk, "name").text = f"Route {selected_index + 1}"

            trkseg = ET.SubElement(trk, "trkseg")
            for point in polyline_points:
                ET.SubElement(trkseg, "trkpt", lat=str(point[0]), lon=str(point[1]))

            tree = ET.ElementTree(gpx)
            filename = "output.gpx"
            with open(filename, "wb") as f:
                tree.write(f, encoding="utf-8", xml_declaration=True)

            return send_file(filename, as_attachment=True)
        else:
            return "No routes found in the response.", 400
    else:
        return f"Error fetching data: {response.status_code}", 500

if __name__ == '__main__':
    app.run(debug=True)
