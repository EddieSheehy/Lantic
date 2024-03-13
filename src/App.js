import React, { useState, useEffect, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './styles.css';
import 'leaflet-routing-machine';
import MapComponent from './components/MapComponent'
import marker from './marker.png'
import * as turf from '@turf/turf';
import geoJson from './ireland-counties.geojson';
import useGeoLocation from './hooks/useGeoLocation';

// Component for the Map


// Main App component
const App = () => {
  const [eircode, setEircode] = useState('');
  const [locality, setlocality] = useState('');
  const [county, setCounty] = useState('');
  const [workEircode, setWorkEircode] = useState('');
  const [map, setMap] = useState(null); // State to hold the map object
  const [routing, setRouting] = useState(null);
  const [homeMarker, setHomeMarker] = useState(null);
  const { location } = useGeoLocation(eircode);


  // Function to handle eircode input change
  const handleEircodeChange = (event) => {
    setEircode(event.target.value);
  };

  const handleLocalityChange = (event) => {
    setlocality(event.target.value);
  }

  // Function to handle eircode submit
  const handleSubmitPress = () => {
          
              const customIcon = L.icon({
                iconUrl: marker, // Update this path to your marker image
                iconSize: [41, 41], // Size of the icon
                iconAnchor: [12, 41], // Point of the icon which will correspond to marker's location
                popupAnchor: [1, -34], // Point from which the popup should open relative to the iconAnchor
            });

              // Extracting address from Bing Maps response
              //var address = resource.address.formattedAddress;
              var hMarker = L.marker(location, { icon: customIcon}).addTo(map);
              setHomeMarker(hMarker)
              // After adding the marker
                map.flyTo(location, 15, {
                animate: true,
                duration: 3 // Duration in seconds
                
                }).once('zoomend', function()
                 {

                // Adjust map view to ensure marker is visible
                map.panBy([document.getElementById('details-panel').offsetWidth / 2, 0], {
                    duration: 0.2
                });


                // Show the property details overlay once the zoom animation ends
                document.getElementById('details-panel').classList.remove('hidden');
                document.getElementById('details-panel').classList.add('show');
              });
  
              document.querySelector('.bg-overlay').classList.add('hidden');
              document.querySelector('.container').classList.add('hidden');
  
        }

        const getJSONData = useCallback(() => {
          fetch(geoJson) // Assuming your GeoJSON file is named data.geojson and located in the public directory
        .then((response) => response.json())
        .then((data) => {
            const polygons = data.features.filter(feature => feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon');
    
        let isInside = false;
    for (let i = 0; i < polygons.length; i++) {
      //console.log(location)
      var point = [location[1], location[0]]
        if (turf.booleanPointInPolygon(point, polygons[i])) {
            isInside = true;
            setCounty(polygons[i].properties.name)
            //console.log(polygons[i].properties.name)
            break; // Exit the loop if the point is found within a polygon
        }
    }
    
    if (isInside) {
        console.log('The point is inside the GeoJSON area.');
    } else {
        console.log('The point is not inside the GeoJSON area.');
    }
  })}, [location]);
        
  useEffect(() => {
    if (location) {
      getJSONData();
    }
  }, [location,getJSONData]); // This will re-run the effect if location changes

            

  async function geocodeEircode(GeoEir) {
    const bingGeocodingUrl = `http://dev.virtualearth.net/REST/v1/Locations?countryRegion=IE&postalCode=${encodeURIComponent(GeoEir)}&key=AmSsIUTDSvycwzlsc5E_knb_qVHrEiJ-t3zWaoxIxB_BrikqpOHi95wIGjTRIkeR`;
    
    // Return the fetch promise chain
    return fetch(bingGeocodingUrl)
      .then(response => response.json())
      .then(data => {
        if (data.resourceSets[0].resources.length > 0) {
          var resource = data.resourceSets[0].resources[0];
          var location1 = resource.point.coordinates;
          // Return the location in the format expected by the caller
          return location1; // Make sure this is the actual path to the coordinates
        }
        throw new Error('Location not found.'); // Throw an error if no location is found
      });
  }

  const handleWorkEircodeSubmit = async () => {
    
      // Execute the route finding
      const homeCoords = homeMarker ? homeMarker.getLatLng() : null; // Use the home marker's coordinates
      const workCoords = await geocodeEircode(workEircode);
      routing.setWaypoints([homeCoords, L.latLng(...workCoords)]);
    
  };


  return (
    <div className="App">
      <MapComponent onMapLoad={setMap} setRouting={setRouting}/>
      <div class="bg-overlay"></div>
      <div className="container">
        <div className="logo-placeholder"></div>
        <div className="subtitle">An all in one property lookup</div>
        <input
          type="text"
          className="eircode-input"
          placeholder="ENTER EIRCODE"
          value={eircode}
          onChange={handleEircodeChange}
        />
        <input
        type="text"
        className="locality-input"
        placeholder="Area (St, estate or village)"
        value={locality}
        onChange={handleLocalityChange}
        />
        <button 
    className="submit-button" onClick={handleSubmitPress}>
    Submit
  </button>
      </div>


    <div id="details-panel" class="details-panel hidden">
    <div class="details-header">
      <div className="details-eircode-box">
      <span className="eircode-text">{eircode}</span>
      </div>
      <span class="close-button">&times;</span>
    </div>
    <div class="details-body">
      <h1>{locality}, {county}, Ireland</h1>
      <div class="details-info">
        <p><strong>Details</strong></p>
        <p>Average Price of rent:</p>
        <p>Average Price of property:</p>
      </div>
      <div class="details-actions">
        <div class="work-input-button">
        <input type="text" className="workEircodeInput" placeholder="Enter Work Eircode" value={workEircode} onChange={(e) => setWorkEircode(e.target.value)}/>
        <button className="commute-button" onClick={() => handleWorkEircodeSubmit()}>Calculate Commute</button>
        </div>
        <div className= "flood-button-container">
        <button className="flood-button" onClick={() => window.location.href = 'https://www.floodinfo.ie/map/floodmaps/'}>Flooding Information</button>
        </div>
        </div>
        <button className="amenities-button">Click for Nearby Amenities</button>
      
    </div>
  </div>  
    </div>

    
  );
};

export default App;
