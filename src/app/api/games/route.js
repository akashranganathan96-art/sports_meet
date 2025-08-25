const { NextResponse } = require('next/server')
const { prisma } = require('@/lib/db')

async function GET() {
  try {
    const games = await prisma.game.findMany({
      include: {
        _count: {
          select: {
            votes: true,
            matches: true
          }
        }
      },
      orderBy: {
        category: 'asc'
      }
    })

    return NextResponse.json(games)
  } catch (error) {
    console.error('Get games error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch games' },
      { status: 500 }
    )
  }
}

module.exports = { GET }
