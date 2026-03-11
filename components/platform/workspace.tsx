'use client'

import React, { useState, useEffect } from 'react'
import { usePlatform, type AppModule, type AppTable, type AppView, type AppColumn, type ViewType } from '@/lib/platform-context'
import { RequisitosLegalesApp } from '@/components/requisitos-legales/requisitos-legales-app'
import { MatrizRiesgoApp } from '@/components/matriz-riesgo/matriz-riesgo-app'
import { DashboardView as InteractiveDashboard } from '@/components/platform/dashboard-grid'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { useShortcuts, type Shortcut } from '@/lib/shortcuts-context'
import { categoryConfig } from '@/lib/platform-context'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { toast } from 'sonner'
import {
  ArrowLeft, Plus, Table2, Kanban, Calendar, LayoutDashboard,
  FileInput, Clock, MoreVertical, Trash2, Pencil, Search,
  ChevronDown, Filter, Download, Upload, Settings, Star,
  Recycle, ShieldAlert, Activity, Leaf, Award,
  FileText, Users, FlaskConical, Scale, CheckCircle2, AlertTriangle, XCircle,
} from 'lucide-react'

const iconMap: Record<string, React.ElementType> = {
  Recycle, ShieldAlert, Activity, Leaf, Award,
  FileText, Users, FlaskConical, Scale, Settings,
}

const viewIcons: Record<ViewType, React.ElementType> = {
  table: Table2,
  kanban: Kanban,
  calendar: Calendar,
  dashboard: LayoutDashboard,
  form: FileInput,
  timeline: Clock,
}

