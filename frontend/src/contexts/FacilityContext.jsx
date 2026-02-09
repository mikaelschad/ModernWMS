import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const FacilityContext = createContext()

export const useFacility = () => {
    const context = useContext(FacilityContext)
    if (!context) {
        throw new Error('useFacility must be used within FacilityProvider')
    }
    return context
}

export const FacilityProvider = ({ children }) => {
    const [currentFacility, setCurrentFacility] = useState(null)
    const [facilities, setFacilities] = useState([])
    const [loading, setLoading] = useState(true)

    // Load facilities from API
    useEffect(() => {
        const fetchFacilities = async () => {
            try {
                const response = await axios.get('http://localhost:5017/api/Facility')
                const activeFacilities = response.data.filter(f => f.status === 'A')
                setFacilities(activeFacilities)

                // Load saved facility from localStorage
                const savedFacilityId = localStorage.getItem('currentFacilityId')
                if (savedFacilityId) {
                    const savedFacility = activeFacilities.find(f => f.id === savedFacilityId)
                    if (savedFacility) {
                        setCurrentFacility(savedFacility)
                    } else if (activeFacilities.length > 0) {
                        // If saved facility not found, use first available
                        setCurrentFacility(activeFacilities[0])
                    }
                } else if (activeFacilities.length > 0) {
                    // No saved facility, use first available
                    setCurrentFacility(activeFacilities[0])
                }
            } catch (error) {
                console.error('Failed to fetch facilities:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchFacilities()
    }, [])

    // Persist facility selection to localStorage
    const selectFacility = (facility) => {
        setCurrentFacility(facility)
        if (facility) {
            localStorage.setItem('currentFacilityId', facility.id)
        } else {
            localStorage.removeItem('currentFacilityId')
        }
    }

    const value = {
        currentFacility,
        facilities,
        loading,
        selectFacility
    }

    return (
        <FacilityContext.Provider value={value}>
            {children}
        </FacilityContext.Provider>
    )
}
