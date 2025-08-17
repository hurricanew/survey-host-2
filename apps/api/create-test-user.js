const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createTestUser() {
  try {
    const user = await prisma.user.create({
      data: {
        id: 'test-user-123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'USER'
      }
    })
    console.log('Test user created:', user)
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('Test user already exists')
    } else {
      console.error('Error creating test user:', error)
    }
  } finally {
    await prisma.$disconnect()
  }
}

createTestUser()