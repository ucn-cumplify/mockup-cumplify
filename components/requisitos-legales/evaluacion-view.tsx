'use client'

import React, { useState, useMemo } from 'react'
import { useRequisitosLegales } from '@/lib/requisitos-legales/context'
import {
  CUMPLIMIENTO_ESTADO_LABELS, CRITICIDAD_LABELS, ATRIBUTO_LABELS,
  type CumplimientoEstado, type EvaluacionRL, type VinculacionNormativa,
} from '@/lib/requisitos-legales/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import {
  Search, ClipboardCheck, FileUp, AlertTriangle, Building2,
  Plus, ArrowLeft, Pencil, Calendar, BarChart3,
  CheckCircle2, XCircle, AlertCircle, ImagePlus, MessageSquare,
  ChevronDown, ChevronRight, Filter,
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts'

// --- Helpers ---

function cumplimientoColor(estado: CumplimientoEstado) {
  switch (estado) {
    case 'cumple': return 'bg-success/15 text-success border-success/30'
    case 'no_cumple': return 'bg-destructive/15 text-destructive border-destructive/30'
    case 'parcial': return 'bg-warning/15 text-warning-foreground border-warning/30'
  }
}

// --- Mini Dashboard (req #2) ---

function EvaluacionMiniDashboard() {
  const {
    vinculaciones, resultados, unidadesControl,
    getLastResultadoByVinculacion, getVinculacionesByUC,
  } = useRequisitosLegales()

  const stats = useMemo(() => {
    let cumple = 0, noCumple = 0, parcial = 0, noEvaluados = 0
    vinculaciones.filter(v => v.estado === 'activo').forEach(v => {
      const last = getLastResultadoByVinculacion(v.id)
      if (!last) { noEvaluados++; return }
      if (last.estadoCumplimiento === 'cumple') cumple++
      else if (last.estadoCumplimiento === 'no_cumple') noCumple++
      else parcial++
    })
    const totalEvaluados = cumple + noCumple + parcial
    return { totalEvaluados, cumple, noCumple, parcial, noEvaluados }
  }, [vinculaciones, getLastResultadoByVinculacion])

  // Chart: % by UC
  const ucChartData = useMemo(() => {
    return unidadesControl.map(uc => {
      const ucVinculaciones = getVinculacionesByUC(uc.id).filter(v => v.estado === 'activo')
      const total = ucVinculaciones.length
      let cumple = 0, noCumple = 0, parcial = 0
      ucVinculaciones.forEach(v => {
        const last = getLastResultadoByVinculacion(v.id)
        if (!last) return
        if (last.estadoCumplimiento === 'cumple') cumple++
        else if (last.estadoCumplimiento === 'no_cumple') noCumple++
        else parcial++
      })
      return {
        name: uc.nombre.length > 15 ? uc.nombre.slice(0, 15) + '...' : uc.nombre,
        Cumple: total > 0 ? Math.round((cumple / total) * 100) : 0,
        'No cumple': total > 0 ? Math.round((noCumple / total) * 100) : 0,
        'Parcial': total > 0 ? Math.round((parcial / total) * 100) : 0,
      }
    })
  }, [unidadesControl, getVinculacionesByUC, getLastResultadoByVinculacion])

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Resumen de Evaluacion</h3>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Card>
          <CardContent className="p-3 text-center">
            <div className="text-xl font-bold text-foreground">{stats.totalEvaluados}</div>
            <div className="text-xs text-muted-foreground">Total evaluados</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <div className="text-xl font-bold text-success">{stats.cumple}</div>
            <div className="text-xs text-muted-foreground">Cumple</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <div className="text-xl font-bold text-destructive">{stats.noCumple}</div>
            <div className="text-xs text-muted-foreground">No cumple</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <div className="text-xl font-bold text-warning-foreground">{stats.parcial}</div>
            <div className="text-xs text-muted-foreground">Cumple parcial</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <div className="text-xl font-bold text-muted-foreground">{stats.noEvaluados}</div>
            <div className="text-xs text-muted-foreground">No evaluados</div>
          </CardContent>
        </Card>
      </div>
      {ucChartData.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Cumplimiento por Unidad de Control (%)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ucChartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} domain={[0, 100]} />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: 'var(--foreground)',
                    }}
                  />
                  <Bar dataKey="Cumple" fill="var(--success)" radius={[2, 2, 0, 0]} barSize={16} />
                  <Bar dataKey="No cumple" fill="var(--destructive)" radius={[2, 2, 0, 0]} barSize={16} />
                  <Bar dataKey="Parcial" fill="var(--warning)" radius={[2, 2, 0, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-success" /> Cumple</div>
              <div className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-destructive" /> No cumple</div>
              <div className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-warning" /> Parcial</div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// --- Create/Edit Evaluacion Modal (req #8 - bigger, cards, grouped, search, filters) ---

function CreateEvaluacionModal({
  open,
  onOpenChange,
  editEvaluacion,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  editEvaluacion?: EvaluacionRL | null
}) {
  const { decretos, unidadesControl, addEvaluacion, updateEvaluacion, addActividad } = useRequisitosLegales()

  const [nombre, setNombre] = useState('')
  const [selectedArticuloIds, setSelectedArticuloIds] = useState<string[]>([])
  const [selectedUcIds, setSelectedUcIds] = useState<string[]>([])
  const [artSearch, setArtSearch] = useState('')
  const [ucSearch, setUcSearch] = useState('')
  const [expandedDecretos, setExpandedDecretos] = useState<Record<string, boolean>>({})

  React.useEffect(() => {
    if (open) {
      setNombre(editEvaluacion?.nombre || '')
      setSelectedArticuloIds(editEvaluacion?.articuloIds || [])
      setSelectedUcIds(editEvaluacion?.unidadControlIds || [])
      setArtSearch('')
      setUcSearch('')
      // Expand all decretos by default
      const expanded: Record<string, boolean> = {}
      decretos.forEach(d => { expanded[d.id] = true })
      setExpandedDecretos(expanded)
    }
  }, [open, editEvaluacion, decretos])

  const toggleArticulo = (id: string) => {
    setSelectedArticuloIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const toggleUc = (id: string) => {
    setSelectedUcIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const filteredDecretos = useMemo(() => {
    if (!artSearch) return decretos
    const q = artSearch.toLowerCase()
    return decretos.map(d => ({
      ...d,
      articulos: d.articulos.filter(a =>
        a.numero.toLowerCase().includes(q) || a.contenido.toLowerCase().includes(q) || d.nombre.toLowerCase().includes(q)
      ),
    })).filter(d => d.articulos.length > 0)
  }, [decretos, artSearch])

  const filteredUcs = useMemo(() => {
    if (!ucSearch) return unidadesControl
    const q = ucSearch.toLowerCase()
    return unidadesControl.filter(uc => uc.nombre.toLowerCase().includes(q) || uc.tipo.toLowerCase().includes(q))
  }, [unidadesControl, ucSearch])

  const handleSubmit = () => {
    if (!nombre.trim()) {
      toast.error('Ingresa un nombre para la evaluacion')
      return
    }

    const now = new Date().toISOString().split('T')[0]

    if (editEvaluacion) {
      updateEvaluacion(editEvaluacion.id, {
        nombre: nombre.trim(),
        articuloIds: selectedArticuloIds,
        unidadControlIds: selectedUcIds,
      })
      toast.success('Evaluacion actualizada')
    } else {
      const evalId = `eval-${Date.now()}`
      addEvaluacion({
        id: evalId,
        nombre: nombre.trim(),
        articuloIds: selectedArticuloIds,
        unidadControlIds: selectedUcIds,
        fechaCreacion: now,
      })
      addActividad({
        id: `act-${Date.now()}`,
        evaluacionId: evalId,
        tipo: 'evaluacion',
        descripcion: `Evaluacion creada: ${nombre.trim()}`,
        fecha: now,
        usuarioId: 'u1',
      })
      toast.success('Evaluacion creada')
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* req #8: Bigger modal */}
      <DialogContent className="max-w-3xl max-h-[90vh] p-0 flex flex-col overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-0 shrink-0">
          <DialogTitle className="text-base">{editEvaluacion ? 'Editar Evaluacion' : 'Nueva Evaluacion'}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-6">
          <div className="space-y-5 py-4">
            {/* Name */}
            <div className="space-y-2">
              <Label className="text-sm">Nombre de la Evaluacion <span className="text-destructive">*</span></Label>
              <Input
                placeholder="Ej: Evaluacion Q1 2026 - Planta"
                value={nombre}
                onChange={e => setNombre(e.target.value)}
              />
            </div>

            {/* req #8: Articulos as cards grouped by decreto, with search and filters */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Filtrar por Articulos</Label>
                <span className="text-xs text-muted-foreground">{selectedArticuloIds.length === 0 ? 'Todos' : `${selectedArticuloIds.length} seleccionados`}</span>
              </div>
              <p className="text-xs text-muted-foreground">Deja vacio para incluir todos los articulos vinculados.</p>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar articulos..."
                  value={artSearch}
                  onChange={e => setArtSearch(e.target.value)}
                  className="pl-9 h-8 text-xs"
                />
              </div>
              <ScrollArea className="h-60 rounded-lg border border-border">
                <div className="p-3 space-y-3">
                  {filteredDecretos.map(decreto => {
                    const isExpanded = expandedDecretos[decreto.id] !== false
                    const selectedCount = decreto.articulos.filter(a => selectedArticuloIds.includes(a.id)).length
                    return (
                      <div key={decreto.id} className="rounded-lg border border-border overflow-hidden">
                        <div
                          className="flex items-center gap-2 px-3 py-2 bg-muted/40 cursor-pointer hover:bg-muted/60 transition-colors"
                          onClick={() => setExpandedDecretos(prev => ({ ...prev, [decreto.id]: !prev[decreto.id] }))}
                        >
                          {isExpanded ? <ChevronDown className="h-3 w-3 text-muted-foreground" /> : <ChevronRight className="h-3 w-3 text-muted-foreground" />}
                          <span className="text-xs font-medium text-foreground flex-1">{decreto.nombre}</span>
                          {selectedCount > 0 && <Badge variant="secondary" className="text-[10px]">{selectedCount}</Badge>}
                        </div>
                        {isExpanded && (
                          <div className="p-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {decreto.articulos.map(art => {
                              const isSelected = selectedArticuloIds.includes(art.id)
                              return (
                                <div
                                  key={art.id}
                                  className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                                    isSelected
                                      ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                                      : 'border-border hover:border-primary/40'
                                  }`}
                                  onClick={() => toggleArticulo(art.id)}
                                >
                                  <div className="flex items-start gap-2">
                                    <Checkbox checked={isSelected} className="mt-0.5 shrink-0" />
                                    <div className="min-w-0">
                                      <p className="text-xs font-medium text-foreground">{art.numero}</p>
                                      <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{art.contenido}</p>
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )
                  })}
                  {filteredDecretos.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-4">Sin articulos que coincidan</p>
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* UCs filter with search */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Filtrar por Unidades de Control</Label>
                <span className="text-xs text-muted-foreground">{selectedUcIds.length === 0 ? 'Todas' : `${selectedUcIds.length} seleccionadas`}</span>
              </div>
              <p className="text-xs text-muted-foreground">Deja vacio para incluir todas las unidades vinculadas.</p>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar unidades..."
                  value={ucSearch}
                  onChange={e => setUcSearch(e.target.value)}
                  className="pl-9 h-8 text-xs"
                />
              </div>
              <div className="space-y-1.5">
                {filteredUcs.map(uc => (
                  <div
                    key={uc.id}
                    className="flex items-center gap-2 rounded-lg border border-border p-2.5 hover:bg-muted/30 cursor-pointer"
                    onClick={() => toggleUc(uc.id)}
                  >
                    <Checkbox checked={selectedUcIds.includes(uc.id)} className="shrink-0" />
                    <div>
                      <span className="text-xs font-medium text-foreground">{uc.nombre}</span>
                      <span className="text-xs text-muted-foreground ml-1.5">({uc.tipo})</span>
                    </div>
                  </div>
                ))}
                {filteredUcs.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-4">Sin resultados</p>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="shrink-0 flex justify-end gap-2 px-6 py-4 border-t border-border">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit}>{editEvaluacion ? 'Guardar cambios' : 'Crear Evaluacion'}</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// --- Evaluate single vinculacion Modal (req #6: remove evaluador field) ---

function EvaluarVinculacionModal({
  vinculacion,
  evaluacionId,
  open,
  onOpenChange,
}: {
  vinculacion: VinculacionNormativa | null
  evaluacionId: string
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const {
    getArticulo, getUnidadControl,
    addResultado, addHallazgo, addActividad,
  } = useRequisitosLegales()

  const [estadoCumplimiento, setEstadoCumplimiento] = useState<CumplimientoEstado>('cumple')
  const [fechaEvaluacion, setFechaEvaluacion] = useState(new Date().toISOString().split('T')[0])
  const [comentarios, setComentarios] = useState('')
  const [evidencia, setEvidencia] = useState('')

  // req #6: Evaluador is automatically the logged-in user (u1)
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

  const handleSubmit = () => {
    const resId = `res-${Date.now()}`

    addResultado({
      id: resId,
      evaluacionId,
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
      evaluacionId,
      tipo: 'evaluacion',
      descripcion: `Evaluacion realizada: ${CUMPLIMIENTO_ESTADO_LABELS[estadoCumplimiento]} - ${artData?.decreto.nombre} ${artData?.articulo.numero} / ${unidad?.nombre}`,
      fecha: fechaEvaluacion,
      usuarioId: evaluadorId,
    })

    if (estadoCumplimiento === 'no_cumple') {
      const hallazgoId = `h-${Date.now()}`
      addHallazgo({
        id: hallazgoId,
        vinculacionId: vinculacion.id,
        resultadoEvaluacionId: resId,
        evaluacionId,
        descripcion: comentarios || `Hallazgo generado automaticamente - ${artData?.decreto.nombre} ${artData?.articulo.numero || ''} (${unidad?.nombre})`,
        estado: 'abierto',
        fechaCreacion: fechaEvaluacion,
      })
      addActividad({
        id: `act-${Date.now() + 1}`,
        vinculacionId: vinculacion.id,
        tipo: 'hallazgo_creado',
        descripcion: `Hallazgo generado: ${artData?.decreto.nombre} ${artData?.articulo.numero} / ${unidad?.nombre}`,
        fecha: fechaEvaluacion,
        usuarioId: evaluadorId,
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
          <DialogTitle className="text-base">Evaluar Vinculacion</DialogTitle>
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
                  <p className="text-xs text-destructive leading-relaxed">Se generara un hallazgo automaticamente al registrar esta evaluacion.</p>
                </div>
              )}
            </div>

            {/* Fecha */}
            <div className="space-y-2">
              <Label className="text-sm">Fecha de Evaluacion</Label>
              <Input type="date" value={fechaEvaluacion} onChange={e => setFechaEvaluacion(e.target.value)} />
            </div>

            {/* req #6: Evaluador field REMOVED - automatically uses logged-in user */}

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

// --- Evaluacion Detail View (req #7: two types + req #10: search/filters/columns) ---

function EvaluacionDetailView({
  evaluacion,
  onBack,
}: {
  evaluacion: EvaluacionRL
  onBack: () => void
}) {
  const {
    getArticulo, getUnidadControl, getUsuario,
    getVinculacionesForEvaluacion, getResultadosByEvaluacion,
    getLastResultadoByVinculacion, addResultado, addHallazgo, addActividad,
  } = useRequisitosLegales()

  const [searchQuery, setSearchQuery] = useState('')
  const [evaluarVinculacion, setEvaluarVinculacion] = useState<VinculacionNormativa | null>(null)

  // req #7: Evaluation type toggle
  const [evalType, setEvalType] = useState<'completa' | 'percepcion'>('completa')

  // req #10: Filters
  const [filterAtributo, setFilterAtributo] = useState<string>('all')
  const [filterCriticidad, setFilterCriticidad] = useState<string>('all')

  // Perception mode inline states
  const [percepcionComentarios, setPercepcionComentarios] = useState<Record<string, string>>({})
  const [percepcionShowComment, setPercepcionShowComment] = useState<Record<string, boolean>>({})

  const vinculaciones = getVinculacionesForEvaluacion(evaluacion)
  const thisEvalResultados = getResultadosByEvaluacion(evaluacion.id)

  const filtered = useMemo(() => {
    return vinculaciones.filter(v => {
      if (filterAtributo !== 'all' && v.atributo !== filterAtributo) return false
      if (filterCriticidad !== 'all' && v.criticidad !== filterCriticidad) return false
      if (searchQuery) {
        const artData = getArticulo(v.articuloId)
        const uc = getUnidadControl(v.unidadControlId)
        const text = `${artData?.decreto.nombre} ${artData?.articulo.numero} ${uc?.nombre}`.toLowerCase()
        if (!text.includes(searchQuery.toLowerCase())) return false
      }
      return true
    })
  }, [vinculaciones, searchQuery, filterAtributo, filterCriticidad, getArticulo, getUnidadControl])

  // Stats for this evaluation
  const evaluated = thisEvalResultados.length
  const cumple = thisEvalResultados.filter(r => r.estadoCumplimiento === 'cumple').length
  const noCumple = thisEvalResultados.filter(r => r.estadoCumplimiento === 'no_cumple').length
  const parcial = thisEvalResultados.filter(r => r.estadoCumplimiento === 'parcial').length

  // req #7: Perception mode - inline evaluation
  const handlePercepcionEval = (v: VinculacionNormativa, estado: CumplimientoEstado) => {
    const artData = getArticulo(v.articuloId)
    const unidad = getUnidadControl(v.unidadControlId)
    const resId = `res-${Date.now()}-${v.id}`
    const evaluadorId = 'u1'
    const now = new Date().toISOString().split('T')[0]
    const comment = percepcionComentarios[v.id] || ''

    addResultado({
      id: resId,
      evaluacionId: evaluacion.id,
      vinculacionId: v.id,
      estadoCumplimiento: estado,
      fechaEvaluacion: now,
      comentarios: comment || undefined,
      evaluadorId,
    })

    addActividad({
      id: `act-${Date.now()}`,
      vinculacionId: v.id,
      evaluacionId: evaluacion.id,
      tipo: 'evaluacion',
      descripcion: `Evaluacion por percepcion: ${CUMPLIMIENTO_ESTADO_LABELS[estado]} - ${artData?.decreto.nombre} ${artData?.articulo.numero} / ${unidad?.nombre}`,
      fecha: now,
      usuarioId: evaluadorId,
    })

    if (estado === 'no_cumple') {
      addHallazgo({
        id: `h-${Date.now()}`,
        vinculacionId: v.id,
        resultadoEvaluacionId: resId,
        evaluacionId: evaluacion.id,
        descripcion: comment || `Hallazgo por percepcion - ${artData?.decreto.nombre} ${artData?.articulo.numero} (${unidad?.nombre})`,
        estado: 'abierto',
        fechaCreacion: now,
      })
    }

    // Clear comment after save
    setPercepcionComentarios(prev => ({ ...prev, [v.id]: '' }))
    setPercepcionShowComment(prev => ({ ...prev, [v.id]: false }))
    toast.success('Evaluacion guardada')
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h3 className="text-base font-semibold text-foreground">{evaluacion.nombre}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Creada: {new Date(evaluacion.fechaCreacion).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Card>
          <CardContent className="p-3 text-center">
            <div className="text-lg font-bold text-foreground">{vinculaciones.length}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <div className="text-lg font-bold text-foreground">{evaluated}</div>
            <div className="text-xs text-muted-foreground">Evaluados</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <div className="text-lg font-bold text-success">{cumple}</div>
            <div className="text-xs text-muted-foreground">Cumple</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <div className="text-lg font-bold text-destructive">{noCumple}</div>
            <div className="text-xs text-muted-foreground">No cumple</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <div className="text-lg font-bold text-warning-foreground">{parcial}</div>
            <div className="text-xs text-muted-foreground">Parcial</div>
          </CardContent>
        </Card>
      </div>

      {/* req #7: Evaluation type toggle */}
      <div className="flex items-center gap-2">
        <Button
          variant={evalType === 'completa' ? 'default' : 'outline'}
          size="sm"
          className="h-8 text-xs gap-1.5"
          onClick={() => setEvalType('completa')}
        >
          <ClipboardCheck className="h-3.5 w-3.5" />
          Evaluacion Completa
        </Button>
        <Button
          variant={evalType === 'percepcion' ? 'default' : 'outline'}
          size="sm"
          className="h-8 text-xs gap-1.5"
          onClick={() => setEvalType('percepcion')}
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          Evaluacion por Percepcion
        </Button>
      </div>

      {/* req #10: Search + Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar vinculaciones..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterAtributo} onValueChange={setFilterAtributo}>
          <SelectTrigger className="h-9 text-xs w-[140px]"><SelectValue placeholder="Atributo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos atributos</SelectItem>
            <SelectItem value="permiso">Permiso</SelectItem>
            <SelectItem value="monitoreo">Monitoreo</SelectItem>
            <SelectItem value="reporte">Reporte</SelectItem>
            <SelectItem value="otros">Otros</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterCriticidad} onValueChange={setFilterCriticidad}>
          <SelectTrigger className="h-9 text-xs w-[130px]"><SelectValue placeholder="Criticidad" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toda criticidad</SelectItem>
            <SelectItem value="alta">Alta</SelectItem>
            <SelectItem value="media">Media</SelectItem>
            <SelectItem value="baja">Baja</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table or Perception mode */}
      {evalType === 'completa' ? (
        // Evaluacion Completa - table with extra columns (req #10)
        <div className="rounded-lg border border-border overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50">
                <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">Articulo</th>
                <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">Unidad de Control</th>
                {/* req #10: Atributo column */}
                <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">Atributo</th>
                {/* req #10: Criticidad column */}
                <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">Criticidad</th>
                <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">Ultimo Estado</th>
                <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">Esta Eval.</th>
                <th className="px-3 py-2.5 w-20" />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-12 text-center text-sm text-muted-foreground">
                    No se encontraron vinculaciones en esta evaluacion.
                  </td>
                </tr>
              ) : filtered.map(v => {
                const artData = getArticulo(v.articuloId)
                const uc = getUnidadControl(v.unidadControlId)
                const lastResult = getLastResultadoByVinculacion(v.id)
                const thisEvalResult = thisEvalResultados.find(r => r.vinculacionId === v.id)

                return (
                  <tr key={v.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                    <td className="px-3 py-2.5">
                      <div>
                        <p className="text-xs font-medium text-foreground">{artData?.decreto.nombre}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{artData?.articulo.numero}</p>
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="h-3 w-3 text-muted-foreground shrink-0" />
                        <span className="text-xs text-foreground">{uc?.nombre}</span>
                      </div>
                    </td>
                    {/* req #10: Atributo */}
                    <td className="px-3 py-2.5">
                      <Badge variant="secondary" className="text-[10px]">{ATRIBUTO_LABELS[v.atributo]}</Badge>
                    </td>
                    {/* req #10: Criticidad */}
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
                        <Badge variant="outline" className={`text-[10px] ${cumplimientoColor(lastResult.estadoCumplimiento)}`}>
                          {CUMPLIMIENTO_ESTADO_LABELS[lastResult.estadoCumplimiento]}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground/50">--</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      {thisEvalResult ? (
                        <Badge variant="outline" className={`text-[10px] ${cumplimientoColor(thisEvalResult.estadoCumplimiento)}`}>
                          {CUMPLIMIENTO_ESTADO_LABELS[thisEvalResult.estadoCumplimiento]}
                        </Badge>
                      ) : (
                        /* req #9: "No evaluados" instead of "Pendientes" */
                        <Badge variant="outline" className="text-[10px] bg-muted text-muted-foreground border-border">No evaluado</Badge>
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      <Button
                        size="sm"
                        variant={thisEvalResult ? 'outline' : 'default'}
                        className="h-7 text-xs gap-1"
                        onClick={() => setEvaluarVinculacion(v)}
                      >
                        <ClipboardCheck className="h-3 w-3" />
                        {thisEvalResult ? 'Re-evaluar' : 'Evaluar'}
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        // req #7: Evaluacion por Percepcion - inline buttons
        <div className="space-y-2">
          {filtered.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-border bg-muted/30 px-6 py-12 text-center">
              <p className="text-sm text-muted-foreground">No se encontraron vinculaciones.</p>
            </div>
          ) : filtered.map(v => {
            const artData = getArticulo(v.articuloId)
            const uc = getUnidadControl(v.unidadControlId)
            const thisEvalResult = thisEvalResultados.find(r => r.vinculacionId === v.id)
            const showComment = percepcionShowComment[v.id]

            return (
              <Card key={v.id} className={thisEvalResult ? 'opacity-60' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-xs font-medium text-foreground">{artData?.decreto.nombre}</p>
                        <Badge variant="secondary" className="text-[10px]">{artData?.articulo.numero}</Badge>
                        <Badge variant="outline" className="text-[10px]">{ATRIBUTO_LABELS[v.atributo]}</Badge>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Building2 className="h-3 w-3 text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground">{uc?.nombre}</span>
                      </div>
                      {thisEvalResult && (
                        <div className="mt-2">
                          <Badge variant="outline" className={`text-[10px] ${cumplimientoColor(thisEvalResult.estadoCumplimiento)}`}>
                            {CUMPLIMIENTO_ESTADO_LABELS[thisEvalResult.estadoCumplimiento]} (evaluado)
                          </Badge>
                        </div>
                      )}
                    </div>
                    {/* Inline action buttons */}
                    {!thisEvalResult && (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs gap-1 border-success/40 text-success hover:bg-success/10 hover:text-success"
                          onClick={() => handlePercepcionEval(v, 'cumple')}
                        >
                          <CheckCircle2 className="h-3 w-3" /> Cumple
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs gap-1 border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => handlePercepcionEval(v, 'no_cumple')}
                        >
                          <XCircle className="h-3 w-3" /> No cumple
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs gap-1 border-warning/40 text-warning-foreground hover:bg-warning/10 hover:text-warning-foreground"
                          onClick={() => handlePercepcionEval(v, 'parcial')}
                        >
                          <AlertCircle className="h-3 w-3" /> Parcial
                        </Button>
                        {/* Optional: comment toggle */}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0"
                          onClick={() => setPercepcionShowComment(prev => ({ ...prev, [v.id]: !prev[v.id] }))}
                          title="Agregar comentario"
                        >
                          <MessageSquare className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                  {/* Optional comment input */}
                  {showComment && !thisEvalResult && (
                    <div className="mt-3">
                      <Input
                        placeholder="Comentario opcional..."
                        value={percepcionComentarios[v.id] || ''}
                        onChange={e => setPercepcionComentarios(prev => ({ ...prev, [v.id]: e.target.value }))}
                        className="h-8 text-xs"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Evaluar modal (for completa mode) */}
      <EvaluarVinculacionModal
        vinculacion={evaluarVinculacion}
        evaluacionId={evaluacion.id}
        open={!!evaluarVinculacion}
        onOpenChange={(v) => !v && setEvaluarVinculacion(null)}
      />
    </div>
  )
}

// --- Main View ---

export function EvaluacionView() {
  const {
    evaluaciones, getResultadosByEvaluacion, getVinculacionesForEvaluacion,
    getHallazgosByEvaluacion,
  } = useRequisitosLegales()

  const [searchQuery, setSearchQuery] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [editEvaluacion, setEditEvaluacion] = useState<EvaluacionRL | null>(null)
  const [selectedEvaluacion, setSelectedEvaluacion] = useState<EvaluacionRL | null>(null)

  const filtered = useMemo(() => {
    if (!searchQuery) return evaluaciones
    return evaluaciones.filter(e =>
      e.nombre.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [evaluaciones, searchQuery])

  if (selectedEvaluacion) {
    return (
      <EvaluacionDetailView
        evaluacion={selectedEvaluacion}
        onBack={() => setSelectedEvaluacion(null)}
      />
    )
  }

  return (
    <div className="space-y-5">
      {/* Mini Dashboard (req #2) */}
      <EvaluacionMiniDashboard />

      <div className="border-t border-border" />

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar evaluaciones..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Button className="h-9 gap-1.5" onClick={() => { setEditEvaluacion(null); setCreateOpen(true) }}>
          <Plus className="h-4 w-4" /> Nueva Evaluacion
        </Button>
      </div>

      {/* Evaluaciones list */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-border bg-muted/30 px-6 py-16 text-center">
          <ClipboardCheck className="h-10 w-10 text-muted-foreground/50 mx-auto" />
          <p className="mt-3 text-sm font-medium text-muted-foreground">Sin evaluaciones</p>
          <p className="text-xs text-muted-foreground/70 mt-1">Crea una nueva evaluacion para comenzar</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(evaluacion => {
            const vinculaciones = getVinculacionesForEvaluacion(evaluacion)
            const resultados = getResultadosByEvaluacion(evaluacion.id)
            const hallazgos = getHallazgosByEvaluacion(evaluacion.id)
            const cumple = resultados.filter(r => r.estadoCumplimiento === 'cumple').length
            const noCumple = resultados.filter(r => r.estadoCumplimiento === 'no_cumple').length
            const parcial = resultados.filter(r => r.estadoCumplimiento === 'parcial').length
            const noEvaluados = vinculaciones.length - resultados.length

            const progressPct = vinculaciones.length > 0
              ? Math.round((resultados.length / vinculaciones.length) * 100) : 0

            return (
              <Card
                key={evaluacion.id}
                className="cursor-pointer hover:border-primary/40 transition-all"
                onClick={() => setSelectedEvaluacion(evaluacion)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-semibold text-foreground truncate">{evaluacion.nombre}</h4>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {new Date(evaluacion.fechaCreacion).toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={(e) => { e.stopPropagation(); setEditEvaluacion(evaluacion); setCreateOpen(true) }}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1">
                    <Badge variant="secondary" className="text-[10px]">
                      {evaluacion.articuloIds.length === 0 ? 'Todos los articulos' : `${evaluacion.articuloIds.length} articulos`}
                    </Badge>
                    <Badge variant="secondary" className="text-[10px]">
                      {evaluacion.unidadControlIds.length === 0 ? 'Todas las UCs' : `${evaluacion.unidadControlIds.length} UCs`}
                    </Badge>
                  </div>

                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Progreso</span>
                      <span className="text-foreground font-medium">{resultados.length}/{vinculaciones.length}</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progressPct}%` }} />
                    </div>
                  </div>

                  {/* req #9: "No evaluados" instead of "pendientes" */}
                  <div className="mt-3 flex items-center gap-3 text-xs">
                    {cumple > 0 && <span className="text-success font-medium">{cumple} cumple</span>}
                    {noCumple > 0 && <span className="text-destructive font-medium">{noCumple} no cumple</span>}
                    {parcial > 0 && <span className="text-warning-foreground font-medium">{parcial} parcial</span>}
                    {noEvaluados > 0 && <span className="text-muted-foreground">{noEvaluados} no evaluados</span>}
                  </div>

                  {hallazgos.length > 0 && (
                    <div className="mt-2 flex items-center gap-1.5">
                      <AlertTriangle className="h-3 w-3 text-destructive" />
                      <span className="text-xs text-destructive">{hallazgos.filter(h => h.estado === 'abierto').length} hallazgos abiertos</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Create/Edit modal */}
      <CreateEvaluacionModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        editEvaluacion={editEvaluacion}
      />
    </div>
  )
}
