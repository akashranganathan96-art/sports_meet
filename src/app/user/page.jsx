import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth'
import UserVotingInterface from '@/components/UserVotingInterface'
import Header from '@/components/Header'

export default async function UserPage() {
const cookieStore = await cookies()
const token = cookieStore.get('auth-token')?.value


  if (!token) {
    redirect('/login')
  }

  const user = verifyToken(token)
  if (!user || user.role !== 'USER') {
    redirect('/login')
  }

  return (
    <div className="min-h-screen">
      <Header user={user} />
      <UserVotingInterface user={user} />
    </div>
  )
}
