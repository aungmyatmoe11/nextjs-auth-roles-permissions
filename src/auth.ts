import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { dbConnect } from "@/lib/mongodb"
import User from "@/models/user"
import { LoginSchema } from "@/schema/auth/loginSchema"
import { routePermissions } from "./routes/routesPermissions"
import { NextResponse } from "next/server"
import { hasPermission } from "./utils/helper"
import { JWT } from "next-auth/jwt"

// Types for user data and permissions
interface UserType {
  id: string
  username: string
  email: string
  permissions: string[]
}

interface ExtendedToken extends JWT {
  username?: string
  permissions?: string[]
}

interface AuthUser {
  user?: {
    permissions?: string[]
  }
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const validatedFields = LoginSchema.safeParse(credentials)

        if (!validatedFields.success) {
          return null
        }

        await dbConnect()

        const { email, password } = validatedFields.data

        try {
          const user = await User.findOne({
            email: email,
          })
          // .populate({
          //   path: "roleId",
          //   populate: {
          //     path: "permissions",
          //     model: "Permission",
          //   },
          // })

          if (user && bcrypt.compareSync(password || "", user.password)) {
            return {
              id: user._id.toString(),
              username: user.username,
              email: user.email,
              // role: user.roleId?.name,
              // permissions: user.roleId?.permissions.map((p: any) => p.key),
              permissions: ["products.view", "products.create", "users.view"],
            } as UserType
          }
        } catch (error) {
          throw new Error(error as string)
        }

        return null
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user: rawUser }) {
      const user = rawUser as UserType
      if (user) {
        token.username = user.username
        // token.role = user.role
        token.permissions = user.permissions
      }
      return token as ExtendedToken
    },
    async session({ session, token }) {
      session.user = {
        ...session.user,
        username: token.username,
        // role: token.role,
        permissions: token.permissions,
      } as typeof session.user & { username?: string; permissions: string[] }
      return session
    },
    authorized({ auth: rawAuth, request: { nextUrl } }) {
      const auth = rawAuth as AuthUser
      const { pathname } = nextUrl // Get the current URL path
      const isLoggedIn = !!auth?.user

      // Define protected routes here or retrieve from a config
      const protectedRoutes = Object.keys(routePermissions) ?? []

      // ! 1. If not logged in and accessing protected routes, redirect to login
      const isProtectedRoute = protectedRoutes.some((route) => {
        const regex = new RegExp(`^${route.replace("[id]", "[^/]+")}$`) // Match dynamic routes like /products/[id]
        return regex.test(pathname)
      })

      if (!isLoggedIn && isProtectedRoute) {
        // return Response.redirect(new URL("/login", nextUrl))
        return NextResponse.redirect(new URL("/login", nextUrl))
      }

      // ! 2. If logged in and visiting login or register, redirect to the dashboard
      if (
        isLoggedIn &&
        (pathname.startsWith("/login") || pathname.startsWith("/register"))
      ) {
        return NextResponse.redirect(new URL("/dashboard", nextUrl))
      }

      // ! 3. If accessing a protected route, check for permissions
      if (isLoggedIn && isProtectedRoute) {
        const matchedRoute = Object.keys(routePermissions).find((route) => {
          const regex = new RegExp(`^${route.replace("[id]", "[^/]+")}$`)
          return regex.test(pathname)
        })

        if (matchedRoute) {
          const requiredPermissions = routePermissions[matchedRoute]
          // If no permissions are required (empty array), allow access
          if (requiredPermissions.length === 0) {
            return NextResponse.next() // Pass through without checking permissions
          }

          // Check if the user has the necessary permissions
          const userPermissions = auth?.user?.permissions || []
          if (!hasPermission(userPermissions, requiredPermissions)) {
            // If user lacks necessary permissions, redirect to unauthorized page
            return NextResponse.redirect(new URL("/unauthorized", nextUrl))
          }
        }
      }

      // return true
      return NextResponse.next()
    },
  },
  pages: {
    signIn: "/login",
  },
})
