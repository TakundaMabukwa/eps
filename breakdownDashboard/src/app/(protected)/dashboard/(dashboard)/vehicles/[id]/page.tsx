// next
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

// lib
import { auth } from '@/lib/server-db'

// components
import VehicleDetails from '@/components/detail-pages/vehicle-details'

const VehicleDetailsPage = async ({ params }) => {
  const { id } = await params
  try {
    const cookieStore = await cookies()
    const token = cookieStore?.get('firebaseIdToken')?.value

    if (!token) {
      redirect('/')
    }
    const decodedToken = await auth.verifyIdToken(token)
    if (!decodedToken) {
      redirect('/')
    }
    return <VehicleDetails id={id} />
  } catch (err) {
    redirect('/')
  }
}

export default VehicleDetailsPage
