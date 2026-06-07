import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/db'
import { supabaseAdmin } from '@/lib/supabase'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials')
        }

        // Authenticate via Supabase Auth
        const { error } = await supabaseAdmin.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password,
        })

        if (error) {
          throw new Error(error.message)
        }

        // Check users table first (admin/staff roles)
        const user = await prisma.user.findFirst({
          where: { email: credentials.email, active: true },
        })

        if (user) {
          return { id: user.id, email: user.email, name: user.name, role: user.role }
        }

        // Check tenants table
        const tenant = await prisma.tenant.findFirst({
          where: { email: credentials.email, status: 'ACTIVE' },
        })

        if (tenant) {
          return { id: tenant.id, email: tenant.email, name: tenant.name, role: 'TENANT' }
        }

        // Check landlords table
        const landlord = await prisma.landlord.findFirst({
          where: { email: credentials.email, status: 'ACTIVE' },
        })

        if (landlord) {
          return { id: landlord.id, email: landlord.email, name: landlord.name, role: 'LANDLORD' }
        }

        // Check vendors table
        const vendor = await prisma.vendor.findFirst({
          where: { email: credentials.email, status: 'ACTIVE' },
        })

        if (vendor) {
          return { id: vendor.id, email: vendor.email, name: vendor.name, role: 'VENDOR' }
        }

        throw new Error('No account found for this email')
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
  pages: {
    signIn: '/admin/login',
    error: '/admin/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
}
