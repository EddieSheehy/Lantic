// Function to fetch property rent information
const fetchAverageRent = async (locationConstant, numBedrooms, propertyType) => {
  try {
    const response = await fetch(`https://propertyapi-4whpfun42q-uc.a.run.app/listings/${locationConstant}/rent/${numBedrooms}/${propertyType}`)
    if (!response.ok) throw new Error(`Rent API responded with status ${response.status}`)
    const data = await response.json()
    const average = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(data.average_rent)
    return average
  } catch (error) {
    console.error('Failed to fetch average rent:', error)
    return null
  }
}

// Function to fetch property price information
const fetchAveragePropertyPrice = async (locationConstant, numBedrooms, propertyType) => {
  try {
    const response = await fetch(`https://propertyapi-4whpfun42q-uc.a.run.app/listings/${locationConstant}/buy/${numBedrooms}/${propertyType}`)
    if (!response.ok) throw new Error(`Rent API responded with status ${response.status}`)
    const data = await response.json()
    const average = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(data.average_rent)
    return average
  } catch (error) {
    console.error('Failed to fetch average property price:', error)
    return null
  }
}

// Function to geocode Eircode
const geocodeEircode = async (GeoEir) => {
  const bingGeocodingUrl = `https://dev.virtualearth.net/REST/v1/Locations?countryRegion=IE&postalCode=${encodeURIComponent(GeoEir)}&key=${process.env.REACT_APP_BING_MAPS_KEY}`
  try {
    const response = await fetch(bingGeocodingUrl)
    const data = await response.json()
    if (data.resourceSets[0].resources.length > 0) {
      const resource = data.resourceSets[0].resources[0]
      const location1 = resource.point.coordinates
      const forbiddenLocation = [52.86519623, -7.97945976]
      if (location1[0] === forbiddenLocation[0] && location1[1] === forbiddenLocation[1]) {
        throw new Error('This location is not allowed.')
      }
      return location1
    }
    throw new Error('Location not found.')
  } catch (error) {
    console.error('Failed to geocode Eircode:', error)
    return null
  }
}

export { fetchAveragePropertyPrice, fetchAverageRent, geocodeEircode }
