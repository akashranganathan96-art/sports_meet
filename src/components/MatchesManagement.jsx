"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Users,
  Play,
  RotateCcw,
  Trophy,
  Clock,
  Zap,
  Eye,
  Download,
  Edit,
  Save,
  X,
  Target,
  Award,
} from "lucide-react";
import GameMatchModal from "./GameMatchModal";
import MatchSchedulingAnimation from "./MatchSchedulingAnimation";

export default function MatchesManagement() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState(null);
  const [showGameModal, setShowGameModal] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [schedulingGame, setSchedulingGame] = useState(null);

  useEffect(() => {
    fetchGames();
  }, []);

  async function fetchGames() {
    try {
      setLoading(true);
      const response = await fetch("/api/games");
      const gamesData = await response.json();

      const gamesWithData = await Promise.all(
        gamesData.map(async (game) => {
          const [votesRes, matchesRes] = await Promise.all([
            fetch("/api/votes"),
            fetch(`/api/matches?gameId=${game.id}`),
          ]);
          const votesData = await votesRes.json();
          const matchesData = await matchesRes.json();

          const gameVotes = votesData[game.id]?.votes || [];

          // Format scheduledAt as ISO strings for editing inputs
          const formattedMatches = matchesData.map((m) => ({
            ...m,
            scheduledAtIso: m.scheduledAt
              ? new Date(m.scheduledAt).toISOString().slice(0, 16)
              : "",
          }));

          return {
            ...game,
            votersCount: gameVotes.length,
            matchesCount: matchesData.length,
            hasMatches: matchesData.length > 0,
            canSchedule: gameVotes.length >= 2,
            matches: formattedMatches,
          };
        })
      );

      setGames(gamesWithData);
    } catch (error) {
      console.error("Failed to fetch games:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleExportMatches() {
    try {
      const response = await fetch("/api/export?type=matches");
      const data = await response.json();
      const csvContent = convertToCSV(data.data);
      downloadCSV(csvContent, data.filename);
    } catch (error) {
      console.error("Export failed:", error);
    }
  }

  function convertToCSV(data) {
    if (!data.length) return "";
    const headers = Object.keys(data[0]).join(",");
    const rows = data
      .map((row) =>
        Object.values(row)
          .map((value) =>
            typeof value === "string" && value.includes(",")
              ? `"${value}"`
              : value
          )
          .join(",")
      )
      .join("\n");
    return `${headers}\n${rows}`;
  }

  function downloadCSV(content, filename) {
    const blob = new Blob([content], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  async function handleScheduleMatches(game) {
    setSchedulingGame(game);
    setIsScheduling(true);

    try {
      const response = await fetch("/api/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameId: game.id,
          scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
        }),
      });
      if (response.ok) {
        // Wait for animated feedback (5s)
        setTimeout(() => {
          fetchGames();
          setIsScheduling(false);
          setSchedulingGame(null);
        }, 5000);
      }
    } catch (error) {
      console.error("Failed to schedule matches:", error);
      setIsScheduling(false);
      setSchedulingGame(null);
    }
  }

  const getCategoryColor = (category) => {
    switch (category) {
      case "INDOOR":
        return "from-purple-500/20 to-purple-600/20 border-purple-500/50";
      case "OUTDOOR":
        return "from-green-500/20 to-green-600/20 border-green-500/50";
      case "TRACK":
        return "from-blue-500/20 to-blue-600/20 border-blue-500/50";
      case "FIELD":
        return "from-orange-500/20 to-orange-600/20 border-orange-500/50";
      case "FUN":
        return "from-pink-500/20 to-pink-600/20 border-pink-500/50";
      default:
        return "from-gray-500/20 to-gray-600/20 border-gray-500/50";
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center p-12">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="h-12 w-12 border-4 border-white/20 border-t-white rounded-full"
        />
      </div>
    );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Matches Management</h2>
          <p className="text-gray-400">Schedule and manage game matches</p>
        </div>

        <motion.button
          onClick={handleExportMatches}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Download className="h-4 w-4" />
          Export Matches
        </motion.button>
      </div>

      {/* Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {games.map((game, index) => (
          <motion.div
            key={game.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-gradient-to-br ${getCategoryColor(
              game.category
            )} rounded-xl border-2 p-6 cursor-pointer hover:scale-105 transition-transform duration-300`}
            onClick={() => {
              setSelectedGame(game);
              setShowGameModal(true);
            }}
          >
            {/* Game Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="text-3xl">{game.icon}</div>
              <div className="text-xs font-medium text-gray-400 uppercase">
                {game.category}
              </div>
            </div>

            {/* Game Info */}
            <h3 className="text-lg font-bold text-white mb-2">{game.name}</h3>
            <p className="text-gray-300 text-sm mb-4">{game.type}</p>

            {/* Stats */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-400">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">
                    {game.votersCount} participants
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-400">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">{game.matchesCount} matches</span>
                </div>
              </div>
            </div>

            {/* Status Indicator */}
            <div className="mb-4">
              {game.hasMatches ? (
                <div className="flex items-center gap-2 text-green-400 text-sm">
                  <Trophy className="h-4 w-4" />
                  <span>Matches Scheduled</span>
                </div>
              ) : game.canSchedule ? (
                <div className="flex items-center gap-2 text-yellow-400 text-sm">
                  <Clock className="h-4 w-4" />
                  <span>Ready to Schedule</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <Users className="h-4 w-4" />
                  <span>Need {2 - game.votersCount} more votes</span>
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-2">
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedGame(game);
                  setShowGameModal(true);
                }}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Eye className="h-4 w-4" />
                View
              </motion.button>

              {game.canSchedule && !game.hasMatches && (
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleScheduleMatches(game);
                  }}
                  className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-3 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Play className="h-4 w-4" />
                  Schedule
                </motion.button>
              )}

              {game.hasMatches && (
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleScheduleMatches(game);
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <RotateCcw className="h-4 w-4" />
                  Reschedule
                </motion.button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Game Match Modal */}
      {showGameModal && selectedGame && (
        <GameMatchModal
          game={selectedGame}
          onClose={() => {
            setShowGameModal(false);
            setSelectedGame(null);
          }}
          onSchedule={handleScheduleMatches}
          onRefresh={fetchGames}
        />
      )}

      {/* Scheduling animation */}
      {isScheduling && schedulingGame && (
        <MatchSchedulingAnimation
          game={schedulingGame}
          onComplete={() => {
            setIsScheduling(false);
            setSchedulingGame(null);
          }}
        />
      )}
    </div>
  );
}
