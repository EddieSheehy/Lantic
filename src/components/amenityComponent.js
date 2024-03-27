import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { getAmenityIcon } from '../utils/utils-amenities.js'

const AmenityItem = ({ type, header, details }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const icon = getAmenityIcon(type)
  const iconUrl = icon.options.iconUrl

  // Determine if there are details to show
  const hasDetails = Array.isArray(details) && details.length > 0

  const styles = {
    listItem: {
      display: 'flex',
      flexDirection: 'column', // Changed to column to stack children vertically
      alignItems: 'flex-start', // Align items to the start of the container
      marginBottom: '10px'
    },
    headerContainer: {
      display: 'flex', // Use flex to align icon and header horizontally
      alignItems: 'center' // Align items vertically
    },
    icon: {
      width: '40px',
      height: '40px',
      marginRight: '10px'
    },
    text: {
      fontWeight: 'bold',
      fontSize: '16px',
      cursor: hasDetails ? 'pointer' : 'default'
    },
    dropdown: {
      marginLeft: '50px' // Adjust if necessary to align with your design
    }
  }

  // Only attach click handler if there are details
  const handleToggleDropdown = () => {
    if (hasDetails) {
      setDropdownOpen(!dropdownOpen)
    }
  }

  return (
    <li style={styles.listItem}>
      <div style={styles.headerContainer} onClick={handleToggleDropdown}>
        <img src={iconUrl} alt={type} style={styles.icon} />
        <div style={styles.text}>
          {header}
        </div>
      </div>
      {dropdownOpen && hasDetails && (
        <div className="dropdown-menu" style={styles.dropdown}>
          {details.map((detail, index) => (
            <div key={index}>{detail}</div> // Render each detail
          ))}
        </div>
      )}
    </li>
  )
}

AmenityItem.propTypes = {
  type: PropTypes.string.isRequired,
  header: PropTypes.node.isRequired,
  details: PropTypes.arrayOf(PropTypes.node) // Details can be an array of nodes, making it optional
}

export default AmenityItem
