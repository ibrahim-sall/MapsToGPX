import requests
import os
import xml.etree.ElementTree as ET
import polyline 

### ______________Définition de la requête
api_key = os.environ['API_KEY']
origin = '4 Av. Jean Mermoz, 93460 Gournay-sur-Marne'
destination = 'Dijon, Cr de la gare, 21000 Dijon'
waypoints = 'D671, 10110 Bar-sur-Seine'

url = f'https://maps.googleapis.com/maps/api/directions/json?origin={origin}&destination={destination}&waypoints={waypoints}&avoid=highways|tolls&key={api_key}'

response = requests.get(url)

if response.status_code == 200:
    data = response.json()
    if data.get('routes'):
        routes = data['routes']

        # Display available routes to the user
        print("Multiple routes found. Select one:")
        for i, route in enumerate(routes):
            summary = route.get('summary', f"Route {i + 1}")
            print(f"{i + 1}: {summary}")

        # Prompt the user to select a route
        selected_index = int(input("Enter the number of the route you want to select: ")) - 1
        if selected_index < 0 or selected_index >= len(routes):
            print("Invalid selection. Exiting.")
            exit()

        selected_route = routes[selected_index]
        polyline_points = []

        # Extract polyline points for the selected route
        for leg in selected_route['legs']:
            for step in leg['steps']:
                polyline_points.extend(polyline.decode(step['polyline']['points']))

        # Create a GPX file
        gpx = ET.Element("gpx", version="1.1", creator="maps.py", xmlns="http://www.topografix.com/GPX/1/1")
        trk = ET.SubElement(gpx, "trk")
        ET.SubElement(trk, "name").text = f"Route {selected_index + 1}"

        trkseg = ET.SubElement(trk, "trkseg")
        for point in polyline_points:
            # Add each decoded polyline point as a track point
            trkpt = ET.SubElement(trkseg, "trkpt", lat=str(point[0]), lon=str(point[1]))

        # Write the GPX data to a file
        tree = ET.ElementTree(gpx)
        # Generate a unique filename by appending a number if the file already exists
        base_filename = "output"
        extension = ".gpx"
        counter = 1
        filename = f"{base_filename}{extension}"

        while os.path.exists(filename):
            filename = f"{base_filename}_{counter}{extension}"
            counter += 1

        with open(filename, "wb") as f:
            tree.write(f, encoding="utf-8", xml_declaration=True)

        print(f"Waypoints saved to {filename}")
    else:
        print("No routes found in the response.")
else:
    print(f"Error fetching data: {response.status_code}")
