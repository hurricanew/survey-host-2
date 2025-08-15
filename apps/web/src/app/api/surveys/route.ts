import { NextRequest, NextResponse } from 'next/server'
// import { getServerSession } from 'next-auth'
// import { authOptions } from '@/lib/auth'

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001'

export async function POST(request: NextRequest) {
  try {
    // Temporarily bypass auth for development testing
    // const session = await getServerSession(authOptions)
    
    // if (!session?.user) {
    //   return NextResponse.json(
    //     { error: 'Unauthorized' }, 
    //     { status: 401 }
    //   )
    // }

    const body = await request.json()
    
    // Forward request to backend API (using public endpoint for development)
    const response = await fetch(`${API_BASE_URL}/public/surveys/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        { error: errorData.message || 'Failed to create survey' },
        { status: response.status }
      )
    }

    const survey = await response.json()
    return NextResponse.json(survey)
    
  } catch (error) {
    console.error('Survey creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Temporarily bypass auth for development testing
    // const session = await getServerSession(authOptions)
    
    // if (!session?.user) {
    //   return NextResponse.json(
    //     { error: 'Unauthorized' }, 
    //     { status: 401 }
    //   )
    // }

    // Forward request to backend API (using public endpoint for development)
    const response = await fetch(`${API_BASE_URL}/public/surveys/all`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        { error: errorData.message || 'Failed to fetch surveys' },
        { status: response.status }
      )
    }

    const surveys = await response.json()
    return NextResponse.json(surveys)
    
  } catch (error) {
    console.error('Survey fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}