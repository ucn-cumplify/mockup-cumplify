'use client'

import React, { useState, useMemo } from 'react'
import { useRequisitosLegales } from '@/lib/requisitos-legales/context'
import {
  IDENTIFICACION_ESTADO_LABELS, CRITICIDAD_LABELS,
  type ActividadRL,
} from '@/lib/requisitos-legales/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Search, Filter, X, Clock, Plus, ClipboardCheck,
  ArrowRightLeft, AlertTriangle, CheckCircle2, History,
} from 'lucide-react'

// --- Helpers ---

function actividadIcon(tipo: ActividadRL['tipo']) {
  switch (tipo) {
    case 'creacion': return <Plus className="h-3.5 w-3.5 text-primary" />
    case 'evaluacion': return <ClipboardCheck className="h-3.5 w-3.5 text-chart-2" />
    case 'cambio_estado': return <ArrowRightLeft className="h-3.5 w-3.5 text-chart-5" />
    case 'hallazgo_creado': return <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
    case 'hallazgo_cerrado': return <CheckCircle2 className="h-3.5 w-3.5 text-success" />
    case 'bulk_link': return <Plus className="h-3.5 w-3.5 text-primary" />
  }
}

function actividadTipoLabel(tipo: ActividadRL['tipo']) {
  switch (tipo) {
    case 'creacion': return 'Creacion'
    case 'evaluacion': return 'Evaluacion'
    case 'cambio_estado': return 'Cambio de Estado'
    case 'hallazgo_creado': return 'Hallazgo Creado'
    case 'hallazgo_cerrado': return 'Hallazgo Cerrado'
    case 'bulk_link': return 'Vinculacion Masiva'
  }
}

function actividadTipoColor(tipo: ActividadRL['tipo']) {
  switch (tipo) {
    case 'creacion': return 'bg-primary/10 text-primary border-primary/20'
    case 'evaluacion': return 'bg-chart-2/15 text-chart-2 border-chart-2/20'
    case 'cambio_estado': return 'bg-chart-5/15 text-chart-5 border-chart-5/20'
    case 'hallazgo_creado': return 'bg-destructive/15 text-destructive border-destructive/30'
    case 'hallazgo_cerrado': return 'bg-success/15 text-success border-success/30'
    case 'bulk_link': return 'bg-primary/10 text-primary border-primary/20'
  }
}

// --- Main View ---

