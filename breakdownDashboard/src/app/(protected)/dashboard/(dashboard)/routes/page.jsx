'use client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import DetailCard from '@/components/ui/detail-card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { parseCSV } from '@/lib/test-csv-parser'
import { MapPin } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'

const DeliveryDashboard = () => {
  const [data, setData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [filters, setFilters] = useState({
    fixedRoute: 'All Routes',
    status: 'All Statuses',
    deliveryDate: '',
  })
  const [isLoading, setIsLoading] = useState(false)

  const uniqueRoutes = useMemo(
    () =>
      [...new Set(data.map((item) => item.fixedRoute))].filter(Boolean).sort(),
    [data]
  )
  const uniqueStatuses = useMemo(
    () => [...new Set(data.map((item) => item.status))].filter(Boolean).sort(),
    [data]
  )

  const applyFilters = useCallback(() => {
    let filtered = data

    if (filters.fixedRoute !== 'All Routes') {
      filtered = filtered.filter(
        (item) => item.fixedRoute === filters.fixedRoute
      )
    }

    if (filters.status !== 'All Statuses') {
      filtered = filtered.filter((item) => item.status === filters.status)
    }

    if (filters.deliveryDate) {
      filtered = filtered.filter((item) => {
        const itemDate = new Date(item.deliveryDate).toISOString().split('T')[0]
        return itemDate === filters.deliveryDate
      })
    }

    setFilteredData(filtered)
  }, [data, filters])

  useMemo(() => {
    applyFilters()
  }, [applyFilters])

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsLoading(true)
    try {
      const text = await file.text()
      const parsedData = parseCSV(text)
      setData(parsedData)
      setFilteredData(parsedData)
    } catch (error) {
      console.error('Error parsing CSV:', error)
      alert('Error parsing CSV file. Please check the format.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      fixedRoute: 'All Routes',
      status: 'All Statuses',
      deliveryDate: '',
    })
  }

  const loadSampleData = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(
        'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/next_routing_fil-4M4Jw5U4g53o4GpllUJEiFzdR4bfDn.csv'
      )
      const text = await response.text()
      const parsedData = parseCSV(text)
      setData(parsedData)
      setFilteredData(parsedData)
    } catch (error) {
      console.error('Error loading sample data:', error)
      alert('Error loading sample data.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Delivery Dashboard
          </h1>
          <p className="text-gray-600">
            Upload CSV data to visualize delivery locations and manage routes
          </p>
        </div>

        <DetailCard title={' Data Upload'}>
          {/* <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Data Upload
            </CardTitle>
          </CardHeader> */}
          {/* <CardContent> */}
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex-1">
              <Input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                disabled={isLoading}
                className="cursor-pointer"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={loadSampleData}
                disabled={isLoading}
                variant="outline"
              >
                {isLoading ? 'Loading...' : 'Load Sample Data'}
              </Button>
            </div>
          </div>
          {data.length > 0 && (
            <p className="text-sm text-gray-600 mt-2">
              Loaded {data.length} delivery records
            </p>
          )}
          {/* </CardContent> */}
        </DetailCard>

        {data.length > 0 && (
          <>
            <DetailCard title={' Filters'}>
              {/* <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filters
                </CardTitle>
              </CardHeader> */}
              {/* <CardContent> */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Select
                  value={filters.fixedRoute}
                  onValueChange={(value) =>
                    handleFilterChange('fixedRoute', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Fixed Route" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Routes">All Routes</SelectItem>
                    {uniqueRoutes.map((route) => (
                      <SelectItem key={route} value={route}>
                        {route}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={filters.status}
                  onValueChange={(value) => handleFilterChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Statuses">All Statuses</SelectItem>
                    {uniqueStatuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  type="date"
                  value={filters.deliveryDate}
                  onChange={(e) =>
                    handleFilterChange('deliveryDate', e.target.value)
                  }
                  placeholder="Delivery Date"
                />

                <Button onClick={clearFilters} variant="outline">
                  Clear Filters
                </Button>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Showing {filteredData.length} of {data.length} records
              </p>
              {/* </CardContent> */}
            </DetailCard>

            {/* <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Delivery Locations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-96 rounded-lg overflow-hidden">
                  <DeliveryMap data={filteredData} />
                </div>
              </CardContent>
            </Card> */}

            <Card>
              <CardHeader>
                <CardTitle>Delivery Data</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Doc No</TableHead>
                        <TableHead>Location Name</TableHead>
                        <TableHead>Delivery Date</TableHead>
                        <TableHead>Fixed Route</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Visit Time</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Total Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredData.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-mono text-sm">
                            {item.docNo}
                          </TableCell>
                          <TableCell>{item.locationName}</TableCell>
                          <TableCell>
                            {new Date(item.deliveryDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>{item.fixedRoute}</TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                item.status === 'Completed'
                                  ? 'bg-green-100 text-green-800'
                                  : item.status === 'In Progress'
                                  ? 'bg-blue-100 text-blue-800'
                                  : item.status === 'Unscheduled'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {item.status}
                            </span>
                          </TableCell>
                          <TableCell>
                            {item.visitStart} - {item.visitEnd}
                          </TableCell>
                          <TableCell>{item.duration} mins</TableCell>
                          <TableCell>
                            ${item.totalValue.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}

export default DeliveryDashboard
