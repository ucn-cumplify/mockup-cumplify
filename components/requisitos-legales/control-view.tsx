'use client'

import React, { useState, useMemo } from 'react'
import { useRequisitosLegales } from '@/lib/requisitos-legales/context'
import {
  CUMPLIMIENTO_ESTADO_LABELS, CRITICIDAD_LABELS, ATRIBUTO_LABELS,
  HALLAZGO_ESTADO_LABELS,
  type CumplimientoEstado, type VinculacionNormativa,
} from '@/lib/requisitos-legales/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import {
  Building2, ArrowLeft, ChevronRight, FileUp,
  AlertTriangle, CheckCircle2, Clock, Minus,
  BarChart3, Plus, ClipboardCheck,
} from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

// --- Helpers ---

function cumplimientoColor(estado: CumplimientoEstado) {
  switch (estado) {
    case 'cumple': return 'bg-success/15 text-success border-success/30'
    case 'no_cumple': return 'bg-destructive/15 text-destructive border-destructive/30'
    case 'parcial': return 'bg-warning/15 text-warning-foreground border-warning/30'
  }
}

function CumplimientoIcon({ estado }: { estado: CumplimientoEstado }) {
  switch (estado) {
    case 'cumple': return <CheckCircle2 className="h-3.5 w-3.5 text-success" />
    case 'no_cumple': return <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
    case 'parcial': return <Clock className="h-3.5 w-3.5 text-warning-foreground" />
  }
}

// --- Mini Dashboard (req #3) ---

function ControlMiniDashboard({ ucVinculaciones }: { ucVinculaciones: VinculacionNormativa[] }) {
  const stats = useMemo(() => {
    const byAtributo = {
      permiso: ucVinculaciones.filter(v => v.atributo === 'permiso').length,
      monitoreo: ucVinculaciones.filter(v => v.atributo === 'monitoreo').length,
      reporte: ucVinculaciones.filter(v => v.atributo === 'reporte').length,
      otros: ucVinculaciones.filter(v => v.atributo === 'otros').length,
    }
    return byAtributo
  }, [ucVinculaciones])

  const chartData = useMemo(() => [
    { name: 'Permiso', value: stats.permiso, fill: 'var(--primary)' },
    { name: 'Monitoreo', value: stats.monitoreo, fill: 'var(--chart-2)' },
    { name: 'Reporte', value: stats.reporte, fill: 'var(--chart-5)' },
    { name: 'Otros', value: stats.otros, fill: 'var(--chart-4)' },
  ].filter(d => d.value > 0), [stats])

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Resumen de Control por Atributo</h3>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-3 text-center">
            <div className="text-xl font-bold text-primary">{stats.permiso}</div>
            <div className="text-xs text-muted-foreground">Permiso</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <div className="text-xl font-bold text-chart-2">{stats.monitoreo}</div>
            <div className="text-xs text-muted-foreground">Monitoreo</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <div className="text-xl font-bold text-chart-5">{stats.reporte}</div>
            <div className="text-xs text-muted-foreground">Reporte</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <div className="text-xl font-bold text-chart-4">{stats.otros}</div>
            <div className="text-xs text-muted-foreground">Otros</div>
          </CardContent>
        </Card>
      </div>
      {chartData.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Distribucion por Tipo de Atributo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} innerRadius={35} paddingAngle={3} strokeWidth={0}>
                    {chartData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.fill} />
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
  )
}

// --- Add Evaluation Modal (req #11: reuses same form as evaluacion completa) ---

