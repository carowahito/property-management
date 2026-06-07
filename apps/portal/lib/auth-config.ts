import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
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

        // Check users table first (admin/staff roles)
        const user = await prisma.user.findFirst({
          where: { email: credentials.email, active: true },
        })

        if (user) {
          if (user.password === 'MANAGED_BY_SUPABASE') {
            // New users: authenticate via Supabase Auth
            const { error } = await supabaseAdmin.auth.signInWithPassword({
              email: credentials.email,
              password: credentials.password,
            })
            if (error) throw new Error(error.message)
          } else {
            // Legacy users: authenticate via bcrypt
            const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
            if (!isPasswordValid) throw new Error('Invalid credentials')
          }
          return { id: user.id, email: user.email, name: user.name, role: user.role }
        }

        // Check tenants table
        const tenant = await prisma.tenant.findFirst({
          where: { email: credentials.email, status: 'ACTIVE' },
        })

        if (tenant) {
          if (tenant.password === 'MANAGED_BY_SUPABASE') {
            const { error } = await supabaseAdmin.auth.signInWithPassword({
              email: credentials.email,
              password: credentials.password,
            })
            if (error) throw new Error(error.message)
          } else {
            const isPasswordValid = await bcrypt.compare(credentials.password, tenant.password ?? '')
            if (!isPasswordValid) throw new Error('Invalid credentials')
          }
          return { id: tenant.id, email: tenant.email, name: tenant.name, role: 'TENANT' }
        }

        // Check landlords table
        const landlord = await prisma.landlord.findFirst({
          where: { email: credentials.email, status: 'ACTIVE' },
        })

        if (landlord) {
          if (landlord.password === 'MANAGED_BY_SUPABASE') {
            const { error } = await supabaseAdmin.auth.signInWithPassword({
              email: credentials.email,
              password: credentials.password,
            })
            if (error) throw new Error(error.message)
          } else {
            const isPasswordValid = await bcrypt.compare(credentials.password, landlord.password ?? '')
            if (!isPasswordValid) throw new Error('Invalid credentials')
          }
          return { id: landlord.id, email: landlord.email, name: landlord.name, role: 'LANDLORD' }
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
