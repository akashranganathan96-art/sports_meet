'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { LogIn, Trophy } from 'lucide-react'

export default function LoginForm() {
  const [secretCode, setSecretCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ secretCode: secretCode.trim().toUpperCase() }),
      })

      const data = await response.json()

      if (response.ok) {
        // Redirect based on user role
        if (data.user.role === 'ADMIN') {
          router.push('/admin')
        } else {
          router.push('/user')
        }
      } else {
        setError(data.error || 'Login failed')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full space-y-8"
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mx-auto h-20 w-20 bg-yellow-500 rounded-full flex items-center justify-center mb-6"
          >
            <Trophy className="h-10 w-10 text-white" />
          </motion.div>
          <h2 className="text-3xl font-bold text-white">
            247 HealthMedPro Sports Meet 2025
          </h2>
          <p className="mt-2 text-lg text-gray-300">
            October 11, 2025 • DB Jain College
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 space-y-6 border border-white/20"
        >
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-pink-500/20 rounded-lg p-3">
              <div className="text-pink-400 font-semibold">Team Ganga</div>
              <div className="text-xs text-gray-300">Pink</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="text-gray-300 font-semibold">Team Yamuna</div>
              <div className="text-xs text-gray-400">Black</div>
            </div>
            <div className="bg-red-500/20 rounded-lg p-3">
              <div className="text-red-400 font-semibold">Team Kaveri</div>
              <div className="text-xs text-gray-300">Red</div>
            </div>
            <div className="bg-yellow-500/20 rounded-lg p-3">
              <div className="text-yellow-400 font-semibold">Team Vaigai</div>
              <div className="text-xs text-gray-300">Yellow</div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="secretCode" className="block text-sm font-medium text-gray-200 mb-2">
                Enter Secret Code
              </label>
              <input
                type="text"
                id="secretCode"
                value={secretCode}
                onChange={(e) => setSecretCode(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                placeholder="ADMIN2025 or USER001-USER025"
                maxLength={9}
                required
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 text-sm text-center bg-red-500/10 rounded-lg p-3"
              >
                {error}
              </motion.div>
            )}

            <motion.button
              type="submit"
              disabled={loading || !secretCode.trim()}
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-3 px-4 rounded-lg font-semibold hover:from-yellow-600 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Logging in...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <LogIn className="h-4 w-4" />
                  <span>Login</span>
                </div>
              )}
            </motion.button>
          </form>
        </motion.div>
      </motion.div>
    </div>
  )
}
