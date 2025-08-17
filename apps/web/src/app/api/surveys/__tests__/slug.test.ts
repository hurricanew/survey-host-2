
/* eslint-disable @typescript-eslint/no-require-imports */
import { GET } from '../[slug]/route'

// Mock Next.js server components
jest.mock('next/server', () => ({
  NextRequest: jest.fn().mockImplementation((url) => ({
    url,
    method: 'GET',
    headers: new Map(),
  })),
  NextResponse: {
    json: jest.fn().mockImplementation((data, options = {}) => ({
      json: () => Promise.resolve(data),
      status: options.status || 200,
    })),
  },
}))

// Mock fetch globally
const mockFetch = jest.fn()
global.fetch = mockFetch

describe('/api/surveys/[slug] route', () => {
  const API_BASE_URL = 'http://localhost:3001'

  beforeEach(() => {
    jest.clearAllMocks()
    process.env.API_BASE_URL = API_BASE_URL
  })

  const createMockRequest = (slug: string) => {
    const { NextRequest } = require('next/server')
    return new NextRequest(`http://localhost:3000/api/surveys/${slug}`)
  } 

  const mockSurveyData = {
    id: 'test-id',
    title: 'Test Survey',
    slug: 'A1B2C3D4', // 8-digit hash key
    content: '{"title":"Test","questions":[]}',
    isActive: true
  }

  it('returns survey data for valid slug', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockSurveyData)
    })

    const request = createMockRequest('A1B2C3D4')
    const response = await GET(request, { params: { slug: 'A1B2C3D4' } })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual(mockSurveyData)
    expect(mockFetch).toHaveBeenCalledWith(
      `${API_BASE_URL}/public/surveys/A1B2C3D4`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  })

  it('returns 404 for non-existent survey', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ error: 'Survey not found' })
    })

    const request = createMockRequest('B5C6D7E8')
    const response = await GET(request, { params: { slug: 'B5C6D7E8' } })
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('Survey not found')
  })

  it('handles backend API errors', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ message: 'Internal server error' })
    })

    const request = createMockRequest('A1B2C3D4')
    const response = await GET(request, { params: { slug: 'A1B2C3D4' } })
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Internal server error')
  })

  it('handles backend API errors without JSON response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: () => Promise.reject(new Error('No JSON response'))
    })

    const request = createMockRequest('A1B2C3D4')
    const response = await GET(request, { params: { slug: 'A1B2C3D4' } })
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Failed to fetch survey')
  })

  it('handles network errors', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    const request = createMockRequest('A1B2C3D4')
    const response = await GET(request, { params: { slug: 'A1B2C3D4' } })
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Internal server error')
  })

  it('uses correct API base URL from environment', async () => {
    process.env.API_BASE_URL = 'https://api.example.com'

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockSurveyData)
    })

    const request = createMockRequest('A1B2C3D4')
    await GET(request, { params: { slug: 'A1B2C3D4' } })

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.example.com/public/surveys/A1B2C3D4',
      expect.any(Object)
    )
  })

  it('falls back to localhost when API_BASE_URL not set', async () => {
    delete process.env.API_BASE_URL

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockSurveyData)
    })

    const request = createMockRequest('A1B2C3D4')
    await GET(request, { params: { slug: 'A1B2C3D4' } })

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3001/public/surveys/A1B2C3D4',
      expect.any(Object)
    )
  })
})