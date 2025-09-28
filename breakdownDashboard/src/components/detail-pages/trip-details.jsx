'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

// context
import { useGlobalContext } from '@/context/global-context/context'

// hooks
import { useToast } from '@/hooks/use-toast'
import { format, parseISO } from 'date-fns'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  Clipboard,
  FileText,
  MapPin,
  Package,
  Truck,
  User,
  DollarSign,
  MoreVertical,
  PlusCircle,
  RefreshCw,
  Edit,
} from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import DetailActionBar from '@/components/layout/detail-action-bar'
import { ProgressWithWaypoints } from '@/components/ui/progress-with-waypoints'
import DetailCard from '../ui/detail-card'
import { Separator } from '../ui/separator'
import DisplayMap from '../map/display-map'

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  try {
    return format(new Date(dateString), 'MMM d, yyyy')
  } catch (error) {
    return dateString
  }
}

// Helper function to format datetime
const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return 'N/A'
  try {
    return format(parseISO(dateTimeString), 'MMM d, yyyy h:mm a')
  } catch (error) {
    return dateTimeString
  }
}

// Status badge component
const StatusBadge = ({ status }) => {
  // Safety check for undefined or null status
  if (!status) {
    return (
      <Badge variant="secondary">
        <Clipboard className="h-3.5 w-3.5 mr-1" />
        Unknown
      </Badge>
    )
  }

  const getStatusProps = () => {
    switch (status) {
      case 'completed':
        return {
          variant: 'outline',
          className:
            'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200',
          icon: <CheckCircle className="h-3.5 w-3.5 mr-1" />,
        }
      case 'in-progress':
        return {
          className: 'bg-blue-500 hover:bg-blue-600',
          icon: <RefreshCw className="h-3.5 w-3.5 mr-1 animate-spin" />,
        }
      case 'pending':
        return {
          variant: 'outline',
          className:
            'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900 dark:text-amber-200',
          icon: <Clock className="h-3.5 w-3.5 mr-1" />,
        }
      case 'cancelled':
        return {
          variant: 'destructive',
          icon: <AlertCircle className="h-3.5 w-3.5 mr-1" />,
        }
      default:
        return {
          variant: 'secondary',
          icon: <Clipboard className="h-3.5 w-3.5 mr-1" />,
        }
    }
  }

  const { variant, className, icon } = getStatusProps()

  return (
    <Badge variant={variant} className={className}>
      {icon}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  )
}

