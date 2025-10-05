// next
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

// lib
import { auth } from '@/lib/server-db'

// components
import UserDetails from '@/components/detail-pages/user-details'

const UserDetailsPage = async ({ params }) => {
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
    return <UserDetails id={id} />
  } catch (err) {
    redirect('/')
  }
}

export default UserDetailsPage
