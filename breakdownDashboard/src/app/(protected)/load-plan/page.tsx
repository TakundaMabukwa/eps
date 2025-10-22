"use client"

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose, DialogPortal, DialogOverlay } from '@/components/ui/dialog'
import { X, FileText, CheckCircle, AlertTriangle, Clock, TrendingUp, Plus, Route, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { LocationAutocomplete } from '@/components/ui/location-autocomplete'
import { ProgressWithWaypoints } from '@/components/ui/progress-with-waypoints'
import { RouteOptimizer } from '@/components/ui/route-optimizer'
import { RouteTracker } from '@/components/ui/route-tracker'
import { RoutePreviewMap } from '@/components/ui/route-preview-map'
import { RouteConfirmationModal } from '@/components/ui/route-confirmation-modal'
import { DateTimePicker } from '@/components/ui/datetime-picker'

export default function LoadPlanPage() {
  console.log('LoadPlanPage component rendering')
  const supabase = createClient()
  console.log('Supabase client created:', !!supabase)
  const [loads, setLoads] = useState([
    {
      id: 'test-1',
      trip_id: 'TEST-123',
      client: 'Test Client',
      commodity: 'Test Cargo',
      rate: '1000',
      startdate: '2025-01-15',
      enddate: '2025-01-16',
      status: 'pending',
      vehicleassignments: []
    }
  ])
  const [clients, setClients] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [drivers, setDrivers] = useState([])
  const [availableDrivers, setAvailableDrivers] = useState([])
  const [vehicleTrackingData, setVehicleTrackingData] = useState([])

  // Create Load form state
  const [client, setClient] = useState('')
  const [commodity, setCommodity] = useState('')
  const [rate, setRate] = useState('')
  const [orderNumber, setOrderNumber] = useState(`ORD-${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`)
  const [comment, setComment] = useState('')
  // Address & ETA section
  const [etaPickup, setEtaPickup] = useState('')
  const [loadingLocation, setLoadingLocation] = useState('')
  const [etaDropoff, setEtaDropoff] = useState('')
  const [dropOffPoint, setDropOffPoint] = useState('')
  const [showSecondSection, setShowSecondSection] = useState(false)
  const secondRef = useRef<HTMLDivElement | null>(null)
  const [optimizedRoute, setOptimizedRoute] = useState<any>(null)
  const [showRouteModal, setShowRouteModal] = useState(false)
  const [isOptimizing, setIsOptimizing] = useState(false)

  // Driver assignments state
  const [driverAssignments, setDriverAssignments] = useState([{ id: '', name: '' }])
  
  // Cost calculation state
  const [selectedVehicle, setSelectedVehicle] = useState('')
  const [fuelPricePerLiter, setFuelPricePerLiter] = useState('21.55')
  const [estimatedDistance, setEstimatedDistance] = useState(0)
  const [approximateFuelCost, setApproximateFuelCost] = useState(0)
  const [approximatedCPK, setApproximatedCPK] = useState(0)
  const [approximatedVehicleCost, setApproximatedVehicleCost] = useState(0)
  const [approximatedDriverCost, setApproximatedDriverCost] = useState(0)
  const [totalVehicleCost, setTotalVehicleCost] = useState(0)
  const [goodsInTransitPremium, setGoodsInTransitPremium] = useState('')
  const [tripType, setTripType] = useState('local')
  const [stopPoints, setStopPoints] = useState([])
  const [availableStopPoints, setAvailableStopPoints] = useState([])

  // Fetch loads and reference data
  // Fetch stop points separately when needed
  const fetchStopPoints = async () => {
    try {
      const { data: stopPointsData, error: stopPointsError } = await supabase
        .from('stop_points')
        .select('id, name, name2, coordinates, color, outline, style_url, value, radius, coordinates5, coordinates6')
      
      if (stopPointsError) {
        console.error('Stop points error:', stopPointsError)
      } else {
        setAvailableStopPoints(stopPointsData || [])
      }
    } catch (err) {
      console.error('Error fetching stop points:', err)
    }
  }

  const fetchData = async () => {
    console.log('Starting fetchData...')
    try {
      console.log('Fetching from Supabase...')
      const [
        { data: loadsData, error: loadsError },
        { data: clientsData, error: clientsError },
        { data: vehiclesData, error: vehiclesError },
        { data: driversData, error: driversError },

        trackingResponse
      ] = await Promise.all([
        supabase.from('trips').select('*'),
        supabase.from('clients').select('*'),
        supabase.from('vehiclesc').select('*'),
        supabase.from('drivers').select('*'),
        fetch('http://64.227.138.235:3000/api/eps-vehicles')
      ])
      

      
      console.log('Supabase errors:', { loadsError, clientsError, vehiclesError, driversError })
      
      const trackingData = await trackingResponse.json()
      const vehicleData = trackingData?.result?.data || trackingData?.data || trackingData || []
      
      // Format drivers from drivers table
      const formattedDrivers = (driversData || []).map(driver => ({
        id: driver.id,
        name: `${driver.first_name} ${driver.surname}`.trim(),
        first_name: driver.first_name || '',
        surname: driver.surname || '',
        available: driver.available
      }))
      
      // Filter available drivers
      const availableDriversList = formattedDrivers.filter(d => d.available === true)
      
      // Helper function to parse JSON fields
      const parseJsonField = (field) => {
        if (!field) return null
        if (typeof field === 'object') return field
        try {
          return JSON.parse(field)
        } catch {
          return null
        }
      }
      
      // Convert trip data to load format for display
      const loadData = (loadsData || []).map(trip => {
        const clientDetails = parseJsonField(trip.clientdetails)
        const pickupLocations = parseJsonField(trip.pickuplocations)
        const dropoffLocations = parseJsonField(trip.dropofflocations)
        
        return {
          ...trip,
          client: clientDetails?.name || '',
          commodity: trip.cargo || '',
          etaPickup: pickupLocations?.[0]?.scheduled_time || trip.startdate || '',
          etaDropoff: dropoffLocations?.[0]?.scheduled_time || trip.enddate || '',
          loadingLocation: trip.origin || '',
          dropOffPoint: trip.destination || ''
        }
      })
      
      console.log('Raw loads data:', loadsData)
      console.log('Raw loads count:', loadsData?.length || 0)
      console.log('Processed load data:', loadData)
      console.log('Processed loads count:', loadData?.length || 0)
      
      setLoads(loadData)
      setClients(clientsData || [])
      setVehicles(vehiclesData || [])
      setDrivers(formattedDrivers)
      setAvailableDrivers(availableDriversList)
      setVehicleTrackingData(vehicleData)
      setAvailableStopPoints([])
    } catch (err) {
      console.error('Error fetching data:', err)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Memoized vehicle and driver lookups
  const vehicleMap = useMemo(() => 
    new Map(vehicles.map(v => [v.id, v.registration_number])), [vehicles]
  )
  
  const driverMap = useMemo(() => 
    new Map(drivers.map(d => [d.id, `${d.first_name} ${d.surname}`])), [drivers]
  )

  // Calculate distance between two coordinates
  const calculateDistance = useCallback((lat1, lon1, lat2, lon2) => {
    const R = 6371 // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }, [])

  // Get pickup location coordinates using Mapbox
  const getPickupCoordinates = useCallback(async (location) => {
    if (!location) return null
    try {
      const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
      if (!mapboxToken) return null
      
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(location)}.json?access_token=${mapboxToken}&country=za&limit=1`
      )
      const data = await response.json()
      if (data.features?.[0]?.center) {
        const [lon, lat] = data.features[0].center
        return { lat, lon }
      }
    } catch (error) {
      console.error('Error geocoding pickup location:', error)
    }
    return null
  }, [])

  // Get sorted drivers by distance from pickup location
  const getSortedDriversByDistance = useCallback(async (pickupLocation) => {
    if (!pickupLocation) return drivers
    
    const pickupCoords = await getPickupCoordinates(pickupLocation)
    if (!pickupCoords) return drivers
    
    // Use stored vehicle tracking data
    const driversWithDistance = drivers.map(driver => {
      // Find matching vehicle by driver name
      const trackingData = Array.isArray(vehicleTrackingData) ? vehicleTrackingData : []
      const driverFullName = `${driver.first_name} ${driver.surname}`.trim().toLowerCase()
      const matchingVehicle = trackingData.find(vehicle => 
        vehicle.driver_name && 
        vehicle.driver_name.toLowerCase() === driverFullName
      )
      
      if (matchingVehicle?.latitude && matchingVehicle?.longitude) {
        const distance = calculateDistance(
          pickupCoords.lat, pickupCoords.lon,
          parseFloat(matchingVehicle.latitude), parseFloat(matchingVehicle.longitude)
        )
        return { ...driver, distance: Math.round(distance * 10) / 10 }
      }
      
      return { ...driver, distance: null }
    })
    
    // Sort by distance (closest first, then drivers without coordinates)
    return driversWithDistance.sort((a, b) => {
      if (a.distance === null && b.distance === null) return 0
      if (a.distance === null) return 1
      if (b.distance === null) return -1
      return a.distance - b.distance
    })
  }, [drivers, calculateDistance, getPickupCoordinates, vehicleTrackingData])

  // State for sorted drivers
  const [sortedDrivers, setSortedDrivers] = useState(drivers)
  const [isCalculatingDistance, setIsCalculatingDistance] = useState(false)



  // Preview route when locations change (only for national trips) - without saving
  useEffect(() => {
    const previewRoute = async () => {
      if (!loadingLocation || !dropOffPoint) {
        setOptimizedRoute(null)
        return
      }
      
      if (tripType !== 'national') {
        return
      }
      
      setIsOptimizing(true)
      try {
        // Get waypoints from selected stop points
        const selectedStopPoints = getSelectedStopPointsData()
        const waypoints = selectedStopPoints.map(point => {
          // Calculate centroid of polygon for waypoint
          const coords = point.coordinates
          const avgLng = coords.reduce((sum, coord) => sum + coord[0], 0) / coords.length
          const avgLat = coords.reduce((sum, coord) => sum + coord[1], 0) / coords.length
          return `${avgLng},${avgLat}`
        })
        
        // Use preview endpoint that doesn't save to database
        const response = await fetch('/api/routes/preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            origin: loadingLocation,
            destination: dropOffPoint,
            pickupTime: etaPickup,
            waypoints: waypoints
          })
        })
        
        if (response.ok) {
          const routeData = await response.json()
          setOptimizedRoute(routeData)
        }
      } catch (error) {
        console.error('Route preview failed:', error)
      }
      setIsOptimizing(false)
    }
    
    previewRoute()
  }, [loadingLocation, dropOffPoint, orderNumber, etaPickup, tripType, JSON.stringify(stopPoints)])

  // Update sorted drivers when pickup location changes
  useEffect(() => {
    if (loadingLocation) {
      getSortedDriversByDistance(loadingLocation).then(setSortedDrivers)
    } else {
      setSortedDrivers(drivers)
    }
  }, [loadingLocation, getSortedDriversByDistance, drivers])

  // Calculate estimated distance when locations change
  useEffect(() => {
    const calculateRouteDistance = async () => {
      if (!loadingLocation || !dropOffPoint) {
        console.log('Missing locations for distance calc:', { loadingLocation, dropOffPoint })
        setEstimatedDistance(0)
        return
      }
      
      try {
        const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
        if (!mapboxToken) {
          console.log('No Mapbox token available')
          return
        }
        
        console.log('Calculating distance between:', loadingLocation, 'and', dropOffPoint)
        
        // First geocode the locations to get coordinates
        const [originResponse, destResponse] = await Promise.all([
          fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(loadingLocation)}.json?access_token=${mapboxToken}&country=za&limit=1`),
          fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(dropOffPoint)}.json?access_token=${mapboxToken}&country=za&limit=1`)
        ])
        
        const [originData, destData] = await Promise.all([
          originResponse.json(),
          destResponse.json()
        ])
        
        if (!originData.features?.[0] || !destData.features?.[0]) {
          console.log('Could not geocode locations')
          return
        }
        
        const originCoords = originData.features[0].center
        const destCoords = destData.features[0].center
        
        console.log('Origin coords:', originCoords, 'Dest coords:', destCoords)
        
        const response = await fetch(
          `https://api.mapbox.com/directions/v5/mapbox/driving/${originCoords[0]},${originCoords[1]};${destCoords[0]},${destCoords[1]}?access_token=${mapboxToken}&geometries=geojson`
        )
        const data = await response.json()
        console.log('Mapbox response:', data)
        
        if (data.routes?.[0]?.distance) {
          const distanceKm = Math.round(data.routes[0].distance / 1000)
          console.log('Distance calculated:', distanceKm, 'km')
          setEstimatedDistance(distanceKm)
        } else {
          console.log('No route found in response')
        }
      } catch (error) {
        console.error('Error calculating distance:', error)
      }
    }
    
    calculateRouteDistance()
  }, [loadingLocation, dropOffPoint])

  // Calculate costs when relevant values change
  useEffect(() => {
    console.log('Calculating costs:', { fuelPricePerLiter, estimatedDistance })
    // Approximate fuel cost = fuel price * estimated km
    const fuelPrice = parseFloat(fuelPricePerLiter) || 0
    const distance = estimatedDistance || 0
    const fuelCost = fuelPrice * distance
    setApproximateFuelCost(fuelCost)
    
    // CPK = fuel cost per kilometer
    const cpk = distance > 0 ? fuelCost / distance : 0
    setApproximatedCPK(cpk)
    console.log('Calculated fuel cost:', fuelCost, 'CPK:', cpk)
  }, [fuelPricePerLiter, estimatedDistance])

  // Calculate vehicle cost based on assigned driver's vehicle
  useEffect(() => {
    const assignedDriver = driverAssignments.find(d => d.id)
    if (assignedDriver?.id) {
      // Find driver in database by surname
      const driver = drivers.find(d => d.id === assignedDriver.id)
      if (driver?.surname) {
        // Find vehicle assigned to this driver from tracking data using surname
        const trackingData = Array.isArray(vehicleTrackingData) ? vehicleTrackingData : []
        const matchingVehicle = trackingData.find(vehicle => 
          vehicle.driver_name && 
          vehicle.driver_name.toLowerCase().includes(driver.surname.toLowerCase())
        )
        
        if (matchingVehicle?.registration) {
          // Find vehicle in database by registration
          const vehicle = vehicles.find(v => v.registration_number === matchingVehicle.registration)
          let vehicleHourlyRate = 0
          if (vehicle?.hourly_rate) {
            vehicleHourlyRate = parseFloat(vehicle.hourly_rate)
          } else {
            // Default vehicle hourly rate
            vehicleHourlyRate = 75 // R75 per hour default
          }
          const vehicleCost = vehicleHourlyRate * 8
          setApproximatedVehicleCost(vehicleCost)
          console.log('Vehicle cost calculated:', vehicleCost)
        } else {
          setApproximatedVehicleCost(0)
        }
      } else {
        setApproximatedVehicleCost(0)
      }
    } else {
      setApproximatedVehicleCost(0)
    }
  }, [driverAssignments, drivers, vehicles, vehicleTrackingData])

  // Calculate driver cost when driver is selected
  useEffect(() => {
    const assignedDriver = driverAssignments.find(d => d.id)
    console.log('Calculating driver cost for:', assignedDriver)
    if (assignedDriver?.id) {
      const driver = drivers.find(d => d.id === assignedDriver.id)
      console.log('Found driver:', driver)
      // Use monthly salary to calculate hourly rate if available
      let hourlyRate = 0
      if (driver?.hourly_rate) {
        hourlyRate = parseFloat(driver.hourly_rate)
      } else if (driver?.monthly_salary) {
        // Calculate hourly rate from monthly salary (30 days * 8 hours)
        hourlyRate = parseFloat(driver.monthly_salary) / (30 * 8)
      } else {
        // Default hourly rate if no salary data
        hourlyRate = 50 // R50 per hour default
      }
      
      const driverCost = hourlyRate * 8
      setApproximatedDriverCost(driverCost)
      console.log('Driver cost calculated:', driverCost, 'hourly rate:', hourlyRate)
    } else {
      setApproximatedDriverCost(0)
    }
  }, [driverAssignments, drivers])

  // Calculate total cost
  useEffect(() => {
    const total = approximateFuelCost + approximatedVehicleCost + approximatedDriverCost + (parseFloat(goodsInTransitPremium) || 0)
    setTotalVehicleCost(total)
  }, [approximateFuelCost, approximatedVehicleCost, approximatedDriverCost, goodsInTransitPremium])

  // Get selected stop points with coordinates
  const getSelectedStopPointsData = () => {
    return stopPoints.map(pointId => {
      const point = availableStopPoints.find(p => p.id.toString() === pointId)
      if (point?.coordinates) {
        try {
          // Parse coordinates format: "28.141508,-26.232723,0 28.140979,-26.232172,0 ..."
          const coordPairs = point.coordinates.split(' ')
            .filter(coord => coord.trim())
            .map(coord => {
              const [lng, lat, alt] = coord.split(',')
              return [parseFloat(lng), parseFloat(lat)]
            })
            .filter(pair => !isNaN(pair[0]) && !isNaN(pair[1]))
          
          return {
            id: point.id,
            name: point.name,
            coordinates: coordPairs
          }
        } catch (error) {
          console.error('Error parsing coordinates:', error)
          return null
        }
      }
      return null
    }).filter(Boolean)
  }

  // Optimized handlers with useCallback
  const handleDriverChange = useCallback((driverIndex, driverId) => {
    const selectedDriver = drivers.find(d => d.id === driverId)
    setDriverAssignments(prev => {
      const updated = [...prev]
      updated[driverIndex] = { 
        id: driverId, 
        name: `${driverId} - ${selectedDriver?.surname || ''}`,
        first_name: selectedDriver?.first_name || '',
        surname: selectedDriver?.surname || ''
      }
      return updated
    })
  }, [drivers])

  const addDriver = useCallback(() => {
    setDriverAssignments(prev => [...prev, { id: '', name: '' }])
  }, [])

  // Auto-select closest driver when dropdown is opened
  const handleDriverDropdownOpen = useCallback(async (driverIndex) => {
    if (!loadingLocation) return
    
    setIsCalculatingDistance(true)
    try {
      const sorted = await getSortedDriversByDistance(loadingLocation)
      setSortedDrivers(sorted)
      
      // Auto-select closest driver if available
      const closestDriver = sorted.find(d => d.distance !== null)
      if (closestDriver) {
        handleDriverChange(driverIndex, closestDriver.id)
      }
    } catch (error) {
      console.error('Error calculating driver distances:', error)
    }
    setIsCalculatingDistance(false)
  }, [loadingLocation, getSortedDriversByDistance, handleDriverChange])

  // Helper to get assigned vehicles/drivers display
  const getAssignmentsDisplay = (load) => {
    const assignments = load.vehicleAssignments || load.vehicle_assignments || []
    if (!assignments.length) return 'Unassigned'
    
    return assignments.map(assignment => {
      const vehicleName = assignment.vehicle?.name || 'Unknown Vehicle'
      const driverNames = assignment.drivers?.map(d => d.name).filter(Boolean).join(', ') || 'No Driver'
      return `${vehicleName} (${driverNames})`
    }).join('; ')
  }

  // Parse JSON fields safely
  const parseJsonField = (field) => {
    if (!field) return []
    if (Array.isArray(field)) return field
    try {
      return JSON.parse(field)
    } catch {
      return []
    }
  }

  const [summaryOpen, setSummaryOpen] = useState(false)
  const [selectedLoad, setSelectedLoad] = useState<any | null>(null)
  // Routing assigned items
  const [assignedItems, setAssignedItems] = useState<any[]>([])
  // Left items available to assign
  const [leftItems, setLeftItems] = useState<any[]>([
    { id: 'a', title: 'VINCEMUS INVESTMENTS (P...)', addr: 'Johannesburg, South Africa', addr2: 'Estcourt, 3310, South Africa' },
    { id: 'b', title: 'TRADELANDER 5 CC', addr: 'Randfontein, South Africa' }
  ])

  const handleCreateClick = (e: React.FormEvent) => {
    e.preventDefault()
    handleCreate()
  }

  const handleCreate = async () => {
    try {
      // Save route to database only when creating the load
      let routeId = null
      if (tripType === 'national' && loadingLocation && dropOffPoint) {
        try {
          const selectedStopPoints = getSelectedStopPointsData()
          const waypoints = selectedStopPoints.map(point => {
            const coords = point.coordinates
            const avgLng = coords.reduce((sum, coord) => sum + coord[0], 0) / coords.length
            const avgLat = coords.reduce((sum, coord) => sum + coord[1], 0) / coords.length
            return `${avgLng},${avgLat}`
          })
          
          const routeResponse = await fetch('/api/routes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              origin: loadingLocation,
              destination: dropOffPoint,
              orderId: orderNumber,
              pickupTime: etaPickup,
              waypoints: waypoints
            })
          })
          
          if (routeResponse.ok) {
            const routeData = await routeResponse.json()
            routeId = routeData.route?.id
          }
        } catch (routeError) {
          console.error('Error saving route:', routeError)
          // Continue with load creation even if route saving fails
        }
      }
      
      const tripData = {
        trip_id: `LOAD-${Date.now()}`,
        ordernumber: orderNumber,
        rate: rate,
        cargo: commodity,
        origin: loadingLocation,
        destination: dropOffPoint,
        notes: comment,
        status: 'pending',
        startdate: etaPickup ? etaPickup.split('T')[0] : null,
        enddate: etaDropoff ? etaDropoff.split('T')[0] : null,
        route: routeId ? routeId.toString() : null, // Link to saved route

        clientdetails: {
          name: client,
          email: '',
          phone: '',
          address: '',
          contactPerson: ''
        },
        pickuplocations: [{
          location: loadingLocation || '',
          address: loadingLocation || '',
          scheduled_time: etaPickup || ''
        }],
        dropofflocations: [{
          location: dropOffPoint || '',
          address: dropOffPoint || '',
          scheduled_time: etaDropoff || ''
        }],
        vehicleassignments: [{
          drivers: driverAssignments,
          vehicle: { id: '', name: '' }
        }],
        trip_type: tripType,
        selected_stop_points: tripType === 'national' ? stopPoints : [],
        approximate_fuel_cost: approximateFuelCost,
        approximated_cpk: approximatedCPK,
        approximated_vehicle_cost: approximatedVehicleCost,
        approximated_driver_cost: approximatedDriverCost,
        total_vehicle_cost: totalVehicleCost,
        goods_in_transit_premium: parseFloat(goodsInTransitPremium) || null,
        estimated_distance: estimatedDistance,
        fuel_price_per_liter: parseFloat(fuelPricePerLiter) || null
      }
      
      const { error } = await supabase.from('trips').insert([tripData])
      if (error) throw error
      
      // Mark assigned drivers as unavailable
      const assignedDriverIds = driverAssignments
        .map(d => d.id)
        .filter(id => id)
      
      if (assignedDriverIds.length > 0) {
        const { error: driverError } = await supabase
          .from('drivers')
          .update({ available: false })
          .in('id', assignedDriverIds)
        
        if (driverError) {
          console.error('Error updating driver availability:', driverError)
        }
      }
      
      // Reset form
      setClient(''); setCommodity(''); setRate(''); setOrderNumber(''); setComment('')
      setEtaPickup(''); setLoadingLocation(''); setEtaDropoff(''); setDropOffPoint('')
      setDriverAssignments([{ id: '', name: '' }])
      setTripType('local')
      setStopPoints([])
      setFuelPricePerLiter('')
      setGoodsInTransitPremium('')
      setShowSecondSection(false)
      setOptimizedRoute(null)
      
      // Refresh data
      fetchData()
      
      alert('Load created successfully!')
    } catch (err) {
      console.error('Error creating load:', err)
      const errorMessage = err?.message || err?.error?.message || 'Unknown error occurred'
      alert(`Failed to create load: ${errorMessage}`)
    }
  }

  return (
    <div className="p-6 space-y-6 w-full">
      <h1 className="text-2xl font-bold mb-6">Load Plan</h1>
      
      <Tabs defaultValue="loads" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="loads">Loads</TabsTrigger>
          <TabsTrigger value="create">Create Load</TabsTrigger>
          <TabsTrigger value="routing">Routing</TabsTrigger>
        </TabsList>

        <TabsContent value="loads" className="space-y-6">
          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border bg-white shadow-sm flex items-center space-x-4">
              <div><Route className="h-8 w-8 text-blue-500" /></div>
              <div>
                <p className="text-sm text-gray-500">Total Loads</p>
                <p className="text-xl font-semibold">{loads.length}</p>
              </div>
            </div>
            <div className="p-4 rounded-xl border bg-white shadow-sm flex items-center space-x-4">
              <div><CheckCircle className="h-8 w-8 text-green-500" /></div>
              <div>
                <p className="text-sm text-gray-500">Completed</p>
                <p className="text-xl font-semibold">{loads.filter(l => l.status === 'completed').length}</p>
              </div>
            </div>
            <div className="p-4 rounded-xl border bg-white shadow-sm flex items-center space-x-4">
              <div><Clock className="h-8 w-8 text-yellow-500" /></div>
              <div>
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-xl font-semibold">{loads.filter(l => l.status === 'pending').length}</p>
              </div>
            </div>
            <div className="p-4 rounded-xl border bg-white shadow-sm flex items-center space-x-4">
              <div><TrendingUp className="h-8 w-8 text-blue-500" /></div>
              <div>
                <p className="text-sm text-gray-500">In Transit</p>
                <p className="text-xl font-semibold">{loads.filter(l => l.status === 'in-transit').length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border shadow-sm">
            <div className="p-4">

              <Table>
                <TableHeader>
                  <TableRow className="bg-blue-100">
                    <TableHead>Client</TableHead>
                    <TableHead>Commodity</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Pickup</TableHead>
                    <TableHead>Drop Off</TableHead>
                    <TableHead>Assignments</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loads.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                        No trips available. Total loads: {loads.length}
                      </TableCell>
                    </TableRow>
                  ) : loads.map((row) => (
                    <TableRow key={row.id} className="hover:bg-muted/50">
                      <TableCell>{row.client}</TableCell>
                      <TableCell>{row.commodity}</TableCell>
                      <TableCell>{row.rate}</TableCell>
                      <TableCell>
                        {row.etaPickup ? (
                          row.etaPickup.includes('T') ? new Date(row.etaPickup).toLocaleString() : row.etaPickup
                        ) : (row.startdate || '-')}
                      </TableCell>
                      <TableCell>
                        {row.etaDropoff ? (
                          row.etaDropoff.includes('T') ? new Date(row.etaDropoff).toLocaleString() : row.etaDropoff
                        ) : (row.enddate || '-')}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {(() => {
                          const assignments = parseJsonField(row.vehicleassignments) || []
                          if (!assignments.length) return 'Unassigned'
                          return assignments.map(assignment => {
                            const vehicleName = assignment.vehicle?.name || 'Unknown Vehicle'
                            const driverNames = assignment.drivers?.map(d => d.name).filter(Boolean).join(', ') || 'No Driver'
                            return `${vehicleName} (${driverNames})`
                          }).join('; ')
                        })()
                        }
                      </TableCell>
                      <TableCell>
                        <span className={cn(
                          "px-2 py-1 rounded-full text-xs font-medium",
                          row.status === "completed" ? "bg-green-100 text-green-800" :
                          row.status === "in-transit" ? "bg-blue-100 text-blue-800" :
                          row.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                          "bg-red-100 text-red-800"
                        )}>
                          {row.status || 'pending'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <FileText className="h-4 w-4" />
                          Summary
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create New Load</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="space-y-6">
                {/* Basic Load Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="client">Client</Label>
                    <Input 
                      value={client} 
                      onChange={(e) => setClient(e.target.value)} 
                      placeholder="Enter client name" 
                    />
                  </div>
                  <div>
                    <Label htmlFor="commodity">Commodity</Label>
                    <Input value={commodity} onChange={(e) => setCommodity(e.target.value)} placeholder="Commodity" />
                  </div>

                  <div>
                    <Label htmlFor="orderNumber">Order Number</Label>
                    <Input value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} placeholder="Order Number" />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="comment">Comment</Label>
                    <Input value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Comment" />
                  </div>
                </div>

                {/* Location & Timing */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="etaPickup">ETA Pick Up</Label>
                    <DateTimePicker
                      value={etaPickup}
                      onChange={setEtaPickup}
                      placeholder="Select pickup date and time"
                    />
                  </div>
                  <div>
                    <LocationAutocomplete
                      label="Loading Location"
                      value={loadingLocation}
                      onChange={setLoadingLocation}
                      placeholder="Search for loading location"
                      clientLocations={useMemo(() => {
                        const selectedClient = clients.find(c => c.name === client)
                        if (!selectedClient) return []
                        try {
                          return typeof selectedClient.pickupLocations === 'string' ? 
                            JSON.parse(selectedClient.pickupLocations) : 
                            (selectedClient.pickupLocations || selectedClient.pickup_locations || [])
                        } catch { return [] }
                      }, [clients, client])
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="etaDropoff">ETA Drop Off</Label>
                    <DateTimePicker
                      value={etaDropoff}
                      onChange={setEtaDropoff}
                      placeholder="Select drop-off date and time"
                    />
                  </div>
                  <div>
                    <LocationAutocomplete
                      label="Drop Off Point"
                      value={dropOffPoint}
                      onChange={setDropOffPoint}
                      placeholder="Search for drop off location"
                      clientLocations={useMemo(() => {
                        const selectedClient = clients.find(c => c.name === client)
                        if (!selectedClient) return []
                        try {
                          return typeof selectedClient.dropoffLocations === 'string' ? 
                            JSON.parse(selectedClient.dropoffLocations) : 
                            (selectedClient.dropoffLocations || selectedClient.dropoff_locations || [])
                        } catch { return [] }
                      }, [clients, client])
                      }
                    />
                  </div>
                </div>

                {/* Trip Type Selection */}
                <div className="space-y-4">
                  <Label className="text-lg font-medium">Trip Type</Label>
                  <div className="flex space-x-6">
                    <div className="flex items-center space-x-2">
                      <input 
                        type="radio" 
                        id="local" 
                        name="tripType" 
                        value="local" 
                        checked={tripType === 'local'}
                        onChange={(e) => setTripType(e.target.value)}
                        className="w-4 h-4"
                      />
                      <Label htmlFor="local">Local Trip</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input 
                        type="radio" 
                        id="national" 
                        name="tripType" 
                        value="national" 
                        checked={tripType === 'national'}
                        onChange={(e) => {
                          setTripType(e.target.value)
                          if (e.target.value === 'national' && availableStopPoints.length === 0) {
                            fetchStopPoints()
                          }
                        }}
                        className="w-4 h-4"
                      />
                      <Label htmlFor="national">National Trip</Label>
                    </div>
                  </div>
                </div>

                {/* Stop Points for National Trips */}
                {tripType === 'national' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <Label className="text-lg font-medium">Stop Points</Label>
                      <Button 
                        type="button" 
                        onClick={() => setStopPoints([...stopPoints, ''])} 
                        size="sm"
                      >
                        <Plus className="h-4 w-4 mr-1" /> Add Stop Point
                      </Button>
                    </div>
                    
                    {stopPoints.map((stopPoint, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <Select 
                          value={stopPoint} 
                          onValueChange={(value) => {
                            const updated = [...stopPoints]
                            updated[index] = value
                            setStopPoints(updated)
                          }}
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Select stop point" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableStopPoints.map((point) => (
                              <SelectItem key={point.id} value={point.id.toString()}>
                                {point.name} {point.name2 ? `- ${point.name2}` : ''}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            const updated = stopPoints.filter((_, i) => i !== index)
                            setStopPoints(updated)
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Route Preview */}
                {loadingLocation && dropOffPoint && (
                  <div className="col-span-full">
                    <div className="space-y-4">
                      {isOptimizing && tripType === 'national' && (
                        <div className="flex items-center gap-2 text-sm text-blue-600">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          Optimizing route...
                        </div>
                      )}
                      <RoutePreviewMap
                        origin={loadingLocation}
                        destination={dropOffPoint}
                        routeData={tripType === 'national' ? optimizedRoute : null}
                        stopPoints={tripType === 'national' ? getSelectedStopPointsData() : []}
                      />
                    </div>
                  </div>
                )}

                {/* Driver Assignments */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label className="text-lg font-medium">Driver Assignments</Label>
                    <Button type="button" onClick={addDriver} size="sm">
                      <Plus className="h-4 w-4 mr-1" /> Add Driver
                    </Button>
                  </div>
                  
                  {driverAssignments.map((driver, driverIndex) => (
                    <div key={driverIndex} className="mb-2">
                      <Select 
                        value={driver.id} 
                        onValueChange={(value) => handleDriverChange(driverIndex, value)}
                        onOpenChange={(open) => {
                          if (open && loadingLocation && !driver.id) {
                            handleDriverDropdownOpen(driverIndex)
                          }
                        }}
                      >
                        <SelectTrigger className="w-full text-black">
                          <SelectValue className="text-black" placeholder={isCalculatingDistance ? "Finding closest driver..." : "Select driver"} />
                        </SelectTrigger>
                        <SelectContent>
                          {sortedDrivers.filter(d => d.available === true).map((d, index) => (
                            <SelectItem key={d.id} value={d.id}>
                              <div className="flex items-center justify-between w-full">
                                <span>{d.first_name} {d.surname}</span>
                                {d.distance !== null && (
                                  <span className={`text-xs ml-2 px-2 py-1 rounded ${
                                    index === 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                                  }`}>
                                    {d.distance}km
                                  </span>
                                )}
                                {index === 0 && d.distance !== null && (
                                  <span className="text-xs text-green-600 ml-1">Closest</span>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>

                {/* Rate Field */}
                <div>
                  <Label htmlFor="rate">Rate</Label>
                  <Input value={rate} onChange={(e) => setRate(e.target.value)} placeholder="Rate" />
                </div>

                {/* Cost Calculation Section */}
                <div className="space-y-6 p-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-600 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-800">Trip Cost Estimation</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="fuelPrice" className="text-sm font-medium text-slate-700">Fuel Price per Liter</Label>
                      <Input 
                        value={fuelPricePerLiter} 
                        onChange={(e) => setFuelPricePerLiter(e.target.value)} 
                        placeholder="R 20.50" 
                        type="number"
                        step="0.01"
                        className="border-slate-300 focus:border-slate-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="goodsInTransit" className="text-sm font-medium text-slate-700">Goods In Transit Premium</Label>
                      <Input 
                        value={goodsInTransitPremium} 
                        onChange={(e) => setGoodsInTransitPremium(e.target.value)} 
                        placeholder="R 500" 
                        type="number"
                        step="0.01"
                        className="border-slate-300 focus:border-slate-500"
                      />
                    </div>
                  </div>

                  {/* Cost Display */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Distance</p>
                      <p className="text-2xl font-bold text-slate-800 mt-1">{estimatedDistance}</p>
                      <p className="text-xs text-slate-600">kilometers</p>
                    </div>
                    <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Fuel Cost</p>
                      <p className="text-2xl font-bold text-slate-800 mt-1">R{approximateFuelCost.toFixed(0)}</p>
                      <p className="text-xs text-slate-600">estimated</p>
                    </div>
                    <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">CPK</p>
                      <p className="text-2xl font-bold text-slate-800 mt-1">R{approximatedCPK.toFixed(2)}</p>
                      <p className="text-xs text-slate-600">per km</p>
                    </div>
                    <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Vehicle Cost</p>
                      <p className="text-2xl font-bold text-slate-800 mt-1">R{approximatedVehicleCost.toFixed(0)}</p>
                      <p className="text-xs text-slate-600">8 hours</p>
                    </div>
                    <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Driver Cost</p>
                      <p className="text-2xl font-bold text-slate-800 mt-1">R{approximatedDriverCost.toFixed(0)}</p>
                      <p className="text-xs text-slate-600">8 hours</p>
                    </div>
                    <div className="p-4 bg-slate-600 rounded-lg shadow-md">
                      <p className="text-xs font-medium text-slate-200 uppercase tracking-wide">Total Cost</p>
                      <p className="text-2xl font-bold text-white mt-1">R{totalVehicleCost.toFixed(0)}</p>
                      <p className="text-xs text-slate-300">estimated</p>
                    </div>
                  </div>
                </div>

                <Button type="button" onClick={handleCreateClick} className="w-full">
                  Create Load
                </Button>
              </form>
            </CardContent>
          </Card>


        </TabsContent>

        <TabsContent value="routing" className="space-y-6">
          <div className="space-y-6">
            {/* Route Optimization for All Loads */}
            <Card>
              <CardHeader>
                <CardTitle>Route Optimization Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  View and track optimized truck routes for all loads. Routes are automatically optimized considering truck restrictions, traffic conditions, and delivery schedules.
                </p>
              </CardContent>
            </Card>

            {/* Trip Routes Display */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {loads.filter(trip => trip.status?.toLowerCase() !== 'delivered').map((trip) => {
                const assignments = parseJsonField(trip.vehicleassignments) || []
                const pickupLocations = parseJsonField(trip.pickuplocations) || []
                const dropoffLocations = parseJsonField(trip.dropofflocations) || []
                
                return (
                  <div key={trip.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    {/* Header */}
                    <div className="p-6 border-b border-slate-100">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-slate-100 rounded-lg">
                            <Route className="h-5 w-5 text-slate-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-900">{trip.trip_id}</h3>
                            <p className="text-sm text-slate-500">{trip.ordernumber}</p>
                          </div>
                        </div>
                        <span className={cn(
                          "px-3 py-1.5 rounded-full text-xs font-medium uppercase tracking-wide",
                          trip.status === "completed" ? "bg-emerald-100 text-emerald-700" :
                          trip.status === "in-transit" ? "bg-blue-100 text-blue-700" :
                          trip.status === "pending" ? "bg-amber-100 text-amber-700" :
                          "bg-slate-100 text-slate-700"
                        )}>
                          {trip.status || 'pending'}
                        </span>
                      </div>
                      
                      {/* Client & Commodity */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Client</p>
                          <p className="text-sm font-medium text-slate-900">{trip.clientdetails?.name || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Commodity</p>
                          <p className="text-sm font-medium text-slate-900">{trip.cargo || 'N/A'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="p-6 border-b border-slate-100">
                      <h4 className="text-sm font-semibold text-slate-900 mb-4">Progress Timeline</h4>
                      <div className="relative">
                        <div className="flex items-center justify-between mb-2">
                          {[
                            { label: 'Created', completed: true },
                            { label: 'Assigned', completed: assignments.length > 0 },
                            { label: 'In Transit', completed: trip.status === 'in-transit' || trip.status === 'completed' },
                            { label: 'Completed', completed: trip.status === 'completed' }
                          ].map((step, index, array) => (
                            <div key={step.label} className="flex flex-col items-center relative">
                              <div className={cn(
                                "w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-medium transition-colors",
                                step.completed 
                                  ? "bg-slate-600 border-slate-600 text-white" 
                                  : "bg-white border-slate-300 text-slate-400"
                              )}>
                                {index + 1}
                              </div>
                              <span className={cn(
                                "text-xs mt-2 font-medium",
                                step.completed ? "text-slate-900" : "text-slate-400"
                              )}>
                                {step.label}
                              </span>
                              {index < array.length - 1 && (
                                <div className={cn(
                                  "absolute top-4 left-8 w-full h-0.5 -z-10",
                                  step.completed && array[index + 1].completed 
                                    ? "bg-slate-600" 
                                    : "bg-slate-200"
                                )} style={{ width: 'calc(100% + 2rem)' }} />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Locations */}
                    <div className="p-6 border-b border-slate-100">
                      <h4 className="text-sm font-semibold text-slate-900 mb-4">Route Details</h4>
                      <div className="space-y-3">
                        {pickupLocations.map((pickup, index) => (
                          <div key={index} className="flex items-start gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                            <div className="p-1.5 bg-emerald-100 rounded-full">
                              <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-medium text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">PICKUP</span>
                              </div>
                              <p className="text-sm font-medium text-slate-900 truncate">{pickup.location || pickup.address}</p>
                              <p className="text-xs text-slate-500">{pickup.scheduled_time ? new Date(pickup.scheduled_time).toLocaleString() : 'Time TBD'}</p>
                            </div>
                          </div>
                        ))}
                        {dropoffLocations.map((dropoff, index) => (
                          <div key={index} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                            <div className="p-1.5 bg-red-100 rounded-full">
                              <MapPin className="h-3.5 w-3.5 text-red-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-medium text-red-700 bg-red-100 px-2 py-0.5 rounded">DROP-OFF</span>
                              </div>
                              <p className="text-sm font-medium text-slate-900 truncate">{dropoff.location || dropoff.address}</p>
                              <p className="text-xs text-slate-500">{dropoff.scheduled_time ? new Date(dropoff.scheduled_time).toLocaleString() : 'Time TBD'}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Assignments */}
                    <div className="p-6">
                      <h4 className="text-sm font-semibold text-slate-900 mb-4">Assignments</h4>
                      {assignments.length > 0 ? (
                        <div className="space-y-3">
                          {assignments.map((assignment, index) => (
                            <div key={index} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Vehicle</p>
                                  <p className="text-sm font-medium text-slate-900">{assignment.vehicle?.name || assignment.vehicle?.registration_number || 'Unassigned'}</p>
                                </div>
                                <div>
                                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Driver(s)</p>
                                  <div className="space-y-1">
                                    {assignment.drivers?.filter(d => d.name).map((driver, dIndex) => (
                                      <p key={dIndex} className="text-sm font-medium text-slate-900">{driver.name}</p>
                                    )) || <p className="text-sm text-slate-500">Unassigned</p>}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
                          <p className="text-sm text-slate-500">No assignments yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
