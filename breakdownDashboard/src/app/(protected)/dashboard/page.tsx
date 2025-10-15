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
import ExecutiveDashboard from "@/components/dashboard/ExecutiveDashboard";

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
  const [changeVehicleOpen, setChangeVehicleOpen] = useState(false);
  const [currentTripForChange, setCurrentTripForChange] = useState<any>(null);
  const [availableVehicles, setAvailableVehicles] = useState<any[]>([]);

  const handleViewMap = async (driverName: string, trip?: any) => {
    try {
      const response = await fetch('http://64.227.138.235:3000/api/eps-vehicles')
      const vehicles = await response.json()
      
      const vehicle = vehicles.find((v: any) => 
        v.driver_name?.toLowerCase().includes(driverName.toLowerCase()) ||
        driverName.toLowerCase().includes(v.driver_name?.toLowerCase())
      )
      
      if (vehicle) {
        setMapData({ ...vehicle, trip })
        setMapOpen(true)
      } else {
        alert(`Vehicle location not found for driver: ${driverName}`)
      }
    } catch (err) {
      console.error('Error fetching vehicle data:', err)
      alert('Failed to fetch vehicle location')
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
      // Refresh the trips list
      window.location.reload()
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
        } finally {
          setLoading(false)
        }
      }

      fetchAssignmentInfo()
    }, [trip.vehicleassignments, trip.vehicle_assignments])

    const driverName = driverInfo ? `${driverInfo.first_name} ${driverInfo.surname}`.trim() : 'Unassigned'
    const initials = driverName !== 'Unassigned' ? driverName.split(' ').map((s: string) => s[0]).slice(0,2).join('') : 'DR'

    return (
      <div className="bg-white border border-gray-100 rounded-md p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-700">
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
        <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2 truncate">
            <Car className="w-4 h-4 text-muted-foreground" />
            <span className="truncate">{vehicleInfo?.registration_number || vehicleInfo?.regNumber || '-'}</span>
          </div>
          <div>
            <span className={`px-2 py-0.5 rounded text-xs ${
              driverInfo?.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {driverInfo?.available ? 'Available' : 'Unavailable'}
            </span>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-1">
          <Button size="sm" variant="outline" onClick={() => handleViewMap(`${driverInfo?.first_name} ${driverInfo?.surname}`.trim(), trip)}>
            <MapPin className="w-3 h-3 mr-1" />Map
          </Button>
          <Button size="sm" variant="outline" onClick={() => { setLoadData(trip); setLoadOpen(true); }}>
            <FileText className="w-3 h-3 mr-1" />Load
          </Button>
          <Button size="sm" variant="outline" onClick={async () => {
            const supabase = createClient()
            const { data: vehicles } = await supabase.from('vehiclesc').select('*')
            setAvailableVehicles(vehicles || [])
            setCurrentTripForChange(trip)
            setChangeVehicleOpen(true)
          }}>
            <Truck className="w-3 h-3 mr-1" />Change
          </Button>
          <Button size="sm" variant="outline" onClick={() => alert('Change Trailer')}>
            <Truck className="w-3 h-3 mr-1" />Trailer
          </Button>
          <Button size="sm" variant="outline" onClick={() => alert('Add Note')}>
            <FileText className="w-3 h-3 mr-1" />Note
          </Button>
          <Button size="sm" variant="destructive" onClick={() => alert('Cancel Load')}>
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
    }, [])

    const tripsList = trips

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
        setTrips(prev => prev.map(t => t.id === trip.id ? { ...t, status: 'Delivered' } : t))
        window.alert('Trip marked as completed')
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

    return (
      <div className="space-y-4">
        {tripsList.map((trip: any) => {
          const waypoints = getWaypoints(trip)
          const progress = getTripProgress(trip.status)

          const clientDetails = typeof trip.clientdetails === 'string' ? JSON.parse(trip.clientdetails) : trip.clientdetails
          const title = clientDetails?.name || trip.selectedClient || trip.clientDetails?.name || `Trip ${trip.trip_id || trip.id}`
          const route = `${trip.origin || 'Start'} → ${trip.destination || 'End'}`

          return (
            <div key={trip.id || trip.trip_id} className="space-y-3">
              <Card className="p-4 rounded-lg shadow-sm">
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
        const { data: trips, error } = await supabase.from('trips').select('*')
        if (error) throw error
        
        const formattedData = (trips || []).map(trip => {
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
                value="executive"
                className="px-4 py-2 text-sm font-medium rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white"
              >
                Executive
              </TabsTrigger>

              <TabsTrigger
                value="fuel"
                className="px-4 py-2 text-sm font-medium rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white"
              >
                Fuel Can Bus
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
        ) : activeTab === "executive" ? (
          <div className="space-y-4">
            <ExecutiveDashboard />
          </div>
        ) : activeTab === "fuel" ? (
          <div className="space-y-4">
            <FuelCanBusDisplay />
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

        {/* Change Vehicle Modal */}
        <Dialog.Root open={changeVehicleOpen} onOpenChange={setChangeVehicleOpen}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
            <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl z-50 p-8 w-[80vw] max-w-4xl max-h-[85vh] overflow-y-auto">
              <Dialog.Title className="text-xl font-semibold mb-6 flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-gray-600" />
                  Change Vehicle Assignment
                </div>
                <Dialog.Close asChild>
                  <Button variant="ghost" size="sm">
                    <X className="h-4 w-4" />
                  </Button>
                </Dialog.Close>
              </Dialog.Title>
              <div className="space-y-2">
                {availableVehicles.map((vehicle) => (
                  <div key={vehicle.id} className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors" onClick={async () => {
                    const supabase = createClient()
                    const assignments = currentTripForChange.vehicleassignments || []
                    if (assignments.length > 0) {
                      assignments[0].vehicle = { id: vehicle.id, name: `${vehicle.make} ${vehicle.model} (${vehicle.registration_number})` }
                      const { error } = await supabase.from('trips').update({ vehicleassignments: assignments }).eq('id', currentTripForChange.id)
                      if (!error) {
                        setChangeVehicleOpen(false)
                        window.location.reload()
                      }
                    }
                  }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Truck className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">{vehicle.make} {vehicle.model}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>{vehicle.registration_number}</span>
                            {vehicle.year && <span>Year: {vehicle.year}</span>}
                            {vehicle.type && <span>{vehicle.type}</span>}
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
            <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg z-50 p-6 w-[90vw] max-w-4xl h-[80vh] overflow-y-auto">
              <Dialog.Title className="text-lg font-semibold mb-4 flex items-center justify-between">
                Vehicle Location
                <Dialog.Close asChild>
                  <Button variant="ghost" size="sm">
                    <X className="h-4 w-4" />
                  </Button>
                </Dialog.Close>
              </Dialog.Title>
              {mapData && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-xs text-blue-600 font-medium">DRIVER</p>
                      <p className="text-sm font-semibold text-blue-900">{mapData.driver_name}</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-xs text-green-600 font-medium">PLATE</p>
                      <p className="text-sm font-semibold text-green-900">{mapData.plate}</p>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <p className="text-xs text-purple-600 font-medium">SPEED</p>
                      <p className="text-sm font-semibold text-purple-900">{mapData.speed} km/h</p>
                    </div>
                    <div className="bg-orange-50 p-3 rounded-lg">
                      <p className="text-xs text-orange-600 font-medium">ENGINE</p>
                      <p className="text-sm font-semibold text-orange-900">{mapData.engine_status}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg col-span-2">
                      <p className="text-xs text-gray-600 font-medium">ADDRESS</p>
                      <p className="text-sm font-semibold text-gray-900">{mapData.address}</p>
                    </div>
                    <div className="bg-indigo-50 p-3 rounded-lg col-span-2">
                      <p className="text-xs text-indigo-600 font-medium">LAST UPDATE</p>
                      <p className="text-sm font-semibold text-indigo-900">{new Date(mapData.loc_time).toLocaleString()}</p>
                    </div>
                    {mapData.trip && (
                      <>
                        <div className="bg-emerald-50 p-3 rounded-lg">
                          <p className="text-xs text-emerald-600 font-medium">ORIGIN</p>
                          <p className="text-sm font-semibold text-emerald-900">{mapData.trip.origin}</p>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <p className="text-xs text-blue-600 font-medium">DESTINATION</p>
                          <p className="text-sm font-semibold text-blue-900">{mapData.trip.destination}</p>
                        </div>
                      </>
                    )}
                  </div>
                  <div 
                    id="map" 
                    className="w-full h-96 rounded border"
                    ref={(el) => {
                      if (el && mapData && !el.hasChildNodes()) {
                        const script = document.createElement('script')
                        script.src = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js'
                        script.onload = () => {
                          const link = document.createElement('link')
                          link.href = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css'
                          link.rel = 'stylesheet'
                          document.head.appendChild(link)
                          
                          // @ts-ignore
                          window.mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
                          // @ts-ignore
                          const map = new window.mapboxgl.Map({
                            container: el,
                            style: 'mapbox://styles/mapbox/satellite-streets-v12',
                            center: [parseFloat(mapData.longitude), parseFloat(mapData.latitude)],
                            zoom: 10
                          })
                          
                          map.on('load', async () => {
                            // Animated vehicle marker
                            const vehicleEl = document.createElement('div')
                            vehicleEl.style.cssText = `
                              width: 20px; height: 20px; background: #ef4444;
                              border: 3px solid #fff; border-radius: 50%;
                              box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.3);
                              animation: pulse 2s infinite;
                            `
                            
                            const style = document.createElement('style')
                            style.textContent = `@keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); } 70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); } 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); } }`
                            document.head.appendChild(style)
                            
                            // @ts-ignore
                            new window.mapboxgl.Marker(vehicleEl)
                              .setLngLat([parseFloat(mapData.longitude), parseFloat(mapData.latitude)])
                              .setPopup(new window.mapboxgl.Popup().setHTML(`<div><strong>${mapData.driver_name}</strong><br/>${mapData.plate}<br/>${mapData.speed} km/h</div>`))
                              .addTo(map)
                            
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
                                  
                                  const originEl = document.createElement('div')
                                  originEl.style.cssText = `width: 16px; height: 16px; background: #22c55e; border: 2px solid #fff; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.3);`
                                  
                                  // @ts-ignore
                                  new window.mapboxgl.Marker(originEl)
                                    .setLngLat(origin)
                                    .setPopup(new window.mapboxgl.Popup().setHTML(`<div><strong>Origin</strong><br/>${mapData.trip.origin}</div>`))
                                    .addTo(map)
                                  
                                  const destEl = document.createElement('div')
                                  destEl.style.cssText = `width: 16px; height: 16px; background: #3b82f6; border: 2px solid #fff; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.3);`
                                  
                                  // @ts-ignore
                                  new window.mapboxgl.Marker(destEl)
                                    .setLngLat(destination)
                                    .setPopup(new window.mapboxgl.Popup().setHTML(`<div><strong>Destination</strong><br/>${mapData.trip.destination}</div>`))
                                    .addTo(map)
                                  
                                  const [routeRes, vehicleRouteRes] = await Promise.all([
                                    fetch(`https://api.mapbox.com/directions/v5/mapbox/driving/${origin[0]},${origin[1]};${destination[0]},${destination[1]}?geometries=geojson&steps=true&access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`),
                                    fetch(`https://api.mapbox.com/directions/v5/mapbox/driving/${parseFloat(mapData.longitude)},${parseFloat(mapData.latitude)};${destination[0]},${destination[1]}?geometries=geojson&steps=true&access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`)
                                  ])
                                  
                                  const [routeData, vehicleRouteData] = await Promise.all([routeRes.json(), vehicleRouteRes.json()])
                                  
                                  if (routeData.routes?.[0]) {
                                    const duration = routeData.routes[0].duration
                                    const distance = routeData.routes[0].distance
                                    const eta = new Date(Date.now() + duration * 1000).toLocaleTimeString()
                                    
                                    const vehicleDuration = vehicleRouteData.routes?.[0]?.duration || 0
                                    const vehicleDistance = vehicleRouteData.routes?.[0]?.distance || 0
                                    const vehicleEta = new Date(Date.now() + vehicleDuration * 1000).toLocaleTimeString()
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
                                        'line-color': '#2563eb',
                                        'line-width': 8,
                                        'line-opacity': 0.9
                                      }
                                    })
                                    
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
                                    
                                    if (vehicleRouteData.routes?.[0]) {
                                      map.addSource('vehicle-route', {
                                        type: 'geojson',
                                        data: {
                                          type: 'Feature',
                                          properties: {},
                                          geometry: vehicleRouteData.routes[0].geometry
                                        }
                                      })
                                      
                                      map.addLayer({
                                        id: 'vehicle-route-line',
                                        type: 'line',
                                        source: 'vehicle-route',
                                        layout: {
                                          'line-join': 'round',
                                          'line-cap': 'round'
                                        },
                                        paint: {
                                          'line-color': '#ef4444',
                                          'line-width': 6,
                                          'line-opacity': 0.8
                                        }
                                      })
                                      
                                      map.addLayer({
                                        id: 'vehicle-route-dash',
                                        type: 'line',
                                        source: 'vehicle-route',
                                        layout: {
                                          'line-join': 'round',
                                          'line-cap': 'round'
                                        },
                                        paint: {
                                          'line-color': '#ffffff',
                                          'line-width': 4,
                                          'line-dasharray': [2, 2],
                                          'line-opacity': 0.9
                                        }
                                      })
                                    }
                                    
                                    const etaBox = document.createElement('div')
                                    etaBox.style.cssText = `
                                      position: absolute; top: 10px; right: 10px; z-index: 1000;
                                      background: rgba(0,0,0,0.8); color: white; padding: 12px;
                                      border-radius: 8px; font-size: 14px; font-weight: 500;
                                      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                                    `
                                    etaBox.innerHTML = `
                                      <div style="margin-bottom: 8px; font-weight: bold; color: #60a5fa;">Vehicle to Destination</div>
                                      <div style="margin-bottom: 4px;">🕒 ETA: ${vehicleEta}</div>
                                      <div style="margin-bottom: 4px;">📍 ${(vehicleDistance/1000).toFixed(1)} km</div>
                                      <div style="margin-bottom: 8px;">⏱️ ${Math.round(vehicleDuration/60)} min</div>
                                      <div style="margin-bottom: 4px; font-weight: bold; color: #22c55e;">Full Route</div>
                                      <div style="margin-bottom: 4px;">📍 ${(distance/1000).toFixed(1)} km</div>
                                      <div>⏱️ ${Math.round(duration/60)} min</div>
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
                                    bounds.extend([parseFloat(mapData.longitude), parseFloat(mapData.latitude)])
                                    bounds.extend(origin)
                                    bounds.extend(destination)
                                    map.fitBounds(bounds, { padding: 50 })
                                  }
                                }
                              } catch (err) {
                                console.error('Error creating route:', err)
                              }
                            }
                          })
                        }
                        document.head.appendChild(script)
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

      </div>
    </>
  );
}
