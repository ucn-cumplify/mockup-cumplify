'use client'

import React, { useState } from 'react'
import { usePlatform, categoryConfig, type AppCategory, type AppModule } from '@/lib/platform-context'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuCheckboxItem, DropdownMenuSeparator, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { HubShortcutsSidebar } from '@/components/platform/hub-shortcuts-sidebar'
import {
  Search, Plus, LayoutGrid, List, MoreVertical,
  Recycle, ShieldAlert, Activity, Leaf, Award,
  FileText, Users, FlaskConical, Scale, Settings,
  Trash2, Archive, ExternalLink, Clock, Filter,
} from 'lucide-react'

const iconMap: Record<string, React.ElementType> = {
  Recycle, ShieldAlert, Activity, Leaf, Award,
  FileText, Users, FlaskConical, Scale, Settings,
}

function getIcon(name: string) {
  return iconMap[name] || Settings
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('es-CL', { day: 'numeric', month: 'short', year: 'numeric' }).format(date)
}

function AppCard({ app }: { app: AppModule }) {
  const { openApp, deleteApp, updateApp } = usePlatform()
  const Icon = getIcon(app.icon)

  return (
    <Card
      className="group cursor-pointer border border-border hover:border-primary/40 transition-all duration-200 hover:shadow-lg hover:shadow-primary/5 relative overflow-hidden"
      onClick={() => openApp(app.id)}
    >
      <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: app.color }} />
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${app.color}15`, color: app.color }}
          >
            <Icon className="h-5 w-5" />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              <DropdownMenuItem onClick={() => openApp(app.id)}>
                <ExternalLink className="mr-2 h-4 w-4" /> Abrir
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => updateApp(app.id, { status: 'archived' })}>
                <Archive className="mr-2 h-4 w-4" /> Archivar
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive" onClick={() => deleteApp(app.id)}>
                <Trash2 className="mr-2 h-4 w-4" /> Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-4">
          <h3 className="font-semibold text-foreground text-base leading-tight">{app.name}</h3>
          <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2 leading-relaxed">{app.description}</p>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <Badge variant="secondary" className="text-xs font-normal">
            {categoryConfig[app.category]?.label || 'Personalizado'}
          </Badge>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDate(app.updatedAt)}
          </span>
        </div>

        <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
          <span>{app.tables.length} tabla{app.tables.length !== 1 ? 's' : ''}</span>
          <span className="h-1 w-1 rounded-full bg-border" />
          <span>{app.views.length} vista{app.views.length !== 1 ? 's' : ''}</span>
        </div>
      </CardContent>
    </Card>
  )
}

export function PlatformHub() {
  const { apps, searchQuery, setSearchQuery, categoryFilter, setCategoryFilter, startBuilder, openApp } = usePlatform()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const categories = Object.entries(categoryConfig) as [AppCategory, { label: string; color: string; icon: string }][]
  const activeApps = apps.filter(a => a.status === 'active')

  const filteredApps = activeApps.filter(app => {
    const matchesSearch = !searchQuery ||
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || app.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const hasActiveFilters = categoryFilter !== 'all'

  return (
    <div className="flex-1 flex min-w-0 h-full">
      <div className="flex-1 flex flex-col min-w-0 overflow-auto">
        <div className="mx-auto w-full max-w-6xl px-6 py-6">
          {/* Page title */}
          <div className="mb-6">
            <h1 className="text-xl font-bold text-foreground tracking-tight text-balance">Mis Aplicaciones</h1>
            <p className="text-sm text-muted-foreground mt-1">Gestiona tus modulos de cumplimiento ambiental</p>
          </div>

          {/* Search + Filters */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar aplicaciones..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              {/* Filter dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9 text-sm gap-1.5">
                    <Filter className="h-3.5 w-3.5" />
                    Filtros
                    {hasActiveFilters && (
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px]">
                        {(categoryFilter !== 'all' ? 1 : 0) + (showTypeFilter !== 'all' ? 1 : 0)}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Categoria</DropdownMenuLabel>
                  <DropdownMenuCheckboxItem
                    checked={categoryFilter === 'all'}
                    onCheckedChange={() => setCategoryFilter('all')}
                  >
                    Todas las categorias
                  </DropdownMenuCheckboxItem>
                  {categories.map(([key, val]) => (
                    <DropdownMenuCheckboxItem
                      key={key}
                      checked={categoryFilter === key}
                      onCheckedChange={() => setCategoryFilter(categoryFilter === key ? 'all' : key)}
                    >
                      {val.label}
                    </DropdownMenuCheckboxItem>
                  ))}
                  {hasActiveFilters && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => { setCategoryFilter('all') }}>
                        Limpiar filtros
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="flex items-center rounded-lg border border-border p-0.5">
                <Button
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setViewMode('grid')}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Apps grid */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-foreground">
                Aplicaciones
                <span className="ml-2 text-sm font-normal text-muted-foreground">({filteredApps.length})</span>
              </h2>
            </div>

            {filteredApps.length === 0 ? (
              <div className="rounded-xl border-2 border-dashed border-border bg-muted/30 px-6 py-16 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                  <Settings className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-foreground">No hay aplicaciones</h3>
                <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
                  Crea tu primera aplicacion desde una plantilla o desde cero para gestionar tus procesos ambientales.
                </p>
                <div className="mt-6 flex items-center justify-center">
                  <Button onClick={() => startBuilder()}>
                    <Plus className="mr-2 h-4 w-4" /> Crear App
                  </Button>
                </div>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredApps.map(app => (
                  <AppCard key={app.id} app={app} />
                ))}
                <Card
                  className="border border-dashed border-border hover:border-primary/40 transition-all duration-200 cursor-pointer flex items-center justify-center min-h-[200px]"
                  onClick={() => startBuilder()}
                >
                  <CardContent className="p-5 text-center">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted text-muted-foreground mx-auto">
                      <Plus className="h-5 w-5" />
                    </div>
                    <p className="mt-3 text-sm font-medium text-muted-foreground">Nueva Aplicacion</p>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {filteredApps.map(app => {
                  const Icon = getIcon(app.icon)
                  return (
                    <Card
                      key={app.id}
                      className="cursor-pointer hover:border-primary/40 transition-all group"
                      onClick={() => openApp(app.id)}
                    >
                      <CardContent className="flex items-center gap-4 p-4">
                        <div
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                          style={{ backgroundColor: `${app.color}15`, color: app.color }}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-foreground text-sm">{app.name}</h3>
                          <p className="text-xs text-muted-foreground truncate">{app.description}</p>
                        </div>
                        <Badge variant="secondary" className="text-xs shrink-0">
                          {categoryConfig[app.category]?.label}
                        </Badge>
                        <span className="text-xs text-muted-foreground shrink-0">{formatDate(app.updatedAt)}</span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem><ExternalLink className="mr-2 h-4 w-4" /> Abrir</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Eliminar</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      <HubShortcutsSidebar />
    </div>
  )
}
