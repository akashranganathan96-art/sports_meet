'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Medal, Award, Users } from 'lucide-react'

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('/api/leaderboard')
      const data = await response.json()
      setLeaderboard(data)
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return <Trophy className="h-6 w-6 text-yellow-500" />
      case 2: return <Medal className="h-6 w-6 text-gray-400" />
      case 3: return <Award className="h-6 w-6 text-orange-500" />
      default: return (
        <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center text-white text-sm font-bold">
          {rank}
        </div>
      )
    }
  }

  const getRankColor = (rank) => {
    switch (rank) {
      case 1: return 'from-yellow-500/20 to-orange-500/20 border-yellow-500/50'
      case 2: return 'from-gray-400/20 to-gray-600/20 border-gray-400/50'
      case 3: return 'from-orange-500/20 to-red-500/20 border-orange-500/50'
      default: return 'from-gray-600/10 to-gray-800/10 border-gray-600/30'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="h-8 w-8 border-4 border-white/20 border-t-white rounded-full"
        />
      </div>
    )
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="h-6 w-6 text-yellow-500" />
        <h2 className="text-2xl font-bold text-white">Leaderboard</h2>
      </div>

      <div className="space-y-4">
        {leaderboard.slice(0, 10).map((entry, index) => (
          <motion.div
            key={entry.userId}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-gradient-to-r ${getRankColor(index + 1)} rounded-lg border p-4 flex items-center justify-between`}
          >
            <div className="flex items-center gap-4">
              {getRankIcon(index + 1)}
              <div>
                <div className="text-white font-semibold">{entry.secretCode}</div>
                <div className="text-gray-400 text-sm flex items-center gap-4">
                  <span>🗳️ {entry.votesCount} votes</span>
                  <span>🏆 {entry.winsCount} wins</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-white">{entry.totalScore}</div>
              <div className="text-gray-400 text-xs">points</div>
            </div>
          </motion.div>
        ))}
      </div>

      {leaderboard.length === 0 && (
        <div className="text-center text-gray-400 py-8">
          <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No participants yet</p>
        </div>
      )}
    </div>
  )
}
