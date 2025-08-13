'use client'

import { Box, Heading, Text, Stack, Button, HStack } from '@chakra-ui/react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

export default function Home() {
  const { data: session, status } = useSession()

  return (
    <Box minH="100vh" p={8}>
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
          <HStack gap={4}>
            <Text color="gray.600">Welcome back, {session.user?.name}!</Text>
            <Link href="/dashboard">
              <Button colorScheme="blue">
                Go to Dashboard
              </Button>
            </Link>
          </HStack>
        ) : (
          <HStack gap={4}>
            <Link href="/auth/signin">
              <Button colorScheme="blue">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/signin">
              <Button variant="outline">
                Get Started
              </Button>
            </Link>
          </HStack>
        )}
      </Stack>
    </Box>
  )
}
