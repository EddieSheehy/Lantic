import React, { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-routing-machine' // Ensure this is imported if you're using it
import PropTypes from 'prop-types' // Import PropTypes
import geoJson from '../ireland-counties.geojson'
import marker from '../marker.png'

const MapComponent = ({ onMapLoad, setRouting }) => {
  const mapRef = useRef(null)

  MapComponent.propTypes = {
    onMapLoad: PropTypes.func,
    setRouting: PropTypes.func
  }

  useEffect(() => {
    fetch(geoJson)
      .then((response) => response.json())
      .then((data) => {
        L.geoJSON(data, {
          style: function (feature) {
            return {
              fillColor: 'orange',
              weight: 0.5,
              opacity: 0,
              color: 'black',
              fillOpacity: 0.1
            }
          }
        }).addTo(mapRef.current)
      })
    mapRef.current = L.map('map', {
      center: [53.3498, -6.2603],
      zoom: 7,
      maxZoom: 16,
      minZoom: 7,
      attributionControl: false

    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapRef.current)

    const customIcon = L.icon({
      iconUrl: marker, // Update this path to your marker image
      iconSize: [41, 41], // Size of the icon
      iconAnchor: [12, 41], // Point of the icon which will correspond to marker's location
      popupAnchor: [1, -34] // Point from which the popup should open relative to the iconAnchor
    })

    const southWest = L.latLng(48, -12) // Replace with your desired southwest corner coordinates
    const northEast = L.latLng(56, -2) // Replace with your desired northeast corner coordinates

    // Set the maximum bounds for the map
    mapRef.current.setMaxBounds(L.latLngBounds(southWest, northEast))

    if (onMapLoad) {
      onMapLoad(mapRef.current)
    }

    const routingControl = L.Routing.control({
      createMarker: function (i, wp) {
        const marker = L.marker(wp.latLng, { draggable: false, icon: customIcon })
        if (i === 0) {
          mapRef.current.flyTo(wp.latLng, 15, {
            animate: true,
            duration: 3
          })
        }
        return marker
      }
    }).addTo(mapRef.current)

    routingControl.on('routesfound', function (e) {
      const routes = e.routes
      const summary = routes[0].summary
      // Calculate time in minutes and distance in kilometers
      const timeInMinutes = Math.round(summary.totalTime / 60)
      const distanceInKilometers = (summary.totalDistance / 1000).toFixed(2)
      console.log(`Time: ${timeInMinutes} minutes, Distance: ${distanceInKilometers} km`)
    })

    if (setRouting) {
      setRouting(routingControl)
    }

    return () => {
      mapRef.current.remove()
    }
  }, [onMapLoad, setRouting])

  return <div id="map" style={{ height: '100vh' }} />
}

export default MapComponent
