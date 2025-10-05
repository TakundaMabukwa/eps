import { NextResponse } from 'next/server'

import { verifyAuth } from '@/utils/verify-auth'
import { auth, db } from '@/lib/server-db'

// *****************************
// get trip
// *****************************
// export async function GET(request, { params }) {
//   const { id } = await params

//   const data = dummy.trips_data.find((t) => t.id === id)
//   // communicate with database
//   return NextResponse.json(data)
// }

// *****************************
// update trip
// *****************************
export async function PUT(request, { params }) {
  const token = await verifyAuth(auth, db, request, 'verifyIdToken')
  const { id } = await params
  const body = await request.json()
  // console.log({

  //   clientDetails: body.clientDetails,
  // })

  if (!token || !token.clientId) {
    return NextResponse.json(
      { error: 'Not authorized or missing clientId' },
      { status: 401 }
    )
  }

  if (!id) {
    return NextResponse.json({ error: 'Trip centre ID' }, { status: 400 })
  }

  try {
    // Step 1: Query cost centre by ID field
    const querySnapshot = await db
      .collection(`companies/${token.clientId}/trips`)
      .where('id', '==', id)
      .limit(1)
      .get()

    if (querySnapshot.empty) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 })
    }

    const doc = querySnapshot.docs[0]
    const docRef = doc.ref

    // Step 2: Merge existing data with new data
    const updatedData = { ...doc.data(), ...body }

    // Step 3: Update document in Firestore
    await docRef.set(updatedData, { merge: true })

    // Step 4: Update cost centre's activeTrips count
    if (body.status === 'completed' || body.status === 'cancelled') {
      const costCentreQuery = await db
        .collection(`companies/${token.clientId}/costCentres`)
        .where('id', '==', doc.data().costCentre)
        .limit(1)
        .get()

      if (costCentreQuery.empty) {
        console.warn(`Cost centre ${doc.data().costCentre} not found`)
      } else {
        const costCentreDoc = costCentreQuery.docs[0]
        const currentActiveTrips = costCentreDoc.data().activeTrips || 0
        await costCentreDoc.ref.update({
          activeTrips: Math.max(0, currentActiveTrips - 1),
        })
      }
    }

    // Step 5: Update  Vehicles Drivers Status
    const vehicles = body.vehicleAssignments.map((v) => v.vehicle)
    const drivers = body.vehicleAssignments.flatMap((v) => v.drivers)

    const statusForEntities = ['completed', 'cancelled'].includes(body.status)
      ? 'available'
      : 'on-trip'
    const tripIdForDriver = body.status === 'completed' ? null : body.id

    await Promise.all(
      vehicles.map(async (v) => {
        const vehicleQuery = await db
          .collection(`companies/${token.clientId}/vehicles`)
          .where('id', '==', v.id)
          .limit(1)
          .get()

        if (vehicleQuery.empty) {
          console.warn(`Vehicle with id ${v.id} not found`)
          return
        }

        const vehicleDoc = vehicleQuery.docs[0]
        await vehicleDoc.ref.update({
          status: statusForEntities,
          assignedTo: body.clientDetails.name,
        })
      })
    )

    await Promise.all(
      drivers.map(async (d) => {
        const driverQuery = await db
          .collection(`companies/${token.clientId}/drivers`)
          .where('id', '==', d.id)
          .limit(1)
          .get()

        if (driverQuery.empty) {
          console.warn(`Driver with id ${d.id} not found`)
          return
        }

        const driverDoc = driverQuery.docs[0]
        await driverDoc.ref.update({
          status: statusForEntities,
          currentTrip: tripIdForDriver,
        })
      })
    )

    return NextResponse.json({ id, ...updatedData }, { status: 200 })
  } catch (error) {
    console.error('Error updating trip:', error)
    return NextResponse.json(
      { error: 'Failed to update trips' },
      { status: 500 }
    )
  }
}

// *****************************
// delete trip
// *****************************
export async function DELETE(request, { params }) {
  const token = await verifyAuth(auth, db, request, 'verifyIdToken')
  const { id } = await params
  if (!token && !token.clientId) {
    return NextResponse.json({ error: 'Not a valid user' }, { status: 401 })
  }

  if (!id) {
    return NextResponse.json({ error: 'Missing trip ID' }, { status: 400 })
  }
  try {
    const querySnapshot = await db
      .collection(`companies/${token.clientId}/trips`)
      .where('id', '==', id)
      .limit(1) // Optional: safety for unique IDs
      .get()

    if (querySnapshot.empty) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 })
    }

    const doc = querySnapshot.docs[0]

    // Step 1: Update cost centre's activeTrips count
    const costCentreRef = db
      .collection(`companies/${token.clientId}/costCentres`)
      .doc(doc.data().costCentre)
    await costCentreRef.update({
      activeTrips: doc.data().activeTrips - 1,
    })

    // Step 2: Update vehicles and drivers status
    const vehicles = doc.data().vehicleAssignments.map((v) => v.vehicle)
    const drivers = doc.data().vehicleAssignments.flatMap((v) => v.drivers)

    const statusForEntities = 'available'
    const tripIdForDriver = null

    await Promise.all(
      vehicles.map(async (v) => {
        const vehicleQuery = await db
          .collection(`companies/${token.clientId}/vehicles`)
          .where('id', '==', v.id)
          .limit(1)
          .get()

        if (vehicleQuery.empty) {
          console.warn(`Vehicle with id ${v.id} not found`)
          return
        }

        const vehicleDoc = vehicleQuery.docs[0]
        await vehicleDoc.ref.update({
          status: statusForEntities,
          assignedTo: null,
        })
      })
    )

    await Promise.all(
      drivers.map(async (d) => {
        const driverQuery = await db
          .collection(`companies/${token.clientId}/drivers`)
          .where('id', '==', d.id)
          .limit(1)
          .get()

        if (driverQuery.empty) {
          console.warn(`Driver with id ${d.id} not found`)
          return
        }

        const driverDoc = driverQuery.docs[0]
        await driverDoc.ref.update({
          status: statusForEntities,
          currentTrip: tripIdForDriver,
        })
      })
    )

    await doc.ref.delete()

    return NextResponse.json(id, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Something went wrong...' },
      { status: 500 }
    )
  }
}
