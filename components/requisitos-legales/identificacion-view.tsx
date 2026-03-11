'use client'

import React, { useState, useMemo } from 'react'
import { useRequisitosLegales } from '@/lib/requisitos-legales/context'
import {
  CRITICIDAD_LABELS, ATRIBUTO_LABELS, IDENTIFICACION_ESTADO_LABELS,
  CUMPLIMIENTO_ESTADO_LABELS,
  type Criticidad, type Atributo, type IdentificacionEstado, type VinculacionNormativa,
  type Decreto,
} from '@/lib/requisitos-legales/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import {
  Search, ChevronDown, ChevronRight, Link2, CheckCircle2,
  BookOpen, Building2, FileText, AlertCircle, Users,
  Pencil, Trash2, Eye, BarChart3,
} from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

// ─── Helpers ───

function criticidadColor(c: Criticidad) {
  switch (c) {
    case 'alta': return 'bg-destructive/15 text-destructive border-destructive/30'
    case 'media': return 'bg-warning/15 text-warning-foreground border-warning/30'
    case 'baja': return 'bg-muted text-muted-foreground border-border'
  }
}

// Visual-only tag mappings for articles (req #4)
const CATEGORIA_TEMATICA: Record<string, string> = {
  ambiental: 'Medioambiente',
  sst: 'Seguridad',
  laboral: 'Laboral',
  general: 'General',
  energia: 'Energia',
}

const CATEGORIA_TEMATICA_COLOR: Record<string, string> = {
  ambiental: 'bg-chart-2/15 text-chart-2 border-chart-2/30',
  sst: 'bg-chart-5/15 text-chart-5 border-chart-5/30',
  laboral: 'bg-primary/15 text-primary border-primary/30',
  general: 'bg-muted text-muted-foreground border-border',
  energia: 'bg-warning/15 text-warning-foreground border-warning/30',
}

const ATRIBUTO_COLOR: Record<string, string> = {
  permiso: 'bg-primary/10 text-primary border-primary/20',
  monitoreo: 'bg-chart-2/10 text-chart-2 border-chart-2/20',
  reporte: 'bg-chart-5/10 text-chart-5 border-chart-5/20',
  otros: 'bg-muted text-muted-foreground border-border',
}

// ─── Mini Dashboard (req #1) ───

function IdentificacionMiniDashboard() {
  const { vinculaciones, decretos } = useRequisitosLegales()

  const stats = useMemo(() => {
    const selectedDecretoIds = new Set(vinculaciones.map(v => v.decretoId))
    const totalCuerposLegales = selectedDecretoIds.size
    const totalArticulosAplicables = new Set(vinculaciones.map(v => v.articuloId)).size
    const articulosPorGestionar = vinculaciones.filter(v => v.estado === 'activo').length
    const articulosPorDefinir = vinculaciones.filter(v => v.estado === 'por_definir').length
    const activos = vinculaciones.filter(v => v.estado === 'activo').length

    return { totalCuerposLegales, totalArticulosAplicables, articulosPorGestionar, articulosPorDefinir, activos }
  }, [vinculaciones])

  const chartData = useMemo(() => [
    { name: 'Activo', value: stats.activos, fill: 'var(--success)' },
    { name: 'Por definir', value: stats.articulosPorDefinir, fill: 'var(--warning)' },
  ].filter(d => d.value > 0), [stats])

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Resumen de Identificacion</h3>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-3 text-center">
            <div className="text-xl font-bold text-foreground">{stats.totalCuerposLegales}</div>
            <div className="text-xs text-muted-foreground">Cuerpos legales</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <div className="text-xl font-bold text-foreground">{stats.totalArticulosAplicables}</div>
            <div className="text-xs text-muted-foreground">Articulos aplicables</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <div className="text-xl font-bold text-primary">{stats.articulosPorGestionar}</div>
            <div className="text-xs text-muted-foreground">Por gestionar</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <div className="text-xl font-bold text-warning-foreground">{stats.articulosPorDefinir}</div>
            <div className="text-xs text-muted-foreground">Por definir</div>
          </CardContent>
        </Card>
      </div>
      {chartData.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Estado de Identificacion</CardTitle>
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

// ─── Section 1: Seleccion de Cuerpos Legales ───

function CuerposLegalesSection({
  decretos,
  selectedDecretoIds,
  onToggle,
}: {
  decretos: Decreto[]
  selectedDecretoIds: string[]
  onToggle: (id: string) => void
}) {
  const [search, setSearch] = useState('')

  const categoriaLabel: Record<string, string> = {
    general: 'General',
    ambiental: 'Ambiental',
    sst: 'SST',
    laboral: 'Laboral',
    energia: 'Energia',
  }

  const categoriaColor: Record<string, string> = {
    general: 'bg-muted text-muted-foreground',
    ambiental: 'bg-chart-2/15 text-chart-2',
    sst: 'bg-chart-5/15 text-chart-5',
    laboral: 'bg-primary/15 text-primary',
    energia: 'bg-warning/15 text-warning-foreground',
  }

  const filtered = useMemo(() => {
    if (!search) return decretos
    const q = search.toLowerCase()
    return decretos.filter(d =>
      d.nombre.toLowerCase().includes(q) ||
      d.descripcion.toLowerCase().includes(q) ||
      d.ministerio.toLowerCase().includes(q)
    )
  }, [decretos, search])

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          <BookOpen className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-foreground">1. Selecciona los cuerpos legales</h2>
          <p className="text-xs text-muted-foreground">Selecciona las leyes, decretos o normativas que deseas vincular</p>
        </div>
        {selectedDecretoIds.length > 0 && (
          <Badge variant="secondary" className="ml-auto text-xs">{selectedDecretoIds.length} seleccionado{selectedDecretoIds.length !== 1 ? 's' : ''}</Badge>
        )}
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar cuerpo legal..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9 h-9 text-sm"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map(d => {
          const isSelected = selectedDecretoIds.includes(d.id)
          return (
            <div
              key={d.id}
              className={`group relative rounded-lg border p-4 cursor-pointer transition-all ${
                isSelected
                  ? 'border-primary bg-primary/5 ring-1 ring-primary/30 shadow-sm'
                  : 'border-border hover:border-primary/40 hover:bg-muted/30'
              }`}
              onClick={() => onToggle(d.id)}
            >
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={isSelected}
                  className="mt-0.5 shrink-0"
                  onCheckedChange={() => onToggle(d.id)}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-foreground">{d.nombre}</p>
                    <Badge variant="secondary" className={`text-[10px] ${categoriaColor[d.categoria] || ''}`}>
                      {categoriaLabel[d.categoria] || d.categoria}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{d.descripcion}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[10px] text-muted-foreground">{d.ministerio}</span>
                    <span className="text-[10px] text-muted-foreground">{d.articulos.length} articulo{d.articulos.length !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                </div>
              )}
            </div>
          )
        })}
        {filtered.length === 0 && (
          <div className="col-span-full py-8 text-center text-sm text-muted-foreground">
            No se encontraron cuerpos legales
          </div>
        )}
      </div>
    </section>
  )
}

