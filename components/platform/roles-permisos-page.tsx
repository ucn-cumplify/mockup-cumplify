'use client'

import React, { useState, useMemo } from 'react'
import { usePlatform } from '@/lib/platform-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  ShieldCheck,
  Users,
  Save,
  AlertTriangle,
  ChevronRight,
  LayoutGrid,
  BookOpen,
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type PermissionKey = 'ver' | 'crear' | 'editar' | 'eliminar'

interface ViewPermission {
  viewId: string
  viewName: string
  permissions: Record<PermissionKey, boolean>
}

/* Which permissions are NOT applicable per view. Keys can be viewId or viewName.
   Those permission keys will render as disabled/greyed-out and cannot be toggled. */
const DISABLED_PERMISSIONS_BY_ID: Record<string, PermissionKey[]> = {
  'hub-apps': ['editar'],
  'bib-todos': ['crear', 'editar', 'eliminar'],
}

/* RL-specific: disabled permissions by view NAME (used when the viewId is dynamic) */
const DISABLED_PERMISSIONS_BY_NAME: Record<string, PermissionKey[]> = {
  'Dashboard': ['crear', 'editar', 'eliminar'],
  'Evaluacion': ['editar', 'eliminar'],
  'Control': ['crear', 'editar', 'eliminar'],
  'Historial': ['crear', 'editar', 'eliminar'],
}

function getDisabledPermissions(viewId: string, viewName: string): PermissionKey[] {
  return DISABLED_PERMISSIONS_BY_ID[viewId] || DISABLED_PERMISSIONS_BY_NAME[viewName] || []
}

interface ModulePermissions {
  moduleId: string
  moduleName: string
  moduleIcon: 'hub' | 'biblioteca' | 'app'
  moduleColor: string
  views: ViewPermission[]
}

interface Role {
  id: string
  name: string
  description: string
  userCount: number
  permissions: ModulePermissions[]
}

const PERMISSION_LABELS: Record<PermissionKey, string> = {
  ver: 'Ver',
  crear: 'Crear',
  editar: 'Editar',
  eliminar: 'Eliminar',
}

const PERMISSION_KEYS: PermissionKey[] = ['ver', 'crear', 'editar', 'eliminar']

/* ------------------------------------------------------------------ */
/*  Default permission structure                                       */
/* ------------------------------------------------------------------ */

function createDefaultModules(apps: { id: string; name: string; views: { id: string; name: string }[] }[]): ModulePermissions[] {
  const hubModule: ModulePermissions = {
    moduleId: 'hub',
    moduleName: 'Hub Principal',
    moduleIcon: 'hub',
    moduleColor: '#059669',
    views: [
      { viewId: 'hub-apps', viewName: 'Aplicaciones', permissions: { ver: true, crear: true, editar: false, eliminar: false } },
    ],
  }

  const bibliotecaModule: ModulePermissions = {
    moduleId: 'biblioteca',
    moduleName: 'Biblioteca',
    moduleIcon: 'biblioteca',
    moduleColor: '#2563EB',
    views: [
      { viewId: 'bib-todos', viewName: 'Todos', permissions: { ver: true, crear: false, editar: false, eliminar: false } },
      { viewId: 'bib-normativas', viewName: 'Normativas internas', permissions: { ver: true, crear: true, editar: true, eliminar: false } },
      { viewId: 'bib-obligaciones', viewName: 'Obligaciones', permissions: { ver: true, crear: true, editar: true, eliminar: false } },
    ],
  }

  const appModules: ModulePermissions[] = apps.map(app => ({
    moduleId: app.id,
    moduleName: app.name,
    moduleIcon: 'app' as const,
    moduleColor: '#6B7280',
    views: app.views.map(v => ({
      viewId: v.id,
      viewName: v.name,
      permissions: { ver: true, crear: false, editar: false, eliminar: false },
    })),
  }))

  return [hubModule, bibliotecaModule, ...appModules]
}

function createFullAccessModules(apps: { id: string; name: string; views: { id: string; name: string }[] }[]): ModulePermissions[] {
  return createDefaultModules(apps).map(m => ({
    ...m,
    views: m.views.map(v => ({
      ...v,
      permissions: { ver: true, crear: true, editar: true, eliminar: true },
    })),
  }))
}

/* ------------------------------------------------------------------ */
/*  Mock roles                                                         */
/* ------------------------------------------------------------------ */

