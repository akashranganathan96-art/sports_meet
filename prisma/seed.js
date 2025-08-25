
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const teams = [
  { name: "Team Ganga", captain: "Sowmiya Thangaraj", viceCaptain: "Ganesh", color: "Pink" },
  { name: "Team Yamuna", captain: "Lokesh", viceCaptain: "Snega S", color: "Black" },
  { name: "Team Kaveri", captain: "Akash", viceCaptain: "Sri Kaviya", color: "Red" },
  { name: "Team Vaigai", captain: "Akhil", viceCaptain: "Pavadharani", color: "Yellow" }
]

const games = [
  { name: "Carrom", type: "Team vs Team", category: "INDOOR", icon: "🎯" },
  { name: "Volley Ball", type: "Men & Women", category: "OUTDOOR", icon: "🏐" },
  { name: "Throw Ball", type: "Men & Women", category: "OUTDOOR", icon: "⚽" },
  { name: "Koko", type: "Men & Women", category: "OUTDOOR", icon: "🥎" },
  { name: "Tennikoit", type: "Women", category: "OUTDOOR", icon: "🎾" },
  { name: "100m Sprint", type: "Men & Women", category: "TRACK", icon: "🏃" },
  { name: "200m Sprint", type: "Men & Women", category: "TRACK", icon: "🏃‍♀️" },
  { name: "Relay Race (4x100m)", type: "Men & Women", category: "TRACK", icon: "🏃‍♂️" },
  { name: "Shot Put", type: "Men & Women", category: "FIELD", icon: "🏋️" },
  { name: "Long Jump", type: "Men & Women", category: "FIELD", icon: "🤸" },
  { name: "Lemon in the Spoon", type: "Men & Women", category: "FUN", icon: "🍋" }
]

// Sample player names for realistic data
const playerNames = [
  { fullName: "Rajesh Kumar", gender: "MALE" },
  { fullName: "Priya Sharma", gender: "FEMALE" },
  { fullName: "Arun Patel", gender: "MALE" },
  { fullName: "Sneha Reddy", gender: "FEMALE" },
  { fullName: "Vikram Singh", gender: "MALE" },
  { fullName: "Kavita Jain", gender: "FEMALE" },
  { fullName: "Manoj Gupta", gender: "MALE" },
  { fullName: "Ritu Malhotra", gender: "FEMALE" },
  { fullName: "Suresh Yadav", gender: "MALE" },
  { fullName: "Meena Agarwal", gender: "FEMALE" },
  { fullName: "Rahul Verma", gender: "MALE" },
  { fullName: "Pooja Chopra", gender: "FEMALE" },
  { fullName: "Amit Thakur", gender: "MALE" },
  { fullName: "Sunita Roy", gender: "FEMALE" },
  { fullName: "Deepak Mishra", gender: "MALE" },
  { fullName: "Nisha Bansal", gender: "FEMALE" },
  { fullName: "Kiran Shah", gender: "MALE" },
  { fullName: "Rekha Nair", gender: "FEMALE" },
  { fullName: "Sanjay Tiwari", gender: "MALE" },
  { fullName: "Anita Kapoor", gender: "FEMALE" },
  { fullName: "Naveen Kumar", gender: "MALE" },
  { fullName: "Geeta Prasad", gender: "FEMALE" },
  { fullName: "Rohit Saxena", gender: "MALE" },
  { fullName: "Shweta Dubey", gender: "FEMALE" },
  { fullName: "Ajay Pandey", gender: "MALE" }
]

async function main() {
  console.log('Start seeding...')

  // Clear existing data
  await prisma.playerMatch.deleteMany()
  await prisma.match.deleteMany()
  await prisma.vote.deleteMany()
  await prisma.user.deleteMany()
  await prisma.game.deleteMany()
  await prisma.team.deleteMany()

  // Seed teams
  for (const team of teams) {
    await prisma.team.create({ data: team })
  }

  // Seed games
  for (const game of games) {
    await prisma.game.create({ data: game })
  }

  // Create admin user
  await prisma.user.create({
    data: {
      secretCode: 'ADMIN2025',
      role: 'ADMIN',
      fullName: 'Administrator',
      gender: 'OTHER',
      isActive: true
    }
  })

  // Create users with enhanced profiles
  for (let i = 1; i <= 25; i++) {
    const playerData = playerNames[i - 1] || { fullName: `Player ${i}`, gender: "MALE" }
    await prisma.user.create({
      data: {
        secretCode: `USER${i.toString().padStart(3, '0')}`,
        role: 'USER',
        fullName: playerData.fullName,
        gender: playerData.gender,
        isActive: Math.random() > 0.1 // 90% active players
      }
    })
  }

  console.log('Seeding finished.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
