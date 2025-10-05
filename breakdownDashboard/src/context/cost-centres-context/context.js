// icons
import { Plus, Building2, Users, Truck, Route } from 'lucide-react'

// components
import { Badge } from '@/components/ui/badge'
import {
  createActionsColumn,
  createCheckboxColumn,
  createSortableHeader,
} from '@/components/ui/data-table'

// data
const data = []

// page title
const titleSection = {
  title: 'Cost Centres',
  description: "Manage your organization's cost centres",
  button: {
    text: 'Add Cost Centre',
    icon: <Plus className="mr-2 h-4 w-4" />,
  },
}

// stats
const screenStats = [
  {
    title: 'Total Cost Centres',
    value: 0,
    icon: <Building2 className="h-4 w-4 text-violet-500" />,
  },
  {
    title: 'Total Users',
    value: 0,
    icon: <Users className="h-4 w-4 text-pink-700" />,
  },
  {
    title: 'Total Vehicles',
    value: 0,
    icon: <Truck className="h-4 w-4 text-orange-500" />,
  },
  {
    title: 'Active Trips',
    value: 0,
    icon: <Route className="h-4 w-4 text-emerald-500" />,
  },
]

// table header
const tableInfo = {
  title: 'Cost Centres',
  filterColumn: 'name',
  filterPlaceholder: 'Filter cost centres...',
}

const columns = () => {
  return [
    createCheckboxColumn(),
    {
      accessorKey: 'id',
      header: createSortableHeader('ID'),
      // header: 'ID',
      // cell: ({ row }) => (
      //   <div className="font-medium">{row.getValue('id')}</div>
      // ),
    },
    {
      accessorKey: 'name',
      header: createSortableHeader('Name'),
    },
    {
      accessorKey: 'city',
      header: createSortableHeader('City'),
    },
    {
      accessorKey: 'manager',
      header: createSortableHeader('Manager'),
    },
    {
      accessorKey: 'users',
      header: createSortableHeader('Users'),
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className="bg-pink-50 text-pink-800 border-pink-200 dark:bg-pink-900 dark:text-pink-200 dark:border-pink-800"
        >
          {row.getValue('users')}
        </Badge>
      ),
    },
    {
      accessorKey: 'vehicles',
      header: createSortableHeader('Vehicles'),
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className="bg-orange-50 text-orange-800 border-orange-200 dark:bg-orange-900 dark:text-orange-200 dark:border-orange-800"
        >
          {row.getValue('vehicles')}
        </Badge>
      ),
    },
    {
      accessorKey: 'activeTrips',
      header: createSortableHeader('Active Trips'),
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className="bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-900 dark:text-emerald-200 dark:border-emerald-800"
        >
          {row.getValue('activeTrips')}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const costCentre = row.original

        return createActionsColumn({ data: costCentre })
      },
    },
  ]
}

const rows = (data) => {
  return data.map((item) => {
    return [
      item.id || '',
      item.name || '',
      item.location || '',
      item.manager || '',
      item.users != null ? item.users : '',
      item.vehicles != null ? item.vehicles : '',
      item.activeTrips != null ? item.activeTrips : '',
    ]
  })
}

const headers = [
  'ID',
  'Name',
  'Location',
  'Manager',
  'Users',
  'Vehicles',
  'Active Trips',
]

// context
export const initialCostCentresState = {
  csv_headers: headers,
  csv_rows: rows,
  titleSection,
  screenStats,
  tableInfo,
  columns: columns,
  data,
  loading: false,
  error: null,
}
