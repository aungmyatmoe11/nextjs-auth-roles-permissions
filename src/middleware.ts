export { auth as middleware } from "@/auth"
// import { NextRequest, NextResponse } from "next/server"
// import { getToken } from "next-auth/jwt"
// import { routePermissions } from "@/routes/routesPermissions"
// import { hasPermission } from "@/utils/helper"

// const secret = process.env.NEXTAUTH_SECRET

// export async function middleware(req: NextRequest) {
//   // Extract the current URL path
//   const { pathname } = req.nextUrl

//   // Retrieve user session token from next-auth
//   const token = await getToken({ req, secret })

//   // If there's no token, redirect to login
//   console.log("token", token)
//   if (!token) {
//     return NextResponse.redirect(new URL("/login", req.url))
//   }
//   const userPermissions = token.permissions || [] // Get user permissions from the token

//   // Check for static routes first
//   if (routePermissions[pathname]) {
//     const requiredPermissions = routePermissions[pathname]
//     if (!hasPermission(userPermissions, requiredPermissions)) {
//       return NextResponse.redirect(new URL("/unauthorized", req.url))
//     }
//   } else {
//     // Handle dynamic routes with regex matching
//     const dynamicRouteMatch = Object.keys(routePermissions).find((pattern) => {
//       const regex = new RegExp(`^${pattern.replace("[id]", "[^/]+")}$`)
//       return regex.test(pathname)
//     })

//     if (dynamicRouteMatch) {
//       const requiredPermissions = routePermissions[dynamicRouteMatch]
//       if (!hasPermission(userPermissions, requiredPermissions)) {
//         return NextResponse.redirect(new URL("/unauthorized", req.url))
//       }
//     }
//   }

//   // If user has required permissions, continue
//   return NextResponse.next()
// }
