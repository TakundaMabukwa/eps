'use client'

import { useState, useEffect } from 'react'
import { FuelGauge } from '@/components/ui/fuel-gauge'
import { Button } from '@/components/ui/button'
import { RefreshCw, Fuel } from 'lucide-react'
import { formatForDisplay } from '@/lib/utils/date-formatter'

interface FuelData {
  plate: string
  driver_name: string
  fuel_level: number | null
  fuel_volume: number | null
  fuel_temperature: number | null
  fuel_percentage: number | null
  name_event: string
  speed: number
  last_activity_time: string | null
}

export default function FuelCanBusDisplay() {
  const [vehicles, setVehicles] = useState<FuelData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchVehicles = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/eps-vehicles')
      if (!response.ok) throw new Error('Failed to fetch vehicles')
      const data = await response.json()
      setVehicles(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVehicles()
  }, [])

  // Convert EPS vehicle data to fuel gauge format
  const getFuelGaugeData = () => {
    return vehicles.map((vehicle, index) => {
      const fuelPercentage = vehicle.fuel_percentage ? parseFloat(vehicle.fuel_percentage.toString()) : 0
      const fuelVolume = vehicle.fuel_volume ? parseFloat(vehicle.fuel_volume.toString()) : 0
      const fuelTemp = vehicle.fuel_temperature ? parseFloat(vehicle.fuel_temperature.toString()) : 25
      const remaining = fuelVolume
      const capacity = fuelPercentage > 0 ? (fuelVolume / fuelPercentage) * 100 : 100
      const isEngineOn = vehicle.name_event === 'Engine On'

      return {
        id: vehicle.plate || `vehicle-${index + 1}`,
        location: vehicle.plate || 'Unknown Plate',
        fuelLevel: Math.max(0, Math.min(100, fuelPercentage)),
        temperature: Math.max(0, fuelTemp),
        volume: Math.max(0, capacity),
        remaining: `${capacity.toFixed(1)}L / ${remaining.toFixed(1)}L`,
        status: isEngineOn ? (vehicle.speed > 5 ? 'Active' : 'Idle') : 'Engine Off',
        lastUpdated: formatForDisplay(vehicle.last_activity_time || new Date().toISOString()),
        updated_at: vehicle.last_activity_time
      }
    })
  }



  if (loading) {
    return (
      <div className="flex justify-center items-center bg-gray-50 h-full">
        <div className="text-center">
          <div className="mx-auto mb-4 border-b-2 border-blue-600 rounded-full w-12 h-12 animate-spin"></div>
          <p className="text-gray-600">Loading fuel data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center bg-gray-50 h-full">
        <div className="text-center">
          <div className="mx-auto mb-4 text-red-500 text-6xl">⚠️</div>
          <p className="mb-4 text-red-600">Error loading fuel data</p>
          <p className="mb-4 text-gray-600">{error}</p>
          <Button onClick={fetchVehicles} variant="outline">
            <RefreshCw className="mr-2 w-4 h-4" />
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 h-full">
      <div className="p-4">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Fuel CAN Bus Monitor</h2>
          <Button onClick={fetchVehicles} variant="outline" size="sm">
            <RefreshCw className="mr-2 w-4 h-4" />
            Refresh
          </Button>
        </div>
        
        {vehicles.length > 0 ? (
          <div className="gap-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6 xl:grid-cols-5">
            {getFuelGaugeData().map((data) => (
              <FuelGauge
                key={data.id}
                id={data.id}
                location={data.location}
                fuelLevel={data.fuelLevel}
                temperature={data.temperature}
                volume={data.volume}
                remaining={data.remaining}
                status={data.status}
                lastUpdated={data.lastUpdated}
                updated_at={data.updated_at}

                className="hover:scale-105 transition-transform duration-200 transform"
              />
            ))}
          </div>
        ) : (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <Fuel className="mx-auto mb-4 w-16 h-16 text-gray-400" />
              <p className="text-gray-500 text-lg">No fuel data available</p>
              <p className="text-gray-400 text-sm">Check your connection to the EPS server</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}