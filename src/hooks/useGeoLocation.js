import { useState, useEffect } from 'react';

const useGeoLocation = (eircode) => {
  const [location, setLocation] = useState(null);


  useEffect(() => {
    if (!eircode) {
      // No eircode provided, don't attempt to fetch location
      setLocation(null);
      return;
    }

    const fetchLocation = async () => {
      
        const bingGeocodingUrl = `https://dev.virtualearth.net/REST/v1/Locations?countryRegion=IE&postalcode=${encodeURIComponent(eircode)}&key=AmSsIUTDSvycwzlsc5E_knb_qVHrEiJ-t3zWaoxIxB_BrikqpOHi95wIGjTRIkeR`;
        
        const response = await fetch(bingGeocodingUrl);

        const data = await response.json();
        if (data.resourceSets[0].resources.length > 0) {
          var resource = data.resourceSets[0].resources[0];
          var coordinates = resource.point.coordinates;
          setLocation(coordinates);
        } else {
          alert("Eircode not found.");
        } 
    };

    fetchLocation();
  }, [eircode]);

  return { location };
};

export default useGeoLocation;