export function HistorialView() {
  const {
    actividades, vinculaciones, usuarios, unidadesControl,
    getDecreto, getArticulo, getUsuario, getVinculacion,
  } = useRequisitosLegales()

  const [searchQuery, setSearchQuery] = useState('')
  const [filterTipo, setFilterTipo] = useState<ActividadRL['tipo'] | 'all'>('all')
  const [filterUsuario, setFilterUsuario] = useState<string>('all')
  const [filterVinculacion, setFilterVinculacion] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)

  const sorted = useMemo(() => {
    const result = [...actividades]
      .filter(a => {
        if (filterTipo !== 'all' && a.tipo !== filterTipo) return false
        if (filterUsuario !== 'all' && a.usuarioId !== filterUsuario) return false
        if (filterVinculacion !== 'all' && a.vinculacionId !== filterVinculacion) return false
        if (searchQuery) {
          const text = a.descripcion.toLowerCase()
          if (!text.includes(searchQuery.toLowerCase())) return false
        }
        return true
      })
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    return result
  }, [actividades, filterTipo, filterUsuario, filterVinculacion, searchQuery])

  // Group by date
  const grouped = useMemo(() => {
    const groups: Record<string, ActividadRL[]> = {}
    sorted.forEach(a => {
      const date = new Date(a.fecha).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })
      if (!groups[date]) groups[date] = []
      groups[date].push(a)
    })
    return groups
  }, [sorted])

  const activeFilters = [filterTipo, filterUsuario, filterVinculacion].filter(f => f !== 'all').length

  // Stats
  const totalEvaluaciones = actividades.filter(a => a.tipo === 'evaluacion').length
  const totalHallazgos = actividades.filter(a => a.tipo === 'hallazgo_creado').length
  const totalCerrados = actividades.filter(a => a.tipo === 'hallazgo_cerrado').length

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">Total Actividades</div>
            <div className="text-2xl font-bold text-foreground mt-1">{actividades.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">Evaluaciones</div>
            <div className="text-2xl font-bold text-foreground mt-1">{totalEvaluaciones}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">Hallazgos Creados</div>
            <div className="text-2xl font-bold text-foreground mt-1">{totalHallazgos}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">Hallazgos Cerrados</div>
            <div className="text-2xl font-bold text-foreground mt-1">{totalCerrados}</div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar en historial..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" size="sm" className="h-9 gap-1.5" onClick={() => setShowFilters(!showFilters)}>
          <Filter className="h-3.5 w-3.5" />
          Filtros
          {activeFilters > 0 && (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px]">{activeFilters}</span>
          )}
        </Button>
      </div>

      {/* Filter bar */}
      {showFilters && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Tipo de actividad</Label>
                <Select value={filterTipo} onValueChange={(v) => setFilterTipo(v as ActividadRL['tipo'] | 'all')}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="creacion">Creacion</SelectItem>
                    <SelectItem value="evaluacion">Evaluacion</SelectItem>
                    <SelectItem value="cambio_estado">Cambio de Estado</SelectItem>
                    <SelectItem value="hallazgo_creado">Hallazgo Creado</SelectItem>
                    <SelectItem value="hallazgo_cerrado">Hallazgo Cerrado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Usuario</Label>
                <Select value={filterUsuario} onValueChange={setFilterUsuario}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {usuarios.map(u => (
                      <SelectItem key={u.id} value={u.id}>{u.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Vinculacion</Label>
                <Select value={filterVinculacion} onValueChange={setFilterVinculacion}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {vinculaciones.map(v => {
                      const d = getDecreto(v.decretoId)
                      const a = v.articuloId ? getArticulo(v.articuloId) : undefined
                      return (
                        <SelectItem key={v.id} value={v.id}>
                          {d?.nombre} {a ? `- ${a.articulo.numero}` : ''}
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {activeFilters > 0 && (
              <div className="mt-3 flex justify-end">
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => {
                  setFilterTipo('all'); setFilterUsuario('all'); setFilterVinculacion('all')
                }}>
                  <X className="h-3 w-3 mr-1" /> Limpiar filtros
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Timeline */}
      <div className="space-y-6">
        {Object.keys(grouped).length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-border bg-muted/30 px-6 py-16 text-center">
            <History className="h-10 w-10 text-muted-foreground/50 mx-auto" />
            <p className="mt-3 text-sm font-medium text-muted-foreground">Sin actividad registrada</p>
          </div>
        ) : (
          Object.entries(grouped).map(([date, acts]) => (
            <div key={date}>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  {date}
                </div>
                <div className="flex-1 h-px bg-border" />
                <Badge variant="secondary" className="text-xs">{acts.length}</Badge>
              </div>
              <div className="space-y-2 ml-6 border-l-2 border-border pl-4">
                {acts.map(act => {
                  const usuario = getUsuario(act.usuarioId)
                  const vinculacion = getVinculacion(act.vinculacionId)
                  const decreto = vinculacion ? getDecreto(vinculacion.decretoId) : undefined

                  return (
                    <div key={act.id} className="relative flex items-start gap-3 py-2">
                      <div className="absolute -left-[25px] top-3 flex h-5 w-5 items-center justify-center rounded-full bg-background border-2 border-border">
                        {actividadIcon(act.tipo)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className={`text-[10px] ${actividadTipoColor(act.tipo)}`}>
                            {actividadTipoLabel(act.tipo)}
                          </Badge>
                          {decreto && (
                            <span className="text-xs text-muted-foreground">{decreto.nombre}</span>
                          )}
                        </div>
                        <p className="text-xs text-foreground mt-1 leading-relaxed">{act.descripcion}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">{usuario?.nombre}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
