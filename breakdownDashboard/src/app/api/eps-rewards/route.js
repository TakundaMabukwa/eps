import { NextResponse } from 'next/server'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const endpoint = searchParams.get('endpoint')
  const driverName = searchParams.get('driverName')
  const startDate = searchParams.get('startDate')
  const endDate = searchParams.get('endDate')

  try {
    let url = 'http://64.227.138.235:3000/api/eps-rewards/'
    
    switch (endpoint) {
      case 'driver-performance':
        if (driverName) {
          url += `driver-performance/${encodeURIComponent(driverName)}?startDate=${startDate}&endDate=${endDate}`
        } else {
          url += `driver-performance?startDate=${startDate}&endDate=${endDate}`
        }
        break
      case 'fleet-performance':
        // This endpoint doesn't exist, return driver risk assessment data instead
        url += 'driver-risk-assessment'
        break
      case 'executive-dashboard':
        url += 'executive-dashboard'
        break
      case 'leaderboard':
        url += `leaderboard?startDate=${startDate}&endDate=${endDate}&limit=10`
        break
      case 'daily-performance':
        // This endpoint doesn't exist, return empty array with proper structure
        return NextResponse.json({ data: [], message: 'Daily performance data not available' })
      case 'driver-risk-assessment':
        url += 'driver-risk-assessment'
        break
      default:
        return NextResponse.json({ error: 'Invalid endpoint' }, { status: 400 })
    }

    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`EPS API error: ${response.status}`)
    }
    
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching EPS rewards data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch EPS rewards data' },
      { status: 500 }
    )
  }
}