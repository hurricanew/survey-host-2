/**
 * @jest-environment node
 */
/* eslint-disable @typescript-eslint/no-require-imports */
import { NextRequest } from 'next/server'
import { DELETE } from '../delete/[id]/route'

// Mock next-auth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn()
}))

// Mock auth options
jest.mock('@/lib/auth', () => ({
  authOptions: {}
}))

// Mock fetch
const mockFetch = jest.fn()
global.fetch = mockFetch

// Mock Request and Headers for Node environment
Object.defineProperty(global, 'Request', {
  value: class MockRequest {
    url: string
    method: string
    headers: Map<string, string>
    
    constructor(url: string, options: Record<string, unknown> = {}) {
      this.url = url
      this.method = options.method || 'GET'
      this.headers = new Map()
    }
  }
})

Object.defineProperty(global, 'Headers', {
  value: Map
})

describe('DELETE /api/surveys/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.API_BASE_URL = 'http://localhost:3001'
  })

  it('successfully deletes survey when authenticated', async () => {
    const { getServerSession } = require('next-auth')
    getServerSession.mockResolvedValue({
      user: { id: 'test-user-123' },
      accessToken: 'test-token'
    })

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true })
    })

    const request = new NextRequest('http://localhost:3000/api/surveys/delete/survey-1', {
      method: 'DELETE'
    })
    
    const params = Promise.resolve({ id: 'survey-1' })
    const response = await DELETE(request, { params })

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ success: true })
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3001/api/surveys/survey-1',
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token',
        },
      }
    )
  })

  it('returns 401 when not authenticated', async () => {
    const { getServerSession } = require('next-auth')
    getServerSession.mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/surveys/delete/survey-1', {
      method: 'DELETE'
    })
    
    const params = Promise.resolve({ id: 'survey-1' })
    const response = await DELETE(request, { params })

    expect(response.status).toBe(401)
    expect(await response.json()).toEqual({ error: 'Unauthorized' })
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('returns 400 when survey ID is missing', async () => {
    const { getServerSession } = require('next-auth')
    getServerSession.mockResolvedValue({
      user: { id: 'test-user-123' },
      accessToken: 'test-token'
    })

    const request = new NextRequest('http://localhost:3000/api/surveys/delete/', {
      method: 'DELETE'
    })
    
    const params = Promise.resolve({ id: '' })
    const response = await DELETE(request, { params })

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ error: 'Survey ID is required' })
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('returns 404 when survey not found', async () => {
    const { getServerSession } = require('next-auth')
    getServerSession.mockResolvedValue({
      user: { id: 'test-user-123' },
      accessToken: 'test-token'
    })

    mockFetch.mockResolvedValue({
      ok: false,
      status: 404
    })

    const request = new NextRequest('http://localhost:3000/api/surveys/delete/nonexistent', {
      method: 'DELETE'
    })
    
    const params = Promise.resolve({ id: 'nonexistent' })
    const response = await DELETE(request, { params })

    expect(response.status).toBe(404)
    expect(await response.json()).toEqual({ error: 'Survey not found' })
  })

  it('returns 403 when user tries to delete another users survey', async () => {
    const { getServerSession } = require('next-auth')
    getServerSession.mockResolvedValue({
      user: { id: 'test-user-123' },
      accessToken: 'test-token'
    })

    mockFetch.mockResolvedValue({
      ok: false,
      status: 403
    })

    const request = new NextRequest('http://localhost:3000/api/surveys/delete/other-user-survey', {
      method: 'DELETE'
    })
    
    const params = Promise.resolve({ id: 'other-user-survey' })
    const response = await DELETE(request, { params })

    expect(response.status).toBe(403)
    expect(await response.json()).toEqual({ error: 'You can only delete your own surveys' })
  })

  it('handles backend API errors', async () => {
    const { getServerSession } = require('next-auth')
    getServerSession.mockResolvedValue({
      user: { id: 'test-user-123' },
      accessToken: 'test-token'
    })

    mockFetch.mockResolvedValue({
      ok: false,
      status: 500
    })

    const request = new NextRequest('http://localhost:3000/api/surveys/delete/survey-1', {
      method: 'DELETE'
    })
    
    const params = Promise.resolve({ id: 'survey-1' })
    const response = await DELETE(request, { params })

    expect(response.status).toBe(500)
    expect(await response.json()).toEqual({ error: 'Internal server error' })
  })

  it('handles network errors', async () => {
    const { getServerSession } = require('next-auth')
    getServerSession.mockResolvedValue({
      user: { id: 'test-user-123' },
      accessToken: 'test-token'
    })

    mockFetch.mockRejectedValue(new Error('Network error'))

    const request = new NextRequest('http://localhost:3000/api/surveys/delete/survey-1', {
      method: 'DELETE'
    })
    
    const params = Promise.resolve({ id: 'survey-1' })
    const response = await DELETE(request, { params })

    expect(response.status).toBe(500)
    expect(await response.json()).toEqual({ error: 'Internal server error' })
  })

  it('uses dev-token when accessToken is not available', async () => {
    const { getServerSession } = require('next-auth')
    getServerSession.mockResolvedValue({
      user: { id: 'test-user-123' }
      // No accessToken
    })

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true })
    })

    const request = new NextRequest('http://localhost:3000/api/surveys/delete/survey-1', {
      method: 'DELETE'
    })
    
    const params = Promise.resolve({ id: 'survey-1' })
    const response = await DELETE(request, { params })

    expect(response.status).toBe(200)
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3001/api/surveys/survey-1',
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer dev-token',
        },
      }
    )
  })
})