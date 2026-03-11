'use client'

import React, { useState } from 'react'
import { useMatrizRiesgo } from '@/lib/matriz-riesgo/context'
import {
  PARAMETRO_CATEGORIA_LABELS,
  type ParametroCategoria, type ParametroItem,
} from '@/lib/matriz-riesgo/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import {
  Plus, Pencil, Trash2, Search, Settings2,
  ChevronRight, X,
} from 'lucide-react'

const CATEGORIAS_ORDER: ParametroCategoria[] = [
  'peligros', 'familias_peligros', 'riesgos_especificos',
  'probabilidad', 'consecuencia', 'nivel_riesgo',
  'verificadores', 'familias_verificadores',
  'tipos_riesgo', 'calidad_control', 'orden_prelacion',
]

// --- Create/Edit Modal ---
function ParametroModal({
  open,
  onOpenChange,
  categoria,
  editData,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  categoria: ParametroCategoria
  editData?: ParametroItem | null
}) {
  const { addParametro, updateParametro, parametros, addActividad, usuarios } = useMatrizRiesgo()

  const [nombre, setNombre] = useState(editData?.nombre || '')
  const [valor, setValor] = useState<string>(editData?.valor?.toString() || '')
  const [descripcion, setDescripcion] = useState(editData?.descripcion || '')
  const [color, setColor] = useState(editData?.color || '')
  const [familiaId, setFamiliaId] = useState(editData?.familiaId || '')
  const [agenteRiesgo, setAgenteRiesgo] = useState(editData?.agenteRiesgo || '')
  const [efectoAgente, setEfectoAgente] = useState(editData?.efectoAgente || '')

  React.useEffect(() => {
    if (open) {
      setNombre(editData?.nombre || '')
      setValor(editData?.valor?.toString() || '')
      setDescripcion(editData?.descripcion || '')
      setColor(editData?.color || '')
      setFamiliaId(editData?.familiaId || '')
      setAgenteRiesgo(editData?.agenteRiesgo || '')
      setEfectoAgente(editData?.efectoAgente || '')
    }
  }, [open, editData])

  const showValor = ['probabilidad', 'consecuencia', 'nivel_riesgo', 'calidad_control', 'orden_prelacion'].includes(categoria)
  const showFamilia = ['peligros', 'riesgos_especificos', 'verificadores'].includes(categoria)
  const showRiesgoFields = categoria === 'riesgos_especificos'
  const showColor = categoria === 'nivel_riesgo'

  // Get available families
  const familias = categoria === 'peligros' ? parametros.familias_peligros
    : categoria === 'riesgos_especificos' ? parametros.familias_peligros
    : categoria === 'verificadores' ? parametros.familias_verificadores
    : []

  const handleSubmit = () => {
    if (!nombre.trim()) {
      toast.error('El nombre es requerido')
      return
    }
    if (editData) {
      updateParametro(categoria, editData.id, {
        nombre: nombre.trim(),
        valor: showValor && valor ? Number(valor) : undefined,
        descripcion: descripcion.trim() || undefined,
        color: showColor ? color || undefined : undefined,
        familiaId: showFamilia ? familiaId || undefined : undefined,
        agenteRiesgo: showRiesgoFields ? agenteRiesgo || undefined : undefined,
        efectoAgente: showRiesgoFields ? efectoAgente || undefined : undefined,
      })
      toast.success('Parametro actualizado')
    } else {
      const id = `${categoria.slice(0, 3)}-${Date.now()}`
      addParametro(categoria, {
        id,
        nombre: nombre.trim(),
        valor: showValor && valor ? Number(valor) : undefined,
        descripcion: descripcion.trim() || undefined,
        color: showColor ? color || undefined : undefined,
        familiaId: showFamilia ? familiaId || undefined : undefined,
        agenteRiesgo: showRiesgoFields ? agenteRiesgo || undefined : undefined,
        efectoAgente: showRiesgoFields ? efectoAgente || undefined : undefined,
      })
      addActividad({
        id: `act-${Date.now()}`,
        tipo: 'parametro_modificado',
        descripcion: `Parametro creado en ${PARAMETRO_CATEGORIA_LABELS[categoria]}: ${nombre.trim()}`,
        fecha: new Date().toISOString().split('T')[0],
        usuarioId: usuarios[0]?.id || 'u1',
      })
      toast.success('Parametro creado')
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] p-0 flex flex-col overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-0 shrink-0">
          <DialogTitle className="text-base">
            {editData ? 'Editar' : 'Nuevo'} - {PARAMETRO_CATEGORIA_LABELS[categoria]}
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-6">
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-sm">Nombre <span className="text-destructive">*</span></Label>
              <Input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre del parametro..." />
            </div>

            {showValor && (
              <div className="space-y-2">
                <Label className="text-sm">Valor numerico</Label>
                <Input type="number" value={valor} onChange={e => setValor(e.target.value)} placeholder="Valor..." />
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-sm">Descripcion</Label>
              <Textarea value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="Descripcion..." rows={2} />
            </div>

            {showColor && (
              <div className="space-y-2">
                <Label className="text-sm">Color (token)</Label>
                <Input value={color} onChange={e => setColor(e.target.value)} placeholder="Ej: success, warning, destructive..." />
              </div>
            )}

            {showFamilia && familias.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm">Familia</Label>
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={familiaId}
                  onChange={e => setFamiliaId(e.target.value)}
                >
                  <option value="">Sin familia</option>
                  {familias.map(f => (
                    <option key={f.id} value={f.id}>{f.nombre}</option>
                  ))}
                </select>
              </div>
            )}

            {showRiesgoFields && (
              <>
                <div className="space-y-2">
                  <Label className="text-sm">Agente de riesgo</Label>
                  <Input value={agenteRiesgo} onChange={e => setAgenteRiesgo(e.target.value)} placeholder="Agente de riesgo..." />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Efecto del agente</Label>
                  <Input value={efectoAgente} onChange={e => setEfectoAgente(e.target.value)} placeholder="Efecto del agente..." />
                </div>
              </>
            )}
          </div>
        </div>
        <div className="shrink-0 flex justify-end gap-2 px-6 py-4 border-t border-border">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit}>{editData ? 'Guardar' : 'Crear'}</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// --- Main View ---
export function ParametrosView() {
  const { parametros, deleteParametro } = useMatrizRiesgo()

  const [selectedCategoria, setSelectedCategoria] = useState<ParametroCategoria>('peligros')
  const [searchQuery, setSearchQuery] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [editItem, setEditItem] = useState<ParametroItem | null>(null)

  const items = parametros[selectedCategoria] || []
  const filtered = searchQuery
    ? items.filter(item => item.nombre.toLowerCase().includes(searchQuery.toLowerCase()))
    : items

  const handleDelete = (id: string) => {
    deleteParametro(selectedCategoria, id)
    toast.success('Parametro eliminado')
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Categories sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Settings2 className="h-4 w-4 text-muted-foreground" />
                Categorias
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <ScrollArea className="h-[calc(100vh-320px)]">
                <div className="space-y-0.5">
                  {CATEGORIAS_ORDER.map(cat => {
                    const count = parametros[cat]?.length || 0
                    const isActive = selectedCategoria === cat
                    return (
                      <button
                        key={cat}
                        onClick={() => { setSelectedCategoria(cat); setSearchQuery('') }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                          isActive
                            ? 'bg-primary/10 text-primary'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                        }`}
                      >
                        <span className="truncate">{PARAMETRO_CATEGORIA_LABELS[cat]}</span>
                        <div className="flex items-center gap-1.5">
                          <Badge variant="secondary" className="text-[10px] h-5 min-w-[20px] justify-center">{count}</Badge>
                          <ChevronRight className={`h-3 w-3 transition-transform ${isActive ? 'rotate-90' : ''}`} />
                        </div>
                      </button>
                    )
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Items list */}
        <div className="lg:col-span-3">
          <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={`Buscar en ${PARAMETRO_CATEGORIA_LABELS[selectedCategoria]}...`}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button size="sm" className="gap-1.5" onClick={() => setCreateOpen(true)}>
                <Plus className="h-3.5 w-3.5" /> Agregar
              </Button>
            </div>

            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-foreground">
                {PARAMETRO_CATEGORIA_LABELS[selectedCategoria]}
              </h3>
              <span className="text-xs text-muted-foreground">{filtered.length} item{filtered.length !== 1 ? 's' : ''}</span>
            </div>

            {/* Items table */}
            <div className="rounded-lg border border-border overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">Nombre</th>
                    {['probabilidad', 'consecuencia', 'nivel_riesgo', 'calidad_control', 'orden_prelacion'].includes(selectedCategoria) && (
                      <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">Valor</th>
                    )}
                    {selectedCategoria === 'riesgos_especificos' && (
                      <>
                        <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">Agente</th>
                        <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">Efecto</th>
                      </>
                    )}
                    {['peligros', 'riesgos_especificos', 'verificadores'].includes(selectedCategoria) && (
                      <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">Familia</th>
                    )}
                    <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">Descripcion</th>
                    <th className="px-3 py-2.5 w-20" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="px-3 py-12 text-center text-sm text-muted-foreground">
                        No hay parametros en esta categoria.
                      </td>
                    </tr>
                  ) : filtered.map(item => {
                    const familia = item.familiaId
                      ? (selectedCategoria === 'verificadores'
                          ? parametros.familias_verificadores.find(f => f.id === item.familiaId)
                          : parametros.familias_peligros.find(f => f.id === item.familiaId))
                      : undefined

                    return (
                      <tr key={item.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                        <td className="px-3 py-2.5">
                          <span className="text-sm font-medium text-foreground">{item.nombre}</span>
                        </td>
                        {['probabilidad', 'consecuencia', 'nivel_riesgo', 'calidad_control', 'orden_prelacion'].includes(selectedCategoria) && (
                          <td className="px-3 py-2.5">
                            <Badge variant="secondary" className="text-xs">{item.valor}</Badge>
                          </td>
                        )}
                        {selectedCategoria === 'riesgos_especificos' && (
                          <>
                            <td className="px-3 py-2.5 text-xs text-muted-foreground">{item.agenteRiesgo || '-'}</td>
                            <td className="px-3 py-2.5 text-xs text-muted-foreground">{item.efectoAgente || '-'}</td>
                          </>
                        )}
                        {['peligros', 'riesgos_especificos', 'verificadores'].includes(selectedCategoria) && (
                          <td className="px-3 py-2.5">
                            {familia ? (
                              <Badge variant="outline" className="text-xs">{familia.nombre}</Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground">-</span>
                            )}
                          </td>
                        )}
                        <td className="px-3 py-2.5 text-xs text-muted-foreground max-w-[200px] truncate">
                          {item.descripcion || '-'}
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditItem(item)}>
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(item.id)}>
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
          </div>
        </div>
      </div>

      {/* Create Modal */}
      <ParametroModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        categoria={selectedCategoria}
      />

      {/* Edit Modal */}
      <ParametroModal
        open={!!editItem}
        onOpenChange={(v) => !v && setEditItem(null)}
        categoria={selectedCategoria}
        editData={editItem}
      />
    </div>
  )
}
