'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Trophy, Users, Timer, Heart } from 'lucide-react'

/**
 * User voting interface component
 * @param {{user: {secretCode: string, role: string}}} props
 */
export default function UserVotingInterface({ user }) {
  const [games, setGames] = useState([])
  const [selectedGames, setSelectedGames] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchGames()
    fetchUserVotes()
  }, [])

  const fetchGames = async () => {
    try {
      const response = await fetch('/api/games')
      const data = await response.json()
      setGames(data)
    } catch (error) {
      console.error('Failed to fetch games:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserVotes = async () => {
    try {
      const response = await fetch('/api/votes')
      if (response.ok) {
        const votesData = await response.json()
        const userVotes = new Set()
        
        Object.entries(votesData).forEach(([gameId, data]) => {
          if (data.votes.includes(user.secretCode)) {
            userVotes.add(gameId)
          }
        })
        
        setSelectedGames(userVotes)
      }
    } catch (error) {
      console.error('Failed to fetch user votes:', error)
    }
  }

  const handleGameToggle = (gameId) => {
    const newSelected = new Set(selectedGames)
    if (newSelected.has(gameId)) {
      newSelected.delete(gameId)
    } else {
      newSelected.add(gameId)
    }
    setSelectedGames(newSelected)
  }

  const handleSubmitVotes = async () => {
    setSubmitting(true)
    setMessage('')

    try {
      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gameIds: Array.from(selectedGames)
        }),
      })

      if (response.ok) {
        setMessage('✅ Votes updated successfully!')
        setTimeout(() => setMessage(''), 3000)
      } else {
        const data = await response.json()
        setMessage(`❌ ${data.error || 'Failed to update votes'}`)
      }
    } catch (error) {
      setMessage('❌ Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const getCategoryColor = (category) => {
    switch (category) {
      case 'INDOOR': return 'bg-purple-500/20 text-purple-400'
      case 'OUTDOOR': return 'bg-green-500/20 text-green-400'
      case 'TRACK': return 'bg-blue-500/20 text-blue-400'
      case 'FIELD': return 'bg-orange-500/20 text-orange-400'
      case 'FUN': return 'bg-pink-500/20 text-pink-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="h-12 w-12 border-4 border-white/20 border-t-white rounded-full"
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center gap-3">
            <Trophy className="h-10 w-10 text-yellow-500" />
            Sports Meet 2025
          </h1>
          <p className="text-xl text-gray-300">Welcome, {user.secretCode}!</p>
          <div className="text-gray-400 mt-2 flex items-center justify-center gap-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Vote for multiple games</span>
            </div>
            <div className="flex items-center gap-2">
              <Timer className="h-4 w-4" />
              <span>You can change votes anytime</span>
            </div>
          </div>
        </motion.div>

        {/* Message */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 p-4 bg-white/10 backdrop-blur-lg rounded-lg border border-white/20 text-center text-white"
            >
              {message}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {games.map((game, index) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative bg-white/10 backdrop-blur-lg rounded-xl border transition-all duration-300 cursor-pointer overflow-hidden ${
                selectedGames.has(game.id)
                  ? 'border-yellow-400 bg-yellow-500/20 shadow-lg shadow-yellow-500/25'
                  : 'border-white/20 hover:border-white/40'
              }`}
              onClick={() => handleGameToggle(game.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Selection Indicator */}
              <AnimatePresence>
                {selectedGames.has(game.id) && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute top-3 right-3 bg-yellow-500 rounded-full p-1 z-10"
                  >
                    <Check className="h-4 w-4 text-white" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="text-8xl transform rotate-12 text-center mt-8">
                  {game.icon}
                </div>
              </div>

              <div className="relative p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="text-3xl">{game.icon}</div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(game.category)}`}>
                    {game.category}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white mb-2">{game.name}</h3>
                <p className="text-gray-300 text-sm mb-4">{game.type}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Heart className="h-4 w-4" />
                    <span className="text-sm">{game._count?.votes || 0} votes</span>
                  </div>
                  
                  {selectedGames.has(game.id) && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-yellow-400 text-sm font-medium"
                    >
                      Selected ✨
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Submit Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <div className="mb-4 text-gray-300">
            {selectedGames.size === 0 ? (
              "Select games you'd like to participate in"
            ) : (
              `${selectedGames.size} game${selectedGames.size === 1 ? '' : 's'} selected`
            )}
          </div>
          
          <motion.button
            onClick={handleSubmitVotes}
            disabled={submitting}
            className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-8 py-4 rounded-xl font-bold hover:from-yellow-600 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-lg shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {submitting ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Updating Votes...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <Trophy className="h-5 w-5" />
                <span>Update My Votes</span>
              </div>
            )}
          </motion.button>
        </motion.div>
      </div>
    </div>
  )
}
