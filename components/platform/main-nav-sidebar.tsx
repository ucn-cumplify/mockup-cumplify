'use client'

import React, { useState } from 'react'
import { usePlatform } from '@/lib/platform-context'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Plus,
  ChevronDown,
  Building2,
  Users,
  Network,
  UserCircle,
  LogOut,
  PanelLeftClose,
  PanelLeft,
  Leaf,
  LayoutGrid,
  BookOpen,
  ShieldCheck,
} from 'lucide-react'

export function MainNavSidebar() {
  const { currentView, setCurrentView, startBuilder } = usePlatform()
  const { logout } = useAuth()
  const [collapsed, setCollapsed] = useState(false)
  const [empresaExpanded, setEmpresaExpanded] = useState(false)

  if (collapsed) {
    return (
      <aside className="flex flex-col w-16 bg-sidebar text-sidebar-foreground border-r border-sidebar-border shrink-0 h-screen">
        {/* Collapsed header */}
        <div className="flex items-center justify-center py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <Leaf className="h-5 w-5" />
          </div>
        </div>

        {/* Collapsed expand button */}
        <div className="flex justify-center px-2 mb-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={() => setCollapsed(false)}
            aria-label="Expandir sidebar"
          >
            <PanelLeft className="h-4 w-4" />
          </Button>
        </div>

        {/* Collapsed Nueva App */}
        <div className="flex justify-center px-2 mb-3">
          <Button
            size="icon"
            className="h-9 w-9 bg-emerald-600 hover:bg-emerald-700 text-sidebar-primary-foreground"
            onClick={() => startBuilder()}
            aria-label="Nueva App"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Collapsed nav items */}
        <nav className="flex-1 flex flex-col items-center gap-1 px-2">
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'h-9 w-9',
              currentView === 'hub'
                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
            )}
            onClick={() => setCurrentView('hub')}
            aria-label="Hub"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'h-9 w-9',
              currentView === 'empresa-config'
                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
            )}
            onClick={() => setCurrentView('empresa-config')}
            aria-label="Unidades de control"
          >
            <Network className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'h-9 w-9',
              currentView === 'usuarios'
                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
            )}
            onClick={() => setCurrentView('usuarios')}
            aria-label="Usuarios"
          >
            <Users className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'h-9 w-9',
              currentView === 'roles-permisos'
                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
            )}
            onClick={() => setCurrentView('roles-permisos')}
            aria-label="Roles y permisos"
          >
            <ShieldCheck className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'h-9 w-9',
              currentView === 'biblioteca'
                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
            )}
            onClick={() => setCurrentView('biblioteca')}
            aria-label="Biblioteca"
          >
            <BookOpen className="h-4 w-4" />
          </Button>
        </nav>

        {/* Collapsed bottom */}
        <div className="flex flex-col items-center gap-1 px-2 py-3 border-t border-sidebar-border">
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'h-9 w-9',
              currentView === 'perfil'
                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
            )}
            onClick={() => setCurrentView('perfil')}
            aria-label="Perfil"
          >
            <UserCircle className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-sidebar-foreground/60 hover:text-destructive hover:bg-sidebar-accent/50"
            onClick={logout}
            aria-label="Cerrar sesion"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </aside>
    )
  }

  return (
    <aside className="flex flex-col w-60 bg-sidebar text-sidebar-foreground border-r border-sidebar-border shrink-0 h-screen">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <Leaf className="h-4 w-4" />
          </div>
          <h1 className="text-sm font-bold text-sidebar-foreground tracking-tight">Cumplify</h1>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent"
          onClick={() => setCollapsed(true)}
          aria-label="Colapsar sidebar"
        >
          <PanelLeftClose className="h-4 w-4" />
        </Button>
      </div>

      {/* Nueva App button */}
      <div className="px-3 pt-4 pb-2">
        <Button
          className="w-full justify-start gap-2 bg-emerald-600 hover:bg-emerald-700 text-sidebar-primary-foreground font-medium h-9 text-sm"
          onClick={() => startBuilder()}
        >
          <Plus className="h-4 w-4" />
          Nueva App
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-2">
        {/* Hub link */}
        <button
          onClick={() => setCurrentView('hub')}
          className={cn(
            'flex items-center w-full gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-colors',
            currentView === 'hub'
              ? 'bg-sidebar-accent text-sidebar-accent-foreground'
              : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
          )}
        >
          <LayoutGrid className="h-4 w-4" />
          Hub
        </button>

        {/* Biblioteca link */}
        <button
          onClick={() => setCurrentView('biblioteca')}
          className={cn(
            'flex items-center w-full gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-colors mt-1',
            currentView === 'biblioteca'
              ? 'bg-sidebar-accent text-sidebar-accent-foreground'
              : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
          )}
        >
          <BookOpen className="h-4 w-4" />
          Biblioteca
        </button>

        {/* Empresa section */}
        <div className="mt-4">
          <button
            onClick={() => setEmpresaExpanded(!empresaExpanded)}
            className={cn(
              'flex items-center w-full gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-colors',
              (currentView === 'empresa-config' || currentView === 'usuarios' || currentView === 'roles-permisos')
                ? 'text-sidebar-foreground'
                : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
            )}
          >
            <Building2 className="h-4 w-4" />
            <span className="flex-1 text-left">Empresa</span>
            <ChevronDown
              className={cn(
                'h-3.5 w-3.5 transition-transform',
                empresaExpanded && 'rotate-180'
              )}
            />
          </button>

          {empresaExpanded && (
            <div className="mt-1 ml-6 flex flex-col gap-0.5">
              <button
                onClick={() => setCurrentView('empresa-config')}
                className={cn(
                  'flex items-center w-full gap-2 px-2.5 py-1.5 rounded-lg text-sm transition-colors',
                  currentView === 'empresa-config'
                    ? 'bg-sidebar-primary/20 text-sidebar-primary'
                    : 'text-sidebar-foreground/60 hover:bg-sidebar-accent/30 hover:text-sidebar-foreground'
                )}
              >
                <Network className="h-3.5 w-3.5" />
                Unidades de control
              </button>
              <button
                onClick={() => setCurrentView('usuarios')}
                className={cn(
                  'flex items-center w-full gap-2 px-2.5 py-1.5 rounded-lg text-sm transition-colors',
                  currentView === 'usuarios'
                    ? 'bg-sidebar-primary/20 text-sidebar-primary'
                    : 'text-sidebar-foreground/60 hover:bg-sidebar-accent/30 hover:text-sidebar-foreground'
                )}
              >
                <Users className="h-3.5 w-3.5" />
                Usuarios
              </button>
              <button
                onClick={() => setCurrentView('roles-permisos')}
                className={cn(
                  'flex items-center w-full gap-2 px-2.5 py-1.5 rounded-lg text-sm transition-colors',
                  currentView === 'roles-permisos'
                    ? 'bg-sidebar-primary/20 text-sidebar-primary'
                    : 'text-sidebar-foreground/60 hover:bg-sidebar-accent/30 hover:text-sidebar-foreground'
                )}
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                Roles y permisos
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Bottom section */}
      <div className="border-t border-sidebar-border px-3 py-3 flex flex-col gap-1">
        <button
          onClick={() => setCurrentView('perfil')}
          className={cn(
            'flex items-center w-full gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-colors',
            currentView === 'perfil'
              ? 'bg-sidebar-accent text-sidebar-accent-foreground'
              : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
          )}
        >
          <UserCircle className="h-4 w-4" />
          Perfil
        </button>
        <button
          onClick={logout}
          className="flex items-center w-full gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium text-sidebar-foreground/70 hover:text-destructive hover:bg-sidebar-accent/50 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesion
        </button>
      </div>
    </aside>
  )
}
