import { type NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { UserRole, type AuthUser } from '@survey-platform/shared/types'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    })
  ],
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.role = UserRole.USER // Default role
        token.picture = (profile as { picture?: string }).picture
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        const authUser: AuthUser = {
          id: token.sub!,
          email: session.user.email!,
          name: session.user.name!,
          role: (token.role as UserRole) || UserRole.USER,
        }
        return {
          ...session,
          user: authUser,
        }
      }
      return session
    },
    async signIn({ user, account, profile }) {
      try {
        // Ensure we have required user information
        if (!user.email || !user.name) {
          console.error('Missing required user information:', { user })
          return false
        }

        // Create/update user in database via API
        if (account?.provider === 'google' && profile) {
          try {
            const googleUser = {
              id: profile.sub || user.id,
              email: user.email,
              name: user.name,
              picture: (profile as { picture?: string }).picture || user.image,
            }

            const apiUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/users/create`
            console.log('Attempting to validate user with internal API:', { apiUrl, googleUser })
            
            const response = await fetch(apiUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ googleUser }),
            })

            if (!response.ok) {
              console.warn('Failed to create/validate user in database (continuing with JWT-only auth):', {
                status: response.status,
                statusText: response.statusText
              })
              // Continue with JWT-only authentication - user data is still available in session
            } else {
              const result = await response.json()
              console.log('✅ User validated/created in database:', result)
            }
          } catch (apiError) {
            console.warn('Database connection failed (continuing with JWT-only auth):', (apiError as Error).message)
            // Continue with JWT-only authentication - user can still access the app
          }
        }
        
        return true
      } catch (error) {
        console.error('Error during sign in:', error)
        return false
      }
    },
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
}