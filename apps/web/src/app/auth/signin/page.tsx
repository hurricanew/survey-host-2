'use client'

import { signIn, getSession } from 'next-auth/react'
import { Button, Box, Text, VStack, Heading } from '@chakra-ui/react'
import { FaGoogle } from 'react-icons/fa'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SignInPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Check if user is already signed in
    getSession().then((session) => {
      if (session) {
        router.push('/dashboard')
      }
    })
  }, [router])

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      await signIn('google', { 
        callbackUrl: '/dashboard',
        redirect: true 
      })
    } catch (error) {
      console.error('Sign in error:', error)
    } finally {
      setIsLoading(false)
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
          <Heading size="lg" textAlign="center">
            Sign in to Survey Platform
          </Heading>
          
          <Text textAlign="center" color="gray.600">
            Create and manage your surveys with ease
          </Text>

          <Button
            onClick={handleGoogleSignIn}
            loading={isLoading}
            colorScheme="red"
            size="lg"
            w="full"
          >
            <FaGoogle />
            {isLoading ? 'Signing in...' : 'Sign in with Google'}
          </Button>
        </VStack>
      </Box>
    </Box>
  )
}