'use client'

import React, { useState, useMemo } from 'react'
import { useMatrizRiesgo } from '@/lib/matriz-riesgo/context'
import {
  CONTROL_ESTADO_LABELS, type ControlEstado, type ControlMR,
  getNivelRiesgoColor, getNivelRiesgoLabel,
} from '@/lib/matriz-riesgo/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import {
  Search, Filter, X, Eye, FileUp,
  Clock, CheckCircle2, AlertTriangle, Loader2,
} from 'lucide-react'

// --- Helpers ---

function controlEstadoBadge(estado: ControlEstado) {
  const colorMap: Record<ControlEstado, string> = {
    pendiente: 'bg-muted text-muted-foreground border-border',
    en_proceso: 'bg-warning/15 text-warning-foreground border-warning/30',
    implementado: 'bg-success/15 text-success border-success/30',
    vencido: 'bg-destructive/15 text-destructive border-destructive/30',
  }
  const IconMap: Record<ControlEstado, React.ElementType> = {
    pendiente: Clock,
    en_proceso: Loader2,
    implementado: CheckCircle2,
    vencido: AlertTriangle,
  }
  const Icon = IconMap[estado]
  return (
    <Badge variant="outline" className={`text-xs gap-1 ${colorMap[estado]}`}>
      <Icon className="h-3 w-3" />
      {CONTROL_ESTADO_LABELS[estado]}
    </Badge>
  )
}

