import React from 'react'
import PropTypes from 'prop-types'
import { getAmenityIcon } from '../utils/utils-amenities.js'

const AmenityItem = ({ type, header, details, _latlng, map }) => {
  const flyToLocation = () => {
    if (map && _latlng) {
      map.flyTo([_latlng.lat, _latlng.lng], 18)
    }
  }

  const icon = getAmenityIcon(type)
  const iconUrl = icon.options.iconUrl

  const styles = {
    listItem: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      marginBottom: '10px'
    },
    headerContainer: {
      display: 'flex',
      alignItems: 'center'
    },
    flyToButton: {
      display: 'block',
      width: 'auto',
      padding: '10px',
      marginBottom: '10px',
      border: 'none',
      borderRadius: '5px',
      backgroundColor: '#2897ff',
      color: 'white',
      textAlign: 'center',
      cursor: 'pointer',
      fontSize: '16px'
    },
    buttonsContainer: {
      display: 'flex',
      alignItems: 'center',
      marginLeft: '10px'
    },
    icon: {
      width: '40px',
      height: '40px',
      marginRight: '10px'
    },
    text: {
      fontWeight: 'bold',
      fontSize: '16px'
    }
  }

  const detailButtons = details.map((detail, index) => {
    if (detail.props.href) {
      return (
        <button
          key={index}
          style={{
            display: 'block',
            background: 'purple',
            color: 'white',
            padding: '10px',
            marginBottom: '10px',
            fontSize: '16px',
            width: 'auto',
            border: 'none',
            cursor: 'pointer',
            margin: '5px',
            borderRadius: '4px'
          }}
          onClick={() => window.open(detail.props.href, '_blank')}
        >
          Site
        </button>
      )
    }
    return null
  })

  return (
    <li style={styles.listItem}>
      <div style={styles.headerContainer}>
        <img src={iconUrl} alt={type} style={styles.icon} />
        <div style={styles.text}>
          {header}
          <div style={styles.buttonsContainer}>
          <button style={styles.flyToButton} onClick={flyToLocation}>Go to Location</button>
          {detailButtons}
          </div>
        </div>
      </div>
    </li>
  )
}

AmenityItem.propTypes = {
  type: PropTypes.string.isRequired,
  header: PropTypes.node.isRequired,
  details: PropTypes.arrayOf(PropTypes.node),
  _latlng: PropTypes.object,
  map: PropTypes.object
}

export default AmenityItem
