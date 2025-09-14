import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const roles = [
  {
    name: 'call centre',
    path: ['/dashboard', '/profile', '/login', '/signup', '/', '/ccenter', '/logout', 'jobs'],
  },
  {
    name: 'fleet manager',
    path: ['/fleetManager', '/jobsFleet', '/dashboard', '/drivers', '/vehicles', '/technician', '/profile', '/logs', '/login', '/signup', '/', '/logout', '/qoutation'],
  },
  {
    name: 'customer',
    path: ['/dashboard', '/profile', '/editCustomer', '/customer', '/login', '/signup', '/', '/logout', '/ccenter', '/exvehicles', '/extechnicians'],
  },
  {
    name: 'cost centre',
    path: ['/dashboard', '/ccenter', '/jobs', '/profile', '/quotation', '/notification', '/login', '/signup', '/', '/logout', '/userManagement'],
  },
]

const publicRoutes = ['/login', '/signup', '/', '/logout', '/register',
  '/register/company', '/register/workshop',
  '/register/workshop/jobCard', '/register/onboarding',
  '/register/success', '/register/workshop/success',
  '/register/workshop/fileUpload']

function getAllowedPaths(role: string): string[] {
  return roles.find(r => r.name === role)?.path || []
}

export async function middleware(req: NextRequest) {

  //Thsi is new section If the user is accessing the /logout page, clear cookies and redirect
  if (req.nextUrl.pathname === '/logout') {
    const response = NextResponse.redirect(new URL('/login', req.url))
    // List all cookies you want to clear
    response.cookies.delete('access_token')
    response.cookies.delete('refresh_token')
    // Add more cookies here if needed
    return response
  }



  const path = req.nextUrl.pathname
  // Check for Supabase session cookies
  const accessToken = req.cookies.get('access_token')?.value
  const isAuthenticated = !!accessToken
  const isPublicRoute = publicRoutes.includes(path)

  // Redirect unauthenticated users trying to access protected routes
  if (!isAuthenticated && !isPublicRoute) {
    console.log('Not authenticated — redirecting to /login')
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // If authenticated, get user role from database
  if (isAuthenticated) {
    try {
      const supabase = await createClient()
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) {
        return NextResponse.redirect(new URL('/login', req.url))
      }
      console.log("The user id is", user?.id)
      console.log("The user role is", user?.user_metadata.role)

      if (user) {
        const role = decodeURIComponent(user.user_metadata.role)
        if (role) {
          const allowedPaths = getAllowedPaths(role)
          const isAllowed = allowedPaths.some(p => path.startsWith(p))
          if (!isAllowed) {
            console.log(`Role "${role}" is not allowed to access "${path}" — redirecting to /dashboard`)
            return NextResponse.redirect(new URL('/login', req.url))
          }
          // switch (role) {
          //   case "call center":
          //     return NextResponse.redirect(new URL('/callcenter', req.url))
          //     break
          //   case "fleet manager":
          //     return NextResponse.redirect(new URL('/fleetManager', req.url))
          //     break
          //   case "cost center":
          //     return NextResponse.redirect(new URL('/ccenter', req.url))
          //     break
          //   case "customer":
          //     return NextResponse.redirect(new URL('/customer', req.url))
          //     break
          //   default:
          //     return NextResponse.redirect(new URL('/dashboard', req.url))
          // }
        } else {
          console.log('No role found for user — redirecting to /dashboard')
          return NextResponse.redirect(new URL('/dashboard', req.url))
        }
      }
    } catch (error) {
      console.error('Error in middleware:', error)
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next|.*\\.(?:png|jpg|jpeg|svg|ico|css|js)).*)'
  ],
}
