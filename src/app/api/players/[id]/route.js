import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request, { params }) {
  try {
    const playerId = params.id

    const player = await prisma.user.findUnique({
      where: { id: playerId },
      include: {
        playerMatches: {
          include: {
            match: {
              include: {
                game: true,
                players: {
                  include: {
                    user: true
                  }
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        votes: {
          include: {
            game: true
          }
        }
      }
    })

    if (!player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 })
    }

    // Calculate detailed statistics
    const matches = player.playerMatches
    const wins = matches.filter(pm => pm.result === 'WIN')
    const losses = matches.filter(pm => pm.result === 'LOSS')
    const draws = matches.filter(pm => pm.result === 'DRAW')

    // Group by game
    const gameStats = {}
    matches.forEach(pm => {
      const gameName = pm.match.game.name
      if (!gameStats[gameName]) {
        gameStats[gameName] = { wins: 0, losses: 0, draws: 0, total: 0 }
      }
      gameStats[gameName].total++
      if (pm.result) {
        gameStats[gameName][pm.result.toLowerCase() + 's']++
      }
    })

    const playerDetails = {
      ...player,
      statistics: {
        totalMatches: matches.length,
        wins: wins.length,
        losses: losses.length,
        draws: draws.length,
        winPercentage: matches.length > 0 ? Math.round((wins.length / matches.length) * 100) : 0,
        participationCount: player.votes.length,
        gameStats
      },
      recentMatches: matches.slice(0, 10), // Last 10 matches
      participatedGames: player.votes.map(v => v.game)
    }

    return NextResponse.json(playerDetails)
  } catch (error) {
    console.error('Get player details error:', error)
    return NextResponse.json({ error: 'Failed to fetch player details' }, { status: 500 })
  }
}
