import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken, isAdmin } from "@/lib/auth";

export async function GET(request) {
  try {
    const token = request.cookies.get("auth-token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // 'players' or 'matches'

    if (type === "players") {
      const players = await prisma.user.findMany({
        where: { role: "USER" },
        include: {
          playerMatches: true,
          votes: {
            include: {
              game: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

      const csvData = players.map((player, index) => {
        const matches = player.playerMatches;
        const wins = matches.filter((pm) => pm.result === "WIN").length;
        const losses = matches.filter((pm) => pm.result === "LOSS").length;
        const draws = matches.filter((pm) => pm.result === "DRAW").length;
        const participatedGames = player.votes
          .map((v) => v.game.name)
          .join(", ");

        return {
          "Serial No": index + 1,
          "Player Code": player.secretCode,
          "Full Name": player.fullName || "N/A",
          Gender: player.gender || "N/A",
          Status: player.isActive ? "Active" : "Inactive",
          "Total Matches": matches.length,
          Wins: wins,
          Losses: losses,
          Draws: draws,
          "Win Percentage":
            matches.length > 0
              ? Math.round((wins / matches.length) * 100) + "%"
              : "0%",
          "Participation Count": player.votes.length,
          "Participated Games": participatedGames,
        };
      });

      return NextResponse.json({
        data: csvData,
        filename: `players_report_${
          new Date().toISOString().split("T")[0]
        }.csv`,
      });
    }

    if (type === "matches") {
      const matches = await prisma.match.findMany({
        include: {
          game: {
            select: {
              name: true,
              category: true,
            },
          },
          players: {
            include: {
              user: {
                select: {
                  secretCode: true,
                  fullName: true,
                },
              },
            },
          },
        },
      });

      const csvData = matches.map((match, index) => {
        const players = match.players.map((p) => ({
          name: p.user.fullName || p.user.secretCode,
          result: p.result || "Pending",
        }));

        return {
          "Match No": index + 1,
          Game: match.game.name,
          Category: match.game.category,
          Status: match.status,
          "Scheduled Date": match.scheduledAt
            ? new Date(match.scheduledAt).toLocaleDateString()
            : "Not Set",
          "Player 1": players[0]?.name || "N/A",
          "Player 1 Result": players[0]?.result || "Pending",
          "Player 2": players[1]?.name || "N/A",
          "Player 2 Result": players[1]?.result || "Pending",
          "Match Date": new Date(match.createdAt).toLocaleDateString(),
        };
      });

      return NextResponse.json({
        data: csvData,
        filename: `matches_report_${
          new Date().toISOString().split("T")[0]
        }.csv`,
      });
    }

    return NextResponse.json({ error: "Invalid export type" }, { status: 400 });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: "Failed to generate export data" },
      { status: 500 }
    );
  }
}
