'use client'

// next
import { useEffect, useState } from 'react'

// components
import Loading from '@/components/ui/loading'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
// import TripMapView from '@/components/map/trip-map-view'
import MapView from '@/components/map/map-view'

// context
import { useAuth } from '@/context/auth-context/context'

import { FileText, Truck, User, MapPin, Building, Map } from 'lucide-react'

import { useGlobalContext } from '@/context/global-context/context'
import { isTokenExpired, forceRefreshToken } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'
import { auth } from '@/lib/client-db'
import { toast } from '@/hooks/use-toast'
import PageTitle from '@/components/layout/page-title'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import DetailCard from '@/components/ui/detail-card'
import CountUp from '@/components/ui/count-up'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import TripViewMap from '@/components/map/trip-view'

const Dashboard = () => {
  const { logout, getAuthToken, loading } = useAuth()
  const {
    dashboardState,
    handleDashboardState,
    dashboard_stats,
    onCreate,
    cost_centres,
    trips,
    vehicles,
    drivers,
    stop_points,
  } = useGlobalContext()
  const token = getAuthToken()
  const router = useRouter()

  const [currentTab, setCurrentTab] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const costCentres = cost_centres?.data || []

  // Handle select change
  // const handleSelectChange = (field, value) => {
  //   setDashboardState((prev) => ({
  //     ...prev,
  //     [field]: value,
  //   }))
  // }

  const handleTokenRefresh = async () => {
    setIsRefreshing(true)
    try {
      if (auth.currentUser) {
        await forceRefreshToken(auth.currentUser)
        toast({
          title: 'Session Refreshed',
          description: 'Your session has been successfully refreshed.',
          variant: 'default',
        })
      }
    } catch (error) {
      console.error('Error refreshing token:', error)
      toast({
        title: 'Refresh Failed',
        description: 'Failed to refresh session. Please sign in again.',
        variant: 'destructive',
      })
      logout(router)
    } finally {
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    const checkToken = async () => {
      if (!token) {
        logout(router)
        return
      }

      try {
        const tokenResult = await auth.currentUser?.getIdTokenResult()
        if (tokenResult) {
          const expired = isTokenExpired(tokenResult)
          if (expired) {
            // Show toast with option to refresh token
            toast({
              title: 'Session Expiring Soon',
              description:
                'Your session will expire soon. Would you like to continue?',
              variant: 'default',
              action: (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleTokenRefresh}
                    disabled={isRefreshing}
                  >
                    {isRefreshing ? 'Refreshing...' : 'Continue'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => logout(router)}
                  >
                    Sign Out
                  </Button>
                </div>
              ),
              duration: 10000, // Show for 10 seconds
            })
          }
        }
      } catch (error) {
        console.error('Error checking token:', error)
        logout(router)
      }
    }

    checkToken()
  }, [token, logout, router])

  const active_trips = trips?.data?.filter((t) => {
    if (dashboardState?.costCentre == 'All') {
      return t.status == 'in-progress'
    } else {
      return (
        t.costCentre == dashboardState?.costCentre && t.status == 'in-progress'
      )
    }
  })

  const active_vehicles = vehicles?.data?.filter((v) => {
    if (dashboardState.costCentre == 'All') {
      return v.status == 'on-trip'
    } else {
      return v.costCentre == dashboardState.costCentre && v.status == 'on-trip'
    }
  })

  const active_drivers = drivers?.data?.filter((d) => {
    if (dashboardState.costCentre == 'All') {
      return d.status == 'on-trip'
    } else {
      return d.costCentre == dashboardState.costCentre && d.status == 'on-trip'
    }
  })

  const stats = [
    {
      name: 'Active Trips',
      value: active_trips?.length || 0, //trips.screenStats.inProgress,
      icon: Map,
      color: 'text-blue-500',
      href: '/trips',
    },
    {
      name: 'Active Vehicles',
      value: active_vehicles?.length || 0, //vehicles.screenStats.available,
      icon: Truck,
      color: 'text-green-500',
      href: '/vehicles',
    },
    {
      name: 'Active Drivers',
      value: active_drivers.length || 0, //drivers.screenStats.active,
      icon: User,
      color: 'text-purple-500',
      href: '/drivers',
    },
    {
      name: 'Stop Points',
      value: stop_points?.data.length || 0, //stop_points.screenStats.total,
      icon: MapPin,
      color: 'text-amber-500',
      href: '/stop-points',
    },
    {
      name: 'Cost Centres',
      value: costCentres?.length || 0, //cost_centres.screenStats.total,
      icon: Building,
      color: 'text-indigo-500',
      href: '/cost-centres',
    },
  ]

  const formLinks = [
    { name: 'New Trip', href: 'trips', icon: FileText },
    { name: 'New Vehicle', href: 'vehicles', icon: Truck },
    { name: 'New Driver', href: 'drivers', icon: User },
    { name: 'New Stop Point', href: 'stop-points', icon: MapPin },
    { name: 'New Cost Centre', href: 'cost-centres', icon: Building },
  ]

  // console.log('active_trips :>> ', active_trips)

  const costCentre_inputs = [
    {
      type: 'select',
      htmlFor: 'costCentre',
      label: 'Cost Centre',
      placeholder: 'Select cost centre',
      value: dashboardState?.costCentre,

      options: costCentres?.map((cc) => {
        return { value: cc.id, label: cc.name }
      }),
    },
    // {
    //   type: 'select',
    //   htmlFor: 'period',
    //   label: 'Period',
    //   placeholder: 'Select time period',
    //   value: dashboardState.period,
    //   options: [
    //     { value: '7', label: 'Last 7 Days' },
    //     { value: '14', label: 'Last 14 Days' },
    //     { value: '30', label: 'Last 30 Days' },
    //     { value: 'last', label: 'Last Month' },
    //     { value: 'current', label: 'This Month' },
    //   ],
    // },
  ]

  const tabs = [
    { name: 'Trips Overview', value: 'trip' },
    { name: 'Vehicles Overview', value: 'vehicle' },
    { name: 'Drivers Overview', value: 'drivers' },
    { name: 'Stop Points Overview', value: 'stop_points' },
    { name: 'Cost Centres Overview', value: 'cost_centres' },
  ]

  return (
    <div>
      {loading ? (
        <Loading />
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-end gap-4">
            <PageTitle />

            <div className="flex gap-2">
              {costCentre_inputs?.map((input) => (
                <Select
                  key={input.value}
                  value={input.value}
                  onValueChange={(value) =>
                    handleDashboardState(input.htmlFor, value)
                  }
                  className="py-5 "
                >
                  <SelectTrigger
                    id={input.htmlFor}
                    // className="w-full border-[#d3d3d3]"
                    className="h-10 min-w-[150] rounded-md border border-input bg-white px-3 py-[19] text-sm ring-offset-background"
                  >
                    <SelectValue placeholder={input.placeholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {input?.htmlFor == 'costCentre' && (
                      <SelectItem value={'All'}>All</SelectItem>
                    )}
                    {input?.options?.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {dashboard_stats?.map((stat) => (
              <Card
                key={stat.name}
                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                onClick={() => router.push(stat.href)}
              >
                <CardHeader className="flex flex-row items-center h-full justify-between space-y-0 pb-2">
                  <CardTitle className="text-[10px] lg:text-[16px]  font-semibold">
                    {stat.name}
                  </CardTitle>
                  <stat.icon
                    className={`h-4 w-4 xl:h-7 xl:w-7 ${stat.color}`}
                  />
                  {/* <div>{stat.icon}</div> */}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    <CountUp value={stat.value} />
                  </div>
                  {/* <div
                    className={`p-2 rounded-full ${stat.color} bg-opacity-10 mb-4`}
                  >
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-sm text-muted-foreground">{stat.name}</p> */}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Access Forms */}
          <DetailCard
            title={'Quick Access'}
            description={'Create new entries in your fleet management system'}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {formLinks.map((link) => (
                <Button
                  key={link.name}
                  variant="outline"
                  className="h-auto py-4 flex flex-col items-center gap-2 bg-transparent"
                  onClick={() => onCreate(link.href)}
                >
                  <link.icon className="h-6 w-6" />
                  <span>{link.name}</span>
                </Button>
              ))}
            </div>
          </DetailCard>

          <Tabs
            defaultValue="trip"
            value={tabs[currentTab]?.value}
            onValueChange={(value) => {
              const index = tabs.findIndex((tab) => tab.value === value)
              setCurrentTab(index)
            }}
            className="w-full"
          >
            <TabsList className="grid grid-cols-5 w-full">
              {tabs.map((tab, index) => (
                <TabsTrigger
                  key={index}
                  tabIndex={currentTab}
                  value={tab.value}
                  onClick={() => {
                    setCurrentTab(index)
                  }}
                >
                  {tab.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Trip Map View */}
            <TabsContent value="trip" className="space-y-6">
              <DetailCard
                icon={<Map className="h-5 w-5" />}
                title={'Trip Map View'}
                description={
                  'Interactive map showing all active trips with real-time information'
                }
              >
                {/* <CardHeader>
                  <div className="flex items-center gap-2">
                    <Map className="h-5 w-5" />
                    <CardTitle>Trip Map View</CardTitle>
                  </div>
                
                </CardHeader> */}

                <TripViewMap trips={active_trips} />
              </DetailCard>
            </TabsContent>

            {/* Vehicles Overview */}
            <TabsContent value="vehicle" className="space-y-6">
              <DetailCard
                icon={<Truck className="h-5 w-5" />}
                title={'Vehicles Map View'}
                description={
                  'Overview of all vehicles with their current status and location'
                }
              >
                <MapView />
              </DetailCard>
            </TabsContent>
            <TabsContent value="drivers" className="space-y-6">
              <DetailCard
                icon={<User className="h-5 w-5" />}
                title={'Drivers Map View'}
                description={
                  'Overview of all drivers with their current status and assigned vehicles'
                }
              >
                <MapView />
              </DetailCard>
            </TabsContent>

            {/* Stop Points Overview */}
            <TabsContent value="stop_points" className="space-y-6">
              <DetailCard
                icon={<MapPin className="h-5 w-5" />}
                title={'Stop Points Map View'}
                description={
                  'Overview of all stop points with their current status and assigned trips'
                }
              >
                <MapView />
              </DetailCard>
            </TabsContent>

            {/* Cost Centres Overview */}
            <TabsContent value="cost_centres" className="space-y-6">
              <DetailCard
                icon={<Building className="h-5 w-5" />}
                title={'Cost Centres Overview'}
                description={
                  'Overview of all cost centres with their current status and assigned trips'
                }
              >
                <MapView />
              </DetailCard>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  )
}

export default Dashboard
