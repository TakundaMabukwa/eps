"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Truck,
  Phone,
  DollarSign,
  User,
  AlertTriangle,
  Clock,
  CheckCircle,
  TrendingUp,
  Users,
  MapPin,
  FileText,
  ChartBar,
  Briefcase,
  Car,
  Building2,
  Building,
  Settings,
  PlusSquare,
  Wrench,
  User2,
} from "lucide-react";
import { getDashboardStats } from "@/lib/stats/dashboard";
import { createClient } from "@/lib/supabase/client";
import JobAssignmentsDashboard from "@/components/jobs/jobsStat";
import RecentActivityList from "@/components/dashboard/recentActivities";
import FinancialsPanel from "@/components/financials/FinancialsPanel";
import { SlidingNumber } from "@/components/ui/sliding-number";
import CardDemo from "@/components/userAvatar";
import Link from "next/link";
import DetailCard from "@/components/ui/detail-card";
import { onCreate } from "@/hooks/use-auth";
import { useGlobalContext } from "@/context/global-context/context";
import { ProgressWithWaypoints } from '@/components/ui/progress-with-waypoints'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { FuelGaugesView } from "@/components/fuelGauge/FuelGaugesView";
import FuelCanBusDisplay from "@/components/FuelCanBusDisplay";
import DriverPerformanceDashboard from "@/components/dashboard/DriverPerformanceDashboard";
import TestRouteMap from "@/components/map/test-route-map";
import { DateTimePicker } from "@/components/ui/datetime-picker";