// --- Detail Modal ---
function ControlDetailModal({
  control,
  open,
  onOpenChange,
}: {
  control: ControlMR | null
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const { getIdentificacion, getUnidadControl, getParametro, getUsuario, getEvaluacion } = useMatrizRiesgo()

  if (!control) return null
  const ident = getIdentificacion(control.identificacionId)
  const evalData = getEvaluacion(control.evaluacionId)
  const uc = ident ? getUnidadControl(ident.unidadControlId) : undefined
  const peligro = ident ? getParametro('peligros', ident.peligroId) : undefined
  const responsable = getUsuario(control.responsableId)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] p-0 flex flex-col overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-0 shrink-0">
          <DialogTitle className="text-base">Detalle de Control</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-6">
          <div className="space-y-4 py-4">
            {/* Estado */}
            <div className="flex items-center gap-3">
              {controlEstadoBadge(control.estado)}
              {evalData && (
                <Badge variant="outline" className={`text-xs ${
                  getNivelRiesgoColor(evalData.nivelRiesgo) === 'success' ? 'bg-success/15 text-success border-success/30' :
                  getNivelRiesgoColor(evalData.nivelRiesgo) === 'warning' ? 'bg-warning/15 text-warning-foreground border-warning/30' :
                  getNivelRiesgoColor(evalData.nivelRiesgo) === 'destructive' ? 'bg-destructive/15 text-destructive border-destructive/30' :
                  'bg-chart-5/15 text-chart-5 border-chart-5/30'
                }`}>
                  Riesgo: {evalData.nivelRiesgo} - {getNivelRiesgoLabel(evalData.nivelRiesgo)}
                </Badge>
              )}
            </div>

            {/* Context */}
            <Card className="bg-muted/30">
              <CardContent className="p-4">
                <p className="text-sm font-semibold text-foreground">{uc?.nombre}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{ident?.proceso} / {ident?.tarea}</p>
                <div className="mt-2">
                  <Badge variant="outline" className="text-xs bg-destructive/10 text-destructive border-destructive/20">{peligro?.nombre}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Medida */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Medida Preventiva</Label>
              <p className="text-sm text-foreground leading-relaxed">{control.medidaPreventiva}</p>
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Responsable</Label>
                <p className="text-sm text-foreground">{responsable?.nombre}</p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Fecha Compromiso</Label>
                <p className="text-sm text-foreground">
                  {new Date(control.fechaCompromiso).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>

            {control.fechaImplementacion && (
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Fecha Implementacion</Label>
                <p className="text-sm text-foreground">
                  {new Date(control.fechaImplementacion).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            )}

            {control.evidencia && (
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Evidencia</Label>
                <div className="flex items-center gap-2 text-sm text-primary">
                  <FileUp className="h-4 w-4" />
                  {control.evidencia}
                </div>
              </div>
            )}

            {control.comentarios && (
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Comentarios</Label>
                <p className="text-sm text-foreground leading-relaxed">{control.comentarios}</p>
              </div>
            )}
          </div>
        </div>
        <div className="shrink-0 flex justify-end gap-2 px-6 py-4 border-t border-border">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cerrar</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// --- Main View ---
export function ControlView() {
  const {
    controles, identificaciones, evaluaciones,
    getIdentificacion, getUnidadControl, getParametro, getUsuario, getEvaluacion,
  } = useMatrizRiesgo()

  const [searchQuery, setSearchQuery] = useState('')
  const [filterEstado, setFilterEstado] = useState<ControlEstado | 'all'>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [detailControl, setDetailControl] = useState<ControlMR | null>(null)

  const filtered = useMemo(() => {
    return controles.filter(c => {
      if (filterEstado !== 'all' && c.estado !== filterEstado) return false
      if (searchQuery) {
        const ident = getIdentificacion(c.identificacionId)
        const uc = ident ? getUnidadControl(ident.unidadControlId) : undefined
        const text = `${uc?.nombre} ${c.medidaPreventiva}`.toLowerCase()
        if (!text.includes(searchQuery.toLowerCase())) return false
      }
      return true
    })
  }, [controles, filterEstado, searchQuery, getIdentificacion, getUnidadControl])

  // Stats
  const totalControles = controles.length
  const implementados = controles.filter(c => c.estado === 'implementado').length
  const enProceso = controles.filter(c => c.estado === 'en_proceso').length
  const pendientes = controles.filter(c => c.estado === 'pendiente').length
  const vencidos = controles.filter(c => c.estado === 'vencido').length
  const pctImplementado = totalControles > 0 ? Math.round((implementados / totalControles) * 100) : 0

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">Total Controles</div>
            <div className="text-2xl font-bold text-foreground mt-1">{totalControles}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">Implementados</div>
            <div className="text-2xl font-bold text-success mt-1">{implementados}</div>
            <Progress value={pctImplementado} className="mt-2 h-1.5" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">En Proceso</div>
            <div className="text-2xl font-bold text-foreground mt-1">{enProceso}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">Pendientes</div>
            <div className="text-2xl font-bold text-foreground mt-1">{pendientes}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">Vencidos</div>
            <div className="text-2xl font-bold text-destructive mt-1">{vencidos}</div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar controles..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" size="sm" className="h-9 gap-1.5" onClick={() => setShowFilters(!showFilters)}>
          <Filter className="h-3.5 w-3.5" /> Filtros
        </Button>
      </div>

      {showFilters && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-end gap-3">
              <div className="space-y-1.5 flex-1 max-w-xs">
                <Label className="text-xs">Estado</Label>
                <Select value={filterEstado} onValueChange={v => setFilterEstado(v as ControlEstado | 'all')}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="pendiente">Pendiente</SelectItem>
                    <SelectItem value="en_proceso">En Proceso</SelectItem>
                    <SelectItem value="implementado">Implementado</SelectItem>
                    <SelectItem value="vencido">Vencido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {filterEstado !== 'all' && (
                <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => setFilterEstado('all')}>
                  <X className="h-3 w-3 mr-1" /> Limpiar
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <div className="rounded-lg border border-border overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50">
              <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">Medida Preventiva</th>
              <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">Unidad / Peligro</th>
              <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">Estado</th>
              <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">Fecha Compromiso</th>
              <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">Responsable</th>
              <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">Evidencia</th>
              <th className="px-3 py-2.5 w-10" />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-12 text-center text-sm text-muted-foreground">
                  No se encontraron controles.
                </td>
              </tr>
            ) : filtered.map(ctrl => {
              const ident = getIdentificacion(ctrl.identificacionId)
              const uc = ident ? getUnidadControl(ident.unidadControlId) : undefined
              const peligro = ident ? getParametro('peligros', ident.peligroId) : undefined
              const responsable = getUsuario(ctrl.responsableId)
              const isOverdue = new Date(ctrl.fechaCompromiso) < new Date() && ctrl.estado !== 'implementado'

              return (
                <tr key={ctrl.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                  <td className="px-3 py-2.5 text-xs text-foreground max-w-[250px]">
                    <p className="line-clamp-2 leading-relaxed">{ctrl.medidaPreventiva}</p>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="space-y-1">
                      <span className="text-xs text-foreground">{uc?.nombre}</span>
                      <br />
                      <span className="text-xs text-destructive">{peligro?.nombre}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5">{controlEstadoBadge(ctrl.estado)}</td>
                  <td className="px-3 py-2.5">
                    <span className={`text-xs ${isOverdue ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                      {new Date(ctrl.fechaCompromiso).toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-xs text-foreground">{responsable?.nombre}</td>
                  <td className="px-3 py-2.5">
                    {ctrl.evidencia ? (
                      <span className="flex items-center gap-1 text-xs text-primary">
                        <FileUp className="h-3 w-3" />
                        {ctrl.evidencia}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDetailControl(ctrl)}>
                      <Eye className="h-3 w-3" />
                    </Button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div className="text-xs text-muted-foreground">
        {filtered.length} control{filtered.length !== 1 ? 'es' : ''}
      </div>

      {/* Detail Modal */}
      <ControlDetailModal
        control={detailControl}
        open={!!detailControl}
        onOpenChange={(v) => !v && setDetailControl(null)}
      />
    </div>
  )
}
