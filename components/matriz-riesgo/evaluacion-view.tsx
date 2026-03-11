'use client'

import React, { useState, useMemo } from 'react'
import { useMatrizRiesgo } from '@/lib/matriz-riesgo/context'
import {
  getNivelRiesgoColor, getNivelRiesgoLabel, calcularVEPPost,
  type FilaIPER, type MedidaPreventiva,
} from '@/lib/matriz-riesgo/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import {
  Search, Filter, X, AlertTriangle, Plus, Pencil, Eye,
  ShieldCheck, ClipboardList, ChevronRight, CheckCircle2,
} from 'lucide-react'

// --- Helpers ---
function NivelBadge({ nivel, params }: { nivel: number; params?: { id: string; nombre: string; valor?: number; color?: string }[] }) {
  const color = getNivelRiesgoColor(nivel, params)
  const label = getNivelRiesgoLabel(nivel, params)
  const colorMap: Record<string, string> = {
    success: 'bg-success/15 text-success border-success/30',
    warning: 'bg-warning/15 text-warning-foreground border-warning/30',
    'chart-5': 'bg-chart-5/15 text-chart-5 border-chart-5/30',
    destructive: 'bg-destructive/15 text-destructive border-destructive/30',
  }
  return <Badge variant="outline" className={`text-xs ${colorMap[color] || ''}`}>{nivel} - {label}</Badge>
}

