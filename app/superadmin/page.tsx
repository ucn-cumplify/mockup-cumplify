'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { SuperadminShell } from '@/components/superadmin/superadmin-shell'

export default function SuperadminPage() {
  const { isAuthenticated, role } = useAuth()
  const router = useRouter()

  if (!isAuthenticated) {
    router.push('/login')
    return null
  }

  if (role !== 'superadmin') {
    router.push('/')
    return null
  }

  return <SuperadminShell />
}
