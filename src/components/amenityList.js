import React, { useState } from 'react'
import PropTypes from 'prop-types'
import parse from 'html-react-parser'
import AmenityItem from './amenityComponent'

const AmenitiesList = ({ amenities, map }) => {
  const [openType, setOpenType] = useState(null)
  const groupAmenitiesByType = (amenities) => {
    const grouped = {}
    amenities.forEach((amenity) => {
      const amenityhtml = amenity._popup._content
      let header = null
      const dropdownContent = []
      let type = 'unknown'
      const hrefsAdded = new Set()

      const customParseOptions = {
        replace: (domNode) => {
          if (domNode.type === 'tag' && domNode.name === 'strong' && !header) {
            header = domNode.children[0].data
            return <span>{header}</span>
          }
          if (domNode.type === 'tag' && domNode.name === 'a' && !hrefsAdded.has(domNode.attribs.href)) {
            dropdownContent.push(
                <a href={domNode.attribs.href} target="_blank" rel="noopener noreferrer">
                  Visit Website
                </a>
            )
            hrefsAdded.add(domNode.attribs.href)
          }
        }
      }

      const typearse = parse(amenityhtml, customParseOptions)
      const typearse2 = String(typearse[2])
      const typearse3 = typearse2.slice(6)
      type = typearse3 || 'unknown'

      if (!grouped[type]) {
        grouped[type] = []
      }
      grouped[type].push({
        ...amenity,
        header,
        details: dropdownContent
      })
    })
    return grouped
  }

  const groupedAmenities = groupAmenitiesByType(amenities)

  const toggleOpenType = (type) => {
    if (openType === type) {
      setOpenType(null) // If the same type is clicked, close it
    } else {
      setOpenType(type) // Open the clicked type
    }
  }

  return (
    <div>
      {Object.keys(groupedAmenities).map((type) => (
        <div key={type}>
          <button onClick={() => toggleOpenType(type)} style={{ cursor: 'pointer', background: 'none', border: 'none', padding: '0', margin: '0', fontSize: '16px', fontWeight: 'bold' }}>
            {type.charAt(0).toUpperCase() + type.slice(1)} ({groupedAmenities[type].length})
          </button>
          {openType === type && (
            <ul>
              {groupedAmenities[type].map((amenity, index) => (
  <AmenityItem
    key={index}
    type={type}
    header={amenity.header}
    details={amenity.details}
    _latlng={amenity._latlng}
    map={map}
  />
              ))}

            </ul>
          )}
        </div>
      ))}
    </div>
  )
}

AmenitiesList.propTypes = {
  amenities: PropTypes.arrayOf(
    PropTypes.shape({
      type: PropTypes.string
    })
  ).isRequired,
  map: PropTypes.object

}

export default AmenitiesList
