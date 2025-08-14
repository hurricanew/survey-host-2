import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { googleUser } = body

    // Validate required fields
    if (!googleUser?.email || !googleUser?.name || !googleUser?.id) {
      return NextResponse.json(
        { success: false, error: 'Missing required Google user information' },
        { status: 400 }
      )
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(googleUser.email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate name length
    if (googleUser.name.length < 1 || googleUser.name.length > 100) {
      return NextResponse.json(
        { success: false, error: 'Name must be between 1 and 100 characters' },
        { status: 400 }
      )
    }

    // Try to find existing user by Google ID first
    let user = await prisma.user.findUnique({
      where: { googleId: googleUser.id },
    })

    if (!user) {
      // Try to find by email (in case user signed up differently)
      user = await prisma.user.findUnique({
        where: { email: googleUser.email },
      })

      if (user) {
        // Update existing user with Google ID
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            googleId: googleUser.id,
            picture: googleUser.picture,
          },
        })
      } else {
        // Create new user
        user = await prisma.user.create({
          data: {
            email: googleUser.email,
            name: googleUser.name,
            googleId: googleUser.id,
            picture: googleUser.picture,
            role: 'USER',
          },
        })
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      message: 'User validated/created successfully',
    })
  } catch (error) {
    console.error('Error creating/validating user:', error)
    
    // More specific error handling for database issues
    if (error instanceof Error) {
      if (error.message.includes('unique constraint')) {
        return NextResponse.json(
          { success: false, error: 'User with this email already exists' },
          { status: 409 }
        )
      }
      if (error.message.includes('connect')) {
        return NextResponse.json(
          { success: false, error: 'Database connection failed' },
          { status: 503 }
        )
      }
    }
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}