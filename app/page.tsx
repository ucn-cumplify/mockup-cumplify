'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { PlatformProvider, usePlatform } from '@/lib/platform-context'
import { PlatformHub } from '@/components/platform/hub'
import { AppBuilder } from '@/components/platform/builder'
import { AppWorkspace } from '@/components/platform/workspace'
import { EmpresaConfiguracion } from '@/components/platform/empresa-config'
import { UsuariosPage } from '@/components/platform/usuarios-page'
import { PerfilPage } from '@/components/platform/perfil-page'
import { BibliotecaPage } from '@/components/platform/biblioteca-page'
import { RolesPermisosPage } from '@/components/platform/roles-permisos-page'
import { MainNavSidebar } from '@/components/platform/main-nav-sidebar'

function PlatformContent() {
  const { currentView } = usePlatform()

  switch (currentView) {
    case 'hub':
      return <PlatformHub />
    case 'builder':
      return <AppBuilder />
    case 'workspace':
      return <AppWorkspace />
    case 'empresa-config':
      return <EmpresaConfiguracion />
    case 'usuarios':
      return <UsuariosPage />
    case 'perfil':
      return <PerfilPage />
    case 'biblioteca':
      return <BibliotecaPage />
    case 'roles-permisos':
      return <RolesPermisosPage />
    default:
      return <PlatformHub />
  }
}

function PlatformRouter() {
  const { currentView } = usePlatform()

  // Builder and workspace have their own full-screen layouts
  if (currentView === 'builder' || currentView === 'workspace') {
    return <PlatformContent />
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <MainNavSidebar />
      <div className="flex-1 overflow-auto">
        <PlatformContent />
      </div>
    </div>
  )
}

export default function CumplifyApp() {
  const { isAuthenticated, role } = useAuth()
  const router = useRouter()

  if (!isAuthenticated) {
    router.push('/login')
    return null
  }

  // Superadmins should use the superadmin panel
  if (role === 'superadmin') {
    router.push('/superadmin')
    return null
  }

  return (
    <PlatformProvider>
      <PlatformRouter />
    </PlatformProvider>
  )
}
