<h1 align="center">
    <img src="https://capsule-render.vercel.app/api?type=waving&color=0:12D559,100:5776FF&height=115&section=header"/>
</h1>

# MapsToGPX 📍 
<!-- <p align="center">
    <img src="icones.jpg" alt="illustration" width=""/>
</p> -->

![Commit Status](https://img.shields.io/github/commit-activity/t/ibrahim-sall/MapsToGPX?)
![GitHub Pages](https://img.shields.io/github/deployments/ibrahim-sall/MapsToGPX/github-pages?label=GitHub%20Pages&logo=github)

## Purpose
This is a simple pages so you can export and download gpx files from a google maps search. The output format will be compatible with your favorite route planning application like *Strava, Garmin, Komoot...*

## Set up
- API key

First set up your google API KEY in you env like this. While making sure at least direction is enable with this key (can be seen on cloud interface).
```bash
export API_KEY=YOUR_API_KEY
```

- Running the server

Place yourself in a python env and then
```bash
pip install -r requirements.txt

python web_interface.py
```

## Usage
You can then access the web page and make your first route planning. And thus, by giving a valid starting and ending point.

## Options
- Waypoints:
If you want to pass through a particular place or city, you can set waypoints along the route. You can also simply use it to create a route that goes there and back.
- Preferred route:
Alternatively, you can select the preferred plan, since Google can propose multiple ones. Just by using the integer between one & three (it is rare than more are proposed).
<h1 align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:12D559,100:5776FF&height=115&reversal=true&section=footer"/>
</h1>