'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, Calendar, Trophy, TrendingUp, Award, Target } from 'lucide-react'
import Leaderboard from './Leaderboard'

export default function EnhancedDashboard({ user }) {
  const [dashboardData, setDashboardData] = useState({
    totalPlayers: 0,
    activePlayers: 0,
    totalMatches: 0,
    completedMatches: 0,
    totalGames: 0,
    gamesWithMatches: 0
  })
  const [loading, setLoading] = useState(true)
  const [recentActivity, setRecentActivity] = useState([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [playersRes, gamesRes, matchesRes] = await Promise.all([
        fetch('/api/players'),
        fetch('/api/games'),
        fetch('/api/matches')
      ])

      const [players, games, matches] = await Promise.all([
        playersRes.json(),
        gamesRes.json(),
        matchesRes.json()
      ])

      setDashboardData({
        totalPlayers: players.length,
        activePlayers: players.filter(p => p.isActive).length,
        totalMatches: matches.length,
        completedMatches: matches.filter(m => m.status === 'COMPLETED').length,
        totalGames: games.length,
        gamesWithMatches: [...new Set(matches.map(m => m.gameId))].length
      })

      // Create recent activity feed
      const activities = [
        ...matches.slice(-5).map(match => ({
          type: 'match',
          message: `Match scheduled for ${match.game.name}`,
          time: new Date(match.createdAt),
          icon: Calendar,
          color: 'text-blue-400'
        })),
        ...players.slice(-3).map(player => ({
          type: 'player',
          message: `${player.fullName || player.secretCode} updated`,
          time: new Date(player.updatedAt),
          icon: Users,
          color: 'text-green-400'
        }))
      ].sort((a, b) => b.time - a.time).slice(0, 5)

      setRecentActivity(activities)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const StatCard = ({ title, value, subtitle, icon: Icon, color, delay }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          {subtitle && (
            <p className={`text-sm mt-1 ${color}`}>{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-full bg-white/10 ${color}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </motion.div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="h-12 w-12 border-4 border-white/20 border-t-white rounded-full"
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome back, {user.secretCode}!
        </h1>
        <p className="text-gray-400">
          Here's what's happening in your sports meet
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Players"
          value={dashboardData.totalPlayers}
          subtitle={`${dashboardData.activePlayers} active`}
          icon={Users}
          color="text-blue-400"
          delay={0.1}
        />
        <StatCard
          title="Total Matches"
          value={dashboardData.totalMatches}
          subtitle={`${dashboardData.completedMatches} completed`}
          icon={Calendar}
          color="text-green-400"
          delay={0.2}
        />
        <StatCard
          title="Games"
          value={dashboardData.totalGames}
          subtitle={`${dashboardData.gamesWithMatches} have matches`}
          icon={Trophy}
          color="text-yellow-400"
          delay={0.3}
        />
        <StatCard
          title="Completion Rate"
          value={`${Math.round((dashboardData.completedMatches / Math.max(dashboardData.totalMatches, 1)) * 100)}%`}
          subtitle="Matches completed"
          icon={TrendingUp}
          color="text-purple-400"
          delay={0.4}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="xl:col-span-2 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6"
        >
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Recent Activity
          </h2>
          <div className="space-y-3">
            {recentActivity.map((activity, index) => {
              const Icon = activity.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="flex items-center gap-3 p-3 bg-white/5 rounded-lg"
                >
                  <div className={`p-2 rounded-full bg-white/10 ${activity.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm">{activity.message}</p>
                    <p className="text-gray-400 text-xs">
                      {activity.time.toLocaleString()}
                    </p>
                  </div>
                </motion.div>
              )
            })}

            {recentActivity.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <Award className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No recent activity</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Leaderboard */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Leaderboard />
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6"
      >
        <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.button
            onClick={() => window.location.href = '/admin/players'}
            className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg flex items-center gap-3 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Users className="h-5 w-5" />
            <span>Manage Players</span>
          </motion.button>
          <motion.button
            onClick={() => window.location.href = '/admin/matches'}
            className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg flex items-center gap-3 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Calendar className="h-5 w-5" />
            <span>Schedule Matches</span>
          </motion.button>
          <motion.button
            onClick={() => {
              // Trigger export
              fetch('/api/export?type=players')
                .then(res => res.json())
                .then(data => {
                  const csvContent = convertToCSV(data.data)
                  downloadCSV(csvContent, data.filename)
                })
            }}
            className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-lg flex items-center gap-3 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Target className="h-5 w-5" />
            <span>Export Data</span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  )

  // Helper functions for CSV export
  function convertToCSV(data) {
    if (!data.length) return ''
    const headers = Object.keys(data[0]).join(',')
    const rows = data.map(row => 
      Object.values(row).map(value => 
        typeof value === 'string' && value.includes(',') ? `"${value}"` : value
      ).join(',')
    ).join('\n')
    return `${headers}\n${rows}`
  }

  function downloadCSV(content, filename) {
    const blob = new Blob([content], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }
}
