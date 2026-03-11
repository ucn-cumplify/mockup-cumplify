'use client'

import React, { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import {
  LayoutDashboard,
  Building2,
  Users,
  LogOut,
  ShieldCheck,
  PanelLeftClose,
  PanelLeft,
  ArrowLeft,
} from 'lucide-react'
import { SuperadminDashboard } from './superadmin-dashboard'
import { SuperadminEmpresas } from './superadmin-empresas'
import { SuperadminUsuarios } from './superadmin-usuarios'

type SuperadminView = 'dashboard' | 'empresas' | 'usuarios'

export function SuperadminShell() {
  const { logout } = useAuth()
  const [currentView, setCurrentView] = useState<SuperadminView>('dashboard')
  const [collapsed, setCollapsed] = useState(false)
  const [selectedEmpresaId, setSelectedEmpresaId] = useState<string | null>(null)

  const navItems: { id: SuperadminView; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
    { id: 'empresas', label: 'Empresas', icon: <Building2 className="h-4 w-4" /> },
    { id: 'usuarios', label: 'Usuarios', icon: <Users className="h-4 w-4" /> },
  ]

  const handleOpenEmpresa = (empresaId: string) => {
    setSelectedEmpresaId(empresaId)
    setCurrentView('empresas')
  }

  function renderContent() {
    switch (currentView) {
      case 'dashboard':
        return <SuperadminDashboard />
      case 'empresas':
        return <SuperadminEmpresas selectedEmpresaId={selectedEmpresaId} onSelectedEmpresaChange={setSelectedEmpresaId} />
      case 'usuarios':
        return <SuperadminUsuarios onOpenEmpresa={handleOpenEmpresa} />
      default:
        return <SuperadminDashboard />
    }
  }

  // Collapsed sidebar
  if (collapsed) {
    return (
      <div className="flex h-screen overflow-hidden bg-background">
        <aside className="flex flex-col w-16 bg-card border-r border-border shrink-0 h-screen">
          <div className="flex items-center justify-center py-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-foreground/10">
              <ShieldCheck className="h-5 w-5 text-foreground" />
            </div>
          </div>
          <div className="flex justify-center px-2 mb-3">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => setCollapsed(false)} aria-label="Expandir sidebar">
              <PanelLeft className="h-4 w-4" />
            </Button>
          </div>
          <nav className="flex-1 flex flex-col items-center gap-1 px-2">
            {navItems.map(item => (
              <Button
                key={item.id}
                variant="ghost"
                size="icon"
                className={cn(
                  'h-9 w-9',
                  currentView === item.id
                    ? 'bg-accent text-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                )}
                onClick={() => { setCurrentView(item.id); if (item.id !== 'empresas') setSelectedEmpresaId(null) }}
                aria-label={item.label}
              >
                {item.icon}
              </Button>
            ))}
          </nav>
          <div className="flex flex-col items-center gap-1 px-2 py-3 border-t border-border">
            <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-accent/50"
              onClick={() => { sessionStorage.setItem('cumplify_role', 'user'); window.location.href = '/' }}
              aria-label="Volver al Hub">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-accent/50" onClick={logout} aria-label="Cerrar sesion">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </aside>
      <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top navbar */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-background shrink-0">
            <div className="flex items-center gap-3">
              <Badge className="bg-foreground text-background text-[10px] font-bold tracking-wider border-0 h-5 px-2">
                SUPERADMIN
              </Badge>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-sm font-medium text-foreground">Super Administrador</span>
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-foreground/10">
                <ShieldCheck className="h-3.5 w-3.5 text-foreground" />
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-auto">
            {renderContent()}
          </div>
        </div>
    </div>
  )
}

  // Expanded sidebar
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <aside className="flex flex-col w-60 bg-card border-r border-border shrink-0 h-screen">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground/10">
              <ShieldCheck className="h-4 w-4 text-foreground" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-foreground tracking-tight">Cumplify</h1>
              <p className="text-[10px] text-muted-foreground font-medium">Superadmin</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => setCollapsed(true)} aria-label="Colapsar sidebar">
            <PanelLeftClose className="h-4 w-4" />
          </Button>
        </div>

        {/* Volver al Hub */}
        <div className="px-3 pt-3 pb-1">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault()
              // Switch role to user and redirect
              sessionStorage.setItem('cumplify_role', 'user')
              window.location.href = '/'
            }}
            className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Volver al Hub de empresa
          </a>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2.5 mb-2">Navegacion</p>
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => { setCurrentView(item.id); if (item.id !== 'empresas') setSelectedEmpresaId(null) }}
              className={cn(
                'flex items-center w-full gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-colors mb-0.5',
                currentView === item.id
                  ? 'bg-accent text-foreground'
                  : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
              )}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        {/* Bottom */}
        <div className="border-t border-border px-3 py-3">
          <button
            onClick={logout}
            className="flex items-center w-full gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-accent/50 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesion
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top navbar */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-background shrink-0">
          <div className="flex items-center gap-3">
            <Badge className="bg-foreground text-background text-[10px] font-bold tracking-wider border-0 h-5 px-2">
              SUPERADMIN
            </Badge>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="text-sm font-medium text-foreground">Super Administrador</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-foreground/10">
              <ShieldCheck className="h-3.5 w-3.5 text-foreground" />
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  )
}
