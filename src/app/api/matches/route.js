import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken, isAdmin } from "@/lib/auth";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get("gameId");

    let matches;

    if (gameId) {
      // Get matches for specific game with participants
      matches = await prisma.match.findMany({
        where: { gameId },
        include: {
          game: true,
          players: {
            include: {
              user: {
                select: {
                  id: true,
                  secretCode: true,
                  fullName: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    } else {
      // Get all matches
      matches = await prisma.match.findMany({
        include: {
          game: true,
          players: {
            include: {
              user: {
                select: {
                  id: true,
                  secretCode: true,
                  fullName: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    }

    return NextResponse.json(matches);
  } catch (error) {
    console.error("Get matches error:", error);
    return NextResponse.json(
      { error: "Failed to fetch matches" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const token = request.cookies.get("auth-token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { gameId, scheduledAt } = await request.json();

    // Delete previously scheduled matches for this game
    await prisma.match.deleteMany({
      where: { gameId },
    });

    // Get all active users who voted for this game
    const votes = await prisma.vote.findMany({
      where: { gameId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            secretCode: true,
            isActive: true,
          },
        },
      },
    });

    const activeUsers = votes
      .filter((vote) => vote.user.isActive)
      .map((vote) => vote.user);

    if (activeUsers.length < 2) {
      return NextResponse.json(
        { error: "Not enough active participants for this game" },
        { status: 400 }
      );
    }

    // Shuffle active users for random pairing
    const shuffledUsers = [...activeUsers].sort(() => Math.random() - 0.5);
    const matches = [];

    for (let i = 0; i < shuffledUsers.length - 1; i += 2) {
      const player1 = shuffledUsers[i];
      const player2 = shuffledUsers[i + 1];

      const match = await prisma.match.create({
        data: {
          gameId,
          scheduledAt: scheduledAt
            ? new Date(scheduledAt)
            : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default to 7 days later if not provided
          status: "SCHEDULED",
        },
      });

      await prisma.playerMatch.createMany({
        data: [
          { matchId: match.id, userId: player1.id },
          { matchId: match.id, userId: player2.id },
        ],
      });

      matches.push({
        ...match,
        players: [player1, player2],
      });
    }

    return NextResponse.json({
      message: "Matches scheduled successfully",
      matchCount: matches.length,
      matches,
    });
  } catch (error) {
    console.error("Create matches error:", error);
    return NextResponse.json(
      { error: "Failed to schedule matches" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const token = request.cookies.get("auth-token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const data = await request.json();

    // If updating schedule date/time
    if (data.matchId && data.scheduledAt) {
      const updatedMatch = await prisma.match.update({
        where: { id: data.matchId },
        data: { scheduledAt: new Date(data.scheduledAt) },
      });
      return NextResponse.json({
        message: "Match schedule updated",
        updatedMatch,
      });
    }

    // If updating player match result and optionally match status
    if (data.matchId && data.playerId && data.result) {
      await prisma.playerMatch.update({
        where: {
          matchId_userId: {
            matchId: data.matchId,
            userId: data.playerId,
          },
        },
        data: { result: data.result },
      });

      // Automate opponent result update:
      const allPlayerMatches = await prisma.playerMatch.findMany({
        where: { matchId: data.matchId },
      });
      const opponent = allPlayerMatches.find(
        (pm) => pm.userId !== data.playerId
      );

      if (opponent) {
        let opponentResult = "DRAW";
        if (data.result !== "DRAW") {
          opponentResult = data.result === "WIN" ? "LOSS" : "WIN";
        }
        await prisma.playerMatch.update({
          where: {
            matchId_userId: {
              matchId: data.matchId,
              userId: opponent.userId,
            },
          },
          data: { result: opponentResult },
        });
      }

      // Optionally update match status
      if (data.status) {
        await prisma.match.update({
          where: { id: data.matchId },
          data: { status: data.status },
        });
      }

      return NextResponse.json({ message: "Match and results updated" });
    }

    return NextResponse.json({ error: "Invalid update data" }, { status: 400 });
  } catch (error) {
    console.error("Update match error:", error);
    return NextResponse.json(
      { error: "Failed to update match" },
      { status: 500 }
    );
  }
}
