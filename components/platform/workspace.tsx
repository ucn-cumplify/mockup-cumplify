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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
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

// ---- Custom Requisitos Legales View (Cloned Logic) ----
interface CustomRLViewProps {
  viewId: string
  viewName: string
  data?: {
    vinculaciones: unknown[]
    evaluaciones: unknown[]
    resultados: unknown[]
    hallazgos: unknown[]
  }
  onUpdateData: (data: { vinculaciones: unknown[]; evaluaciones: unknown[]; resultados: unknown[]; hallazgos: unknown[] }) => void
}

function CustomRequisitosLegalesView({ viewId, viewName, data, onUpdateData }: CustomRLViewProps) {
  const [activeTab, setActiveTab] = useState<'identificacion' | 'evaluacion' | 'control' | 'historial'>('identificacion')
  
  // Initialize data if empty
  const viewData = data || { vinculaciones: [], evaluaciones: [], resultados: [], hallazgos: [] }
  
  const tabConfig = [
    { id: 'identificacion', label: 'Identificacion', icon: Search, description: 'Vincula articulos normativos con unidades de control' },
    { id: 'evaluacion', label: 'Evaluacion', icon: CheckCircle2, description: 'Evalua el cumplimiento de cada vinculacion' },
    { id: 'control', label: 'Control', icon: ShieldAlert, description: 'Gestiona hallazgos y acciones correctivas' },
    { id: 'historial', label: 'Historial', icon: Clock, description: 'Registro de todas las actividades' },
  ] as const
  
  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-500/10">
            <Scale className="h-5 w-5 text-teal-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">{viewName}</h2>
            <p className="text-sm text-muted-foreground">Vista tipo Requisitos Legales</p>
          </div>
        </div>
        <Badge variant="outline" className="border-teal-500/50 text-teal-600">
          Logica Clonada
        </Badge>
      </div>
      
      {/* Tab Navigation */}
      <div className="flex items-center gap-1 border-b">
        {tabConfig.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                isActive 
                  ? 'border-teal-500 text-teal-600' 
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          )
        })}
      </div>
      
      {/* Tab Content */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {tabConfig.find(t => t.id === activeTab)?.label}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {tabConfig.find(t => t.id === activeTab)?.description}
          </p>
        </CardHeader>
        <CardContent>
          {activeTab === 'identificacion' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {viewData.vinculaciones.length} vinculaciones registradas
                </p>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Nueva Vinculacion
                </Button>
              </div>
              {viewData.vinculaciones.length === 0 ? (
                <div className="py-12 text-center border-2 border-dashed rounded-lg">
                  <Scale className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="font-medium text-muted-foreground mb-2">Sin vinculaciones</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Comienza creando vinculaciones entre articulos normativos y unidades de control
                  </p>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Crear Primera Vinculacion
                  </Button>
                </div>
              ) : (
                <div className="border rounded-lg divide-y">
                  {/* Table headers */}
                  <div className="grid grid-cols-5 gap-4 px-4 py-2 bg-muted/50 text-xs font-medium text-muted-foreground">
                    <div>Decreto/Articulo</div>
                    <div>Unidad de Control</div>
                    <div>Criticidad</div>
                    <div>Estado</div>
                    <div>Acciones</div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'evaluacion' && (
            <div className="py-12 text-center border-2 border-dashed rounded-lg">
              <CheckCircle2 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="font-medium text-muted-foreground mb-2">Evaluaciones</h3>
              <p className="text-sm text-muted-foreground">
                Crea evaluaciones para medir el cumplimiento de las vinculaciones
              </p>
            </div>
          )}
          
          {activeTab === 'control' && (
            <div className="py-12 text-center border-2 border-dashed rounded-lg">
              <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="font-medium text-muted-foreground mb-2">
                {viewData.hallazgos.length} hallazgos
              </h3>
              <p className="text-sm text-muted-foreground">
                Gestiona los hallazgos detectados en las evaluaciones
              </p>
            </div>
          )}
          
          {activeTab === 'historial' && (
            <div className="py-12 text-center border-2 border-dashed rounded-lg">
              <Clock className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="font-medium text-muted-foreground mb-2">Historial de Actividades</h3>
              <p className="text-sm text-muted-foreground">
                Registro cronologico de todas las acciones realizadas
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ---- Custom Matriz Riesgo View (Cloned Logic) ----
interface CustomMRViewProps {
  viewId: string
  viewName: string
  data?: {
    procesos: unknown[]
    tareas: unknown[]
    filasIPER: unknown[]
    medidas: unknown[]
    parametros: unknown
  }
  onUpdateData: (data: { procesos: unknown[]; tareas: unknown[]; filasIPER: unknown[]; medidas: unknown[]; parametros: unknown }) => void
}

function CustomMatrizRiesgoView({ viewId, viewName, data, onUpdateData }: CustomMRViewProps) {
  const [activeTab, setActiveTab] = useState<'identificacion' | 'evaluacion' | 'verificaciones' | 'matriz' | 'parametros'>('identificacion')
  
  const viewData = data || { procesos: [], tareas: [], filasIPER: [], medidas: [], parametros: {} }
  
  const tabConfig = [
    { id: 'identificacion', label: 'Identificacion', icon: Search, description: 'Define procesos, tareas y peligros' },
    { id: 'evaluacion', label: 'Evaluacion', icon: CheckCircle2, description: 'Evalua riesgos con Probabilidad x Consecuencia' },
    { id: 'verificaciones', label: 'Verificaciones', icon: Activity, description: 'Verifica cumplimiento de medidas preventivas' },
    { id: 'matriz', label: 'Matriz PxC', icon: LayoutDashboard, description: 'Visualiza la matriz de riesgos' },
    { id: 'parametros', label: 'Parametros', icon: Settings, description: 'Configura escalas y criterios' },
  ] as const
  
  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
            <ShieldAlert className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">{viewName}</h2>
            <p className="text-sm text-muted-foreground">Vista tipo Matriz de Riesgo (IPER)</p>
          </div>
        </div>
        <Badge variant="outline" className="border-red-500/50 text-red-600">
          Logica Clonada
        </Badge>
      </div>
      
      {/* Tab Navigation */}
      <div className="flex items-center gap-1 border-b overflow-x-auto">
        {tabConfig.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                isActive 
                  ? 'border-red-500 text-red-600' 
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          )
        })}
      </div>
      
      {/* Tab Content */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {tabConfig.find(t => t.id === activeTab)?.label}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {tabConfig.find(t => t.id === activeTab)?.description}
          </p>
        </CardHeader>
        <CardContent>
          {activeTab === 'identificacion' && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-2 border-dashed">
                  <CardContent className="pt-6 text-center">
                    <div className="text-2xl font-bold">{viewData.procesos.length}</div>
                    <p className="text-sm text-muted-foreground">Procesos</p>
                    <Button variant="outline" size="sm" className="mt-3">
                      <Plus className="h-3 w-3 mr-1" />
                      Agregar
                    </Button>
                  </CardContent>
                </Card>
                <Card className="border-2 border-dashed">
                  <CardContent className="pt-6 text-center">
                    <div className="text-2xl font-bold">{viewData.tareas.length}</div>
                    <p className="text-sm text-muted-foreground">Tareas</p>
                    <Button variant="outline" size="sm" className="mt-3">
                      <Plus className="h-3 w-3 mr-1" />
                      Agregar
                    </Button>
                  </CardContent>
                </Card>
                <Card className="border-2 border-dashed">
                  <CardContent className="pt-6 text-center">
                    <div className="text-2xl font-bold">{viewData.filasIPER.length}</div>
                    <p className="text-sm text-muted-foreground">Filas IPER</p>
                    <Button variant="outline" size="sm" className="mt-3">
                      <Plus className="h-3 w-3 mr-1" />
                      Agregar
                    </Button>
                  </CardContent>
                </Card>
              </div>
              
              {viewData.procesos.length === 0 && (
                <div className="py-8 text-center border-2 border-dashed rounded-lg mt-4">
                  <ShieldAlert className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="font-medium text-muted-foreground mb-2">Comienza identificando procesos</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Define los procesos de tu organizacion para luego agregar tareas y peligros
                  </p>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'evaluacion' && (
            <div className="py-12 text-center border-2 border-dashed rounded-lg">
              <CheckCircle2 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="font-medium text-muted-foreground mb-2">Evaluacion de Riesgos</h3>
              <p className="text-sm text-muted-foreground">
                Evalua cada riesgo con Probabilidad x Consecuencia para obtener el VEP
              </p>
            </div>
          )}
          
          {activeTab === 'verificaciones' && (
            <div className="py-12 text-center border-2 border-dashed rounded-lg">
              <CheckCircle2 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="font-medium text-muted-foreground mb-2">Verificaciones</h3>
              <p className="text-sm text-muted-foreground">
                Verifica el cumplimiento de las medidas preventivas definidas
              </p>
            </div>
          )}
          
          {activeTab === 'matriz' && (
            <div className="py-8">
              <div className="text-center mb-6">
                <h3 className="font-medium mb-2">Matriz de Probabilidad x Consecuencia</h3>
                <p className="text-sm text-muted-foreground">
                  Visualizacion de riesgos segun su nivel
                </p>
              </div>
              {/* Simple 5x5 matrix visualization */}
              <div className="max-w-md mx-auto">
                <div className="grid grid-cols-6 gap-1 text-xs">
                  <div className="p-2"></div>
                  {[1, 2, 3, 4, 5].map(c => (
                    <div key={c} className="p-2 text-center font-medium">C{c}</div>
                  ))}
                  {[5, 4, 3, 2, 1].map(p => (
                    <React.Fragment key={p}>
                      <div className="p-2 font-medium">P{p}</div>
                      {[1, 2, 3, 4, 5].map(c => {
                        const vep = p * c
                        let color = 'bg-green-100 text-green-800'
                        if (vep > 16) color = 'bg-red-100 text-red-800'
                        else if (vep > 9) color = 'bg-orange-100 text-orange-800'
                        else if (vep > 4) color = 'bg-yellow-100 text-yellow-800'
                        return (
                          <div key={`${p}-${c}`} className={`p-2 text-center rounded ${color}`}>
                            {vep}
                          </div>
                        )
                      })}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'parametros' && (
            <div className="py-12 text-center border-2 border-dashed rounded-lg">
              <Settings className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="font-medium text-muted-foreground mb-2">Parametros Configurables</h3>
              <p className="text-sm text-muted-foreground">
                Define escalas de probabilidad, consecuencia, niveles de riesgo y verificadores
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ---- Main Workspace ----
// View Logic Types - allows cloning functionality from existing modules
export type ViewLogicType = 'dashboard' | 'requisitos-legales' | 'matriz-riesgo' | 'table'

export interface CustomViewData {
  viewId: string
  logicType: ViewLogicType
  dashboardWidgets: unknown[]
  // For requisitos-legales type
  rlData?: {
    vinculaciones: unknown[]
    evaluaciones: unknown[]
    resultados: unknown[]
    hallazgos: unknown[]
  }
  // For matriz-riesgo type
  mrData?: {
    procesos: unknown[]
    tareas: unknown[]
    filasIPER: unknown[]
    medidas: unknown[]
    parametros: unknown
  }
}

// View logic type configuration
const viewLogicConfig: Record<ViewLogicType, { 
  label: string
  description: string 
  icon: React.ElementType
  color: string
}> = {
  'dashboard': {
    label: 'Dashboard Personalizado',
    description: 'Crea un dashboard vacio con widgets arrastrables (KPIs, graficos)',
    icon: LayoutDashboard,
    color: '#6B7280',
  },
  'table': {
    label: 'Tabla de Datos',
    description: 'Vista de tabla simple con columnas personalizables',
    icon: Table2,
    color: '#3B82F6',
  },
  'requisitos-legales': {
    label: 'Tipo Requisitos Legales',
    description: 'Clona la logica de vinculaciones normativas, evaluaciones de cumplimiento y hallazgos',
    icon: Scale,
    color: '#0D9488',
  },
  'matriz-riesgo': {
    label: 'Tipo Matriz de Riesgo',
    description: 'Clona la logica IPER: procesos, tareas, peligros, riesgos y medidas preventivas',
    icon: ShieldAlert,
    color: '#DC2626',
  },
}

export function AppWorkspace() {
  const { activeApp, setActiveApp, setCurrentView, updateApp, initialViewId } = usePlatform()
  const { addShortcut, removeShortcut, isShortcut } = useShortcuts()
  const [activeViewId, setActiveViewId] = useState<string | null>(initialViewId)
  
  // Dialog states for adding/deleting views
  const [showAddViewDialog, setShowAddViewDialog] = useState(false)
  const [newViewName, setNewViewName] = useState('')
  const [selectedLogicType, setSelectedLogicType] = useState<ViewLogicType>('dashboard')
  const [viewToDelete, setViewToDelete] = useState<AppView | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  
  // Store custom view data with logic type
  const [customViewData, setCustomViewData] = useState<CustomViewData[]>([])

  useEffect(() => {
    if (initialViewId) {
      setActiveViewId(initialViewId)
    }
  }, [initialViewId])
  
  // Create a new custom view with selected logic type
  const handleCreateView = () => {
    if (!newViewName.trim() || !activeApp) return
    
    const viewType: ViewType = selectedLogicType === 'table' ? 'table' : 'dashboard'
    
    const newView: AppView = {
      id: `view-${Date.now()}`,
      name: newViewName.trim(),
      type: viewType,
      tableId: activeApp.tables[0]?.id || '',
      config: {
        logicType: selectedLogicType,
      }
    }
    
    const updatedViews = [...activeApp.views, newView]
    updateApp(activeApp.id, { views: updatedViews })
    
    // Initialize view data based on logic type
    const newViewData: CustomViewData = {
      viewId: newView.id,
      logicType: selectedLogicType,
      dashboardWidgets: [],
    }
    
    // Initialize data structures with sample data for cloned logic types
    if (selectedLogicType === 'requisitos-legales') {
      newViewData.rlData = {
        vinculaciones: [
          { id: 'vinc-1', norma: 'D.S. 40/2012', articulo: '5', descripcion: 'Reglamento sobre prevencion de riesgos profesionales', unidadControl: 'Planta Principal', criticidad: 'alta', estado: 'cumple', fechaVinculacion: '2024-01-15' },
          { id: 'vinc-2', norma: 'D.S. 40/2012', articulo: '8', descripcion: 'Obligaciones del empleador', unidadControl: 'Bodega Central', criticidad: 'media', estado: 'parcial', fechaVinculacion: '2024-01-20' },
          { id: 'vinc-3', norma: 'Ley 19.300', articulo: '11', descripcion: 'Ley sobre bases generales del medio ambiente', unidadControl: 'Area Produccion', criticidad: 'alta', estado: 'no-cumple', fechaVinculacion: '2024-02-01' },
          { id: 'vinc-4', norma: 'D.S. 594/1999', articulo: '3', descripcion: 'Condiciones sanitarias y ambientales basicas', unidadControl: 'Oficinas', criticidad: 'baja', estado: 'cumple', fechaVinculacion: '2024-02-10' },
        ],
        evaluaciones: [
          { id: 'eval-1', fecha: '2024-01-15', responsable: 'Juan Perez', estado: 'completada', porcentajeCumplimiento: 85 },
          { id: 'eval-2', fecha: '2024-02-20', responsable: 'Maria Garcia', estado: 'completada', porcentajeCumplimiento: 72 },
        ],
        resultados: [
          { id: 'res-1', vinculacionId: 'vinc-1', evaluacionId: 'eval-1', estado: 'cumple', evidencia: 'Documentacion completa', observaciones: '' },
          { id: 'res-2', vinculacionId: 'vinc-2', evaluacionId: 'eval-1', estado: 'parcial', evidencia: 'Parcialmente implementado', observaciones: 'Falta capacitacion' },
        ],
        hallazgos: [
          { id: 'hall-1', descripcion: 'Falta senaletica de seguridad en area de produccion', tipo: 'nc-menor', estado: 'en-proceso', fechaDeteccion: '2024-02-15', responsable: 'Pedro Martinez' },
          { id: 'hall-2', descripcion: 'Plan de emergencia requiere actualizacion', tipo: 'nc-mayor', estado: 'abierto', fechaDeteccion: '2024-02-20', responsable: 'Ana Rodriguez' },
        ],
      }
    } else if (selectedLogicType === 'matriz-riesgo') {
      newViewData.mrData = {
        procesos: [
          { id: 'proc-1', nombre: 'Operaciones de Planta', descripcion: 'Procesos operativos principales' },
          { id: 'proc-2', nombre: 'Mantenimiento', descripcion: 'Actividades de mantenimiento preventivo y correctivo' },
          { id: 'proc-3', nombre: 'Almacenamiento', descripcion: 'Gestion de bodega y materiales' },
        ],
        tareas: [
          { id: 'tarea-1', procesoId: 'proc-1', nombre: 'Operacion de maquinaria', descripcion: 'Manejo de equipos industriales' },
          { id: 'tarea-2', procesoId: 'proc-2', nombre: 'Mantenimiento preventivo', descripcion: 'Revision periodica de equipos' },
          { id: 'tarea-3', procesoId: 'proc-3', nombre: 'Manejo de materiales', descripcion: 'Carga y descarga de insumos' },
        ],
        filasIPER: [
          { id: 'iper-1', tareaId: 'tarea-1', peligro: 'Ruido excesivo', riesgo: 'Perdida auditiva', probabilidad: 4, consecuencia: 3, valorVEP: 12, nivelRiesgo: 'alto', medidas: ['Uso de protectores auditivos', 'Rotacion de personal'] },
          { id: 'iper-2', tareaId: 'tarea-1', peligro: 'Partes moviles expuestas', riesgo: 'Atrapamiento', probabilidad: 2, consecuencia: 5, valorVEP: 10, nivelRiesgo: 'alto', medidas: ['Guardas de proteccion', 'Capacitacion'] },
          { id: 'iper-3', tareaId: 'tarea-2', peligro: 'Trabajo en altura', riesgo: 'Caida a distinto nivel', probabilidad: 3, consecuencia: 5, valorVEP: 15, nivelRiesgo: 'alto', medidas: ['Linea de vida', 'Arnes de seguridad', 'Check de seguridad'] },
          { id: 'iper-4', tareaId: 'tarea-2', peligro: 'Contacto electrico', riesgo: 'Electrocucion', probabilidad: 2, consecuencia: 5, valorVEP: 10, nivelRiesgo: 'alto', medidas: ['Bloqueo y etiquetado', 'EPP dielectrico'] },
          { id: 'iper-5', tareaId: 'tarea-3', peligro: 'Levantamiento manual', riesgo: 'Lesion dorsolumbar', probabilidad: 3, consecuencia: 2, valorVEP: 6, nivelRiesgo: 'medio', medidas: ['Capacitacion ergonomica', 'Ayudas mecanicas'] },
        ],
        medidas: [
          { id: 'med-1', descripcion: 'Uso de protectores auditivos', tipo: 'epp', responsable: 'Supervisor SST' },
          { id: 'med-2', descripcion: 'Guardas de proteccion', tipo: 'ingenieria', responsable: 'Jefe Mantenimiento' },
          { id: 'med-3', descripcion: 'Linea de vida', tipo: 'ingenieria', responsable: 'Coordinador Altura' },
        ],
        parametros: {
          escalaProbabilidad: [1, 2, 3, 4, 5],
          escalaConsecuencia: [1, 2, 3, 4, 5],
          nivelesRiesgo: {
            bajo: { min: 1, max: 4, color: '#22c55e' },
            medio: { min: 5, max: 9, color: '#f59e0b' },
            alto: { min: 10, max: 16, color: '#f97316' },
            critico: { min: 17, max: 25, color: '#ef4444' },
          }
        },
      }
    }
    
    setCustomViewData(prev => [...prev, newViewData])
    
    setActiveViewId(newView.id)
    setNewViewName('')
    setSelectedLogicType('dashboard')
    setShowAddViewDialog(false)
    
    const logicLabel = viewLogicConfig[selectedLogicType].label
    toast.success('Vista creada', {
      description: `La vista "${newView.name}" (${logicLabel}) ha sido creada exitosamente.`,
    })
  }
  
  // Get view logic type
  const getViewLogicType = (view: AppView): ViewLogicType => {
    const config = view.config as { logicType?: ViewLogicType } | undefined
    return config?.logicType || 'dashboard'
  }
  
  // Delete a view
  const handleDeleteView = () => {
    if (!viewToDelete || !activeApp) return
    
    const updatedViews = activeApp.views.filter(v => v.id !== viewToDelete.id)
    updateApp(activeApp.id, { views: updatedViews })
    
    // Remove custom view data
    setCustomViewData(prev => prev.filter(d => d.viewId !== viewToDelete.id))
    
    // If deleting active view, switch to first available
    if (activeViewId === viewToDelete.id) {
      setActiveViewId(updatedViews[0]?.id || null)
    }
    
    toast.success('Vista eliminada', {
      description: `La vista "${viewToDelete.name}" ha sido eliminada.`,
    })
    
    setViewToDelete(null)
    setShowDeleteConfirm(false)
  }
  
  // Check if a view is a custom view (created by user, not default)
  const isCustomView = (view: AppView) => {
    return view.id.startsWith('view-')
  }

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
    if (!activeView) {
      // Show interactive dashboard grid when no views are configured
      return <InteractiveDashboard viewId="default" viewName="Dashboard" />
    }
    
    // Custom views (created by user) - render based on logic type
    if (isCustomView(activeView)) {
      const logicType = getViewLogicType(activeView)
      const viewData = customViewData.find(d => d.viewId === activeView.id)
      
      switch (logicType) {
        case 'requisitos-legales':
          return (
            <CustomRequisitosLegalesView 
              viewId={activeView.id} 
              viewName={activeView.name}
              data={viewData?.rlData}
              onUpdateData={(rlData) => {
                setCustomViewData(prev => prev.map(d => 
                  d.viewId === activeView.id ? { ...d, rlData } : d
                ))
              }}
            />
          )
        case 'matriz-riesgo':
          return (
            <CustomMatrizRiesgoView 
              viewId={activeView.id} 
              viewName={activeView.name}
              data={viewData?.mrData}
              onUpdateData={(mrData) => {
                setCustomViewData(prev => prev.map(d => 
                  d.viewId === activeView.id ? { ...d, mrData } : d
                ))
              }}
            />
          )
        case 'table':
          // For custom table views, create a simple editable table
          if (activeTable) {
            return <TableView table={activeTable} app={activeApp} onUpdateApp={handleUpdateApp} />
          }
          return <InteractiveDashboard viewId={activeView.id} viewName={activeView.name} />
        case 'dashboard':
        default:
          return <InteractiveDashboard viewId={activeView.id} viewName={activeView.name} />
      }
    }

    if (!activeTable) {
      return <InteractiveDashboard viewId={activeView.id} viewName={activeView.name} />
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
          : <InteractiveDashboard viewId={activeView.id} viewName={activeView.name} />
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
          <div className="mt-3 flex items-center gap-1 -mb-px">
            {views.map(view => {
              const VIcon = viewIcons[view.type] || Table2
              const isActive = (activeView?.id === view.id) || (!activeViewId && view.id === views[0]?.id)
              const canDelete = isCustomView(view)
              
              return (
                <DropdownMenu key={view.id}>
                  <div className="flex items-center">
                    <button
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
                    {canDelete && isActive && (
                      <DropdownMenuTrigger asChild>
                        <button className="p-1 hover:bg-muted rounded transition-colors -ml-1">
                          <MoreVertical className="h-3 w-3 text-muted-foreground" />
                        </button>
                      </DropdownMenuTrigger>
                    )}
                  </div>
                  {canDelete && (
                    <DropdownMenuContent align="start" className="w-40">
                      <DropdownMenuItem 
                        className="text-destructive focus:text-destructive"
                        onClick={() => {
                          setViewToDelete(view)
                          setShowDeleteConfirm(true)
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-2" />
                        Eliminar vista
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  )}
                </DropdownMenu>
              )
            })}
            <button 
              onClick={() => setShowAddViewDialog(true)}
              className="flex items-center gap-1 px-3 py-2 text-xs text-muted-foreground hover:text-foreground border-b-2 border-transparent"
            >
              <Plus className="h-3 w-3" /> Vista
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 p-6">
        {renderView()}
      </div>
      
      {/* Add View Dialog */}
      <Dialog open={showAddViewDialog} onOpenChange={(open) => {
        setShowAddViewDialog(open)
        if (!open) {
          setNewViewName('')
          setSelectedLogicType('dashboard')
        }
      }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Nueva Vista</DialogTitle>
            <DialogDescription>
              Crea una nueva vista personalizada. Selecciona el tipo de logica que deseas utilizar.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="view-name">Nombre de la vista</Label>
              <Input
                id="view-name"
                placeholder="Ej: Mi Dashboard, Vista Resumen..."
                value={newViewName}
                onChange={(e) => setNewViewName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Tipo de Vista</Label>
              <p className="text-xs text-muted-foreground mb-3">
                Selecciona la funcionalidad base que deseas clonar para esta vista
              </p>
              <div className="grid gap-2">
                {(Object.keys(viewLogicConfig) as ViewLogicType[]).map((logicType) => {
                  const config = viewLogicConfig[logicType]
                  const Icon = config.icon
                  const isSelected = selectedLogicType === logicType
                  
                  return (
                    <button
                      key={logicType}
                      type="button"
                      onClick={() => setSelectedLogicType(logicType)}
                      className={`flex items-start gap-3 p-3 rounded-lg border-2 text-left transition-all ${
                        isSelected 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-muted-foreground/50 hover:bg-muted/50'
                      }`}
                    >
                      <div 
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                        style={{ backgroundColor: `${config.color}15`, color: config.color }}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{config.label}</span>
                          {isSelected && (
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {config.description}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddViewDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateView} disabled={!newViewName.trim()}>
              Crear Vista
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete View Confirmation */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar vista</AlertDialogTitle>
            <AlertDialogDescription>
              Esta accion eliminara la vista "{viewToDelete?.name}" y todos los widgets configurados. Esta accion no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setViewToDelete(null)
              setShowDeleteConfirm(false)
            }}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteView}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
