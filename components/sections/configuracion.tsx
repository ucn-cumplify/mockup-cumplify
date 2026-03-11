'use client'

import React, { useState } from 'react'
import { useApp } from '@/lib/app-context'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  Plus,
  Search,
  Edit2,
  Trash2,
  Building2,
  Network,
  Settings,
  ChevronRight,
  MoreHorizontal,
} from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import type { ManagementUnit, ControlUnit } from '@/lib/types'

const unitTypeLabels: Record<string, string> = {
  area_admin: 'Área Administrativa',
  area_operativa: 'Área Operativa',
  agrupacion: 'Agrupación',
  operacion: 'Operación',
  proceso: 'Proceso',
  subproceso: 'Subproceso',
}

// Company Config Section
export function EmpresaConfigSection() {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <PageHeader 
        title="Configuración de Empresa"
        breadcrumbs={[{ label: 'Configuración' }, { label: 'Empresa' }]}
      />

      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-2xl space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Información General</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company-name">Nombre de la Empresa</Label>
                <Input id="company-name" defaultValue="Empresa S.A." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company-rut">RUT</Label>
                <Input id="company-rut" defaultValue="76.123.456-7" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company-address">Dirección</Label>
                <Input id="company-address" defaultValue="Av. Principal 1234, Santiago" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company-sector">Sector Productivo</Label>
                <Input id="company-sector" defaultValue="Manufactura Industrial" />
              </div>
              <Button className="mt-4">Guardar Cambios</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Configuración del Sistema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium">Notificaciones por Email</p>
                  <p className="text-sm text-muted-foreground">Recibir alertas de vencimientos</p>
                </div>
                <Badge variant="secondary">Activo</Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium">Sincronización BCN</p>
                  <p className="text-sm text-muted-foreground">Última: hace 2 días</p>
                </div>
                <Button size="sm" variant="outline">Sincronizar</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

// Management Units Section
export function UnidadesGestionSection() {
  const { managementUnits, addManagementUnit, updateManagementUnit, deleteManagementUnit } = useApp()
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const filteredUnits = managementUnits.filter(unit =>
    unit.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCreateUnit = (data: Partial<ManagementUnit>) => {
    const newUnit: ManagementUnit = {
      id: `mg-${Date.now()}`,
      name: data.name || '',
      type: data.type || 'area_operativa',
      parentId: data.parentId,
    }
    addManagementUnit(newUnit)
    setIsCreateOpen(false)
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <PageHeader 
        title="Unidades de Gestión"
        breadcrumbs={[{ label: 'Configuración' }, { label: 'Unidades de Gestión' }]}
      />

      <main className="flex-1 p-6 overflow-auto">
        {/* Info */}
        <Card className="mb-6 border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Network className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Unidades de Gestión</h3>
                <p className="text-sm text-muted-foreground">
                  Las unidades de gestión representan la estructura organizacional de la empresa: áreas administrativas, 
                  operativas, procesos y subprocesos. Estas unidades se organizan jerárquicamente.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar unidades..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Nueva Unidad
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Crear Unidad de Gestión</DialogTitle>
              </DialogHeader>
              <ManagementUnitForm 
                units={managementUnits}
                onSubmit={handleCreateUnit} 
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Unidad Superior</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUnits.map(unit => {
                  const parent = managementUnits.find(u => u.id === unit.parentId)
                  return (
                    <TableRow key={unit.id}>
                      <TableCell className="font-medium">{unit.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{unitTypeLabels[unit.type]}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {parent?.name || '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit2 className="w-4 h-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => deleteManagementUnit(unit.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}

                {filteredUnits.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      No se encontraron unidades de gestión
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

// Control Units Section
export function UnidadesControlSection() {
  const { controlUnits, managementUnits, addControlUnit, deleteControlUnit } = useApp()
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const filteredUnits = controlUnits.filter(unit =>
    unit.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCreateUnit = (data: Partial<ControlUnit>) => {
    const newUnit: ControlUnit = {
      id: `cu-${Date.now()}`,
      name: data.name || '',
      type: data.type || 'Instalación',
      managementUnitIds: data.managementUnitIds || [],
      description: data.description,
    }
    addControlUnit(newUnit)
    setIsCreateOpen(false)
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <PageHeader 
        title="Unidades de Control"
        breadcrumbs={[{ label: 'Configuración' }, { label: 'Unidades de Control' }]}
      />

      <main className="flex-1 p-6 overflow-auto">
        {/* Info */}
        <Card className="mb-6 border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Settings className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Unidades de Control</h3>
                <p className="text-sm text-muted-foreground">
                  Las unidades de control son el punto específico donde se evalúa y controla el cumplimiento normativo. 
                  Pueden ser equipos, obras, personas, actividades, o cualquier elemento tangible o intangible.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar unidades..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Nueva Unidad
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Crear Unidad de Control</DialogTitle>
              </DialogHeader>
              <ControlUnitForm 
                managementUnits={managementUnits}
                onSubmit={handleCreateUnit} 
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUnits.map(unit => {
            const linkedMgUnits = managementUnits.filter(mg => unit.managementUnitIds.includes(mg.id))
            return (
              <Card key={unit.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Settings className="w-5 h-5 text-primary" />
                    </div>
                    <Badge variant="secondary">{unit.type}</Badge>
                  </div>

                  <h3 className="font-semibold mb-1">{unit.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {unit.description || 'Sin descripción'}
                  </p>

                  {linkedMgUnits.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {linkedMgUnits.slice(0, 2).map(mg => (
                        <Badge key={mg.id} variant="outline" className="text-xs">
                          {mg.name}
                        </Badge>
                      ))}
                      {linkedMgUnits.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{linkedMgUnits.length - 2}
                        </Badge>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-3 border-t border-border">
                    <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                      <Edit2 className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-destructive hover:bg-destructive hover:text-destructive-foreground bg-transparent"
                      onClick={() => deleteControlUnit(unit.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}

          {filteredUnits.length === 0 && (
            <Card className="col-span-full">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Settings className="w-12 h-12 text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">No se encontraron unidades de control</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}

// Forms
function ManagementUnitForm({ 
  units,
  onSubmit 
}: { 
  units: ManagementUnit[]
  onSubmit: (data: Partial<ManagementUnit>) => void 
}) {
  const [formData, setFormData] = useState<Partial<ManagementUnit>>({
    name: '',
    type: 'area_operativa',
    parentId: undefined,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nombre</Label>
        <Input 
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Ej: Gerencia de Operaciones"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Tipo</Label>
        <Select 
          value={formData.type} 
          onValueChange={(v) => setFormData({ ...formData, type: v as ManagementUnit['type'] })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar tipo" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(unitTypeLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="parent">Unidad Superior (opcional)</Label>
        <Select 
          value={formData.parentId || 'none'} 
          onValueChange={(v) => setFormData({ ...formData, parentId: v === 'none' ? undefined : v })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sin unidad superior" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Sin unidad superior</SelectItem>
            {units.map(unit => (
              <SelectItem key={unit.id} value={unit.id}>{unit.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit">Crear Unidad</Button>
      </div>
    </form>
  )
}

function ControlUnitForm({ 
  managementUnits,
  onSubmit 
}: { 
  managementUnits: ManagementUnit[]
  onSubmit: (data: Partial<ControlUnit>) => void 
}) {
  const [formData, setFormData] = useState<Partial<ControlUnit>>({
    name: '',
    type: 'Instalación',
    managementUnitIds: [],
    description: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const controlTypes = ['Instalación', 'Proceso', 'Área', 'Equipo', 'Edificio', 'Actividad']

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nombre</Label>
        <Input 
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Ej: Bodega de Químicos"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Tipo</Label>
        <Select 
          value={formData.type} 
          onValueChange={(v) => setFormData({ ...formData, type: v })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar tipo" />
          </SelectTrigger>
          <SelectContent>
            {controlTypes.map(type => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="mgUnit">Unidad de Gestión</Label>
        <Select 
          value={formData.managementUnitIds?.[0] || 'none'} 
          onValueChange={(v) => setFormData({ ...formData, managementUnitIds: v === 'none' ? [] : [v] })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar unidad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Sin unidad</SelectItem>
            {managementUnits.map(unit => (
              <SelectItem key={unit.id} value={unit.id}>{unit.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descripción</Label>
        <Textarea 
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Descripción de la unidad de control..."
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit">Crear Unidad</Button>
      </div>
    </form>
  )
}
