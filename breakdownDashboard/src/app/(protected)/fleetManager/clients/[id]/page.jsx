import ClientDetails from '@/components/detail-pages/client-details'
import { auth } from '@/lib/server-db'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const ClientDetailsPage = async ({ params }) => {
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
    return <ClientDetails id={id} />
  } catch (err) {
    redirect('/')
  }
}

export default ClientDetailsPage
