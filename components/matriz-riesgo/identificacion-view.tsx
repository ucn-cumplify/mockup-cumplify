'use client'

import React, { useState, useMemo } from 'react'
import { useMatrizRiesgo } from '@/lib/matriz-riesgo/context'
import type { ProcesoMR, TareaMR, FilaIPER } from '@/lib/matriz-riesgo/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import {
  Plus, Search, Pencil, Trash2, ChevronDown, ChevronRight,
  Layers, ListTodo, Building2, AlertTriangle, Link2,
  CheckCircle2, ArrowRight,
} from 'lucide-react'

// --- Proceso Create/Edit Modal ---
function ProcesoModal({
  open, onOpenChange, editData,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  editData?: ProcesoMR | null
}) {
  const { unidadesControl, usuarios, addProceso, updateProceso, addHistorial } = useMatrizRiesgo()
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [ucId, setUcId] = useState('')
  const [usarUCComoNombre, setUsarUCComoNombre] = useState(false)
  const [creadoPor, setCreadoPor] = useState(usuarios[0]?.id || '')

  React.useEffect(() => {
    if (open) {
      setNombre(editData?.nombre || '')
      setDescripcion(editData?.descripcion || '')
      setUcId(editData?.unidadControlId || '')
      setUsarUCComoNombre(editData?.usaUnidadComoNombre || false)
      setCreadoPor(editData?.creadoPor || usuarios[0]?.id || '')
    }
  }, [open, editData, usuarios])

  React.useEffect(() => {
    if (usarUCComoNombre && ucId) {
      const uc = unidadesControl.find(u => u.id === ucId)
      if (uc) setNombre(uc.nombre)
    }
  }, [usarUCComoNombre, ucId, unidadesControl])

  const handleSubmit = () => {
    if (!nombre.trim() || !ucId) {
      toast.error('Nombre y Unidad de Control son requeridos')
      return
    }
    const now = new Date().toISOString().split('T')[0]
    if (editData) {
      updateProceso(editData.id, { 
        nombre: nombre.trim(), 
        descripcion: descripcion.trim() || undefined, 
        unidadControlId: ucId,
        usaUnidadComoNombre: usarUCComoNombre,
      })
      toast.success('Proceso actualizado')
    } else {
      const id = `proc-${Date.now()}`
      addProceso({ 
        id, 
        nombre: nombre.trim(), 
        descripcion: descripcion.trim() || undefined, 
        unidadControlId: ucId, 
        usaUnidadComoNombre: usarUCComoNombre,
        creadoPor, 
        fechaCreacion: now 
      })
      addHistorial({ id: `h-${Date.now()}`, tipo: 'proceso_creado', descripcion: `Proceso creado: ${nombre.trim()}`, fecha: now, usuarioId: creadoPor, procesoId: id })
      toast.success('Proceso creado')
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base">{editData ? 'Editar' : 'Nuevo'} Proceso</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label className="text-sm">Unidad de Control <span className="text-destructive">*</span></Label>
            <Select value={ucId} onValueChange={setUcId}>
              <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
              <SelectContent>
                {unidadesControl.map(uc => (
                  <SelectItem key={uc.id} value={uc.id}>{uc.nombre} ({uc.tipo})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {ucId && !editData && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border">
              <Checkbox 
                id="usarUC" 
                checked={usarUCComoNombre} 
                onCheckedChange={(v) => setUsarUCComoNombre(v === true)}
              />
              <Label htmlFor="usarUC" className="text-xs text-muted-foreground cursor-pointer">
                Usar Unidad de Control como nombre del Proceso
              </Label>
            </div>
          )}
          <div className="space-y-2">
            <Label className="text-sm">Nombre <span className="text-destructive">*</span></Label>
            <Input 
              value={nombre} 
              onChange={e => setNombre(e.target.value)} 
              placeholder="Nombre del proceso..." 
              disabled={usarUCComoNombre}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Descripcion</Label>
            <Textarea value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="Descripcion..." rows={2} />
          </div>
          {!editData && (
            <div className="space-y-2">
              <Label className="text-sm">Creado por</Label>
              <Select value={creadoPor} onValueChange={setCreadoPor}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {usuarios.map(u => (<SelectItem key={u.id} value={u.id}>{u.nombre}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit}>{editData ? 'Guardar' : 'Crear'}</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// --- Tarea Create/Edit Modal ---
function TareaModal({
  open, onOpenChange, procesoId, editData,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  procesoId: string
  editData?: TareaMR | null
}) {
  const { usuarios, addTarea, updateTarea, addHistorial } = useMatrizRiesgo()
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [creadoPor, setCreadoPor] = useState(usuarios[0]?.id || '')

  React.useEffect(() => {
    if (open) {
      setNombre(editData?.nombre || '')
      setDescripcion(editData?.descripcion || '')
      setCreadoPor(editData?.creadoPor || usuarios[0]?.id || '')
    }
  }, [open, editData, usuarios])

  const handleSubmit = () => {
    if (!nombre.trim()) {
      toast.error('El nombre es requerido')
      return
    }
    const now = new Date().toISOString().split('T')[0]
    if (editData) {
      updateTarea(editData.id, { nombre: nombre.trim(), descripcion: descripcion.trim() || undefined })
      toast.success('Tarea actualizada')
    } else {
      const id = `tar-${Date.now()}`
      addTarea({ id, nombre: nombre.trim(), descripcion: descripcion.trim() || undefined, procesoId, creadoPor, fechaCreacion: now })
      addHistorial({ id: `h-${Date.now()}`, tipo: 'tarea_creada', descripcion: `Tarea creada: ${nombre.trim()}`, fecha: now, usuarioId: creadoPor, tareaId: id })
      toast.success('Tarea creada')
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base">{editData ? 'Editar' : 'Nueva'} Tarea</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label className="text-sm">Nombre <span className="text-destructive">*</span></Label>
            <Input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre de la tarea..." />
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Descripcion</Label>
            <Textarea value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="Descripcion..." rows={2} />
          </div>
          {!editData && (
            <div className="space-y-2">
              <Label className="text-sm">Creado por</Label>
              <Select value={creadoPor} onValueChange={setCreadoPor}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {usuarios.map(u => (<SelectItem key={u.id} value={u.id}>{u.nombre}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit}>{editData ? 'Guardar' : 'Crear'}</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// --- Vinculaciones Modal (for generating Tarea <-> Peligro combinations) ---
interface PendingVinculacion {
  tareaId: string
  peligroId: string
  riesgoEspecificoId: string
  probabilidadId: string
  consecuenciaId: string
}

function VinculacionesModal({
  open,
  onOpenChange,
  selectedTareas,
  selectedPeligros,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  selectedTareas: string[]
  selectedPeligros: string[]
}) {
  const {
    parametros, usuarios, procesos, tareas,
    addFilaIPER, addHistorial,
    getTarea, getProceso, getParametro,
  } = useMatrizRiesgo()

  const [vinculaciones, setVinculaciones] = useState<PendingVinculacion[]>([])
  const [creadoPor] = useState(usuarios[0]?.id || '')

  // Generate initial combinations when modal opens
  React.useEffect(() => {
    if (open && selectedTareas.length > 0 && selectedPeligros.length > 0) {
      const combos: PendingVinculacion[] = []
      selectedTareas.forEach(tareaId => {
        selectedPeligros.forEach(peligroId => {
          combos.push({
            tareaId,
            peligroId,
            riesgoEspecificoId: parametros.riesgos_especificos[0]?.id || '',
            probabilidadId: '',
            consecuenciaId: '',
          })
        })
      })
      setVinculaciones(combos)
    }
  }, [open, selectedTareas, selectedPeligros, parametros.riesgos_especificos])

  const updateVinculacion = (index: number, field: keyof PendingVinculacion, value: string) => {
    setVinculaciones(prev => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: value }
      return next
    })
  }

  const removeVinculacion = (index: number) => {
    setVinculaciones(prev => prev.filter((_, i) => i !== index))
  }

  const calcVEP = (probId: string, consId: string) => {
    const prob = parametros.probabilidad.find(p => p.id === probId)
    const cons = parametros.consecuencia.find(c => c.id === consId)
    return (prob?.valor || 0) * (cons?.valor || 0)
  }

  const canConfirm = vinculaciones.every(v => 
    v.riesgoEspecificoId && v.probabilidadId && v.consecuenciaId
  ) && vinculaciones.length > 0

  const handleConfirm = () => {
    const now = new Date().toISOString().split('T')[0]
    
    vinculaciones.forEach(v => {
      const tarea = getTarea(v.tareaId)
      if (!tarea) return
      
      const vep = calcVEP(v.probabilidadId, v.consecuenciaId)
      const id = `fila-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      const filaIPER: FilaIPER = {
        id,
        procesoId: tarea.procesoId,
        tareaId: v.tareaId,
        peligroId: v.peligroId,
        riesgoEspecificoId: v.riesgoEspecificoId,
        probabilidadId: v.probabilidadId,
        consecuenciaId: v.consecuenciaId,
        vepInicial: vep,
        vepPost: vep,
        estadoVerificacion: 'pendiente',
        fechaCreacion: now,
        creadoPor,
      }
      
      addFilaIPER(filaIPER)
      
      const peligro = getParametro('peligros', v.peligroId)
      addHistorial({
        id: `h-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        tipo: 'fila_creada',
        descripcion: `Peligro identificado: ${peligro?.nombre} en ${tarea.nombre}`,
        fecha: now,
        usuarioId: creadoPor,
        filaIPERId: id,
      })
    })

    toast.success(`${vinculaciones.length} vinculacion${vinculaciones.length !== 1 ? 'es' : ''} creada${vinculaciones.length !== 1 ? 's' : ''}`)
    onOpenChange(false)
  }

  // Custom probability/consequence options for IPER workflow
  const probabilidadOptions = [
    { id: 'prob-baja', nombre: 'Baja', valor: 1 },
    { id: 'prob-media', nombre: 'Media', valor: 2 },
    { id: 'prob-alta', nombre: 'Alta', valor: 4 },
  ]

  const consecuenciaOptions = [
    { id: 'cons-leve', nombre: 'Leve', valor: 1 },
    { id: 'cons-danina', nombre: 'Danina', valor: 2 },
    { id: 'cons-extrema', nombre: 'Extremadamente danina', valor: 4 },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 flex flex-col overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border shrink-0">
          <DialogTitle className="text-base flex items-center gap-2">
            <Link2 className="h-4 w-4 text-primary" />
            Generar Vinculaciones
          </DialogTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Define el riesgo especifico, probabilidad y consecuencia para cada combinacion Tarea - Peligro
          </p>
        </DialogHeader>
        
        <ScrollArea className="flex-1 px-6 py-4">
          {vinculaciones.length === 0 ? (
            <div className="py-12 text-center">
              <AlertTriangle className="h-8 w-8 text-muted-foreground/50 mx-auto" />
              <p className="text-sm text-muted-foreground mt-3">No hay combinaciones para generar</p>
            </div>
          ) : (
            <div className="space-y-4">
              {vinculaciones.map((v, index) => {
                const tarea = getTarea(v.tareaId)
                const proceso = tarea ? getProceso(tarea.procesoId) : null
                const peligro = getParametro('peligros', v.peligroId)
                const vep = calcVEP(v.probabilidadId, v.consecuenciaId)

                return (
                  <Card key={`${v.tareaId}-${v.peligroId}-${index}`} className="relative">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6 text-muted-foreground hover:text-destructive"
                      onClick={() => removeVinculacion(index)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                    <CardContent className="p-4">
                      {/* Header: Proceso -> Tarea -> Peligro */}
                      <div className="flex items-center gap-2 flex-wrap mb-4 pr-8">
                        <Badge variant="outline" className="text-[10px] bg-chart-2/10 text-chart-2 border-chart-2/20">
                          {proceso?.nombre}
                        </Badge>
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        <Badge variant="outline" className="text-[10px]">
                          {tarea?.nombre}
                        </Badge>
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        <Badge variant="outline" className="text-[10px] bg-destructive/10 text-destructive border-destructive/20">
                          {peligro?.nombre}
                        </Badge>
                      </div>

                      {/* Form fields */}
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs">Riesgo especifico <span className="text-destructive">*</span></Label>
                          <Select value={v.riesgoEspecificoId} onValueChange={val => updateVinculacion(index, 'riesgoEspecificoId', val)}>
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="Seleccionar..." />
                            </SelectTrigger>
                            <SelectContent>
                              {parametros.riesgos_especificos.map(r => (
                                <SelectItem key={r.id} value={r.id} className="text-xs">{r.nombre}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs">Probabilidad <span className="text-destructive">*</span></Label>
                          <Select value={v.probabilidadId} onValueChange={val => updateVinculacion(index, 'probabilidadId', val)}>
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="Seleccionar..." />
                            </SelectTrigger>
                            <SelectContent>
                              {probabilidadOptions.map(p => (
                                <SelectItem key={p.id} value={p.id} className="text-xs">{p.nombre} ({p.valor})</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs">Consecuencia <span className="text-destructive">*</span></Label>
                          <Select value={v.consecuenciaId} onValueChange={val => updateVinculacion(index, 'consecuenciaId', val)}>
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="Seleccionar..." />
                            </SelectTrigger>
                            <SelectContent>
                              {consecuenciaOptions.map(c => (
                                <SelectItem key={c.id} value={c.id} className="text-xs">{c.nombre} ({c.valor})</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs">VEP Inicial</Label>
                          <div className={`h-8 px-3 flex items-center rounded-md border text-xs font-semibold ${
                            vep === 0 ? 'bg-muted text-muted-foreground' :
                            vep <= 2 ? 'bg-success/15 text-success border-success/30' :
                            vep <= 4 ? 'bg-warning/15 text-warning-foreground border-warning/30' :
                            vep <= 8 ? 'bg-chart-5/15 text-chart-5 border-chart-5/30' :
                            'bg-destructive/15 text-destructive border-destructive/30'
                          }`}>
                            {vep || '-'}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </ScrollArea>

        <div className="shrink-0 flex items-center justify-between px-6 py-4 border-t border-border bg-muted/30">
          <p className="text-xs text-muted-foreground">
            {vinculaciones.length} vinculacion{vinculaciones.length !== 1 ? 'es' : ''} a crear
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button onClick={handleConfirm} disabled={!canConfirm}>
              <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
              Confirmar Vinculaciones
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// --- Section 1: Procesos y Tareas ---
function ProcesosYTareasSection() {
  const {
    procesos, tareas, filasIPER,
    getUnidadControl, getTareasByProceso, getFilasByTarea,
    deleteProceso, deleteTarea,
  } = useMatrizRiesgo()

  const [searchQuery, setSearchQuery] = useState('')
  const [expandedProcs, setExpandedProcs] = useState<Set<string>>(new Set(procesos.map(p => p.id)))
  const [createProcOpen, setCreateProcOpen] = useState(false)
  const [editProc, setEditProc] = useState<ProcesoMR | null>(null)
  const [createTareaForProc, setCreateTareaForProc] = useState<string | null>(null)
  const [editTarea, setEditTarea] = useState<{ tarea: TareaMR; procId: string } | null>(null)

  const toggleExpand = (id: string) => {
    setExpandedProcs(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const filtered = useMemo(() => {
    if (!searchQuery) return procesos
    const q = searchQuery.toLowerCase()
    return procesos.filter(p => {
      if (p.nombre.toLowerCase().includes(q)) return true
      const procTareas = getTareasByProceso(p.id)
      return procTareas.some(t => t.nombre.toLowerCase().includes(q))
    })
  }, [procesos, searchQuery, getTareasByProceso])

  const handleDeleteProceso = (id: string) => {
    const procTareas = getTareasByProceso(id)
    const hasFilas = procTareas.some(t => getFilasByTarea(t.id).length > 0)
    if (hasFilas) {
      toast.error('No se puede eliminar: tiene identificaciones asociadas')
      return
    }
    procTareas.forEach(t => deleteTarea(t.id))
    deleteProceso(id)
    toast.success('Proceso eliminado')
  }

  const handleDeleteTarea = (id: string) => {
    const filas = getFilasByTarea(id)
    if (filas.length > 0) {
      toast.error('No se puede eliminar: tiene identificaciones asociadas')
      return
    }
    deleteTarea(id)
    toast.success('Tarea eliminada')
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          <Layers className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-foreground">1. Procesos y Tareas</h2>
          <p className="text-xs text-muted-foreground">Gestiona los procesos y sus tareas asociadas</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-3 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Layers className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Procesos</div>
              <div className="text-lg font-bold text-foreground">{procesos.length}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-chart-2/10 text-chart-2">
              <ListTodo className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Tareas</div>
              <div className="text-lg font-bold text-foreground">{tareas.length}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-chart-5/10 text-chart-5">
              <Building2 className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Unidades</div>
              <div className="text-lg font-bold text-foreground">{new Set(procesos.map(p => p.unidadControlId)).size}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar procesos o tareas..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => setCreateProcOpen(true)}>
          <Plus className="h-3.5 w-3.5" /> Nuevo Proceso
        </Button>
      </div>

      {/* Accordion list */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-border bg-muted/30 px-6 py-12 text-center">
            <Layers className="h-8 w-8 text-muted-foreground/50 mx-auto" />
            <p className="mt-3 text-sm font-medium text-muted-foreground">No hay procesos</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={() => setCreateProcOpen(true)}>
              <Plus className="h-3.5 w-3.5 mr-1" /> Crear Proceso
            </Button>
          </div>
        ) : filtered.map(proc => {
          const uc = getUnidadControl(proc.unidadControlId)
          const procTareas = getTareasByProceso(proc.id)
          const isExpanded = expandedProcs.has(proc.id)
          const totalFilas = procTareas.reduce((sum, t) => sum + getFilasByTarea(t.id).length, 0)

          return (
            <Card key={proc.id} className="overflow-hidden">
              {/* Proceso header */}
              <div
                className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => toggleExpand(proc.id)}
              >
                <div className="shrink-0">
                  {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-foreground">{proc.nombre}</h3>
                    <Badge variant="outline" className="text-[10px]">{uc?.nombre}</Badge>
                  </div>
                  {proc.descripcion && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{proc.descripcion}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="secondary" className="text-xs">{procTareas.length} tarea{procTareas.length !== 1 ? 's' : ''}</Badge>
                  {totalFilas > 0 && (
                    <Badge variant="secondary" className="text-xs bg-chart-5/10 text-chart-5 border-chart-5/20">{totalFilas} peligro{totalFilas !== 1 ? 's' : ''}</Badge>
                  )}
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={e => { e.stopPropagation(); setEditProc(proc) }}>
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={e => { e.stopPropagation(); handleDeleteProceso(proc.id) }}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Tareas list */}
              {isExpanded && (
                <div className="border-t border-border bg-muted/10">
                  {procTareas.length === 0 ? (
                    <div className="px-6 py-4 text-center">
                      <p className="text-xs text-muted-foreground">Sin tareas asociadas</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {procTareas.map(tarea => {
                        const tareaFilas = getFilasByTarea(tarea.id)
                        return (
                          <div key={tarea.id} className="flex items-center gap-3 px-6 py-2.5 hover:bg-muted/20 transition-colors">
                            <div className="flex h-5 w-5 items-center justify-center rounded bg-chart-2/10">
                              <ListTodo className="h-3 w-3 text-chart-2" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground">{tarea.nombre}</p>
                              {tarea.descripcion && (
                                <p className="text-xs text-muted-foreground line-clamp-1">{tarea.descripcion}</p>
                              )}
                            </div>
                            {tareaFilas.length > 0 && (
                              <Badge variant="secondary" className="text-[10px]">{tareaFilas.length} peligro{tareaFilas.length !== 1 ? 's' : ''}</Badge>
                            )}
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setEditTarea({ tarea, procId: proc.id })}>
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteTarea(tarea.id)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        )
                      })}
                    </div>
                  )}
                  <div className="px-6 py-2.5 border-t border-border">
                    <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground hover:text-foreground" onClick={() => setCreateTareaForProc(proc.id)}>
                      <Plus className="h-3 w-3" /> Agregar Tarea
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          )
        })}
      </div>

      {/* Modals */}
      <ProcesoModal open={createProcOpen} onOpenChange={setCreateProcOpen} />
      <ProcesoModal open={!!editProc} onOpenChange={v => !v && setEditProc(null)} editData={editProc} />
      {createTareaForProc && (
        <TareaModal open={!!createTareaForProc} onOpenChange={v => { if (!v) setCreateTareaForProc(null) }} procesoId={createTareaForProc} />
      )}
      {editTarea && (
        <TareaModal open={!!editTarea} onOpenChange={v => { if (!v) setEditTarea(null) }} procesoId={editTarea.procId} editData={editTarea.tarea} />
      )}
    </section>
  )
}

// --- Section 2: Identificacion de Peligros ---
function IdentificacionPeligrosSection() {
  const { procesos, tareas, parametros, getTareasByProceso, getProceso } = useMatrizRiesgo()

  const [selectedTareas, setSelectedTareas] = useState<Set<string>>(new Set())
  const [selectedPeligros, setSelectedPeligros] = useState<Set<string>>(new Set())
  const [tareaSearch, setTareaSearch] = useState('')
  const [peligroSearch, setPeligroSearch] = useState('')
  const [expandedProcs, setExpandedProcs] = useState<Set<string>>(new Set(procesos.map(p => p.id)))
  const [vinculacionesModalOpen, setVinculacionesModalOpen] = useState(false)

  const toggleProcExpand = (id: string) => {
    setExpandedProcs(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleTarea = (id: string) => {
    setSelectedTareas(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const togglePeligro = (id: string) => {
    setSelectedPeligros(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAllTareasOfProceso = (procesoId: string) => {
    const procTareas = getTareasByProceso(procesoId)
    const allSelected = procTareas.every(t => selectedTareas.has(t.id))
    
    setSelectedTareas(prev => {
      const next = new Set(prev)
      if (allSelected) {
        procTareas.forEach(t => next.delete(t.id))
      } else {
        procTareas.forEach(t => next.add(t.id))
      }
      return next
    })
  }

  const filteredProcesos = useMemo(() => {
    if (!tareaSearch) return procesos
    const q = tareaSearch.toLowerCase()
    return procesos.filter(p => {
      if (p.nombre.toLowerCase().includes(q)) return true
      const procTareas = getTareasByProceso(p.id)
      return procTareas.some(t => t.nombre.toLowerCase().includes(q))
    })
  }, [procesos, tareaSearch, getTareasByProceso])

  const filteredPeligros = useMemo(() => {
    if (!peligroSearch) return parametros.peligros
    const q = peligroSearch.toLowerCase()
    return parametros.peligros.filter(p => p.nombre.toLowerCase().includes(q))
  }, [parametros.peligros, peligroSearch])

  const canGenerate = selectedTareas.size > 0 && selectedPeligros.size > 0
  const totalCombinations = selectedTareas.size * selectedPeligros.size

  const handleGenerate = () => {
    setVinculacionesModalOpen(true)
  }

  const handleClearSelection = () => {
    setSelectedTareas(new Set())
    setSelectedPeligros(new Set())
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10">
          <AlertTriangle className="h-4 w-4 text-destructive" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-foreground">2. Identificacion de Peligros</h2>
          <p className="text-xs text-muted-foreground">Selecciona tareas y peligros para generar vinculaciones</p>
        </div>
        {(selectedTareas.size > 0 || selectedPeligros.size > 0) && (
          <Button variant="ghost" size="sm" className="ml-auto text-xs" onClick={handleClearSelection}>
            Limpiar seleccion
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-4">
        {/* Left Panel: Procesos y Tareas */}
        <Card className="flex flex-col">
          <CardHeader className="pb-3 px-4 pt-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <ListTodo className="h-3.5 w-3.5" /> Procesos y Tareas
              </CardTitle>
              {selectedTareas.size > 0 && (
                <Badge variant="secondary" className="text-[10px]">{selectedTareas.size} seleccionada{selectedTareas.size !== 1 ? 's' : ''}</Badge>
              )}
            </div>
            <div className="relative mt-2">
              <Search className="absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar tarea..."
                value={tareaSearch}
                onChange={e => setTareaSearch(e.target.value)}
                className="pl-8 h-8 text-xs"
              />
            </div>
          </CardHeader>
          <ScrollArea className="flex-1 max-h-[350px]">
            <div className="px-4 pb-4 space-y-2">
              {filteredProcesos.map(proc => {
                const procTareas = getTareasByProceso(proc.id)
                const isExpanded = expandedProcs.has(proc.id)
                const selectedInProc = procTareas.filter(t => selectedTareas.has(t.id)).length
                const allSelected = procTareas.length > 0 && selectedInProc === procTareas.length

                // Filter tareas if searching
                const displayTareas = tareaSearch 
                  ? procTareas.filter(t => t.nombre.toLowerCase().includes(tareaSearch.toLowerCase()) || proc.nombre.toLowerCase().includes(tareaSearch.toLowerCase()))
                  : procTareas

                if (displayTareas.length === 0 && tareaSearch) return null

                return (
                  <div key={proc.id} className="rounded-lg border border-border overflow-hidden">
                    {/* Proceso header */}
                    <div
                      className="flex items-center gap-2 p-2.5 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => toggleProcExpand(proc.id)}
                    >
                      {isExpanded ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground">{proc.nombre}</p>
                      </div>
                      {selectedInProc > 0 && (
                        <Badge variant="secondary" className="text-[10px]">{selectedInProc}/{procTareas.length}</Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 px-1.5 text-[10px]"
                        onClick={e => { e.stopPropagation(); toggleAllTareasOfProceso(proc.id) }}
                      >
                        {allSelected ? 'Ninguna' : 'Todas'}
                      </Button>
                    </div>

                    {/* Tareas */}
                    {isExpanded && displayTareas.length > 0 && (
                      <div className="divide-y divide-border">
                        {displayTareas.map(tarea => {
                          const isSelected = selectedTareas.has(tarea.id)
                          return (
                            <div
                              key={tarea.id}
                              className={`flex items-center gap-2.5 px-3 py-2 cursor-pointer transition-colors ${
                                isSelected ? 'bg-primary/5' : 'hover:bg-muted/20'
                              }`}
                              onClick={() => toggleTarea(tarea.id)}
                            >
                              <Checkbox checked={isSelected} className="shrink-0" />
                              <div className="min-w-0 flex-1">
                                <p className="text-xs text-foreground">{tarea.nombre}</p>
                              </div>
                              {isSelected && <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
              {filteredProcesos.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">Sin resultados</p>
              )}
            </div>
          </ScrollArea>
        </Card>

        {/* Right Panel: Peligros */}
        <Card className="flex flex-col">
          <CardHeader className="pb-3 px-4 pt-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5" /> Peligros
              </CardTitle>
              {selectedPeligros.size > 0 && (
                <Badge variant="secondary" className="text-[10px]">{selectedPeligros.size} seleccionado{selectedPeligros.size !== 1 ? 's' : ''}</Badge>
              )}
            </div>
            <div className="relative mt-2">
              <Search className="absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar peligro..."
                value={peligroSearch}
                onChange={e => setPeligroSearch(e.target.value)}
                className="pl-8 h-8 text-xs"
              />
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-[10px] px-2 mt-2 w-fit"
              onClick={() => {
                if (selectedPeligros.size === parametros.peligros.length) {
                  setSelectedPeligros(new Set())
                } else {
                  setSelectedPeligros(new Set(parametros.peligros.map(p => p.id)))
                }
              }}
            >
              {selectedPeligros.size === parametros.peligros.length ? 'Ninguno' : 'Todos'}
            </Button>
          </CardHeader>
          <ScrollArea className="flex-1 max-h-[350px]">
            <div className="px-4 pb-4 space-y-1.5">
              {filteredPeligros.map(peligro => {
                const isSelected = selectedPeligros.has(peligro.id)
                const familia = peligro.familiaId ? parametros.familias_peligros.find(f => f.id === peligro.familiaId) : undefined
                return (
                  <div
                    key={peligro.id}
                    className={`rounded-lg border p-3 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-destructive bg-destructive/5 ring-1 ring-destructive/20'
                        : 'border-border hover:border-destructive/40'
                    }`}
                    onClick={() => togglePeligro(peligro.id)}
                  >
                    <div className="flex items-start gap-2.5">
                      <Checkbox checked={isSelected} className="mt-0.5 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-foreground">{peligro.nombre}</p>
                        {familia && (
                          <p className="text-[10px] text-muted-foreground mt-0.5">{familia.nombre}</p>
                        )}
                      </div>
                      {isSelected && <CheckCircle2 className="h-4 w-4 text-destructive shrink-0" />}
                    </div>
                  </div>
                )
              })}
              {filteredPeligros.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">Sin resultados</p>
              )}
            </div>
          </ScrollArea>
        </Card>
      </div>

      {/* Generate button */}
      <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30">
        <div>
          {canGenerate ? (
            <p className="text-sm text-foreground">
              Se generaran <span className="font-semibold">{totalCombinations}</span> vinculacion{totalCombinations !== 1 ? 'es' : ''}
              <span className="text-muted-foreground ml-1">({selectedTareas.size} tarea{selectedTareas.size !== 1 ? 's' : ''} x {selectedPeligros.size} peligro{selectedPeligros.size !== 1 ? 's' : ''})</span>
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">Selecciona al menos una tarea y un peligro para generar vinculaciones</p>
          )}
        </div>
        <Button onClick={handleGenerate} disabled={!canGenerate} className="gap-1.5">
          <Link2 className="h-4 w-4" />
          Generar Vinculaciones
        </Button>
      </div>

      {/* Vinculaciones Modal */}
      <VinculacionesModal
        open={vinculacionesModalOpen}
        onOpenChange={open => {
          setVinculacionesModalOpen(open)
          if (!open) {
            setSelectedTareas(new Set())
            setSelectedPeligros(new Set())
          }
        }}
        selectedTareas={Array.from(selectedTareas)}
        selectedPeligros={Array.from(selectedPeligros)}
      />
    </section>
  )
}

// --- Main View ---
export function IdentificacionView() {
  return (
    <div className="space-y-8">
      <ProcesosYTareasSection />
      <div className="border-t border-border pt-8">
        <IdentificacionPeligrosSection />
      </div>
    </div>
  )
}
