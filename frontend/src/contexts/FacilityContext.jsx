import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { API_ENDPOINTS } from '../config/api'

const FacilityContext = createContext()

export const useFacility = () => {
    const context = useContext(FacilityContext)
    if (!context) {
        throw new Error('useFacility must be used within FacilityProvider')
    }
    return context
}

export const FacilityProvider = ({ children }) => {
    const { token } = useAuth()
    const [currentFacility, setCurrentFacility] = useState(null)
    const [facilities, setFacilities] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchFacilities = async () => {
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const response = await axios.get(API_ENDPOINTS.FACILITIES, {
                headers: { Authorization: `Bearer ${token}` }
            })
            const activeFacilities = response.data.filter(f => f.status === 'A')
            setFacilities(activeFacilities)

            // Load saved facility from localStorage
            const savedFacilityId = localStorage.getItem('currentFacilityId')
            if (savedFacilityId) {
                const savedFacility = activeFacilities.find(f => f.id === savedFacilityId)
                if (savedFacility) {
                    setCurrentFacility(savedFacility)
                } else if (activeFacilities.length > 0) {
                    setCurrentFacility(activeFacilities[0])
                }
            } else if (activeFacilities.length > 0) {
                setCurrentFacility(activeFacilities[0])
            }
        } catch (error) {
            console.error('Failed to fetch facilities:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchFacilities()
    }, [token])

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