// ---- Table View ----
function TableView({ table, app, onUpdateApp }: { table: AppTable; app: AppModule; onUpdateApp: (data: Partial<AppModule>) => void }) {
  const [editingCell, setEditingCell] = useState<{ rowIdx: number; colId: string } | null>(null)
  const [showAddRow, setShowAddRow] = useState(false)

  const addRow = () => {
    const newRow: Record<string, unknown> = {}
    table.columns.forEach(col => {
      if (col.type === 'checkbox') newRow[col.id] = false
      else if (col.type === 'number') newRow[col.id] = 0
      else newRow[col.id] = ''
    })
    const updatedTable = { ...table, rows: [...table.rows, newRow] }
    onUpdateApp({
      tables: app.tables.map(t => t.id === table.id ? updatedTable : t),
    })
    setShowAddRow(false)
  }

  const updateCell = (rowIdx: number, colId: string, value: unknown) => {
    const updatedRows = table.rows.map((row, i) => i === rowIdx ? { ...row, [colId]: value } : row)
    const updatedTable = { ...table, rows: updatedRows }
    onUpdateApp({
      tables: app.tables.map(t => t.id === table.id ? updatedTable : t),
    })
  }

  const deleteRow = (rowIdx: number) => {
    const updatedRows = table.rows.filter((_, i) => i !== rowIdx)
    const updatedTable = { ...table, rows: updatedRows }
    onUpdateApp({
      tables: app.tables.map(t => t.id === table.id ? updatedTable : t),
    })
  }

  const renderCell = (row: Record<string, unknown>, col: AppColumn, rowIdx: number) => {
    const value = row[col.id]
    const isEditing = editingCell?.rowIdx === rowIdx && editingCell?.colId === col.id

    if (col.type === 'checkbox') {
      return (
        <Checkbox
          checked={value as boolean || false}
          onCheckedChange={(checked) => updateCell(rowIdx, col.id, checked)}
        />
      )
    }

    if (col.type === 'status' && col.options) {
      return (
        <Select
          value={(value as string) || col.options[0]}
          onValueChange={(v) => updateCell(rowIdx, col.id, v)}
        >
          <SelectTrigger className="h-7 text-xs border-none bg-transparent shadow-none px-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {col.options.map(opt => (
              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
    }

    if (col.type === 'select' && col.options) {
      return (
        <Select
          value={(value as string) || ''}
          onValueChange={(v) => updateCell(rowIdx, col.id, v)}
        >
          <SelectTrigger className="h-7 text-xs border-none bg-transparent shadow-none px-0">
            <SelectValue placeholder="Seleccionar..." />
          </SelectTrigger>
          <SelectContent>
            {col.options.map(opt => (
              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
    }

    if (isEditing) {
      return (
        <Input
          autoFocus
          className="h-7 text-xs"
          type={col.type === 'number' ? 'number' : col.type === 'date' ? 'date' : 'text'}
          value={String(value || '')}
          onChange={(e) => {
            const v = col.type === 'number' ? Number(e.target.value) : e.target.value
            updateCell(rowIdx, col.id, v)
          }}
          onBlur={() => setEditingCell(null)}
          onKeyDown={(e) => { if (e.key === 'Enter') setEditingCell(null) }}
        />
      )
    }

    return (
      <span
        className="cursor-text block truncate"
        onClick={() => setEditingCell({ rowIdx, colId: col.id })}
      >
        {value !== null && value !== undefined ? String(value) : <span className="text-muted-foreground/50">--</span>}
      </span>
    )
  }

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar..." className="h-8 pl-8 text-xs w-48" />
          </div>
          <Button variant="outline" size="sm" className="h-8 text-xs">
            <Filter className="mr-1.5 h-3.5 w-3.5" /> Filtrar
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 text-xs">
            <Download className="mr-1.5 h-3.5 w-3.5" /> Exportar
          </Button>
          <Button size="sm" className="h-8 text-xs" onClick={addRow}>
            <Plus className="mr-1.5 h-3.5 w-3.5" /> Agregar Fila
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50">
              <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground w-10">#</th>
              {table.columns.map(col => (
                <th key={col.id} className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground min-w-[120px]">
                  <div className="flex items-center gap-1.5">
                    {col.name}
                    {col.required && <span className="text-destructive">*</span>}
                  </div>
                </th>
              ))}
              <th className="px-3 py-2.5 w-10" />
            </tr>
          </thead>
          <tbody>
            {table.rows.length === 0 ? (
              <tr>
                <td colSpan={table.columns.length + 2} className="px-3 py-10 text-center text-sm text-muted-foreground">
                  No hay datos. Agrega una fila para comenzar.
                </td>
              </tr>
            ) : (
              table.rows.map((row, rowIdx) => (
                <tr key={rowIdx} className="border-t border-border hover:bg-muted/30 transition-colors">
                  <td className="px-3 py-2 text-xs text-muted-foreground">{rowIdx + 1}</td>
                  {table.columns.map(col => (
                    <td key={col.id} className="px-3 py-2 text-xs text-foreground">
                      {renderCell(row, col, rowIdx)}
                    </td>
                  ))}
                  <td className="px-3 py-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-destructive"
                      onClick={() => deleteRow(rowIdx)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="text-xs text-muted-foreground">
        {table.rows.length} fila{table.rows.length !== 1 ? 's' : ''} - {table.columns.length} columna{table.columns.length !== 1 ? 's' : ''}
      </div>
    </div>
  )
}

// ---- Kanban View ----
function KanbanView({ table, app, onUpdateApp }: { table: AppTable; app: AppModule; onUpdateApp: (data: Partial<AppModule>) => void }) {
  const statusCol = table.columns.find(c => c.type === 'status')
  if (!statusCol || !statusCol.options) {
    return (
      <div className="py-10 text-center text-muted-foreground">
        <p className="text-sm">Esta vista necesita una columna de tipo "Estado" con opciones definidas.</p>
      </div>
    )
  }

  const groups = statusCol.options.reduce((acc, status) => {
    acc[status] = table.rows.filter(row => row[statusCol.id] === status)
    return acc
  }, {} as Record<string, Record<string, unknown>[]>)

  const nameCol = table.columns.find(c => c.type === 'text') || table.columns[0]

  return (
    <div className="flex gap-4 overflow-auto pb-4">
      {statusCol.options.map(status => (
        <div key={status} className="flex-shrink-0 w-72">
          <div className="rounded-lg border border-border bg-muted/30">
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-border">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">{status}</span>
                <Badge variant="secondary" className="text-xs">{groups[status]?.length || 0}</Badge>
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
            <div className="p-2 space-y-2 min-h-[100px]">
              {(groups[status] || []).map((row, idx) => (
                <Card key={idx} className="shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-3">
                    <div className="text-sm font-medium text-foreground">{String(row[nameCol.id] || 'Sin titulo')}</div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {table.columns.filter(c => c.id !== nameCol.id && c.id !== statusCol.id && row[c.id]).slice(0, 2).map(col => (
                        <Badge key={col.id} variant="outline" className="text-xs">
                          {String(row[col.id])}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ---- Calendar View ----
function CalendarView({ table }: { table: AppTable }) {
  const dateCol = table.columns.find(c => c.type === 'date')
  const nameCol = table.columns.find(c => c.type === 'text') || table.columns[0]
  const now = new Date()
  const [currentMonth, setCurrentMonth] = useState(now.getMonth())
  const [currentYear, setCurrentYear] = useState(now.getFullYear())

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay()

  const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
  const weekDays = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab']

  const eventsMap: Record<number, Record<string, unknown>[]> = {}
  if (dateCol) {
    table.rows.forEach(row => {
      const dateStr = row[dateCol.id] as string
      if (dateStr) {
        const d = new Date(dateStr)
        if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
          const day = d.getDate()
          if (!eventsMap[day]) eventsMap[day] = []
          eventsMap[day].push(row)
        }
      }
    })
  }

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1) }
    else setCurrentMonth(currentMonth - 1)
  }
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1) }
    else setCurrentMonth(currentMonth + 1)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={prevMonth}>Anterior</Button>
        <h3 className="text-base font-semibold text-foreground">{months[currentMonth]} {currentYear}</h3>
        <Button variant="outline" size="sm" onClick={nextMonth}>Siguiente</Button>
      </div>
      <div className="grid grid-cols-7 rounded-lg border border-border overflow-hidden">
        {weekDays.map(d => (
          <div key={d} className="bg-muted/50 px-2 py-2 text-center text-xs font-medium text-muted-foreground border-b border-border">
            {d}
          </div>
        ))}
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="bg-muted/20 min-h-[80px] border-b border-r border-border" />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1
          const events = eventsMap[day] || []
          const isToday = day === now.getDate() && currentMonth === now.getMonth() && currentYear === now.getFullYear()
          return (
            <div
              key={day}
              className={`min-h-[80px] border-b border-r border-border p-1.5 ${isToday ? 'bg-primary/5' : 'hover:bg-muted/30'}`}
            >
              <div className={`text-xs font-medium mb-1 ${isToday ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
                {day}
              </div>
              {events.slice(0, 2).map((ev, idx) => (
                <div key={idx} className="text-xs bg-primary/10 text-primary rounded px-1 py-0.5 mb-0.5 truncate">
                  {nameCol ? String(ev[nameCol.id]) : 'Evento'}
                </div>
              ))}
              {events.length > 2 && (
                <div className="text-xs text-muted-foreground">+{events.length - 2} mas</div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ---- Dashboard View ----
function DashboardView({ table, app }: { table: AppTable; app: AppModule }) {
  const statusCol = table.columns.find(c => c.type === 'status')
  const numberCols = table.columns.filter(c => c.type === 'number')
  const selectCols = table.columns.filter(c => c.type === 'select')

  // Status distribution
  const statusCounts: Record<string, number> = {}
  if (statusCol && statusCol.options) {
    statusCol.options.forEach(opt => { statusCounts[opt] = 0 })
    table.rows.forEach(row => {
      const val = row[statusCol.id] as string
      if (val) statusCounts[val] = (statusCounts[val] || 0) + 1
    })
  }

  // Number aggregates
  const numberStats = numberCols.map(col => {
    const values = table.rows.map(r => Number(r[col.id]) || 0)
    const sum = values.reduce((a, b) => a + b, 0)
    const avg = values.length > 0 ? sum / values.length : 0
    const max = values.length > 0 ? Math.max(...values) : 0
    return { col, sum, avg, max, count: values.length }
  })

  const statusColors: Record<string, string> = {
    'Completado': '#059669', 'Conforme': '#059669', 'Controlado': '#059669', 'Cerrado': '#6B7280',
    'Cumplida': '#059669', 'Vigente': '#059669', 'Reciclado': '#059669', 'Dispuesto': '#2563EB',
    'En Proceso': '#CA8A04', 'En Evaluacion': '#CA8A04', 'En Curso': '#CA8A04', 'En Transito': '#CA8A04',
    'Pendiente': '#EA580C', 'Identificado': '#EA580C', 'Por Vencer': '#EA580C', 'Almacenado': '#0891B2',
    'No Conforme': '#DC2626', 'No Cumplida': '#DC2626', 'Critico': '#DC2626', 'En Riesgo': '#DC2626', 'Vencido': '#DC2626',
    'Retirado': '#6B7280',
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">Total Registros</div>
            <div className="text-2xl font-bold text-foreground mt-1">{table.rows.length}</div>
          </CardContent>
        </Card>
        {numberStats.slice(0, 3).map(stat => (
          <Card key={stat.col.id}>
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground">{stat.col.name} (Total)</div>
              <div className="text-2xl font-bold text-foreground mt-1">{stat.sum.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground mt-1">Promedio: {stat.avg.toFixed(1)}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Status distribution */}
      {statusCol && Object.keys(statusCounts).length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Distribucion por Estado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(statusCounts).map(([status, count]) => {
                const total = table.rows.length
                const pct = total > 0 ? (count / total) * 100 : 0
                const color = statusColors[status] || app.color
                return (
                  <div key={status} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-foreground">{status}</span>
                      <span className="text-muted-foreground">{count} ({pct.toFixed(0)}%)</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: color }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Select distribution */}
      {selectCols.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {selectCols.slice(0, 2).map(col => {
            const counts: Record<string, number> = {}
            table.rows.forEach(row => {
              const val = row[col.id] as string
              if (val) counts[val] = (counts[val] || 0) + 1
            })
            return (
              <Card key={col.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Por {col.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(counts).map(([val, count]) => (
                      <div key={val} className="flex items-center justify-between text-sm">
                        <span className="text-foreground">{val}</span>
                        <Badge variant="secondary" className="text-xs">{count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ---- Form View ----
function FormView({ table, app, onUpdateApp }: { table: AppTable; app: AppModule; onUpdateApp: (data: Partial<AppModule>) => void }) {
  const [formData, setFormData] = useState<Record<string, unknown>>({})
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = () => {
    const newRow: Record<string, unknown> = {}
    table.columns.forEach(col => {
      newRow[col.id] = formData[col.id] ?? (col.type === 'checkbox' ? false : col.type === 'number' ? 0 : '')
    })
    const updatedTable = { ...table, rows: [...table.rows, newRow] }
    onUpdateApp({
      tables: app.tables.map(t => t.id === table.id ? updatedTable : t),
    })
    setFormData({})
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 2000)
  }

  return (
    <Card className="max-w-xl mx-auto">
      <CardHeader>
        <CardTitle className="text-base">Nuevo Registro - {table.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {submitted && (
          <div className="rounded-lg bg-success/10 text-success px-4 py-3 text-sm flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" /> Registro agregado correctamente
          </div>
        )}
        {table.columns.map(col => (
          <div key={col.id} className="space-y-1.5">
            <Label className="text-sm">
              {col.name} {col.required && <span className="text-destructive">*</span>}
            </Label>
            {col.type === 'text' || col.type === 'user' ? (
              <Input
                value={String(formData[col.id] || '')}
                onChange={(e) => setFormData({ ...formData, [col.id]: e.target.value })}
              />
            ) : col.type === 'number' ? (
              <Input
                type="number"
                value={String(formData[col.id] || '')}
                onChange={(e) => setFormData({ ...formData, [col.id]: Number(e.target.value) })}
              />
            ) : col.type === 'date' ? (
              <Input
                type="date"
                value={String(formData[col.id] || '')}
                onChange={(e) => setFormData({ ...formData, [col.id]: e.target.value })}
              />
            ) : col.type === 'checkbox' ? (
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={formData[col.id] as boolean || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, [col.id]: checked })}
                />
                <span className="text-sm text-muted-foreground">Activar</span>
              </div>
            ) : (col.type === 'select' || col.type === 'status') && col.options ? (
              <Select
                value={String(formData[col.id] || '')}
                onValueChange={(v) => setFormData({ ...formData, [col.id]: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  {col.options.map(opt => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                value={String(formData[col.id] || '')}
                onChange={(e) => setFormData({ ...formData, [col.id]: e.target.value })}
              />
            )}
          </div>
        ))}
        <Button className="w-full" onClick={handleSubmit}>
          <Plus className="mr-2 h-4 w-4" /> Agregar Registro
        </Button>
      </CardContent>
    </Card>
  )
}

// ---- Main Workspace ----
export function AppWorkspace() {
  const { activeApp, setActiveApp, setCurrentView, updateApp, initialViewId } = usePlatform()
  const { addShortcut, removeShortcut, isShortcut } = useShortcuts()
  const [activeViewId, setActiveViewId] = useState<string | null>(initialViewId)

  useEffect(() => {
    if (initialViewId) {
      setActiveViewId(initialViewId)
    }
  }, [initialViewId])

  if (!activeApp) return null

  // Custom app rendering for template-based apps
  if (activeApp.templateId === 'tpl-requisitos-legales') {
    return (
      <RequisitosLegalesApp
        onBack={() => {
          setActiveApp(null)
          setCurrentView('hub')
        }}
      />
    )
  }

  if (activeApp.templateId === 'tpl-matriz-riesgo') {
    return (
      <MatrizRiesgoApp
        onBack={() => {
          setActiveApp(null)
          setCurrentView('hub')
        }}
      />
    )
  }

  const Icon = iconMap[activeApp.icon] || Settings
  const views = activeApp.views
  const activeView = views.find(v => v.id === activeViewId) || views[0]
  const activeTable = activeApp.tables.find(t => t.id === activeView?.tableId) || activeApp.tables[0]

  const handleBack = () => {
    setActiveApp(null)
    setCurrentView('hub')
  }

  const handleUpdateApp = (data: Partial<AppModule>) => {
    updateApp(activeApp.id, data)
    // Also update local state
    if (data.tables) {
      setActiveApp({ ...activeApp, ...data } as AppModule)
    }
  }

  const currentViewIsShortcut = activeView ? isShortcut(activeApp.id, activeView.id) : false

  const toggleShortcut = () => {
    if (!activeView) return
    const shortcutId = `${activeApp.id}-${activeView.id}`
    if (currentViewIsShortcut) {
      removeShortcut(shortcutId)
      toast('Vista eliminada de atajos', {
        description: `${activeApp.name} | ${activeView.name}`,
      })
    } else {
      const newShortcut: Shortcut = {
        id: shortcutId,
        appId: activeApp.id,
        viewId: activeView.id,
        appName: categoryConfig[activeApp.category]?.label || activeApp.name,
        viewName: activeView.name,
        appIcon: activeApp.icon,
        appColor: activeApp.color,
        viewType: activeView.type,
      }
      addShortcut(newShortcut)
      toast('Vista agregada a Atajos', {
        description: `${activeApp.name} | ${activeView.name}`,
      })
    }
  }

  const renderView = () => {
    if (!activeView || !activeTable) {
      // Show interactive dashboard grid when no views are configured
      return <InteractiveDashboard />
    }

    switch (activeView.type) {
      case 'table':
        return <TableView table={activeTable} app={activeApp} onUpdateApp={handleUpdateApp} />
      case 'kanban':
        return <KanbanView table={activeTable} app={activeApp} onUpdateApp={handleUpdateApp} />
      case 'calendar':
        return <CalendarView table={activeTable} />
      case 'dashboard':
        // Use interactive dashboard grid for dashboard views
        return activeTable?.rows?.length > 0 
          ? <DashboardView table={activeTable} app={activeApp} />
          : <InteractiveDashboard />
      case 'form':
        return <FormView table={activeTable} app={activeApp} onUpdateApp={handleUpdateApp} />
      case 'timeline':
        return <CalendarView table={activeTable} />
      default:
        return <TableView table={activeTable} app={activeApp} onUpdateApp={handleUpdateApp} />
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="h-5 w-px bg-border" />
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${activeApp.color}15`, color: activeApp.color }}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <h1 className="text-sm font-semibold text-foreground">{activeApp.name}</h1>
                <p className="text-xs text-muted-foreground">{activeApp.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="secondary"
                    size="sm"
                    className={`h-8 text-xs gap-1.5 ${currentViewIsShortcut ? 'text-amber-500 hover:text-amber-600' : ''}`}
                    onClick={toggleShortcut}
                  >
                    <Star className={`h-3.5 w-3.5 ${currentViewIsShortcut ? 'fill-amber-500' : ''}`} />
                    {currentViewIsShortcut ? 'Quitar de Atajos' : 'Agregar a Atajos'}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  {currentViewIsShortcut ? 'Quitar esta vista de atajos' : 'Agregar esta vista como atajo rapido'}
                </TooltipContent>
              </Tooltip>
              <Button variant="outline" size="sm" className="h-8 text-xs">
                <Settings className="mr-1.5 h-3.5 w-3.5" /> Configurar
              </Button>
            </div>
          </div>

          {/* View tabs */}
          {views.length > 0 && (
            <div className="mt-3 flex items-center gap-1 -mb-px">
              {views.map(view => {
                const VIcon = viewIcons[view.type] || Table2
                const isActive = (activeView?.id === view.id) || (!activeViewId && view.id === views[0]?.id)
                return (
                  <button
                    key={view.id}
                    onClick={() => setActiveViewId(view.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
                      isActive
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                    }`}
                  >
                    <VIcon className="h-3.5 w-3.5" />
                    {view.name}
                  </button>
                )
              })}
              <button className="flex items-center gap-1 px-3 py-2 text-xs text-muted-foreground hover:text-foreground border-b-2 border-transparent">
                <Plus className="h-3 w-3" /> Vista
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 p-6">
        {renderView()}
      </div>
    </div>
  )
}
