import { NextResponse } from 'next/server'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const endpoint = searchParams.get('endpoint')
  const plate = searchParams.get('plate')

  try {
    let url = 'http://64.227.138.235:3000/api/eps-vehicles'
    
    if (endpoint === 'by-plate' && plate) {
      url += `/by-plate?plate=${encodeURIComponent(plate)}`
    } else if (endpoint === 'count') {
      url += '/count'
    } else if (endpoint === 'active') {
      url += '/active'
    }
    
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`EPS API error: ${response.status}`)
    }
    
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching EPS vehicles:', error)
    return NextResponse.json(
      { error: 'Failed to fetch EPS vehicles' },
      { status: 500 }
    )
  }
}