'use client'

import React, { useState, useMemo } from 'react'
import { useMatrizRiesgo } from '@/lib/matriz-riesgo/context'
import {
  getNivelRiesgoColor, getNivelRiesgoLabel, calcularVEPPost,
  type MedidaPreventiva, type VerificacionRecord,
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
  Search, Filter, X, ChevronRight, ClipboardCheck,
  CheckCircle2, Clock, AlertTriangle, ShieldCheck, Calendar,
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

// --- Verificacion Modal ---
function VerificacionModal({
  open,
  onOpenChange,
  medida,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  medida: MedidaPreventiva | null
}) {
  const {
    usuarios, parametros,
    addVerificacion, addHistorial, updateFilaIPER,
    getFilaIPER, getProceso, getTarea, getParametro, getMedidasByFila,
  } = useMatrizRiesgo()

  const [cumple, setCumple] = useState<string>('true')
  const [calidadReal, setCalidadReal] = useState<string>('3')
  const [comentarios, setComentarios] = useState('')
  const [evidencia, setEvidencia] = useState('')
  const [frecuenciaDias, setFrecuenciaDias] = useState('90')
  const [verificadoPor, setVerificadoPor] = useState(usuarios[0]?.id || '')

  React.useEffect(() => {
    if (open) {
      setCumple('true')
      setCalidadReal('3')
      setComentarios('')
      setEvidencia('')
      setFrecuenciaDias('90')
      setVerificadoPor(usuarios[0]?.id || '')
    }
  }, [open, usuarios])

  const fila = medida ? getFilaIPER(medida.filaIPERId) : null
  const proceso = fila ? getProceso(fila.procesoId) : null
  const tarea = fila ? getTarea(fila.tareaId) : null
  const peligro = fila ? getParametro('peligros', fila.peligroId) : null
  const verificador = medida ? getParametro('verificadores', medida.verificadorId) : null

  const handleSubmit = () => {
    if (!medida || !fila) return

    const now = new Date()
    const nowStr = now.toISOString().split('T')[0]
    const proximaDate = new Date(now.getTime() + Number(frecuenciaDias) * 24 * 60 * 60 * 1000)
    const proximaStr = proximaDate.toISOString().split('T')[0]

    addVerificacion({
      id: `vr-${Date.now()}`,
      verificadorId: medida.verificadorId,
      filaIPERId: fila.id,
      medidaId: medida.id,
      cumple: cumple === 'true',
      calidadReal: Number(calidadReal),
      comentarios: comentarios.trim() || undefined,
      evidencia: evidencia.trim() || undefined,
      fechaVerificacion: nowStr,
      verificadoPor,
      proximaVerificacion: proximaStr,
    })

    // Recalculate VEP Post based on calidadReal
    const op = parametros.orden_prelacion.find(o => o.id === medida.ordenPrelacionId)
    const maxCalidad = Math.max(...parametros.calidad_control.map(c => c.valor || 0), 1)
    const maxPrelacion = Math.max(...parametros.orden_prelacion.map(o => o.valor || 0), 1)
    const vepPost = calcularVEPPost(fila.vepInicial, Number(calidadReal), op?.valor || 1, maxCalidad, maxPrelacion)
    
    updateFilaIPER(fila.id, {
      vepPost,
      estadoVerificacion: 'verificado',
    })

    const verName = verificador?.nombre || ''
    addHistorial({
      id: `h-${Date.now()}`,
      tipo: 'verificacion',
      descripcion: `Verificacion completada: ${verName} - ${cumple === 'true' ? 'Cumple' : 'No cumple'}`,
      fecha: nowStr,
      usuarioId: verificadoPor,
      filaIPERId: fila.id,
    })

    toast.success('Verificacion registrada')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] p-0 flex flex-col overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border shrink-0">
          <DialogTitle className="text-base flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4 text-primary" />
            Registrar Verificacion
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-1 px-6 py-4">
          <div className="space-y-4">
            {/* Context */}
            {medida && fila && (
              <Card className="bg-muted/30">
                <CardContent className="p-3">
                  <p className="text-xs font-medium text-foreground">{medida.descripcion}</p>
                  <div className="flex items-center gap-2 mt-2 text-[10px]">
                    <Badge variant="outline" className="bg-chart-2/10 text-chart-2 border-chart-2/20">{proceso?.nombre}</Badge>
                    <ChevronRight className="h-3 w-3 text-muted-foreground" />
                    <span className="text-foreground">{tarea?.nombre}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-[10px] bg-destructive/10 text-destructive border-destructive/20">{peligro?.nombre}</Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-[10px] text-muted-foreground">
                    <span>Verificador: <span className="text-foreground font-medium">{verificador?.nombre}</span></span>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-2">
              <Label className="text-sm">Cumplimiento <span className="text-destructive">*</span></Label>
              <Select value={cumple} onValueChange={setCumple}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Cumple</SelectItem>
                  <SelectItem value="false">No cumple</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Calidad Real (1-3) <span className="text-destructive">*</span></Label>
              <Select value={calidadReal} onValueChange={setCalidadReal}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 - Alta</SelectItem>
                  <SelectItem value="2">2 - Media</SelectItem>
                  <SelectItem value="1">1 - Baja</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[10px] text-muted-foreground">Este valor actualiza la Calidad de Control y recalcula el VEP Post</p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Comentarios</Label>
              <Textarea value={comentarios} onChange={e => setComentarios(e.target.value)} placeholder="Observaciones..." rows={2} />
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Evidencia</Label>
              <Input value={evidencia} onChange={e => setEvidencia(e.target.value)} placeholder="Nombre del archivo o referencia..." />
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Frecuencia de verificacion (dias)</Label>
              <Input type="number" value={frecuenciaDias} onChange={e => setFrecuenciaDias(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Verificado por</Label>
              <Select value={verificadoPor} onValueChange={setVerificadoPor}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {usuarios.map(u => (<SelectItem key={u.id} value={u.id}>{u.nombre}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </ScrollArea>
        <div className="shrink-0 flex justify-end gap-2 px-6 py-4 border-t border-border">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit}>Registrar</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// --- Main View ---
export function VerificacionesView() {
  const {
    medidas, filasIPER, verificaciones, parametros, procesos,
    getFilaIPER, getProceso, getTarea, getParametro, getUsuario,
    getVerificacionesByFila,
  } = useMatrizRiesgo()

  const [searchQuery, setSearchQuery] = useState('')
  const [filterProceso, setFilterProceso] = useState<string>('all')
  const [filterVerificador, setFilterVerificador] = useState<string>('all')
  const [filterVEP, setFilterVEP] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [verificarMedida, setVerificarMedida] = useState<MedidaPreventiva | null>(null)

  // Build enriched medidas list
  const enrichedMedidas = useMemo(() => {
    return medidas.map(med => {
      const fila = getFilaIPER(med.filaIPERId)
      if (!fila) return null
      
      const proceso = getProceso(fila.procesoId)
      const tarea = getTarea(fila.tareaId)
      const peligro = getParametro('peligros', fila.peligroId)
      const riesgo = getParametro('riesgos_especificos', fila.riesgoEspecificoId)
      const verificador = getParametro('verificadores', med.verificadorId)
      const filaVerificaciones = getVerificacionesByFila(fila.id)
      const lastVerificacion = filaVerificaciones.sort((a, b) => 
        new Date(b.fechaVerificacion).getTime() - new Date(a.fechaVerificacion).getTime()
      )[0]
      
      const isPending = !lastVerificacion || 
        (lastVerificacion.proximaVerificacion && new Date(lastVerificacion.proximaVerificacion) < new Date())

      return {
        medida: med,
        fila,
        proceso,
        tarea,
        peligro,
        riesgo,
        verificador,
        lastVerificacion,
        isPending,
      }
    }).filter(Boolean) as {
      medida: MedidaPreventiva
      fila: typeof filasIPER[0]
      proceso: ReturnType<typeof getProceso>
      tarea: ReturnType<typeof getTarea>
      peligro: ReturnType<typeof getParametro>
      riesgo: ReturnType<typeof getParametro>
      verificador: ReturnType<typeof getParametro>
      lastVerificacion: VerificacionRecord | undefined
      isPending: boolean
    }[]
  }, [medidas, getFilaIPER, getProceso, getTarea, getParametro, getVerificacionesByFila])

  const filtered = useMemo(() => {
    return enrichedMedidas.filter(item => {
      if (filterProceso !== 'all' && item.fila.procesoId !== filterProceso) return false
      if (filterVerificador !== 'all' && item.medida.verificadorId !== filterVerificador) return false
      if (filterVEP === 'high' && item.fila.vepPost <= 4) return false
      if (filterVEP === 'low' && item.fila.vepPost > 4) return false
      
      if (searchQuery) {
        const text = `${item.proceso?.nombre} ${item.tarea?.nombre} ${item.peligro?.nombre} ${item.medida.descripcion}`.toLowerCase()
        if (!text.includes(searchQuery.toLowerCase())) return false
      }
      return true
    })
  }, [enrichedMedidas, filterProceso, filterVerificador, filterVEP, searchQuery])

  // Stats
  const totalMedidas = medidas.length
  const verificadas = filasIPER.filter(f => f.estadoVerificacion === 'verificado').length
  const pendientes = enrichedMedidas.filter(e => e.isPending).length

  // Unique verificadores in medidas
  const usedVerificadores = useMemo(() => {
    const ids = new Set(medidas.map(m => m.verificadorId))
    return parametros.verificadores.filter(v => ids.has(v.id))
  }, [medidas, parametros.verificadores])

  const clearFilters = () => {
    setFilterProceso('all')
    setFilterVerificador('all')
    setFilterVEP('all')
  }

  const hasActiveFilters = filterProceso !== 'all' || filterVerificador !== 'all' || filterVEP !== 'all'

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Total Medidas</div>
              <div className="text-2xl font-bold text-foreground">{totalMedidas}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10 text-success">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Verificadas</div>
              <div className="text-2xl font-bold text-foreground">{verificadas}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10 text-warning-foreground">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Pendientes</div>
              <div className="text-2xl font-bold text-foreground">{pendientes}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar medida, proceso, tarea..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" size="sm" className="h-9 gap-1.5" onClick={() => setShowFilters(!showFilters)}>
          <Filter className="h-3.5 w-3.5" /> Filtros
          {hasActiveFilters && <Badge variant="secondary" className="ml-1 text-[10px] h-4 px-1">{[filterProceso, filterVerificador, filterVEP].filter(f => f !== 'all').length}</Badge>}
        </Button>
      </div>

      {showFilters && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-end gap-3 flex-wrap">
              <div className="space-y-1.5 flex-1 min-w-[150px] max-w-[200px]">
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
              <div className="space-y-1.5 flex-1 min-w-[150px] max-w-[200px]">
                <Label className="text-xs">Verificador</Label>
                <Select value={filterVerificador} onValueChange={setFilterVerificador}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {usedVerificadores.map(v => (
                      <SelectItem key={v.id} value={v.id}>{v.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 flex-1 min-w-[150px] max-w-[200px]">
                <Label className="text-xs">VEP Post</Label>
                <Select value={filterVEP} onValueChange={setFilterVEP}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="high">Alto (mayor que 4)</SelectItem>
                    <SelectItem value="low">Bajo (4 o menos)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={clearFilters}>
                  <X className="h-3 w-3 mr-1" /> Limpiar
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Medidas table */}
      <div className="rounded-lg border border-border overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50">
              <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">Medida Preventiva</th>
              <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">Proceso</th>
              <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">Tarea / Peligro</th>
              <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">Verificador</th>
              <th className="px-3 py-2.5 text-center text-xs font-medium text-muted-foreground">VEP Inicial</th>
              <th className="px-3 py-2.5 text-center text-xs font-medium text-muted-foreground">VEP Post</th>
              <th className="px-3 py-2.5 text-center text-xs font-medium text-muted-foreground">Estado</th>
              <th className="px-3 py-2.5 w-24" />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-3 py-12 text-center text-sm text-muted-foreground">
                  No se encontraron medidas preventivas.
                </td>
              </tr>
            ) : filtered.map(item => (
              <tr key={item.medida.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                <td className="px-3 py-3">
                  <p className="text-xs font-medium text-foreground max-w-[250px] truncate">{item.medida.descripcion}</p>
                  {item.lastVerificacion?.proximaVerificacion && (
                    <div className={`flex items-center gap-1 mt-1 text-[10px] ${item.isPending ? 'text-destructive' : 'text-muted-foreground'}`}>
                      <Calendar className="h-3 w-3" />
                      Proxima: {new Date(item.lastVerificacion.proximaVerificacion).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })}
                    </div>
                  )}
                </td>
                <td className="px-3 py-3">
                  <span className="text-xs text-foreground">{item.proceso?.nombre}</span>
                </td>
                <td className="px-3 py-3">
                  <div className="space-y-1">
                    <p className="text-xs text-foreground">{item.tarea?.nombre}</p>
                    <Badge variant="outline" className="text-[10px] bg-destructive/10 text-destructive border-destructive/20">
                      {item.peligro?.nombre}
                    </Badge>
                  </div>
                </td>
                <td className="px-3 py-3">
                  <span className="text-xs text-foreground">{item.verificador?.nombre}</span>
                </td>
                <td className="px-3 py-3 text-center">
                  <NivelBadge nivel={item.fila.vepInicial} params={parametros.nivel_riesgo} />
                </td>
                <td className="px-3 py-3 text-center">
                  <NivelBadge nivel={item.fila.vepPost} params={parametros.nivel_riesgo} />
                </td>
                <td className="px-3 py-3 text-center">
                  <Badge
                    variant="outline"
                    className={`text-[10px] ${
                      item.fila.estadoVerificacion === 'verificado'
                        ? 'bg-success/15 text-success border-success/30'
                        : item.isPending
                          ? 'bg-warning/15 text-warning-foreground border-warning/30'
                          : 'bg-muted text-muted-foreground border-border'
                    }`}
                  >
                    {item.fila.estadoVerificacion === 'verificado' 
                      ? 'Verificado' 
                      : item.isPending 
                        ? 'Pendiente' 
                        : 'Sin verificar'}
                  </Badge>
                </td>
                <td className="px-3 py-3">
                  <Button
                    size="sm"
                    className="h-7 text-[10px] gap-1"
                    onClick={() => setVerificarMedida(item.medida)}
                  >
                    <ClipboardCheck className="h-3 w-3" /> Verificar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Verificacion Modal */}
      <VerificacionModal
        open={!!verificarMedida}
        onOpenChange={v => { if (!v) setVerificarMedida(null) }}
        medida={verificarMedida}
      />
    </div>
  )
}
