'use client'

import React, { useState, useMemo } from 'react'
import { usePlatform } from '@/lib/platform-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Checkbox } from '@/components/ui/checkbox'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { toast } from 'sonner'
import {
  Search,
  MoreVertical,
  UserPlus,
  Link2,
  Shield,
  Trash2,
  AlertTriangle,
  Eye,
  EyeOff,
  Building2,
  Tag,
  CalendarDays,
  Clock,
  Users,
  ChevronDown,
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Unit types & tags (mirrors empresa-config for UI consistency)      */
/* ------------------------------------------------------------------ */

interface UnitInfo {
  id: string
  name: string
  description: string
  typeName: string
  typeColor: string
  tags: { name: string; color: string }[]
}

const unitDatabase: UnitInfo[] = [
  {
    id: 'root',
    name: 'Mi Empresa S.A.',
    description: 'Empresa principal',
    typeName: 'Empresa',
    typeColor: '#2563EB',
    tags: [{ name: 'empresa', color: '#2563EB' }],
  },
  {
    id: 'agr-1',
    name: 'Division Norte',
    description: 'Agrupacion de operaciones zona norte',
    typeName: 'Agrupacion',
    typeColor: '#059669',
    tags: [{ name: 'agrupacion', color: '#059669' }, { name: 'zona norte', color: '#0D9488' }],
  },
  {
    id: 'op-1',
    name: 'Planta Antofagasta',
    description: 'Operacion minera Antofagasta',
    typeName: 'Operacion',
    typeColor: '#DC2626',
    tags: [{ name: 'operacion', color: '#DC2626' }, { name: 'planta', color: '#4F46E5' }, { name: 'zona norte', color: '#0D9488' }],
  },
  {
    id: 'aa-1',
    name: 'Administracion Planta',
    description: 'Area administrativa de la planta',
    typeName: 'Area Administrativa',
    typeColor: '#7C3AED',
    tags: [{ name: 'area administrativa', color: '#7C3AED' }],
  },
  {
    id: 'ao-1',
    name: 'Produccion',
    description: 'Area de produccion principal',
    typeName: 'Area Operativa',
    typeColor: '#EA580C',
    tags: [{ name: 'area operativa', color: '#EA580C' }],
  },
  {
    id: 'proc-1',
    name: 'Proceso de Fundicion',
    description: 'Proceso de fundicion de mineral',
    typeName: 'Proceso',
    typeColor: '#0891B2',
    tags: [{ name: 'proceso', color: '#0891B2' }],
  },
  {
    id: 'sub-1',
    name: 'Subproceso de Carga',
    description: 'Carga de material al horno',
    typeName: 'Subproceso',
    typeColor: '#D97706',
    tags: [{ name: 'subproceso', color: '#D97706' }],
  },
  {
    id: 'op-2',
    name: 'Planta Santiago',
    description: 'Operacion en Santiago',
    typeName: 'Operacion',
    typeColor: '#DC2626',
    tags: [{ name: 'operacion', color: '#DC2626' }, { name: 'planta', color: '#4F46E5' }],
  },
  {
    id: 'aa-2',
    name: 'Gerencia General',
    description: 'Area administrativa corporativa',
    typeName: 'Area Administrativa',
    typeColor: '#7C3AED',
    tags: [{ name: 'area administrativa', color: '#7C3AED' }],
  },
]

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

interface MockUser {
  id: string
  name: string
  email: string
  roles: string[]
  company: string
  avatar?: string
  unitIds: string[]
  joinedAt: string
  lastConnection: string
}

const PLAN_MAX_USERS = 14

const ALL_ROLES = ['Administrador', 'Jefa de Area', 'Supervisor', 'Analista', 'Operador']

const mockUsersInitial: MockUser[] = [
  { id: '1', name: 'Carlos Mendoza', email: 'carlos@empresa.cl', roles: ['Administrador'], company: 'Mi Empresa S.A.', unitIds: ['root', 'op-1'], joinedAt: '15/03/2024', lastConnection: '18/02/2026 - 09:14' },
  { id: '2', name: 'Maria Gonzalez', email: 'maria@empresa.cl', roles: ['Jefa de Area', 'Analista'], company: 'Mi Empresa S.A.', unitIds: ['op-1', 'agr-1'], joinedAt: '22/04/2024', lastConnection: '17/02/2026 - 16:45' },
  { id: '3', name: 'Juan Perez', email: 'juan@empresa.cl', roles: ['Operador'], company: 'Mi Empresa S.A.', unitIds: ['ao-1', 'proc-1'], joinedAt: '10/06/2024', lastConnection: '18/02/2026 - 08:30' },
  { id: '4', name: 'Ana Silva', email: 'ana@empresa.cl', roles: ['Analista'], company: 'Mi Empresa S.A.', unitIds: ['aa-1', 'aa-2'], joinedAt: '05/07/2024', lastConnection: '16/02/2026 - 11:20' },
  { id: '5', name: 'Pedro Torres', email: 'pedro@empresa.cl', roles: ['Supervisor'], company: 'Mi Empresa S.A.', unitIds: ['ao-1', 'proc-1', 'sub-1'], joinedAt: '18/08/2024', lastConnection: '18/02/2026 - 07:55' },
  { id: '6', name: 'Laura Diaz', email: 'laura@empresa.cl', roles: ['Analista'], company: 'Mi Empresa S.A.', unitIds: ['op-1'], joinedAt: '02/09/2024', lastConnection: '15/02/2026 - 14:10' },
  { id: '7', name: 'Roberto Fuentes', email: 'roberto@empresa.cl', roles: ['Operador'], company: 'Mi Empresa S.A.', unitIds: [], joinedAt: '14/10/2024', lastConnection: '12/02/2026 - 10:00' },
  { id: '8', name: 'Camila Rojas', email: 'camila@empresa.cl', roles: ['Jefa de Area'], company: 'Mi Empresa S.A.', unitIds: ['aa-2'], joinedAt: '25/11/2024', lastConnection: '17/02/2026 - 18:32' },
  { id: '9', name: 'Diego Vargas', email: 'diego@empresa.cl', roles: ['Operador'], company: 'Mi Empresa S.A.', unitIds: ['agr-1', 'op-2'], joinedAt: '08/01/2025', lastConnection: '18/02/2026 - 06:45' },
  { id: '10', name: 'Valentina Castro', email: 'valentina@empresa.cl', roles: ['Administrador', 'Supervisor'], company: 'Mi Empresa S.A.', unitIds: ['root', 'aa-2', 'op-2'], joinedAt: '20/01/2025', lastConnection: '18/02/2026 - 10:05' },
  { id: '11', name: 'Felipe Morales', email: 'felipe@empresa.cl', roles: ['Operador'], company: 'Mi Empresa S.A.', unitIds: ['proc-1'], joinedAt: '03/02/2025', lastConnection: '14/02/2026 - 09:30' },
]

const roleFilterOptions = ['Todos', ...ALL_ROLES]

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getInitials(name: string) {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function getRoleBadgeClass(role: string) {
  switch (role) {
    case 'Administrador':
      return 'bg-primary/10 text-primary border-primary/20'
    case 'Jefa de Area':
      return 'bg-chart-5/15 text-chart-5 border-chart-5/20'
    case 'Supervisor':
      return 'bg-chart-2/15 text-chart-2 border-chart-2/20'
    case 'Analista':
      return 'bg-chart-4/15 text-chart-4 border-chart-4/20'
    case 'Operador':
      return 'bg-muted text-muted-foreground border-border'
    default:
      return 'bg-muted text-muted-foreground border-border'
  }
}

function getUserUnits(user: MockUser): UnitInfo[] {
  return user.unitIds
    .map(uid => unitDatabase.find(u => u.id === uid))
    .filter((u): u is UnitInfo => !!u)
}

/* ------------------------------------------------------------------ */
/*  Unidades Asociadas Panel (right-side card grid)                    */
/* ------------------------------------------------------------------ */

function UnidadesPanel({
  user,
  open,
  onOpenChange,
}: {
  user: MockUser
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const units = getUserUnits(user)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Unidades de control asociadas</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col sm:flex-row gap-6 flex-1 min-h-0 pt-2">
          {/* Left: user profile */}
          <div className="flex flex-col items-center gap-3 sm:min-w-[160px] shrink-0">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-lg bg-primary/10 text-primary font-semibold">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <p className="text-sm font-semibold text-foreground">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
              <div className="flex flex-wrap gap-1 mt-2 justify-center">
                {user.roles.map(r => (
                  <Badge key={r} variant="outline" className={`text-[10px] font-medium ${getRoleBadgeClass(r)}`}>
                    {r}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Right: unit cards grid */}
          <div className="flex-1 min-h-0">
            {units.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-3">
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground">Sin unidades de control asignadas</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Este usuario no tiene unidades de control asociadas.
                </p>
              </div>
            ) : (
              <ScrollArea className="h-full max-h-[50vh]">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-2">
                  {units.map(unit => (
                    <Card key={unit.id} className="hover:shadow-sm transition-shadow">
                      <CardContent className="p-4">
                        {/* Type badge */}
                        <Badge
                          className="text-[10px] border-0 mb-2"
                          style={{ backgroundColor: unit.typeColor + '20', color: unit.typeColor }}
                        >
                          {unit.typeName}
                        </Badge>
                        {/* Unit name */}
                        <h4 className="text-sm font-semibold text-foreground leading-tight">{unit.name}</h4>
                        {/* Description */}
                        {unit.description && (
                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">
                            {unit.description}
                          </p>
                        )}
                        {/* Tags */}
                        {unit.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2.5">
                            {unit.tags.map(tag => (
                              <span
                                key={tag.name}
                                className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium"
                                style={{
                                  backgroundColor: tag.color + '10',
                                  color: tag.color,
                                  border: `1px solid ${tag.color}30`,
                                }}
                              >
                                <Tag className="h-2 w-2" />
                                {tag.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/* ------------------------------------------------------------------ */
/*  User Profile View                                                  */
/* ------------------------------------------------------------------ */

function UserProfileView({
  user,
  onBack,
  onUpdateRoles,
}: {
  user: MockUser
  onBack: () => void
  onUpdateRoles: (userId: string, roles: string[]) => void
}) {
  const units = getUserUnits(user)
  const [rolesOpen, setRolesOpen] = useState(false)

  const handleToggleRole = (role: string) => {
    const newRoles = user.roles.includes(role)
      ? user.roles.filter(r => r !== role)
      : [...user.roles, role]
    if (newRoles.length === 0) return // must have at least one role
    onUpdateRoles(user.id, newRoles)
    toast.success('Roles actualizado correctamente')
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-6">
      {/* Back button */}
      <Button variant="ghost" size="sm" className="mb-4 -ml-2 text-muted-foreground" onClick={onBack}>
        <svg className="mr-1.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Volver a usuarios
      </Button>

      {/* Profile card */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center gap-5">
            <Avatar className="h-24 w-24">
              <AvatarFallback className="text-2xl bg-primary/10 text-primary font-semibold">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-foreground tracking-tight">{user.name}</h2>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {user.roles.map(r => (
                  <Badge key={r} variant="outline" className={`text-xs font-medium ${getRoleBadgeClass(r)}`}>
                    <Shield className="mr-1 h-3 w-3" />
                    {r}
                  </Badge>
                ))}
                <Badge variant="secondary" className="text-xs font-normal">
                  <Building2 className="mr-1 h-3 w-3" />
                  {user.company}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1.5">
                <svg className="h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                {user.email}
              </p>
            </div>
          </div>

          {/* Role assignment dropdown */}
          <div className="mt-5 pt-5 border-t border-border">
            <Label className="text-sm font-medium text-foreground mb-2 block">Roles asignados</Label>
            <Popover open={rolesOpen} onOpenChange={setRolesOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-between font-normal text-sm h-10">
                  <span className="truncate">
                    {user.roles.length === 0
                      ? 'Seleccionar roles...'
                      : user.roles.join(', ')}
                  </span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 ml-2" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-2" align="start">
                <div className="space-y-1">
                  {ALL_ROLES.map(role => (
                    <button
                      key={role}
                      onClick={() => handleToggleRole(role)}
                      className="flex items-center gap-2.5 w-full rounded-md px-2 py-2 text-sm hover:bg-secondary/60 transition-colors"
                    >
                      <Checkbox
                        checked={user.roles.includes(role)}
                        className="pointer-events-none"
                        aria-hidden
                      />
                      <Badge variant="outline" className={`text-[10px] ${getRoleBadgeClass(role)}`}>
                        {role}
                      </Badge>
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>

      {/* Activity card */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            Actividad
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 rounded-lg border border-border bg-secondary/30 p-4">
              <CalendarDays className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Fecha de ingreso</p>
                <p className="text-sm font-semibold text-foreground mt-0.5">{user.joinedAt}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border border-border bg-secondary/30 p-4">
              <Clock className="h-5 w-5 text-chart-2 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Ultima conexion</p>
                <p className="text-sm font-semibold text-foreground mt-0.5">{user.lastConnection}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Associated units */}
      <div>
        <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
          <Link2 className="h-4 w-4 text-muted-foreground" />
          Unidades de control asociadas
          <Badge variant="secondary" className="text-[10px] ml-1">{units.length}</Badge>
        </h3>
        {units.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-3">
                <Building2 className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">Sin unidades de control asignadas</p>
              <p className="text-xs text-muted-foreground mt-1">
                Este usuario no tiene unidades de control asociadas.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {units.map(unit => (
              <Card key={unit.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-4">
                  <Badge
                    className="text-[10px] border-0 mb-2"
                    style={{ backgroundColor: unit.typeColor + '20', color: unit.typeColor }}
                  >
                    {unit.typeName}
                  </Badge>
                  <h4 className="text-sm font-semibold text-foreground leading-tight">{unit.name}</h4>
                  {unit.description && (
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">
                      {unit.description}
                    </p>
                  )}
                  {unit.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2.5">
                      {unit.tags.map(tag => (
                        <span
                          key={tag.name}
                          className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium"
                          style={{
                            backgroundColor: tag.color + '10',
                            color: tag.color,
                            border: `1px solid ${tag.color}30`,
                          }}
                        >
                          <Tag className="h-2 w-2" />
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Agregar Usuario Modal                                              */
/* ------------------------------------------------------------------ */

function AgregarUsuarioModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const [nombre, setNombre] = useState('')
  const [rol, setRol] = useState('')
  const [correo, setCorreo] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [disponible, setDisponible] = useState(true)

  const totalSlots = PLAN_MAX_USERS
  const usedSlots = mockUsersInitial.length
  const availableSlots = Math.max(0, totalSlots - usedSlots)
  // Note: in a real app, usedSlots would come from the parent's users state

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onOpenChange(false)
    setNombre('')
    setRol('')
    setCorreo('')
    setPassword('')
    setConfirmPassword('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Agregar Usuario</DialogTitle>
        </DialogHeader>

        {/* Availability section */}
        <div className="rounded-lg border border-border bg-secondary/30 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">
              Usuarios disponibles: <span className={`font-bold ${availableSlots === 0 ? 'text-destructive' : 'text-primary'}`}>{availableSlots}</span> <span className="text-muted-foreground font-normal">de {totalSlots}</span>
            </p>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-medium ${disponible ? 'text-primary' : 'text-muted-foreground'}`}>
                {disponible ? 'DISPONIBLE' : 'NO DISPONIBLE'}
              </span>
              <Switch
                checked={disponible}
                onCheckedChange={setDisponible}
                aria-label="Disponibilidad de usuarios"
              />
            </div>
          </div>

          {(!disponible || availableSlots === 0) && (
            <div className="flex items-start gap-2 rounded-md bg-destructive/10 border border-destructive/30 p-3">
              <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
              <p className="text-xs text-destructive leading-relaxed">
                No tienes usuarios disponibles para tu empresa. Debes pagar para dar acceso a mas usuarios.
              </p>
            </div>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="add-nombre">Nombre</Label>
            <Input
              id="add-nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Nombre completo"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="add-rol">Rol</Label>
            <Select value={rol} onValueChange={setRol}>
              <SelectTrigger id="add-rol">
                <SelectValue placeholder="Seleccionar rol" />
              </SelectTrigger>
              <SelectContent>
                {ALL_ROLES.map(r => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="add-correo">Correo</Label>
            <Input
              id="add-correo"
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              placeholder="correo@empresa.cl"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="add-password">Contrasena</Label>
            <div className="relative">
              <Input
                id="add-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa una contrasena"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full w-10"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Ocultar contrasena' : 'Mostrar contrasena'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="add-confirm">Confirmar Contrasena</Label>
            <div className="relative">
              <Input
                id="add-confirm"
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirma la contrasena"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full w-10"
                onClick={() => setShowConfirm(!showConfirm)}
                aria-label={showConfirm ? 'Ocultar contrasena' : 'Mostrar contrasena'}
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!disponible || availableSlots === 0}>
              Crear Usuario
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

/* ------------------------------------------------------------------ */
/*  User Card                                                          */
/* ------------------------------------------------------------------ */

function UserCard({
  user,
  onViewUnits,
  onClickCard,
}: {
  user: MockUser
  onViewUnits: (user: MockUser) => void
  onClickCard: (user: MockUser) => void
}) {
  return (
    <Card
      className="group hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onClickCard(user)}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-11 w-11">
              <AvatarFallback className="text-sm bg-primary/10 text-primary font-semibold">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Opciones</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onViewUnits(user) }}>
                <Link2 className="mr-2 h-4 w-4" />
                Unidades de control asociadas
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                <Shield className="mr-2 h-4 w-4" />
                Asignar rol
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={(e) => e.stopPropagation()}>
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar usuario
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-3 flex flex-wrap gap-1">
          {user.roles.map(r => (
            <Badge key={r} variant="outline" className={`text-[10px] font-medium ${getRoleBadgeClass(r)}`}>
              {r}
            </Badge>
          ))}
        </div>

        <div className="mt-3 flex flex-col gap-1 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <CalendarDays className="h-3 w-3" />
            Ingreso: {user.joinedAt}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-3 w-3" />
            Ultima conexion: {user.lastConnection}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */

export function UsuariosPage() {
  const [users, setUsers] = useState<MockUser[]>(mockUsersInitial)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('Todos')
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [unitsModalUser, setUnitsModalUser] = useState<MockUser | null>(null)
  const [profileUser, setProfileUser] = useState<MockUser | null>(null)

  const handleUpdateRoles = (userId: string, newRoles: string[]) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, roles: newRoles } : u))
    // Also update the profileUser state so the UI refreshes
    setProfileUser(prev => prev && prev.id === userId ? { ...prev, roles: newRoles } : prev)
  }

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch =
        !searchQuery ||
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesRole = roleFilter === 'Todos' || user.roles.includes(roleFilter)
      return matchesSearch && matchesRole
    })
  }, [users, searchQuery, roleFilter])

  // If a user profile is selected, show the profile view
  if (profileUser) {
    return (
      <UserProfileView
        user={profileUser}
        onBack={() => setProfileUser(null)}
        onUpdateRoles={handleUpdateRoles}
      />
    )
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-6">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight text-balance">
            Usuarios
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gestiona los usuarios de tu empresa
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-foreground">
              Usuarios disponibles: <span className={`font-bold ${(PLAN_MAX_USERS - users.length) === 0 ? 'text-destructive' : 'text-primary'}`}>{Math.max(0, PLAN_MAX_USERS - users.length)}</span> <span className="text-muted-foreground">de {PLAN_MAX_USERS}</span>
            </span>
          </div>
          <Button
            className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={() => setAddModalOpen(true)}
          >
            <UserPlus className="h-4 w-4" />
            Agregar Usuario
          </Button>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-44 h-9">
            <SelectValue placeholder="Filtrar por rol" />
          </SelectTrigger>
          <SelectContent>
            {roleFilterOptions.map(role => (
              <SelectItem key={role} value={role}>
                {role === 'Todos' ? 'Todos los roles' : role}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* User cards grid */}
      {filteredUsers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-3">
            <Search className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground">No se encontraron usuarios</p>
          <p className="text-xs text-muted-foreground mt-1">
            Intenta con otros filtros o terminos de busqueda.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map(user => (
            <UserCard
              key={user.id}
              user={user}
              onViewUnits={(u) => setUnitsModalUser(u)}
              onClickCard={(u) => setProfileUser(u)}
            />
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 text-xs text-muted-foreground">
        Mostrando {filteredUsers.length} de {users.length} usuarios
      </div>

      {/* Modals */}
      <AgregarUsuarioModal open={addModalOpen} onOpenChange={setAddModalOpen} />

      {unitsModalUser && (
        <UnidadesPanel
          user={unitsModalUser}
          open={!!unitsModalUser}
          onOpenChange={(v) => !v && setUnitsModalUser(null)}
        />
      )}
    </div>
  )
}