// ─── Section 2: Conexion Unidades <-> Articulos ───

function ConexionSection({
  selectedDecretoIds,
  selectedArticuloIds,
  onToggleArticulo,
  selectedUcIds,
  onToggleUc,
}: {
  selectedDecretoIds: string[]
  selectedArticuloIds: string[]
  onToggleArticulo: (id: string) => void
  selectedUcIds: string[]
  onToggleUc: (id: string) => void
}) {
  const { decretos, unidadesControl, getVinculacionesByUC, vinculaciones } = useRequisitosLegales()
  const [ucSearch, setUcSearch] = useState('')
  const [artSearch, setArtSearch] = useState('')
  const [expandedDecretos, setExpandedDecretos] = useState<Record<string, boolean>>({})

  const selectedDecretos = decretos.filter(d => selectedDecretoIds.includes(d.id))

  const filteredUcs = useMemo(() => {
    if (!ucSearch) return unidadesControl
    const q = ucSearch.toLowerCase()
    return unidadesControl.filter(uc =>
      uc.nombre.toLowerCase().includes(q) || uc.tipo.toLowerCase().includes(q)
    )
  }, [unidadesControl, ucSearch])

  React.useEffect(() => {
    const newExpanded: Record<string, boolean> = {}
    selectedDecretoIds.forEach(id => {
      newExpanded[id] = expandedDecretos[id] !== undefined ? expandedDecretos[id] : true
    })
    setExpandedDecretos(newExpanded)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDecretoIds.join(',')])

  const toggleDecretoExpand = (id: string) => {
    setExpandedDecretos(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const toggleAllArticulosOfDecreto = (decreto: Decreto) => {
    const artIds = decreto.articulos.map(a => a.id)
    const allSelected = artIds.every(id => selectedArticuloIds.includes(id))
    if (allSelected) {
      artIds.forEach(id => {
        if (selectedArticuloIds.includes(id)) onToggleArticulo(id)
      })
    } else {
      artIds.forEach(id => {
        if (!selectedArticuloIds.includes(id)) onToggleArticulo(id)
      })
    }
  }

  const filterArticulos = (articulos: Decreto['articulos']) => {
    if (!artSearch) return articulos
    const q = artSearch.toLowerCase()
    return articulos.filter(a =>
      a.numero.toLowerCase().includes(q) || a.contenido.toLowerCase().includes(q)
    )
  }

  // Get atributo for an article from existing vinculaciones (for chip display)
  const getArticuloAtributo = (articuloId: string): string | null => {
    const v = vinculaciones.find(vi => vi.articuloId === articuloId)
    return v ? v.atributo : null
  }

  if (selectedDecretoIds.length === 0) {
    return (
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
            <Link2 className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground">{'2. Conexion Unidades <-> Articulos'}</h2>
            <p className="text-xs text-muted-foreground">Selecciona al menos un cuerpo legal en la seccion anterior</p>
          </div>
        </div>
        <Card className="border-dashed">
          <CardContent className="py-10 text-center">
            <BookOpen className="h-8 w-8 text-muted-foreground/30 mx-auto" />
            <p className="text-sm text-muted-foreground mt-3">Selecciona cuerpos legales para ver sus articulos</p>
          </CardContent>
        </Card>
      </section>
    )
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          <Link2 className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-foreground">{'2. Conexion Unidades <-> Articulos'}</h2>
          <p className="text-xs text-muted-foreground">Selecciona las unidades de control y los articulos que deseas vincular</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {selectedUcIds.length > 0 && (
            <Badge variant="outline" className="text-xs gap-1">
              <Building2 className="h-3 w-3" /> {selectedUcIds.length} UC{selectedUcIds.length !== 1 ? 's' : ''}
            </Badge>
          )}
          {selectedArticuloIds.length > 0 && (
            <Badge variant="outline" className="text-xs gap-1">
              <FileText className="h-3 w-3" /> {selectedArticuloIds.length} art.
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-4">
        {/* Left Panel: Unidades de Control */}
        <Card className="flex flex-col">
          <CardHeader className="pb-3 px-4 pt-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5" /> Unidades de Control
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-[10px] px-2"
                onClick={() => {
                  if (selectedUcIds.length === unidadesControl.length) {
                    unidadesControl.forEach(uc => { if (selectedUcIds.includes(uc.id)) onToggleUc(uc.id) })
                  } else {
                    unidadesControl.forEach(uc => { if (!selectedUcIds.includes(uc.id)) onToggleUc(uc.id) })
                  }
                }}
              >
                {selectedUcIds.length === unidadesControl.length ? 'Ninguna' : 'Todas'}
              </Button>
            </div>
            <div className="relative mt-2">
              <Search className="absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar unidad..."
                value={ucSearch}
                onChange={e => setUcSearch(e.target.value)}
                className="pl-8 h-8 text-xs"
              />
            </div>
          </CardHeader>
          <ScrollArea className="flex-1 max-h-[420px]">
            <div className="px-4 pb-4 space-y-1.5">
              {filteredUcs.map(uc => {
                const isSelected = selectedUcIds.includes(uc.id)
                const linkedCount = getVinculacionesByUC(uc.id).length
                return (
                  <div
                    key={uc.id}
                    className={`rounded-lg border p-3 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                        : 'border-border hover:border-primary/40'
                    }`}
                    onClick={() => onToggleUc(uc.id)}
                  >
                    <div className="flex items-start gap-2.5">
                      <Checkbox checked={isSelected} className="mt-0.5 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-foreground">{uc.nombre}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{uc.tipo}</p>
                        {uc.descripcion && (
                          <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{uc.descripcion}</p>
                        )}
                      </div>
                      {linkedCount > 0 && (
                        <Badge variant="secondary" className="text-[10px] shrink-0">
                          {linkedCount} vinc.
                        </Badge>
                      )}
                    </div>
                  </div>
                )
              })}
              {filteredUcs.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">Sin resultados</p>
              )}
            </div>
          </ScrollArea>
        </Card>

        {/* Right Panel: Articulos grouped by cuerpo legal */}
        <Card className="flex flex-col">
          <CardHeader className="pb-3 px-4 pt-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5" /> Articulos por Cuerpo Legal
              </CardTitle>
            </div>
            <div className="relative mt-2">
              <Search className="absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar articulo..."
                value={artSearch}
                onChange={e => setArtSearch(e.target.value)}
                className="pl-8 h-8 text-xs"
              />
            </div>
          </CardHeader>
          <ScrollArea className="flex-1 max-h-[420px]">
            <div className="px-4 pb-4 space-y-3">
              {selectedDecretos.map(decreto => {
                const isExpanded = expandedDecretos[decreto.id] !== false
                const arts = filterArticulos(decreto.articulos)
                const selectedInDecreto = decreto.articulos.filter(a => selectedArticuloIds.includes(a.id)).length
                const allSelected = decreto.articulos.length > 0 && selectedInDecreto === decreto.articulos.length

                return (
                  <div key={decreto.id} className="rounded-lg border border-border overflow-hidden">
                    {/* Decreto header */}
                    <div
                      className="flex items-center gap-2 px-3 py-2.5 bg-muted/40 cursor-pointer hover:bg-muted/60 transition-colors"
                      onClick={() => toggleDecretoExpand(decreto.id)}
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      ) : (
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-foreground">{decreto.nombre}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {selectedInDecreto > 0 && (
                          <Badge variant="secondary" className="text-[10px]">
                            {selectedInDecreto}/{decreto.articulos.length}
                          </Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-[10px] px-2"
                          onClick={(e) => { e.stopPropagation(); toggleAllArticulosOfDecreto(decreto) }}
                        >
                          {allSelected ? 'Ninguno' : 'Todos'}
                        </Button>
                      </div>
                    </div>

                    {/* Articulos list with chips (req #4) */}
                    {isExpanded && (
                      <div className="divide-y divide-border">
                        {arts.length === 0 ? (
                          <p className="text-xs text-muted-foreground text-center py-4">Sin articulos que coincidan</p>
                        ) : (
                          arts.map(art => {
                            const isSelected = selectedArticuloIds.includes(art.id)
                            const atributo = getArticuloAtributo(art.id)
                            return (
                              <div
                                key={art.id}
                                className={`px-3 py-2.5 cursor-pointer transition-colors ${
                                  isSelected ? 'bg-primary/5' : 'hover:bg-muted/30'
                                }`}
                                onClick={() => onToggleArticulo(art.id)}
                              >
                                <div className="flex items-start gap-2.5">
                                  <Checkbox checked={isSelected} className="mt-0.5 shrink-0" />
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <p className="text-xs font-medium text-foreground">{art.numero}</p>
                                      {/* Visual chips - req #4 */}
                                      <Badge variant="outline" className={`text-[9px] px-1.5 py-0 h-4 ${CATEGORIA_TEMATICA_COLOR[decreto.categoria] || 'bg-muted text-muted-foreground border-border'}`}>
                                        {CATEGORIA_TEMATICA[decreto.categoria] || decreto.categoria}
                                      </Badge>
                                      {atributo && (
                                        <Badge variant="outline" className={`text-[9px] px-1.5 py-0 h-4 ${ATRIBUTO_COLOR[atributo] || ''}`}>
                                          {ATRIBUTO_LABELS[atributo as Atributo]}
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed line-clamp-3">{art.contenido}</p>
                                  </div>
                                </div>
                              </div>
                            )
                          })
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        </Card>
      </div>
    </section>
  )
}

// ─── Confirmation Modal ───

interface PendingVinculacion {
  articuloId: string
  ucId: string
  decretoId: string
  isExisting: boolean
  responsableIds: string[]
  atributo: Atributo
  criticidad: Criticidad
  estado: IdentificacionEstado
}

function ConfirmacionModal({
  open,
  onOpenChange,
  pendingVinculaciones,
  setPendingVinculaciones,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  pendingVinculaciones: PendingVinculacion[]
  setPendingVinculaciones: React.Dispatch<React.SetStateAction<PendingVinculacion[]>>
  onConfirm: () => void
}) {
  const { getArticulo, getUnidadControl, usuarios } = useRequisitosLegales()

  const newOnes = pendingVinculaciones.filter(p => !p.isExisting)
  const existingOnes = pendingVinculaciones.filter(p => p.isExisting)

  const updatePending = (index: number, data: Partial<PendingVinculacion>) => {
    setPendingVinculaciones(prev => prev.map((p, i) => i === index ? { ...p, ...data } : p))
  }

  const toggleResp = (index: number, userId: string) => {
    const current = pendingVinculaciones[index].responsableIds
    const next = current.includes(userId) ? current.filter(x => x !== userId) : [...current, userId]
    updatePending(index, { responsableIds: next })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0 flex flex-col overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-0 shrink-0">
          <DialogTitle className="text-base">Confirmar Vinculaciones</DialogTitle>
          <div className="flex items-center gap-3 mt-3">
            <Badge variant="default" className="text-xs gap-1">
              {newOnes.length} nueva{newOnes.length !== 1 ? 's' : ''}
            </Badge>
            {existingOnes.length > 0 && (
              <Badge variant="secondary" className="text-xs gap-1">
                <AlertCircle className="h-3 w-3" />
                {existingOnes.length} ya existente{existingOnes.length !== 1 ? 's' : ''} (se omitiran)
              </Badge>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6">
          <div className="space-y-4 py-4">
            {existingOnes.length > 0 && (
              <div className="rounded-lg border border-warning/30 bg-warning/5 p-3">
                <p className="text-xs font-medium text-warning-foreground mb-2">Vinculaciones existentes (no se duplicaran):</p>
                <div className="space-y-1">
                  {existingOnes.map((p, i) => {
                    const artData = getArticulo(p.articuloId)
                    const uc = getUnidadControl(p.ucId)
                    return (
                      <div key={`existing-${i}`} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="h-1.5 w-1.5 rounded-full bg-warning/60 shrink-0" />
                        <span>{artData?.decreto.nombre} - {artData?.articulo.numero}</span>
                        <span className="text-muted-foreground/50">{'→'}</span>
                        <span>{uc?.nombre}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {newOnes.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Nuevas vinculaciones</p>
                <div className="space-y-2">
                  {pendingVinculaciones.map((p, globalIndex) => {
                    if (p.isExisting) return null
                    const artData = getArticulo(p.articuloId)
                    const uc = getUnidadControl(p.ucId)
                    return (
                      <div key={globalIndex} className="rounded-lg border border-border p-3 space-y-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="text-[10px]">{artData?.decreto.nombre}</Badge>
                          <span className="text-xs font-medium text-foreground">{artData?.articulo.numero}</span>
                          <span className="text-muted-foreground/50">{'→'}</span>
                          <Badge variant="secondary" className="text-[10px]">{uc?.nombre}</Badge>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <div className="space-y-1">
                            <Label className="text-[10px] text-muted-foreground">Atributo</Label>
                            <Select value={p.atributo} onValueChange={(v) => updatePending(globalIndex, { atributo: v as Atributo })}>
                              <SelectTrigger className="h-7 text-[10px]"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="permiso">Permiso</SelectItem>
                                <SelectItem value="monitoreo">Monitoreo</SelectItem>
                                <SelectItem value="reporte">Reporte</SelectItem>
                                <SelectItem value="otros">Otros</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px] text-muted-foreground">Criticidad</Label>
                            <Select value={p.criticidad} onValueChange={(v) => updatePending(globalIndex, { criticidad: v as Criticidad })}>
                              <SelectTrigger className="h-7 text-[10px]"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="alta">Alta</SelectItem>
                                <SelectItem value="media">Media</SelectItem>
                                <SelectItem value="baja">Baja</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px] text-muted-foreground">Estado</Label>
                            <Select value={p.estado} onValueChange={(v) => updatePending(globalIndex, { estado: v as IdentificacionEstado })}>
                              <SelectTrigger className="h-7 text-[10px]"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="activo">Activo</SelectItem>
                                <SelectItem value="por_definir">Por definir</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <Label className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Users className="h-3 w-3" /> Responsables
                          </Label>
                          <div className="flex flex-wrap gap-1.5">
                            {usuarios.map(u => (
                              <Badge
                                key={u.id}
                                variant={p.responsableIds.includes(u.id) ? 'default' : 'outline'}
                                className="text-[10px] cursor-pointer transition-all"
                                onClick={() => toggleResp(globalIndex, u.id)}
                              >
                                {u.nombre.split(' ')[0]}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="shrink-0 flex items-center justify-between px-6 py-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Se crearan <span className="font-semibold text-foreground">{newOnes.length}</span> vinculacion{newOnes.length !== 1 ? 'es' : ''}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button onClick={onConfirm} disabled={newOnes.length === 0}>
              <Link2 className="h-4 w-4 mr-1.5" />
              Generar {newOnes.length} vinculacion{newOnes.length !== 1 ? 'es' : ''}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Detail Modal (req #5) ───

function VinculacionDetailModal({
  vinculacion,
  open,
  onOpenChange,
}: {
  vinculacion: VinculacionNormativa | null
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const { getArticulo, getUnidadControl, getUsuario, getLastResultadoByVinculacion } = useRequisitosLegales()

  if (!vinculacion) return null

  const artData = getArticulo(vinculacion.articuloId)
  const uc = getUnidadControl(vinculacion.unidadControlId)
  const lastResult = getLastResultadoByVinculacion(vinculacion.id)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base">Detalle de Vinculacion</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Decreto / Articulo */}
          <Card className="bg-muted/30">
            <CardContent className="p-4">
              <p className="text-sm font-semibold text-foreground">{artData?.decreto.nombre}</p>
              <p className="text-xs text-muted-foreground mt-1">{artData?.articulo.numero}</p>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{artData?.articulo.contenido}</p>
            </CardContent>
          </Card>

          {/* UC */}
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">{uc?.nombre}</span>
            <Badge variant="secondary" className="text-[10px]">{uc?.tipo}</Badge>
          </div>

          {/* Properties */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Criticidad</p>
              <Badge variant="outline" className={`text-xs ${criticidadColor(vinculacion.criticidad)}`}>
                {CRITICIDAD_LABELS[vinculacion.criticidad]}
              </Badge>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Atributo</p>
              <Badge variant="secondary" className="text-xs">{ATRIBUTO_LABELS[vinculacion.atributo]}</Badge>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Estado</p>
              <Badge variant="outline" className={`text-xs gap-1 ${
                vinculacion.estado === 'activo' ? 'bg-success/15 text-success border-success/30' : 'bg-warning/15 text-warning-foreground border-warning/30'
              }`}>
                {vinculacion.estado === 'activo' && <CheckCircle2 className="h-3 w-3" />}
                {IDENTIFICACION_ESTADO_LABELS[vinculacion.estado]}
              </Badge>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Ultimo resultado</p>
              {lastResult ? (
                <Badge variant="outline" className={`text-xs ${
                  lastResult.estadoCumplimiento === 'cumple' ? 'bg-success/15 text-success border-success/30' :
                  lastResult.estadoCumplimiento === 'no_cumple' ? 'bg-destructive/15 text-destructive border-destructive/30' :
                  'bg-warning/15 text-warning-foreground border-warning/30'
                }`}>
                  {CUMPLIMIENTO_ESTADO_LABELS[lastResult.estadoCumplimiento]}
                </Badge>
              ) : (
                <span className="text-xs text-muted-foreground">Sin evaluacion</span>
              )}
            </div>
          </div>

          {/* Responsables */}
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Responsables</p>
            <div className="flex flex-wrap gap-1.5">
              {vinculacion.responsableIds.map(uId => {
                const u = getUsuario(uId)
                return u ? (
                  <Badge key={uId} variant="secondary" className="text-xs">{u.nombre}</Badge>
                ) : null
              })}
            </div>
          </div>

          {/* Fecha */}
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Fecha de creacion</p>
            <span className="text-xs text-foreground">
              {new Date(vinculacion.fechaCreacion).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Existing Vinculaciones Table (req #5 improvements) ───

function VinculacionesTable() {
  const {
    vinculaciones, decretos, unidadesControl,
    getArticulo, getUnidadControl, getUsuario, getLastResultadoByVinculacion,
    deleteVinculacion, updateVinculacion, usuarios,
  } = useRequisitosLegales()

  const [search, setSearch] = useState('')
  const [filterUc, setFilterUc] = useState<string>('all')
  const [filterDecreto, setFilterDecreto] = useState<string>('all')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editCriticidad, setEditCriticidad] = useState<Criticidad>('media')
  const [editAtributo, setEditAtributo] = useState<Atributo>('permiso')
  const [editEstado, setEditEstado] = useState<IdentificacionEstado>('activo')
  const [editResps, setEditResps] = useState<string[]>([])

  // Detail modal state
  const [detailVinculacion, setDetailVinculacion] = useState<VinculacionNormativa | null>(null)

  // Delete confirmation state
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    return vinculaciones.filter(v => {
      if (filterUc !== 'all' && v.unidadControlId !== filterUc) return false
      if (filterDecreto !== 'all' && v.decretoId !== filterDecreto) return false
      if (search) {
        const artData = getArticulo(v.articuloId)
        const uc = getUnidadControl(v.unidadControlId)
        const text = `${artData?.decreto.nombre} ${artData?.articulo.numero} ${uc?.nombre}`.toLowerCase()
        if (!text.includes(search.toLowerCase())) return false
      }
      return true
    })
  }, [vinculaciones, filterUc, filterDecreto, search, getArticulo, getUnidadControl])

  const startEdit = (v: VinculacionNormativa) => {
    setEditingId(v.id)
    setEditCriticidad(v.criticidad)
    setEditAtributo(v.atributo)
    setEditEstado(v.estado)
    setEditResps(v.responsableIds)
  }

  const saveEdit = () => {
    if (!editingId) return
    updateVinculacion(editingId, {
      criticidad: editCriticidad,
      atributo: editAtributo,
      estado: editEstado,
      responsableIds: editResps,
    })
    setEditingId(null)
    toast.success('Vinculacion actualizada')
  }

  const cancelEdit = () => setEditingId(null)

  const handleDeleteConfirm = () => {
    if (!deleteConfirmId) return
    deleteVinculacion(deleteConfirmId)
    toast.success('Vinculacion eliminada')
    setDeleteConfirmId(null)
  }

  if (vinculaciones.length === 0) return null

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
          <FileText className="h-4 w-4 text-muted-foreground" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-foreground">Vinculaciones existentes</h2>
          <p className="text-xs text-muted-foreground">{vinculaciones.length} vinculacion{vinculaciones.length !== 1 ? 'es' : ''} registrada{vinculaciones.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 h-8 text-xs"
          />
        </div>
        <Select value={filterDecreto} onValueChange={setFilterDecreto}>
          <SelectTrigger className="h-8 text-xs w-[160px]"><SelectValue placeholder="Decreto" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los decretos</SelectItem>
            {decretos.map(d => <SelectItem key={d.id} value={d.id}>{d.nombre}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterUc} onValueChange={setFilterUc}>
          <SelectTrigger className="h-8 text-xs w-[160px]"><SelectValue placeholder="Unidad" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las unidades</SelectItem>
            {unidadesControl.map(uc => <SelectItem key={uc.id} value={uc.id}>{uc.nombre}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Table (req #5: show cuerpo legal name, icon buttons, detail button) */}
      <div className="rounded-lg border border-border overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50">
              <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">Cuerpo Legal</th>
              <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">Articulo</th>
              <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">Unidad de Control</th>
              <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">Responsables</th>
              <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">Criticidad</th>
              <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">Atributo</th>
              <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">Estado</th>
              <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">Resultado</th>
              <th className="px-3 py-2.5 w-28" />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-3 py-8 text-center text-xs text-muted-foreground">Sin resultados</td>
              </tr>
            ) : filtered.map(v => {
              const artData = getArticulo(v.articuloId)
              const uc = getUnidadControl(v.unidadControlId)
              const lastResult = getLastResultadoByVinculacion(v.id)
              const isEditing = editingId === v.id

              if (isEditing) {
                return (
                  <tr key={v.id} className="border-t border-border bg-primary/5">
                    <td className="px-3 py-2" colSpan={3}>
                      <p className="text-xs font-medium">{artData?.decreto.nombre} - {artData?.articulo.numero}</p>
                      <p className="text-[10px] text-muted-foreground">{uc?.nombre}</p>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-1">
                        {usuarios.map(u => (
                          <Badge
                            key={u.id}
                            variant={editResps.includes(u.id) ? 'default' : 'outline'}
                            className="text-[10px] cursor-pointer"
                            onClick={() => setEditResps(prev => prev.includes(u.id) ? prev.filter(x => x !== u.id) : [...prev, u.id])}
                          >
                            {u.nombre.split(' ')[0]}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <Select value={editCriticidad} onValueChange={(val) => setEditCriticidad(val as Criticidad)}>
                        <SelectTrigger className="h-7 text-[10px] w-20"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="alta">Alta</SelectItem>
                          <SelectItem value="media">Media</SelectItem>
                          <SelectItem value="baja">Baja</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-3 py-2">
                      <Select value={editAtributo} onValueChange={(val) => setEditAtributo(val as Atributo)}>
                        <SelectTrigger className="h-7 text-[10px] w-24"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="permiso">Permiso</SelectItem>
                          <SelectItem value="monitoreo">Monitoreo</SelectItem>
                          <SelectItem value="reporte">Reporte</SelectItem>
                          <SelectItem value="otros">Otros</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-3 py-2">
                      <Select value={editEstado} onValueChange={(val) => setEditEstado(val as IdentificacionEstado)}>
                        <SelectTrigger className="h-7 text-[10px] w-24"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="activo">Activo</SelectItem>
                          <SelectItem value="por_definir">Por definir</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-3 py-2" />
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1">
                        <Button variant="default" size="sm" className="h-6 text-[10px] px-2" onClick={saveEdit}>Guardar</Button>
                        <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2" onClick={cancelEdit}>X</Button>
                      </div>
                    </td>
                  </tr>
                )
              }

              return (
                <tr key={v.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                  {/* Cuerpo Legal name (req #5) */}
                  <td className="px-3 py-2.5">
                    <p className="text-xs font-medium text-foreground">{artData?.decreto.nombre}</p>
                  </td>
                  <td className="px-3 py-2.5">
                    <p className="text-[10px] text-foreground">{artData?.articulo.numero}</p>
                  </td>
                  <td className="px-3 py-2.5">
                    <Badge variant="outline" className="text-[10px]">{uc?.nombre}</Badge>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex flex-wrap gap-1">
                      {v.responsableIds.slice(0, 2).map(uId => {
                        const u = getUsuario(uId)
                        return u ? <span key={uId} className="text-[10px] text-foreground">{u.nombre.split(' ')[0]}</span> : null
                      })}
                      {v.responsableIds.length > 2 && <span className="text-[10px] text-muted-foreground">+{v.responsableIds.length - 2}</span>}
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <Badge variant="outline" className={`text-[10px] ${criticidadColor(v.criticidad)}`}>
                      {CRITICIDAD_LABELS[v.criticidad]}
                    </Badge>
                  </td>
                  <td className="px-3 py-2.5">
                    <Badge variant="secondary" className="text-[10px]">{ATRIBUTO_LABELS[v.atributo]}</Badge>
                  </td>
                  <td className="px-3 py-2.5">
                    <Badge variant="outline" className={`text-[10px] gap-1 ${
                      v.estado === 'activo' ? 'bg-success/15 text-success border-success/30' : 'bg-warning/15 text-warning-foreground border-warning/30'
                    }`}>
                      {v.estado === 'activo' ? <CheckCircle2 className="h-3 w-3" /> : null}
                      {IDENTIFICACION_ESTADO_LABELS[v.estado]}
                    </Badge>
                  </td>
                  <td className="px-3 py-2.5">
                    {lastResult ? (
                      <Badge variant="outline" className={`text-[10px] ${
                        lastResult.estadoCumplimiento === 'cumple' ? 'bg-success/15 text-success border-success/30' :
                        lastResult.estadoCumplimiento === 'no_cumple' ? 'bg-destructive/15 text-destructive border-destructive/30' :
                        'bg-warning/15 text-warning-foreground border-warning/30'
                      }`}>
                        {lastResult.estadoCumplimiento === 'cumple' ? 'Cumple' : lastResult.estadoCumplimiento === 'no_cumple' ? 'No cumple' : 'Parcial'}
                      </Badge>
                    ) : (
                      <span className="text-[10px] text-muted-foreground/50">--</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1">
                      {/* Ver detalle button (req #5) */}
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setDetailVinculacion(v)} title="Ver detalle">
                        <Eye className="h-3 w-3" />
                      </Button>
                      {/* Pencil icon for edit (req #5) */}
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => startEdit(v)} title="Editar">
                        <Pencil className="h-3 w-3" />
                      </Button>
                      {/* Trash icon with confirmation (req #5) */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                        onClick={() => setDeleteConfirmId(v.id)}
                        title="Eliminar"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground">{filtered.length} de {vinculaciones.length} vinculaciones</p>

      {/* Detail Modal */}
      <VinculacionDetailModal
        vinculacion={detailVinculacion}
        open={!!detailVinculacion}
        onOpenChange={(v) => !v && setDetailVinculacion(null)}
      />

      {/* Delete Confirmation (req #5) */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={(v) => !v && setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar eliminacion</AlertDialogTitle>
            <AlertDialogDescription>
              {'Esta seguro de que desea eliminar esta vinculacion? Esta accion no se puede deshacer.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  )
}

// ─── Main View ───

export function IdentificacionView() {
  const {
    decretos, addVinculaciones, addActividad,
    getUsuariosByUC, getVinculacionesByArticuloUC,
  } = useRequisitosLegales()

  const [selectedDecretoIds, setSelectedDecretoIds] = useState<string[]>([])
  const [selectedUcIds, setSelectedUcIds] = useState<string[]>([])
  const [selectedArticuloIds, setSelectedArticuloIds] = useState<string[]>([])
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingVinculaciones, setPendingVinculaciones] = useState<PendingVinculacion[]>([])

  const toggleDecreto = (id: string) => {
    setSelectedDecretoIds(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
      if (!next.includes(id)) {
        const decreto = decretos.find(d => d.id === id)
        if (decreto) {
          const artIds = decreto.articulos.map(a => a.id)
          setSelectedArticuloIds(prev2 => prev2.filter(a => !artIds.includes(a)))
        }
      }
      return next
    })
  }

  const toggleArticulo = (id: string) => {
    setSelectedArticuloIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const toggleUc = (id: string) => {
    setSelectedUcIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const canGenerate = selectedUcIds.length > 0 && selectedArticuloIds.length > 0

  const handleOpenConfirmation = () => {
    const pending: PendingVinculacion[] = []
    selectedArticuloIds.forEach(artId => {
      const decreto = decretos.find(d => d.articulos.some(a => a.id === artId))
      if (!decreto) return
      selectedUcIds.forEach(ucId => {
        const existing = getVinculacionesByArticuloUC(artId, ucId)
        const defaultResps = getUsuariosByUC(ucId).map(u => u.id)
        pending.push({
          articuloId: artId,
          ucId,
          decretoId: decreto.id,
          isExisting: !!existing,
          responsableIds: defaultResps,
          atributo: 'permiso',
          criticidad: 'media',
          estado: 'activo',
        })
      })
    })
    setPendingVinculaciones(pending)
    setConfirmOpen(true)
  }

  const handleConfirm = () => {
    const newOnes = pendingVinculaciones.filter(p => !p.isExisting)
    if (newOnes.length === 0) {
      toast.error('No hay vinculaciones nuevas para crear')
      return
    }

    const now = new Date().toISOString().split('T')[0]
    const vinculaciones: VinculacionNormativa[] = newOnes.map((p, idx) => ({
      id: `v-${Date.now()}-${idx}`,
      decretoId: p.decretoId,
      articuloId: p.articuloId,
      unidadControlId: p.ucId,
      responsableIds: p.responsableIds,
      criticidad: p.criticidad,
      atributo: p.atributo,
      estado: p.estado,
      fechaCreacion: now,
    }))

    addVinculaciones(vinculaciones)

    addActividad({
      id: `act-${Date.now()}`,
      tipo: 'bulk_link',
      descripcion: `Vinculacion masiva: ${newOnes.length} nuevas vinculaciones creadas`,
      fecha: now,
      usuarioId: 'u1',
    })

    toast.success(`${newOnes.length} vinculacion${newOnes.length !== 1 ? 'es' : ''} creada${newOnes.length !== 1 ? 's' : ''}`)
    setConfirmOpen(false)

    setSelectedDecretoIds([])
    setSelectedArticuloIds([])
    setSelectedUcIds([])
  }

  return (
    <div className="space-y-8">
      {/* Mini Dashboard (req #1) */}
      <IdentificacionMiniDashboard />

      <div className="border-t border-border" />

      {/* Section 1: Cuerpos Legales */}
      <CuerposLegalesSection
        decretos={decretos}
        selectedDecretoIds={selectedDecretoIds}
        onToggle={toggleDecreto}
      />

      <div className="border-t border-border" />

      {/* Section 2: Conexion UCs <-> Articulos */}
      <ConexionSection
        selectedDecretoIds={selectedDecretoIds}
        selectedArticuloIds={selectedArticuloIds}
        onToggleArticulo={toggleArticulo}
        selectedUcIds={selectedUcIds}
        onToggleUc={toggleUc}
      />

      {/* Section 3: Generate button */}
      {selectedDecretoIds.length > 0 && (
        <>
          <div className="border-t border-border" />
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              {selectedUcIds.length} unidad{selectedUcIds.length !== 1 ? 'es' : ''} x {selectedArticuloIds.length} articulo{selectedArticuloIds.length !== 1 ? 's' : ''} = {selectedUcIds.length * selectedArticuloIds.length} combinacion{(selectedUcIds.length * selectedArticuloIds.length) !== 1 ? 'es' : ''}
            </div>
            <Button
              onClick={handleOpenConfirmation}
              disabled={!canGenerate}
              className="gap-1.5"
            >
              <Link2 className="h-4 w-4" />
              Generar vinculaciones
            </Button>
          </div>
        </>
      )}

      <div className="border-t border-border" />

      {/* Section 4: Existing vinculaciones table */}
      <VinculacionesTable />

      {/* Confirmation Modal */}
      <ConfirmacionModal
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        pendingVinculaciones={pendingVinculaciones}
        setPendingVinculaciones={setPendingVinculaciones}
        onConfirm={handleConfirm}
      />
    </div>
  )
}
