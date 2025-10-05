// import * as dummy from '../../../../dummy-data'

// next
import { NextResponse } from 'next/server'

// database
import { auth, db } from '@/lib/server-db'

// helpers
import { getUserScopedDrivers } from '@/utils/drivers'
import { verifyAuth } from '@/utils/verify-auth'
import { logUserActivity } from '@/utils/logUserActivity'

// Mock database
// const drivers = dummy.drivers_data

// *****************************
// get drivers
// *****************************
export async function GET(request) {
  const token = await verifyAuth(auth, db, request, 'verifyIdToken')

  if (!token) {
    return NextResponse.json({ error: 'not a valid user' }, { status: 500 })
  }

  try {
    const drivers = await getUserScopedDrivers(token)
    return NextResponse.json(drivers)
  } catch (err) {
    console.log({ error: err.message })
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// *****************************
// add driver
// *****************************
export async function POST(request) {
  const token = await verifyAuth(auth, db, request, 'verifyIdToken')

  if (!token) {
    return NextResponse.json({ error: 'not a valid user' }, { status: 500 })
  }

  try {
    const body = await request.json()
    const clientId = token.clientId

    const driversRef = db.collection(`companies/${clientId}/drivers`)
    const costCentresRef = db.collection(`companies/${clientId}/costCentres`)

    // Lookup costCentreId by name
    const costCentreSnap = await costCentresRef
      .where('name', '==', body.costCentre)
      .limit(1)
      .get()

    if (costCentreSnap.empty) {
      return NextResponse.json(
        { error: 'Cost centre not found' },
        { status: 404 }
      )
    }

    const costCentreDoc = costCentreSnap.docs[0]
    const costCentreId = costCentreDoc.id

    // Get last used driver ID
    const lastSnap = await driversRef.orderBy('id', 'desc').limit(1).get()

    let lastIdNum = 0
    if (!lastSnap.empty) {
      const lastId = lastSnap.docs[0].data().id
      lastIdNum = parseInt(lastId.split('-')[1]) || 0
    }

    const newId = `DRV-${String(lastIdNum + 1).padStart(3, '0')}`

    // Create the driver object
    const newDriver = {
      ...body,
      clientId,
      costCentreId,
      id: newId,
      status: body.status || 'active',
      createdAt: new Date().toISOString().split('T')[0],
    }

    const docRef = await driversRef.add(newDriver)
    await driversRef.doc(docRef.id).update({ uid: docRef.id })

    // Increment vehicle count on cost centre
    const costCentreData = costCentreDoc.data()
    await costCentresRef.doc(costCentreId).update({
      drivers: (costCentreData.vehicles || 0) + 1,
    })

    // update recentActivities
    const ip =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      request.ip || // depending on your hosting environment
      'unknown'

    await logUserActivity(db, token, {
      timestamp: new Date().toISOString(),
      activity: 'Added Driver',
      ip: ip === '::1' ? 'localhost' : ip,
    })
    return NextResponse.json({ id: docRef.id, ...newDriver }, { status: 201 })
  } catch (error) {
    const firebaseError = error?.errorInfo?.code || error.code || ''
    let errorMessage = firebaseError

    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

//  const body = await request.json()

//   // Generate a new ID
//   const lastId =
//     drivers.length > 0
//       ? Number.parseInt(drivers[drivers.length - 1].id.split('-')[1])
//       : 0
//   const newId = `DRV-${String(lastId + 1).padStart(3, '0')}`

// const newDriver = {
//   id: newId,
//   name: body.name || '',
//   phone: body.phone || '',
//   email: body.email || '',
//   license: body.license || '',
//   licenseExpiry: body.licenseExpiry || '',
//   experience: body.experience || '',
//   status: body.status || 'active',
//   costCentre: body.costCentre || '',
//   currentVehicle: body.currentVehicle || '',
//   address: body.address || '',
//   dateOfBirth: body.dateOfBirth || '',
//   emergencyContact: body.emergencyContact || '',
//   emergencyPhone: body.emergencyPhone || '',
//   hireDate: body.hireDate || '',
//   certifications: body.certifications || [],
//   medicalExamExpiry: body.medicalExamExpiry || '',
//   drivingRecord: body.drivingRecord || {
//     violations: 0,
//     accidents: 0,
//     lastReviewDate: '',
//   },
//   currentTrip: null,
//   recentTrips: [],
// }

// drivers.push(newDriver)
// return NextResponse.json(drivers, { status: 201 })
