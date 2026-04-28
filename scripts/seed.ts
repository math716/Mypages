import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting database seed...')

  // Create test user (for system testing)
  const hashedPassword = await bcrypt.hash('johndoe123', 10)
  
  const testUser = await prisma.user.upsert({
    where: { email: 'john@doe.com' },
    update: {},
    create: {
      email: 'john@doe.com',
      password: hashedPassword,
      firstName: 'John',
      lastName: 'Doe',
    },
  })
  
  // Create main user
  const mainHashedPassword = await bcrypt.hash('Bolsopaginas16', 10)
  const user = await prisma.user.upsert({
    where: { email: 'paginas@gmail.com' },
    update: { password: mainHashedPassword },
    create: {
      email: 'paginas@gmail.com',
      password: mainHashedPassword,
      firstName: 'Paginas',
      lastName: 'Admin',
    },
  })

  console.log('Test user created:', user.email)

  // Create sample Instagram pages
  const page1 = await prisma.instagramPage.upsert({
    where: { id: 'seed-page-1' },
    update: {},
    create: {
      id: 'seed-page-1',
      name: 'Minha Empresa',
      username: 'minhaempresa',
      userId: user.id,
    },
  })

  const page2 = await prisma.instagramPage.upsert({
    where: { id: 'seed-page-2' },
    update: {},
    create: {
      id: 'seed-page-2',
      name: 'Projeto Pessoal',
      username: 'meu_projeto',
      userId: user.id,
    },
  })

  const page3 = await prisma.instagramPage.upsert({
    where: { id: 'seed-page-3' },
    update: {},
    create: {
      id: 'seed-page-3',
      name: 'Blog de Viagens',
      username: 'viagens_incriveis',
      userId: user.id,
    },
  })

  console.log('Sample pages created')

  // Generate daily data for the last 30 days
  const today = new Date()
  const daysToGenerate = 30

  // Page 1 data - Steady growth
  let followers1 = 5000
  let views1 = 15000

  for (let i = daysToGenerate; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    date.setHours(0, 0, 0, 0)

    // Add some random growth
    followers1 += Math.floor(Math.random() * 50) + 20
    views1 += Math.floor(Math.random() * 200) + 100

    await prisma.dailyData.upsert({
      where: {
        pageId_date: {
          pageId: page1.id,
          date: date,
        },
      },
      update: {
        followers: followers1,
        views: views1,
      },
      create: {
        pageId: page1.id,
        date: date,
        followers: followers1,
        views: views1,
      },
    })
  }

  console.log(`Generated ${daysToGenerate + 1} days of data for ${page1.name}`)

  // Page 2 data - Exponential growth
  let followers2 = 2000
  let views2 = 8000

  for (let i = daysToGenerate; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    date.setHours(0, 0, 0, 0)

    // Exponential growth
    followers2 += Math.floor(Math.random() * 100) + 50 + (daysToGenerate - i) * 2
    views2 += Math.floor(Math.random() * 300) + 150 + (daysToGenerate - i) * 5

    await prisma.dailyData.upsert({
      where: {
        pageId_date: {
          pageId: page2.id,
          date: date,
        },
      },
      update: {
        followers: followers2,
        views: views2,
      },
      create: {
        pageId: page2.id,
        date: date,
        followers: followers2,
        views: views2,
      },
    })
  }

  console.log(`Generated ${daysToGenerate + 1} days of data for ${page2.name}`)

  // Page 3 data - Fluctuating growth
  let followers3 = 8000
  let views3 = 25000

  for (let i = daysToGenerate; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    date.setHours(0, 0, 0, 0)

    // Fluctuating growth (can go down sometimes)
    followers3 += Math.floor(Math.random() * 120) - 20
    views3 += Math.floor(Math.random() * 400) - 50

    // Ensure minimum values
    followers3 = Math.max(followers3, 8000)
    views3 = Math.max(views3, 25000)

    await prisma.dailyData.upsert({
      where: {
        pageId_date: {
          pageId: page3.id,
          date: date,
        },
      },
      update: {
        followers: followers3,
        views: views3,
      },
      create: {
        pageId: page3.id,
        date: date,
        followers: followers3,
        views: views3,
      },
    })
  }

  console.log(`Generated ${daysToGenerate + 1} days of data for ${page3.name}`)
  console.log('\nDatabase seeded successfully! \u2713')
  console.log('\nTest credentials:')
  console.log('Email: john@doe.com')
  console.log('Password: johndoe123')
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })