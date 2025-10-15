'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Save, Plus, Minus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'

const LoadForm = ({ onClose, id }) => {
  const supabase = createClient()
  
  const [drivers, setDrivers] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(false)
  
  const [formState, setFormState] = useState({
    client: '',
    commodity: '',
    rate: '',
    orderNumber: '',
    comment: '',
    etaPickup: '',
    loadingLocation: '',
    etaDropoff: '',
    dropOffPoint: '',
    status: 'pending',
    vehicleAssignments: [{
      vehicle: { id: '', name: '' },
      drivers: [{ id: '', name: '' }]
    }]
  })

  // Fetch reference data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          { data: driversData },
          { data: vehiclesData },
          { data: clientsData }
        ] = await Promise.all([
          supabase.from('drivers').select('*'),
          supabase.from('vehicles').select('*'),
          supabase.from('clients').select('*')
        ])
        setDrivers(driversData || [])
        setVehicles(vehiclesData || [])
        setClients(clientsData || [])
      } catch (err) {
        console.error('Error fetching data:', err)
      }
    }
    fetchData()
  }, [])

  // Fetch trip if editing
  useEffect(() => {
    if (id) {
      const fetchTrip = async () => {
        const { data, error } = await supabase.from('trips').select('*').eq('id', id).single()
        if (!error && data) {
          // Convert trip data back to load format
          const loadData = {
            ...data,
            client: data.clientDetails?.name || data.client_details?.name || '',
            commodity: data.cargo || '',
            rate: data.rate || '',
            orderNumber: data.orderNumber || '',
            comment: data.notes || '',
            etaPickup: data.pickupLocations?.[0]?.scheduledTime || data.pickup_locations?.[0]?.scheduled_time || '',
            loadingLocation: data.origin || data.pickupLocations?.[0]?.location || data.pickup_locations?.[0]?.location || '',
            etaDropoff: data.dropoffLocations?.[0]?.scheduledTime || data.dropoff_locations?.[0]?.scheduled_time || '',
            dropOffPoint: data.destination || data.dropoffLocations?.[0]?.location || data.dropoff_locations?.[0]?.location || '',
            vehicleAssignments: data.vehicleAssignments || data.vehicle_assignments || [{
              vehicle: { id: '', name: '' },
              drivers: [{ id: '', name: '' }]
            }]
          }
          setFormState(loadData)
        }
      }
      fetchTrip()
    }
  }, [id])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormState(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (field, value) => {
    setFormState(prev => ({ ...prev, [field]: value }))
  }

  // Vehicle Assignment Handlers
  const handleVehicleChange = (vehicleIndex, vehicleId) => {
    const selectedVehicle = vehicles.find(v => v.id === vehicleId)
    const vehicleName = selectedVehicle ? `${selectedVehicle.make} ${selectedVehicle.model} (${selectedVehicle.regNumber})` : ''

    setFormState(prev => {
      const updatedAssignments = [...prev.vehicleAssignments]
      updatedAssignments[vehicleIndex] = {
        ...updatedAssignments[vehicleIndex],
        vehicle: { id: vehicleId, name: vehicleName }
      }
      return { ...prev, vehicleAssignments: updatedAssignments }
    })
  }

  const addVehicle = () => {
    setFormState(prev => ({
      ...prev,
      vehicleAssignments: [
        ...prev.vehicleAssignments,
        { vehicle: { id: '', name: '' }, drivers: [{ id: '', name: '' }] }
      ]
    }))
  }

  const removeVehicle = (vehicleIndex) => {
    setFormState(prev => {
      const updatedAssignments = [...prev.vehicleAssignments]
      updatedAssignments.splice(vehicleIndex, 1)
      return {
        ...prev,
        vehicleAssignments: updatedAssignments.length > 0 ? updatedAssignments : [{ vehicle: { id: '', name: '' }, drivers: [{ id: '', name: '' }] }]
      }
    })
  }

  // Driver Handlers
  const handleVehicleDriverChange = (vehicleIndex, driverIndex, driverId) => {
    const selectedDriver = drivers.find(d => d.id === driverId)
    const driverName = selectedDriver ? `${selectedDriver.first_name} ${selectedDriver.surname}` : ''

    setFormState(prev => {
      const updatedAssignments = [...prev.vehicleAssignments]
      const updatedDrivers = [...updatedAssignments[vehicleIndex].drivers]
      updatedDrivers[driverIndex] = { id: driverId, name: driverName }
      updatedAssignments[vehicleIndex] = {
        ...updatedAssignments[vehicleIndex],
        drivers: updatedDrivers
      }
      return { ...prev, vehicleAssignments: updatedAssignments }
    })
  }

  const addVehicleDriver = (vehicleIndex) => {
    setFormState(prev => {
      const updatedAssignments = [...prev.vehicleAssignments]
      updatedAssignments[vehicleIndex] = {
        ...updatedAssignments[vehicleIndex],
        drivers: [...updatedAssignments[vehicleIndex].drivers, { id: '', name: '' }]
      }
      return { ...prev, vehicleAssignments: updatedAssignments }
    })
  }

  const removeVehicleDriver = (vehicleIndex, driverIndex) => {
    setFormState(prev => {
      const updatedAssignments = [...prev.vehicleAssignments]
      const updatedDrivers = [...updatedAssignments[vehicleIndex].drivers]
      updatedDrivers.splice(driverIndex, 1)
      updatedAssignments[vehicleIndex] = {
        ...updatedAssignments[vehicleIndex],
        drivers: updatedDrivers.length > 0 ? updatedDrivers : [{ id: '', name: '' }]
      }
      return { ...prev, vehicleAssignments: updatedAssignments }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const loadData = {
        ...formState,
        vehicle_assignments: formState.vehicleAssignments
      }
      
      if (!loadData.id || isNaN(Number(loadData.id))) {
        delete loadData.id
      }

      // Convert load data to trip format
      const tripData = {
        ...loadData,
        trip_id: `LOAD-${Date.now()}`,
        orderNumber: loadData.orderNumber,
        cargo: loadData.commodity,
        origin: loadData.loadingLocation,
        destination: loadData.dropOffPoint,
        startDate: loadData.etaPickup ? loadData.etaPickup.split('T')[0] : new Date().toISOString().split('T')[0],
        endDate: loadData.etaDropoff ? loadData.etaDropoff.split('T')[0] : new Date().toISOString().split('T')[0],
        notes: loadData.comment,
        clientDetails: {
          name: loadData.client,
          email: '',
          phone: '',
          address: '',
          contactPerson: ''
        },
        pickupLocations: [{
          location: loadData.loadingLocation || '',
          address: loadData.loadingLocation || '',
          scheduledTime: loadData.etaPickup || ''
        }],
        dropoffLocations: [{
          location: loadData.dropOffPoint || '',
          address: loadData.dropOffPoint || '',
          scheduledTime: loadData.etaDropoff || ''
        }],
        // Dual format for compatibility
        vehicle_assignments: loadData.vehicleAssignments,
        client_details: {
          name: loadData.client,
          email: '',
          phone: '',
          address: '',
          contactPerson: ''
        },
        pickup_locations: [{
          location: loadData.loadingLocation || '',
          address: loadData.loadingLocation || '',
          scheduled_time: loadData.etaPickup || ''
        }],
        dropoff_locations: [{
          location: loadData.dropOffPoint || '',
          address: loadData.dropOffPoint || '',
          scheduled_time: loadData.etaDropoff || ''
        }]
      }
      
      const { error } = await supabase.from('trips').upsert([tripData])
      if (error) throw error
      
      onClose()
    } catch (err) {
      console.error('Error saving load:', err)
      alert('Failed to save load. Please try again.')
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6 p-4 w-full">
      <div>
        <h2 className="text-2xl font-bold">{id ? 'Edit Load' : 'Create New Load'}</h2>
        <p className="text-gray-600">Enter load details and assign vehicles/drivers</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Load Information */}
        <Card>
          <CardHeader>
            <CardTitle>Load Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="client">Client</Label>
              <Select value={formState.client} onValueChange={(value) => handleSelectChange('client', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map(client => (
                    <SelectItem key={client.id} value={client.name}>{client.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="commodity">Commodity</Label>
              <Input name="commodity" value={formState.commodity} onChange={handleChange} placeholder="Commodity" />
            </div>

            <div>
              <Label htmlFor="rate">Rate</Label>
              <Input name="rate" value={formState.rate} onChange={handleChange} placeholder="Rate" />
            </div>

            <div>
              <Label htmlFor="orderNumber">Order Number</Label>
              <Input name="orderNumber" value={formState.orderNumber} onChange={handleChange} placeholder="Order Number" />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="comment">Comment</Label>
              <Textarea name="comment" value={formState.comment} onChange={handleChange} placeholder="Comment" />
            </div>
          </CardContent>
        </Card>

        {/* Location & Timing */}
        <Card>
          <CardHeader>
            <CardTitle>Location & Timing</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="etaPickup">ETA Pick Up</Label>
              <Input type="datetime-local" name="etaPickup" value={formState.etaPickup} onChange={handleChange} />
            </div>

            <div>
              <Label htmlFor="loadingLocation">Loading Location</Label>
              <Input name="loadingLocation" value={formState.loadingLocation} onChange={handleChange} placeholder="Loading Location" />
            </div>

            <div>
              <Label htmlFor="etaDropoff">ETA Drop Off</Label>
              <Input type="datetime-local" name="etaDropoff" value={formState.etaDropoff} onChange={handleChange} />
            </div>

            <div>
              <Label htmlFor="dropOffPoint">Drop Off Point</Label>
              <Input name="dropOffPoint" value={formState.dropOffPoint} onChange={handleChange} placeholder="Drop Off Point" />
            </div>
          </CardContent>
        </Card>

        {/* Vehicle Assignments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              Vehicle Assignments
              <Button type="button" onClick={addVehicle} size="sm">
                <Plus className="h-4 w-4 mr-1" /> Add Vehicle
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {formState.vehicleAssignments.map((assignment, vehicleIndex) => (
              <Card key={vehicleIndex} className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium">Vehicle {vehicleIndex + 1}</h4>
                  {formState.vehicleAssignments.length > 1 && (
                    <Button type="button" onClick={() => removeVehicle(vehicleIndex)} size="sm" variant="destructive">
                      <Minus className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label>Select Vehicle</Label>
                    <Select value={assignment.vehicle.id} onValueChange={(value) => handleVehicleChange(vehicleIndex, value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select vehicle" />
                      </SelectTrigger>
                      <SelectContent>
                        {vehicles.map(vehicle => (
                          <SelectItem key={vehicle.id} value={vehicle.id}>
                            {vehicle.make} {vehicle.model} ({vehicle.regNumber})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <Label>Drivers</Label>
                      <Button type="button" onClick={() => addVehicleDriver(vehicleIndex)} size="sm" variant="outline">
                        <Plus className="h-4 w-4 mr-1" /> Add Driver
                      </Button>
                    </div>
                    
                    {assignment.drivers.map((driver, driverIndex) => (
                      <div key={driverIndex} className="flex gap-2 mb-2">
                        <Select value={driver.id} onValueChange={(value) => handleVehicleDriverChange(vehicleIndex, driverIndex, value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select driver" />
                          </SelectTrigger>
                          <SelectContent>
                            {drivers.map(d => (
                              <SelectItem key={d.id} value={d.id}>
                                {d.first_name} {d.surname}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {assignment.drivers.length > 1 && (
                          <Button type="button" onClick={() => removeVehicleDriver(vehicleIndex, driverIndex)} size="sm" variant="destructive">
                            <Minus className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-between gap-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent"></span>
                Saving Load...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" /> Save Load
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default LoadForm