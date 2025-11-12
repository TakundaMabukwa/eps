"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Permission, hasPermission, getPagePermissions, PageKey, ActionKey } from '@/lib/permissions/permissions'

export function usePermissions() {
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState<string>('')

  useEffect(() => {
    async function fetchUserPermissions() {
      try {
        const supabase = createClient()
        
        // Check session first
        const { data: { session } } = await supabase.auth.getSession()
        console.log('🔐 Session:', session?.user?.email || 'No session')
        
        const { data: { user } } = await supabase.auth.getUser()
        console.log('🔍 Auth User:', user?.email || 'No user')
        
        if (!user?.email) {
          console.log('❌ No user email found')
          setLoading(false)
          return
        }

        setUserEmail(user.email)
        console.log('📧 User Email:', user.email)

        const { data: userData, error } = await supabase
          .from('users')
          .select('permissions')
          .eq('email', user.email)
          .single()

        console.log('📊 User Data:', userData)
        console.log('❗ Query Error:', error)

        if (userData?.permissions) {
          console.log('✅ Permissions Found:', userData.permissions)
          setPermissions(userData.permissions)
        } else {
          console.log('⚠️ No permissions found in database')
        }
      } catch (error) {
        console.error('❌ Error fetching permissions:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserPermissions()
  }, [])

  const canAccess = (page: PageKey, action: ActionKey = 'view') => {
    // Special case for admin@eps.com - full access
    if (userEmail === 'admin@eps.com') {
      console.log('🔑 Admin access granted for:', page, action)
      return true
    }
    const hasAccess = hasPermission(permissions, page, action)
    console.log(`🔐 Permission check: ${page}.${action} = ${hasAccess}`, permissions)
    return hasAccess
  }

  const getActions = (page: PageKey) => {
    // Special case for admin@eps.com - all actions
    if (userEmail === 'admin@eps.com') {
      return ['view', 'create', 'edit', 'delete'] as ActionKey[]
    }
    return getPagePermissions(permissions, page)
  }

  return {
    permissions,
    loading,
    canAccess,
    getActions,
    userEmail
  }
}