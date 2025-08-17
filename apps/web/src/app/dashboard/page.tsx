'use client'

import { Box, Heading, Text, VStack, Button, HStack, Spinner } from '@chakra-ui/react'
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from '@chakra-ui/react'
import { MdDelete } from 'react-icons/md'
import { useAuth } from '@/hooks/useAuth'
import { AuthGuard } from '@/components/AuthGuard'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  )
}

interface Survey {
  id: string;
  title: string;
  description?: string;
  slug: string;
  createdAt: string;
  isActive: boolean;
}

function DashboardContent() {
  const { user } = useAuth()
  const router = useRouter()
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copiedSurveyId, setCopiedSurveyId] = useState<string | null>(null)
  const [surveyToDelete, setSurveyToDelete] = useState<Survey | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleCreateSurvey = () => {
    router.push('/create')
  }

  const handleCopyLink = async (survey: Survey) => {
    const url = `${window.location.origin}/survey/${survey.slug}`
    try {
      await navigator.clipboard.writeText(url)
      setCopiedSurveyId(survey.id)
      // Hide the alert after 4 seconds
      setTimeout(() => {
        setCopiedSurveyId(null)
      }, 4000)
    } catch (err) {
      console.error('Failed to copy link:', err)
      // Fallback for browsers that don't support clipboard API
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      alert(`Failed to copy link: ${errorMessage}. Please copy manually: ${url}`)
    }
  }

  const handleDeleteSurvey = async () => {
    if (!surveyToDelete) return
    
    try {
      setIsDeleting(true)
      setError(null) // Clear any previous errors
      
      const response = await fetch(`/api/surveys/delete/${surveyToDelete.id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to delete survey')
      }
      
      // Remove the survey from the list
      setSurveys(surveys.filter(s => s.id !== surveyToDelete.id))
      setSurveyToDelete(null)
    } catch (err) {
      console.error('Error deleting survey:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete survey')
    } finally {
      setIsDeleting(false)
    }
  }

  // Fetch surveys on component mount
  useEffect(() => {
    const fetchSurveys = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/surveys')
        
        if (!response.ok) {
          throw new Error('Failed to fetch surveys')
        }
        
        const data = await response.json()
        setSurveys(data)
      } catch (err) {
        console.error('Error fetching surveys:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch surveys')
      } finally {
        setIsLoading(false)
      }
    }

    fetchSurveys()
  }, [])

  return (
    <Box minH="calc(100vh - 80px)" bg="#F7FAFC" p={8} fontFamily="Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif">
      <Box maxW="6xl" mx="auto">
        {/* Welcome Message */}
        <VStack align="start" gap={2} mb={8}>
          <Heading fontSize="32px" fontWeight="bold">Welcome back!</Heading>
          <Text color="#4A5568" fontSize="16px">
            Hello, {user?.name || user?.email}
          </Text>
        </VStack>

        {/* Create New Survey Button */}
        <HStack justify="start" mb={8}>
          <Button
            onClick={handleCreateSurvey}
            bg="#2B6CB0"
            color="white"
            size="lg"
            px={8}
            _hover={{ bg: "#2556A3" }}
          >
            Create New Survey
          </Button>
        </HStack>

        {/* Survey Cards Grid */}
        <VStack align="stretch" gap={4}>
          <Heading fontSize="24px" fontWeight="bold">Your Surveys</Heading>
          
          {isLoading && (
            <Box textAlign="center" py={8}>
              <Spinner size="lg" color="#2B6CB0" />
              <Text mt={4} color="#4A5568">Loading your surveys...</Text>
            </Box>
          )}

          {error && (
            <Box p={4} bg="#FED7D7" border="1px solid #E53E3E" rounded="md">
              <Text color="#C53030">Error: {error}</Text>
            </Box>
          )}

          {!isLoading && !error && surveys.length === 0 && (
            <Box bg="white" p={6} rounded="md" border="1px solid" borderColor="#E2E8F0" textAlign="center">
              <Text color="#4A5568" fontSize="16px" py={4}>
                Create your first survey to see it here
              </Text>
            </Box>
          )}

          {!isLoading && !error && surveys.length > 0 && surveys.map((survey) => (
            <Box key={survey.id} bg="white" p={6} rounded="md" border="1px solid" borderColor="#E2E8F0">
              <VStack align="start" gap={3}>
                <Heading fontSize="18px" fontWeight="bold">{survey.title}</Heading>
                <Text color="#4A5568" fontSize="14px">
                  {survey.description || 'No description'}
                </Text>
                <Text color="#4A5568" fontSize="14px">
                  Created: {new Date(survey.createdAt).toLocaleDateString()}
                </Text>
                
                {/* Success Alert for Copy Link */}
                {copiedSurveyId === survey.id && (
                  <Box 
                    bg="#C6F6D5" 
                    border="1px solid #68D391" 
                    rounded="md" 
                    p={3}
                    fontSize="14px"
                    color="#22543D"
                  >
                    <HStack gap={2}>
                      <Text fontWeight="bold">✓</Text>
                      <Text>Survey link copied to clipboard!</Text>
                    </HStack>
                  </Box>
                )}
                
                <HStack gap={2}>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    borderColor="#2B6CB0" 
                    color="#2B6CB0"
                    onClick={() => handleCopyLink(survey)}
                  >
                    Copy Link
                  </Button>
                  <Button 
                    size="sm" 
                    bg="#2B6CB0"
                    color="white"
                    _hover={{ bg: "#2556A3" }}
                    onClick={() => window.open(`/survey/${survey.slug}`, '_blank')}
                  >
                    View Survey
                  </Button>
                  <Button
                    aria-label="Delete survey"
                    size="sm"
                    variant="outline"
                    borderColor="#E53E3E"
                    color="#E53E3E"
                    _hover={{ bg: "#FED7D7" }}
                    onClick={() => setSurveyToDelete(survey)}
                    minW="32px"
                    px={2}
                  >
                    <MdDelete size={16} color="#E53E3E" />
                  </Button>
                </HStack>
              </VStack>
            </Box>
          ))}
        </VStack>

        {/* Delete Confirmation Dialog */}
        <DialogRoot 
          open={!!surveyToDelete} 
          onOpenChange={(e) => e.open ? null : setSurveyToDelete(null)}
          placement="center"
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Survey</DialogTitle>
            </DialogHeader>
            <DialogCloseTrigger />
            <DialogBody>
              <Text>
                Are you sure you want to delete &quot;{surveyToDelete?.title}&quot;? This action cannot be undone.
              </Text>
            </DialogBody>
            <DialogFooter>
              <HStack gap={3}>
                <Button
                  variant="outline"
                  onClick={() => setSurveyToDelete(null)}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  bg="#E53E3E"
                  color="white"
                  _hover={{ bg: "#C53030" }}
                  onClick={handleDeleteSurvey}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete Survey'}
                </Button>
              </HStack>
            </DialogFooter>
          </DialogContent>
        </DialogRoot>
      </Box>
    </Box>
  )
}