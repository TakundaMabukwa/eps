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
import { X, FileText, CheckCircle, AlertTriangle, Clock, TrendingUp, Plus, Route } from 'lucide-react'
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

  // Fetch loads and reference data
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
      setVehicleTrackingData(trackingData || [])
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
      const matchingVehicle = vehicleTrackingData.find(vehicle => 
        vehicle.driver_name && 
        (vehicle.driver_name.toLowerCase().includes(driver.name.toLowerCase()) ||
         driver.name.toLowerCase().includes(vehicle.driver_name.toLowerCase()))
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



  // Auto-optimize route when locations change
  useEffect(() => {
    const optimizeRoute = async () => {
      if (!loadingLocation || !dropOffPoint) {
        setOptimizedRoute(null)
        return
      }
      
      setIsOptimizing(true)
      try {
        const response = await fetch('/api/routes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            origin: loadingLocation,
            destination: dropOffPoint,
            orderId: orderNumber,
            pickupTime: etaPickup
          })
        })
        
        if (response.ok) {
          const routeData = await response.json()
          setOptimizedRoute(routeData)
        }
      } catch (error) {
        console.error('Route optimization failed:', error)
      }
      setIsOptimizing(false)
    }
    
    optimizeRoute()
  }, [loadingLocation, dropOffPoint, orderNumber, etaPickup])

  // Update sorted drivers when pickup location changes
  useEffect(() => {
    if (loadingLocation) {
      getSortedDriversByDistance(loadingLocation).then(setSortedDrivers)
    } else {
      setSortedDrivers(drivers)
    }
  }, [loadingLocation, getSortedDriversByDistance, drivers])

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
        }]
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
      setShowSecondSection(false)
      
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
                    <Label htmlFor="rate">Rate</Label>
                    <Input value={rate} onChange={(e) => setRate(e.target.value)} placeholder="Rate" />
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

                {/* Route Preview */}
                {loadingLocation && dropOffPoint && (
                  <div className="col-span-full">
                    <div className="space-y-4">
                      {isOptimizing && (
                        <div className="flex items-center gap-2 text-sm text-blue-600">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          Optimizing route...
                        </div>
                      )}
                      <RoutePreviewMap
                        origin={loadingLocation}
                        destination={dropOffPoint}
                        routeData={optimizedRoute}
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
            <div className="grid grid-cols-1 gap-6">
              {loads.filter(trip => trip.status?.toLowerCase() !== 'delivered').map((trip) => {
                const assignments = parseJsonField(trip.vehicleassignments) || []
                const pickupLocations = parseJsonField(trip.pickuplocations) || []
                const dropoffLocations = parseJsonField(trip.dropofflocations) || []
                
                return (
                  <Card key={trip.id}>
                    <CardHeader>
                      <CardTitle className="flex justify-between items-center">
                        <span>Trip: {trip.trip_id}</span>
                        <span className={cn(
                          "px-3 py-1 rounded-full text-xs font-medium",
                          trip.status === "completed" ? "bg-green-100 text-green-800" :
                          trip.status === "in-transit" ? "bg-blue-100 text-blue-800" :
                          trip.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                          "bg-red-100 text-red-800"
                        )}>
                          {trip.status || 'pending'}
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Trip Details */}
                        <div className="space-y-4">
                          <h4 className="font-medium text-sm text-gray-700">Trip Details</h4>
                          <div className="space-y-2 text-sm">
                            <p><span className="font-medium">Client:</span> {trip.clientdetails?.name || 'N/A'}</p>
                            <p><span className="font-medium">Commodity:</span> {trip.cargo || 'N/A'}</p>
                            <p><span className="font-medium">Rate:</span> {trip.rate || 'N/A'}</p>
                            <p><span className="font-medium">Order #:</span> {trip.ordernumber || 'N/A'}</p>
                          </div>
                        </div>

                        {/* Route Progress */}
                        <div className="space-y-4">
                          <h4 className="font-medium text-sm text-gray-700">Route Progress</h4>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <ProgressWithWaypoints
                              value={trip.status === 'completed' ? 100 : trip.status === 'in-transit' ? 50 : 25}
                              variant="stepped"
                              waypoints={[
                                {
                                  position: 0,
                                  label: 'Created',
                                  completed: true
                                },
                                {
                                  position: 25,
                                  label: 'Assigned',
                                  completed: assignments.length > 0
                                },
                                {
                                  position: 50,
                                  label: 'In Transit',
                                  completed: trip.status === 'in-transit' || trip.status === 'completed',
                                  current: trip.status === 'in-transit'
                                },
                                {
                                  position: 100,
                                  label: 'Completed',
                                  completed: trip.status === 'completed',
                                  current: trip.status === 'completed'
                                }
                              ]}
                            />
                          </div>
                          
                          {/* Route Details */}
                          <div className="space-y-3">
                            {pickupLocations.map((pickup, index) => (
                              <div key={index} className="p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Pickup</span>
                                </div>
                                <p className="text-sm font-medium">{pickup.location || pickup.address}</p>
                                <p className="text-xs text-gray-600">{pickup.scheduled_time ? new Date(pickup.scheduled_time).toLocaleString() : 'No time set'}</p>
                              </div>
                            ))}
                            {dropoffLocations.map((dropoff, index) => (
                              <div key={index} className="p-3 bg-red-50 rounded-lg border-l-4 border-red-400">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Drop-off</span>
                                </div>
                                <p className="text-sm font-medium">{dropoff.location || dropoff.address}</p>
                                <p className="text-xs text-gray-600">{dropoff.scheduled_time ? new Date(dropoff.scheduled_time).toLocaleString() : 'No time set'}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Route Tracking */}
                        <div className="space-y-4">
                          <h4 className="font-medium text-sm text-gray-700">Route Tracking</h4>
                          <RouteTracker orderId={trip.ordernumber || trip.trip_id} />
                        </div>

                        {/* Vehicle Assignments */}
                        <div className="space-y-4">
                          <h4 className="font-medium text-sm text-gray-700">Assignments</h4>
                          <div className="space-y-3">
                            {assignments.length > 0 ? assignments.map((assignment, index) => (
                              <div key={index} className="p-3 bg-blue-50 rounded-lg">
                                <div className="space-y-2">
                                  <div>
                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Vehicle</span>
                                    <p className="text-sm font-medium mt-1">{assignment.vehicle?.name || assignment.vehicle?.registration_number || 'Unknown Vehicle'}</p>
                                  </div>
                                  <div>
                                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">Drivers</span>
                                    <div className="mt-1">
                                      {assignment.drivers?.filter(d => d.name).map((driver, dIndex) => (
                                        <p key={dIndex} className="text-sm">{driver.name}</p>
                                      )) || <p className="text-sm text-gray-500">No drivers assigned</p>}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )) : (
                              <div className="p-3 bg-gray-50 rounded-lg text-center">
                                <p className="text-sm text-gray-500">No assignments</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
