'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Calendar, Shuffle, Trophy, Clock, Zap } from 'lucide-react'
import ScratchCard from './ScratchCard'

/**
 * Admin kanban board component
 * @param {{user: {secretCode: string, role: string}}} props
 */
export default function AdminKanbanBoard({ user }) {
  const [games, setGames] = useState([])
  const [votes, setVotes] = useState({})
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [schedulingGame, setSchedulingGame] = useState(null)
  const [revealedMatches, setRevealedMatches] = useState({})

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [gamesRes, votesRes, matchesRes] = await Promise.all([
        fetch('/api/games'),
        fetch('/api/votes'),
        fetch('/api/matches')
      ])

      const [gamesData, votesData, matchesData] = await Promise.all([
        gamesRes.json(),
        votesRes.json(),
        matchesRes.json()
      ])

      setGames(gamesData)
      setVotes(votesData)
      setMatches(matchesData)
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const scheduleMatches = async (gameId) => {
    setSchedulingGame(gameId)
    try {
      const response = await fetch('/api/matches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ gameId }),
      })

      if (response.ok) {
        const data = await response.json()
        setRevealedMatches(prev => ({
          ...prev,
          [gameId]: data.pairs
        }))
        fetchData() // Refresh data
      }
    } catch (error) {
      console.error('Failed to schedule matches:', error)
    } finally {
      setSchedulingGame(null)
    }
  }

  const getGameVotes = (gameId) => {
    return votes[gameId]?.votes || []
  }

  const getCategoryColor = (category) => {
    switch (category) {
      case 'INDOOR': return 'border-purple-500 bg-purple-500/10'
      case 'OUTDOOR': return 'border-green-500 bg-green-500/10'
      case 'TRACK': return 'border-blue-500 bg-blue-500/10'
      case 'FIELD': return 'border-orange-500 bg-orange-500/10'
      case 'FUN': return 'border-pink-500 bg-pink-500/10'
      default: return 'border-gray-500 bg-gray-500/10'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="h-12 w-12 border-4 border-white/20 border-t-white rounded-full"
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center gap-3">
            <Trophy className="h-10 w-10 text-yellow-500" />
            Admin Dashboard
          </h1>
          <p className="text-xl text-gray-300">Welcome, {user.secretCode}!</p>
          <div className="flex items-center justify-center gap-6 mt-4 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>{Object.values(votes).reduce((sum, game) => sum + (game.votes?.length || 0), 0)} Total Votes</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{matches.length} Matches Scheduled</span>
            </div>
          </div>
        </motion.div>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {games.map((game, index) => {
            const gameVotes = getGameVotes(game.id)
            const gameMatches = matches.filter(m => m.gameId === game.id)
            
            return (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`rounded-xl border-2 p-6 ${getCategoryColor(game.category)} backdrop-blur-lg`}
              >
                {/* Game Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="text-2xl">{game.icon}</div>
                  <div className="text-xs font-medium text-gray-400 uppercase">
                    {game.category}
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white mb-2">{game.name}</h3>
                <p className="text-gray-300 text-sm mb-4">{game.type}</p>

                {/* Vote Count */}
                <div className="flex items-center gap-2 mb-4">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="text-white font-semibold">{gameVotes.length} Votes</span>
                </div>

                {/* Participants */}
                {gameVotes.length > 0 && (
                  <div className="mb-4">
                    <div className="text-xs text-gray-400 mb-2">Participants:</div>
                    <div className="flex flex-wrap gap-1">
                      {gameVotes.slice(0, 6).map((vote) => (
                        <div
                          key={vote}
                          className="px-2 py-1 bg-white/10 rounded-full text-xs text-gray-300"
                        >
                          {vote}
                        </div>
                      ))}
                      {gameVotes.length > 6 && (
                        <div className="px-2 py-1 bg-white/10 rounded-full text-xs text-gray-400">
                          +{gameVotes.length - 6} more
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Matches Status */}
                {gameMatches.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 text-green-400 text-sm">
                      <Clock className="h-4 w-4" />
                      <span>{gameMatches.length} matches scheduled</span>
                    </div>
                  </div>
                )}

                {/* Action Button or Scratch Card */}
                {gameVotes.length >= 2 ? (
                  schedulingGame === game.id ? (
                    <ScratchCard
                      width={280}
                      height={120}
                      revealedContent={
                        <div className="bg-gradient-to-r from-green-500 to-blue-500 p-4 rounded-lg text-white h-full flex flex-col justify-center">
                          <div className="text-center">
                            <Zap className="h-8 w-8 mx-auto mb-2" />
                            <div className="font-bold text-sm mb-2">Matches Created!</div>
                            <div className="text-xs opacity-90">
                              {revealedMatches[game.id]?.length || 0} pairs scheduled
                            </div>
                          </div>
                        </div>
                      }
                      onReveal={(percentage) => {
                        if (percentage > 80) {
                          setTimeout(() => {
                            setSchedulingGame(null)
                          }, 1000)
                        }
                      }}
                      className="w-full h-[120px]"
                    />
                  ) : (
                    <motion.button
                      onClick={() => scheduleMatches(game.id)}
                      disabled={gameMatches.length > 0}
                      className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-3 px-4 rounded-lg font-semibold hover:from-yellow-600 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <Shuffle className="h-4 w-4" />
                        <span>
                          {gameMatches.length > 0 ? 'Matches Scheduled' : 'Schedule Matches'}
                        </span>
                      </div>
                    </motion.button>
                  )
                ) : (
                  <div className="w-full bg-gray-500/20 text-gray-400 py-3 px-4 rounded-lg text-center text-sm">
                    Need {2 - gameVotes.length} more votes
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
