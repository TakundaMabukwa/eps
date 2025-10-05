// next
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

// lib
import { auth } from '@/lib/server-db'

// components
import PageContainer from '@/components/layout/page-container'

const CostCentres = async () => {
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
    return <PageContainer screen={'cost-centres'} />
  } catch (err) {
    redirect('/')
  }
}

export default CostCentres