// Driver Card Component with fetched driver info
function DriverCard({ trip, userRole, handleViewMap, setCurrentTripForNote, setNoteText, setNoteOpen, setAvailableDrivers, setCurrentTripForChange, setChangeDriverOpen }: any) {
  const [driverInfo, setDriverInfo] = useState<any>(null)
  const [vehicleInfo, setVehicleInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [vehicleLocation, setVehicleLocation] = useState<any>(null)

  useEffect(() => {
    async function fetchAssignmentInfo() {
      const assignments = trip.vehicleassignments || trip.vehicle_assignments || []
      if (!assignments.length) return

      setLoading(true)
      try {
        const supabase = createClient()
        const assignment = assignments[0]
        
        // Fetch driver info by ID
        if (assignment.drivers?.[0]?.id) {
          const { data: driver } = await supabase
            .from('drivers')
            .select('*')
            .eq('id', assignment.drivers[0].id)
            .single()
          setDriverInfo(driver)
          
          // Fetch vehicle location from EPS API
          if (driver) {
            try {
              const response = await fetch('http://64.227.138.235:3000/api/eps-vehicles')
              const result = await response.json()
              const vehicles = result.data || []
              
              const vehicle = vehicles.find((v: any) => {
                const vehicleDriverName = v.driver_name?.toLowerCase() || ''
                const searchName = `${driver.first_name} ${driver.surname}`.toLowerCase()
                return vehicleDriverName.includes(searchName) || searchName.includes(vehicleDriverName)
              })
              
              if (vehicle) {
                setVehicleLocation(vehicle)
              }
            } catch (error) {
              console.error('Error fetching vehicle location:', error)
            }
          }
        }
        
        // Fetch vehicle info by ID
        if (assignment.vehicle?.id) {
          const { data: vehicle } = await supabase
            .from('vehiclesc')
            .select('*')
            .eq('id', assignment.vehicle.id)
            .single()
          setVehicleInfo(vehicle)
        }
      } catch (err) {
        console.error('Error fetching assignment info:', err)
      }
      setLoading(false)
    }

    fetchAssignmentInfo()
  }, [trip.vehicleassignments, trip.vehicle_assignments])

  const driverName = driverInfo ? `${driverInfo.first_name} ${driverInfo.surname}`.trim() : 'Unassigned'
  const initials = driverName !== 'Unassigned' ? driverName.split(' ').map((s: string) => s[0]).slice(0,2).join('') : 'DR'

  if (loading) {
    return (
      <div className="w-[30%] bg-white rounded-lg border border-slate-200 shadow-sm p-3 animate-pulse">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-slate-200"></div>
          <div className="flex-1">
            <div className="h-3 bg-slate-200 rounded w-3/4 mb-1"></div>
            <div className="h-2 bg-slate-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-[30%] bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 p-3">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-medium text-slate-700">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-xs font-semibold text-slate-900 truncate">{driverInfo?.surname || 'Unassigned'}</div>
          <div className="text-xs text-slate-500">{driverInfo ? driverInfo.phone_number : 'No driver assigned'}</div>
        </div>
      </div>
      
      <div className="mb-2 p-2 bg-slate-50 rounded border-l-2 border-slate-400">
        <div className="flex items-center gap-1 mb-1">
          <div className="w-1.5 h-1.5 bg-slate-500 rounded-full"></div>
          <span className="text-xs font-medium text-slate-600 uppercase">Note</span>
        </div>
        <div className="text-xs text-slate-900">{trip.status_notes || 'No notes added'}</div>
      </div>
      
      <div className="mb-2 bg-slate-50 rounded p-2">
        <div className="flex items-center gap-1 mb-1">
          <div className="w-1.5 h-1.5 bg-slate-500 rounded-full"></div>
          <span className="text-xs font-medium text-slate-600 uppercase">Vehicle</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-900 truncate">
            {vehicleLocation?.plate || vehicleInfo?.registration_number || 'Not assigned'}
          </span>
          <span className={cn(
            "px-2 py-1 rounded-full text-xs font-semibold uppercase tracking-wide",
            driverInfo?.available ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
          )}>
            {driverInfo?.available ? 'Available' : 'Unavailable'}
          </span>
        </div>
        {vehicleLocation && (
          <div className="mt-1 text-xs text-slate-500">
            Speed: {vehicleLocation.speed} km/h | {vehicleLocation.address}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-1">
        <Button 
          size="sm" 
          variant="outline" 
          className="h-7 text-xs border-slate-200 hover:border-slate-300 hover:bg-slate-50"
          onClick={async () => {
            const supabase = createClient();
            let routeCoords = null;
            let stopPoints = [];
            
            if (trip.route) {
              const { data: route, error } = await supabase
                .from('routes')
                .select('route_geometry, route_data')
                .eq('id', trip.route)
                .single();
              
              if (route) {
                if (route?.route_geometry?.coordinates) {
                  routeCoords = route.route_geometry.coordinates;
                } else if (route?.route_data?.geometry?.coordinates) {
                  routeCoords = route.route_data.geometry.coordinates;
                }
              }
            }
            
            // Get selected stop points
            const selectedStopPoints = trip.selected_stop_points || trip.selectedstoppoints || [];
            if (selectedStopPoints.length > 0) {
              const { data: stopPointsData } = await supabase
                .from('stop_points')
                .select('id, name, coordinates')
                .in('id', selectedStopPoints);
              
              stopPoints = (stopPointsData || []).map(point => {
                if (point.coordinates) {
                  const coordPairs = point.coordinates.split(' ')
                    .filter(coord => coord.trim())
                    .map(coord => {
                      const [lng, lat] = coord.split(',');
                      return [parseFloat(lng), parseFloat(lat)];
                    })
                    .filter(pair => !isNaN(pair[0]) && !isNaN(pair[1]));
                  
                  if (coordPairs.length > 0) {
                    const avgLng = coordPairs.reduce((sum, coord) => sum + coord[0], 0) / coordPairs.length;
                    const avgLat = coordPairs.reduce((sum, coord) => sum + coord[1], 0) / coordPairs.length;
                    return { 
                      name: point.name, 
                      coordinates: [avgLng, avgLat],
                      polygon: coordPairs
                    };
                  }
                }
                return null;
              }).filter(Boolean);
            }
            
            handleViewMap(driverName, { ...trip, vehicleLocation, routeCoords, stopPoints });
          }}
        >
          <MapPin className="w-3 h-3" />Track
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          className="h-7 text-xs border-slate-200 hover:border-slate-300 hover:bg-slate-50"
          disabled={userRole === "fleet manager"}
          onClick={() => {
            if (userRole === "fleet manager") return;
            setCurrentTripForNote(trip);
            setNoteText(trip.status_notes || '');
            setNoteOpen(true);
          }}
        >
          <FileText className="w-3 h-3" />Note
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          className="h-7 text-xs border-slate-200 hover:border-slate-300 hover:bg-slate-50"
          disabled={userRole === "fleet manager"}
          onClick={async () => {
            if (userRole === "fleet manager") return;
            const supabase = createClient();
            const { data: drivers } = await supabase.from('drivers').select('*');
            setAvailableDrivers(drivers || []);
            setCurrentTripForChange(trip);
            setChangeDriverOpen(true);
          }}
        >
          <User className="w-3 h-3" />Change
        </Button>
        <Button 
          size="sm" 
          variant="destructive" 
          className="h-7 text-xs"
          disabled={userRole === "fleet manager"}
          onClick={async () => {
            if (userRole === "fleet manager") return;
            if (!confirm('Are you sure you want to delete this trip?')) return;
            try {
              const supabase = createClient();
              const { error } = await supabase.from('trips').delete().eq('id', trip.id);
              if (error) throw error;
              alert('Trip deleted successfully');
            } catch (err) {
              console.error('Failed to delete trip:', err);
              alert('Failed to delete trip');
            }
          }}
        >
          <X className="w-3 h-3" />Cancel
        </Button>
      </div>
    </div>
  )
}

// Enhanced routing components with proper waypoints
function RoutingSection({ userRole, handleViewMap, setCurrentTripForNote, setNoteText, setNoteOpen, setAvailableDrivers, setCurrentTripForChange, setChangeDriverOpen, refreshTrigger, setRefreshTrigger, setPickupTimeOpen, setDropoffTimeOpen, setCurrentTripForTime, setTimeType, setSelectedTime }: any) {
  const [trips, setTrips] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTrips() {
      try {
        const supabase = createClient()
        const { data, error } = await supabase.from('trips').select('*')
        if (error) throw error
        setTrips(data || [])
      } catch (err) {
        console.error('Error fetching trips:', err)
        setTrips([])
      } finally {
        setLoading(false)
      }
    }
    
    fetchTrips()
    
    // Real-time subscription
    const supabase = createClient()
    const channel = supabase
      .channel('trips-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'trips' },
        () => fetchTrips()
      )
      .subscribe()
    
    return () => {
      supabase.removeChannel(channel)
    }
  }, [refreshTrigger])

  const tripsList = trips.filter(trip => trip.status?.toLowerCase() !== 'delivered')

  const TRIP_STATUSES = [
    'Pending',
    'Accept',
    'Arrived at Loading',
    'Staging Area', 
    'Loading',
    'On Trip',
    'Offloading',
    'Weighing In/Out',
    'Delivered'
  ]

  const getWaypointsWithStops = (trip: any) => {
    const currentStatusIndex = TRIP_STATUSES.findIndex(s => s.toLowerCase() === trip.status?.toLowerCase())
    const baseWaypoints = TRIP_STATUSES.map((status, index) => ({
      position: (index / (TRIP_STATUSES.length - 1)) * 100,
      label: status,
      completed: currentStatusIndex > index,
      current: currentStatusIndex === index,
      isStop: false
    }))

    // Insert stops between Loading (index 4) and On Trip (index 5)
    const stops = trip.selected_stop_points || trip.selectedstoppoints || []
    if (stops.length > 0) {
      const loadingPos = baseWaypoints[4].position
      const onTripPos = baseWaypoints[5].position
      const stopSpacing = (onTripPos - loadingPos) / (stops.length + 1)
      
      const stopWaypoints = stops.map((stopId: any, index: number) => ({
        position: loadingPos + (stopSpacing * (index + 1)),
        label: `Stop ${index + 1}`,
        completed: currentStatusIndex > 4,
        current: false,
        isStop: true,
        stopId
      }))
      
      // Adjust positions of waypoints after Loading
      const adjustedWaypoints = [...baseWaypoints]
      for (let i = 5; i < adjustedWaypoints.length; i++) {
        adjustedWaypoints[i].position = onTripPos + ((i - 5) / (TRIP_STATUSES.length - 6)) * (100 - onTripPos)
      }
      
      return [...adjustedWaypoints.slice(0, 5), ...stopWaypoints, ...adjustedWaypoints.slice(5)]
    }
    
    return baseWaypoints
  }



  const getTripProgress = (status: string) => {
    const statusIndex = TRIP_STATUSES.findIndex(s => s.toLowerCase() === status?.toLowerCase())
    if (statusIndex === -1) return 0
    return ((statusIndex + 1) / TRIP_STATUSES.length) * 100
  }

  if (loading) {
    return <div className="text-center py-8">Loading trips...</div>
  }

  if (tripsList.length === 0) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8 text-muted-foreground">
          No trips available in database
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {tripsList.map((trip: any) => {
        const waypoints = getWaypointsWithStops(trip)
        const progress = getTripProgress(trip.status)

        const clientDetails = typeof trip.clientdetails === 'string' ? JSON.parse(trip.clientdetails) : trip.clientdetails
        const title = clientDetails?.name || trip.selectedClient || trip.clientDetails?.name || `Trip ${trip.trip_id || trip.id}`
        const isOffCourse = false // Simplified for demo

        return (
          <div key={trip.id || trip.trip_id} className="flex gap-4">
            {/* Driver Card - 30% */}
            <DriverCard 
              trip={trip} 
              userRole={userRole}
              handleViewMap={handleViewMap}
              setCurrentTripForNote={setCurrentTripForNote}
              setNoteText={setNoteText}
              setNoteOpen={setNoteOpen}
              setAvailableDrivers={setAvailableDrivers}
              setCurrentTripForChange={setCurrentTripForChange}
              setChangeDriverOpen={setChangeDriverOpen}
            />

            {/* Trip Card - 70% */}
            <div className="w-[70%] bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
              {/* Alert Banner */}
              {isOffCourse && (
                <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-2 rounded-t-lg">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-3 h-3 animate-pulse" />
                    <span className="text-xs font-medium">Trip Off-Course - Immediate Attention Required</span>
                  </div>
                </div>
              )}

              <div className="p-3">
                {/* Header Section */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                        <Truck className="w-4 h-4 text-slate-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 text-sm truncate">{title}</h3>
                        <p className="text-xs text-slate-500">Trip #{trip.trip_id || trip.id}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs font-semibold uppercase tracking-wide",
                      trip.status?.toLowerCase() === 'delivered' ? 'bg-emerald-100 text-emerald-700' :
                      trip.status?.toLowerCase() === 'on trip' ? 'bg-blue-100 text-blue-700' :
                      ['pending', 'accept'].includes(trip.status?.toLowerCase()) ? 'bg-amber-100 text-amber-700' :
                      ['reject', 'cancelled', 'stopped'].includes(trip.status?.toLowerCase()) ? 'bg-red-100 text-red-700' :
                      'bg-slate-100 text-slate-700'
                    )}>
                      {trip.status?.replace('-', ' ') || 'Unknown'}
                    </span>
                  </div>
                </div>

                {/* Route Information */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="bg-slate-50 rounded p-2">
                    <div className="flex items-center gap-1 mb-1">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                      <span className="text-xs font-medium text-slate-600 uppercase">Pickup</span>
                    </div>
                    <p className="text-xs font-medium text-slate-900 truncate">{trip.origin || 'Not specified'}</p>
                  </div>
                  <div className="bg-slate-50 rounded p-2">
                    <div className="flex items-center gap-1 mb-1">
                      <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                      <span className="text-xs font-medium text-slate-600 uppercase">Drop-off</span>
                    </div>
                    <p className="text-xs font-medium text-slate-900 truncate">{trip.destination || 'Not specified'}</p>
                  </div>
                </div>

                {/* Enhanced Timeline */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-semibold text-slate-700">Trip Progress</h4>
                    <span className="text-xs text-slate-500">{Math.round(progress)}% Complete</span>
                  </div>
                  <div className="relative">
                    <div className="flex justify-between items-center">
                      {waypoints.map((waypoint, index) => (
                        <div key={index} className="flex flex-col items-center relative z-10 group">
                          <div className={cn(
                            "w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all duration-300",
                            waypoint.isStop ? "bg-orange-500 border-orange-500 text-white" :
                            waypoint.current ? "bg-blue-500 border-blue-500 text-white" :
                            waypoint.completed ? "bg-emerald-500 border-emerald-500 text-white" :
                            "bg-white border-slate-300 text-slate-400"
                          )}>
                            {waypoint.isStop ? (
                              <MapPin className="w-3 h-3" />
                            ) : waypoint.completed ? (
                              <CheckCircle className="w-3 h-3" />
                            ) : waypoint.current ? (
                              <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                            ) : (
                              index + 1
                            )}
                          </div>
                          <span className={cn(
                            "text-xs mt-1 text-center max-w-12 leading-tight",
                            waypoint.isStop ? "text-orange-600 font-medium" :
                            waypoint.current ? "text-blue-600 font-semibold" :
                            waypoint.completed ? "text-emerald-600 font-medium" :
                            "text-slate-400"
                          )}>
                            {waypoint.label.split(' ')[0]}
                          </span>
                          {waypoint.isStop && (
                            <div className="absolute bottom-full mb-1 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                              Stop ID: {waypoint.stopId}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="absolute top-3 left-3 right-3 h-0.5 bg-slate-200 -z-0">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                  

                </div>

                {/* Cargo Information */}
                {trip.cargo && (
                  <div className="bg-slate-50 rounded p-2 mb-3">
                    <div className="flex items-center gap-1 mb-1">
                      <div className="w-1.5 h-1.5 bg-slate-500 rounded-full"></div>
                      <span className="text-xs font-medium text-slate-600 uppercase">Cargo</span>
                    </div>
                    <p className="text-xs font-medium text-slate-900">
                      {trip.cargo}{trip.cargo_weight && ` (${trip.cargo_weight})`}
                    </p>
                  </div>
                )}

                {/* Time Information */}
                {(() => {
                  const pickupTime = trip.pickup_locations?.[0]?.scheduled_time || trip.pickuplocations?.[0]?.scheduled_time;
                  const dropoffTime = trip.dropoff_locations?.[0]?.scheduled_time || trip.dropofflocations?.[0]?.scheduled_time;
                  return (pickupTime || dropoffTime) && (
                    <div className="bg-blue-50 rounded p-1.5 mb-2 border border-blue-200">
                      <div className="flex items-center gap-1 mb-1">
                        <Clock className="w-2.5 h-2.5 text-blue-600" />
                        <span className="text-xs font-medium text-blue-800">Schedule</span>
                      </div>
                      <div className="space-y-1">
                        {pickupTime && (
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1">
                              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                              <span className="font-medium text-slate-700">Pickup</span>
                            </div>
                            <span className="font-semibold text-slate-900">
                              {new Date(pickupTime).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} {new Date(pickupTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        )}
                        {dropoffTime && (
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1">
                              <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                              <span className="font-medium text-slate-700">Drop-off</span>
                            </div>
                            <span className="font-semibold text-slate-900">
                              {new Date(dropoffTime).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} {new Date(dropoffTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-1">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-7 text-xs"
                    onClick={() => {
                      setCurrentTripForTime(trip);
                      setTimeType('pickup');
                      const pickupLocs = trip.pickup_locations || trip.pickuplocations || [];
                      setSelectedTime(pickupLocs[0]?.scheduled_time || '');
                      setPickupTimeOpen(true);
                    }}
                  >
                    <Clock className="w-3 h-3 mr-1" />
                    {(trip.pickup_locations?.[0]?.scheduled_time || trip.pickuplocations?.[0]?.scheduled_time) ? 'Update Pickup' : 'Set Pickup'}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-7 text-xs"
                    onClick={() => {
                      setCurrentTripForTime(trip);
                      setTimeType('dropoff');
                      const dropoffLocs = trip.dropoff_locations || trip.dropofflocations || [];
                      setSelectedTime(dropoffLocs[0]?.scheduled_time || '');
                      setDropoffTimeOpen(true);
                    }}
                  >
                    <Clock className="w-3 h-3 mr-1" />
                    {(trip.dropoff_locations?.[0]?.scheduled_time || trip.dropofflocations?.[0]?.scheduled_time) ? 'Update Drop-off' : 'Set Drop-off'}
                  </Button>
                  <Button 
                    size="sm" 
                    className="bg-emerald-600 hover:bg-emerald-700 text-white h-7 text-xs ml-auto"
                    onClick={async () => {
                      if (!confirm('Mark this trip as completed?')) return;
                      try {
                        const supabase = createClient();
                        const { error } = await supabase.from('trips').update({ status: 'Delivered' }).eq('id', trip.id);
                        if (error) throw error;
                        alert('Trip marked as delivered');
                        setRefreshTrigger(prev => prev + 1);
                      } catch (err) {
                        console.error('Failed to complete trip', err);
                        alert('Failed to complete trip');
                      }
                    }}
                  >
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Complete Trip
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<string>("routing");
  const [auditData, setAuditData] = useState<any[]>([]);
  const [auditLoading, setAuditLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>("");
  const [mapOpen, setMapOpen] = useState(false);
  const [mapData, setMapData] = useState<any>(null);
  const [noteOpen, setNoteOpen] = useState(false);
  const [currentTripForNote, setCurrentTripForNote] = useState<any>(null);
  const [noteText, setNoteText] = useState('');
  const [changeDriverOpen, setChangeDriverOpen] = useState(false);
  const [currentTripForChange, setCurrentTripForChange] = useState<any>(null);
  const [availableDrivers, setAvailableDrivers] = useState<any[]>([]);
  const [allVehicles, setAllVehicles] = useState<any[]>([]);
  const [driverSearchTerm, setDriverSearchTerm] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [pickupTimeOpen, setPickupTimeOpen] = useState(false);
  const [dropoffTimeOpen, setDropoffTimeOpen] = useState(false);
  const [currentTripForTime, setCurrentTripForTime] = useState<any>(null);
  const [timeType, setTimeType] = useState<'pickup' | 'dropoff'>('pickup');
  const [selectedTime, setSelectedTime] = useState('');

  // Get user role from cookies
  useEffect(() => {
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(";").shift();
      return null;
    };
    const role = decodeURIComponent(getCookie("role") || "");
    setUserRole(role);
  }, []);

  const handleViewMap = async (driverName: string, trip?: any) => {
    if (trip?.vehicleLocation && trip.vehicleLocation.latitude && trip.vehicleLocation.longitude) {
      const vehicleData = {
        ...trip.vehicleLocation,
        trip,
        routeCoordinates: trip.routeCoords,
        stopPoints: trip.stopPoints,
        driverDetails: {
          fullName: driverName,
          plate: trip.vehicleLocation.plate,
          speed: trip.vehicleLocation.speed,
          mileage: trip.vehicleLocation.mileage,
          address: trip.vehicleLocation.address,
          geozone: trip.vehicleLocation.geozone,
          company: trip.vehicleLocation.company,
          lastUpdate: trip.vehicleLocation.loc_time
        }
      };
      setMapData(vehicleData);
      setMapOpen(true);
    } else if (trip?.vehicleLocation) {
      const vehicleData = {
        ...trip.vehicleLocation,
        latitude: trip.vehicleLocation.latitude,
        longitude: trip.vehicleLocation.longitude,
        driverDetails: {
          fullName: driverName,
          plate: trip.vehicleLocation.plate,
          speed: trip.vehicleLocation.speed,
          mileage: trip.vehicleLocation.mileage,
          address: trip.vehicleLocation.address,
          geozone: trip.vehicleLocation.geozone,
          company: trip.vehicleLocation.company,
          lastUpdate: trip.vehicleLocation.loc_time
        }
      };
      setMapData(vehicleData);
      setMapOpen(true);
    } else {
      alert(`No location data available for driver: ${driverName}`);
    }
  };

  useEffect(() => {
    async function fetchAuditData() {
      try {
        const supabase = createClient()
        const { data: auditTrips, error } = await supabase
          .from('audit')
          .select('*')
          .ilike('status', 'delivered')
        if (error) throw error
        
        const formattedData = (auditTrips || []).map(trip => {
          const clientDetails = typeof trip.clientdetails === 'string' ? JSON.parse(trip.clientdetails) : trip.clientdetails
          return {
            id: trip.id,
            client: clientDetails?.name || 'Unknown Client',
            commodity: trip.cargo || 'N/A',
            rate: trip.rate || 'N/A',
            pickup: trip.origin || 'N/A',
            dropOff: trip.destination || 'N/A',
            status: trip.status || 'Unknown'
          }
        })
        setAuditData(formattedData)
      } catch (err) {
        console.error('Error fetching audit data:', err)
      } finally {
        setAuditLoading(false)
      }
    }
    
    if (activeTab === 'audit') {
      fetchAuditData()
    }
  }, [activeTab])

  return (
    <>
      <div className="flex-1 space-y-4 p-4 pt-6">
        {/* Top Tabs Navigation */}
        <div className="flex items-center justify-between">
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v)}
            className="w-full"
          >
            <TabsList className="flex w-fit items-center rounded-full bg-white/80 dark:bg-slate-800 p-1.5 shadow-lg ring-1 ring-slate-200 dark:ring-slate-700">
              <TabsTrigger
                value="routing"
                className="px-4 py-2 text-sm font-medium rounded-full data-[state=active]:bg-primary data-[state=active]:text-white hover:brightness-95"
              >
                Routing
              </TabsTrigger>
              <TabsTrigger
                value="financials"
                className="px-4 py-2 text-sm font-medium rounded-full data-[state=active]:bg-primary data-[state=active]:text-white hover:brightness-95"
              >
                Financials
              </TabsTrigger>
              <TabsTrigger
                value="audit"
                className="px-4 py-2 text-sm font-medium rounded-full data-[state=active]:bg-primary data-[state=active]:text-white hover:brightness-95"
              >
                Audit
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Conditionally render the main views */}
        {activeTab === "routing" && (
          <div className="space-y-4">
            <div className="mb-4 flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Trip Routing</h2>
                <p className="text-muted-foreground">Monitor all trips with progress tracking and waypoints</p>
              </div>

            </div>
            <RoutingSection 
              userRole={userRole}
              handleViewMap={handleViewMap}
              setCurrentTripForNote={setCurrentTripForNote}
              setNoteText={setNoteText}
              setNoteOpen={setNoteOpen}
              setAvailableDrivers={setAvailableDrivers}
              setCurrentTripForChange={setCurrentTripForChange}
              setChangeDriverOpen={setChangeDriverOpen}
              refreshTrigger={refreshTrigger}
              setRefreshTrigger={setRefreshTrigger}
              setPickupTimeOpen={setPickupTimeOpen}
              setDropoffTimeOpen={setDropoffTimeOpen}
              setCurrentTripForTime={setCurrentTripForTime}
              setTimeType={setTimeType}
              setSelectedTime={setSelectedTime}
            />
          </div>
        )}

        {activeTab === "financials" && (
          <div className="space-y-4">
            <div className="mb-4">
              <h2 className="text-3xl font-bold tracking-tight">Financials</h2>
              <p className="text-muted-foreground">Track revenue, expenses, and financial performance</p>
            </div>
            <FinancialsPanel />
          </div>
        )}

        {activeTab === "audit" && (
          <div className="space-y-4">
            <div className="mb-4">
              <h2 className="text-3xl font-bold tracking-tight">Audit</h2>
              <p className="text-muted-foreground">Transportation audit logs and history</p>
            </div>
            <Card className="rounded-2xl shadow-md">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Audit Table</CardTitle>
                <CardDescription>Transportation audit logs and history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-blue-100">
                        <TableHead>Client</TableHead>
                        <TableHead>Cargo</TableHead>
                        <TableHead>Rate</TableHead>
                        <TableHead>Pickup Point</TableHead>
                        <TableHead>Drop Off Point</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {auditLoading ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            Loading audit data...
                          </TableCell>
                        </TableRow>
                      ) : auditData.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                            No trips found
                          </TableCell>
                        </TableRow>
                      ) : auditData.map((row) => (
                        <TableRow key={row.id} className="hover:bg-muted/50">
                          <TableCell className="font-medium">{row.client}</TableCell>
                          <TableCell>{row.commodity}</TableCell>
                          <TableCell>{row.rate}</TableCell>
                          <TableCell className="max-w-32 truncate" title={row.pickup}>{row.pickup}</TableCell>
                          <TableCell className="max-w-32 truncate" title={row.dropOff}>{row.dropOff}</TableCell>
                          <TableCell>
                            <span className={cn(
                              "px-3 py-1 rounded-full text-xs font-medium",
                              row.status?.toLowerCase() === "delivered" || row.status?.toLowerCase() === "complete" ? "bg-green-100 text-green-800" :
                              row.status?.toLowerCase() === "on trip" || row.status?.toLowerCase() === "in transit" ? "bg-blue-100 text-blue-800" :
                              row.status?.toLowerCase() === "pending" ? "bg-yellow-100 text-yellow-800" :
                              "bg-gray-100 text-gray-800"
                            )}>
                              {row.status}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Change Driver Modal */}
      {changeDriverOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Change Driver</h3>
              <Button variant="ghost" size="sm" onClick={() => {
                setChangeDriverOpen(false);
                setDriverSearchTerm('');
              }}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4">
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Current Trip: {currentTripForChange?.trip_id || currentTripForChange?.id}</p>
                <p className="text-sm text-gray-600 mb-2">Select a new driver:</p>
                <input
                  type="text"
                  placeholder="Search by surname..."
                  value={driverSearchTerm}
                  onChange={(e) => setDriverSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {availableDrivers
                  .filter(driver => 
                    driver.surname?.toLowerCase().includes(driverSearchTerm.toLowerCase()) ||
                    driver.first_name?.toLowerCase().includes(driverSearchTerm.toLowerCase())
                  )
                  .map((driver) => (
                  <div
                    key={driver.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={async () => {
                      if (!confirm(`Assign ${driver.first_name} ${driver.surname} to this trip?`)) return;
                      try {
                        const supabase = createClient();
                        const currentAssignments = currentTripForChange.vehicleassignments || currentTripForChange.vehicle_assignments || [];
                        const updatedAssignments = currentAssignments.map(assignment => ({
                          ...assignment,
                          drivers: [{ id: driver.id, name: `${driver.first_name} ${driver.surname}` }]
                        }));
                        
                        const { error } = await supabase
                          .from('trips')
                          .update({ 
                            vehicleassignments: updatedAssignments,
                            vehicle_assignments: updatedAssignments 
                          })
                          .eq('id', currentTripForChange.id);
                        
                        if (error) throw error;
                        alert('Driver changed successfully');
                        setChangeDriverOpen(false);
                        setRefreshTrigger(prev => prev + 1);
                      } catch (err) {
                        console.error('Failed to change driver:', err);
                        alert('Failed to change driver');
                      }
                    }}
                  >
                    <div>
                      <div className="font-medium">{driver.first_name} {driver.surname}</div>
                      <div className="text-sm text-gray-500">{driver.phone_number}</div>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      driver.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {driver.available ? 'Available' : 'Busy'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Time Setting Modal */}
      {(pickupTimeOpen || dropoffTimeOpen) && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">
                Set {timeType === 'pickup' ? 'Pickup' : 'Drop-off'} Time
              </h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  setPickupTimeOpen(false);
                  setDropoffTimeOpen(false);
                  setSelectedTime('');
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  Trip: {currentTripForTime?.trip_id || currentTripForTime?.id}
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  Select {timeType === 'pickup' ? 'pickup' : 'drop-off'} date and time:
                </p>
                <DateTimePicker
                  value={selectedTime}
                  onChange={setSelectedTime}
                  placeholder={`Select ${timeType} time`}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setPickupTimeOpen(false);
                    setDropoffTimeOpen(false);
                    setSelectedTime('');
                  }}
                >
                  Cancel
                </Button>
                {selectedTime && (
                  <Button 
                    variant="destructive" 
                    onClick={async () => {
                      try {
                        const supabase = createClient();
                        const field = timeType === 'pickup' ? 'pickup_locations' : 'dropoff_locations';
                        const locations = currentTripForTime[field] || currentTripForTime[field.replace('_', '')] || [];
                        
                        const updatedLocations = locations.length > 0 
                          ? locations.map((loc, index) => index === 0 ? { ...loc, scheduled_time: null } : loc)
                          : [];
                        
                        const { error } = await supabase
                          .from('trips')
                          .update({ [field]: updatedLocations })
                          .eq('id', currentTripForTime.id);
                        
                        if (error) throw error;
                        
                        alert(`${timeType === 'pickup' ? 'Pickup' : 'Drop-off'} time removed successfully`);
                        setPickupTimeOpen(false);
                        setDropoffTimeOpen(false);
                        setSelectedTime('');
                        setRefreshTrigger(prev => prev + 1);
                      } catch (err) {
                        console.error(`Failed to remove ${timeType} time:`, err);
                        alert(`Failed to remove ${timeType} time`);
                      }
                    }}
                  >
                    Remove
                  </Button>
                )}
                <Button 
                  onClick={async () => {
                    if (!selectedTime) {
                      alert('Please select a time');
                      return;
                    }
                    try {
                      const supabase = createClient();
                      const field = timeType === 'pickup' ? 'pickup_locations' : 'dropoff_locations';
                      const locations = currentTripForTime[field] || currentTripForTime[field.replace('_', '')] || [];
                      
                      const updatedLocations = locations.length > 0 
                        ? locations.map((loc, index) => index === 0 ? { ...loc, scheduled_time: selectedTime } : loc)
                        : [{ scheduled_time: selectedTime }];
                      
                      const { error } = await supabase
                        .from('trips')
                        .update({ [field]: updatedLocations })
                        .eq('id', currentTripForTime.id);
                      
                      if (error) throw error;
                      
                      alert(`${timeType === 'pickup' ? 'Pickup' : 'Drop-off'} time set successfully`);
                      setPickupTimeOpen(false);
                      setDropoffTimeOpen(false);
                      setSelectedTime('');
                      setRefreshTrigger(prev => prev + 1);
                    } catch (err) {
                      console.error(`Failed to set ${timeType} time:`, err);
                      alert(`Failed to set ${timeType} time`);
                    }
                  }}
                >
                  Save Time
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Map Modal */}
      {mapOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-7xl h-full max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
              <h3 className="text-lg font-semibold">Driver Location</h3>
              <Button variant="ghost" size="sm" onClick={() => setMapOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-col lg:flex-row gap-4 p-4 flex-1 min-h-0">
              <div className="w-full lg:w-80 bg-gray-50 p-4 rounded-lg flex-shrink-0 max-h-64 lg:max-h-none overflow-y-auto">
                <h4 className="font-semibold mb-3">Driver Information</h4>
                {mapData?.driverDetails && (
                  <div className="space-y-3 text-sm">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="font-medium text-blue-900">{mapData.driverDetails.fullName}</div>
                      <div className="text-blue-700 text-xs">Vehicle: {mapData.driverDetails.plate}</div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Speed:</span>
                        <span className="font-medium">{mapData.driverDetails.speed} km/h</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Mileage:</span>
                        <span className="font-medium">{parseFloat(mapData.driverDetails.mileage || 0).toLocaleString()} km</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        <div className="font-medium mb-1">Current Location:</div>
                        <div>{mapData.driverDetails.address}</div>
                      </div>
                      {mapData.driverDetails.geozone && (
                        <div className="text-xs text-gray-500">
                          <div className="font-medium mb-1">Geozone:</div>
                          <div>{mapData.driverDetails.geozone}</div>
                        </div>
                      )}
                      <div className="text-xs text-gray-500">
                        <div className="font-medium mb-1">Last Update:</div>
                        <div>{new Date(mapData.driverDetails.lastUpdate).toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex-1 min-h-0">
                <div 
                  id="driver-map" 
                  className="w-full h-full min-h-[400px] rounded border"
                  ref={(el) => {
                    if (el && mapData) {
                      el.innerHTML = ''
                      
                      const script = document.createElement('script')
                      script.src = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js'
                      script.onload = () => {
                        const link = document.createElement('link')
                        link.href = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css'
                        link.rel = 'stylesheet'
                        document.head.appendChild(link)
                        
                        if (window.mapboxgl) {
                          window.mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
                          const map = new window.mapboxgl.Map({
                            container: el,
                            style: 'mapbox://styles/mapbox/streets-v12',
                            center: [parseFloat(mapData.longitude), parseFloat(mapData.latitude)],
                            zoom: 15
                          })
                          
                          map.on('load', () => {
                            // Driver location marker
                            const vehicleEl = document.createElement('div')
                            vehicleEl.innerHTML = '🚛'
                            vehicleEl.style.cssText = `
                              font-size: 24px; width: 32px; height: 32px;
                              display: flex; align-items: center; justify-content: center;
                              background: #3b82f6; border: 3px solid #fff;
                              border-radius: 50%; animation: pulse 2s infinite;
                              box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                            `
                            
                            const style = document.createElement('style')
                            style.textContent = `@keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); } 70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); } 100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); } }`
                            document.head.appendChild(style)
                            
                            const vehicleMarker = new window.mapboxgl.Marker(vehicleEl)
                              .setLngLat([parseFloat(mapData.longitude), parseFloat(mapData.latitude)])
                              .addTo(map)
                            
                            // Add route coordinates if available
                            if (mapData.routeCoordinates) {
                              map.addSource('planned-route', {
                                type: 'geojson',
                                data: {
                                  type: 'Feature',
                                  properties: {},
                                  geometry: {
                                    type: 'LineString',
                                    coordinates: mapData.routeCoordinates
                                  }
                                }
                              });
                              
                              // Main route line
                              map.addLayer({
                                id: 'planned-route-line',
                                type: 'line',
                                source: 'planned-route',
                                layout: { 'line-join': 'round', 'line-cap': 'round' },
                                paint: { 'line-color': '#ef4444', 'line-width': 6, 'line-opacity': 0.8 }
                              });
                              
                              // Add start and end markers
                              const startEl = document.createElement('div');
                              startEl.innerHTML = '🚩';
                              startEl.style.fontSize = '24px';
                              new window.mapboxgl.Marker(startEl)
                                .setLngLat(mapData.routeCoordinates[0])
                                .addTo(map);
                              
                              const endEl = document.createElement('div');
                              endEl.innerHTML = '🏁';
                              endEl.style.fontSize = '24px';
                              new window.mapboxgl.Marker(endEl)
                                .setLngLat(mapData.routeCoordinates[mapData.routeCoordinates.length - 1])
                                .addTo(map);
                              
                              // Add stop points if available
                              if (mapData.stopPoints && mapData.stopPoints.length > 0) {
                                mapData.stopPoints.forEach((stopPoint, index) => {
                                  // Add polygon if coordinates available
                                  if (stopPoint.polygon && stopPoint.polygon.length > 2) {
                                    map.addSource(`stop-polygon-${index}`, {
                                      type: 'geojson',
                                      data: {
                                        type: 'Feature',
                                        properties: { name: stopPoint.name },
                                        geometry: {
                                          type: 'Polygon',
                                          coordinates: [stopPoint.polygon]
                                        }
                                      }
                                    });
                                    
                                    map.addLayer({
                                      id: `stop-polygon-fill-${index}`,
                                      type: 'fill',
                                      source: `stop-polygon-${index}`,
                                      paint: {
                                        'fill-color': '#fbbf24',
                                        'fill-opacity': 0.3
                                      }
                                    });
                                    
                                    map.addLayer({
                                      id: `stop-polygon-outline-${index}`,
                                      type: 'line',
                                      source: `stop-polygon-${index}`,
                                      paint: {
                                        'line-color': '#f59e0b',
                                        'line-width': 2
                                      }
                                    });
                                  }
                                  
                                  // Add center marker
                                  const stopEl = document.createElement('div');
                                  stopEl.innerHTML = '🛑';
                                  stopEl.style.fontSize = '20px';
                                  
                                  const marker = new window.mapboxgl.Marker(stopEl)
                                    .setLngLat(stopPoint.coordinates)
                                    .addTo(map);
                                  
                                  const popup = new window.mapboxgl.Popup({ offset: 25 })
                                    .setHTML(`<div class="p-2"><strong>Stop Point ${index + 1}</strong><br/>${stopPoint.name}</div>`);
                                  marker.setPopup(popup);
                                });
                              }
                              
                              // Fit map to show vehicle, route, and stop points
                              const bounds = new window.mapboxgl.LngLatBounds();
                              bounds.extend([parseFloat(mapData.longitude), parseFloat(mapData.latitude)]);
                              mapData.routeCoordinates.forEach(coord => bounds.extend(coord));
                              if (mapData.stopPoints) {
                                mapData.stopPoints.forEach(stop => {
                                  bounds.extend(stop.coordinates);
                                  if (stop.polygon) {
                                    stop.polygon.forEach(coord => bounds.extend(coord));
                                  }
                                });
                              }
                              map.fitBounds(bounds, { padding: 50 });
                            }
                            
                            // Add popup with driver details
                            if (mapData.driverDetails) {
                              const popup = new window.mapboxgl.Popup({ offset: 25 })
                                .setHTML(`
                                  <div class="p-3">
                                    <div class="font-bold text-blue-900 mb-2">${mapData.driverDetails.fullName}</div>
                                    <div class="text-sm space-y-1">
                                      <div><strong>Vehicle:</strong> ${mapData.driverDetails.plate}</div>
                                      <div><strong>Speed:</strong> ${mapData.driverDetails.speed} km/h</div>
                                      <div><strong>Company:</strong> ${mapData.driverDetails.company || 'N/A'}</div>
                                      <div class="text-xs text-gray-600 mt-2">
                                        Last updated: ${new Date(mapData.driverDetails.lastUpdate).toLocaleTimeString()}
                                      </div>
                                    </div>
                                  </div>
                                `)
                              vehicleMarker.setPopup(popup)
                            }
                          })
                        }
                      }
                      
                      if (!document.querySelector('script[src*="mapbox-gl.js"]')) {
                        document.head.appendChild(script)
                      } else if (window.mapboxgl) {
                        script.onload()
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}