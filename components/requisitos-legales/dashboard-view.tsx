'use client'

import React, { useMemo, useState, useCallback } from 'react'
import { useRequisitosLegales } from '@/lib/requisitos-legales/context'
import {
  CRITICIDAD_LABELS, ATRIBUTO_LABELS, IDENTIFICACION_ESTADO_LABELS,
} from '@/lib/requisitos-legales/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Link2, AlertTriangle, CheckCircle2, Clock,
  Activity, Settings2, GripVertical, ClipboardCheck, Building2,
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

type MetricCardId = 'vinculaciones' | 'cumplimiento' | 'hallazgos' | 'evaluaciones' | 'cumplimientoChart' | 'criticidadChart' | 'atributoChart' | 'hallazgosSummary' | 'recentActivity' | 'ucProgress'

const ALL_METRICS: { id: MetricCardId; label: string }[] = [
  { id: 'vinculaciones', label: 'Total Vinculaciones' },
  { id: 'cumplimiento', label: 'Cumplimiento' },
  { id: 'hallazgos', label: 'Hallazgos Abiertos' },
  { id: 'evaluaciones', label: 'Evaluaciones' },
  { id: 'cumplimientoChart', label: 'Estado de Cumplimiento' },
  { id: 'criticidadChart', label: 'Vinculaciones por Criticidad' },
  { id: 'atributoChart', label: 'Por Atributo' },
  { id: 'ucProgress', label: 'Cumplimiento por UC' },
  { id: 'hallazgosSummary', label: 'Hallazgos' },
  { id: 'recentActivity', label: 'Actividad Reciente' },
]

const DEFAULT_VISIBLE: MetricCardId[] = [
  'vinculaciones', 'cumplimiento', 'hallazgos', 'evaluaciones',
  'cumplimientoChart', 'criticidadChart', 'ucProgress', 'atributoChart', 'hallazgosSummary', 'recentActivity',
]

// --- Main View ---

