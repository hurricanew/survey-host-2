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
  Modal: ({ children, isOpen, onClose }: { 
    children?: React.ReactNode; 
    isOpen?: boolean; 
    onClose?: () => void;
  }) => (
    isOpen ? <div data-testid="modal" onClick={() => onClose?.()}>{children}</div> : null
  ),
  ModalOverlay: ({ children, ...props }: { children?: React.ReactNode }) => <div {...props}>{children}</div>,
  ModalContent: ({ children, ...props }: { children?: React.ReactNode }) => <div {...props}>{children}</div>,
  ModalHeader: ({ children, ...props }: { children?: React.ReactNode }) => <h2 {...props}>{children}</h2>,
  ModalBody: ({ children, ...props }: { children?: React.ReactNode }) => <div {...props}>{children}</div>,
  ModalFooter: ({ children, ...props }: { children?: React.ReactNode }) => <div {...props}>{children}</div>,
  ModalCloseButton: () => <button data-testid="close-modal">×</button>,
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

  it('opens delete confirmation modal when delete button is clicked', async () => {
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

    // Check that the modal is opened
    expect(screen.getByRole('heading', { name: 'Delete Survey' })).toBeInTheDocument()
    expect(screen.getByText('Are you sure you want to delete "Survey 1"? This action cannot be undone.')).toBeInTheDocument()
  })

  it('closes modal when cancel button is clicked', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockSurveys)
    })

    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('Survey 1')).toBeInTheDocument()
    })

    // Open modal
    const deleteButtons = screen.getAllByLabelText('Delete survey')
    fireEvent.click(deleteButtons[0])

    expect(screen.getByRole('heading', { name: 'Delete Survey' })).toBeInTheDocument()

    // Click cancel
    fireEvent.click(screen.getByText('Cancel'))

    // Modal should be closed
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

    // Open modal
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

    // Modal should be closed
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

    // Open modal and confirm deletion
    const deleteButtons = screen.getAllByLabelText('Delete survey')
    fireEvent.click(deleteButtons[0])
    const deleteButton = screen.getByRole('button', { name: 'Delete Survey' })
    fireEvent.click(deleteButton)

    await waitFor(() => {
      expect(screen.getByText('Error: Server error')).toBeInTheDocument()
    })
  })

  it('closes modal when clicking outside', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockSurveys)
    })

    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('Survey 1')).toBeInTheDocument()
    })

    // Open modal
    const deleteButtons = screen.getAllByLabelText('Delete survey')
    fireEvent.click(deleteButtons[0])

    expect(screen.getByRole('heading', { name: 'Delete Survey' })).toBeInTheDocument()

    // Click outside the modal (on the overlay)
    fireEvent.click(screen.getByTestId('modal'))

    // Modal should be closed
    expect(screen.queryByRole('heading', { name: 'Delete Survey' })).not.toBeInTheDocument()
  })
})