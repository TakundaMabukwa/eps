'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Search, DollarSign, Truck, Calendar, FileText, Eye, MapPin } from 'lucide-react'

export default function AuditPage() {
  const [auditRecords, setAuditRecords] = useState<any[]>([])
  const [filteredRecords, setFilteredRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showSummary, setShowSummary] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<any>(null)
  const [summaryOpen, setSummaryOpen] = useState(false)
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchAuditRecords()
  }, [])

  useEffect(() => {
    filterRecords()
  }, [auditRecords, statusFilter, searchTerm])

  const fetchAuditRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('audit')
        .select('*')
        .order('updated_at', { ascending: false })

      if (error) throw error
      setAuditRecords(data || [])
    } catch (error) {
      console.error('Error fetching audit records:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterRecords = () => {
    let filtered = auditRecords

    if (statusFilter !== 'all') {
      filtered = filtered.filter(record => record.status === statusFilter)
    } else {
      filtered = filtered.filter(record => record.status === 'delivered' || record.status === 'completed')
    }

    if (searchTerm) {
      filtered = filtered.filter(record => 
        record.trip_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.ordernumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.origin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.destination?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredRecords(filtered)
  }

  const calculateSummary = () => {
    const totalTrips = filteredRecords.length
    const totalCost = filteredRecords.reduce((sum, record) => sum + (record.actual_total_cost || 0), 0)
    const totalDistance = filteredRecords.reduce((sum, record) => sum + (record.actual_distance || 0), 0)
    const avgCostPerTrip = totalTrips > 0 ? totalCost / totalTrips : 0
    const avgCostPerKm = totalDistance > 0 ? totalCost / totalDistance : 0

    return {
      totalTrips,
      totalCost,
      totalDistance,
      avgCostPerTrip,
      avgCostPerKm,
      deliveredTrips: filteredRecords.filter(r => r.status === 'delivered').length,
      completedTrips: filteredRecords.filter(r => r.status === 'completed').length
    }
  }

  const summary = calculateSummary()

  // Helpers for the summary modal
  const fmtDateTime = (val: any) => {
    if (!val) return 'N/A'
    try {
      const d = new Date(val)
      if (isNaN(d.getTime())) return String(val)
      return d.toLocaleString('en-ZA', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit',
        hour: '2-digit', 
        minute: '2-digit' 
      })
    } catch (e) {
      return String(val)
    }
  }

  const fmtTime = (val: any) => {
    if (!val) return 'N/A'
    try {
      const d = new Date(val)
      if (isNaN(d.getTime())) return String(val)
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } catch (e) {
      return String(val)
    }
  }

  const fmtDuration = (val: any) => {
    if (!val) return 'N/A'
    // if value is already hh:mm:ss string return it
    if (typeof val === 'string' && val.includes(':')) return val
    // if it's seconds
    const secs = Number(val)
    if (isNaN(secs)) return String(val)
    const h = Math.floor(secs / 3600)
    const m = Math.floor((secs % 3600) / 60)
    const s = Math.floor(secs % 60)
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  const fmtMinutesToHours = (minutes: number, showDirection = false) => {
    if (minutes === 0) return '0h 0m'
    const absMinutes = Math.abs(minutes)
    const hours = Math.floor(absMinutes / 60)
    const mins = absMinutes % 60
    const direction = showDirection ? (minutes < 0 ? ' early' : ' late') : ''
    if (hours === 0) return `${absMinutes}m${direction}`
    if (mins === 0) return `${hours}h${direction}`
    return `${hours}h ${mins}m${direction}`
  }

  const diffTime = (planned: any, actual: any) => {
    if (!planned || !actual) return 'N/A'
    try {
      const p = new Date(planned).getTime()
      const a = new Date(actual).getTime()
      if (isNaN(p) || isNaN(a)) return 'N/A'
      const diff = Math.abs(a - p) / 1000
      return fmtDuration(diff)
    } catch (e) {
      return 'N/A'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading audit records...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Audit Dashboard</h1>
        <Button 
          onClick={() => setShowSummary(!showSummary)}
          variant={showSummary ? "default" : "outline"}
        >
          <FileText className="w-4 h-4 mr-2" />
          {showSummary ? 'Hide Summary' : 'Show Summary'}
        </Button>
      </div>

      {showSummary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Trips</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalTrips}</div>
              <p className="text-xs text-muted-foreground">
                {summary.deliveredTrips} delivered, {summary.completedTrips} completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R{summary.totalCost.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</div>
              <p className="text-xs text-muted-foreground">
                Avg: R{summary.avgCostPerTrip.toLocaleString('en-ZA', { minimumFractionDigits: 2 })} per trip
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Distance</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalDistance.toLocaleString('en-ZA')} km</div>
              <p className="text-xs text-muted-foreground">
                Avg: {(summary.totalDistance / Math.max(summary.totalTrips, 1)).toFixed(1)} km per trip
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cost per KM</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R{summary.avgCostPerKm.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Average rate</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by trip ID, order number, origin, or destination..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Audit Records ({filteredRecords.length})</h2>
        </div>
        
        <div className="overflow-x-auto">
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="min-w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="h-10 px-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Trip ID</th>
                  <th className="h-10 px-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Client</th>
                  <th className="h-10 px-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Cargo</th>
                  <th className="h-10 px-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Route</th>
                  <th className="h-10 px-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record) => (
                  <tr key={record.trip_id} className="h-12 hover:bg-slate-50 border-b border-slate-100 transition-colors">
                    <td className="px-3 py-2 text-sm font-medium text-slate-900">
                      {record.trip_id}
                    </td>
                    <td className="px-3 py-2 text-sm text-slate-700">
                      {record.selectedclient || record.selected_client || 'N/A'}
                    </td>
                    <td className="px-3 py-2 text-sm text-slate-700">
                      {record.cargo || 'N/A'}
                    </td>
                    <td className="px-3 py-2 text-sm text-slate-700">
                      <div className="max-w-xs">
                        <div className="truncate text-sm">{record.origin || 'N/A'}</div>
                        <div className="text-xs text-slate-500 truncate">→ {record.destination || 'N/A'}</div>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedRecord(record)
                          setSummaryOpen(true)
                        }}
                        className="h-7 px-2 text-xs"
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredRecords.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No audit records found matching your criteria.
            </div>
          )}
        </div>
      </div>
      {/* Summary Modal for selected trip */}
      {summaryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-2xl w-[98vw] h-[95vh] max-w-none overflow-hidden">
            <div className="flex items-center justify-between px-8 py-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Trip Summary - {selectedRecord?.trip_id}</h2>
                <p className="text-sm text-slate-600 mt-1">Comprehensive planned vs actual analysis</p>
              </div>
              <button 
                onClick={() => setSummaryOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            
            <div className="overflow-y-auto h-full p-8 pb-20">
              {selectedRecord ? (
                <div className="w-full">
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="h-10 px-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Metric</th>
                          <th className="h-10 px-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Planned</th>
                          <th className="h-10 px-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Actual</th>
                          <th className="h-10 px-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Variance</th>
                        </tr>
                      </thead>
                    <tbody>
                      {[
                        { key: 'start', label: 'Start Time', planned: selectedRecord.planned_start_time, actual: selectedRecord.actual_start_time, kind: 'datetime' },
                        { key: 'finish', label: 'Finish Time', planned: selectedRecord.planned_finish_time, actual: selectedRecord.actual_finish_time, kind: 'datetime' },
                        { key: 'distance', label: 'Distance', planned: selectedRecord.planned_distance, actual: selectedRecord.actual_distance || selectedRecord.distance, kind: 'number', unit: 'km' },
                        { key: 'duration', label: 'Duration', planned: selectedRecord.planned_duration_minutes, actual: selectedRecord.actual_duration_minutes, kind: 'number', unit: 'min' },
                      ].map((row, i) => {
                        const p = row.planned
                        const a = row.actual

                        // compute variance (actual - planned)
                        let varianceDisplay = 'N/A'
                        let isPositive = false
                        
                        // Use stored variance values or calculate if both planned and actual exist
                        if (row.key === 'start' && selectedRecord.start_time_variance_minutes != null) {
                          const variance = selectedRecord.start_time_variance_minutes
                          varianceDisplay = fmtMinutesToHours(variance, true)
                          isPositive = variance > 0
                        } else if (row.key === 'finish' && selectedRecord.finish_time_variance_minutes != null) {
                          const variance = selectedRecord.finish_time_variance_minutes
                          varianceDisplay = fmtMinutesToHours(variance, true)
                          isPositive = variance > 0
                        } else if (row.key === 'distance' && selectedRecord.distance_variance != null) {
                          const variance = selectedRecord.distance_variance
                          const absVariance = Math.abs(variance)
                          const direction = variance < 0 ? ' shorter' : ' longer'
                          varianceDisplay = `${absVariance} km${direction}`
                          isPositive = variance > 0
                        } else if (row.key === 'duration' && selectedRecord.duration_variance_minutes != null) {
                          const variance = selectedRecord.duration_variance_minutes
                          const direction = variance < 0 ? ' faster' : ' slower'
                          varianceDisplay = `${fmtMinutesToHours(variance)}${direction}`
                          isPositive = variance > 0
                        } else if (p != null && a != null) {
                          if (row.kind === 'datetime') {
                            const pd = new Date(p).getTime()
                            const ad = new Date(a).getTime()
                            if (!isNaN(pd) && !isNaN(ad)) {
                              const diffMins = Math.round((ad - pd) / (1000 * 60))
                              varianceDisplay = fmtMinutesToHours(diffMins, true)
                              isPositive = diffMins > 0
                            }
                          } else if (row.kind === 'number') {
                            const pdn = Number(p)
                            const adn = Number(a)
                            if (!isNaN(pdn) && !isNaN(adn)) {
                              const diff = adn - pdn
                              if (row.unit === 'min') {
                                const direction = diff < 0 ? ' faster' : ' slower'
                                varianceDisplay = `${fmtMinutesToHours(diff)}${direction}`
                              } else if (row.unit === 'km') {
                                const absVariance = Math.abs(diff)
                                const direction = diff < 0 ? ' shorter' : ' longer'
                                varianceDisplay = `${absVariance.toFixed(1)} km${direction}`
                              } else {
                                varianceDisplay = `${Math.abs(diff).toFixed(0)}${row.unit ? ` ${row.unit}` : ''}`
                              }
                              isPositive = diff > 0
                            }
                          }
                        }

                        // decide color: if higherIsBetter (speed), positive diff is good -> green, else red
                        const positiveIsGood = !!row.higherIsBetter
                        const isGood = p == null || a == null ? null : (positiveIsGood ? isPositive : !isPositive)
                        const badgeClass = isGood == null ? 'text-slate-600 bg-slate-100' : isGood ? 'text-emerald-800 bg-emerald-100' : 'text-rose-800 bg-rose-100'

                        return (
                          <tr key={row.key} className="h-12 hover:bg-slate-50 border-b border-slate-100 transition-colors">
                            <td className="px-3 py-2 text-sm font-medium text-slate-900">{row.label}</td>
                            <td className="px-3 py-2 text-sm text-slate-700">
                              {row.kind === 'datetime' ? fmtDateTime(row.planned) : 
                               row.planned == null ? 'N/A' : 
                               row.unit === 'min' ? fmtMinutesToHours(row.planned).replace(/^\+/, '') : 
                               `${row.planned}${row.unit ? ` ${row.unit}` : ''}`}
                            </td>
                            <td className="px-3 py-2 text-sm text-slate-900 font-medium">
                              {row.kind === 'datetime' ? fmtDateTime(row.actual) : 
                               row.actual == null ? 'N/A' : 
                               row.unit === 'min' ? fmtMinutesToHours(row.actual).replace(/^\+/, '') : 
                               `${row.actual}${row.unit ? ` ${row.unit}` : ''}`}
                            </td>
                            <td className="px-3 py-2 text-sm">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badgeClass}`}>
                                {varianceDisplay}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Financial Information Section */}
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Financial Analysis
                    </h3>
                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="h-10 px-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Cost Component</th>
                            <th className="h-10 px-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Planned</th>
                            <th className="h-10 px-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Actual</th>
                            <th className="h-10 px-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Variance</th>
                          </tr>
                        </thead>
                      <tbody>
                        {[
                          { key: 'fuel', label: 'Fuel Cost', planned: selectedRecord.planned_fuel_cost, actual: selectedRecord.actual_fuel_cost, kind: 'currency' },
                          { key: 'vehicle', label: 'Vehicle Cost', planned: selectedRecord.planned_vehicle_cost, actual: selectedRecord.actual_vehicle_cost, kind: 'currency' },
                          { key: 'driver', label: 'Driver Cost', planned: selectedRecord.planned_driver_cost, actual: selectedRecord.actual_driver_cost, kind: 'currency' },
                          { key: 'total', label: 'Total Cost', planned: selectedRecord.planned_total_cost, actual: selectedRecord.actual_total_cost, kind: 'currency', isTotal: true },
                        ].map((row, i) => {
                          const p = parseFloat(row.planned) || 0
                          const a = parseFloat(row.actual) || 0
                          const variance = a - p
                          // Handle cases where actual is 0 but planned exists
                          const varianceDisplay = (() => {
                            if (p === 0 && a === 0) return 'No variance'
                            if (a === 0 && p > 0) return `R${p.toLocaleString('en-ZA', { minimumFractionDigits: 2 })} under budget`
                            if (p === 0 && a > 0) return `R${a.toLocaleString('en-ZA', { minimumFractionDigits: 2 })} over budget`
                            if (variance === 0) return 'No variance'
                            const absVariance = Math.abs(variance)
                            const direction = variance > 0 ? ' over budget' : ' under budget'
                            return `R${absVariance.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}${direction}`
                          })()
                          const isOverBudget = (() => {
                            if (p === 0 && a === 0) return null
                            if (a === 0 && p > 0) return false // Under budget (no actual cost)
                            if (p === 0 && a > 0) return true  // Over budget (unexpected cost)
                            return variance > 0
                          })()
                          const badgeClass = isOverBudget === null ? 'text-slate-600 bg-slate-100' : isOverBudget ? 'text-rose-800 bg-rose-100' : 'text-emerald-800 bg-emerald-100'
                          const rowClass = row.isTotal ? 'bg-blue-50 border-t-2 border-blue-200' : 'h-12 hover:bg-slate-50 border-b border-slate-100 transition-colors'

                          return (
                            <tr key={row.key} className={rowClass}>
                              <td className={`px-3 py-2 text-sm ${row.isTotal ? 'font-bold text-slate-900' : 'font-medium text-slate-900'}`}>{row.label}</td>
                              <td className="px-3 py-2 text-sm text-slate-700">
                                {p >= 0 ? `R${p.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}` : 'N/A'}
                              </td>
                              <td className={`px-3 py-2 text-sm ${row.isTotal ? 'font-bold text-slate-900' : 'font-medium text-slate-900'}`}>
                                {a >= 0 ? `R${a.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}` : 'N/A'}
                              </td>
                              <td className="px-3 py-2 text-sm">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badgeClass}`}>
                                  {varianceDisplay}
                                </span>
                              </td>
                            </tr>
                          )
                        })}
                        </tbody>
                      </table>
                    </div>
                    
                    {/* Additional Financial Metrics */}
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">Vehicle Type</div>
                        <div className="text-sm font-medium text-slate-900 mt-1">{selectedRecord.vehicle_type || 'N/A'}</div>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">Fuel Price Used</div>
                        <div className="text-sm font-medium text-slate-900 mt-1">
                          {selectedRecord.fuel_price_used ? `R${parseFloat(selectedRecord.fuel_price_used).toFixed(2)}/L` : 'N/A'}
                        </div>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">Cost Per KM</div>
                        <div className="text-sm font-medium text-slate-900 mt-1">
                          {selectedRecord.actual_total_cost && (selectedRecord.actual_distance || selectedRecord.distance) ? 
                            `R${(parseFloat(selectedRecord.actual_total_cost) / parseFloat(selectedRecord.actual_distance || selectedRecord.distance)).toFixed(2)}/km` : 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">No trip selected</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}