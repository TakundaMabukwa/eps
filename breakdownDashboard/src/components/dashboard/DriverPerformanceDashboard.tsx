'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Trophy, TrendingUp, AlertTriangle, Star, Search, Calendar } from 'lucide-react'

interface DriverPerformanceData {
  driverName: string
  plate: string
  totalPoints: number
  rewardLevel: string
  speedCompliance: number
  routeCompliance: number
  safetyScore: number
  efficiency: number
  violations: number
  lastUpdate: string
}

export default function DriverPerformanceDashboard() {
  const [drivers, setDrivers] = useState<DriverPerformanceData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [dateRange, setDateRange] = useState('30')

  useEffect(() => {
    fetchDriverPerformance()
  }, [dateRange])

  const fetchDriverPerformance = async () => {
    try {
      setLoading(true)
      
      // Fetch from multiple EPS endpoints
      const [riskResponse, performanceResponse, rewardsResponse] = await Promise.all([
        fetch('http://64.227.138.235:3000/api/eps-rewards/driver-risk-assessment'),
        fetch('http://64.227.138.235:3000/api/eps-rewards/performance'),
        fetch('http://64.227.138.235:3000/api/eps-rewards/rewards')
      ])
      
      const [riskData, performanceData, rewardsData] = await Promise.all([
        riskResponse.json(),
        performanceResponse.json(), 
        rewardsResponse.json()
      ])
      
      // Transform the data combining all sources
      const transformedData = riskData.drivers?.map((driver: any) => {
        const performance = performanceData.find((p: any) => p.driver_name === driver.driver_name) || {}
        const rewards = rewardsData.find((r: any) => r.driver_name === driver.driver_name) || {}
        
        return {
          driverName: driver.driver_name,
          plate: driver.plate,
          totalPoints: rewards.total_points || Math.floor(parseFloat(driver.total_risk_score) * 10) || 0,
          rewardLevel: rewards.reward_level || driver.risk_tier || 'Bronze',
          speedCompliance: performance.speed_compliance || Math.max(60, 100 - (driver.violations_count * 5)),
          routeCompliance: performance.route_compliance || Math.max(70, 95 - (driver.violations_count * 3)),
          safetyScore: performance.safety_score || Math.max(50, 90 - (driver.violations_count * 4)),
          efficiency: performance.efficiency || Math.max(60, 85 - (driver.violations_count * 2)),
          violations: driver.violations_count || 0,
          lastUpdate: driver.last_updated || new Date().toISOString()
        }
      }) || []
      
      setDrivers(transformedData)
    } catch (error) {
      console.error('Error fetching driver performance:', error)
      setDrivers([])
    } finally {
      setLoading(false)
    }
  }

  const filteredDrivers = drivers.filter(driver =>
    driver.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.plate.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getRewardLevelColor = (level: string) => {
    switch (level) {
      case 'Gold': return 'bg-yellow-100 text-yellow-800'
      case 'Silver': return 'bg-gray-100 text-gray-800'
      case 'Bronze': return 'bg-orange-100 text-orange-800'
      default: return 'bg-slate-100 text-slate-800'
    }
  }

  const getPerformanceColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (loading) return <div className="p-6">Loading driver performance...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Driver Performance Dashboard</h2>
          <p className="text-muted-foreground">Monitor driver performance metrics and reward levels</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search drivers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 days</SelectItem>
              <SelectItem value="30">30 days</SelectItem>
              <SelectItem value="90">90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredDrivers.map((driver) => (
          <Card key={`${driver.driverName}-${driver.plate}`} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-sm font-semibold leading-tight break-words">{driver.driverName}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">{driver.plate}</p>
                </div>
                <Badge className={`${getRewardLevelColor(driver.rewardLevel)} text-xs px-2 py-1 shrink-0`}>
                  {driver.rewardLevel}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-yellow-50 rounded-lg p-2">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Trophy className="h-3 w-3 text-yellow-600" />
                    <span className="text-xs font-medium">Points</span>
                  </div>
                  <span className="font-bold text-lg text-yellow-700">{driver.totalPoints}</span>
                </div>
                <div className="bg-blue-50 rounded-lg p-2">
                  <div className="text-xs font-medium mb-1 text-blue-700">Overall</div>
                  <span className="font-bold text-lg text-blue-700">
                    {Math.round((driver.speedCompliance + driver.routeCompliance + driver.safetyScore + driver.efficiency) / 4)}%
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Speed</span>
                  <span className={getPerformanceColor(driver.speedCompliance)}>{driver.speedCompliance}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${driver.speedCompliance}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Route</span>
                  <span className={getPerformanceColor(driver.routeCompliance)}>{driver.routeCompliance}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="bg-green-500 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${driver.routeCompliance}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Safety</span>
                  <span className={getPerformanceColor(driver.safetyScore)}>{driver.safetyScore}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="bg-purple-500 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${driver.safetyScore}%` }}
                  />
                </div>
              </div>

              {driver.violations > 0 && (
                <div className="flex items-center justify-between text-xs pt-1">
                  <div className="flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3 text-red-500" />
                    <span>Violations</span>
                  </div>
                  <Badge variant="destructive" className="text-xs px-1.5 py-0.5">{driver.violations}</Badge>
                </div>
              )}

              <div className="text-xs text-muted-foreground pt-1 border-t">
                Updated: {new Date(driver.lastUpdate).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDrivers.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-muted-foreground">
            {searchTerm ? 'No drivers found matching your criteria' : 'No driver performance data available'}
          </div>
        </div>
      )}
    </div>
  )
}