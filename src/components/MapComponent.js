import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine'; // Ensure this is imported if you're using it
import geoJson from '../ireland-counties.geojson';
import marker from '../marker.png'

const MapComponent = ({ onMapLoad, setRouting }) => {
    const mapRef = useRef(null);
    
    useEffect(() => {
        fetch(geoJson) // Assuming your GeoJSON file is named data.geojson and located in the public directory
    .then((response) => response.json())
    .then((data) => {
  
      // Create the GeoJSON layer with the fetched data
      L.geoJSON(data).addTo(mapRef.current);
      // Do something with the layer if needed
    });
        mapRef.current = L.map('map', {      
        center: [53.3498, -6.2603],
        zoom: 7,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(mapRef.current);

        const customIcon = L.icon({
            iconUrl: marker, // Update this path to your marker image
            iconSize: [41, 41], // Size of the icon
            iconAnchor: [12, 41], // Point of the icon which will correspond to marker's location
            popupAnchor: [1, -34], // Point from which the popup should open relative to the iconAnchor
        });

  
        if (onMapLoad) {
            onMapLoad(mapRef.current);
        }

        const routingControl = L.Routing.control({
            createMarker: function(i, wp) {
                const marker = L.marker(wp.latLng, { draggable: false, icon: customIcon });
                if (i === 0) {
                    mapRef.current.flyTo(wp.latLng, 15, {
                        animate: true,
                        duration: 3
                    });
                }
                return marker;
            },
        }).addTo(mapRef.current);

        routingControl.on('routesfound', function(e) {
            const routes = e.routes;
            const summary = routes[0].summary;
            // Calculate time in minutes and distance in kilometers
            const timeInMinutes = Math.round(summary.totalTime / 60);
            const distanceInKilometers = (summary.totalDistance / 1000).toFixed(2);
            console.log(`Time: ${timeInMinutes} minutes, Distance: ${distanceInKilometers} km`);
        });

        if (setRouting) {
            setRouting(routingControl);
        }

        return () => {
            mapRef.current.remove();
        };
    }, [onMapLoad, setRouting]);
  
    return <div id="map" style={{ height: '100vh' }} />;
};

export default MapComponent;
