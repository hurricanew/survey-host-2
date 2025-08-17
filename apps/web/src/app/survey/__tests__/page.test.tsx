/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable react/display-name */
import { render, screen } from '@testing-library/react'
import SurveyPage from '../[slug]/page'

// Mock ChakraUI components
jest.mock('@chakra-ui/react', () => ({
  Box: ({ children, ...props }: { children?: React.ReactNode }) => <div {...props}>{children}</div>,
  Container: ({ children, ...props }: { children?: React.ReactNode }) => <div {...props}>{children}</div>,
  Text: ({ children, ...props }: { children?: React.ReactNode }) => <div {...props}>{children}</div>,
  Button: ({ children, onClick, ...props }: { children?: React.ReactNode; onClick?: () => void }) => (
    <button onClick={onClick} {...props}>{children}</button>
  ),
  Spinner: () => <div role="status">Loading...</div>,
  VStack: ({ children, ...props }: { children?: React.ReactNode }) => <div {...props}>{children}</div>,
  Center: ({ children, ...props }: { children?: React.ReactNode }) => <div {...props}>{children}</div>,
}))

// Mock the InteractiveSurveyPreview component
jest.mock('@/components/survey/InteractiveSurveyPreview', () => ({
  InteractiveSurveyPreview: ({ surveyData }: { surveyData: { title?: string } | null }) => (
    <div data-testid="interactive-survey-preview">
      {surveyData && surveyData.title ? `Survey: ${surveyData.title}` : 'No survey data'}
    </div>
  )
}))

// Mock next/navigation
jest.mock('next/navigation', () => ({
  notFound: jest.fn()
}))

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>{children}</a>
  )
})

// Mock fetch globally
const mockFetch = jest.fn()
global.fetch = mockFetch

// Mock environment variables
process.env.NEXT_PUBLIC_BASE_URL = 'http://localhost:3000'

describe('SurveyPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const mockSurveyData = {
    id: 'test-id',
    title: 'Test Survey',
    description: 'Test description',
    slug: 'A1B2C3D4', // 8-digit hash key
    content: JSON.stringify({
      title: 'Test Survey',
      description: 'Test description',
      questions: [
        {
          id: 1,
          text: 'Test question?',
          options: [
            { id: 'a', text: 'Option A', score: 1 },
            { id: 'b', text: 'Option B', score: 2 }
          ]
        }
      ],
      scoringGuide: {
        pointValues: 'Test scoring',
        totalPossible: 2,
        ranges: [
          { min: 0, max: 1, title: 'Low', description: 'Low score' },
          { min: 2, max: 2, title: 'High', description: 'High score' }
        ]
      }
    }),
    isActive: true,
    createdAt: '2025-08-15T21:30:26.748Z',
    updatedAt: '2025-08-15T21:30:26.748Z'
  }

  it('renders survey content when loaded successfully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockSurveyData)
    })

    const params = Promise.resolve({ slug: 'A1B2C3D4' })
    const RenderedComponent = await SurveyPage({ params })

    render(RenderedComponent)

    expect(screen.getByTestId('interactive-survey-preview')).toBeInTheDocument()
    expect(screen.getByText('Survey: Test Survey')).toBeInTheDocument()
    expect(mockFetch).toHaveBeenCalledWith('http://localhost:3000/api/surveys/A1B2C3D4', { cache: 'no-store' })
  })

  it('calls notFound() for 404 response', async () => {
    const { notFound } = require('next/navigation')
    
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ error: 'Survey not found' })
    })

    const params = Promise.resolve({ slug: 'B5C6D7E8' })
    await SurveyPage({ params })

    expect(notFound).toHaveBeenCalled()
  })

  it('renders inactive survey error when survey is not active', async () => {
    const inactiveSurvey = { ...mockSurveyData, isActive: false }
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(inactiveSurvey)
    })

    const params = Promise.resolve({ slug: 'A1B2C3D4' })
    const RenderedComponent = await SurveyPage({ params })

    render(RenderedComponent)

    expect(screen.getByText('Survey Not Available')).toBeInTheDocument()
    expect(screen.getByText('This survey is no longer available')).toBeInTheDocument()
  })

  it('renders error for malformed survey content', async () => {
    const malformedSurvey = { ...mockSurveyData, content: 'invalid json' }
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(malformedSurvey)
    })

    const params = Promise.resolve({ slug: 'A1B2C3D4' })
    const RenderedComponent = await SurveyPage({ params })

    render(RenderedComponent)

    expect(screen.getByText('Survey Not Available')).toBeInTheDocument()
    expect(screen.getByText('Survey data is malformed')).toBeInTheDocument()
  })

  it('renders error for network failure', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    const params = Promise.resolve({ slug: 'A1B2C3D4' })
    const RenderedComponent = await SurveyPage({ params })

    render(RenderedComponent)

    expect(screen.getByText('Survey Not Available')).toBeInTheDocument()
    expect(screen.getByText('Network error')).toBeInTheDocument()
  })

  it('renders Go Home button for errors', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    const params = Promise.resolve({ slug: 'B5C6D7E8' })
    const RenderedComponent = await SurveyPage({ params })

    render(RenderedComponent)

    expect(screen.getByText('Go Home')).toBeInTheDocument()
    const homeButton = screen.getByText('Go Home')
    expect(homeButton.closest('a')).toHaveAttribute('href', '/')
  })

  it('parses content correctly when stored as JSON string', async () => {
    const surveyWithStringContent = {
      ...mockSurveyData,
      content: JSON.stringify({
        title: 'Parsed Survey',
        description: 'Parsed description',
        questions: [],
        scoringGuide: { pointValues: '', totalPossible: 0, ranges: [] }
      })
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(surveyWithStringContent)
    })

    const params = Promise.resolve({ slug: 'A1B2C3D4' })
    const RenderedComponent = await SurveyPage({ params })

    render(RenderedComponent)

    expect(screen.getByText('Survey: Parsed Survey')).toBeInTheDocument()
  })

  it('handles content that is already an object', async () => {
    const surveyWithObjectContent = {
      ...mockSurveyData,
      content: {
        title: 'Object Survey',
        description: 'Object description',
        questions: [],
        scoringGuide: { pointValues: '', totalPossible: 0, ranges: [] }
      }
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(surveyWithObjectContent)
    })

    const params = Promise.resolve({ slug: 'A1B2C3D4' })
    const RenderedComponent = await SurveyPage({ params })

    render(RenderedComponent)

    expect(screen.getByText('Survey: Object Survey')).toBeInTheDocument()
  })
})