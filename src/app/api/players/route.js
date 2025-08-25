import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken, isAdmin } from '@/lib/auth'

export async function GET() {
  try {
    const players = await prisma.user.findMany({
      where: { role: 'USER' },
      include: {
        playerMatches: {
          include: {
            match: {
              include: {
                game: true
              }
            }
          }
        },
        votes: {
          include: {
            game: true
          }
        },
        _count: {
          select: {
            votes: true,
            playerMatches: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    })

    // Calculate statistics for each player
    const playersWithStats = players.map((player, index) => {
      const matches = player.playerMatches
      const wins = matches.filter(pm => pm.result === 'WIN').length
      const losses = matches.filter(pm => pm.result === 'LOSS').length
      const draws = matches.filter(pm => pm.result === 'DRAW').length
      const totalMatches = matches.length
      const participationCount = player._count.votes

      return {
        ...player,
        serialNo: index + 1,
        wins,
        losses,
        draws,
        totalMatches,
        participationCount,
        winPercentage: totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0
      }
    })

    return NextResponse.json(playersWithStats)
  } catch (error) {
    console.error('Get players error:', error)
    return NextResponse.json({ error: 'Failed to fetch players' }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = verifyToken(token)
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { playerId, fullName, gender, isActive } = await request.json()

    const updatedPlayer = await prisma.user.update({
      where: { id: playerId },
      data: {
        fullName,
        gender,
        isActive
      }
    })

    return NextResponse.json(updatedPlayer)
  } catch (error) {
    console.error('Update player error:', error)
    return NextResponse.json({ error: 'Failed to update player' }, { status: 500 })
  }
}
