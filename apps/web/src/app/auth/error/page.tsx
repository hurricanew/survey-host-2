'use client'

import { Box, Text, VStack, Heading, Button } from '@chakra-ui/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function ErrorPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'Configuration':
        return 'There is a problem with the server configuration.'
      case 'AccessDenied':
        return 'Access denied. You may not have permission to sign in.'
      case 'Verification':
        return 'The verification link was invalid or has expired.'
      default:
        return 'An unexpected error occurred during authentication.'
    }
  }

  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="gray.50"
    >
      <Box
        maxW="md"
        w="full"
        bg="white"
        rounded="lg"
        shadow="md"
        p={8}
      >
        <VStack gap={6}>
          <Heading size="lg" textAlign="center" color="red.500">
            Authentication Error
          </Heading>
          
          <Text textAlign="center" color="gray.600">
            {getErrorMessage(error)}
          </Text>

          <Button
            onClick={() => router.push('/auth/signin')}
            colorScheme="blue"
            size="lg"
          >
            Try Again
          </Button>
        </VStack>
      </Box>
    </Box>
  )
}

export default function ErrorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ErrorPageContent />
    </Suspense>
  )
}