// --- Add/Edit Medida Modal ---
function MedidaModal({
  open,
  onOpenChange,
  filaIPER,
  existingMedida,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  filaIPER: FilaIPER | null
  existingMedida?: MedidaPreventiva | null
}) {
  const {
    parametros, addMedida, updateMedida, updateFilaIPER, addHistorial, usuarios,
    getProceso, getTarea, getParametro,
  } = useMatrizRiesgo()

  const [descripcion, setDescripcion] = useState('')
  const [familiaControlId, setFamiliaControlId] = useState('')
  const [verificadorId, setVerificadorId] = useState('')
  const [calidadControlId, setCalidadControlId] = useState('')
  const [ordenPrelacionId, setOrdenPrelacionId] = useState('')

  React.useEffect(() => {
    if (open) {
      setDescripcion(existingMedida?.descripcion || '')
      setFamiliaControlId(existingMedida?.familiaControlId || '')
      setVerificadorId(existingMedida?.verificadorId || '')
      setCalidadControlId(existingMedida?.calidadControlId || '')
      setOrdenPrelacionId(existingMedida?.ordenPrelacionId || '')
    }
  }, [open, existingMedida])

  const proceso = filaIPER ? getProceso(filaIPER.procesoId) : null
  const tarea = filaIPER ? getTarea(filaIPER.tareaId) : null
  const peligro = filaIPER ? getParametro('peligros', filaIPER.peligroId) : null
  const riesgo = filaIPER ? getParametro('riesgos_especificos', filaIPER.riesgoEspecificoId) : null

  // Calculate VEP Post preview
  const calidadControl = parametros.calidad_control.find(c => c.id === calidadControlId)
  const ordenPrelacion = parametros.orden_prelacion.find(o => o.id === ordenPrelacionId)
  const maxCalidad = Math.max(...parametros.calidad_control.map(c => c.valor || 0), 1)
  const maxPrelacion = Math.max(...parametros.orden_prelacion.map(o => o.valor || 0), 1)
  const vepPostPreview = filaIPER && calidadControl && ordenPrelacion
    ? calcularVEPPost(filaIPER.vepInicial, calidadControl.valor || 1, ordenPrelacion.valor || 1, maxCalidad, maxPrelacion)
    : filaIPER?.vepInicial || 0

  const canSubmit = descripcion.trim() && familiaControlId && verificadorId && calidadControlId && ordenPrelacionId

  const handleSubmit = () => {
    if (!canSubmit || !filaIPER) {
      toast.error('Completa todos los campos obligatorios')
      return
    }

    const now = new Date().toISOString().split('T')[0]

    if (existingMedida) {
      updateMedida(existingMedida.id, {
        descripcion: descripcion.trim(),
        familiaControlId,
        verificadorId,
        calidadControlId,
        ordenPrelacionId,
      })
      // Recalculate VEP Post
      updateFilaIPER(filaIPER.id, { vepPost: vepPostPreview })
      toast.success('Medida preventiva actualizada')
    } else {
      const medidaId = `med-${Date.now()}`
      addMedida({
        id: medidaId,
        filaIPERId: filaIPER.id,
        descripcion: descripcion.trim(),
        familiaControlId,
        verificadorId,
        calidadControlId,
        ordenPrelacionId,
        fechaCreacion: now,
      })
      // Update VEP Post on the fila
      updateFilaIPER(filaIPER.id, { vepPost: vepPostPreview })
      addHistorial({
        id: `h-${Date.now()}`,
        tipo: 'medida_creada',
        descripcion: `Medida preventiva registrada: ${descripcion.trim().slice(0, 50)}...`,
        fecha: now,
        usuarioId: usuarios[0]?.id || '',
        filaIPERId: filaIPER.id,
      })
      toast.success('Medida preventiva creada')
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] p-0 flex flex-col overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border shrink-0">
          <DialogTitle className="text-base flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            {existingMedida ? 'Editar' : 'Agregar'} Medida Preventiva
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6 py-4">
          <div className="space-y-4">
            {/* Context */}
            {filaIPER && (
              <Card className="bg-muted/30">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    <Badge variant="outline" className="bg-chart-2/10 text-chart-2 border-chart-2/20">{proceso?.nombre}</Badge>
                    <ChevronRight className="h-3 w-3 text-muted-foreground" />
                    <span className="text-foreground">{tarea?.nombre}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-xs">
                    <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">{peligro?.nombre}</Badge>
                    <span className="text-muted-foreground">{riesgo?.nombre}</span>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs">
                    <span className="text-muted-foreground">VEP Inicial: <span className="font-semibold text-foreground">{filaIPER.vepInicial}</span></span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Description */}
            <div className="space-y-2">
              <Label className="text-sm">Medida preventiva <span className="text-destructive">*</span></Label>
              <Textarea
                value={descripcion}
                onChange={e => setDescripcion(e.target.value)}
                placeholder="Descripcion de la medida preventiva..."
                rows={3}
              />
            </div>

            {/* Familia de Control */}
            <div className="space-y-2">
              <Label className="text-sm">Familia de control <span className="text-destructive">*</span></Label>
              <Select value={familiaControlId} onValueChange={setFamiliaControlId}>
                <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                <SelectContent>
                  {parametros.familias_control.map(f => (
                    <SelectItem key={f.id} value={f.id}>{f.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Verificador */}
            <div className="space-y-2">
              <Label className="text-sm">Verificador <span className="text-destructive">*</span></Label>
              <Select value={verificadorId} onValueChange={setVerificadorId}>
                <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                <SelectContent>
                  {parametros.verificadores.map(v => (
                    <SelectItem key={v.id} value={v.id}>{v.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Calidad de Control */}
            <div className="space-y-2">
              <Label className="text-sm">Calidad de control <span className="text-destructive">*</span></Label>
              <Select value={calidadControlId} onValueChange={setCalidadControlId}>
                <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                <SelectContent>
                  {parametros.calidad_control.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.nombre} ({c.valor})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Orden de Prelacion */}
            <div className="space-y-2">
              <Label className="text-sm">Orden de prelacion <span className="text-destructive">*</span></Label>
              <Select value={ordenPrelacionId} onValueChange={setOrdenPrelacionId}>
                <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                <SelectContent>
                  {parametros.orden_prelacion.map(o => (
                    <SelectItem key={o.id} value={o.id}>{o.nombre} ({o.valor})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* VEP Post preview */}
            {calidadControlId && ordenPrelacionId && filaIPER && (
              <Card className="border-2 border-success/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">VEP Post (calculado)</p>
                      <p className="text-2xl font-bold text-success">{vepPostPreview}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Reduccion</p>
                      <p className="text-sm font-semibold text-foreground">
                        {filaIPER.vepInicial - vepPostPreview} puntos ({Math.round((1 - vepPostPreview / filaIPER.vepInicial) * 100)}%)
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>

        <div className="shrink-0 flex justify-end gap-2 px-6 py-4 border-t border-border">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            {existingMedida ? 'Guardar Cambios' : 'Agregar Medida'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// --- Detail Modal ---
function DetalleModal({
  open,
  onOpenChange,
  filaId,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  filaId: string | null
}) {
  const {
    parametros, getFilaIPER, getProceso, getTarea, getParametro, getUnidadControl,
    getMedidasByFila, getVerificacionesByFila,
  } = useMatrizRiesgo()

  const fila = filaId ? getFilaIPER(filaId) : undefined
  const proceso = fila ? getProceso(fila.procesoId) : undefined
  const uc = proceso ? getUnidadControl(proceso.unidadControlId) : undefined
  const tarea = fila ? getTarea(fila.tareaId) : undefined
  const peligro = fila ? getParametro('peligros', fila.peligroId) : undefined
  const riesgo = fila ? getParametro('riesgos_especificos', fila.riesgoEspecificoId) : undefined
  const prob = fila ? parametros.probabilidad.find(p => p.id === fila.probabilidadId) : undefined
  const cons = fila ? parametros.consecuencia.find(c => c.id === fila.consecuenciaId) : undefined
  const filaMedidas = filaId ? getMedidasByFila(filaId) : []
  const filaVerificaciones = filaId ? getVerificacionesByFila(filaId) : []

  if (!fila) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 flex flex-col overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border shrink-0">
          <DialogTitle className="text-base flex items-center gap-2">
            <Eye className="h-4 w-4 text-primary" />
            Detalle de Evaluacion
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-1 px-6 py-5">
          <div className="space-y-6">
            {/* General info */}
            <section className="space-y-3">
              <h4 className="text-sm font-semibold text-foreground">Informacion General</h4>
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 rounded-lg border border-border p-4 bg-muted/30">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Unidad de Control</p>
                  <p className="text-sm text-foreground mt-0.5">{uc?.nombre || '-'}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Proceso</p>
                  <p className="text-sm text-foreground mt-0.5">{proceso?.nombre || '-'}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Tarea</p>
                  <p className="text-sm text-foreground mt-0.5">{tarea?.nombre || '-'}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Peligro</p>
                  <p className="text-sm text-destructive mt-0.5">{peligro?.nombre || '-'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Riesgo Especifico</p>
                  <p className="text-sm text-foreground mt-0.5">{riesgo?.nombre || '-'}</p>
                </div>
              </div>
            </section>

            {/* VEP */}
            <section className="space-y-3">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-chart-5" />
                Evaluacion de Riesgo
              </h4>
              <div className="rounded-lg border border-border p-4 bg-muted/30">
                <div className="flex items-center gap-6">
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Probabilidad</p>
                    <p className="text-sm font-medium text-foreground">{prob?.nombre || '-'} ({prob?.valor || '-'})</p>
                  </div>
                  <div className="text-muted-foreground font-bold text-lg">x</div>
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Consecuencia</p>
                    <p className="text-sm font-medium text-foreground">{cons?.nombre || '-'} ({cons?.valor || '-'})</p>
                  </div>
                  <div className="text-muted-foreground font-bold text-lg">=</div>
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">VEP Inicial</p>
                    <NivelBadge nivel={fila.vepInicial} params={parametros.nivel_riesgo} />
                  </div>
                </div>
                {fila.vepPost !== fila.vepInicial && (
                  <div className="mt-4 pt-4 border-t border-border flex items-center gap-4">
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">VEP Post</p>
                      <NivelBadge nivel={fila.vepPost} params={parametros.nivel_riesgo} />
                    </div>
                    <div className="text-sm text-success font-medium">
                      Reduccion: {fila.vepInicial - fila.vepPost} puntos
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Medidas */}
            <section className="space-y-3">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-success" />
                Medidas Preventivas
                {filaMedidas.length > 0 && <Badge variant="outline" className="text-[10px]">{filaMedidas.length}</Badge>}
              </h4>
              {filaMedidas.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border p-4">
                  <p className="text-xs text-muted-foreground italic text-center">No hay medidas preventivas registradas</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filaMedidas.map((med, idx) => {
                    const familia = getParametro('familias_control', med.familiaControlId)
                    const verificador = getParametro('verificadores', med.verificadorId)
                    const cc = getParametro('calidad_control', med.calidadControlId)
                    const op = getParametro('orden_prelacion', med.ordenPrelacionId)
                    return (
                      <div key={med.id} className="rounded-lg border border-border p-4 bg-muted/30 space-y-3">
                        <p className="text-sm text-foreground font-medium">{med.descripcion}</p>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
                          <div>
                            <span className="text-muted-foreground">Familia: </span>
                            <span className="text-foreground">{familia?.nombre}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Verificador: </span>
                            <span className="text-foreground">{verificador?.nombre}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Calidad: </span>
                            <span className="text-foreground">{cc?.nombre} ({cc?.valor})</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Prelacion: </span>
                            <span className="text-foreground">{op?.nombre} ({op?.valor})</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </section>

            {/* Verificaciones */}
            {filaVerificaciones.length > 0 && (
              <section className="space-y-3">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-chart-2" />
                  Verificaciones
                  <Badge variant="outline" className="text-[10px]">{filaVerificaciones.length}</Badge>
                </h4>
                <div className="space-y-2">
                  {filaVerificaciones
                    .sort((a, b) => new Date(b.fechaVerificacion).getTime() - new Date(a.fechaVerificacion).getTime())
                    .slice(0, 5)
                    .map(v => {
                      const ver = getParametro('verificadores', v.verificadorId)
                      return (
                        <div key={v.id} className="flex items-center gap-3 text-xs p-2 rounded bg-muted/30">
                          <span className="text-muted-foreground w-20 shrink-0">{v.fechaVerificacion}</span>
                          <Badge variant="outline" className={`text-[10px] ${v.cumple ? 'bg-success/15 text-success border-success/30' : 'bg-destructive/15 text-destructive border-destructive/30'}`}>
                            {v.cumple ? 'Cumple' : 'No Cumple'}
                          </Badge>
                          <span className="text-foreground">{ver?.nombre}</span>
                        </div>
                      )
                    })}
                </div>
              </section>
            )}
          </div>
        </ScrollArea>

        <div className="shrink-0 flex justify-end px-6 py-4 border-t border-border">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cerrar</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// --- Main View ---
export function EvaluacionView() {
  const {
    filasIPER, medidas, parametros, procesos,
    getProceso, getTarea, getParametro, getMedidasByFila,
  } = useMatrizRiesgo()

  const [searchQuery, setSearchQuery] = useState('')
  const [filterProceso, setFilterProceso] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [addMedidaFila, setAddMedidaFila] = useState<FilaIPER | null>(null)
  const [editMedida, setEditMedida] = useState<{ fila: FilaIPER; medida: MedidaPreventiva } | null>(null)
  const [detailFilaId, setDetailFilaId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    return filasIPER.filter(fila => {
      if (filterProceso !== 'all' && fila.procesoId !== filterProceso) return false
      if (searchQuery) {
        const proceso = getProceso(fila.procesoId)
        const tarea = getTarea(fila.tareaId)
        const peligro = getParametro('peligros', fila.peligroId)
        const text = `${proceso?.nombre} ${tarea?.nombre} ${peligro?.nombre}`.toLowerCase()
        if (!text.includes(searchQuery.toLowerCase())) return false
      }
      return true
    })
  }, [filasIPER, filterProceso, searchQuery, getProceso, getTarea, getParametro])

  // Stats
  const totalFilas = filasIPER.length
  const filasConMedida = filasIPER.filter(f => getMedidasByFila(f.id).length > 0).length
  const filasVerificadas = filasIPER.filter(f => f.estadoVerificacion === 'verificado').length

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ClipboardList className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Total Identificaciones</div>
              <div className="text-2xl font-bold text-foreground">{totalFilas}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10 text-success">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Con Medida Preventiva</div>
              <div className="text-2xl font-bold text-foreground">{filasConMedida}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-2/10 text-chart-2">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Verificadas</div>
              <div className="text-2xl font-bold text-foreground">{filasVerificadas}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por proceso, tarea o peligro..."
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
                <Label className="text-xs">Proceso</Label>
                <Select value={filterProceso} onValueChange={setFilterProceso}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {procesos.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {filterProceso !== 'all' && (
                <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => setFilterProceso('all')}>
                  <X className="h-3 w-3 mr-1" /> Limpiar
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main IPER table */}
      <div className="rounded-lg border border-border overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50">
              <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">Proceso</th>
              <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">Tarea</th>
              <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">Peligro</th>
              <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">Riesgo Especifico</th>
              <th className="px-3 py-2.5 text-center text-xs font-medium text-muted-foreground">VEP Inicial</th>
              <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">Medida Preventiva</th>
              <th className="px-3 py-2.5 text-center text-xs font-medium text-muted-foreground">VEP Post</th>
              <th className="px-3 py-2.5 text-center text-xs font-medium text-muted-foreground">Verificacion</th>
              <th className="px-3 py-2.5 w-20" />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-3 py-12 text-center text-sm text-muted-foreground">
                  No se encontraron registros. Crea identificaciones en la vista de Identificacion.
                </td>
              </tr>
            ) : filtered.map(fila => {
              const proceso = getProceso(fila.procesoId)
              const tarea = getTarea(fila.tareaId)
              const peligro = getParametro('peligros', fila.peligroId)
              const riesgo = getParametro('riesgos_especificos', fila.riesgoEspecificoId)
              const filaMedidas = getMedidasByFila(fila.id)
              const hasMedida = filaMedidas.length > 0
              const firstMedida = filaMedidas[0]
              const verificador = firstMedida ? getParametro('verificadores', firstMedida.verificadorId) : null

              return (
                <tr key={fila.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                  <td className="px-3 py-2.5">
                    <span className="text-xs font-medium text-foreground">{proceso?.nombre}</span>
                  </td>
                  <td className="px-3 py-2.5 text-xs text-foreground max-w-[120px] truncate">{tarea?.nombre}</td>
                  <td className="px-3 py-2.5">
                    <Badge variant="outline" className="text-[10px] bg-destructive/10 text-destructive border-destructive/20">
                      {peligro?.nombre}
                    </Badge>
                  </td>
                  <td className="px-3 py-2.5 text-xs text-muted-foreground max-w-[120px] truncate">{riesgo?.nombre}</td>
                  <td className="px-3 py-2.5 text-center">
                    <NivelBadge nivel={fila.vepInicial} params={parametros.nivel_riesgo} />
                  </td>
                  <td className="px-3 py-2.5">
                    {hasMedida ? (
                      <div className="max-w-[200px]">
                        <p className="text-xs text-foreground truncate">{firstMedida.descripcion}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{verificador?.nombre}</p>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-[10px] gap-1 text-muted-foreground hover:text-primary"
                        onClick={() => setAddMedidaFila(fila)}
                      >
                        <Plus className="h-3 w-3" /> Agregar medida
                      </Button>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    {fila.vepPost !== fila.vepInicial ? (
                      <NivelBadge nivel={fila.vepPost} params={parametros.nivel_riesgo} />
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${
                        fila.estadoVerificacion === 'verificado'
                          ? 'bg-success/15 text-success border-success/30'
                          : 'bg-muted text-muted-foreground border-border'
                      }`}
                    >
                      {fila.estadoVerificacion === 'verificado' ? 'Verificado' : 'Pendiente'}
                    </Badge>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDetailFilaId(fila.id)}>
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      {hasMedida && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => setEditMedida({ fila, medida: firstMedida })}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      <MedidaModal
        open={!!addMedidaFila}
        onOpenChange={v => { if (!v) setAddMedidaFila(null) }}
        filaIPER={addMedidaFila}
      />
      <MedidaModal
        open={!!editMedida}
        onOpenChange={v => { if (!v) setEditMedida(null) }}
        filaIPER={editMedida?.fila || null}
        existingMedida={editMedida?.medida}
      />
      <DetalleModal
        open={!!detailFilaId}
        onOpenChange={v => { if (!v) setDetailFilaId(null) }}
        filaId={detailFilaId}
      />
    </div>
  )
}