function createMockRoles(apps: { id: string; name: string; views: { id: string; name: string }[] }[]): Role[] {
  const adminPermissions = createFullAccessModules(apps)
  const jefePermissions = createDefaultModules(apps).map(m => ({
    ...m,
    views: m.views.map(v => ({
      ...v,
      permissions: { ver: true, crear: true, editar: true, eliminar: false },
    })),
  }))
  const supervisorPermissions = createDefaultModules(apps).map(m => ({
    ...m,
    views: m.views.map(v => ({
      ...v,
      permissions: { ver: true, crear: true, editar: false, eliminar: false },
    })),
  }))
  const analistaPermissions = createDefaultModules(apps).map(m => ({
    ...m,
    views: m.views.map(v => ({
      ...v,
      permissions: { ver: true, crear: false, editar: false, eliminar: false },
    })),
  }))
  const operadorPermissions = createDefaultModules(apps).map(m => ({
    ...m,
    views: m.views.map(v => ({
      ...v,
      permissions: { ver: true, crear: false, editar: false, eliminar: false },
    })),
  }))

  return [
    { id: 'r1', name: 'Administrador', description: 'Acceso completo a todas las funcionalidades del sistema.', userCount: 2, permissions: adminPermissions },
    { id: 'r2', name: 'Jefa de Area', description: 'Gestion de area con permisos de creacion y edicion.', userCount: 2, permissions: jefePermissions },
    { id: 'r3', name: 'Supervisor', description: 'Supervision operativa con permisos de creacion y exportacion.', userCount: 1, permissions: supervisorPermissions },
    { id: 'r4', name: 'Analista', description: 'Consulta y exportacion de datos para analisis.', userCount: 2, permissions: analistaPermissions },
    { id: 'r5', name: 'Operador', description: 'Acceso basico de solo lectura a las vistas asignadas.', userCount: 4, permissions: operadorPermissions },
  ]
}

/* ------------------------------------------------------------------ */
/*  Role Badge Color                                                   */
/* ------------------------------------------------------------------ */

function getRoleBadgeClass(name: string) {
  switch (name) {
    case 'Administrador': return 'bg-primary/10 text-primary border-primary/20'
    case 'Jefa de Area': return 'bg-chart-5/15 text-chart-5 border-chart-5/20'
    case 'Supervisor': return 'bg-chart-2/15 text-chart-2 border-chart-2/20'
    case 'Analista': return 'bg-chart-4/15 text-chart-4 border-chart-4/20'
    case 'Operador': return 'bg-muted text-muted-foreground border-border'
    default: return 'bg-muted text-muted-foreground border-border'
  }
}

function getModuleIcon(icon: 'hub' | 'biblioteca' | 'app') {
  switch (icon) {
    case 'hub': return <LayoutGrid className="h-4 w-4" />
    case 'biblioteca': return <BookOpen className="h-4 w-4" />
    case 'app': return <ChevronRight className="h-4 w-4" />
  }
}

/* ------------------------------------------------------------------ */
/*  Create/Edit Role Modal                                             */
/* ------------------------------------------------------------------ */

