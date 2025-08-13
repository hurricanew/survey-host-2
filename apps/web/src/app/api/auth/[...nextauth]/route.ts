import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { UserRole, type AuthUser } from '@survey-platform/shared/types'

const handler = NextAuth({
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
        // TODO: Store user in database in Task 5
        console.log('User signed in:', { user, account, profile })
        
        // Ensure we have required user information
        if (!user.email || !user.name) {
          console.error('Missing required user information:', { user })
          return false
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
})

export { handler as GET, handler as POST }