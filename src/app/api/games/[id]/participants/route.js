import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request, { params }) {
  try {
    const gameId = params.id

    const participants = await prisma.vote.findMany({
      where: { gameId },
      include: {
        user: {
          select: {
            id: true,
            secretCode: true,
            fullName: true,
            gender: true,
            isActive: true
          }
        },
        game: {
          select: {
            id: true,
            name: true,
            type: true,
            category: true,
            icon: true
          }
        }
      }
    })

    // Get existing matches for this game
    const existingMatches = await prisma.match.findMany({
      where: { gameId },
      include: {
        players: {
          include: {
            user: {
              select: {
                id: true,
                secretCode: true,
                fullName: true
              }
            }
          }
        }
      }
    })

    const result = {
      game: participants[0]?.game || null,
      participants: participants.map(p => p.user),
      activeParticipants: participants.filter(p => p.user.isActive).map(p => p.user),
      existingMatches,
      canSchedule: participants.filter(p => p.user.isActive).length >= 2
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Get participants error:', error)
    return NextResponse.json({ error: 'Failed to fetch participants' }, { status: 500 })
  }
}
