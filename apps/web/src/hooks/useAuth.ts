'use client'

import { useSession, signOut, signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

export function useAuth() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const login = useCallback(() => {
    signIn('google', { callbackUrl: '/dashboard' })
  }, [])

  const logout = useCallback(async () => {
    await signOut({ callbackUrl: '/' })
  }, [])

  const isAuthenticated = status === 'authenticated' && !!session
  const isLoading = status === 'loading'

  const requireAuth = useCallback(() => {
    if (!isAuthenticated && !isLoading) {
      router.push('/auth/signin')
      return false
    }
    return true
  }, [isAuthenticated, isLoading, router])

  return {
    user: session?.user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    requireAuth,
    session,
  }
}