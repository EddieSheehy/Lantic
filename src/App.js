import React, { useState, useEffect, useCallback, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './styles.css'
import 'leaflet-routing-machine'
import MapComponent from './components/MapComponent'
import marker from './marker.png'
import * as turf from '@turf/turf'
import geoJson from './ireland-counties.geojson'
// import useGeoLocation from './hooks/useGeoLocation'

// Main App component
const App = () => {
  const [county, setCounty] = useState('')
  const [workEircode, setWorkEircode] = useState('')
  const [map, setMap] = useState(null)
  const [routing, setRouting] = useState(null)
  const [homeMarker, setHomeMarker] = useState(null)
  const [averageRent, setAverageRent] = useState('')
  const [averagePropertyPrice, setAveragePropertyPrice] = useState('')
  const [isFetching, setIsFetching] = useState(false)
  const eircodeRef = useRef(null)
  const localityRef = useRef(null)

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

  const fetchPropertyInfo = async (locationConstant) => {
    try {
      // Fetch average rent
      const rentResponse = await fetch('https://propertyapi-4whpfun42q-uc.a.run.app/listings/' + locationConstant + '/rent/3/house')
      if (!rentResponse.ok) throw new Error(`Rent API responded with status ${rentResponse.status}`)
      const rentData = await rentResponse.json()
      setAverageRent(new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(rentData.average_rent))
      // Fetch average property price
      const buyResponse = await fetch('https://propertyapi-4whpfun42q-uc.a.run.app/listings/' + locationConstant + '/buy/3/house')
      if (!buyResponse.ok) throw new Error(`Buy API responded with status ${buyResponse.status}`)
      const buyData = await buyResponse.json()
      setAveragePropertyPrice(new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(buyData.average_rent))
    } catch (error) {
      console.error('Failed to fetch property information:', error)
    }
  }

  const handleSubmitPress = async () => {
    setIsFetching(true)
    const eircodeValue = eircodeRef.current.value
    const customIcon = L.icon({
      iconUrl: marker,
      iconSize: [41, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34]
    })
    const location = await geocodeEircode(eircodeValue)

    getJSONData(location)

    const hMarker = L.marker(location, { icon: customIcon }).addTo(map)
    setHomeMarker(hMarker)
    map.flyTo(location, 15, {
      animate: true,
      duration: 3

    }).once('zoomend', function () {
      map.panBy([document.getElementById('details-panel').offsetWidth / 2, 0], {
        duration: 0.2
      })

      // Show the property details overlay once the zoom animation ends
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

        let isInside = false
        for (let i = 0; i < polygons.length; i++) {
          const point = [location[1], location[0]] // Ensure location is [latitude, longitude]
          if (turf.booleanPointInPolygon(point, polygons[i])) {
            isInside = true
            setCounty(polygons[i].properties.name)
            break
          }
        }
        if (!isInside) {
          console.log('The point is not inside any known county')
        } else {
          console.log('INSIDE')
        }
      })
  }, [])

  async function geocodeEircode (GeoEir) {
    const bingGeocodingUrl = `https://dev.virtualearth.net/REST/v1/Locations?countryRegion=IE&postalCode=${encodeURIComponent(GeoEir)}&key=AmSsIUTDSvycwzlsc5E_knb_qVHrEiJ-t3zWaoxIxB_BrikqpOHi95wIGjTRIkeR`

    return fetch(bingGeocodingUrl)
      .then(response => response.json())
      .then(data => {
        if (data.resourceSets[0].resources.length > 0) {
          const resource = data.resourceSets[0].resources[0]
          const location1 = resource.point.coordinates
          return location1
        }
        throw new Error('Location not found.')
      })
  }

  useEffect(() => {
    if (county) {
      const locationConst = countyToLocationMapping[county]
      fetchPropertyInfo(locationConst)
    }
  }, [county])

  const handleWorkEircodeSubmit = async () => {
    const homeCoords = homeMarker ? homeMarker.getLatLng() : null
    const workCoords = await geocodeEircode(workEircode)
    routing.setWaypoints([homeCoords, L.latLng(...workCoords)])
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
          className="eircode-input"
          placeholder="ENTER EIRCODE"
          ref={eircodeRef}
        />
        <input
        type="text"
        className="locality-input"
        placeholder="Area (St, estate or village)"
        ref={localityRef}
        />
        <button
    className="submit-button" disabled={isFetching} onClick={handleSubmitPress}>
    Submit
  </button>
      </div>

    <div id="details-panel" className="details-panel hidden">
    <div className="details-header">
      <div className="details-eircode-box">
      <span className="eircode-text">{eircodeRef.current?.value}</span>
      </div>
      <span className="close-button">&times;</span>
    </div>
    <div className="details-body">
      <h1>{localityRef.current?.value}, {county}, Ireland</h1>
      <div className="details-info">
        <p><strong>Details</strong></p>
        <p>Average Price of rent: {averageRent}</p>
        <p>Average Price of property: {averagePropertyPrice}</p>
      </div>
      <div className="details-actions">
        <div className="work-input-button">
        <input type="text" className="workEircodeInput" placeholder="Enter Work Eircode" value={workEircode} onChange={(e) => setWorkEircode(e.target.value)}/>
        <button className="commute-button" onClick={() => handleWorkEircodeSubmit()}>Calculate Commute</button>
        </div>
        <div className= "flood-button-container">
        <button className="flood-button" onClick={() => { window.location.href = 'https://www.floodinfo.ie/map/floodmaps/' }}>Flooding Information</button>
        </div>
        </div>
        <button className="amenities-button" onClick={() => alert('To Be Added.')}>Click for Nearby Amenities</button>

    </div>
  </div>
    </div>

  )
}

export default App
