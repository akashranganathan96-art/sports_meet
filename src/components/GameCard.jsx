'use client'

import { motion } from 'framer-motion'
import { Users, Calendar, Trophy } from 'lucide-react'

/**
 * Game card component for displaying individual games
 * @param {{
 *   game: {id: string, name: string, type: string, category: string, icon: string, _count?: {votes: number, matches: number}},
 *   isSelected?: boolean,
 *   onClick?: () => void,
 *   disabled?: boolean
 * }} props
 */
export default function GameCard({ game, isSelected, onClick, disabled }) {
  const getCategoryColor = (category) => {
    switch (category) {
      case 'INDOOR': return 'from-purple-500/20 to-purple-600/20 border-purple-500/50'
      case 'OUTDOOR': return 'from-green-500/20 to-green-600/20 border-green-500/50'
      case 'TRACK': return 'from-blue-500/20 to-blue-600/20 border-blue-500/50'
      case 'FIELD': return 'from-orange-500/20 to-orange-600/20 border-orange-500/50'
      case 'FUN': return 'from-pink-500/20 to-pink-600/20 border-pink-500/50'
      default: return 'from-gray-500/20 to-gray-600/20 border-gray-500/50'
    }
  }

  return (
    <motion.div
      className={`relative bg-gradient-to-br ${getCategoryColor(game.category)} rounded-xl border-2 p-6 cursor-pointer transition-all duration-300 ${
        isSelected
          ? 'ring-2 ring-yellow-400 shadow-lg shadow-yellow-500/25'
          : 'hover:border-white/40'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={!disabled ? onClick : undefined}
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      layout
    >
      {/* Category Badge */}
      <div className="absolute top-3 right-3">
        <div className="px-2 py-1 bg-black/30 rounded-full text-xs font-medium text-gray-300">
          {game.category}
        </div>
      </div>

      {/* Game Icon */}
      <div className="text-4xl mb-4">{game.icon}</div>

      {/* Game Info */}
      <h3 className="text-xl font-bold text-white mb-2">{game.name}</h3>
      <p className="text-gray-300 text-sm mb-4">{game.type}</p>

      {/* Stats */}
      <div className="flex items-center justify-between text-sm text-gray-400">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <span>{game._count?.votes || 0} votes</span>
        </div>
        
        {game._count?.matches && game._count.matches > 0 && (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{game._count.matches} matches</span>
          </div>
        )}
      </div>

      {/* Selection Indicator */}
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-3 left-3 bg-yellow-500 rounded-full p-1"
        >
          <Trophy className="h-4 w-4 text-white" />
        </motion.div>
      )}
    </motion.div>
  )
}
