'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts'

interface DashboardData {
  executive: any
  fleetPerformance: any[]
  riskAssessment: any[]
  performance: any
  worstDrivers: any[]
  rewards: any
}

export default function ExecutiveDashboardEPS() {
  const [data, setData] = useState<DashboardData>({
    executive: {},
    fleetPerformance: [],
    riskAssessment: [],
    performance: {},
    worstDrivers: [],
    rewards: {}
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    try {
      setLoading(true)
      
      const [executiveRes, fleetRes, riskRes, performanceRes, worstDriversRes, rewardsRes] = await Promise.all([
        fetch('http://64.227.138.235:3000/api/eps-rewards/executive-dashboard'),
        fetch('http://64.227.138.235:3000/api/eps-rewards/fleet-performance'),
        fetch('http://64.227.138.235:3000/api/eps-rewards/driver-risk-assessment'),
        fetch('http://64.227.138.235:3000/api/eps-rewards/performance'),
        fetch('http://64.227.138.235:3000/api/eps-rewards/top-worst-drivers?days=30&limit=10'),
        fetch('http://64.227.138.235:3000/api/eps-rewards/rewards')
      ])
      
      const [executive, fleetPerformance, riskAssessment, performance, worstDrivers, rewards] = await Promise.all([
        executiveRes.json(),
        fleetRes.json(),
        riskRes.json(),
        performanceRes.json(),
        worstDriversRes.json(),
        rewardsRes.json()
      ])
      
      setData({
        executive,
        fleetPerformance: fleetPerformance.performance || [],
        riskAssessment: riskAssessment.drivers || [],
        performance,
        worstDrivers: worstDrivers.drivers || [],
        rewards
      })
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="p-6">Loading comprehensive dashboard...</div>

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-sky-100 via-blue-50 to-cyan-50 shadow-lg p-6 border border-blue-200 rounded-lg text-slate-800">
        <h1 className="font-bold text-2xl text-center">EPS Courier Services - Comprehensive Analytics Dashboard</h1>
      </div>

      {/* Executive KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Total Vehicles</p>
              <p className="text-2xl font-bold text-blue-600">{data.executive.total_vehicles || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Active Drivers</p>
              <p className="text-2xl font-bold text-green-600">{data.executive.active_drivers || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Total Rewards</p>
              <p className="text-2xl font-bold text-purple-600">{data.rewards.total_rewards || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Risk Events</p>
              <p className="text-2xl font-bold text-red-600">{data.riskAssessment.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance & Rewards Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{ score: { label: "Score", color: "#3b82f6" } }}>
              <AreaChart data={data.performance.monthly_data || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="avg_score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Driver Risk Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{
              high: { label: "High Risk", color: "#ef4444" },
              medium: { label: "Medium Risk", color: "#eab308" },
              low: { label: "Low Risk", color: "#22c55e" }
            }}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'High Risk', value: data.riskAssessment.filter(d => d.risk_tier === 'High').length, fill: '#ef4444' },
                    { name: 'Medium Risk', value: data.riskAssessment.filter(d => d.risk_tier === 'Medium').length, fill: '#eab308' },
                    { name: 'Low Risk', value: data.riskAssessment.filter(d => d.risk_tier === 'Low').length, fill: '#22c55e' }
                  ]}
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  dataKey="value"
                  label
                />
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rewards Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{ rewards: { label: "Rewards", color: "#8b5cf6" } }}>
              <BarChart data={data.rewards.top_earners || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="driver_name" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="total_points" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Fleet Performance & Monthly Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Fleet Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{
              score: { label: "Risk Score", color: "#ef4444" },
              violations: { label: "Violations", color: "#f59e0b" }
            }}>
              <BarChart data={data.riskAssessment.slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="driver_name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="total_risk_score" fill="#ef4444" />
                <Bar dataKey="violations_count" fill="#f59e0b" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Distance Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{ distance: { label: "Distance (km)", color: "#10b981" } }}>
              <LineChart data={data.performance.monthly_distance || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="total_km" stroke="#10b981" strokeWidth={3} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Worst Drivers (30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {data.worstDrivers.slice(0, 10).map((driver, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">{driver.driver_name || 'Unknown'}</p>
                    <p className="text-sm text-gray-600">{driver.plate || 'N/A'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-red-600">{driver.violations_count || 0} violations</p>
                    <Badge className={index < 3 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}>
                      {index < 3 ? 'Critical' : 'High'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Reward Earners</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {(data.rewards.top_earners || []).slice(0, 10).map((earner, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-green-50 rounded">
                  <div>
                    <p className="font-medium">{earner.driver_name || 'Unknown'}</p>
                    <p className="text-sm text-gray-600">Rank #{index + 1}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">{earner.total_points || 0}</p>
                    <p className="text-xs text-gray-500">points</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Fleet Summary Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded">
              <p className="text-2xl font-bold text-blue-600">{data.performance.total_distance || 0}</p>
              <p className="text-sm text-gray-600">Total Distance (km)</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded">
              <p className="text-2xl font-bold text-green-600">{data.performance.avg_efficiency || 0}%</p>
              <p className="text-sm text-gray-600">Avg Efficiency</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded">
              <p className="text-2xl font-bold text-purple-600">{data.rewards.total_points || 0}</p>
              <p className="text-sm text-gray-600">Total Points</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded">
              <p className="text-2xl font-bold text-red-600">{data.riskAssessment.filter(d => d.risk_tier === 'High').length}</p>
              <p className="text-sm text-gray-600">High Risk Drivers</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Assessment */}
      <Card>
        <CardHeader>
          <CardTitle>Driver Risk Assessment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Driver</th>
                  <th className="text-left p-2">Plate</th>
                  <th className="text-left p-2">Risk Score</th>
                  <th className="text-left p-2">Violations</th>
                  <th className="text-left p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.riskAssessment.slice(0, 10).map((driver, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-2">{driver.driver_name || 'Unknown'}</td>
                    <td className="p-2">{driver.plate || 'N/A'}</td>
                    <td className="p-2">{driver.total_risk_score || '0'}</td>
                    <td className="p-2">{driver.violations_count || '0'}</td>
                    <td className="p-2">
                      <Badge className={
                        driver.risk_tier === 'High' ? 'bg-red-100 text-red-800' :
                        driver.risk_tier === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }>
                        {driver.risk_tier || 'Low'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}