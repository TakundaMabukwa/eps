import { NextResponse } from 'next/server'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const tripId = searchParams.get('tripId')
  
  if (!tripId) {
    return NextResponse.json({ error: 'Trip ID is required' }, { status: 400 })
  }

  const canBusEndpoint = process.env.NEXT_PUBLIC_CAN_BUS_ENDPOINT

  try {
    const response = await fetch(
      `${canBusEndpoint}/api/trips/${tripId}/route?company=eps`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch trip route' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching trip route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