export default function TripDetails({ id }) {
  const router = useRouter()
  const { toast } = useToast()
  const { trips, tripsDispatch } = useGlobalContext()

  const trip = trips?.data?.find((t) => t.id === id)

  // Status update state
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [statusUpdate, setStatusUpdate] = useState({
    status: trip?.status || 'pending',
    statusNotes: trip?.statusNotes || '',
  })
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [locations, setLocations] = useState([])

  const handleGoBack = () => {
    router.back()
  }

  // Handle status update
  const handleStatusUpdate = async () => {
    if (!trip) return

    setUpdatingStatus(true)
    try {
      const response = await fetch(`/api/trips/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('firebaseIdToken')}`,
        },
        body: JSON.stringify(statusUpdate),
      })

      if (response.ok) {
        toast({
          title: 'Status Updated',
          description: `Trip status has been updated to ${statusUpdate.status}`,
        })
        setStatusDialogOpen(false)

        // Refresh trip data
        // You might want to dispatch an action to refresh the trip data
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.message || 'Failed to update status',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update trip status',
        variant: 'destructive',
      })
    } finally {
      setUpdatingStatus(false)
    }
  }

  // Check if status can be updated (not in progress from other places)
  const canUpdateStatus = () => {
    // If trip is in progress, only allow updates from the trip form
    // For now, we'll allow updates from the detail page
    return true
  }

  // Calculate trip progress
  const calculateProgress = () => {
    if (trip?.status === 'completed') return 100
    if (trip?.status === 'pending') return 0

    // For in-progress, calculate based on waypoints or just return 50%
    if (trip?.waypoints && trip?.waypoints.length > 0) {
      const completedWaypoints = trip?.waypoints.filter(
        (wp) => wp.departureTime
      ).length
      return Math.round((completedWaypoints / trip?.waypoints.length) * 100)
    }

    return 50
  }

  // Calculate total expenses
  const calculateTotalExpenses = () => {
    if (!trip?.expenses || trip?.expenses.length === 0) return 'R 0'

    const total = trip?.expenses.reduce((sum, expense) => {
      const amount = Number.parseFloat(expense.amount.replace(/[^0-9.]/g, ''))
      return sum + (isNaN(amount) ? 0 : amount)
    }, 0)

    return `R ${total.toLocaleString()}`
  }

  const trip_information = [
    { label: 'Start Date', value: formatDate(trip?.startDate) },
    { label: 'End Date', value: formatDate(trip?.endDate) },
    { label: 'Origin', value: trip?.origin || 'N/A' },
    { label: 'Destination', value: trip?.destination || 'N/A' },
    { label: 'Cost Centre', value: trip?.costCentre || 'N/A' },
    { label: 'Cargo', value: trip?.cargo || 'N/A' },
    { label: 'Cargo Weight', value: trip?.cargoWeight || 'N/A' },
  ]
  const client_information = [
    { label: 'Client', value: trip?.clientDetails?.name || 'N/A' },
    {
      label: 'Contact Person',
      value: trip?.clientDetails?.contactPerson || 'N/A',
    },
    { label: 'Email', value: trip?.clientDetails?.email || 'N/A' },
    { label: 'Phone', value: trip?.clientDetails?.phone || 'N/A' },
  ]
  const financial_summary = [
    { label: 'Fuel Used', value: trip?.fuelUsed || 'N/A' },
    { label: 'Total Expenses', value: calculateTotalExpenses() },
  ]

  useEffect(() => {
    // If trip is not found, redirect to trips list
    if (!trip) {
      return []
    }

    // Extract pickup and dropoff locations
    const pickupLocations =
      trip.pickupLocations?.map((location) => ({
        label: location.address,
        value: location.address,
      })) || []
    const dropoffLocations =
      trip.dropoffLocations?.map((location) => ({
        label: location.address,
        value: location.address,
      })) || []
    setLocations([...pickupLocations, ...dropoffLocations])
  }, [trip])

  console.log('locations :>> ', locations)

  return (
    <div className=" space-y-6">
      {/* Header */}
      <DetailActionBar
        id={id}
        title={trip?.clientDetails?.name}
        description={id}
      />

      {/* Trip Progress */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Trip Progress</CardTitle>
            <div className="flex items-center gap-2">
              <StatusBadge status={trip?.status} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {/* <Progress value={calculateProgress()} className="h-2" /> */}

            <ProgressWithWaypoints
              value={calculateProgress()}
              waypoints={[
                { position: 0, label: 'Start' },
                { position: 20, label: '20%' },
                { position: 40, label: '40%' },
                { position: 60, label: '60%' },
                { position: 80, label: '80%' },
                { position: 100, label: 'Done' },
              ]}
              showLabels={false}
              className="w-full"
            />

            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Origin: {trip?.origin}</span>
              <span>Destination: {trip?.destination}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <DetailCard
          title={`Trip Information`}
          description={'DInformation about this trip'}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trip_information.map((info) => (
              <div key={info.label}>
                <dt className="text-sm font-medium text-gray-500">
                  {info.label}
                </dt>
                <dd className="mt-1 text-sm text-gray-900">{info.value}</dd>
              </div>
            ))}
          </div>

          <Separator className="my-4" />

          <div className="mb-4">
            <label className="text-sm font-medium text-gray-500">
              Client Information
            </label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {client_information.map((info) => (
              <div key={info.label}>
                <dt className="text-sm font-medium text-gray-500">
                  {info.label}
                </dt>
                <dd className="mt-1 text-sm text-gray-900">{info.value}</dd>
              </div>
            ))}
          </div>
        </DetailCard>
        <DetailCard
          title={`Trip Overview`}
          description={'Map view of this trip'}
        >
          <div className=" h-[250] rounded-lg bg-gray-100 flex items-center justify-center">
            <DisplayMap address={locations} />
          </div>

          <Separator className="my-4" />

          <div className="mb-4">
            <label className="text-sm font-medium text-gray-500">
              Financial Summary
            </label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {financial_summary.map((info) => (
              <div key={info.label}>
                <dt className="text-sm font-medium text-gray-500">
                  {info.label}
                </dt>
                <dd className="mt-1 text-sm text-gray-900">{info.value}</dd>
              </div>
            ))}
          </div>
        </DetailCard>
      </div>

      {/* Vehicle Assignments */}
      <Card>
        <CardHeader>
          <CardTitle>Vehicle Assignments</CardTitle>
          <CardDescription>
            Vehicles, drivers, and trailers assigned to this trip
          </CardDescription>
        </CardHeader>
        <CardContent>
          {trip?.vehicleAssignments && trip?.vehicleAssignments.length > 0 ? (
            <div className="space-y-4">
              {trip.vehicleAssignments.map((assignment, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h4 className="font-medium text-sm text-gray-500">
                        Vehicle
                      </h4>
                      <p className="text-sm">
                        {assignment.vehicle?.name || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-gray-500">
                        Drivers
                      </h4>
                      <p className="text-sm">
                        {assignment.drivers?.map((d) => d.name).join(', ') ||
                          'N/A'}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-gray-500">
                        Trailers
                      </h4>
                      <p className="text-sm">
                        {assignment.trailers?.map((t) => t.name).join(', ') ||
                          'None'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No vehicle assignments have been made for this trip.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs for Waypoints, Expenses, Notes */}
      <Tabs defaultValue="waypoints" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="waypoints">Waypoints</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="notes">Notes & Documents</TabsTrigger>
        </TabsList>

        {/* Waypoints Tab */}
        <TabsContent value="waypoints" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle>Trip Waypoints</CardTitle>
                <Button variant="outline" size="sm">
                  <PlusCircle className="h-4 w-4 mr-2" /> Add Waypoint
                </Button>
              </div>
              <CardDescription>
                Scheduled stops and checkpoints for this trip
              </CardDescription>
            </CardHeader>
            <CardContent>
              {trip?.waypoints && trip?.waypoints.length > 0 ? (
                <div className="relative">
                  {/* Timeline */}
                  <div className="absolute left-0 top-0 bottom-0 w-px bg-border ml-6"></div>

                  {/* Waypoints */}
                  <div className="space-y-8 relative">
                    {/* Origin */}
                    <div className="flex gap-4 items-start">
                      <div className="w-3 h-3 rounded-full bg-primary mt-1.5 z-10"></div>
                      <div className="flex-1">
                        <div className="font-medium">{trip?.origin}</div>
                        <div className="text-sm text-muted-foreground">
                          Departure: {formatDate(trip?.startDate)}
                        </div>
                      </div>
                    </div>

                    {/* Waypoints */}
                    {trip?.waypoints.map((waypoint, index) => (
                      <div key={index} className="flex gap-4 items-start">
                        <div className="w-3 h-3 rounded-full bg-primary mt-1.5 z-10"></div>
                        <div className="flex-1">
                          <div className="font-medium">{waypoint.location}</div>
                          <div className="text-sm text-muted-foreground">
                            Arrival: {formatDateTime(waypoint.arrivalTime)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Departure: {formatDateTime(waypoint.departureTime)}
                          </div>
                          {waypoint.notes && (
                            <div className="text-sm mt-1 p-2 bg-muted rounded-md">
                              {waypoint.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    {/* Destination */}
                    <div className="flex gap-4 items-start">
                      <div className="w-3 h-3 rounded-full bg-primary mt-1.5 z-10"></div>
                      <div className="flex-1">
                        <div className="font-medium">{trip?.destination}</div>
                        <div className="text-sm text-muted-foreground">
                          Arrival:{' '}
                          {trip?.endDate
                            ? formatDate(trip?.endDate)
                            : 'Expected arrival date not set'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No waypoints have been added to this trip.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Expenses Tab */}
        <TabsContent value="expenses" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle>Trip Expenses</CardTitle>
                <Button variant="outline" size="sm">
                  <PlusCircle className="h-4 w-4 mr-2" /> Add Expense
                </Button>
              </div>
              <CardDescription>
                Financial records and expenses for this trip
              </CardDescription>
            </CardHeader>
            <CardContent>
              {trip?.expenses && trip?.expenses.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {trip?.expenses.map((expense, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium capitalize">
                          {expense.type}
                        </TableCell>
                        <TableCell>{expense.amount}</TableCell>
                        <TableCell>{formatDate(expense.date)}</TableCell>
                        <TableCell>{expense.notes}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No expenses have been recorded for this trip.
                </div>
              )}
            </CardContent>
            {trip?.expenses && trip?.expenses.length > 0 && (
              <CardFooter className="flex justify-between border-t px-6 py-4">
                <div className="font-medium">Total</div>
                <div className="font-bold">{calculateTotalExpenses()}</div>
              </CardFooter>
            )}
          </Card>
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Trip Notes</CardTitle>
              <CardDescription>
                Additional information and documentation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-md">
                  <h3 className="font-medium mb-2">Trip Notes</h3>
                  <p className="text-sm text-muted-foreground">
                    {trip?.notes || 'No notes have been added for this trip.'}
                  </p>
                </div>

                <div className="p-4 border rounded-md">
                  <h3 className="font-medium mb-2">Documents</h3>
                  <p className="text-sm text-muted-foreground">
                    No documents have been attached to this trip.
                  </p>
                  <Button variant="outline" size="sm" className="mt-2">
                    <PlusCircle className="h-4 w-4 mr-2" /> Attach Document
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// import { useParams, useRouter } from 'next/navigation'
// import { Button } from '@/components/ui/button'
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from '@/components/ui/card'
// import { Badge } from '@/components/ui/badge'
// import {
//   ArrowLeft,
//   Edit,
//   Trash2,
//   Clock,
//   Play,
//   AlertTriangle,
//   CheckCircle,
// } from 'lucide-react'
// import { useGlobalContext } from '@/context/global-context'

// // Mock data for trips
// const trips = [
//   {
//     id: 'TRP-001',
//     pickupLocation: 'San Francisco, CA',
//     dropoffLocation: 'Los Angeles, CA',
//     driver: 'John Doe',
//     driverPhone: '+1 (555) 123-4567',
//     driverEmail: 'john.doe@example.com',
//     vehicle: 'Truck (T-2023)',
//     vehicleId: 'VEH-001',
//     departureTime: '2023-04-15 08:00 AM',
//     estimatedArrival: '2023-04-15 04:30 PM',
//     actualArrival: '2023-04-15 04:45 PM',
//     status: 'completed',
//     costCentre: 'North Region',
//     progress: 100,
//     distance: '615 km',
//     duration: '8h 30m',
//     cargo: 'Electronics',
//     cargoWeight: '15 tons',
//     priority: 'High',
//     notes: 'Delivery for Apple Inc. headquarters',
//     customer: 'Apple Inc.',
//     customerContact: 'Sarah Johnson',
//     customerPhone: '+1 (555) 987-6543',
//     customerEmail: 'sarah.johnson@apple.com',
//     waypoints: [
//       {
//         location: 'Bakersfield, CA',
//         arrivalTime: '2023-04-15 11:30 AM',
//         departureTime: '2023-04-15 12:00 PM',
//         status: 'completed',
//       },
//       {
//         location: 'Santa Clarita, CA',
//         arrivalTime: '2023-04-15 02:15 PM',
//         departureTime: '2023-04-15 02:45 PM',
//         status: 'completed',
//       },
//     ],
//     updates: [
//       {
//         timestamp: '2023-04-15 08:00 AM',
//         message: 'Trip started from San Francisco',
//         user: 'System',
//       },
//       {
//         timestamp: '2023-04-15 11:30 AM',
//         message: 'Arrived at Bakersfield waypoint',
//         user: 'John Doe',
//       },
//       {
//         timestamp: '2023-04-15 12:00 PM',
//         message: 'Departed from Bakersfield',
//         user: 'John Doe',
//       },
//       {
//         timestamp: '2023-04-15 02:15 PM',
//         message: 'Arrived at Santa Clarita waypoint',
//         user: 'John Doe',
//       },
//       {
//         timestamp: '2023-04-15 02:45 PM',
//         message: 'Departed from Santa Clarita',
//         user: 'John Doe',
//       },
//       {
//         timestamp: '2023-04-15 04:45 PM',
//         message: 'Arrived at destination in Los Angeles',
//         user: 'John Doe',
//       },
//       {
//         timestamp: '2023-04-15 05:00 PM',
//         message: 'Delivery completed and signed off',
//         user: 'John Doe',
//       },
//     ],
//     expenses: [
//       {
//         type: 'Fuel',
//         amount: '$350',
//         date: '2023-04-15',
//         notes: 'Full tank refill in San Francisco',
//       },
//       {
//         type: 'Toll',
//         amount: '$25',
//         date: '2023-04-15',
//         notes: 'Highway toll',
//       },
//       {
//         type: 'Meal',
//         amount: '$15',
//         date: '2023-04-15',
//         notes: 'Driver lunch',
//       },
//     ],
//   },
//   // Additional trips would be here...
// ]

// // Function to get status badge
// const getStatusBadge = (status) => {
//   switch (status) {
//     case 'scheduled':
//       return (
//         <Badge
//           variant="outline"
//           className="bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700"
//         >
//           <Clock className="h-3 w-3 mr-1" /> Scheduled
//         </Badge>
//       )
//     case 'in-progress':
//       return (
//         <Badge className="bg-blue-500 hover:bg-blue-600">
//           <Play className="h-3 w-3 mr-1" /> In Progress
//         </Badge>
//       )
//     case 'delayed':
//       return (
//         <Badge variant="destructive">
//           <AlertTriangle className="h-3 w-3 mr-1" /> Delayed
//         </Badge>
//       )
//     case 'completed':
//       return (
//         <Badge
//           variant="outline"
//           className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-800"
//         >
//           <CheckCircle className="h-3 w-3 mr-1" /> Completed
//         </Badge>
//       )
//     default:
//       return <Badge>{status}</Badge>
//   }
// }

// export default function TripDetails({ id }) {
//   const router = useRouter()
//   const {
//     trips: { data },
//   } = useGlobalContext()
//   const trips = data

//   console.log('trips :>> ', trips)
//   // Find the trip with the matching ID
//   const trip = trips?.data?.find((t) => t.id === id) || {
//     id: 'Not Found',
//     pickupLocation: 'Unknown',
//     dropoffLocation: 'Unknown',
//     driver: 'Unknown',
//     vehicle: 'Unknown',
//     status: 'unknown',
//   }

//   // Column definitions for waypoints
//   const waypointColumns = [
//     {
//       accessorKey: 'location',
//       header: 'Location',
//     },
//     {
//       accessorKey: 'arrivalTime',
//       header: 'Arrival Time',
//     },
//     {
//       accessorKey: 'departureTime',
//       header: 'Departure Time',
//     },
//     {
//       accessorKey: 'status',
//       header: 'Status',
//       cell: ({ row }) => (
//         <Badge
//           variant={
//             row.getValue('status') === 'completed' ? 'success' : 'secondary'
//           }
//         >
//           {row.getValue('status')}
//         </Badge>
//       ),
//     },
//   ]

//   // Column definitions for updates
//   const updateColumns = [
//     {
//       accessorKey: 'timestamp',
//       header: 'Timestamp',
//     },
//     {
//       accessorKey: 'message',
//       header: 'Message',
//     },
//     {
//       accessorKey: 'user',
//       header: 'User',
//     },
//   ]

//   // Column definitions for expenses
//   const expenseColumns = [
//     {
//       accessorKey: 'type',
//       header: 'Type',
//     },
//     {
//       accessorKey: 'amount',
//       header: 'Amount',
//     },
//     {
//       accessorKey: 'date',
//       header: 'Date',
//     },
//     {
//       accessorKey: 'notes',
//       header: 'Notes',
//     },
//   ]

//   return (
//     <div className="container mx-auto py-6 space-y-6">
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"></div>
//     </div>
//   )
// }
