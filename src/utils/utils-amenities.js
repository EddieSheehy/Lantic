import L from 'leaflet'

function getAmenityIcon (amenityType) {
  const amenityIcons = {
    restaurant: 'icons/amenity_restaurant.ico',
    cafe: 'icons/amenity_cafe.ico',
    fast_food: 'icons/amenity_fastfood.ico',
    bar: 'icons/amenity_barpub.ico',
    pub: 'icons/amenity_barpub.ico',
    bakery: 'icons/amenity_bakery.ico',
    supermarket: 'icons/amenity_supermarket.ico',
    pharmacy: 'icons/amenity_pharmacy.ico',
    atm: 'icons/amenity_atm.ico',
    bank: 'icons/amenity_bank.ico',
    clinic: 'icons/amenity_clinic.ico',
    hospital: 'icons/amenity_hospital.ico',
    school: 'icons/amenity_school.ico',
    university: 'icons/amenity_university.ico',
    library: 'icons/amenity_library.ico',
    parking: 'icons/amenity_parking.ico',
    fuel: 'icons/amenity_fuel.ico',
    theatre: 'icons/amenity_theatre.ico',
    cinema: 'icons/amenity_cinema.ico',
    park: 'icons/amenity_park.ico'
  }

  const iconUrl = amenityIcons[amenityType] || 'icons/amenity_unknown.ico' // Default icon if type not found
  return L.icon({
    iconUrl,
    iconSize: [21, 21], // Adjust size as needed
    iconAnchor: [21, 20],
    popupAnchor: [-4, -24]
  })
}

export async function queryOverpassAPI (lat, lon, map) {
  const amenities = ['restaurant', 'cafe', 'fast_food', 'bar', 'pub', 'bakery', 'supermarket', 'pharmacy', 'atm', 'bank', 'clinic', 'hospital', 'school', 'university', 'library', 'parking', 'fuel', 'theatre', 'cinema', 'park']
  const radius = 4000 // in meters
  const baseUrl = 'https://overpass-api.de/api/interpreter'
  const queryParts = amenities.map(amenity => `node[amenity="${amenity}"](around:${radius},${lat},${lon});`).join('')
  const query = `[out:json];(${queryParts});out;`
  const url = `${baseUrl}?data=${encodeURIComponent(query)}`
  const markers = []

  try {
    const response = await fetch(url)
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
    const data = await response.json()

    data.elements.forEach(element => {
      if (element.tags && element.lat && element.lon) {
        const amenityType = element.tags.amenity
        const markerIcon = getAmenityIcon(amenityType)
        const marker = L.marker([element.lat, element.lon], { icon: markerIcon }).addTo(map)

        marker.bindTooltip(element.tags.name || 'Unknown', { permanent: false, direction: 'auto' })

        let popupContent = `<strong>${element.tags.name || 'No name provided'}</strong><br>`
        popupContent += `Type: ${amenityType}<br>`
        if (element.tags.opening_hours) {
          popupContent += `Opening Hours: ${element.tags.opening_hours}<br>`
        }
        if (element.tags.website) {
          popupContent += `<a href="${element.tags.website}" target="_blank">Website</a>`
        }

        marker.bindPopup(popupContent)

        markers.push(marker)
      }
    })

    return markers
  } catch (error) {
    console.error('Failed to fetch Overpass API data:', error)
    return []
  }
}
