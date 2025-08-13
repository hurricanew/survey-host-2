'use client'

import { Box, Button, Heading, Text, VStack, HStack } from '@chakra-ui/react'
import { useAuth } from '@/hooks/useAuth'
import { AuthGuard } from '@/components/AuthGuard'

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  )
}

function DashboardContent() {
  const { user, logout } = useAuth()

  return (
    <Box minH="100vh" bg="gray.50" p={8}>
      <Box maxW="6xl" mx="auto">
        <HStack justify="space-between" mb={8}>
          <VStack align="start" gap={1}>
            <Heading size="lg">Welcome to your Dashboard</Heading>
            <Text color="gray.600">
              Hello, {user?.name || user?.email}
            </Text>
          </VStack>
          
          <Button onClick={logout} variant="outline">
            Sign Out
          </Button>
        </HStack>

        <Box bg="white" rounded="lg" shadow="sm" p={6}>
          <Heading size="md" mb={4}>
            Survey Management
          </Heading>
          <Text color="gray.600" mb={4}>
            This is where you&apos;ll manage your surveys. Survey creation and management features will be implemented in upcoming stories.
          </Text>
          
          <Box bg="gray.50" p={4} rounded="md">
            <Text fontSize="sm" color="gray.500">
              <strong>User Info:</strong>
              <br />
              ID: {user?.id}
              <br />
              Email: {user?.email}
              <br />
              Role: {user?.role}
            </Text>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}