function AddEvaluacionControlModal({
  vinculacion,
  open,
  onOpenChange,
}: {
  vinculacion: VinculacionNormativa | null
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const {
    getArticulo, getUnidadControl, evaluaciones,
    addResultado, addHallazgo, addActividad,
  } = useRequisitosLegales()

  const [estadoCumplimiento, setEstadoCumplimiento] = useState<CumplimientoEstado>('cumple')
  const [fechaEvaluacion, setFechaEvaluacion] = useState(new Date().toISOString().split('T')[0])
  const [comentarios, setComentarios] = useState('')
  const [evidencia, setEvidencia] = useState('')

  const evaluadorId = 'u1'

  React.useEffect(() => {
    if (open) {
      setEstadoCumplimiento('cumple')
      setFechaEvaluacion(new Date().toISOString().split('T')[0])
      setComentarios('')
      setEvidencia('')
    }
  }, [open])

  if (!vinculacion) return null

  const artData = getArticulo(vinculacion.articuloId)
  const unidad = getUnidadControl(vinculacion.unidadControlId)

  // Use the most recent evaluation or first available
  const targetEvaluacionId = evaluaciones.length > 0
    ? evaluaciones.sort((a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime())[0].id
    : `eval-control-${Date.now()}`

  const handleSubmit = () => {
    const resId = `res-${Date.now()}`

    addResultado({
      id: resId,
      evaluacionId: targetEvaluacionId,
      vinculacionId: vinculacion.id,
      estadoCumplimiento,
      fechaEvaluacion,
      comentarios: comentarios || undefined,
      evidencia: evidencia || undefined,
      evaluadorId,
    })

    addActividad({
      id: `act-${Date.now()}`,
      vinculacionId: vinculacion.id,
      evaluacionId: targetEvaluacionId,
      tipo: 'evaluacion',
      descripcion: `Evaluacion desde Control: ${CUMPLIMIENTO_ESTADO_LABELS[estadoCumplimiento]} - ${artData?.decreto.nombre} ${artData?.articulo.numero} / ${unidad?.nombre}`,
      fecha: fechaEvaluacion,
      usuarioId: evaluadorId,
    })

    if (estadoCumplimiento === 'no_cumple') {
      addHallazgo({
        id: `h-${Date.now()}`,
        vinculacionId: vinculacion.id,
        resultadoEvaluacionId: resId,
        evaluacionId: targetEvaluacionId,
        descripcion: comentarios || `Hallazgo generado desde Control - ${artData?.decreto.nombre} ${artData?.articulo.numero} (${unidad?.nombre})`,
        estado: 'abierto',
        fechaCreacion: fechaEvaluacion,
      })
      toast.success('Evaluacion registrada y hallazgo generado')
    } else {
      toast.success('Evaluacion registrada')
    }

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] p-0 flex flex-col overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-0 shrink-0">
          <DialogTitle className="text-base">Agregar Evaluacion</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-6">
          <div className="space-y-5 py-4">
            {/* Context */}
            <Card className="bg-muted/30">
              <CardContent className="p-4">
                <p className="text-sm font-semibold text-foreground">{artData?.decreto.nombre}</p>
                {artData && <p className="text-xs text-muted-foreground mt-1">{artData.articulo.numero}: {artData.articulo.contenido.slice(0, 100)}...</p>}
                <div className="mt-2 flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium text-foreground">{unidad?.nombre}</span>
                </div>
              </CardContent>
            </Card>

            {/* Estado cumplimiento */}
            <div className="space-y-2">
              <Label className="text-sm">Estado de Cumplimiento <span className="text-destructive">*</span></Label>
              <Select value={estadoCumplimiento} onValueChange={(v) => setEstadoCumplimiento(v as CumplimientoEstado)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cumple">Cumple</SelectItem>
                  <SelectItem value="no_cumple">No cumple</SelectItem>
                  <SelectItem value="parcial">Cumple parcial</SelectItem>
                </SelectContent>
              </Select>
              {estadoCumplimiento === 'no_cumple' && (
                <div className="flex items-start gap-2 rounded-lg bg-destructive/10 border border-destructive/30 p-3 mt-2">
                  <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                  <p className="text-xs text-destructive leading-relaxed">Se generara un hallazgo automaticamente.</p>
                </div>
              )}
            </div>

            {/* Fecha */}
            <div className="space-y-2">
              <Label className="text-sm">Fecha de Evaluacion</Label>
              <Input type="date" value={fechaEvaluacion} onChange={e => setFechaEvaluacion(e.target.value)} />
            </div>

            {/* Comentarios */}
            <div className="space-y-2">
              <Label className="text-sm">Comentarios</Label>
              <Textarea
                placeholder="Observaciones de la evaluacion..."
                value={comentarios}
                onChange={e => setComentarios(e.target.value)}
                rows={3}
              />
            </div>

            {/* Evidencia */}
            <div className="space-y-2">
              <Label className="text-sm">Evidencia (nombre de archivo)</Label>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Ej: informe_monitoreo.pdf"
                  value={evidencia}
                  onChange={e => setEvidencia(e.target.value)}
                />
                <Button variant="outline" size="icon" className="shrink-0">
                  <FileUp className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
        <div className="shrink-0 flex justify-end gap-2 px-6 py-4 border-t border-border">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit}>Registrar Evaluacion</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// --- Articulo History View (deepest drill-down) ---

function ArticuloHistoryView({
  vinculacionId,
  onBack,
}: {
  vinculacionId: string
  onBack: () => void
}) {
  const {
    getVinculacion, getArticulo, getUnidadControl, getUsuario,
    getResultadosByVinculacion, getHallazgosByVinculacion,
  } = useRequisitosLegales()

  const vinculacion = getVinculacion(vinculacionId)
  if (!vinculacion) return null

  const artData = getArticulo(vinculacion.articuloId)
  const uc = getUnidadControl(vinculacion.unidadControlId)
  const resultados = getResultadosByVinculacion(vinculacion.id)
  const hallazgos = getHallazgosByVinculacion(vinculacion.id)

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h3 className="text-base font-semibold text-foreground">{artData?.articulo.numero} - {uc?.nombre}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{artData?.decreto.nombre}</p>
        </div>
      </div>

      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">{artData?.articulo.contenido}</p>
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" className="text-xs">{CRITICIDAD_LABELS[vinculacion.criticidad]}</Badge>
            <Badge variant="secondary" className="text-xs">{ATRIBUTO_LABELS[vinculacion.atributo]}</Badge>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span>Responsables:</span>
              {vinculacion.responsableIds.map(uId => getUsuario(uId)?.nombre).filter(Boolean).join(', ')}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Historial de Evaluaciones ({resultados.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {resultados.length === 0 ? (
              <p className="text-xs text-muted-foreground py-6 text-center">Sin evaluaciones registradas.</p>
            ) : (
              <div className="space-y-3">
                {resultados.map(res => {
                  const evaluador = getUsuario(res.evaluadorId)
                  return (
                    <div key={res.id} className="rounded-lg border border-border p-3">
                      <div className="flex items-center gap-2">
                        <CumplimientoIcon estado={res.estadoCumplimiento} />
                        <Badge variant="outline" className={`text-[10px] ${cumplimientoColor(res.estadoCumplimiento)}`}>
                          {CUMPLIMIENTO_ESTADO_LABELS[res.estadoCumplimiento]}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(res.fechaEvaluacion).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                      </div>
                      {res.comentarios && (
                        <p className="text-xs text-foreground mt-2 leading-relaxed">{res.comentarios}</p>
                      )}
                      <div className="mt-2 flex items-center gap-2 text-[10px] text-muted-foreground">
                        <span>{evaluador?.nombre}</span>
                        {res.evidencia && (
                          <span className="flex items-center gap-1">
                            <FileUp className="h-2.5 w-2.5" />{res.evidencia}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Hallazgos ({hallazgos.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {hallazgos.length === 0 ? (
              <p className="text-xs text-muted-foreground py-6 text-center">Sin hallazgos registrados.</p>
            ) : (
              <div className="space-y-3">
                {hallazgos.map(h => (
                  <div key={h.id} className="rounded-lg border border-border p-3">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className={`h-3.5 w-3.5 ${h.estado === 'abierto' ? 'text-destructive' : 'text-muted-foreground'}`} />
                      <Badge variant="outline" className={`text-[10px] ${h.estado === 'abierto' ? 'bg-destructive/15 text-destructive border-destructive/30' : 'bg-muted text-muted-foreground border-border'}`}>
                        {HALLAZGO_ESTADO_LABELS[h.estado]}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(h.fechaCreacion).toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <p className="text-xs text-foreground mt-2 leading-relaxed">{h.descripcion}</p>
                    {h.fechaCierre && (
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Cerrado: {new Date(h.fechaCierre).toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// --- UC Detail View (req #11: with "Agregar evaluacion" button) ---

function UCDetailView({
  ucId,
  onBack,
  onSelectArticulo,
}: {
  ucId: string
  onBack: () => void
  onSelectArticulo: (vinculacionId: string) => void
}) {
  const {
    getUnidadControl, getArticulo, getUsuario,
    getVinculacionesByUC, getLastResultadoByVinculacion,
    getHallazgosByVinculacion,
  } = useRequisitosLegales()

  // req #11: Evaluation modal state
  const [evalVinculacion, setEvalVinculacion] = useState<VinculacionNormativa | null>(null)

  const uc = getUnidadControl(ucId)
  const vinculaciones = getVinculacionesByUC(ucId)

  const stats = useMemo(() => {
    let cumple = 0, noCumple = 0, parcial = 0, sinEval = 0
    vinculaciones.forEach(v => {
      const last = getLastResultadoByVinculacion(v.id)
      if (!last) { sinEval++; return }
      if (last.estadoCumplimiento === 'cumple') cumple++
      else if (last.estadoCumplimiento === 'no_cumple') noCumple++
      else parcial++
    })
    return { cumple, noCumple, parcial, sinEval, total: vinculaciones.length }
  }, [vinculaciones, getLastResultadoByVinculacion])

  const cumplePct = stats.total > 0 ? Math.round((stats.cumple / stats.total) * 100) : 0

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">{uc?.nombre}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{uc?.tipo}{uc?.descripcion ? ` - ${uc.descripcion}` : ''}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Card>
          <CardContent className="p-3 text-center">
            <div className="text-lg font-bold text-foreground">{stats.total}</div>
            <div className="text-xs text-muted-foreground">Total Articulos</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <div className="text-lg font-bold text-success">{stats.cumple}</div>
            <div className="text-xs text-muted-foreground">Cumple</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <div className="text-lg font-bold text-destructive">{stats.noCumple}</div>
            <div className="text-xs text-muted-foreground">No cumple</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <div className="text-lg font-bold text-warning-foreground">{stats.parcial}</div>
            <div className="text-xs text-muted-foreground">Parcial</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <div className="text-lg font-bold text-muted-foreground">{stats.sinEval}</div>
            <div className="text-xs text-muted-foreground">Sin evaluar</div>
          </CardContent>
        </Card>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-foreground font-medium">Cumplimiento</span>
            <span className="text-foreground font-bold">{cumplePct}%</span>
          </div>
          <div className="h-3 rounded-full bg-muted overflow-hidden flex">
            {stats.cumple > 0 && (
              <div className="h-full bg-success transition-all" style={{ width: `${(stats.cumple / stats.total) * 100}%` }} />
            )}
            {stats.parcial > 0 && (
              <div className="h-full bg-warning transition-all" style={{ width: `${(stats.parcial / stats.total) * 100}%` }} />
            )}
            {stats.noCumple > 0 && (
              <div className="h-full bg-destructive transition-all" style={{ width: `${(stats.noCumple / stats.total) * 100}%` }} />
            )}
          </div>
          <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-success" /> Cumple</div>
            <div className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-warning" /> Parcial</div>
            <div className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-destructive" /> No cumple</div>
            <div className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-muted-foreground" /> Sin evaluar</div>
          </div>
        </CardContent>
      </Card>

      {/* Resumen de Control por Atributo - inside each UC */}
      <ControlMiniDashboard ucVinculaciones={vinculaciones} />

      {/* Articulos table */}
      <div className="rounded-lg border border-border overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50">
              <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">Decreto / Articulo</th>
              <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">Responsable(s)</th>
              <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">Criticidad</th>
              <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">Ultimo Estado</th>
              <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">Fecha Ult. Eval.</th>
              <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">Hallazgos</th>
              <th className="px-3 py-2.5 w-24" />
            </tr>
          </thead>
          <tbody>
            {vinculaciones.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-12 text-center text-sm text-muted-foreground">
                  No hay articulos vinculados a esta unidad.
                </td>
              </tr>
            ) : vinculaciones.map(v => {
              const artData = getArticulo(v.articuloId)
              const lastResult = getLastResultadoByVinculacion(v.id)
              const hallazgos = getHallazgosByVinculacion(v.id)
              const openHallazgos = hallazgos.filter(h => h.estado === 'abierto')

              return (
                <tr
                  key={v.id}
                  className="border-t border-border hover:bg-muted/30 transition-colors"
                >
                  <td className="px-3 py-2.5">
                    <p className="text-xs font-medium text-foreground">{artData?.decreto.nombre}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{artData?.articulo.numero}</p>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex flex-wrap gap-1">
                      {v.responsableIds.slice(0, 2).map(uId => {
                        const u = getUsuario(uId)
                        return u ? <span key={uId} className="text-xs text-foreground">{u.nombre.split(' ')[0]}</span> : null
                      })}
                      {v.responsableIds.length > 2 && <span className="text-xs text-muted-foreground">+{v.responsableIds.length - 2}</span>}
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <Badge variant="outline" className={`text-[10px] ${
                      v.criticidad === 'alta' ? 'bg-destructive/15 text-destructive border-destructive/30' :
                      v.criticidad === 'media' ? 'bg-warning/15 text-warning-foreground border-warning/30' :
                      'bg-muted text-muted-foreground border-border'
                    }`}>
                      {CRITICIDAD_LABELS[v.criticidad]}
                    </Badge>
                  </td>
                  <td className="px-3 py-2.5">
                    {lastResult ? (
                      <Badge variant="outline" className={`text-[10px] gap-1 ${cumplimientoColor(lastResult.estadoCumplimiento)}`}>
                        <CumplimientoIcon estado={lastResult.estadoCumplimiento} />
                        {CUMPLIMIENTO_ESTADO_LABELS[lastResult.estadoCumplimiento]}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground/50">Sin evaluar</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    {lastResult ? (
                      <span className="text-xs text-muted-foreground">
                        {new Date(lastResult.fechaEvaluacion).toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    ) : (
                      <Minus className="h-3 w-3 text-muted-foreground/30" />
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    {openHallazgos.length > 0 ? (
                      <Badge variant="outline" className="text-[10px] bg-destructive/15 text-destructive border-destructive/30 gap-1">
                        <AlertTriangle className="h-3 w-3" />{openHallazgos.length}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">0</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1">
                      {/* req #11: Agregar evaluacion button */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 text-[10px] px-2 gap-1"
                        onClick={(e) => { e.stopPropagation(); setEvalVinculacion(v) }}
                      >
                        <Plus className="h-3 w-3" /> Evaluar
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => onSelectArticulo(v.id)}
                      >
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* req #11: Evaluation modal */}
      <AddEvaluacionControlModal
        vinculacion={evalVinculacion}
        open={!!evalVinculacion}
        onOpenChange={(v) => !v && setEvalVinculacion(null)}
      />
    </div>
  )
}

// --- Main View ---

export function ControlView() {
  const {
    unidadesControl, getVinculacionesByUC, getLastResultadoByVinculacion,
    getHallazgosByVinculacion,
  } = useRequisitosLegales()

  const [selectedUcId, setSelectedUcId] = useState<string | null>(null)
  const [selectedVinculacionId, setSelectedVinculacionId] = useState<string | null>(null)

  if (selectedVinculacionId) {
    return (
      <ArticuloHistoryView
        vinculacionId={selectedVinculacionId}
        onBack={() => setSelectedVinculacionId(null)}
      />
    )
  }

  if (selectedUcId) {
    return (
      <UCDetailView
        ucId={selectedUcId}
        onBack={() => setSelectedUcId(null)}
        onSelectArticulo={(vId) => setSelectedVinculacionId(vId)}
      />
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-semibold text-foreground">Control por Unidad de Control</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Progreso de cumplimiento basado en la ultima evaluacion de cada articulo</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {unidadesControl.map(uc => {
          const vinculaciones = getVinculacionesByUC(uc.id)
          let cumple = 0, noCumple = 0, parcial = 0, sinEval = 0
          const openHallazgos: string[] = []

          vinculaciones.forEach(v => {
            const last = getLastResultadoByVinculacion(v.id)
            if (!last) { sinEval++; return }
            if (last.estadoCumplimiento === 'cumple') cumple++
            else if (last.estadoCumplimiento === 'no_cumple') noCumple++
            else parcial++

            const hallazgos = getHallazgosByVinculacion(v.id)
            hallazgos.forEach(h => {
              if (h.estado === 'abierto') openHallazgos.push(h.id)
            })
          })

          const total = vinculaciones.length
          const cumplePct = total > 0 ? Math.round((cumple / total) * 100) : 0

          return (
            <Card
              key={uc.id}
              className="cursor-pointer hover:border-primary/40 transition-all"
              onClick={() => setSelectedUcId(uc.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-foreground">{uc.nombre}</h4>
                    <p className="text-xs text-muted-foreground">{uc.tipo}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground">{total} articulos vinculados</span>
                    <span className="font-semibold text-foreground">{cumplePct}% cumple</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-muted overflow-hidden flex">
                    {cumple > 0 && (
                      <div className="h-full bg-success transition-all" style={{ width: `${(cumple / total) * 100}%` }} />
                    )}
                    {parcial > 0 && (
                      <div className="h-full bg-warning transition-all" style={{ width: `${(parcial / total) * 100}%` }} />
                    )}
                    {noCumple > 0 && (
                      <div className="h-full bg-destructive transition-all" style={{ width: `${(noCumple / total) * 100}%` }} />
                    )}
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-3 text-xs">
                  <span className="text-success">{cumple} cumple</span>
                  <span className="text-warning-foreground">{parcial} parcial</span>
                  <span className="text-destructive">{noCumple} no cumple</span>
                  {sinEval > 0 && <span className="text-muted-foreground">{sinEval} sin evaluar</span>}
                </div>

                {openHallazgos.length > 0 && (
                  <div className="mt-2 flex items-center gap-1.5">
                    <AlertTriangle className="h-3 w-3 text-destructive" />
                    <span className="text-xs text-destructive">{openHallazgos.length} hallazgos abiertos</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
