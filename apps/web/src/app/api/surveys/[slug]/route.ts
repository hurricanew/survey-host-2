import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
    const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001'

    // Forward request to backend API (public endpoint, no auth required)
    const response = await fetch(`${API_BASE_URL}/public/surveys/${slug}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (response.status === 404) {
      return NextResponse.json(
        { error: 'Survey not found' },
        { status: 404 }
      )
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        { error: errorData.message || 'Failed to fetch survey' },
        { status: response.status }
      )
    }

    const survey = await response.json()
    return NextResponse.json(survey)
    
  } catch (error) {
    console.error('Survey fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}