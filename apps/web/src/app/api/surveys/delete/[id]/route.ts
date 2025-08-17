import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: 'Survey ID is required' },
        { status: 400 }
      )
    }

    // Forward the delete request to the backend API with proper authentication
    const response = await fetch(`${API_BASE_URL}/api/surveys/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.accessToken || 'dev-token'}`,
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Survey not found' },
          { status: 404 }
        )
      }
      
      if (response.status === 403) {
        return NextResponse.json(
          { error: 'You can only delete your own surveys' },
          { status: 403 }
        )
      }

      throw new Error(`Backend API error: ${response.status}`)
    }

    // Return success response
    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error deleting survey:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}