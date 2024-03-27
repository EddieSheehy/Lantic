import React, { useState, useEffect, useCallback } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './styles.css'
import 'leaflet-routing-machine'
import MapComponent from './components/MapComponent'
import marker from './marker.png'
import * as turf from '@turf/turf'
import geoJson from './ireland-counties.geojson'
import { fetchAveragePropertyPrice, fetchAverageRent, geocodeEircode } from './utils/utils'
import { queryOverpassAPI } from './utils/utils-amenities'
import AmenitiesList from './components/amenityList'

const App = () => {
  const [county, setCounty] = useState('')
  const [workEircode, setWorkEircode] = useState('')
  const [map, setMap] = useState(null)
  const [routing, setRouting] = useState(null)
  const [homeMarker, setHomeMarker] = useState(null)
  const [isFetching, setIsFetching] = useState(false)
  const [eircode, setEircode] = useState('')
  const [locality, setLocality] = useState('')
  const [isValid, setIsValid] = useState(true)
  const [amenitiesMarkers, setAmenitiesMarkers] = useState([])
  const [showAmenities, setShowAmenities] = useState(false)
  const [averageRent, setAverageRent] = useState('')
  const [averagePropertyPrice, setAveragePropertyPrice] = useState('')
  const [geocodeError, setGeocodeError] = useState('')
  const [workGeocodeError, setWorkGeocodeError] = useState('')
  const [amenitiesError, setAmenitiesError] = useState('')

  const countyToLocationMapping = {
    'Kerry County': 'Location.KERRY',
    'Cork County': 'Location.CORK',
    'Cork City': 'Location.CORKCITY',
    'Limerick County': 'Location.LIMERICK',
    'Limerick City': 'Location.LIMERICKCITY',
    'Clare County': 'Location.CLARE',
    'Waterford County': 'Location.WATERFORD',
    'South Tipperary': 'Location.TIPPERARY',
    'North Tipperary': 'Location.TIPPERARY',
    'Wexford County': 'Location.WEXFORD',
    'Carlow County': 'Location.CARLOW',
    'Wicklow County': 'Location.WICKLOW',
    'Kildare County': 'Location.KILDARE',
    'Laois County': 'Location.LAOIS',
    'Offaly County': 'Location.OFFALY',
    'Galway County': 'Location.GALWAY',
    'Galway City': 'Location.GALWAYCITY',
    'Dún Laoghaire-Rathdown': 'Location.DUBLINDUNLAOGHAIRE',
    'South Dublin': 'Location.DUBLINSOUTH',
    Fingal: 'Location.DUBLINFINGAL',
    'Dublin City': 'Location.DUBLINCITY',
    'Waterford City': 'Location.WATERFORDCITY',
    'Roscommon County': 'Location.ROSCOMMON',
    'Meath County': 'Location.MEATH',
    'Westmeath County': 'Location.WESTMEATH',
    'Longford County': 'Location.LONGFORD',
    'Mayo County': 'Location.MAYO',
    'Louth County': 'Location.LOUTH',
    'Monaghan County': 'Location.MONAGHAN',
    'Cavan County': 'Location.CAVAN',
    'Leitrim County': 'Location.LEITRIM',
    'Sligo County': 'Location.SLIGO',
    'Donegal County': 'Location.DONEGAL'
  }

  const handleCloseButtonClick = () => {
    const detailsPanel = document.getElementById('details-panel')
    detailsPanel.classList.add('hidden')
    detailsPanel.classList.remove('show')

    const bgOverlay = document.querySelector('.bg-overlay')
    const container = document.querySelector('.container')
    bgOverlay.classList.remove('hidden')
    container.classList.remove('hidden')

    setEircode('')
    setLocality('')
    setGeocodeError('')
    setWorkGeocodeError('')
    setIsValid(true)

    if (homeMarker) {
      map.removeLayer(homeMarker)
      setHomeMarker(null)
    }

    if (routing) {
      routing.setWaypoints([])
    }

    amenitiesMarkers.forEach(marker => map.removeLayer(marker))
    setAmenitiesMarkers([])

    setShowAmenities(false)

    setTimeout(() => {
      map.flyTo([53.3498, -6.2603], 7, { animate: true, duration: 2 })
    }, 500)
  }

  const handleSubmitPress = async () => {
    if (!eircode.trim() || !locality.trim()) {
      setIsValid(false)
      return
    }

    setIsFetching(true)
    const eircodeValue = eircode

    // Sets the markers size, image and offset
    const customIcon = L.icon({
      iconUrl: marker,
      iconSize: [41, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34]
    })

    // Gets the long and lat of the Eircode
    const location = await geocodeEircode(eircodeValue)

    if (!location) {
      setGeocodeError('Invalid Eircode')
      setIsFetching(false)
      return
    }

    // Calls the function to utilise 'turf' to check if the location is within
    // the geoJSON.
    getJSONData(location)

    const hMarker = L.marker(location, { icon: customIcon }).addTo(map)
    setHomeMarker(hMarker)

    // Handles the styling animations of removing, showing overlays.
    map.flyTo(location, 15, {
      animate: true,
      duration: 3

    }).once('zoomend', function () {
      map.panBy([document.getElementById('details-panel').offsetWidth / 2, 0], {
        duration: 0.2
      })

      document.getElementById('details-panel').classList.remove('hidden')
      document.getElementById('details-panel').classList.add('show')
    })

    document.querySelector('.bg-overlay').classList.add('hidden')
    document.querySelector('.container').classList.add('hidden')
    setIsFetching(false)
  }

  const getJSONData = useCallback((location) => {
    fetch(geoJson)
      .then((response) => response.json())
      .then((data) => {
        const polygons = data.features.filter(feature => feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon')

        for (let i = 0; i < polygons.length; i++) {
          const point = [location[1], location[0]]
          if (turf.booleanPointInPolygon(point, polygons[i])) {
            setCounty(polygons[i].properties.name)
            break
          }
        }
      })
  }, [])

  useEffect(() => {
    if (county) {
      const locationConst = countyToLocationMapping[county]
      fetchAverageRent(locationConst).then(rent => {
        setAverageRent(rent)
      }).catch(error => {
        console.error('Error fetching rent:', error)
      })
      fetchAveragePropertyPrice(locationConst).then(propertyPrice => {
        setAveragePropertyPrice(propertyPrice)
      }).catch(error => {
        console.error('Error fetching rent:', error)
      })
    }
  }, [county])

  const handleWorkEircodeSubmit = async () => {
    setWorkGeocodeError('')
    const homeCoords = homeMarker ? homeMarker.getLatLng() : null
    const workCoords = await geocodeEircode(workEircode)
    if (!workCoords) {
      setWorkGeocodeError('Invalid Eircode')
      return
    }
    routing.setWaypoints([homeCoords, L.latLng(...workCoords)])
  }

  const handleAmenitiesClick = async () => {
    if (showAmenities) {
      setShowAmenities(false)
      amenitiesMarkers.forEach(marker => map.removeLayer(marker))
      setAmenitiesMarkers([])
    } else {
      setAmenitiesError('')
      const homeCoords = homeMarker ? homeMarker.getLatLng() : null
      if (homeCoords) {
        const amenitiesData = await queryOverpassAPI(homeCoords.lat, homeCoords.lng, map)
        setAmenitiesMarkers(amenitiesData) // Store the structured data
        setShowAmenities(true)
      }
    }
  }

  return (
    <div className="App">
      <MapComponent onMapLoad={setMap} setRouting={setRouting}/>
      <div className="bg-overlay"></div>
      <div className="container">
        <div className="logo-placeholder"></div>
        <div className="subtitle">An all in one property lookup</div>
        <input
  type="text"
  className={`eircode-input ${(!isValid || geocodeError) ? 'invalid' : ''}`}
  placeholder="ENTER EIRCODE"
  value={eircode}
  onChange={(e) => {
    setEircode(e.target.value)
    setGeocodeError('') // Clear geocode error when user is correcting the input
    if (geocodeError) setIsValid(true) // Reset isValid when user starts correcting an error
  }}
  onKeyPress={(e) => e.key === 'Enter' && handleSubmitPress()}
/>
{geocodeError && <div className="error-message">{geocodeError}</div>}

<input
  type="text"
  className={`locality-input ${!isValid && !locality ? 'invalid' : ''}`}
  placeholder="Area (St, estate or village)"
  value={locality}
  onChange={(e) => { setLocality(e.target.value); setGeocodeError('') }}
  onKeyPress={(e) => e.key === 'Enter' && handleSubmitPress()}
/>
<button
  className="submit-button" disabled={isFetching} onClick={handleSubmitPress}>
  Submit
</button>
</div>

    <div id="details-panel" className="details-panel hidden">
    <div className="details-header">
      <div className="details-eircode-box">
      <span className="eircode-text">{eircode}</span>
      </div>
      <span className="close-button" onClick={handleCloseButtonClick}>&times;</span>
    </div>
    <div className="details-body">
      <h1>{locality}, {county}, Ireland</h1>
      <div className="details-info">
        <p><strong>Details</strong></p>
        <p>Average Price of rent: {averageRent}</p>
        <p>Average Price of property: {averagePropertyPrice}</p>
      </div>
      <div className="details-actions">
        <div className="work-input-button">
        <input
          type="text"
          className={`workEircodeInput ${(!isValid || workGeocodeError) ? 'invalid' : ''}`}
          placeholder="Enter Work Eircode"
          value={workEircode}
          onChange={(e) => {
            setWorkEircode(e.target.value)
            setWorkGeocodeError('')
            if (workGeocodeError) setIsValid(true)
          }}
/>
{workGeocodeError && <div className="error-message">{workGeocodeError}</div>}
        <button className="commute-button" onClick={() => handleWorkEircodeSubmit()}>Calculate Commute</button>
        </div>
        <div className= "flood-button-container">
        <button className="flood-button" onClick={() => { window.location.href = 'https://www.floodinfo.ie/map/floodmaps/' }}>Flooding Information</button>
        </div>
        </div>
        <button
  className={`amenities-button ${showAmenities ? 'red' : ''}`}
  onClick={handleAmenitiesClick}>
  {showAmenities ? 'Hide Nearby Amenities' : 'Click for Nearby Amenities'}
</button>
{showAmenities && <AmenitiesList amenities={amenitiesMarkers} map={map} />}
{amenitiesError && <div className="error-message" style={{ color: 'red', marginTop: '10px' }}>{amenitiesError}</div>}
    </div>
  </div>
    </div>

  )
}

export default App
