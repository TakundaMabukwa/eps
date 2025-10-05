import { NextResponse } from 'next/server'
// import * as dummy from '../../../../../dummy-data'
import { verifyAuth } from '@/utils/verify-auth'
import { auth, db } from '@/lib/server-db'
import { logUserActivity } from '@/utils/logUserActivity'
// const costCentres = dummy.cost_centre_data
// *****************************
// get cost centre
// *****************************
// export async function GET(request, { params }) {
//   const { pageId, id } = await params

//   const data = dummy.cost_centre_data.find((cc) => cc.id === id)
//   // communicate with database
//   return NextResponse.json({ pageId, data })
// }

// *****************************
// update cost centre
// *****************************
export async function PUT(request, { params }) {
  const token = await verifyAuth(auth, db, request, 'verifyIdToken')
  const { id } = await params
  const body = await request.json()

  if (!token || !token.clientId) {
    return NextResponse.json(
      { error: 'Not authorized or missing clientId' },
      { status: 401 }
    )
  }

  if (!id) {
    return NextResponse.json(
      { error: 'Missing cost centre ID' },
      { status: 400 }
    )
  }

  try {
    // Step 1: Query cost centre by ID field
    const querySnapshot = await db
      .collection(`companies/${token.clientId}/costCentres`)
      .where('id', '==', id)
      .limit(1)
      .get()

    if (querySnapshot.empty) {
      return NextResponse.json(
        { error: 'Cost centre not found' },
        { status: 404 }
      )
    }

    const doc = querySnapshot.docs[0]
    const docRef = doc.ref

    // Step 2: Merge existing data with new data
    const updatedData = { ...doc.data(), ...body }

    // Step 3: Update document in Firestore
    await docRef.set(updatedData, { merge: true })

    // update recentActivities
    const ip =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      request.ip || // depending on your hosting environment
      'unknown'

    await logUserActivity(db, token, {
      timestamp: new Date().toISOString(),
      activity: 'Updated Cost Centre',
      ip: ip === '::1' ? 'localhost' : ip,
    })

    return NextResponse.json({ id, ...updatedData }, { status: 200 })
  } catch (error) {
    console.error('Error updating cost centre:', error)
    return NextResponse.json(
      { error: 'Failed to update cost centre' },
      { status: 500 }
    )
  }
}

// *****************************
// delete cost centre
// *****************************
export async function DELETE(request, { params }) {
  const token = await verifyAuth(auth, db, request, 'verifyIdToken')
  const { id } = await params

  if (!token && !token.clientId) {
    return NextResponse.json({ error: 'Not a valid user' }, { status: 401 })
  }

  if (!id) {
    return NextResponse.json(
      { error: 'Missing cost centre ID' },
      { status: 400 }
    )
  }

  try {
    const querySnapshot = await db
      .collection(`companies/${token.clientId}/costCentres`)
      .where('id', '==', id)
      .limit(1) // Optional: safety for unique IDs
      .get()

    if (querySnapshot.empty) {
      return NextResponse.json(
        { error: 'Cost centre not found' },
        { status: 404 }
      )
    }

    const doc = querySnapshot.docs[0]
    if (token.costCentreId == doc.costCentreId) {
      return NextResponse.json(
        { error: 'Main cost centre can not be deleted' },
        { status: 400 }
      )
    }
    await doc.ref.delete()

    // update recentActivities
    const ip =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      request.ip || // depending on your hosting environment
      'unknown'

    await logUserActivity(db, token, {
      timestamp: new Date().toISOString(),
      activity: 'Deleted Cost Centre',
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
