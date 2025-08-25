const { NextResponse } = require("next/server");
const { prisma } = require("@/lib/db");
const { verifyToken } = require("@/lib/auth");

async function GET() {
  try {
    const votes = await prisma.vote.findMany({
      include: {
        user: {
          select: {
            secretCode: true,
            role: true,
          },
        },
        game: {
          select: {
            name: true,
            type: true,
            category: true,
          },
        },
      },
    });

    // Group votes by game
    const votesById = votes.reduce((acc, vote) => {
      if (!acc[vote.gameId]) {
        acc[vote.gameId] = {
          game: vote.game,
          votes: [],
        };
      }
      acc[vote.gameId].votes.push(vote.user.secretCode);
      return acc;
    }, {});

    return NextResponse.json(votesById);
  } catch (error) {
    console.error("Get votes error:", error);
    return NextResponse.json(
      { error: "Failed to fetch votes" },
      { status: 500 }
    );
  }
}

async function POST(request) {
  try {
    const token = request.cookies.get("auth-token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user || user.role !== "USER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { gameIds } = await request.json();

    if (!Array.isArray(gameIds)) {
      return NextResponse.json(
        { error: "Game IDs must be an array" },
        { status: 400 }
      );
    }

    // Remove existing votes for this user
    await prisma.vote.deleteMany({
      where: { userId: user.id },
    });

    // Add new votes
    const votes = gameIds.map((gameId) => ({
      userId: user.id,
      gameId,
    }));

    await prisma.vote.createMany({
      data: votes,
    });

    return NextResponse.json({ message: "Votes updated successfully" });
  } catch (error) {
    console.error("Vote error:", error);
    return NextResponse.json(
      { error: "Failed to update votes" },
      { status: 500 }
    );
  }
}

module.exports = { GET, POST };
