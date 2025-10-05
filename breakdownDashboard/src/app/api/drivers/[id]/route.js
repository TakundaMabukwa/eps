import { NextResponse } from 'next/server'
// import * as dummy from '../../../../../dummy-data'
import { auth, db } from '@/lib/server-db'
import { verifyAuth } from '@/utils/verify-auth'
import { logUserActivity } from '@/utils/logUserActivity'

// Mock database
// let drivers = dummy.drivers_data

// *****************************
// get driver
// *****************************
// export async function GET(request, { params }) {
//   const { id } = await params
//   const driver = drivers.find((d) => d.id === id)

//   if (!driver) {
//     return NextResponse.json({ error: 'Driver not found' }, { status: 404 })
//   }

//   return NextResponse.json(driver)
// }

// *****************************
// update driver
// *****************************
export async function PUT(request, { params }) {
  const token = await verifyAuth(auth, db, request, 'verifyIdToken')
  const { id } = await params
  const body = await request.json()

  if (!token || !token.clientId) {
    return NextResponse.json(
      { error: 'You are not authorized' },
      { status: 401 }
    )
  }

  if (!id) {
    return NextResponse.json({ error: 'Missing user ID' }, { status: 400 })
  }
  try {
    // Step 1: Query drivers centre by ID field
    const querySnapshot = await db
      .collection(`companies/${token.clientId}/drivers`)
      .where('id', '==', id)
      .limit(1)
      .get()

    if (querySnapshot.empty) {
      return NextResponse.json(
        { error: `Driver with id: ${id} was not found` },
        { status: 404 }
      )
    }

    const doc = querySnapshot.docs[0]
    const docRef = doc.ref

    // Step 2: Merge existing data with new data
    const updatedData = { ...doc.data(), ...body }

    // Step 3: Update document in Firestore
    await docRef.set(updatedData)

    // update recentActivities
    const ip =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      request.ip || // depending on your hosting environment
      'unknown'

    await logUserActivity(db, token, {
      timestamp: new Date().toISOString(),
      activity: 'Updated Driver',
      ip: ip === '::1' ? 'localhost' : ip,
    })

    return NextResponse.json({ id, ...updatedData }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to update driver with id: ${id}` },
      { status: 500 }
    )
  }
}

// *****************************
// delete driver
// *****************************
export async function DELETE(request, { params }) {
  const token = await verifyAuth(auth, db, request, 'verifyIdToken')
  const { id } = await params

  if (!token && !token.clientId) {
    return NextResponse.json({ error: 'Not a valid user' }, { status: 401 })
  }

  if (!id) {
    return NextResponse.json({ error: 'Missing user ID' }, { status: 400 })
  }

  try {
    const querySnapshot = await db
      .collection(`companies/${token.clientId}/drivers`)
      .where('id', '==', id)
      .limit(1) // Optional: safety for unique IDs
      .get()

    if (querySnapshot.empty) {
      return NextResponse.json({ error: 'Driver not found' }, { status: 404 })
    }

    const doc = querySnapshot.docs[0]

    await doc.ref.delete()

    // // Increment vehicle count on cost centre
    // const costCentreData = costCentreDoc.data()
    // await costCentresRef.doc(costCentreId).update({
    //   drivers: (costCentreData.vehicles || 0) + 1,
    // })

    // update recentActivities
    const ip =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      request.ip || // depending on your hosting environment
      'unknown'

    await logUserActivity(db, token, {
      timestamp: new Date().toISOString(),
      activity: 'Deleted Driver',
      ip: ip === '::1' ? 'localhost' : ip,
    })

    return NextResponse.json(id, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Something went wrong...' },
      { status: 500 }
    )
  }
}
