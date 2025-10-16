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


interface DashboardStats {
  activeBreakdowns: number;
  pendingApprovals: number;
  availableTechnicians: number;
  totalVehicles: number;
  monthlyRevenue: number;
  completedJobs: number;
  drivers: number;
  tows: number;
  qoutes: number;
}

interface RecentActivity {
  id: string;
  type: "breakdown" | "approval" | "completion" | "quotation";
  title: string;
  description: string;
  timestamp: string;
  status: string;
}

// Utility to read cookie by name
function getCookie(name: string) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() ?? null;
  return null;
}

export default function Dashboard() {
  // useGlobalContext is implemented in JS and its initialState doesn't
  // include runtime-added helpers in the inferred type. Cast to `any`
  // so we can access `onCreate` provided by the provider.
  const globalContext = useGlobalContext() as any;
  const onCreate = globalContext?.onCreate ?? (() => {});
  const [userRole, setUserRole] = useState<string>("");
  
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
  const [userEmail, setUserEmail] = useState<string>("");
  const [stats, setStats] = useState<DashboardStats>({
    activeBreakdowns: 0,
    pendingApprovals: 0,
    availableTechnicians: 0,
    totalVehicles: 0,
    monthlyRevenue: 0,
    completedJobs: 0,
    drivers: 0,
    tows: 0,
    qoutes: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<any>(null);
  const [dateTimeOpen, setDateTimeOpen] = useState(false);
  const [dateTimeType, setDateTimeType] = useState<'pickup' | 'dropoff'>('pickup');
  const [currentTrip, setCurrentTrip] = useState<any>(null);
  const [selectedDateTime, setSelectedDateTime] = useState('');
  const [mapOpen, setMapOpen] = useState(false);
  const [mapData, setMapData] = useState<any>(null);
  const [loadOpen, setLoadOpen] = useState(false);
  const [loadData, setLoadData] = useState<any>(null);
  const [changeDriverOpen, setChangeDriverOpen] = useState(false);
  const [currentTripForChange, setCurrentTripForChange] = useState<any>(null);
  const [availableDrivers, setAvailableDrivers] = useState<any[]>([]);
  const [offCourseTrips, setOffCourseTrips] = useState<Set<string>>(new Set());
  const [noteOpen, setNoteOpen] = useState(false);
  const [currentTripForNote, setCurrentTripForNote] = useState<any>(null);
  const [noteText, setNoteText] = useState('');
  const [routeViewOpen, setRouteViewOpen] = useState(false);
  const [selectedRouteTrip, setSelectedRouteTrip] = useState<any>(null);
  const [allVehicles, setAllVehicles] = useState<any[]>([]);

  // Fetch all vehicles once on component mount
  useEffect(() => {
    const fetchAllVehicles = async () => {
      try {
        const response = await fetch('http://64.227.138.235:3000/api/eps-vehicles')
        const result = await response.json()
        const vehicles = result.data || []
        setAllVehicles(vehicles)
        console.log('Fetched all vehicles:', vehicles.length, 'items')
      } catch (err) {
        console.error('Error fetching all vehicles:', err)
        setAllVehicles([])
      }
    }
    fetchAllVehicles()
  }, [])

  // Optimized real-time off-course monitoring
  useEffect(() => {
    let mounted = true
    const checkAllOffCourse = async () => {
      if (!mounted || allVehicles.length === 0) return
      try {
        const supabase = createClient()
        const vehicles = allVehicles
        const { data: trips } = await supabase.from('trips').select('*').eq('status', 'On Trip')
        const { data: routes } = await supabase.from('routes').select('*')
        
        if (!mounted) return
        
        const newOffCourseTrips = new Set<string>()
        
        for (const trip of trips || []) {
          const assignments = trip.vehicleassignments || []
          if (!assignments.length) continue
          
          const driverName = assignments[0]?.drivers?.[0]?.name || ''
          const vehicle = vehicles.find((v: any) => 
            v.driver_name?.toLowerCase().includes(driverName.toLowerCase())
          )
          
          if (vehicle) {
            const route = routes?.find(r => r.order_number === trip.ordernumber)
            if (route?.route_data?.geometry?.coordinates) {
              const coords = route.route_data.geometry.coordinates
              const vehiclePos = [parseFloat(vehicle.longitude), parseFloat(vehicle.latitude)]
              
              const isNearRoute = coords.some((coord: number[]) => {
                const distance = Math.sqrt(
                  Math.pow(coord[0] - vehiclePos[0], 2) + Math.pow(coord[1] - vehiclePos[1], 2)
                ) * 111000
                return distance < 1000
              })
              
              if (!isNearRoute) {
                newOffCourseTrips.add(trip.id)
              }
            }
          }
        }
        
        // Only update if there's a change
        setOffCourseTrips(prev => {
          const hasChanged = prev.size !== newOffCourseTrips.size || 
            [...prev].some(id => !newOffCourseTrips.has(id))
          return hasChanged ? newOffCourseTrips : prev
        })
      } catch (err) {
        console.error('Error checking off-course status:', err)
      }
    }
    
    checkAllOffCourse()
    const interval = setInterval(checkAllOffCourse, 60000) // Reduced to 1 minute
    
    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [allVehicles])

  const handleViewMap = async (driverName: string, trip?: any) => {
    console.log('Searching for driver:', driverName, 'in', allVehicles.length, 'vehicles')
    
    // First try to find in cached vehicles
    let vehicle = allVehicles.find((v: any) => {
      const vehicleDriverName = v.driver_name?.toLowerCase() || ''
      const searchName = driverName.toLowerCase()
      
      return vehicleDriverName.includes(searchName) || searchName.includes(vehicleDriverName)
    })
    
    // If not found in cache, fetch fresh data from API
    if (!vehicle) {
      try {
        console.log('Driver not found in cache, fetching fresh data from API...')
        const response = await fetch('http://64.227.138.235:3000/api/eps-vehicles')
        const result = await response.json()
        const freshVehicles = result.data || []
        
        vehicle = freshVehicles.find((v: any) => {
          const vehicleDriverName = v.driver_name?.toLowerCase() || ''
          const searchName = driverName.toLowerCase()
          
          return vehicleDriverName.includes(searchName) || searchName.includes(vehicleDriverName)
        })
        
        // Update cache with fresh data
        setAllVehicles(freshVehicles)
        console.log('Updated vehicle cache with', freshVehicles.length, 'vehicles')
      } catch (error) {
        console.error('Error fetching fresh vehicle data:', error)
      }
    }
    
    console.log('Found vehicle:', vehicle ? 'Yes' : 'No', vehicle)
    
    if (vehicle) {
      // Enhanced vehicle data with driver details from API
      const enhancedVehicleData = {
        ...vehicle,
        trip,
        // Driver details from EPS API
        driverDetails: {
          fullName: vehicle.driver_name,
          plate: vehicle.plate,
          speed: vehicle.speed,
          mileage: vehicle.mileage,
          address: vehicle.address,
          geozone: vehicle.geozone,
          company: vehicle.company,
          lastUpdate: vehicle.loc_time
        }
      }
      setMapData(enhancedVehicleData)
      setMapOpen(true)
    } else {
      console.log('Available drivers:', allVehicles.map(v => v.driver_name))
      alert(`Vehicle location not found for driver: ${driverName}`)
    }
  }

  const handleDateTimeSubmit = async () => {
    if (!currentTrip || !selectedDateTime) return
    
    const field = dateTimeType === 'pickup' ? 'pickup_time' : 'dropoff_time'
    try {
      const supabase = createClient()
      console.log('Updating trip:', currentTrip.id, 'field:', field, 'value:', selectedDateTime)
      const { error, data } = await supabase.from('trips').update({ [field]: selectedDateTime }).eq('id', currentTrip.id)
      if (error) {
        console.error('Supabase error:', error)
        throw error
      }
      console.log('Update successful:', data)
      setDateTimeOpen(false)
      setSelectedDateTime('')
      // Trigger seamless refresh of trips data
      const supabaseRefresh = createClient()
      const { data: updatedTrips } = await supabase.from('trips').select('*')
      if (updatedTrips) {
        // This will be handled by the real-time subscription
      }
    } catch (err) {
      console.error(`Failed to update ${dateTimeType} time`, err)
      const message = (err as any).message || String(err)
      alert(`Failed to update ${dateTimeType} time: ${message}`)
    }
  }

  // Driver Card Component with fetched driver info
  function DriverCard({ trip }: { trip: any }) {
    const [driverInfo, setDriverInfo] = useState<any>(null)
    const [vehicleInfo, setVehicleInfo] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [vehicleLocation, setVehicleLocation] = useState<any>(null)
    const [isOffCourse, setIsOffCourse] = useState(false)
    const [actualETA, setActualETA] = useState<string>('')
    const [routeLoading, setRouteLoading] = useState(true)

    // Use global off-course status
    useEffect(() => {
      setIsOffCourse(offCourseTrips.has(trip.id))
    }, [offCourseTrips, trip.id])

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
        setRouteLoading(false)
      }

      fetchAssignmentInfo()
    }, [trip.vehicleassignments, trip.vehicle_assignments])

    const loadRouteData = async () => {
      try {
        const supabase = createClient()
        const { data: route } = await supabase
          .from('routes')
          .select('route_data')
          .eq('order_number', trip.ordernumber)
          .single()
        return route
      } catch (error) {
        console.error('Error loading route data:', error)
        return null
      }
    }

    const driverName = driverInfo ? `${driverInfo.first_name} ${driverInfo.surname}`.trim() : 'Unassigned'
    const initials = driverName !== 'Unassigned' ? driverName.split(' ').map((s: string) => s[0]).slice(0,2).join('') : 'DR'

    if (routeLoading) {
      return (
        <div className="bg-white border border-gray-100 rounded-md p-4 shadow-sm animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gray-200"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
          <div className="mt-3 space-y-2">
            <div className="h-3 bg-gray-200 rounded w-full"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      )
    }

    return (
      <div className={`bg-white border rounded-md p-4 shadow-sm ${
        isOffCourse ? 'border-red-500 border-2 animate-pulse bg-red-50' : 'border-gray-100'
      }`}>
        {isOffCourse && (
          <div className="flex items-center gap-2 mb-3 p-2 bg-red-100 rounded border border-red-300">
            <AlertTriangle className="w-4 h-4 text-red-600 animate-pulse" />
            <span className="text-red-700 text-sm font-medium">Driver Off-Course</span>
          </div>
        )}
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium ${
            isOffCourse ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-gray-100 text-gray-700'
          }`}>
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold truncate">{driverInfo?.surname || 'Unassigned'}</div>
            {loading ? (
              <div className="text-xs text-muted-foreground">Loading driver info...</div>
            ) : driverInfo ? (
              <div className="space-y-1">
                {driverInfo.license_number && (
                  <div className="text-xs text-muted-foreground truncate">
                    License: {driverInfo.license_number}
                  </div>
                )}
                {driverInfo.phone_number && (
                  <div className="text-xs text-muted-foreground truncate">
                    Phone: {driverInfo.phone_number}
                  </div>
                )}
                {driverInfo.email && (
                  <div className="text-xs text-muted-foreground truncate">
                    Email: {driverInfo.email}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-xs text-muted-foreground">Driver info not found</div>
            )}
          </div>
        </div>
        {(trip.status_notes || trip.statusnotes) && (
          <div className="mt-3 p-3 bg-gradient-to-r from-amber-50 to-yellow-50 border-l-4 border-amber-400 rounded-r-md">
            <div className="flex items-start gap-2">
              <FileText className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-xs font-semibold text-amber-800 mb-1">Status Note</div>
                <div className="text-sm text-amber-900 leading-relaxed">{trip.status_notes || trip.statusnotes}</div>
              </div>
            </div>
          </div>
        )}
        <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2 truncate">
            <Car className="w-4 h-4 text-muted-foreground" />
            <span className="truncate">{vehicleInfo?.registration_number || vehicleInfo?.regNumber || '-'}</span>
          </div>
          <div className="flex gap-2">
            {isOffCourse && (
              <span className="px-2 py-0.5 rounded text-xs bg-red-100 text-red-800 animate-pulse">
                Off Course
              </span>
            )}
            <span className={`px-2 py-0.5 rounded text-xs ${
              driverInfo?.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {driverInfo?.available ? 'Available' : 'Unavailable'}
            </span>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-1">
          <Button size="sm" variant="outline" onClick={async () => {
            const routeData = await loadRouteData()
            // Use driver_name from EPS API or fallback to constructed name
            const driverName = driverInfo?.driver_name || `${driverInfo?.first_name} ${driverInfo?.surname}`.trim()
            handleViewMap(driverName, { ...trip, routeData, vehicleLocation })
          }}>
            <MapPin className="w-3 h-3 mr-1" />Map
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            disabled={userRole === "fleet manager"}
            className={userRole === "fleet manager" ? "opacity-50 cursor-not-allowed" : ""}
            onClick={() => {
              if (userRole === "fleet manager") return;
              setCurrentTripForNote(trip)
              setNoteText(trip.status_notes || trip.statusnotes || '')
              setNoteOpen(true)
            }}
          >
            <FileText className="w-3 h-3 mr-1" />Note
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            disabled={userRole === "fleet manager"}
            className={userRole === "fleet manager" ? "opacity-50 cursor-not-allowed" : ""}
            onClick={async () => {
              if (userRole === "fleet manager") return;
              const supabase = createClient()
              const { data: drivers } = await supabase.from('drivers').select('*')
              setAvailableDrivers(drivers || [])
              setCurrentTripForChange(trip)
              setChangeDriverOpen(true)
            }}
          >
            <User className="w-3 h-3 mr-1" />Change
          </Button>
          <Button 
            size="sm" 
            variant="destructive" 
            disabled={userRole === "fleet manager"}
            className={userRole === "fleet manager" ? "opacity-50 cursor-not-allowed" : ""}
            onClick={() => {
              if (userRole === "fleet manager") return;
              alert('Cancel Load')
            }}
          >
            <X className="w-3 h-3 mr-1" />Cancel
          </Button>
        </div>
      </div>
    )
  }

  // Enhanced routing components with proper waypoints
  function RoutingSection() {
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
      
      // Optimized real-time subscription with selective updates
      const supabase = createClient()
      const channel = supabase
        .channel('trips-changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'trips' },
          (payload) => {
            // Only update specific trip instead of refetching all
            if (payload.eventType === 'UPDATE' && payload.new) {
              setTrips(prev => prev.map(trip => 
                trip.id === payload.new.id ? { ...trip, ...payload.new } : trip
              ))
            } else if (payload.eventType === 'INSERT' && payload.new) {
              setTrips(prev => [...prev, payload.new])
            } else if (payload.eventType === 'DELETE' && payload.old) {
              setTrips(prev => prev.filter(trip => trip.id !== payload.old.id))
            }
          }
        )
        .subscribe()
      
      return () => {
        supabase.removeChannel(channel)
      }
    }, [])

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

    const getWaypoints = (trip: any) => {
      const currentStatusIndex = TRIP_STATUSES.findIndex(s => s.toLowerCase() === trip.status?.toLowerCase())
      
      return TRIP_STATUSES.map((status, index) => ({
        position: (index / (TRIP_STATUSES.length - 1)) * 100,
        label: status,
        completed: currentStatusIndex > index,
        current: currentStatusIndex === index
      }))
    }

    const getTripProgress = (status: string) => {
      const statusIndex = TRIP_STATUSES.findIndex(s => s.toLowerCase() === status?.toLowerCase())
      if (statusIndex === -1) return 0
      return ((statusIndex + 1) / TRIP_STATUSES.length) * 100
    }

    // Helpers for updating trips
    const supabase = createClient()

    const handleUpdatePickup = (trip: any) => {
      setCurrentTrip(trip)
      setDateTimeType('pickup')
      setSelectedDateTime(trip.pickup_time || '')
      setDateTimeOpen(true)
    }

    const handleUpdateDropoff = (trip: any) => {
      setCurrentTrip(trip)
      setDateTimeType('dropoff')
      setSelectedDateTime(trip.dropoff_time || '')
      setDateTimeOpen(true)
    }

    const handleCompleteTrip = async (trip: any) => {
      if (!confirm('Mark this trip as completed?')) return
      try {
        const { error } = await supabase.from('trips').update({ status: 'Delivered' }).eq('id', trip.id)
        if (error) throw error
        // Update local state immediately for seamless UX
        setTrips(prev => prev.map(t => t.id === trip.id ? { ...t, status: 'Delivered' } : t))
        alert('Trip marked as completed')
      } catch (err) {
        console.error('Failed to complete trip', err)
        const message = (err as any).message || String(err)
        window.alert(`Failed to complete trip: ${message}`)
      }
    }

    // Debug: Show what data we have
    console.log('Trips data:', tripsList)
    console.log('Global context:', global)

    if (loading) {
      return <div className="text-center py-8">Loading trips...</div>
    }

    if (tripsList.length === 0) {
      return (
        <div className="space-y-4">
          <div className="text-center py-8 text-muted-foreground">
            No trips available in database
          </div>
          <Card className="p-4">
            <h4 className="font-medium mb-2">Sample Trip (Demo)</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">ABC Corp</h3>
                  <p className="text-sm text-muted-foreground">New York → Boston</p>
                </div>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  on trip
                </span>
              </div>
              <ProgressWithWaypoints 
                value={75} 
                waypoints={[
                  { position: 0, label: 'New York', completed: true, current: false },
                  { position: 50, label: 'Hartford', completed: true, current: false },
                  { position: 100, label: 'Boston', completed: false, current: true }
                ]} 
                className="w-full"
                variant="stepped"
              />
              <div className="text-sm text-muted-foreground">
                Cargo: Electronics (2.5 tons)
              </div>
            </div>
          </Card>
        </div>
      )
    }

    // Sort trips to put off-course ones first
    const sortedTrips = [...tripsList].sort((a, b) => {
      const aOffCourse = offCourseTrips.has(a.id)
      const bOffCourse = offCourseTrips.has(b.id)
      if (aOffCourse && !bOffCourse) return -1
      if (!aOffCourse && bOffCourse) return 1
      return 0
    })

    return (
      <div className="space-y-4">
        {sortedTrips.map((trip: any) => {
          const waypoints = getWaypoints(trip)
          const progress = getTripProgress(trip.status)

          const clientDetails = typeof trip.clientdetails === 'string' ? JSON.parse(trip.clientdetails) : trip.clientdetails
          const title = clientDetails?.name || trip.selectedClient || trip.clientDetails?.name || `Trip ${trip.trip_id || trip.id}`
          const route = `${trip.origin || 'Start'} → ${trip.destination || 'End'}`
          const isOffCourse = offCourseTrips.has(trip.id)

          return (
            <div key={trip.id || trip.trip_id} className="space-y-3">
              <Card className={`p-4 rounded-lg shadow-sm ${
                isOffCourse ? 'border-red-500 border-2 bg-red-50' : ''
              }`}>
                {isOffCourse && (
                  <div className="flex items-center gap-2 mb-3 p-2 bg-red-100 rounded border border-red-300">
                    <AlertTriangle className="w-4 h-4 text-red-600 animate-pulse" />
                    <span className="text-red-700 text-sm font-medium">Trip Off-Course - Immediate Attention Required</span>
                  </div>
                )}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base truncate">{title}</h3>
                    <p className="text-sm text-muted-foreground truncate">{route}</p>

                    <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                      {(() => {
                        const pickupLocations = typeof trip.pickuplocations === 'string' ? JSON.parse(trip.pickuplocations) : trip.pickuplocations
                        const dropoffLocations = typeof trip.dropofflocations === 'string' ? JSON.parse(trip.dropofflocations) : trip.dropofflocations
                        const pickupTime = pickupLocations?.[0]?.scheduled_time
                        const dropoffTime = dropoffLocations?.[0]?.scheduled_time
                        return (
                          <>
                            {pickupTime && (
                              <div className="flex items-center gap-2 truncate text-red-300">
                                <Clock className="w-4 h-4" />
                                <span className="truncate">Est. Pickup: {new Date(pickupTime).toLocaleString()}</span>
                              </div>
                            )}
                            {dropoffTime && (
                              <div className="flex items-center gap-2 truncate text-red-300">
                                <Clock className="w-4 h-4" />
                                <span className="truncate">Est. Arrival: {new Date(dropoffTime).toLocaleString()}</span>
                              </div>
                            )}
                          </>
                        )
                      })()}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-xs font-medium",
                      trip.status?.toLowerCase() === 'delivered' ? 'bg-green-100 text-green-800' :
                      trip.status?.toLowerCase() === 'on trip' ? 'bg-blue-100 text-blue-800' :
                      ['pending', 'accept'].includes(trip.status?.toLowerCase()) ? 'bg-yellow-100 text-yellow-800' :
                      ['reject', 'cancelled', 'stopped'].includes(trip.status?.toLowerCase()) ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    )}>
                      {trip.status?.replace('-', ' ') || 'Unknown'}
                    </span>

                    <div className="text-xs text-muted-foreground">Trip: {trip.trip_id || trip.id}</div>
                  </div>
                </div>

                <div className="mt-4">
                  <ProgressWithWaypoints 
                    value={progress} 
                    waypoints={waypoints} 
                    className="w-full"
                    variant="stepped"
                  />

                  <div className="mt-3 text-sm text-muted-foreground flex items-center justify-between">
                    <div className="space-y-1">
                      {trip.cargo && <div className="truncate">Cargo: {trip.cargo}{trip.cargo_weight && ` (${trip.cargo_weight})`}</div>}

                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="ghost" onClick={() => handleUpdatePickup(trip)}>Pickup Time</Button>
                      <Button size="sm" variant="ghost" onClick={() => handleUpdateDropoff(trip)}>Dropoff Time</Button>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleCompleteTrip(trip)}>Complete Trip</Button>
                    </div>
                  </div>
                </div>
              </Card>

              <DriverCard trip={trip} />

                {/* Decorative separator marking end of current driver/trip pair */}
                {(() => {
                  const inactiveStatuses = ['delivered', 'cancelled', 'completed', 'reject', 'rejected']
                  const isActive = !(trip.status && inactiveStatuses.includes(trip.status.toLowerCase()))
                  return (
                    <div className="mt-4 relative">
                      <div className="h-1 rounded-full bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 shadow-sm"></div>
                      <div className="absolute left-1/2 top-0 transform -translate-x-1/2 -translate-y-1/2">
                        {isActive ? (
                          <div className="relative flex items-center justify-center">
                            <span className="absolute inline-flex w-6 h-6 rounded-full bg-sky-200 opacity-60 animate-ping"></span>
                            <span className="w-3 h-3 bg-white rounded-full border border-gray-300"></span>
                          </div>
                        ) : (
                          <div className="w-3 h-3 bg-white rounded-full border border-gray-300"></div>
                        )}
                      </div>
                    </div>
                  )
                })()}
            </div>
          )
        })}
      </div>
    )
  }

  const summaryData = {
    startTime: "08:00 AM",
    finishTime: "02:30 PM",
    distance: "450 km",
    duration: "6h 30m",
    drivingTime: "5h 45m",
    averageSpeed: "78 km/h",
    timeAtStop: "45m",
    metrics: [
      { label: "Fuel Consumption", planned: "45L", actual: "48L", variance: "+3L" },
      { label: "Travel Time", planned: "6h", actual: "5h 45m", variance: "-15m" },
      { label: "Distance", planned: "450km", actual: "452km", variance: "+2km" },
      { label: "Cost", planned: "$1,125", actual: "$1,130", variance: "+$5" },
    ]
  };

  const [auditData, setAuditData] = useState<any[]>([]);
  const [auditLoading, setAuditLoading] = useState(true);

  // Get user role on mount, redirect if missing
  useEffect(() => {
    const roleCookie = getCookie("role");
    if (roleCookie) {
      setUserRole(decodeURIComponent(roleCookie));
    } else {
      router.push("/login");
    }
  }, [router]);

  // Role-based navigation links (used in layout/navigation)
  const roleNavigation = {
    "fleet manager": [
      { name: "Dashboard", href: "/dashboard", Icon: <ChartBar /> },
      { name: "Jobs", href: "/jobsFleet", Icon: <Briefcase /> },
      { name: "Drivers", href: "/drivers", Icon: <Users /> },
      { name: "Vehicles", href: "/vehicles", Icon: <Car /> },
      { name: "Quote Management", href: "/quotation", Icon: <Building2 /> },
      { name: "System Settings", href: "/settings", Icon: <Settings /> },
      {
        name: "User Management",
        href: "/userManagement",
        Icon: <PlusSquare />,
      },
    ],
    "call centre": [
      { name: "Dashboard", href: "/dashboard", Icon: <ChartBar /> },
      { name: "Jobs", href: "/jobs", Icon: <Briefcase /> },
      { name: "Call Center", href: "/callcenter", Icon: <Phone /> },
      {
        name: "Technicians Assignment",
        href: "/callcenter/technician",
        Icon: <Wrench />,
      },
      {
        name: "Technician Vehicles",
        href: "/callcenter/breakdowns",
        Icon: <Truck />,
      },
      { name: "Workshops", href: "/callcenter/clients", Icon: <Users /> },
      { name: "Quote Management", href: "/ccenter", Icon: <Building2 /> },
      { name: "System Settings", href: "/settings", Icon: <Settings /> },
    ],
    customer: [
      { name: "Dashboard", href: "/dashboard", Icon: <ChartBar /> },
      {
        name: "Technicians Assignment",
        href: "/extechnicians",
        Icon: <Users />,
      },
      { name: "Workshop Vehicles", href: "/exvehicles", Icon: <Car /> },
      { name: "Quote Management", href: "/workshopQuote", Icon: <Building2 /> },
      { name: "System Settings", href: "/settings", Icon: <Settings /> },
    ],
    "cost centre": [
      { name: "Dashboard", href: "/dashboard", Icon: <ChartBar /> },
      { name: "Cost", href: "/ccenter", Icon: <Building2 /> },
      {
        name: "Quote Management",
        href: "/ccenter/create-quotation",
        Icon: <DollarSign />,
      },
      { name: "System Settings", href: "/settings", Icon: <Settings /> },
    ],
  };

  const formLinks = [
    { name: "New Trip", href: "trips", icon: FileText },
    { name: "New Vehicle", href: "vehicles", icon: Truck },
    { name: "New Driver", href: "drivers", icon: User },
    { name: "New Stop Point", href: "stop-points", icon: MapPin },
    { name: "New Cost Centre", href: "cost-centres", icon: Building },
  ];

  // Fetch stats and setup realtime activity subscription on userRole known
  useEffect(() => {
    if (!userRole) return;

    let isMounted = true;

    async function fetchStats() {
      setLoading(true);
      try {
        const data = await getDashboardStats();
        if (isMounted) setStats(data as any);
      } catch {
        if (isMounted) setError("Failed to load dashboard stats");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchStats();

    // TODO: Add supabase real-time subscriptions if desired

    return () => {
      isMounted = false;
    };
  }, [userRole]);

  // Quick actions filtered by role
  function getQuickActions() {
    const baseActions = [
      {
        title: "View All Vehicles Breakdowns",
        description: "See active and pending breakdown requests",
        icon: AlertTriangle,
        action: "/callcenter",
        color: "bg-red-50 text-red-600 hover:bg-red-100",
      },
      {
        title: "Vehicles",
        description: "Manage vehicles",
        icon: Truck,
        action: "/vehicles",
        color: "bg-blue-50 text-blue-600 hover:bg-blue-100",
      },
      {
        title: "Drivers",
        description: "Manage drivers",
        icon: Truck,
        action: "/drivers",
        color: "bg-blue-50 text-blue-600 hover:bg-blue-100",
      },
      {
        title: "Technicians",
        description: "View and manage all the technicians",
        icon: User2,
        action: "/callcenter/technician",
        color: "bg-blue-50 text-blue-600 hover:bg-blue-100",
      },
      {
        title: "System Settings",
        description: "Configure system and user settings",
        icon: User,
        action: "/settings",
        color: "bg-purple-50 text-purple-600 hover:bg-purple-100",
      },
    ];

    // Normalize role string for consistency e.g. "fleet manager" => "fleetmanager"
    const normalizedRole = userRole.toLowerCase().replace(/\s+/g, "");

    switch (normalizedRole) {
      case "callcentre":
        return baseActions.filter(
          (a) =>
            a.action.toLowerCase().includes("callcenter") ||
            a.action.toLowerCase().includes("settings") ||
            a.action.toLowerCase().includes("technian")
        );

      case "fleetmanager":
        return baseActions.filter(
          (a) =>
            a.action.toLowerCase().includes("fleetmanager") ||
            a.action.toLowerCase().includes("settings") ||
            a.action.toLowerCase().includes("vehicles") ||
            a.action.toLowerCase().includes("drivers")
        );

      case "costcentre":
        return baseActions.filter(
          (a) =>
            a.action.toLowerCase().includes("ccenter") ||
            a.action.toLowerCase().includes("settings")
        );

      case "customer":
        return [
          {
            title: "Workshop Breakdown Vehicles",
            description: "View all vehicle breakdown",
            icon: Phone,
            action: "/exvehicles",
            color: "bg-orange-50 text-orange-600 hover:bg-orange-100",
          },
          {
            title: "Quote Management",
            description: "Edit the quotation your technician has",
            icon: FileText,
            action: "/workshopQoute",
            color: "bg-blue-50 text-blue-600 hover:bg-blue-100",
          },
          {
            title: "Technicians",
            description: "View and manage all the technicians",
            icon: User2,
            action: "/extechnicians",
            color: "bg-blue-50 text-blue-600 hover:bg-blue-100",
          },
        ];

      default:
        return baseActions;
    }
  }

  useEffect(() => {
    const supabase = createClient();
    let channel: any;
    let isMounted = true;

    async function fetchStats() {
      setLoading(true);
      setError(null);
      try {
        const data = await getDashboardStats();
        if (isMounted) setStats(data as any);
      } catch (err: any) {
        if (isMounted) setError("Failed to load dashboard stats");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchStats();

    // Helper to add a new activity event
    function addActivity(event: any, table: string) {
      const now = new Date();
      let type: RecentActivity["type"] = "completion";
      let title = "";
      let description = "";
      let status = "";
      if (table === "breakdowns") {
        type = "breakdown";
        title = `Breakdown ${event.new?.id || event.old?.id}`;
        description =
          event.new?.issue_description ||
          event.old?.issue_description ||
          "Breakdown event";
        status = event.new?.status || event.old?.status || "";
      } else if (table === "approvals") {
        type = "approval";
        title = `Approval ${event.new?.id || event.old?.id}`;
        description =
          event.new?.reason || event.old?.reason || "Approval event";
        status = event.new?.status || event.old?.status || "";
      } else if (table === "job_assignments") {
        type = "completion";
        title = `Job ${event.new?.id || event.old?.id}`;
        description =
          event.new?.description ||
          event.old?.description ||
          "Job assignment event";
        status = event.new?.status || event.old?.status || "";
      }
      setRecentActivity((prev) =>
        [
          {
            id: `${table}-${event.new?.id || event.old?.id}-${
              event.eventType
            }-${now.getTime()}`,
            type,
            title,
            description,
            timestamp: now.toLocaleString(),
            status,
          },
          ...prev,
        ].slice(0, 10)
      ); // Keep only the 10 most recent
    }

    // Subscribe to changes in all relevant tables and update recentActivity
    channel = supabase
      .channel("dashboard-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "breakdowns" },
        (payload) => {
          fetchStats();
          addActivity(payload, "breakdowns");
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "approvals" },
        (payload) => {
          fetchStats();
          addActivity(payload, "approvals");
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "technicians" },
        fetchStats
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "vehiclesc" },
        fetchStats
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "job_assignments" },
        (payload) => {
          fetchStats();
          addActivity(payload, "job_assignments");
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      if (channel) supabase.removeChannel(channel);
    };
  }, [router]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "breakdown":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "approval":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "completion":
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case "quotation":
        return <DollarSign className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "urgent":
        return <Badge className="bg-red-100 text-red-800">Urgent</Badge>;
      case "approved":
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case "completed":
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "call center":
        return "Call Center Operator";
      case "fleet manager":
        return "Fleet Manager";
      case "cost center":
        return "Cost Center Manager";
      case "customer":
        return "Customer";
      case "admin":
        return "Administrator";
      default:
        return "User";
    }
  };

  const normalizedRole = userRole.toLowerCase().replace(/\s+/g, "");
  const [activeTab, setActiveTab] = useState<string>("routing");

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
        {/* Top Tabs Navigation - placed above the header as requested */}
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
                className="px-4 py-2 text-sm font-medium rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white"
              >
                Financials
              </TabsTrigger>
              <TabsTrigger
                value="audit"
                className="px-4 py-2 text-sm font-medium rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white"
              >
                Audit
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="ml-4 text-right">{/* header moved into Overview tab */}</div>
        </div>

        {loading && <div>Loading stats...</div>}
        {error && <div className="text-red-500">{error}</div>}

        {/* Conditionally render the main views depending on the active tab */}
        {activeTab === "routing" ? (
          <div className="space-y-4">
            <div className="mb-4 flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Trip Routing</h2>
                <p className="text-muted-foreground">Monitor all trips with progress tracking and waypoints</p>
              </div>
              <Button 
                onClick={() => {
                  const global = globalContext
                  if (global?.t_api?.upsertTrip && global?.tripsDispatch) {
                    const sampleTrip = {
                      trip_id: 'TRP-' + Date.now(),
                      selectedClient: 'Sample Corp',
                      origin: 'New York',
                      destination: 'Boston',
                      status: 'on-trip',
                      cargo: 'Electronics',
                      cargo_weight: '2.5 tons'
                    }
                    global.t_api.upsertTrip(null, sampleTrip, global.tripsDispatch)
                  }
                }}
                variant="outline"
                size="sm"
              >
                Add Sample Trip
              </Button>
            </div>
            <RoutingSection />
          </div>

        ) : activeTab === "financials" ? (
          <div className="space-y-4">
            <FinancialsPanel />
          </div>

        ) : activeTab === "audit" ? (
          <div className="space-y-4">
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
                            <div className="flex items-center gap-2">
                              <span className={cn(
                                "px-3 py-1 rounded-full text-xs font-medium",
                                row.status?.toLowerCase() === "delivered" || row.status?.toLowerCase() === "complete" ? "bg-green-100 text-green-800" :
                                row.status?.toLowerCase() === "on trip" || row.status?.toLowerCase() === "in transit" ? "bg-blue-100 text-blue-800" :
                                row.status?.toLowerCase() === "pending" ? "bg-yellow-100 text-yellow-800" :
                                "bg-gray-100 text-gray-800"
                              )}>
                                {row.status}
                              </span>
                              <Button variant="ghost" size="sm" onClick={() => { setSelectedTrip(row); setSummaryOpen(true); }}>
                                <FileText className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => { setSelectedRouteTrip(row); setRouteViewOpen(true); }}>
                                <MapPin className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null }

        {/* Change Driver Modal */}
        <Dialog.Root open={changeDriverOpen} onOpenChange={setChangeDriverOpen}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
            <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl z-50 p-8 w-[80vw] max-w-4xl max-h-[85vh] overflow-y-auto">
              <Dialog.Title className="text-xl font-semibold mb-6 flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-gray-600" />
                  Change Driver Assignment
                </div>
                <Dialog.Close asChild>
                  <Button variant="ghost" size="sm">
                    <X className="h-4 w-4" />
                  </Button>
                </Dialog.Close>
              </Dialog.Title>
              <div className="space-y-2">
                {availableDrivers.map((driver) => (
                  <div key={driver.id} className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors" onClick={async () => {
                    const supabase = createClient()
                    const assignments = currentTripForChange.vehicleassignments || []
                    if (assignments.length > 0) {
                      assignments[0].drivers = [{ id: driver.id, name: `${driver.first_name} ${driver.surname}` }]
                      const { error } = await supabase.from('trips').update({ vehicleassignments: assignments }).eq('id', currentTripForChange.id)
                      if (!error) {
                        setChangeDriverOpen(false)
                      }
                    }
                  }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <User className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">{driver.first_name} {driver.surname}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            {driver.license_number && <span>License: {driver.license_number}</span>}
                            {driver.phone_number && <span>Phone: {driver.phone_number}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">Click to select</div>
                    </div>
                  </div>
                ))}
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>

        {/* Load Modal */}
        <Dialog.Root open={loadOpen} onOpenChange={setLoadOpen}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
            <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg z-50 p-6 w-96">
              <Dialog.Title className="text-lg font-semibold mb-4 flex items-center justify-between">
                Load Information
                <Dialog.Close asChild>
                  <Button variant="ghost" size="sm">
                    <X className="h-4 w-4" />
                  </Button>
                </Dialog.Close>
              </Dialog.Title>
              {loadData && (
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-blue-800 mb-2">Cargo Description</p>
                    <p className="text-lg font-semibold text-blue-900">{loadData.cargo || 'No cargo information'}</p>
                  </div>
                  {loadData.cargo_weight && (
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-green-800 mb-2">Weight</p>
                      <p className="text-lg font-semibold text-green-900">{loadData.cargo_weight}</p>
                    </div>
                  )}
                  {loadData.rate && (
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-purple-800 mb-2">Rate</p>
                      <p className="text-lg font-semibold text-purple-900">{loadData.rate}</p>
                    </div>
                  )}
                </div>
              )}
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>

        {/* Map Modal */}
        <Dialog.Root open={mapOpen} onOpenChange={setMapOpen}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
            <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg z-50 p-6 w-[95vw] max-w-7xl h-[90vh] overflow-y-auto">
              <Dialog.Title className="text-lg font-semibold mb-4 flex items-center justify-between">
                Vehicle Location
                <Dialog.Close asChild>
                  <Button variant="ghost" size="sm">
                    <X className="h-4 w-4" />
                  </Button>
                </Dialog.Close>
              </Dialog.Title>
              {mapData && (
                <div className="flex gap-4 h-full relative">
                  <div id="map-loading" className="absolute inset-0 bg-white/90 z-50 flex items-center justify-center rounded-lg">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-600 font-medium">Loading route...</p>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm" style={{width: '280px'}}>
                    <h3 className="font-semibold mb-3 text-gray-800">Driver Information</h3>
                    {mapData.driverDetails && (
                      <div className="space-y-3 text-sm mb-4">
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
                            <span className="font-medium">{parseFloat(mapData.driverDetails.mileage).toLocaleString()} km</span>
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
                    <h4 className="font-semibold mb-2 text-gray-800">Map Legend</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                        <span>Start Point</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                        <span>End Point</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
                        <span>Current Location</span>
                      </div>
                    </div>
                  </div>
                  <div 
                    id="map" 
                    className="flex-1 h-[500px] rounded border"
                    ref={(el) => {
                      if (el && mapData) {
                        // Clear container first
                        el.innerHTML = ''
                        
                        const script = document.createElement('script')
                        script.src = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js'
                        script.onload = () => {
                          const link = document.createElement('link')
                          link.href = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css'
                          link.rel = 'stylesheet'
                          document.head.appendChild(link)
                          
                          // @ts-ignore
                          if (window.mapboxgl) {
                            window.mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
                            // @ts-ignore
                            const map = new window.mapboxgl.Map({
                            container: el,
                            style: 'mapbox://styles/mapbox/streets-v12',
                            center: [parseFloat(mapData.longitude), parseFloat(mapData.latitude)],
                            zoom: 10
                          })
                          
                          map.on('load', async () => {
                            // Hide loading overlay once map starts loading routes
                            const loadingEl = document.getElementById('map-loading')
                            if (loadingEl) loadingEl.style.display = 'none'
                            // Driver location marker
                            const vehicleEl = document.createElement('div')
                            vehicleEl.innerHTML = '🚛'
                            vehicleEl.style.cssText = `
                              font-size: 20px; width: 30px; height: 30px;
                              display: flex; align-items: center; justify-content: center;
                              background: #3b82f6; border: 2px solid #fff;
                              border-radius: 50%; animation: pulse 2s infinite;
                            `
                            
                            const style = document.createElement('style')
                            style.textContent = `@keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); } 70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); } 100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); } }`
                            document.head.appendChild(style)
                            
                            // @ts-ignore
                            const vehicleMarker = new window.mapboxgl.Marker(vehicleEl)
                              .setLngLat([parseFloat(mapData.longitude), parseFloat(mapData.latitude)])
                              .addTo(map)
                            
                            // Add popup with driver details
                            if (mapData.driverDetails) {
                              const popup = new window.mapboxgl.Popup({ offset: 25 })
                                .setHTML(`
                                  <div class="p-3">
                                    <div class="font-bold text-blue-900 mb-2">${mapData.driverDetails.fullName}</div>
                                    <div class="text-sm space-y-1">
                                      <div><strong>Vehicle:</strong> ${mapData.driverDetails.plate}</div>
                                      <div><strong>Speed:</strong> ${mapData.driverDetails.speed} km/h</div>
                                      <div><strong>Company:</strong> ${mapData.driverDetails.company}</div>
                                      <div class="text-xs text-gray-600 mt-2">
                                        Last updated: ${new Date(mapData.driverDetails.lastUpdate).toLocaleTimeString()}
                                      </div>
                                    </div>
                                  </div>
                                `)
                              vehicleMarker.setPopup(popup)
                            }
                            
                            // Single route: Driver location to destination
                            if (mapData.trip?.destination) {
                              const destRes = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(mapData.trip.destination)}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`)
                              const destData = await destRes.json()
                              
                              if (destData.features?.[0]) {
                                const destination = destData.features[0].center
                                const driverPos = [parseFloat(mapData.longitude), parseFloat(mapData.latitude)]
                                
                                // Try truck routing first, fallback to regular routing
                                let routeRes = await fetch(`https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${driverPos[0]},${driverPos[1]};${destination[0]},${destination[1]}?geometries=geojson&steps=true&exclude=ferry&weight=40000&height=4.2&width=2.5&length=18.75&access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`)
                                let routeData = await routeRes.json()
                                
                                // Fallback to regular driving if truck routing fails
                                if (!routeData.routes?.[0]) {
                                  routeRes = await fetch(`https://api.mapbox.com/directions/v5/mapbox/driving/${driverPos[0]},${driverPos[1]};${destination[0]},${destination[1]}?geometries=geojson&steps=true&access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`)
                                  routeData = await routeRes.json()
                                }
                                
                                if (routeData.routes?.[0]) {
                                  // Remove any existing route layers first
                                  if (map.getLayer('route-line')) map.removeLayer('route-line')
                                  if (map.getLayer('route-shadow')) map.removeLayer('route-shadow')
                                  if (map.getLayer('route-dash')) map.removeLayer('route-dash')
                                  if (map.getSource('route')) map.removeSource('route')
                                  
                                  map.addSource('driver-route', {
                                    type: 'geojson',
                                    data: {
                                      type: 'Feature',
                                      properties: {},
                                      geometry: routeData.routes[0].geometry
                                    }
                                  })
                                  
                                  map.addLayer({
                                    id: 'driver-route-line',
                                    type: 'line',
                                    source: 'driver-route',
                                    layout: { 'line-join': 'round', 'line-cap': 'round' },
                                    paint: { 'line-color': '#3b82f6', 'line-width': 8, 'line-opacity': 1.0 }
                                  })
                                  
                                  // Add destination marker
                                  const destEl = document.createElement('div')
                                  destEl.innerHTML = '📍'
                                  destEl.style.cssText = `
                                    font-size: 16px; width: 24px; height: 24px;
                                    display: flex; align-items: center; justify-content: center;
                                    background: #ef4444; border: 2px solid #fff;
                                    border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                                  `
                                  
                                  new window.mapboxgl.Marker(destEl)
                                    .setLngLat(destination)
                                    .addTo(map)
                                  
                                  // ETA display
                                  const etaBox = document.createElement('div')
                                  etaBox.style.cssText = `
                                    position: absolute; top: 10px; right: 10px; z-index: 1000;
                                    background: rgba(0,0,0,0.85); color: white; padding: 12px;
                                    border-radius: 8px; font-size: 14px; font-weight: 500;
                                    box-shadow: 0 4px 12px rgba(0,0,0,0.3); min-width: 200px;
                                  `
                                  const duration = routeData.routes[0].duration
                                  const distance = routeData.routes[0].distance
                                  const eta = new Date(Date.now() + duration * 1000).toLocaleTimeString()
                                  
                                  etaBox.innerHTML = `
                                    <div style="margin-bottom: 4px; font-weight: bold; color: #3b82f6;">🕒 ETA: ${eta}</div>
                                    <div style="margin-bottom: 4px;">📍 ${(distance/1000).toFixed(1)} km</div>
                                    <div>⏱️ ${Math.round(duration/60)} min</div>
                                  `
                                  el.appendChild(etaBox)
                                }
                              }
                            }
                            
                            // Hide loading overlay after all routes are processed
                            const loadingOverlay = document.getElementById('map-loading')
                            if (loadingOverlay) loadingOverlay.style.display = 'none'
                            
                            // Display stored route if available
                            const routeData = mapData.trip?.routeData?.route_data
                            if (routeData?.geometry?.coordinates) {
                              map.addSource('stored-route', {
                                type: 'geojson',
                                data: {
                                  type: 'Feature',
                                  properties: {},
                                  geometry: routeData.geometry
                                }
                              })
                              
                              map.addLayer({
                                id: 'stored-route-line',
                                type: 'line',
                                source: 'stored-route',
                                layout: { 'line-join': 'round', 'line-cap': 'round' },
                                paint: { 'line-color': '#ef4444', 'line-width': 6, 'line-opacity': 0.8 }
                              })
                              

                            }
                            
                            if (mapData.trip?.origin && mapData.trip?.destination) {
                              try {
                                const [originRes, destRes] = await Promise.all([
                                  fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(mapData.trip.origin)}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`),
                                  fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(mapData.trip.destination)}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`)
                                ])
                                
                                const [originData, destData] = await Promise.all([originRes.json(), destRes.json()])
                                
                                if (originData.features?.[0] && destData.features?.[0]) {
                                  const origin = originData.features[0].center
                                  const destination = destData.features[0].center
                                  const vehiclePos = [parseFloat(mapData.longitude), parseFloat(mapData.latitude)]
                                  
                                  const originEl = document.createElement('div')
                                  originEl.innerHTML = '🏁'
                                  originEl.style.cssText = `
                                    font-size: 16px; width: 24px; height: 24px;
                                    display: flex; align-items: center; justify-content: center;
                                    background: #22c55e; border: 2px solid #fff;
                                    border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                                  `
                                  
                                  // @ts-ignore
                                  new window.mapboxgl.Marker(originEl)
                                    .setLngLat(origin)
                                    .addTo(map)
                                  
                                  const destEl = document.createElement('div')
                                  destEl.innerHTML = '📍'
                                  destEl.style.cssText = `
                                    font-size: 16px; width: 24px; height: 24px;
                                    display: flex; align-items: center; justify-content: center;
                                    background: #ef4444; border: 2px solid #fff;
                                    border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                                  `
                                  
                                  // @ts-ignore
                                  new window.mapboxgl.Marker(destEl)
                                    .setLngLat(destination)
                                    .addTo(map)
                                  
                                  // Try truck routing first, fallback to regular routing
                                  let [routeRes, vehicleToStartRes, vehicleToDestRes, truckRouteRes] = await Promise.all([
                                    fetch(`https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${origin[0]},${origin[1]};${destination[0]},${destination[1]}?geometries=geojson&steps=true&exclude=ferry&weight=40000&height=4.2&width=2.5&length=18.75&access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`),
                                    fetch(`https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${vehiclePos[0]},${vehiclePos[1]};${origin[0]},${origin[1]}?geometries=geojson&steps=true&exclude=ferry&weight=40000&height=4.2&width=2.5&length=18.75&access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`),
                                    fetch(`https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${vehiclePos[0]},${vehiclePos[1]};${destination[0]},${destination[1]}?geometries=geojson&steps=true&exclude=ferry&weight=40000&height=4.2&width=2.5&length=18.75&access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`),
                                    fetch(`https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${origin[0]},${origin[1]};${destination[0]},${destination[1]}?geometries=geojson&steps=true&exclude=ferry&weight=40000&height=4.2&width=2.5&length=18.75&access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`)
                                  ])
                                  
                                  let [routeData, vehicleToStartData, vehicleToDestData, truckRouteData] = await Promise.all([routeRes.json(), vehicleToStartRes.json(), vehicleToDestRes.json(), truckRouteRes.json()])
                                  
                                  // Fallback to regular driving if any truck routing fails
                                  if (!routeData.routes?.[0] || !vehicleToStartData.routes?.[0] || !vehicleToDestData.routes?.[0] || !truckRouteData.routes?.[0]) {
                                    [routeRes, vehicleToStartRes, vehicleToDestRes, truckRouteRes] = await Promise.all([
                                      fetch(`https://api.mapbox.com/directions/v5/mapbox/driving/${origin[0]},${origin[1]};${destination[0]},${destination[1]}?geometries=geojson&steps=true&access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`),
                                      fetch(`https://api.mapbox.com/directions/v5/mapbox/driving/${vehiclePos[0]},${vehiclePos[1]};${origin[0]},${origin[1]}?geometries=geojson&steps=true&access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`),
                                      fetch(`https://api.mapbox.com/directions/v5/mapbox/driving/${vehiclePos[0]},${vehiclePos[1]};${destination[0]},${destination[1]}?geometries=geojson&steps=true&access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`),
                                      fetch(`https://api.mapbox.com/directions/v5/mapbox/driving/${origin[0]},${origin[1]};${destination[0]},${destination[1]}?geometries=geojson&steps=true&access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`)
                                    ])
                                    ;[routeData, vehicleToStartData, vehicleToDestData, truckRouteData] = await Promise.all([routeRes.json(), vehicleToStartRes.json(), vehicleToDestRes.json(), truckRouteRes.json()])
                                  }
                                  

                                  
                                  if (routeData.routes?.[0]) {
                                    const toStartDuration = vehicleToStartData.routes?.[0]?.duration || 0
                                    const toStartDistance = vehicleToStartData.routes?.[0]?.distance || 0
                                    const toStartEta = new Date(Date.now() + toStartDuration * 1000).toLocaleTimeString()
                                    
                                    const toDestDuration = vehicleToDestData.routes?.[0]?.duration || 0
                                    const toDestDistance = vehicleToDestData.routes?.[0]?.distance || 0
                                    const toDestEta = new Date(Date.now() + toDestDuration * 1000).toLocaleTimeString()
                                    
                                    const truckDuration = truckRouteData.routes?.[0]?.duration || 0
                                    const truckDistance = truckRouteData.routes?.[0]?.distance || 0
                                    const truckEta = new Date(Date.now() + toStartDuration + truckDuration * 1000).toLocaleTimeString()
                                    map.addSource('route', {
                                      type: 'geojson',
                                      data: {
                                        type: 'Feature',
                                        properties: {},
                                        geometry: routeData.routes[0].geometry
                                      }
                                    })
                                    
                                    map.addLayer({
                                      id: 'route-shadow',
                                      type: 'line',
                                      source: 'route',
                                      layout: {
                                        'line-join': 'round',
                                        'line-cap': 'round'
                                      },
                                      paint: {
                                        'line-color': '#000000',
                                        'line-width': 10,
                                        'line-opacity': 0.2,
                                        'line-blur': 2
                                      }
                                    })
                                    
                                    map.addLayer({
                                      id: 'route-line',
                                      type: 'line',
                                      source: 'route',
                                      layout: {
                                        'line-join': 'round',
                                        'line-cap': 'round'
                                      },
                                      paint: {
                                        'line-color': '#6b7280',
                                        'line-width': 6,
                                        'line-opacity': 0.6
                                      }
                                    })
                                    
                                    // Truck-optimized route
                                    if (truckRouteData.routes?.[0]) {
                                      map.addSource('truck-route', {
                                        type: 'geojson',
                                        data: {
                                          type: 'Feature',
                                          properties: {},
                                          geometry: truckRouteData.routes[0].geometry
                                        }
                                      })
                                      
                                      map.addLayer({
                                        id: 'truck-route-line',
                                        type: 'line',
                                        source: 'truck-route',
                                        layout: { 'line-join': 'round', 'line-cap': 'round' },
                                        paint: { 'line-color': '#22c55e', 'line-width': 8, 'line-opacity': 0.9 }
                                      })
                                    }
                                    
                                    map.addLayer({
                                      id: 'route-dash',
                                      type: 'line',
                                      source: 'route',
                                      layout: {
                                        'line-join': 'round',
                                        'line-cap': 'round'
                                      },
                                      paint: {
                                        'line-color': '#ffffff',
                                        'line-width': 6,
                                        'line-dasharray': [0, 4, 3],
                                        'line-opacity': 0.8
                                      }
                                    })
                                    
                                    // Vehicle to start point route
                                    if (vehicleToStartData.routes?.[0]) {
                                      map.addSource('vehicle-to-start', {
                                        type: 'geojson',
                                        data: {
                                          type: 'Feature',
                                          properties: {},
                                          geometry: vehicleToStartData.routes[0].geometry
                                        }
                                      })
                                      
                                      map.addLayer({
                                        id: 'vehicle-to-start-line',
                                        type: 'line',
                                        source: 'vehicle-to-start',
                                        layout: { 'line-join': 'round', 'line-cap': 'round' },
                                        paint: { 'line-color': '#f59e0b', 'line-width': 5, 'line-opacity': 0.8 }
                                      })
                                    }
                                    
                                    // Vehicle to destination route
                                    if (vehicleToDestData.routes?.[0]) {
                                      map.addSource('vehicle-to-dest', {
                                        type: 'geojson',
                                        data: {
                                          type: 'Feature',
                                          properties: {},
                                          geometry: vehicleToDestData.routes[0].geometry
                                        }
                                      })
                                      
                                      map.addLayer({
                                        id: 'vehicle-to-dest-line',
                                        type: 'line',
                                        source: 'vehicle-to-dest',
                                        layout: { 'line-join': 'round', 'line-cap': 'round' },
                                        paint: { 'line-color': '#ef4444', 'line-width': 4, 'line-opacity': 0.7, 'line-dasharray': [3, 3] }
                                      })
                                    }
                                    
                                    // ETA display
                                    const etaBox = document.createElement('div')
                                    etaBox.style.cssText = `
                                      position: absolute; top: 10px; right: 10px; z-index: 1000;
                                      background: rgba(0,0,0,0.85); color: white; padding: 12px;
                                      border-radius: 8px; font-size: 13px; font-weight: 500;
                                      box-shadow: 0 4px 12px rgba(0,0,0,0.3); min-width: 200px;
                                    `
                                    etaBox.innerHTML = `
                                      <div style="margin-bottom: 4px; font-weight: bold; color: #3b82f6;">🕒 ETA: ${toDestEta}</div>
                                      <div style="margin-bottom: 4px;">📍 ${(toDestDistance/1000).toFixed(1)} km</div>
                                      <div>⏱️ ${Math.round(toDestDuration/60)} min</div>
                                    `
                                    el.appendChild(etaBox)
                                    

                                    
                                    let dashArraySequence = [[0, 4, 3], [0.5, 4, 2.5], [1, 4, 2], [1.5, 4, 1.5], [2, 4, 1], [2.5, 4, 0.5], [3, 4, 0], [0, 0.5, 3, 3.5], [0, 1, 3, 3], [0, 1.5, 3, 2.5], [0, 2, 3, 2], [0, 2.5, 3, 1.5], [0, 3, 3, 1], [0, 3.5, 3, 0.5]]
                                    let step = 0
                                    function animateDashArray() {
                                      const newStep = parseInt(((Date.now() / 100) % dashArraySequence.length).toString())
                                      if (newStep !== step) {
                                        map.setPaintProperty('route-dash', 'line-dasharray', dashArraySequence[step])
                                        step = (step + 1) % dashArraySequence.length
                                      }
                                      requestAnimationFrame(animateDashArray)
                                    }
                                    animateDashArray()
                                    
                                    // @ts-ignore
                                    const bounds = new window.mapboxgl.LngLatBounds()
                                    const vehicleLng = parseFloat(mapData.longitude)
                                    const vehicleLat = parseFloat(mapData.latitude)
                                    
                                    if (!isNaN(vehicleLng) && !isNaN(vehicleLat)) {
                                      bounds.extend([vehicleLng, vehicleLat])
                                    }
                                    if (origin && origin.length === 2) {
                                      bounds.extend(origin)
                                    }
                                    if (destination && destination.length === 2) {
                                      bounds.extend(destination)
                                    }
                                    

                                  }
                                }
                              } catch (err) {
                                console.error('Error creating route:', err)
                              }
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
              )}
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>

        {/* Summary Modal */}
        <Dialog.Root open={summaryOpen} onOpenChange={setSummaryOpen}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
            <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] max-h-[90vh] bg-white rounded-lg shadow-lg z-50 overflow-y-auto">
              <div className="border-b pb-4 p-6">
                <Dialog.Title className="text-2xl font-bold text-gray-900">Trip Summary Report</Dialog.Title>
                <p className="text-sm text-gray-600 mt-1">Client: {selectedTrip?.client} | Route: {selectedTrip?.pickup} → {selectedTrip?.dropOff}</p>
                <Dialog.Close asChild>
                  <Button variant="ghost" size="sm" className="absolute top-4 right-4">
                    <X className="h-4 w-4" />
                  </Button>
                </Dialog.Close>
              </div>
              <div className="space-y-6 p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                    <CardContent className="p-4 text-center">
                      <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <p className="text-sm font-medium text-green-800">On Time Departure</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
                    <CardContent className="p-4 text-center">
                      <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                      <p className="text-sm font-medium text-red-800">Late Return</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
                    <CardContent className="p-4 text-center">
                      <Clock className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                      <p className="text-sm font-medium text-yellow-800">Duration Exceeded</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="p-4 text-center">
                      <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <p className="text-sm font-medium text-blue-800">Distance Variance</p>
                    </CardContent>
                  </Card>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="shadow-sm">
                    <CardHeader className="bg-gray-50 border-b">
                      <CardTitle className="text-lg font-semibold text-gray-800">Performance Metrics</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50">
                            <TableHead className="font-semibold text-gray-700">Metric</TableHead>
                            <TableHead className="text-center font-semibold text-gray-700">Planned</TableHead>
                            <TableHead className="text-center font-semibold text-gray-700">Actual</TableHead>
                            <TableHead className="text-center font-semibold text-gray-700">Variance</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {summaryData.metrics.map((metric, index) => (
                            <TableRow key={index} className="hover:bg-gray-50">
                              <TableCell className="font-medium text-gray-800">{metric.label}</TableCell>
                              <TableCell className="text-center text-gray-600">{metric.planned}</TableCell>
                              <TableCell className="text-center text-gray-600">{metric.actual}</TableCell>
                              <TableCell className="text-center">
                                <Badge className={cn(
                                  "font-medium",
                                  metric.variance.startsWith("+") 
                                    ? "bg-red-100 text-red-800 hover:bg-red-100" 
                                    : "bg-green-100 text-green-800 hover:bg-green-100"
                                )}>
                                  {metric.variance}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                  <Card className="shadow-sm">
                    <CardHeader className="bg-gray-50 border-b">
                      <CardTitle className="text-lg font-semibold text-gray-800">Trip Details</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Client:</span>
                          <span className="font-medium">{selectedTrip?.client}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Commodity:</span>
                          <span className="font-medium">{selectedTrip?.commodity}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Rate:</span>
                          <span className="font-medium">{selectedTrip?.rate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status:</span>
                          <span className="font-medium">{selectedTrip?.status}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Pickup:</span>
                          <span className="font-medium text-right max-w-48 truncate" title={selectedTrip?.pickup}>{selectedTrip?.pickup}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Drop Off:</span>
                          <span className="font-medium text-right max-w-48 truncate" title={selectedTrip?.dropOff}>{selectedTrip?.dropOff}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>

        {/* Note Modal */}
        <Dialog.Root open={noteOpen} onOpenChange={setNoteOpen}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
            <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg z-50 p-6 w-96">
              <Dialog.Title className="text-lg font-semibold mb-4 flex items-center justify-between">
                Add Trip Note
                <Dialog.Close asChild>
                  <Button variant="ghost" size="sm">
                    <X className="h-4 w-4" />
                  </Button>
                </Dialog.Close>
              </Dialog.Title>
              <div className="space-y-4">
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Enter note for this trip..."
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={4}
                />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setNoteOpen(false)}>Cancel</Button>
                  <Button onClick={async () => {
                    if (!currentTripForNote) return
                    try {
                      const supabase = createClient()
                      const { error } = await supabase.from('trips').update({ status_notes: noteText }).eq('id', currentTripForNote.id)
                      if (error) throw error
                      setNoteOpen(false)
                      setNoteText('')
                    } catch (err) {
                      console.error('Failed to save note:', err)
                      alert('Failed to save note')
                    }
                  }}>Save Note</Button>
                </div>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>

        {/* DateTime Picker Modal */}
        <Dialog.Root open={dateTimeOpen} onOpenChange={setDateTimeOpen}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
            <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg z-50 p-6 w-80">
              <Dialog.Title className="text-lg font-semibold mb-4">
                Set {dateTimeType === 'pickup' ? 'Pickup' : 'Dropoff'} Time
              </Dialog.Title>
              <div className="space-y-4">
                <input
                  type="datetime-local"
                  value={selectedDateTime}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onChange={(e) => setSelectedDateTime(e.target.value)}
                />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setDateTimeOpen(false)}>Cancel</Button>
                  <Button onClick={handleDateTimeSubmit} disabled={!selectedDateTime}>Submit</Button>
                </div>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>

        {/* Route View Modal */}
        <Dialog.Root open={routeViewOpen} onOpenChange={setRouteViewOpen}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
            <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg z-50 p-6 w-[95vw] max-w-7xl h-[90vh] overflow-y-auto">
              <Dialog.Title className="text-lg font-semibold mb-4 flex items-center justify-between">
                Route View - {selectedRouteTrip?.client}
                <Dialog.Close asChild>
                  <Button variant="ghost" size="sm">
                    <X className="h-4 w-4" />
                  </Button>
                </Dialog.Close>
              </Dialog.Title>
              {selectedRouteTrip && (
                <div className="h-full relative">
                  <div id="route-map-loading" className="absolute inset-0 bg-white/90 z-50 flex items-center justify-center rounded-lg">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-600 font-medium">Loading route map...</p>
                    </div>
                  </div>
                  <div 
                    id="route-map" 
                    className="w-full h-[500px] rounded border"
                    ref={(el) => {
                      if (el && selectedRouteTrip) {
                        el.innerHTML = ''
                        
                        const script = document.createElement('script')
                        script.src = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js'
                        script.onload = async () => {
                          const link = document.createElement('link')
                          link.href = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css'
                          link.rel = 'stylesheet'
                          document.head.appendChild(link)
                          
                          // @ts-ignore
                          if (window.mapboxgl) {
                            window.mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
                            
                            try {
                              const [originRes, destRes] = await Promise.all([
                                fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(selectedRouteTrip.pickup)}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`),
                                fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(selectedRouteTrip.dropOff)}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`)
                              ])
                              
                              const [originData, destData] = await Promise.all([originRes.json(), destRes.json()])
                              
                              if (originData.features?.[0] && destData.features?.[0]) {
                                const origin = originData.features[0].center
                                const destination = destData.features[0].center
                                
                                // @ts-ignore
                                const map = new window.mapboxgl.Map({
                                  container: el,
                                  style: 'mapbox://styles/mapbox/streets-v12',
                                  center: [(origin[0] + destination[0]) / 2, (origin[1] + destination[1]) / 2],
                                  zoom: 8
                                })
                                
                                map.on('load', async () => {
                                  // Single fetch - no re-rendering
                                  try {
                                    // Try truck-optimized route first
                                    let routeRes = await fetch(`https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${origin[0]},${origin[1]};${destination[0]},${destination[1]}?geometries=geojson&steps=true&exclude=ferry&weight=40000&height=4.2&width=2.5&length=18.75&access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`)
                                    let routeData = await routeRes.json()
                                    
                                    // Fallback to regular driving if truck routing fails
                                    if (!routeData.routes?.[0]) {
                                      routeRes = await fetch(`https://api.mapbox.com/directions/v5/mapbox/driving/${origin[0]},${origin[1]};${destination[0]},${destination[1]}?geometries=geojson&steps=true&access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`)
                                      routeData = await routeRes.json()
                                    }
                                    
                                    // Hide loading overlay
                                    const loadingEl = document.getElementById('route-map-loading')
                                    if (loadingEl) loadingEl.style.display = 'none'
                                    
                                    if (routeData.routes?.[0]) {
                                      // Add route line first
                                      map.addSource('route', {
                                        type: 'geojson',
                                        data: {
                                          type: 'Feature',
                                          properties: {},
                                          geometry: routeData.routes[0].geometry
                                        }
                                      })
                                      
                                      // Route shadow for depth
                                      map.addLayer({
                                        id: 'route-shadow',
                                        type: 'line',
                                        source: 'route',
                                        layout: { 'line-join': 'round', 'line-cap': 'round' },
                                        paint: { 'line-color': '#000000', 'line-width': 8, 'line-opacity': 0.2, 'line-blur': 2 }
                                      })
                                      
                                      // Main route line
                                      map.addLayer({
                                        id: 'route-line',
                                        type: 'line',
                                        source: 'route',
                                        layout: { 'line-join': 'round', 'line-cap': 'round' },
                                        paint: { 'line-color': '#3b82f6', 'line-width': 6, 'line-opacity': 0.9 }
                                      })
                                      
                                      // Fit map to route bounds
                                      // @ts-ignore
                                      const bounds = new window.mapboxgl.LngLatBounds()
                                      routeData.routes[0].geometry.coordinates.forEach((coord: number[]) => {
                                        bounds.extend(coord)
                                      })
                                      map.fitBounds(bounds, { padding: 50 })
                                    } else {
                                      // If no route found, still fit bounds to markers
                                      // @ts-ignore
                                      const bounds = new window.mapboxgl.LngLatBounds()
                                      bounds.extend(origin)
                                      bounds.extend(destination)
                                      map.fitBounds(bounds, { padding: 100 })
                                    }
                                    
                                    // Add origin marker
                                    const originEl = document.createElement('div')
                                    originEl.innerHTML = '🏁'
                                    originEl.style.cssText = `
                                      font-size: 20px; width: 30px; height: 30px;
                                      display: flex; align-items: center; justify-content: center;
                                      background: #22c55e; border: 2px solid #fff;
                                      border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                                    `
                                    
                                    // @ts-ignore
                                    new window.mapboxgl.Marker(originEl)
                                      .setLngLat(origin)
                                      .addTo(map)
                                    
                                    // Add destination marker
                                    const destEl = document.createElement('div')
                                    destEl.innerHTML = '📍'
                                    destEl.style.cssText = `
                                      font-size: 20px; width: 30px; height: 30px;
                                      display: flex; align-items: center; justify-content: center;
                                      background: #ef4444; border: 2px solid #fff;
                                      border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                                    `
                                    
                                    // @ts-ignore
                                    new window.mapboxgl.Marker(destEl)
                                      .setLngLat(destination)
                                      .addTo(map)
                                    
                                    // Route info overlay - single fetch data
                                    if (routeData.routes?.[0]) {
                                      const duration = routeData.routes[0].duration
                                      const distance = routeData.routes[0].distance
                                      
                                      const infoBox = document.createElement('div')
                                      infoBox.style.cssText = `
                                        position: absolute; top: 10px; right: 10px; z-index: 1000;
                                        background: rgba(0,0,0,0.85); color: white; padding: 12px;
                                        border-radius: 8px; font-size: 14px; font-weight: 500;
                                        box-shadow: 0 4px 12px rgba(0,0,0,0.3); min-width: 200px;
                                      `
                                      infoBox.innerHTML = `
                                        <div style="margin-bottom: 6px; font-weight: bold; color: #3b82f6;">🚛 Route Path</div>
                                        <div style="margin-bottom: 4px;">📍 Distance: ${(distance/1000).toFixed(1)} km</div>
                                        <div style="margin-bottom: 4px;">⏱️ Duration: ${Math.round(duration/60)} min</div>
                                        <div style="font-size: 12px; color: #94a3b8;">Pickup to dropoff route</div>
                                      `
                                      el.appendChild(infoBox)
                                    } else {
                                      // Show message if no route could be calculated
                                      const infoBox = document.createElement('div')
                                      infoBox.style.cssText = `
                                        position: absolute; top: 10px; right: 10px; z-index: 1000;
                                        background: rgba(239, 68, 68, 0.9); color: white; padding: 12px;
                                        border-radius: 8px; font-size: 14px; font-weight: 500;
                                        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                                      `
                                      infoBox.innerHTML = `
                                        <div style="margin-bottom: 4px; font-weight: bold;">⚠️ Route Unavailable</div>
                                        <div style="font-size: 12px;">Could not calculate route path</div>
                                      `
                                      el.appendChild(infoBox)
                                    }
                                    
                                  } catch (err) {
                                    console.error('Error loading route:', err)
                                    const loadingEl = document.getElementById('route-map-loading')
                                    if (loadingEl) {
                                      loadingEl.innerHTML = '<div class="text-red-600 text-center"><div class="text-lg mb-2">⚠️</div><div>Error loading route</div></div>'
                                    }
                                    
                                    // Still show markers even if route fails
                                    // @ts-ignore
                                    const bounds = new window.mapboxgl.LngLatBounds()
                                    bounds.extend(origin)
                                    bounds.extend(destination)
                                    map.fitBounds(bounds, { padding: 100 })
                                  }
                                })
                              }
                            } catch (err) {
                              console.error('Error loading route:', err)
                              const loadingEl = document.getElementById('route-map-loading')
                              if (loadingEl) {
                                loadingEl.innerHTML = '<div class="text-red-600 text-center p-4"><div class="text-lg mb-2">⚠️</div><div>Unable to load map or geocode addresses</div></div>'
                              }
                            }
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
              )}
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>

      </div>
    </>
  );
}
