'use client'

import { Box, Heading, Text, Stack } from '@chakra-ui/react'
import { useSession } from 'next-auth/react'

export default function Home() {
  const { data: session, status } = useSession()

  return (
    <Box minH="calc(100vh - 80px)" p={8}>
      <Stack gap={6} align="center" justify="center" minH="70vh">
        <Heading as="h1" size="2xl" textAlign="center" color="blue.600">
          TTI Survey Platform
        </Heading>
        <Text fontSize="lg" textAlign="center" maxW="600px" color="gray.600">
          Transform your text files into modern, shareable online surveys. 
          Create surveys quickly and efficiently with our text-first workflow.
        </Text>
        
        {status === 'loading' ? (
          <Text>Loading...</Text>
        ) : session ? (
          <Text color="gray.600" fontSize="lg">
            Welcome back, {session.user?.name}! Use the header to navigate to your dashboard.
          </Text>
        ) : (
          <Text color="gray.600" fontSize="lg">
            Sign in using the button in the top right to get started.
          </Text>
        )}
      </Stack>
    </Box>
  )
}