function RoleFormModal({
  open,
  onOpenChange,
  initial,
  onSave,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  initial?: { name: string; description: string }
  onSave: (name: string, description: string) => void
}) {
  const [name, setName] = useState(initial?.name || '')
  const [description, setDescription] = useState(initial?.description || '')

  React.useEffect(() => {
    if (open) {
      setName(initial?.name || '')
      setDescription(initial?.description || '')
    }
  }, [open, initial])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    onSave(name.trim(), description.trim())
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{initial ? 'Editar rol' : 'Crear rol'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="role-name">Nombre del rol</Label>
            <Input
              id="role-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Auditor"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role-desc">Descripcion (opcional)</Label>
            <Input
              id="role-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Breve descripcion del rol"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!name.trim()}>
              {initial ? 'Guardar cambios' : 'Crear rol'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

/* ------------------------------------------------------------------ */
/*  Delete Role Confirmation                                           */
/* ------------------------------------------------------------------ */

function DeleteRoleModal({
  open,
  onOpenChange,
  role,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  role: Role | null
  onConfirm: () => void
}) {
  if (!role) return null
  const hasUsers = role.userCount > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Eliminar rol</DialogTitle>
        </DialogHeader>
        {hasUsers ? (
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-lg bg-destructive/10 border border-destructive/30 p-4">
              <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-destructive">No puedes eliminar este rol</p>
                <p className="text-xs text-destructive/80 mt-1 leading-relaxed">
                  No puedes eliminar este rol porque hay {role.userCount} usuario{role.userCount > 1 ? 's' : ''} asignado{role.userCount > 1 ? 's' : ''}.
                </p>
              </div>
            </div>
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Entendido
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {'Esta accion eliminara permanentemente el rol "'}<span className="font-semibold text-foreground">{role.name}</span>{'". Esta accion no se puede deshacer.'}
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={() => { onConfirm(); onOpenChange(false) }}>
                Eliminar rol
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

/* ------------------------------------------------------------------ */
/*  Permissions Editor                                                 */
/* ------------------------------------------------------------------ */

function PermissionsEditor({
  role,
  onToggle,
}: {
  role: Role
  onToggle: (moduleId: string, viewId: string, key: PermissionKey, value: boolean) => void
}) {
  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-2">
        <Accordion type="multiple" defaultValue={role.permissions.map(m => m.moduleId)} className="space-y-2">
          {role.permissions.map(mod => (
            <AccordionItem key={mod.moduleId} value={mod.moduleId} className="border border-border rounded-lg overflow-hidden">
              <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-secondary/40 [&[data-state=open]]:bg-secondary/30">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-lg"
                    style={{ backgroundColor: mod.moduleColor + '15', color: mod.moduleColor }}
                  >
                    {getModuleIcon(mod.moduleIcon)}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-foreground">{mod.moduleName}</p>
                    <p className="text-xs text-muted-foreground">{mod.views.length} vista{mod.views.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-2">
                {/* Column headers */}
                <div className="flex items-center gap-2 mb-3 pl-4">
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Vista</span>
                  </div>
                  {PERMISSION_KEYS.map(key => (
                    <div key={key} className="w-16 text-center">
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{PERMISSION_LABELS[key]}</span>
                    </div>
                  ))}
                </div>

                {/* View rows */}
                <div className="space-y-1">
                  {mod.views.map(view => {
                    const disabledKeys = getDisabledPermissions(view.viewId, view.viewName)
                    return (
                      <div
                        key={view.viewId}
                        className="flex items-center gap-2 rounded-md px-4 py-2.5 hover:bg-secondary/30 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground truncate">{view.viewName}</p>
                        </div>
                        {PERMISSION_KEYS.map(key => {
                          const isDisabled = disabledKeys.includes(key)
                          return (
                            <div key={key} className="w-16 flex justify-center">
                              {isDisabled ? (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="inline-flex">
                                      <Checkbox
                                        checked={false}
                                        disabled
                                        className="opacity-30 cursor-not-allowed"
                                        aria-label={`${PERMISSION_LABELS[key]} - ${view.viewName} (no aplicable)`}
                                      />
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent side="top" className="text-xs">
                                    Accion no aplicable para esta vista
                                  </TooltipContent>
                                </Tooltip>
                              ) : (
                                <Checkbox
                                  checked={view.permissions[key]}
                                  onCheckedChange={(checked) => onToggle(mod.moduleId, view.viewId, key, !!checked)}
                                  aria-label={`${PERMISSION_LABELS[key]} - ${view.viewName}`}
                                />
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </TooltipProvider>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */

export function RolesPermisosPage() {
  const { apps } = usePlatform()

  const appData = useMemo(() => apps.map(a => ({
    id: a.id,
    name: a.name,
    views: a.views.map(v => ({ id: v.id, name: v.name })),
  })), [apps])

  const [roles, setRoles] = useState<Role[]>(() => createMockRoles(appData))
  const [selectedRoleId, setSelectedRoleId] = useState<string>('r1')
  const [searchQuery, setSearchQuery] = useState('')
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editModalRole, setEditModalRole] = useState<Role | null>(null)
  const [deleteModalRole, setDeleteModalRole] = useState<Role | null>(null)

  const filteredRoles = useMemo(() => {
    if (!searchQuery) return roles
    return roles.filter(r =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [roles, searchQuery])

  const selectedRole = roles.find(r => r.id === selectedRoleId) || null

  const handleCreateRole = (name: string, description: string) => {
    const newRole: Role = {
      id: `r-${Date.now()}`,
      name,
      description,
      userCount: 0,
      permissions: createDefaultModules(appData),
    }
    setRoles(prev => [...prev, newRole])
    setSelectedRoleId(newRole.id)
  }

  const handleEditRole = (name: string, description: string) => {
    if (!editModalRole) return
    setRoles(prev => prev.map(r =>
      r.id === editModalRole.id ? { ...r, name, description } : r
    ))
    setEditModalRole(null)
  }

  const handleDeleteRole = () => {
    if (!deleteModalRole) return
    setRoles(prev => prev.filter(r => r.id !== deleteModalRole.id))
    if (selectedRoleId === deleteModalRole.id) {
      setSelectedRoleId(roles[0]?.id || '')
    }
    setDeleteModalRole(null)
  }

  const handleTogglePermission = (moduleId: string, viewId: string, key: PermissionKey, value: boolean) => {
    if (!selectedRole) return
    // Find the view name for the permission check
    const mod = selectedRole.permissions.find(m => m.moduleId === moduleId)
    const view = mod?.views.find(v => v.viewId === viewId)
    const disabledKeys = getDisabledPermissions(viewId, view?.viewName || '')
    if (disabledKeys.includes(key)) return
    setRoles(prev => prev.map(r => {
      if (r.id !== selectedRole.id) return r
      return {
        ...r,
        permissions: r.permissions.map(m => {
          if (m.moduleId !== moduleId) return m
          return {
            ...m,
            views: m.views.map(v => {
              if (v.viewId !== viewId) return v
              return { ...v, permissions: { ...v.permissions, [key]: value } }
            }),
          }
        }),
      }
    }))
  }

  return (
    <div className="flex flex-col h-full">
      {/* Page header */}
      <div className="shrink-0 px-6 py-5 border-b border-border bg-background">
        <div className="mx-auto max-w-[1400px]">
          <h1 className="text-xl font-bold text-foreground tracking-tight text-balance">
            Roles y permisos
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configura el acceso de cada rol a modulos y vistas del sistema.
          </p>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="flex flex-1 min-h-0 mx-auto max-w-[1400px] w-full">
        {/* Left panel: Roles list */}
        <div className="w-80 shrink-0 border-r border-border flex flex-col bg-background">
          <div className="shrink-0 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">Roles</h2>
              <Button size="sm" className="h-8 gap-1.5" onClick={() => setCreateModalOpen(true)}>
                <Plus className="h-3.5 w-3.5" />
                Crear rol
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar roles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="px-3 pb-3 space-y-1">
              {filteredRoles.map(role => (
                <button
                  key={role.id}
                  onClick={() => setSelectedRoleId(role.id)}
                  className={`group w-full text-left rounded-lg p-3 transition-colors relative ${
                    selectedRoleId === role.id
                      ? 'bg-primary/8 border border-primary/20'
                      : 'hover:bg-secondary/50 border border-transparent'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`text-[10px] ${getRoleBadgeClass(role.name)}`}>
                          {role.name}
                        </Badge>
                      </div>
                      {role.description && (
                        <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
                          {role.description}
                        </p>
                      )}
                      <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                        <Users className="h-3 w-3" />
                        <span>{role.userCount} usuario{role.userCount !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={(e) => { e.stopPropagation(); setEditModalRole(role) }}
                        aria-label="Editar rol"
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={(e) => { e.stopPropagation(); setDeleteModalRole(role) }}
                        aria-label="Eliminar rol"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </button>
              ))}

              {filteredRoles.length === 0 && (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <ShieldCheck className="h-8 w-8 text-muted-foreground/40 mb-2" />
                  <p className="text-sm text-muted-foreground">No se encontraron roles</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Right panel: Permissions editor */}
        <div className="flex-1 flex flex-col min-h-0 bg-background">
          {selectedRole ? (
            <>
              {/* Role header */}
              <div className="shrink-0 px-6 py-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-semibold text-foreground">{selectedRole.name}</h2>
                      {selectedRole.description && (
                        <p className="text-xs text-muted-foreground mt-0.5">{selectedRole.description}</p>
                      )}
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    <Users className="mr-1 h-3 w-3" />
                    {selectedRole.userCount} usuario{selectedRole.userCount !== 1 ? 's' : ''}
                  </Badge>
                </div>
              </div>

              {/* Permissions content */}
              <ScrollArea className="flex-1">
                <div className="p-6">
                  <PermissionsEditor
                    role={selectedRole}
                    onToggle={handleTogglePermission}
                  />
                </div>
              </ScrollArea>

              {/* Footer */}
              <div className="shrink-0 px-6 py-4 border-t border-border bg-background">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">Ultima modificacion: hace 3 minutos</p>
                  <Button className="gap-2">
                    <Save className="h-4 w-4" />
                    Guardar cambios
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-4">
                <ShieldCheck className="h-7 w-7 text-muted-foreground" />
              </div>
              <h3 className="text-base font-semibold text-foreground">Selecciona un rol</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                Elige un rol de la lista para configurar sus permisos de acceso a modulos y vistas.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <RoleFormModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSave={handleCreateRole}
      />

      <RoleFormModal
        open={!!editModalRole}
        onOpenChange={(v) => !v && setEditModalRole(null)}
        initial={editModalRole ? { name: editModalRole.name, description: editModalRole.description } : undefined}
        onSave={handleEditRole}
      />

      <DeleteRoleModal
        open={!!deleteModalRole}
        onOpenChange={(v) => !v && setDeleteModalRole(null)}
        role={deleteModalRole}
        onConfirm={handleDeleteRole}
      />
    </div>
  )
}
