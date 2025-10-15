'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, Trophy, TrendingUp, Users, Shield } from 'lucide-react'

interface ExecutiveData {
  overallRiskScore: number
  totalActiveUnits: number
  topPerformers: Array<{
    driverName: string
    totalPoints: number
    rewardLevel: string
  }>
  worstPerformers: Array<{
    driverName: string
    violations: number
    riskLevel: string
  }>
  fleetSummary: {
    averageEfficiency: number
    totalViolations: number
    complianceRate: number
  }
}

export default function ExecutiveDashboard() {
  const [data, setData] = useState<ExecutiveData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchExecutiveData()
  }, [])

  const fetchExecutiveData = async () => {
    try {
      setLoading(true)
      
      const [execResponse, riskResponse, activeResponse] = await Promise.all([
        fetch('/api/eps-rewards?endpoint=executive-dashboard'),
        fetch('/api/eps-rewards?endpoint=driver-risk-assessment'),
        fetch('/api/eps-vehicles?endpoint=active')
      ])

      const [execData, riskData, activeVehicles] = await Promise.all([
        execResponse.json(),
        riskResponse.json(),
        activeResponse.json()
      ])

      // Transform top worst drivers from executive dashboard
      const topPerformers = execData.top_10_worst_speeding_drivers_30_days?.slice(0, 5).map((driver: any, index: number) => ({
        driverName: driver.name,
        totalPoints: parseInt(driver.value) * 10, // Convert violations to points
        rewardLevel: index < 2 ? 'Gold' : index < 4 ? 'Silver' : 'Bronze'
      })) || []

      // Get worst performers from risk data
      const worstPerformers = riskData.drivers?.slice(0, 5).map((driver: any) => ({
        driverName: driver.driver_name,
        violations: driver.violations_count,
        riskLevel: driver.risk_category
      })) || []

      setData({
        overallRiskScore: execData.overall_risk_score || 4,
        totalActiveUnits: parseInt(execData.active_units_cards?.[1]?.value) || activeVehicles.length || 0,
        topPerformers,
        worstPerformers,
        fleetSummary: {
          averageEfficiency: 85, // Mock data
          totalViolations: execData.top_10_worst_speeding_drivers_30_days?.reduce((sum: number, d: any) => sum + parseInt(d.value), 0) || 0,
          complianceRate: 92 // Mock data
        }
      })
    } catch (error) {
      console.error('Error fetching executive data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRiskColor = (score: number) => {
    if (score >= 80) return 'text-red-600 bg-red-100'
    if (score >= 60) return 'text-yellow-600 bg-yellow-100'
    return 'text-green-600 bg-green-100'
  }

  const getRewardLevelColor = (level: string) => {
    switch (level) {
      case 'Gold': return 'bg-yellow-100 text-yellow-800'
      case 'Silver': return 'bg-gray-100 text-gray-800'
      case 'Bronze': return 'bg-orange-100 text-orange-800'
      default: return 'bg-slate-100 text-slate-800'
    }
  }

  if (loading) return <div className="p-6">Loading executive dashboard...</div>

  if (!data) return <div className="p-6">No data available</div>

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Executive Dashboard</h2>
        <p className="text-muted-foreground">Fleet performance overview and key metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Shield className="h-4 w-4 text-red-500" />
              Risk Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold p-2 rounded ${getRiskColor(data.overallRiskScore)}`}>
              {data.overallRiskScore}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              Active Units
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalActiveUnits}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              Compliance Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{data.fleetSummary.complianceRate}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              Total Violations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{data.fleetSummary.totalViolations}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.topPerformers.map((driver, index) => (
                <div key={driver.driverName} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </div>
                    <span className="font-medium">{driver.driverName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getRewardLevelColor(driver.rewardLevel)}>
                      {driver.rewardLevel}
                    </Badge>
                    <span className="font-bold">{driver.totalPoints} pts</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              High Risk Drivers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.worstPerformers.map((driver, index) => (
                <div key={driver.driverName} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </div>
                    <span className="font-medium">{driver.driverName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive">
                      {driver.violations} violations
                    </Badge>
                    <span className="text-red-600 font-bold">{driver.riskLevel}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}