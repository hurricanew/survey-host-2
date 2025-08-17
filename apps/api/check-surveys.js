const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkSurveys() {
  try {
    console.log('Checking all surveys in database...')
    const allSurveys = await prisma.survey.findMany()
    console.log('Total surveys:', allSurveys.length)
    console.log('Surveys:', JSON.stringify(allSurveys, null, 2))
    
    console.log('\nChecking surveys for test user...')
    const userSurveys = await prisma.survey.findMany({
      where: { userId: 'test-user-123' }
    })
    console.log('User surveys:', userSurveys.length)
    console.log('User surveys:', JSON.stringify(userSurveys, null, 2))
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkSurveys()