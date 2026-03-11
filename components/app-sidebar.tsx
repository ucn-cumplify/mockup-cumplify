'use client'

import React, { useState } from 'react'
import { useApp } from '@/lib/app-context'
import { useAuth } from '@/lib/auth-context'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Settings,
  FolderKanban,
  ClipboardList,
  Library,
  Users,
  UserCircle,
  Scale,
  LogOut,
  ChevronDown,
  Building2,
  Network,
} from 'lucide-react'

interface NavItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  children?: { id: string; label: string }[]
}

const navItems: NavItem[] = [
  { id: 'tablero', label: 'Tablero', icon: LayoutDashboard },
  {
    id: 'configuracion',
    label: 'Configuración',
    icon: Settings,
    children: [
      { id: 'config-empresa', label: 'Empresa' },
      { id: 'config-unidades-gestion', label: 'Unidades de Gestión' },
      { id: 'config-unidades-control', label: 'Unidades de Control' },
    ]
  },
  { id: 'proyectos', label: 'Proyectos', icon: FolderKanban },
  { id: 'plan-trabajo', label: 'Plan de Trabajo', icon: ClipboardList },
  { id: 'biblioteca', label: 'Biblioteca', icon: Library },
  { id: 'usuarios', label: 'Usuarios', icon: Users },
  { id: 'perfil', label: 'Perfil', icon: UserCircle },
  { id: 'normas', label: 'Normas', icon: Scale },
  { id: 'organigrama', label: 'Organigrama', icon: Network },
]

export function AppSidebar() {
  const { activeSection, setActiveSection, currentUser } = useApp()
  const { logout } = useAuth()
  const [expandedItems, setExpandedItems] = useState<string[]>(['configuracion'])

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const handleNavClick = (id: string, hasChildren: boolean) => {
    if (hasChildren) {
      toggleExpanded(id)
    } else {
      setActiveSection(id)
    }
  }

  return (
    <aside className="flex flex-col w-64 bg-sidebar text-sidebar-foreground min-h-screen">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-sidebar-border">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary">
          <Building2 className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <span className="text-lg font-semibold text-primary">Cumplify</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <p className="px-3 mb-3 text-xs font-medium uppercase tracking-wider text-sidebar-foreground/50">
          Menú
        </p>
        <ul className="space-y-1">
          {navItems.map(item => {
            const Icon = item.icon
            const isActive = activeSection === item.id || 
              (item.children?.some(c => c.id === activeSection))
            const isExpanded = expandedItems.includes(item.id)
            const hasChildren = !!item.children?.length

            return (
              <li key={item.id}>
                <button
                  onClick={() => handleNavClick(item.id, hasChildren)}
                  className={cn(
                    'flex items-center w-full gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {hasChildren && (
                    <ChevronDown
                      className={cn(
                        'w-4 h-4 transition-transform',
                        isExpanded && 'rotate-180'
                      )}
                    />
                  )}
                </button>

                {hasChildren && isExpanded && (
                  <ul className="mt-1 ml-8 space-y-1">
                    {item.children?.map(child => (
                      <li key={child.id}>
                        <button
                          onClick={() => setActiveSection(child.id)}
                          className={cn(
                            'flex items-center w-full px-3 py-2 rounded-lg text-sm transition-colors',
                            activeSection === child.id
                              ? 'bg-sidebar-primary/20 text-sidebar-primary'
                              : 'text-sidebar-foreground/60 hover:bg-sidebar-accent/30 hover:text-sidebar-foreground'
                          )}
                        >
                          {child.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User section */}
      <div className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-sidebar-accent flex items-center justify-center">
            <UserCircle className="w-5 h-5 text-sidebar-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{currentUser?.name}</p>
            <p className="text-xs text-sidebar-foreground/60 truncate">{currentUser?.email}</p>
          </div>
        </div>
        <button
          onClick={() => logout()}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Salir</span>
        </button>
      </div>
    </aside>
  )
}
