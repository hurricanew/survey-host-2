'use client'

import { Box, Heading, Text, VStack, Button, HStack } from '@chakra-ui/react'
import { useAuth } from '@/hooks/useAuth'
import { AuthGuard } from '@/components/AuthGuard'
import { useRouter } from 'next/navigation'

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

  const handleCreateSurvey = () => {
    router.push('/create')
  }

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
          
          {/* Placeholder Survey Cards */}
          <Box bg="white" p={6} rounded="md" border="1px solid" borderColor="#4A5568">
            <VStack align="start" gap={3}>
              <Heading fontSize="16px" fontWeight="bold">Sample Survey</Heading>
              <Text color="#4A5568" fontSize="16px">Total Responses: 12</Text>
              <Button size="sm" variant="outline" borderColor="#4A5568" color="#4A5568">
                Copy Link
              </Button>
            </VStack>
          </Box>
          
          <Box bg="white" p={6} rounded="md" border="1px solid" borderColor="#4A5568">
            <Text color="#4A5568" fontSize="16px" textAlign="center" py={4}>
              Create your first survey to see it here
            </Text>
          </Box>
        </VStack>
      </Box>
    </Box>
  )
}