'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface AuthLayoutProps {
  children: React.ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  const pathname = usePathname()
  const isLogin = pathname === '/login'
  const isSignup = pathname === '/signup'

  return (
    <div className="min-h-screen bg-[#F5F6FA] relative overflow-hidden flex items-center justify-center">
      {/* Background diagonal accents */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1A245E]/10 via-white to-[#C7322F]/10"></div>
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#1A245E] to-[#C7322F]" />

      {/* Auth Card */}
      <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-xl p-8 mx-4 border border-gray-100">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img
              src="https://datatim.co.za/wp-content/uploads/2017/05/eps-logo.jpg"
              alt="EPS Courier Services"
              width={100}
              height={100}
              className="object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold text-[#1A245E] mb-1">EPS Courier Services</h1>
          <p className="text-gray-600 text-sm">Reliable. Professional. Nationwide.</p>
        </div>

        {children}

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-gray-500">
          © 2025 EPS Courier Services. All rights reserved.
        </div>
      </div>

      {/* Decorative stripes (inspired by truck design) */}
      <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-r from-[#1A245E] via-[#1A245E]/70 to-[#C7322F]/70 transform -skew-y-3"></div>
    </div>
  )
}
