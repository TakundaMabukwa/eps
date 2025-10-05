// icons
import { Plus, Clock, Play, AlertTriangle, CheckCircle } from 'lucide-react'

// components
import {
  createActionsColumn,
  createCheckboxColumn,
  createSortableHeader,
} from '@/components/ui/data-table'

// hooks
import { getTripStatusBadge } from '@/hooks/use-badges'

const titleSection = {
  title: 'Trips',
  description: 'Manage your fleet trips and routes',
  button: {
    text: 'Add Trip',
    icon: <Plus className="mr-2 h-4 w-4" />,
  },
}

const screenStats = [
  {
    title: 'Total Trips',
    value: 91,
    icon: <Clock className="h-4 w-4 xl:h-7 xl:w-7 text-gray-500" />,
  },
  {
    title: 'In Progress',
    value: 24,
    icon: <Play className="h-4 w-4 xl:h-7 xl:w-7 text-blue-500" />,
  },
  {
    title: 'Delayed',
    value: 39,
    icon: <AlertTriangle className="h-4 w-4 xl:h-7 xl:w-7 text-red-500" />,
  },
  {
    title: 'Completed',
    value: 42,
    icon: <CheckCircle className="h-4 w-4 xl:h-7 xl:w-7 text-green-500" />,
  },
]

const tableInfo = {
  tabs: [
    {
      value: 'all',
      title: 'All Trips',
      filterColumn: 'id',
      filterPlaceholder: 'Search trips...',
    },
    {
      value: 'pending',
      title: 'Scheduled',
      filterColumn: 'id',
      filterBy: 'pending',
      filterPlaceholder: 'Search scheduled trips...',
    },
    {
      value: 'active',
      title: 'Active',
      filterColumn: 'id',
      filterBy: ['in-progress', 'delayed'],
      filterPlaceholder: 'Search active trips...',
    },

    {
      value: 'completed',
      title: 'Completed',
      filterColumn: 'id',
      filterBy: 'completed',
      filterPlaceholder: 'Search completed trips...',
    },
  ],
}

const columns = () => {
  return [
    createCheckboxColumn(),
    {
      accessorKey: 'id',
      header: createSortableHeader('Trip ID'),
      cell: ({ row }) => <div>{row.getValue('id')}</div>,
    },
    {
      accessorKey: 'costCentre',
      header: createSortableHeader('Cost Centre'),
    },
    {
      accessorKey: 'selectedClient',
      header: createSortableHeader('Client'),
      cell: ({ row }) => {
        return <div>{row.original.selectedClient?.name}</div>
      },
    },
    {
      accessorKey: 'origin',
      header: createSortableHeader('Route'),
      cell: ({ row }) => (
        <div className="flex flex-col">
          <div className="text-sm">{row.getValue('origin')}</div>
          <div className="text-sm text-gray-500">
            {row.original.destination}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'vehicleAssignments',
      header: createSortableHeader('Vehicles & Drivers'),
      cell: ({ row }) => {
        const assignments = row.original.vehicleAssignments || []
        return (
          <div className="justify-center items-center">
            <div className="text-sm font-medium">
              {assignments.length} vehicles
            </div>
            <div className="text-xs text-gray-500">
              {assignments.reduce(
                (total, assignment) =>
                  total + (assignment.drivers?.length || 0),
                0
              )}{' '}
              drivers
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'startDate',
      header: createSortableHeader('Start Date'),
    },
    {
      accessorKey: 'status',
      header: createSortableHeader('Status'),
      cell: ({ row }) => getTripStatusBadge(row.getValue('status')),
    },
    {
      accessorKey: 'progress',
      header: createSortableHeader('Progress'),
      cell: ({ row }) => (
        <div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div
              className={`h-2.5 rounded-full ${
                row.original.status === 'delayed'
                  ? 'bg-red-500'
                  : 'bg-green-500'
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
    {
      id: 'actions',
      header: 'actions',
      cell: ({ row }) => {
        const trip = row.original

        return createActionsColumn({ data: trip })
      },
    },
  ]
}

// data
const data = []

const headers = [
  'Trip ID',
  'Cost Centre',
  'Client',
  'Origin',
  'Destination',
  'Vehicles Assigned',
  'Drivers Assigned',
  'Start Date',
  'Status',
  'Progress (%)',
]

const rows = (data) => {
  return data.map((item) => {
    const vehicles = item.vehicleAssignments?.length || 0
    const drivers = item.vehicleAssignments?.reduce(
      (total, v) => total + (v.drivers?.length || 0),
      0
    )

    return [
      item.id || '',
      item.costCentre || '',
      item.clientDetails?.name || '',
      item.origin || '',
      item.destination || '',
      vehicles,
      drivers,
      item.startDate || '',
      item.status || '',
      item.progress != null ? item.progress : '',
    ]
  })
}

export const initialTripsState = {
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
