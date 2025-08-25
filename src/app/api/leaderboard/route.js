import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    // Get all users with role USER
    const users = await prisma.user.findMany({
      where: { role: "USER" },
      select: { id: true, secretCode: true },
    });

    // Get vote counts per user
    const voteCounts = await prisma.vote.groupBy({
      by: ["userId"],
      _count: { userId: true },
    });

    // Get match results count per user & result type
    const matchResults = await prisma.playerMatch.groupBy({
      by: ["userId", "result"],
      where: { result: { not: null } },
      _count: { result: true },
    });

    // Map to easily lookup votes and wins by userId
    const voteMap = Object.fromEntries(
      voteCounts.map((vc) => [vc.userId, vc._count.userId])
    );
    const winsMap = {};
    const lossesMap = {};
    const drawsMap = {};

    matchResults.forEach((mr) => {
      const { userId, result, _count } = mr;
      if (result === "WIN") winsMap[userId] = _count.result;
      if (result === "LOSS") lossesMap[userId] = _count.result;
      if (result === "DRAW") drawsMap[userId] = _count.result;
    });

    // Prepare leaderboard data
    const leaderboard = users.map((user) => {
      const votesCount = voteMap[user.id] || 0;
      const winsCount = winsMap[user.id] || 0;
      const lossesCount = lossesMap[user.id] || 0;
      const drawsCount = drawsMap[user.id] || 0;
      const totalScore = votesCount * 10 + winsCount * 50;

      return {
        userId: user.id,
        secretCode: user.secretCode,
        votesCount,
        winsCount,
        lossesCount,
        drawsCount,
        totalScore,
      };
    });

    // Sort leaderboard descending by totalScore
    leaderboard.sort((a, b) => b.totalScore - a.totalScore);

    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error("Leaderboard fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
