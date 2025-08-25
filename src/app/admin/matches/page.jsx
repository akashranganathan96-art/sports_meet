import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth'
import Header from '@/components/Header'
import MatchesManagement from '@/components/MatchesManagement'

export default async function MatchesPage() {
const cookieStore = await cookies()
const token = cookieStore.get('auth-token')?.value


  if (!token) {
    redirect('/login')
  }

  const user = verifyToken(token)
  if (!user || user.role !== 'ADMIN') {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header user={user} />
      <div className="p-6">
        <MatchesManagement />
      </div>
    </div>
  )
}
