'use client'

import { Box, Button, HStack, Text } from '@chakra-ui/react'
import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'

export function Header() {
  const { user, isAuthenticated, login, logout } = useAuth()

  return (
    <Box 
      as="header" 
      bg="white" 
      borderBottomWidth="1px" 
      borderBottomColor="gray.200"
      px={8} 
      py={4}
    >
      <HStack justify="space-between" align="center">
        <Link href="/">
          <Text fontSize="xl" fontWeight="bold" color="blue.600">
            TTI Survey Platform
          </Text>
        </Link>
        
        <HStack gap={4}>
          {isAuthenticated && user ? (
            <>
              <Link href="/dashboard">
                <Button variant="ghost">
                  Dashboard
                </Button>
              </Link>
              <HStack gap={2}>
                <Box 
                  bg="blue.500" 
                  color="white" 
                  borderRadius="full" 
                  w={8} 
                  h={8} 
                  display="flex" 
                  alignItems="center" 
                  justifyContent="center" 
                  fontSize="sm"
                >
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </Box>
                <Text>{user.name}</Text>
                <Button variant="outline" size="sm" onClick={logout}>
                  Sign Out
                </Button>
              </HStack>
            </>
          ) : (
            <Button colorScheme="blue" onClick={login}>
              Sign In
            </Button>
          )}
        </HStack>
      </HStack>
    </Box>
  )
}