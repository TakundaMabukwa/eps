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
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user?.email) {
          setLoading(false)
          return
        }

        setUserEmail(user.email)

        const { data: userData } = await supabase
          .from('users')
          .select('permissions')
          .eq('email', user.email)
          .single()

        if (userData?.permissions) {
          setPermissions(userData.permissions)
        }
      } catch (error) {
        console.error('Error fetching permissions:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserPermissions()
  }, [])

  const canAccess = (page: PageKey, action: ActionKey = 'view') => {
    // Special case for admin@eps.com - full access
    if (userEmail === 'admin@eps.com') {
      return true
    }
    return hasPermission(permissions, page, action)
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