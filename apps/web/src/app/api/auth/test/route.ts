import { NextResponse } from 'next/server'

export async function GET() {
  const nextAuthUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  const expectedRedirectUri = `${nextAuthUrl}/api/auth/callback/google`
  
  const config = {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? '***configured***' : 'missing',
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? '***configured***' : 'missing',
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? '***configured***' : 'missing',
  }

  return NextResponse.json({
    message: 'OAuth Configuration Check',
    config,
    expectedRedirectUri,
    instructions: 'Add this exact redirect URI to your Google Cloud Console OAuth 2.0 Client ID configuration',
    timestamp: new Date().toISOString(),
  })
}