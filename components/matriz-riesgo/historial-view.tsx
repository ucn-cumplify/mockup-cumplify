'use client'

import React, { useState, useMemo } from 'react'
import { useMatrizRiesgo } from '@/lib/matriz-riesgo/context'
import type { HistorialMR } from '@/lib/matriz-riesgo/types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Search, Filter, X, Clock, ShieldAlert, Layers, ListTodo,
  ClipboardCheck, Shield, CheckCircle2, Settings2, History,
} from 'lucide-react'

// --- Helpers ---

function historialIcon(tipo: HistorialMR['tipo']) {
  switch (tipo) {
    case 'actividad_creada': return <Layers className="h-3.5 w-3.5 text-primary" />
    case 'tarea_creada': return <ListTodo className="h-3.5 w-3.5 text-chart-2" />
    case 'fila_creada': return <ShieldAlert className="h-3.5 w-3.5 text-chart-5" />
    case 'medida_creada': return <Shield className="h-3.5 w-3.5 text-success" />
    case 'verificacion': return <CheckCircle2 className="h-3.5 w-3.5 text-success" />
    case 'parametro_modificado': return <Settings2 className="h-3.5 w-3.5 text-muted-foreground" />
  }
}

function historialTipoLabel(tipo: HistorialMR['tipo']) {
  switch (tipo) {
    case 'actividad_creada': return 'Actividad Creada'
    case 'tarea_creada': return 'Tarea Creada'
    case 'fila_creada': return 'Peligro Identificado'
    case 'medida_creada': return 'Medida Creada'
    case 'verificacion': return 'Verificacion'
    case 'parametro_modificado': return 'Parametro Modificado'
  }
}

function historialTipoColor(tipo: HistorialMR['tipo']) {
  switch (tipo) {
    case 'actividad_creada': return 'bg-primary/10 text-primary border-primary/20'
    case 'tarea_creada': return 'bg-chart-2/15 text-chart-2 border-chart-2/20'
    case 'fila_creada': return 'bg-chart-5/15 text-chart-5 border-chart-5/30'
    case 'medida_creada': return 'bg-success/15 text-success border-success/30'
    case 'verificacion': return 'bg-success/15 text-success border-success/30'
    case 'parametro_modificado': return 'bg-muted text-muted-foreground border-border'
  }
}

// --- Main View ---
export function HistorialViewMR() {
  const { historial, usuarios, getUsuario } = useMatrizRiesgo()

  const [searchQuery, setSearchQuery] = useState('')
  const [filterTipo, setFilterTipo] = useState<HistorialMR['tipo'] | 'all'>('all')
  const [filterUsuario, setFilterUsuario] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)

  const sorted = useMemo(() => {
    return [...historial]
      .filter(h => {
        if (filterTipo !== 'all' && h.tipo !== filterTipo) return false
        if (filterUsuario !== 'all' && h.usuarioId !== filterUsuario) return false
        if (searchQuery) {
          if (!h.descripcion.toLowerCase().includes(searchQuery.toLowerCase())) return false
        }
        return true
      })
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
  }, [historial, filterTipo, filterUsuario, searchQuery])

  // Group by date
  const grouped = useMemo(() => {
    const groups: Record<string, HistorialMR[]> = {}
    sorted.forEach(h => {
      const date = new Date(h.fecha).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })
      if (!groups[date]) groups[date] = []
      groups[date].push(h)
    })
    return groups
  }, [sorted])

  const activeFilters = [filterTipo, filterUsuario].filter(f => f !== 'all').length

  // Stats
  const totalFila = historial.filter(h => h.tipo === 'fila_creada').length
  const totalMedidas = historial.filter(h => h.tipo === 'medida_creada').length
  const totalVerif = historial.filter(h => h.tipo === 'verificacion').length

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">Total Eventos</div>
            <div className="text-2xl font-bold text-foreground mt-1">{historial.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">Peligros Identificados</div>
            <div className="text-2xl font-bold text-foreground mt-1">{totalFila}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">Medidas Creadas</div>
            <div className="text-2xl font-bold text-foreground mt-1">{totalMedidas}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">Verificaciones</div>
            <div className="text-2xl font-bold text-foreground mt-1">{totalVerif}</div>
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

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Tipo de evento</Label>
                <Select value={filterTipo} onValueChange={v => setFilterTipo(v as HistorialMR['tipo'] | 'all')}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="actividad_creada">Actividad Creada</SelectItem>
                    <SelectItem value="tarea_creada">Tarea Creada</SelectItem>
                    <SelectItem value="fila_creada">Peligro Identificado</SelectItem>
                    <SelectItem value="medida_creada">Medida Creada</SelectItem>
                    <SelectItem value="verificacion">Verificacion</SelectItem>
                    <SelectItem value="parametro_modificado">Parametro Modificado</SelectItem>
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
            </div>
            {activeFilters > 0 && (
              <div className="mt-3 flex justify-end">
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => {
                  setFilterTipo('all'); setFilterUsuario('all')
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
          Object.entries(grouped).map(([date, entries]) => (
            <div key={date}>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  {date}
                </div>
                <div className="flex-1 h-px bg-border" />
                <Badge variant="secondary" className="text-xs">{entries.length}</Badge>
              </div>
              <div className="space-y-2 ml-6 border-l-2 border-border pl-4">
                {entries.map(entry => {
                  const usuario = getUsuario(entry.usuarioId)

                  return (
                    <div key={entry.id} className="relative flex items-start gap-3 py-2">
                      <div className="absolute -left-[25px] top-3 flex h-5 w-5 items-center justify-center rounded-full bg-background border-2 border-border">
                        {historialIcon(entry.tipo)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className={`text-[10px] ${historialTipoColor(entry.tipo)}`}>
                            {historialTipoLabel(entry.tipo)}
                          </Badge>
                        </div>
                        <p className="text-xs text-foreground mt-1 leading-relaxed">{entry.descripcion}</p>
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
