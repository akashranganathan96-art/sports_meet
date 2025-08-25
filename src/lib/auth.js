const jwt = require('jsonwebtoken')
const { prisma } = require('./db')

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret'

/**
 * Authenticate user with secret code
 * @param {string} secretCode - User's secret code
 * @returns {Promise<Object|null>} User object or null
 */
async function authenticateUser(secretCode) {
  try {
    const user = await prisma.user.findUnique({
      where: { secretCode }
    })

    if (!user) {
      return null
    }

    return {
      id: user.id,
      secretCode: user.secretCode,
      role: user.role
    }
  } catch (error) {
    console.error('Authentication error:', error)
    return null
  }
}

/**
 * Generate JWT token for user
 * @param {Object} user - User object
 * @returns {string} JWT token
 */
function generateToken(user) {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '24h' })
}

/**
 * Verify JWT token
 * @param {string} token - JWT token
 * @returns {Object|null} User object or null
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

/**
 * Check if user is admin
 * @param {Object} user - User object
 * @returns {boolean} True if admin
 */
function isAdmin(user) {
  return user.role === 'ADMIN'
}

module.exports = {
  authenticateUser,
  generateToken,
  verifyToken,
  isAdmin
}