export function DashboardView() {
  const {
    vinculaciones, evaluaciones, resultados, hallazgos, actividades,
    unidadesControl,
    getDecreto, getUsuario, getLastResultadoByVinculacion, getVinculacionesByUC,
  } = useRequisitosLegales()

  const [visibleMetrics, setVisibleMetrics] = useState<MetricCardId[]>(DEFAULT_VISIBLE)
  const [customizeOpen, setCustomizeOpen] = useState(false)

  // Cumplimiento based on last resultado per vinculacion
  const cumplimientoStats = useMemo(() => {
    let cumple = 0, noCumple = 0, parcial = 0, sinEval = 0
    vinculaciones.filter(v => v.estado === 'activo').forEach(v => {
      const last = getLastResultadoByVinculacion(v.id)
      if (!last) { sinEval++; return }
      if (last.estadoCumplimiento === 'cumple') cumple++
      else if (last.estadoCumplimiento === 'no_cumple') noCumple++
      else parcial++
    })
    const total = cumple + noCumple + parcial + sinEval
    return { cumple, noCumple, parcial, sinEval, total }
  }, [vinculaciones, getLastResultadoByVinculacion])

  const cumplimientoPct = cumplimientoStats.total > 0
    ? Math.round((cumplimientoStats.cumple / cumplimientoStats.total) * 100) : 0

  const hallazgosAbiertos = hallazgos.filter(h => h.estado === 'abierto').length
  const hallazgosCerrados = hallazgos.filter(h => h.estado === 'cerrado').length

  const porCriticidad = useMemo(() => [
    { name: 'Alta', value: vinculaciones.filter(v => v.criticidad === 'alta').length, color: 'var(--destructive)' },
    { name: 'Media', value: vinculaciones.filter(v => v.criticidad === 'media').length, color: 'var(--warning)' },
    { name: 'Baja', value: vinculaciones.filter(v => v.criticidad === 'baja').length, color: 'var(--muted-foreground)' },
  ], [vinculaciones])

  const porAtributo = useMemo(() => [
    { name: 'Permiso', value: vinculaciones.filter(v => v.atributo === 'permiso').length, color: 'var(--primary)' },
    { name: 'Monitoreo', value: vinculaciones.filter(v => v.atributo === 'monitoreo').length, color: 'var(--chart-2)' },
    { name: 'Reporte', value: vinculaciones.filter(v => v.atributo === 'reporte').length, color: 'var(--chart-5)' },
    { name: 'Otros', value: vinculaciones.filter(v => v.atributo === 'otros').length, color: 'var(--chart-4)' },
  ], [vinculaciones])

  const porCumplimiento = useMemo(() => [
    { name: 'Cumple', value: cumplimientoStats.cumple, fill: 'var(--success)' },
    { name: 'No cumple', value: cumplimientoStats.noCumple, fill: 'var(--destructive)' },
    { name: 'Parcial', value: cumplimientoStats.parcial, fill: 'var(--warning)' },
    { name: 'Sin evaluar', value: cumplimientoStats.sinEval, fill: 'var(--muted-foreground)' },
  ], [cumplimientoStats])

  // UC progress data
  const ucProgressData = useMemo(() => {
    return unidadesControl.map(uc => {
      const ucVinculaciones = getVinculacionesByUC(uc.id)
      let cumple = 0
      ucVinculaciones.forEach(v => {
        const last = getLastResultadoByVinculacion(v.id)
        if (last?.estadoCumplimiento === 'cumple') cumple++
      })
      const pct = ucVinculaciones.length > 0 ? Math.round((cumple / ucVinculaciones.length) * 100) : 0
      return { name: uc.nombre, cumple, total: ucVinculaciones.length, pct }
    })
  }, [unidadesControl, getVinculacionesByUC, getLastResultadoByVinculacion])

  const recentActivities = useMemo(() =>
    [...actividades]
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
      .slice(0, 6)
  , [actividades])

  const isVisible = (id: MetricCardId) => visibleMetrics.includes(id)

  const toggleMetric = (id: MetricCardId) => {
    setVisibleMetrics(prev =>
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    )
  }

  const moveMetric = useCallback((id: MetricCardId, direction: 'up' | 'down') => {
    setVisibleMetrics(prev => {
      const idx = prev.indexOf(id)
      if (idx === -1) return prev
      const newIdx = direction === 'up' ? Math.max(0, idx - 1) : Math.min(prev.length - 1, idx + 1)
      const next = [...prev]
      next.splice(idx, 1)
      next.splice(newIdx, 0, id)
      return next
    })
  }, [])

  return (
    <div className="space-y-6">
      {/* Customize button */}
      <div className="flex justify-end">
        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={() => setCustomizeOpen(true)}>
          <Settings2 className="h-3.5 w-3.5" /> Customizar
        </Button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {isVisible('vinculaciones') && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Link2 className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Total Vinculaciones</div>
                  <div className="text-2xl font-bold text-foreground">{vinculaciones.length}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {vinculaciones.filter(v => v.estado === 'activo').length} activas / {vinculaciones.filter(v => v.estado === 'por_definir').length} por definir
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {isVisible('cumplimiento') && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10 text-success">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Cumplimiento</div>
                  <div className="text-2xl font-bold text-foreground">{cumplimientoPct}%</div>
                </div>
              </div>
              <Progress value={cumplimientoPct} className="mt-3 h-1.5" />
            </CardContent>
          </Card>
        )}

        {isVisible('hallazgos') && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Hallazgos Abiertos</div>
                  <div className="text-2xl font-bold text-foreground">{hallazgosAbiertos}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {isVisible('evaluaciones') && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-2/10 text-chart-2">
                  <ClipboardCheck className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Evaluaciones</div>
                  <div className="text-2xl font-bold text-foreground">{evaluaciones.length}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{resultados.length} resultados</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {isVisible('cumplimientoChart') && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Estado de Cumplimiento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={porCumplimiento} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 80 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
                    <XAxis type="number" tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fill: 'var(--foreground)' }} width={75} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--card)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        fontSize: '12px',
                        color: 'var(--foreground)',
                      }}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                      {porCumplimiento.map((entry, idx) => (
                        <Cell key={idx} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {isVisible('criticidadChart') && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Vinculaciones por Criticidad</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={porCriticidad} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={40} paddingAngle={3} strokeWidth={0}>
                      {porCriticidad.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--card)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        fontSize: '12px',
                        color: 'var(--foreground)',
                      }}
                    />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {isVisible('ucProgress') && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Cumplimiento por Unidad de Control</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {ucProgressData.map(item => (
                  <div key={item.name} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-foreground">{item.name}</span>
                      </div>
                      <span className="text-muted-foreground">{item.cumple}/{item.total} ({item.pct}%)</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full bg-success transition-all" style={{ width: `${item.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {isVisible('atributoChart') && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Por Atributo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {porAtributo.map(item => {
                  const pct = vinculaciones.length > 0 ? Math.round((item.value / vinculaciones.length) * 100) : 0
                  return (
                    <div key={item.name} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-foreground">{item.name}</span>
                        <span className="text-muted-foreground">{item.value} ({pct}%)</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: item.color }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {isVisible('hallazgosSummary') && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Hallazgos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-destructive">{hallazgosAbiertos}</div>
                  <div className="text-xs text-muted-foreground">Abiertos</div>
                </div>
                <div className="h-10 w-px bg-border" />
                <div className="text-center">
                  <div className="text-2xl font-bold text-muted-foreground">{hallazgosCerrados}</div>
                  <div className="text-xs text-muted-foreground">Cerrados</div>
                </div>
                <div className="h-10 w-px bg-border" />
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">{hallazgos.length}</div>
                  <div className="text-xs text-muted-foreground">Total</div>
                </div>
              </div>
              {hallazgos.length > 0 && (
                <div className="h-2 rounded-full bg-muted overflow-hidden flex">
                  <div className="h-full bg-destructive transition-all" style={{ width: `${(hallazgosAbiertos / hallazgos.length) * 100}%` }} />
                  <div className="h-full bg-muted-foreground transition-all" style={{ width: `${(hallazgosCerrados / hallazgos.length) * 100}%` }} />
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recent Activity */}
      {isVisible('recentActivity') && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Actividad Reciente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivities.map(act => {
                const usuario = getUsuario(act.usuarioId)
                return (
                  <div key={act.id} className="flex items-start gap-2">
                    <div className="mt-0.5 shrink-0">
                      {act.tipo === 'creacion' && <Link2 className="h-3 w-3 text-primary" />}
                      {act.tipo === 'evaluacion' && <CheckCircle2 className="h-3 w-3 text-chart-2" />}
                      {act.tipo === 'cambio_estado' && <Clock className="h-3 w-3 text-chart-5" />}
                      {act.tipo === 'hallazgo_creado' && <AlertTriangle className="h-3 w-3 text-destructive" />}
                      {act.tipo === 'hallazgo_cerrado' && <CheckCircle2 className="h-3 w-3 text-success" />}
                      {act.tipo === 'bulk_link' && <Link2 className="h-3 w-3 text-primary" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-foreground truncate">{act.descripcion}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-muted-foreground">{usuario?.nombre}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(act.fecha).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Customize Modal */}
      <Dialog open={customizeOpen} onOpenChange={setCustomizeOpen}>
        <DialogContent className="max-w-md max-h-[90vh] p-0 flex flex-col overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-0 shrink-0">
            <DialogTitle className="text-base">Customizar Dashboard</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6">
            <div className="space-y-2 py-4">
              <p className="text-xs text-muted-foreground mb-3">Selecciona las metricas que deseas ver. Usa las flechas para reordenar.</p>
              {ALL_METRICS.map(metric => {
                const visible = visibleMetrics.includes(metric.id)
                const idx = visibleMetrics.indexOf(metric.id)
                return (
                  <div key={metric.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                    <Checkbox checked={visible} onCheckedChange={() => toggleMetric(metric.id)} />
                    <span className="text-sm text-foreground flex-1">{metric.label}</span>
                    {visible && (
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-6 w-6" disabled={idx === 0} onClick={() => moveMetric(metric.id, 'up')}>
                          <GripVertical className="h-3 w-3 rotate-90" />
                        </Button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
          <div className="shrink-0 flex justify-end gap-2 px-6 py-4 border-t border-border">
            <Button variant="outline" onClick={() => { setVisibleMetrics(DEFAULT_VISIBLE); setCustomizeOpen(false) }}>Restablecer</Button>
            <Button onClick={() => setCustomizeOpen(false)}>Guardar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
