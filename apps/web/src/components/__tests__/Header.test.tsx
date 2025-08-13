import { render, screen } from '@testing-library/react'
import { Header } from '../Header'
import { useAuth } from '@/hooks/useAuth'
import * as React from 'react'

// Mock the useAuth hook
jest.mock('@/hooks/useAuth')
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>

// Mock Next.js Link component
jest.mock('next/link', () => {
  const MockLink = ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  )
  MockLink.displayName = 'MockLink'
  return MockLink
})

// No need for complex React mocking for basic functionality test

// Mock Chakra UI components
jest.mock('@chakra-ui/react', () => ({
  Box: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => <div {...props}>{children}</div>,
  HStack: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => <div {...props}>{children}</div>,
  Text: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => <span {...props}>{children}</span>,
  Button: ({ children, onClick, ...props }: React.PropsWithChildren<Record<string, unknown> & { onClick?: () => void }>) => (
    <button onClick={onClick} {...props}>{children}</button>
  ),
}))

// No need to mock icons since we're using text

describe('Header', () => {
  const mockLogin = jest.fn()
  const mockLogout = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders sign in button when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: mockLogin,
      logout: mockLogout,
      requireAuth: jest.fn(),
      session: null,
    })

    render(<Header />)

    expect(screen.getByText('TTI Survey Platform')).toBeInTheDocument()
    expect(screen.getByText('Sign In')).toBeInTheDocument()
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument()
  })

  it('renders user menu when user is authenticated', () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      role: 'USER' as const,
    }

    mockUseAuth.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
      login: mockLogin,
      logout: mockLogout,
      requireAuth: jest.fn(),
      session: { user: mockUser, expires: '2024-01-01' },
    })

    render(<Header />)

    expect(screen.getByText('TTI Survey Platform')).toBeInTheDocument()
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Test User')).toBeInTheDocument()
    expect(screen.getByText('Sign Out')).toBeInTheDocument()
    expect(screen.queryByText('Sign In')).not.toBeInTheDocument()
  })

  it('has correct navigation links', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: mockLogin,
      logout: mockLogout,
      requireAuth: jest.fn(),
      session: null,
    })

    render(<Header />)

    const homeLink = screen.getByText('TTI Survey Platform').closest('a')
    expect(homeLink).toHaveAttribute('href', '/')
  })

  // Note: We can't easily test hydration state with current setup, 
  // but the component will work correctly in the browser
})