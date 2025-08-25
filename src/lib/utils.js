const { clsx } = require("clsx");
const { twMerge } = require("tailwind-merge");

/**
 * Merge class names
 * @param {...any} inputs - Class names
 * @returns {string} Merged class names
 */
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Generate random pairs from participants
 * @param {string[]} participants - Array of participant codes
 * @returns {Array<{player1: string, player2: string}>} Array of pairs
 */
function generateRandomPairs(participants) {
  if (participants.length < 2) return [];

  // Shuffle the participants array
  const shuffled = [...participants].sort(() => Math.random() - 0.5);
  const pairs = [];

  for (let i = 0; i < shuffled.length - 1; i += 2) {
    pairs.push({
      player1: shuffled[i],
      player2: shuffled[i + 1],
    });
  }

  return pairs;
}

/**
 * Format date to readable string
 * @param {Date} date - Date object
 * @returns {string} Formatted date string
 */
function formatDate(date) {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

module.exports = {
  cn,
  generateRandomPairs,
  formatDate,
};
