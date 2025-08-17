import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import DashboardPage from '../page'

// Mock react-icons
jest.mock('react-icons/md', () => ({
  MdDelete: () => <svg data-testid="delete-icon">delete</svg>,
}))

// Mock ChakraUI components
jest.mock('@chakra-ui/react', () => ({
  Box: ({ children, ...props }: { children?: React.ReactNode }) => <div {...props}>{children}</div>,
  Heading: ({ children, ...props }: { children?: React.ReactNode }) => <h1 {...props}>{children}</h1>,
  Text: ({ children, ...props }: { children?: React.ReactNode }) => <div {...props}>{children}</div>,
  VStack: ({ children, ...props }: { children?: React.ReactNode }) => <div {...props}>{children}</div>,
  HStack: ({ children, ...props }: { children?: React.ReactNode }) => <div {...props}>{children}</div>,
  Button: ({ children, onClick, disabled, ...props }: { 
    children?: React.ReactNode; 
    onClick?: () => void; 
    disabled?: boolean;
  }) => (
    <button onClick={onClick} disabled={disabled} {...props}>{children}</button>
  ),
  IconButton: ({ icon, onClick, disabled, ...props }: { 
    icon?: React.ReactNode; 
    onClick?: () => void; 
    disabled?: boolean;
    'aria-label'?: string;
  }) => (
    <button onClick={onClick} disabled={disabled} aria-label={props['aria-label']} {...props}>{icon}</button>
  ),
  Spinner: () => <div role="status">Loading...</div>,
  DialogRoot: ({ children, open, onOpenChange }: { 
    children?: React.ReactNode; 
    open?: boolean; 
    onOpenChange?: (e: { open: boolean }) => void;
  }) => (
    open ? <div data-testid="dialog" onClick={() => onOpenChange?.({ open: false })}>{children}</div> : null
  ),
  DialogContent: ({ children, ...props }: { children?: React.ReactNode }) => <div {...props}>{children}</div>,
  DialogHeader: ({ children, ...props }: { children?: React.ReactNode }) => <div {...props}>{children}</div>,
  DialogTitle: ({ children, ...props }: { children?: React.ReactNode }) => <h2 {...props}>{children}</h2>,
  DialogBody: ({ children, ...props }: { children?: React.ReactNode }) => <div {...props}>{children}</div>,
  DialogFooter: ({ children, ...props }: { children?: React.ReactNode }) => <div {...props}>{children}</div>,
  DialogCloseTrigger: () => <button data-testid="close-dialog">×</button>,
}))

// Mock the AuthGuard component
jest.mock('@/components/AuthGuard', () => ({
  AuthGuard: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}))

// Mock the useAuth hook
jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'test-user-123', name: 'Test User', email: 'test@example.com' }
  })
}))

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn()
  })
}))

// Mock fetch globally
const mockFetch = jest.fn()
global.fetch = mockFetch

// Mock window.open
Object.defineProperty(window, 'open', {
  value: jest.fn(),
  writable: true
})

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn()
  }
})

// Mock setTimeout - not needed for these tests

describe('Dashboard Page - Delete Functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const mockSurveys = [
    {
      id: 'survey-1',
      title: 'Survey 1',
      description: 'Description 1',
      slug: 'A1B2C3D4',
      createdAt: '2025-08-15T21:30:26.748Z',
      isActive: true
    },
    {
      id: 'survey-2',
      title: 'Survey 2',
      description: 'Description 2',
      slug: 'E5F6G7H8',
      createdAt: '2025-08-15T21:30:26.748Z',
      isActive: true
    }
  ]

  it('renders surveys with delete buttons', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockSurveys)
    })

    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('Survey 1')).toBeInTheDocument()
      expect(screen.getByText('Survey 2')).toBeInTheDocument()
    })

    // Check that delete buttons are present
    const deleteButtons = screen.getAllByLabelText('Delete survey')
    expect(deleteButtons).toHaveLength(2)
  })

  it('opens delete confirmation dialog when delete button is clicked', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockSurveys)
    })

    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('Survey 1')).toBeInTheDocument()
    })

    // Click the first delete button
    const deleteButtons = screen.getAllByLabelText('Delete survey')
    fireEvent.click(deleteButtons[0])

    // Check that the dialog is opened
    expect(screen.getByRole('heading', { name: 'Delete Survey' })).toBeInTheDocument()
    expect(screen.getByText('Are you sure you want to delete "Survey 1"? This action cannot be undone.')).toBeInTheDocument()
  })

  it('closes dialog when cancel button is clicked', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockSurveys)
    })

    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('Survey 1')).toBeInTheDocument()
    })

    // Open dialog
    const deleteButtons = screen.getAllByLabelText('Delete survey')
    fireEvent.click(deleteButtons[0])

    expect(screen.getByRole('heading', { name: 'Delete Survey' })).toBeInTheDocument()

    // Click cancel
    fireEvent.click(screen.getByText('Cancel'))

    // Dialog should be closed
    expect(screen.queryByRole('heading', { name: 'Delete Survey' })).not.toBeInTheDocument()
  })

  it('successfully deletes survey when confirmed', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSurveys)
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true })
      })

    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('Survey 1')).toBeInTheDocument()
      expect(screen.getByText('Survey 2')).toBeInTheDocument()
    })

    // Open dialog
    const deleteButtons = screen.getAllByLabelText('Delete survey')
    fireEvent.click(deleteButtons[0])

    // Confirm deletion
    const deleteButton = screen.getByRole('button', { name: 'Delete Survey' })
    fireEvent.click(deleteButton)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenLastCalledWith('/api/surveys/delete/survey-1', {
        method: 'DELETE',
      })
    })

    // Survey should be removed from the list
    await waitFor(() => {
      expect(screen.queryByText('Survey 1')).not.toBeInTheDocument()
      expect(screen.getByText('Survey 2')).toBeInTheDocument()
    })

    // Dialog should be closed
    expect(screen.queryByRole('heading', { name: 'Delete Survey' })).not.toBeInTheDocument()
  })

  it('shows error message when delete fails', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSurveys)
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: 'Server error' })
      })

    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('Survey 1')).toBeInTheDocument()
    })

    // Open dialog and confirm deletion
    const deleteButtons = screen.getAllByLabelText('Delete survey')
    fireEvent.click(deleteButtons[0])
    const deleteButton = screen.getByRole('button', { name: 'Delete Survey' })
    fireEvent.click(deleteButton)

    await waitFor(() => {
      expect(screen.getByText('Error: Server error')).toBeInTheDocument()
    })
  })

  it('closes dialog when clicking outside', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockSurveys)
    })

    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('Survey 1')).toBeInTheDocument()
    })

    // Open dialog
    const deleteButtons = screen.getAllByLabelText('Delete survey')
    fireEvent.click(deleteButtons[0])

    expect(screen.getByRole('heading', { name: 'Delete Survey' })).toBeInTheDocument()

    // Click outside the dialog (on the overlay)
    fireEvent.click(screen.getByTestId('dialog'))

    // Dialog should be closed
    expect(screen.queryByRole('heading', { name: 'Delete Survey' })).not.toBeInTheDocument()
  })
})