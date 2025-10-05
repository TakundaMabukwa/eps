// next
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

// lib
import { auth } from '@/lib/server-db'

// components
import CostCentreDetails from '@/components/detail-pages/cost-centre-screen'

const CostCentreDetailsPage = async ({ params }) => {
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
    return <CostCentreDetails id={id} />
  } catch (err) {
    redirect('/')
  }
}

export default CostCentreDetailsPage
