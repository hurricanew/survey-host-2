'use client'

import { Box, Heading, Text, VStack, Button, HStack, Spinner } from '@chakra-ui/react'
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

function DashboardContent() {
  const { user } = useAuth()
  const router = useRouter()
  const [surveys, setSurveys] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const handleCreateSurvey = () => {
    router.push('/create')
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
        setError(err.message)
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
                <HStack gap={2}>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    borderColor="#2B6CB0" 
                    color="#2B6CB0"
                    onClick={() => {
                      const url = `${window.location.origin}/survey/${survey.slug}`
                      navigator.clipboard.writeText(url)
                      alert('Survey link copied to clipboard!')
                    }}
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
                </HStack>
              </VStack>
            </Box>
          ))}
        </VStack>
      </Box>
    </Box>
  )
}