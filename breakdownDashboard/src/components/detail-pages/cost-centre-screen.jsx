'use client'

// next
import { useRouter } from 'next/navigation'

// components

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DataTable } from '@/components/ui/data-table'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'

// icons
import { Users, Truck, Route } from 'lucide-react'

// context
import { useGlobalContext } from '@/context/global-context/context'
import DisplayMap from '../map/display-map'
import DetailActionBar from '../layout/detail-action-bar'
import DetailCard from '../ui/detail-card'

export default function CostCentreDetails({ id }) {
  const { cost_centres, users, vehicles, trips } = useGlobalContext()

  // Find the cost centre with the matching ID
  const costCentre = cost_centres?.data?.find((cc) => cc.id === id) || {
    id: 'Not Found',
    name: 'Cost Centre Not Found',
    location: 'Unknown',
    manager: 'Unknown',
    users: 0,
    vehicles: 0,
    activeTrips: 0,
  }
  // Find users associated to this cost centre
  const userStats = users?.data?.filter(
    (cc) => cc.costCentre === costCentre.name
  )

  // Find vehicles associated with this cost centre
  const vehicleStats = vehicles.data.filter(
    (v) => v.costCentre === costCentre.name
  )

  // Find vehicles associated with this cost centre
  const tripStats = trips.data.filter((t) => t.costCentre === costCentre.name)
  // console.log('trips :>> ', tripStats)

  // Column definitions for users table
  const userColumns = [
    {
      accessorKey: 'id',
      header: 'ID',
    },
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      accessorKey: 'role',
      header: 'Role',
    },
    {
      accessorKey: 'email',
      header: 'Email',
    },
    {
      accessorKey: 'department',
      header: 'Department',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge
          variant={
            row.getValue('status') === 'active' ? 'success' : 'secondary'
          }
        >
          {row.getValue('status')}
        </Badge>
      ),
    },
  ]

  // Column definitions for vehicles table
  const vehicleColumns = [
    {
      accessorKey: 'id',
      header: 'ID',
    },
    {
      accessorKey: 'type',
      header: 'Type',
    },
    {
      accessorKey: 'model',
      header: 'Model',
    },
    {
      accessorKey: 'regNumber',
      header: 'Reg Number',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status')
        let badgeClass = ''

        switch (status) {
          case 'in-use':
            badgeClass = 'bg-blue-100 text-blue-800 border-blue-200'
            break
          case 'available':
            badgeClass = 'bg-green-100 text-green-800 border-green-200'
            break
          case 'maintenance':
            badgeClass = 'bg-amber-100 text-amber-800 border-amber-200'
            break
          default:
            badgeClass = 'bg-gray-100 text-gray-800 border-gray-200'
        }

        return (
          <Badge variant="outline" className={badgeClass}>
            {status}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'lastService',
      header: 'Last Service',
    },
  ]

  // Column definitions for trips table
  const tripColumns = [
    {
      accessorKey: 'id',
      header: 'ID',
    },
    {
      accessorKey: 'driver',
      header: 'Driver',
    },
    {
      accessorKey: 'vehicle',
      header: 'Vehicle',
    },
    {
      accessorKey: 'departure',
      header: 'Departure',
    },
    {
      accessorKey: 'destination',
      header: 'Destination',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status')
        let badgeClass = ''

        switch (status) {
          case 'in-progress':
            badgeClass = 'bg-blue-100 text-blue-800 border-blue-200'
            break
          case 'scheduled':
            badgeClass = 'bg-gray-100 text-gray-800 border-gray-200'
            break
          case 'completed':
            badgeClass = 'bg-green-100 text-green-800 border-green-200'
            break
          default:
            badgeClass = 'bg-gray-100 text-gray-800 border-gray-200'
        }

        return (
          <Badge variant="outline" className={badgeClass}>
            {status}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'progress',
      header: 'Progress',
      cell: ({ row }) => (
        <div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div
              className={`h-2.5 rounded-full ${
                row.original.status === 'completed'
                  ? 'bg-green-500'
                  : row.original.status === 'in-progress'
                  ? 'bg-blue-500'
                  : 'bg-gray-500'
              }`}
              style={{ width: `${row.getValue('progress')}%` }}
            ></div>
          </div>
          <span className="text-xs text-gray-500">
            {row.getValue('progress')}%
          </span>
        </div>
      ),
    },
  ]

  const cost_center_info = [
    {
      label: 'ID',
      value: costCentre.id,
    },
    {
      label: 'Name',
      value: costCentre.name,
    },
    {
      label: 'Manager',
      value: costCentre.manager,
    },
    {
      label: 'Manager Email',
      value: costCentre.managerEmail || 'N/A',
    },
    {
      label: 'Manager Phone',
      value: costCentre.managerPhone || 'N/A',
    },
    // {
    //   label: 'Address',
    //   value: costCentre.address || 'N/A',
    // },
    {
      label: 'Street',
      value: costCentre.street || 'N/A',
    },
    {
      label: 'City',
      value: costCentre.city || 'N/A',
    },
    {
      label: 'State',
      value: costCentre.state || 'N/A',
    },
    {
      label: 'Country',
      value: costCentre.country || 'N/A',
    },
    {
      label: 'Status',
      value: (
        <Badge
          variant={costCentre.status === 'active' ? 'success' : 'secondary'}
        >
          {costCentre.status || 'active'}
        </Badge>
      ),
    },
    {
      label: 'Established',
      value: costCentre.established || 'N/A',
    },
    {
      label: 'Budget',
      value: costCentre.budget || 'N/A',
    },
  ]
  console.log('userStats :>> ', userStats)
  // console.log('costCentre :>> ', costCentre)
  return (
    <div className="space-y-6">
      <DetailActionBar id={id} title={costCentre.name} />

      <div className="grid gap-6 md:grid-cols-2">
        <DetailCard
          title={'Cost Centre Information'}
          description={'Detailed information about this cost centre'}
        >
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {cost_center_info.map((info) => (
              <div key={info.label}>
                <dt className="text-sm font-medium text-gray-500">
                  {info.label}
                </dt>
                <dd className="mt-1 text-sm text-gray-900">{info.value}</dd>
              </div>
            ))}
          </dl>

          <Separator className="my-4" />

          <div>
            <h4 className="text-sm font-medium text-gray-500">Description</h4>
            <p className="mt-1 text-sm text-gray-900">
              {costCentre.description || 'No description available.'}
            </p>
          </div>
        </DetailCard>

        <DetailCard
          title={'Cost Centre overview'}
          description={'Overview of resources in this cost centre'}
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex flex-col items-center justify-center rounded-lg bg-blue-50 p-4 dark:bg-blue-900">
              <Users className="h-8 w-8 text-blue-500 dark:text-blue-300" />
              <h3 className="mt-2 text-xl font-bold">{userStats.length}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Users</p>
            </div>
            <div className="flex flex-col items-center justify-center rounded-lg bg-orange-50 p-4 dark:bg-orange-900">
              <Truck className="h-8 w-8 text-orange-500 dark:text-orange-300" />
              <h3 className="mt-2 text-xl font-bold">{vehicleStats.length}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Vehicles
              </p>
            </div>
            <div className="flex flex-col items-center justify-center rounded-lg bg-green-50 p-4 dark:bg-green-900">
              <Route className="h-8 w-8 text-green-500 dark:text-green-300" />
              <h3 className="mt-2 text-xl font-bold">{tripStats.length}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Active Trips
              </p>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="mt-6">
            <label className="text-sm font-medium text-gray-500">
              Location
            </label>
            <div className="mt-2 h-[200px] rounded-lg bg-gray-100 flex items-center justify-center">
              <DisplayMap
                coords={costCentre.coords}
                street={costCentre.street}
                city={costCentre.city}
                state={costCentre.state}
                country={costCentre.country}
              />
            </div>
          </div>
        </DetailCard>
      </div>

      <Tabs defaultValue="users">
        <TabsList className="grid w-full grid-cols-3 gap-6">
          <TabsTrigger value="users">{`Users (${
            userStats?.length || 0
          })`}</TabsTrigger>
          <TabsTrigger value="vehicles">{`Vehicles (${
            vehicleStats?.length || 0
          })`}</TabsTrigger>
          <TabsTrigger value="trips">{`Trips (${
            tripStats?.length || 0
          })`}</TabsTrigger>
        </TabsList>
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Users in {costCentre.name}</CardTitle>
              <CardDescription>
                All users assigned to this cost centre
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={userColumns}
                data={userStats}
                filterColumn="name"
                filterPlaceholder="Search users..."
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="vehicles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Vehicles in {costCentre.name}</CardTitle>
              <CardDescription>
                All vehicles assigned to this cost centre
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={vehicleColumns}
                data={vehicleStats}
                filterColumn="model"
                filterPlaceholder="Search vehicles..."
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="trips" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Trips in {costCentre.name}</CardTitle>
              <CardDescription>
                All trips associated with this cost centre
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={tripColumns}
                data={tripStats}
                filterColumn="id"
                filterPlaceholder="Search trips..."
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// 'use client'

// // next
// import { useParams, useRouter } from 'next/navigation'
// import { Button } from '@/components/ui/button'
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from '@/components/ui/card'

// // icons
// import {
//   ArrowLeft,
//   Users,
//   Truck,
//   Route,
//   Edit,
//   Trash2,
//   MapPin,
//   Mail,
//   Phone,
//   Calendar,
//   Building,
//   DollarSign,
// } from 'lucide-react'

// // context
// import { useGlobalContext } from '@/context/global-context/context'
// import { useAuth } from '@/context/auth-context/context'

// // components
// import { DataTable } from '@/components/ui/data-table'
// import { Separator } from '@/components/ui/separator'
// import DetailActionBar from '@/components/layout/detail-action-bar'
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
// import { Badge } from '@/components/ui/badge'

// // hooks
// import { getAuthToken, isTokenExpired } from '@/hooks/use-auth'
// import DetailCard from '../ui/detail-card'

// export default function CostCentreDetails({ id }) {
//   const {
//     cost_centres: { data },
//     users,
//     vehicles,
//     trips,
//     onEdit,
//     onDelete,
//   } = useGlobalContext()
//   const { logout } = useAuth()
//   const token = getAuthToken()

//   // useEffect(() => {
//   //   if (!token || isTokenExpired(token)) {
//   //     logout(router)
//   //   }
//   // }, [token])

//   // Find the cost centre with the matching ID
//   const costCentre = data.find((cc) => cc.id === id) || {
//     id: 'Not Found',
//     name: 'Cost Centre Not Found',
//     location: 'Unknown',
//     manager: 'Unknown',
//     users: 0,
//     vehicles: 0,
//     activeTrips: 0,
//   }
//   // Find users associated to this cost centre
//   const userStats = users.data.filter((cc) => cc.costCentre === costCentre.name)

//   // Find vehicles associated with this cost centre
//   const vehicleStats = vehicles.data.filter(
//     (v) => v.costCentre === costCentre.name
//   )

//   // Find vehicles associated with this cost centre
//   const tripStats = trips.data.filter((t) => t.costCentre === costCentre.name)
//   //console.log('trips :>> ', tripStats)

//   // Column definitions for users table
//   const userColumns = [
//     {
//       accessorKey: 'id',
//       header: 'ID',
//     },
//     {
//       accessorKey: 'name',
//       header: 'Name',
//     },
//     {
//       accessorKey: 'role',
//       header: 'Role',
//     },
//     {
//       accessorKey: 'email',
//       header: 'Email',
//     },
//     {
//       accessorKey: 'department',
//       header: 'Department',
//     },
//     {
//       accessorKey: 'status',
//       header: 'Status',
//       cell: ({ row }) => (
//         <Badge
//           variant={
//             row.getValue('status') === 'active' ? 'default' : 'secondary'
//           }
//         >
//           {row.getValue('status')}
//         </Badge>
//       ),
//     },
//   ]

//   // Column definitions for vehicles table
//   const vehicleColumns = [
//     {
//       accessorKey: 'id',
//       header: 'ID',
//     },
//     {
//       accessorKey: 'type',
//       header: 'Type',
//     },
//     {
//       accessorKey: 'model',
//       header: 'Model',
//     },
//     {
//       accessorKey: 'regNumber',
//       header: 'Reg Number',
//     },
//     {
//       accessorKey: 'status',
//       header: 'Status',
//       cell: ({ row }) => {
//         const status = row.getValue('status')
//         let badgeClass = ''

//         switch (status) {
//           case 'in-use':
//             badgeClass = 'bg-blue-100 text-blue-800 border-blue-200'
//             break
//           case 'available':
//             badgeClass = 'bg-green-100 text-green-800 border-green-200'
//             break
//           case 'maintenance':
//             badgeClass = 'bg-amber-100 text-amber-800 border-amber-200'
//             break
//           default:
//             badgeClass = 'bg-gray-100 text-gray-800 border-gray-200'
//         }

//         return (
//           <Badge variant="outline" className={badgeClass}>
//             {status}
//           </Badge>
//         )
//       },
//     },
//     {
//       accessorKey: 'lastService',
//       header: 'Last Service',
//     },
//   ]

//   // Column definitions for trips table
//   const tripColumns = [
//     {
//       accessorKey: 'id',
//       header: 'ID',
//     },
//     {
//       accessorKey: 'driver',
//       header: 'Driver',
//     },
//     {
//       accessorKey: 'vehicle',
//       header: 'Vehicle',
//     },
//     {
//       accessorKey: 'departure',
//       header: 'Departure',
//     },
//     {
//       accessorKey: 'destination',
//       header: 'Destination',
//     },
//     {
//       accessorKey: 'status',
//       header: 'Status',
//       cell: ({ row }) => {
//         const status = row.getValue('status')
//         let badgeClass = ''

//         switch (status) {
//           case 'in-progress':
//             badgeClass = 'bg-blue-100 text-blue-800 border-blue-200'
//             break
//           case 'scheduled':
//             badgeClass = 'bg-gray-100 text-gray-800 border-gray-200'
//             break
//           case 'completed':
//             badgeClass = 'bg-green-100 text-green-800 border-green-200'
//             break
//           default:
//             badgeClass = 'bg-gray-100 text-gray-800 border-gray-200'
//         }

//         return (
//           <Badge variant="outline" className={badgeClass}>
//             {status}
//           </Badge>
//         )
//       },
//     },
//     {
//       accessorKey: 'progress',
//       header: 'Progress',
//       cell: ({ row }) => (
//         <div>
//           <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
//             <div
//               className={`h-2.5 rounded-full ${
//                 row.original.status === 'completed'
//                   ? 'bg-green-500'
//                   : row.original.status === 'in-progress'
//                   ? 'bg-blue-500'
//                   : 'bg-gray-500'
//               }`}
//               style={{ width: `${row.getValue('progress')}%` }}
//             ></div>
//           </div>
//           <span className="text-xs text-gray-500">
//             {row.getValue('progress')}%
//           </span>
//         </div>
//       ),
//     },
//   ]

//   const tabs = [
//     {
//       value: 'users',
//       title: `Users in ${costCentre.name}`,
//       description: 'All users assigned to this cost centre',
//       columns: userColumns,
//       data: userStats,
//       filterColumn: 'name',
//       filterPlaceholder: 'Search users...',
//     },
//     {
//       value: 'vehicles',
//       title: `Vehicles in ${costCentre.name}`,
//       description: 'All vehicles assigned to this cost centre',
//       columns: vehicleColumns,
//       data: vehicleStats,
//       filterColumn: 'model',
//       filterPlaceholder: 'Search vehicles...',
//     },
//     {
//       value: 'trips',
//       title: `Trips in ${costCentre.name}`,
//       description: 'All trips associated with this cost centre',
//       columns: tripColumns,
//       data: tripStats,
//       filterColumn: 'id',
//       filterPlaceholder: 'Search trips...',
//     },
//   ]

//   return (
//     <div className="space-y-6">
//       <DetailActionBar
//         id={id}
//         title={costCentre.name}
//         description={costCentre.location}
//       />

//       <div className="grid gap-6 md:grid-cols-2">
//         <DetailCard
//           title={'Cost Centre Information'}
//           description={'Detailed information about this cost centre'}
//         >
//           <div>
//             <label className="text-sm font-medium text-gray-500">ID</label>
//             <p className="font-medium">{costCentre.id}</p>
//           </div>
//           <div>
//             <label className="text-sm font-medium text-gray-500">Name</label>
//             <p className="font-medium flex items-center gap-2">
//               <Building className="h-4 w-4" />
//               {costCentre.name}
//             </p>
//           </div>
//           <div>
//             <label className="text-sm font-medium text-gray-500">
//               Location
//             </label>
//             <p className="font-medium flex items-center gap-2">
//               <MapPin className="h-4 w-4" />
//               {costCentre.location}
//             </p>
//           </div>
//           <div>
//             <label className="text-sm font-medium text-gray-500">Address</label>
//             <p className="font-medium">{costCentre.address || 'N/A'}</p>
//           </div>
//           <div>
//             <label className="text-sm font-medium text-gray-500">Manager</label>
//             <p className="font-medium">{costCentre.manager}</p>
//           </div>
//           <div>
//             <label className="text-sm font-medium text-gray-500">
//               Manager Email
//             </label>
//             <p className="font-medium flex items-center gap-2">
//               <Mail className="h-4 w-4" />
//               {costCentre.managerEmail || 'N/A'}
//             </p>
//           </div>
//           <div>
//             <label className="text-sm font-medium text-gray-500">
//               Manager Phone
//             </label>
//             <p className="font-medium flex items-center gap-2">
//               <Phone className="h-4 w-4" />
//               {costCentre.managerPhone || 'N/A'}
//             </p>
//           </div>
//           <div>
//             <label className="text-sm font-medium text-gray-500">Status</label>
//             <div className="mt-1">
//               <Badge
//                 variant={
//                   costCentre.status === 'active' ? 'default' : 'secondary'
//                 }
//               >
//                 {costCentre.status || 'active'}
//               </Badge>
//             </div>
//           </div>
//           <div>
//             <label className="text-sm font-medium text-gray-500">
//               Established
//             </label>
//             <p className="font-medium flex items-center gap-2">
//               <Calendar className="h-4 w-4" />
//               {costCentre.established
//                 ? new Date(costCentre.established).toLocaleDateString()
//                 : 'N/A'}
//             </p>
//           </div>
//           <div>
//             <label className="text-sm font-medium text-gray-500">Budget</label>
//             <p className="font-medium flex items-center gap-2">
//               <DollarSign className="h-4 w-4" />
//               {costCentre.budget || 'N/A'}
//             </p>
//           </div>

//           <Separator className="my-4" />

//           <div>
//             <label className="text-sm font-medium text-gray-500">
//               Description
//             </label>
//             <p className="font-medium">
//               {costCentre.description || 'No description available.'}
//             </p>
//           </div>
//         </DetailCard>

//         <DetailCard
//           title={'Statistics'}
//           description={'Overview of resources in this cost centre'}
//         >
//           <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
//             <div className="flex flex-col items-center justify-center rounded-lg bg-blue-50 p-4 dark:bg-blue-900">
//               <Users className="h-8 w-8 text-blue-500 dark:text-blue-300" />
//               <h3 className="mt-2 text-xl font-bold">{userStats.length}</h3>
//               <p className="text-sm text-gray-500 dark:text-gray-400">Users</p>
//             </div>
//             <div className="flex flex-col items-center justify-center rounded-lg bg-orange-50 p-4 dark:bg-orange-900">
//               <Truck className="h-8 w-8 text-orange-500 dark:text-orange-300" />
//               <h3 className="mt-2 text-xl font-bold">{vehicleStats.length}</h3>
//               <p className="text-sm text-gray-500 dark:text-gray-400">
//                 Vehicles
//               </p>
//             </div>
//             <div className="flex flex-col items-center justify-center rounded-lg bg-green-50 p-4 dark:bg-green-900">
//               <Route className="h-8 w-8 text-green-500 dark:text-green-300" />
//               <h3 className="mt-2 text-xl font-bold">{tripStats.length}</h3>
//               <p className="text-sm text-gray-500 dark:text-gray-400">
//                 Active Trips
//               </p>
//             </div>
//           </div>

//           <div className="mt-6">
//             <div className="flex items-center gap-2">
//               <MapPin className="h-5 w-5 text-gray-500" />
//               <h3 className="text-lg font-medium">Location</h3>
//             </div>
//             <div className="mt-2 h-[200px] rounded-lg bg-gray-100 flex items-center justify-center">
//               <p className="text-gray-500">Map view would be displayed here</p>
//             </div>
//           </div>
//         </DetailCard>
//       </div>

//       <Tabs defaultValue="users" className="w-full">
//         <TabsList className="grid w-full grid-cols-3 gap-6">
//           {tabs.map((trigger, id) => (
//             <TabsTrigger key={id} value={trigger.value}>
//               <h6 className="capitalize">
//                 {trigger.value}

//                 {trigger?.data
//                   ? `
//                 (${trigger?.data?.length || '0'})`
//                   : null}
//               </h6>
//             </TabsTrigger>
//           ))}
//         </TabsList>

//         {tabs.map((tab) => (
//           <TabsContent key={tab.value} value={tab.value} className="space-y-4">
//             <DetailCard title={tab.title} description={tab.description}>
//               <DataTable
//                 columns={tab.columns}
//                 data={tab.data}
//                 filterColumn={tab.filterColumn}
//                 filterPlaceholder={tab.filterPlaceholder}
//               />
//             </DetailCard>
//           </TabsContent>
//         ))}
//       </Tabs>
//     </div>
//   )
// }
