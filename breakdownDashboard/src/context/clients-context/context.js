// icons
import { Plus, Building2, Users, Truck, Route, MapPin } from 'lucide-react'

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
  title: 'Clients',
  description: 'Manage your client relationships and track performance',
  button: {
    text: 'Add Client',
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
  title: 'Clients',
  filterColumn: 'name',
  filterPlaceholder: 'Filter clients...',
}

export const columns = ( ) => {
  return [
    createCheckboxColumn(),
    {
      accessorKey: 'id',
      header: createSortableHeader('ID'),
      cell: ({ row }) => (
        <div className="font-medium text-gray-500">{row.original.id}</div>
      ),
    },
    {
      accessorKey: 'name',
      header: createSortableHeader('Client'),
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue('name')}</div>
      ),
    },
    {
      accessorKey: 'contactPerson',
      header: createSortableHeader('Contact'),
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue('contactPerson')}</div>
      ),
    },
    {
      accessorKey: 'industry',
      header: createSortableHeader('Industry'),
      cell: ({ row }) => (
        <Badge variant="outline">{row.getValue('industry')}</Badge>
      ),
    },
    {
      accessorKey: 'locations',
      header: createSortableHeader('Locations'),
      cell: ({ row }) => {
        const pickupCount = row.original.pickupLocations?.length || 0
        const dropoffCount = row.original.dropoffLocations?.length || 0
        return (
          // <div className="flex items-center gap-2">
          //   <MapPin className="h-4 w-4 text-muted-foreground" />
          //   <div className="text-sm">
          //  <div className="font-medium">{pickupCount + dropoffCount} total</div>
          //     <div className="text-xs text-muted-foreground">
          //       {pickupCount} pickup, {dropoffCount} dropoff
          //     </div>
          //   </div>
          // </div>
          <Badge
            variant="outline"
            className="bg-pink-50 text-pink-800 border-pink-200 dark:bg-pink-900 dark:text-pink-200 dark:border-pink-800"
          >
            {pickupCount + dropoffCount}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge
          variant={
            row.getValue('status') === 'Active' ? 'default' : 'secondary'
          }
        >
          {row.getValue('status')}
        </Badge>
      ),
    },
    {
      accessorKey: 'totalSpend',
      header: createSortableHeader('Total Spend'),
      cell: ({ row }) => <div>R{row.getValue('totalSpend')}</div>,
    },
    {
      accessorKey: 'activeTrips',
      header: createSortableHeader('Active Trips'),
      cell: ({ row }) => (
        <div className="text-center">
          <Badge
            variant={row.getValue('activeTrips') > 0 ? 'default' : 'secondary'}
          >
            {row.getValue('activeTrips')}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: 'totalTrips',
      header: createSortableHeader('Total Trips'),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const client = row.original
        return createActionsColumn({ data: client })
      },
    },
  ]
}

export const fetchData = async () => {
  // fetch data from your API or database
  const {data, error} = await supabase.from('clients').select('*');
  if (error) {
    console.error('Error fetching clients:', error);
    return [];
  }
  if (data) {
    return data;
  }
}

const headers = [
  'ID',
  'Client',
  'Contact',
  'Industry',
  'Locations',
  'Status',
  'Total Spend',
  'Active Trips',
  'Total Trips',
]

const rows = (data) => {
  return data.map((item) => {
    const pickup = item.pickupLocations?.length || 0
    const dropoff = item.dropoffLocations?.length || 0

    return [
      item.id || '',
      item.name || '',
      item.contactPerson || '',
      item.industry || '',
      pickup + dropoff,
      item.status || '',
      item.totalSpend != null ? item.totalSpend : '',
      item.activeTrips != null ? item.activeTrips : '',
      item.totalTrips != null ? item.totalTrips : '',
    ]
  })
}

// context
export const initialClientState = {
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
