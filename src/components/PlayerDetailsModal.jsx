"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  X,
  Trophy,
  Target,
  Calendar,
  Users,
  Award,
  TrendingUp,
} from "lucide-react";

export default function PlayerDetailsModal({ player, onClose }) {
  const [playerDetails, setPlayerDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlayerDetails();
  }, [player.id]);

  const fetchPlayerDetails = async () => {
    try {
      const response = await fetch(`/api/players/${player.id}`);
      const data = await response.json();
      setPlayerDetails(data);
    } catch (error) {
      console.error("Failed to fetch player details:", error);
    } finally {
      setLoading(false);
    }
  };

  const getResultIcon = (result) => {
    switch (result) {
      case "WIN":
        return { icon: Trophy, color: "text-green-400" };
      case "LOSS":
        return { icon: Target, color: "text-red-400" };
      case "DRAW":
        return { icon: Award, color: "text-yellow-400" };
      default:
        return { icon: Calendar, color: "text-gray-400" };
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="h-8 w-8 border-4 border-white/20 border-t-white rounded-full mx-auto"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-gray-900/95 backdrop-blur-lg rounded-xl border border-white/20 max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {playerDetails?.fullName || playerDetails?.secretCode}
              </h2>
              <p className="text-gray-400">{playerDetails?.secretCode}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-400">
                {playerDetails?.statistics.wins}
              </div>
              <div className="text-gray-400 text-sm">Wins</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-red-400">
                {playerDetails?.statistics.losses}
              </div>
              <div className="text-gray-400 text-sm">Losses</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-yellow-400">
                {playerDetails?.statistics.draws}
              </div>
              <div className="text-gray-400 text-sm">Draws</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">
                {playerDetails?.statistics.winPercentage}%
              </div>
              <div className="text-gray-400 text-sm">Win Rate</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Game Statistics */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Game Statistics
              </h3>
              <div className="space-y-3">
                {Object.entries(playerDetails?.statistics.gameStats || {}).map(
                  ([game, stats]) => (
                    <div key={game} className="bg-white/10 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium">{game}</span>
                        <span className="text-gray-400 text-sm">
                          {stats.total} matches
                        </span>
                      </div>
                      <div className="flex gap-4 text-sm">
                        <span className="text-green-400">{stats.wins}W</span>
                        <span className="text-red-400">{stats.losses}L</span>
                        <span className="text-yellow-400">{stats.draws}D</span>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Recent Matches */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Recent Matches
              </h3>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {playerDetails?.recentMatches.map((playerMatch) => {
                  const { icon: ResultIcon, color } = getResultIcon(
                    playerMatch.result
                  );
                  const opponent = playerMatch.match.players.find(
                    (p) => p.userId !== player.id
                  );

                  return (
                    <div
                      key={playerMatch.id}
                      className="bg-white/10 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <ResultIcon className={`h-4 w-4 ${color}`} />
                          <span className="text-white font-medium">
                            {playerMatch.match.game.name}
                          </span>
                        </div>
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-medium ${
                            playerMatch.result === "WIN"
                              ? "bg-green-500/20 text-green-400"
                              : playerMatch.result === "LOSS"
                              ? "bg-red-500/20 text-red-400"
                              : playerMatch.result === "DRAW"
                              ? "bg-yellow-500/20 text-yellow-400"
                              : "bg-gray-500/20 text-gray-400"
                          }`}
                        >
                          {playerMatch.result || "Pending"}
                        </span>
                      </div>
                      {opponent && (
                        <div className="text-gray-400 text-sm">
                          vs{" "}
                          {opponent.user.fullName || opponent.user.secretCode}
                        </div>
                      )}
                      <div className="text-gray-500 text-xs mt-1">
                        {new Date(
                          playerMatch.match.scheduledAt ||
                            playerMatch.match.createdAt
                        ).toLocaleDateString()}
                      </div>
                    </div>
                  );
                })}

                {(!playerDetails?.recentMatches ||
                  playerDetails.recentMatches.length === 0) && (
                  <div className="text-center py-8 text-gray-400">
                    <Trophy className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No matches played yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Participated Games */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Participated Games ({playerDetails?.statistics.participationCount}
              )
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {playerDetails?.participatedGames.map((game) => (
                <div
                  key={game.id}
                  className="bg-white/10 rounded-lg p-3 text-center"
                >
                  <div className="text-2xl mb-1">{game.icon}</div>
                  <div className="text-white text-xs font-medium">
                    {game.name}
                  </div>
                  <div className="text-gray-400 text-xs">{game.category}</div>
                </div>
              ))}
            </div>

            {(!playerDetails?.participatedGames ||
              playerDetails.participatedGames.length === 0) && (
              <div className="text-center py-8 text-gray-400">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No games participated yet</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
