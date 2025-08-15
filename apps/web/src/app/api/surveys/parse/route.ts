import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // Forward request to backend API parse endpoint (public endpoint)
    const response = await fetch(`${API_BASE_URL}/public/surveys/parse`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        { error: errorData.message || 'Failed to parse survey' },
        { status: response.status }
      )
    }

    const parsedSurvey = await response.json()
    return NextResponse.json(parsedSurvey)
    
  } catch (error) {
    console.error('Survey parse error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}