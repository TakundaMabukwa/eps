import { NextResponse } from 'next/server'
// import * as dummy from '../../../../dummy-data'
import { verifyAuth } from '@/utils/verify-auth'
import { getUserScopedVehicles } from '@/utils/vehicles'
import { auth, db } from '@/lib/server-db'

// Mock database
// let vehicles = dummy.vehicles_data

// *****************************
// get vehicles
// *****************************
export async function GET(request) {
  const token = await verifyAuth(auth, db, request, 'verifyIdToken')

  if (!token) {
    return NextResponse.json({ error: 'not a valid user' }, { status: 500 })
  }

  try {
    const vehicles = await getUserScopedVehicles(token)
    return NextResponse.json(vehicles)
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// *****************************
// add vehicle
// *****************************
export async function POST(request) {
  const token = await verifyAuth(auth, db, request, 'verifyIdToken')

  if (!token) {
    return NextResponse.json({ error: 'not a valid user' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const clientId = token.clientId

    // Firestore references
    const vehiclesRef = db.collection(`companies/${clientId}/vehicles`)
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

    // Get last used vehicle ID
    const lastSnap = await vehiclesRef.orderBy('id', 'desc').limit(1).get()

    let lastIdNum = 0
    if (!lastSnap.empty) {
      const lastId = lastSnap.docs[0].data().id
      lastIdNum = parseInt(lastId.split('-')[1]) || 0
    }

    const newId = `VEH-${String(lastIdNum + 1).padStart(3, '0')}`

    // Create the vehicle object
    const newVehicle = {
      ...body,
      clientId,
      costCentreId,
      id: newId,
      status: body.status || 'active',
      createdAt: new Date().toISOString().split('T')[0],
    }

    const docRef = await vehiclesRef.add(newVehicle)

    // Increment vehicle count on cost centre
    const costCentreData = costCentreDoc.data()
    await costCentresRef.doc(costCentreId).update({
      vehicles: (costCentreData.vehicles || 0) + 1,
    })

    return NextResponse.json({ id: docRef.id, ...newVehicle }, { status: 201 })
  } catch (error) {
    console.error('Error adding vehicle:', error)

    const firebaseError = error?.errorInfo?.code || error.code || ''
    let errorMessage = 'Server error'

    if (firebaseError === 'auth/email-already-exists') {
      errorMessage = 'A user with that email already exists.'
    } else if (firebaseError === 'auth/invalid-email') {
      errorMessage = 'Invalid email address.'
    } else {
      errorMessage = error.message || 'An unexpected error occurred.'
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

// *****************************
// // add vehicle
// // *****************************
// export async function POST(request) {
//   const token = await verifyAuth(auth, db, request, 'verifyIdToken')

//   if (!token) {
//     return NextResponse.json({ error: 'not a valid user' }, { status: 500 })
//   }

//   try {
//   } catch (error) {
//     const firebaseError = error?.errorInfo?.code || error.code || ''
//     let errorMessage = 'Server error'

//     if (firebaseError === 'auth/email-already-exists') {
//       errorMessage = 'A user with that email already exists.'
//     } else if (firebaseError === 'auth/invalid-email') {
//       errorMessage = 'Invalid email address.'
//     } else {
//       errorMessage = error.message || 'An unexpected error occurred.'
//     }

//     return NextResponse.json({ error: errorMessage }, { status: 500 })
//   }

//   // // Generate a new ID
//   // const lastId =
//   //   vehicles.length > 0
//   //     ? Number.parseInt(vehicles[vehicles.length - 1].id.split('-')[1])
//   //     : 0
//   // const newId = `VEH-${String(lastId + 1).padStart(3, '0')}`

//   // const newVehicle = {
//   //   ...body,
//   //   id: newId,
//   // }

//   // vehicles.push(newVehicle)

//   return NextResponse.json(newVehicle, { status: 201 })
// }
