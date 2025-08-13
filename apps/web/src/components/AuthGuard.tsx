'use client'

import { useAuth } from '@/hooks/useAuth'
import { Box, Spinner } from '@chakra-ui/react'
import { useEffect } from 'react'

interface AuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { isAuthenticated, isLoading, requireAuth } = useAuth()

  useEffect(() => {
    if (!isLoading) {
      requireAuth()
    }
  }, [isLoading, requireAuth])

  if (isLoading) {
    return (
      fallback || (
        <Box
          minH="100vh"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Spinner size="xl" />
        </Box>
      )
    )
  }

  if (!isAuthenticated) {
    return null // Redirect will happen in the useEffect
  }

  return <>{children}</>
}