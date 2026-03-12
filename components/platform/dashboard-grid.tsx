'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import {
  GripVertical,
  Trash2,
  Plus,
  Save,
  Pencil,
  PieChart,
  BarChart3,
  Hash,
  X,
  Move,
  LayoutGrid,
  Table2,
  Scale,
  ShieldAlert,
  Settings,
  MoreVertical,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Eye,
  Download,
  Upload,
  Copy,
  TrendingUp,
  TrendingDown
} from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { Textarea } from '@/components/ui/textarea'

// ---- Types ----
export type DashboardWidgetType = 'kpi' | 'pie-chart' | 'bar-chart' | 'custom-table' | 'mini-requisitos' | 'mini-matriz'

export interface DashboardWidget {
  id: string
  type: DashboardWidgetType
  title: string
  gridPosition: { col: number; row: number }
  gridSize: { cols: number; rows: number }
  data?: Record<string, unknown>
}

interface GridCell {
  col: number
  row: number
  occupied: boolean
  widgetId?: string
}

// ---- Constants ----
const GRID_COLS = 6
const GRID_ROWS = 8
const CELL_SIZE = 120

// Widget size configurations (fixed sizes - updated for 6x8 grid)
const widgetSizeConfig: Record<DashboardWidgetType, { cols: number; rows: number }> = {
  'kpi': { cols: 1, rows: 1 },
  'pie-chart': { cols: 2, rows: 2 },
  'bar-chart': { cols: 3, rows: 2 },
  'custom-table': { cols: 6, rows: 3 },
  'mini-requisitos': { cols: 3, rows: 4 },
  'mini-matriz': { cols: 3, rows: 4 },
}

// Widget categories
type WidgetCategory = 'visualizacion' | 'modulos'

// Widget templates
const widgetTemplates: { type: DashboardWidgetType; label: string; icon: typeof PieChart; description: string; category: WidgetCategory }[] = [
  // Visualization widgets
  { type: 'kpi', label: 'Card de KPI', icon: Hash, description: 'Componente pequeno 1x1 que muestra un KPI', category: 'visualizacion' },
  { type: 'pie-chart', label: 'Grafico de Torta', icon: PieChart, description: 'Grafico circular 2x2 para datos visuales', category: 'visualizacion' },
  { type: 'bar-chart', label: 'Grafico de Barras', icon: BarChart3, description: 'Grafico en barras 2x1 comparativo', category: 'visualizacion' },
  // Module widgets (reusable logic)
  { type: 'custom-table', label: 'Tabla Personalizada', icon: Table2, description: 'Crea una tabla con columnas configurables', category: 'modulos' },
  { type: 'mini-requisitos', label: 'Mini Obligaciones Legales', icon: Scale, description: 'Modulo de vinculaciones, evaluaciones y hallazgos', category: 'modulos' },
  { type: 'mini-matriz', label: 'Mini Matriz de Riesgo', icon: ShieldAlert, description: 'Modulo IPER: peligros, riesgos y medidas', category: 'modulos' },
]

// ---- Dashboard Grid Context ----
interface DashboardGridContextType {
  widgets: DashboardWidget[]
  isEditMode: boolean
  selectedWidgetId: string | null
  draggedWidgetId: string | null
  setWidgets: React.Dispatch<React.SetStateAction<DashboardWidget[]>>
  setIsEditMode: React.Dispatch<React.SetStateAction<boolean>>
  setSelectedWidgetId: React.Dispatch<React.SetStateAction<string | null>>
  setDraggedWidgetId: React.Dispatch<React.SetStateAction<string | null>>
  addWidget: (type: DashboardWidgetType, position: { col: number; row: number }) => boolean
  removeWidget: (id: string) => void
  moveWidget: (id: string, newPosition: { col: number; row: number }) => boolean
  canPlaceWidget: (type: DashboardWidgetType, position: { col: number; row: number }, excludeWidgetId?: string) => boolean
  getOccupiedCells: () => GridCell[][]
}

const DashboardGridContext = React.createContext<DashboardGridContextType | undefined>(undefined)

function useDashboardGrid() {
  const context = React.useContext(DashboardGridContext)
  if (!context) throw new Error('useDashboardGrid must be used within DashboardGridProvider')
  return context
}

// ---- Provider Component ----
export function DashboardGridProvider({ children, initialWidgets = [] }: { children: React.ReactNode; initialWidgets?: DashboardWidget[] }) {
  const [widgets, setWidgets] = useState<DashboardWidget[]>(initialWidgets)
  const [isEditMode, setIsEditMode] = useState(false)
  const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null)
  const [draggedWidgetId, setDraggedWidgetId] = useState<string | null>(null)

  // Get occupied cells grid
  const getOccupiedCells = useCallback((): GridCell[][] => {
    const grid: GridCell[][] = Array.from({ length: GRID_ROWS }, (_, row) =>
      Array.from({ length: GRID_COLS }, (_, col) => ({
        col,
        row,
        occupied: false,
        widgetId: undefined,
      }))
    )

    widgets.forEach(widget => {
      const { col, row } = widget.gridPosition
      const { cols, rows } = widget.gridSize
      for (let r = row; r < row + rows && r < GRID_ROWS; r++) {
        for (let c = col; c < col + cols && c < GRID_COLS; c++) {
          if (grid[r] && grid[r][c]) {
            grid[r][c].occupied = true
            grid[r][c].widgetId = widget.id
          }
        }
      }
    })

    return grid
  }, [widgets])

  // Check if a widget can be placed at a position
  const canPlaceWidget = useCallback((
    type: DashboardWidgetType,
    position: { col: number; row: number },
    excludeWidgetId?: string
  ): boolean => {
    const size = widgetSizeConfig[type]
    const { col, row } = position

    // Check bounds
    if (col < 0 || row < 0 || col + size.cols > GRID_COLS || row + size.rows > GRID_ROWS) {
      return false
    }

    // Check for overlaps
    const grid = getOccupiedCells()
    for (let r = row; r < row + size.rows; r++) {
      for (let c = col; c < col + size.cols; c++) {
        if (grid[r][c].occupied && grid[r][c].widgetId !== excludeWidgetId) {
          return false
        }
      }
    }

    return true
  }, [getOccupiedCells])

  // Add widget
  const addWidget = useCallback((type: DashboardWidgetType, position: { col: number; row: number }): boolean => {
    if (!canPlaceWidget(type, position)) {
      return false
    }

    const size = widgetSizeConfig[type]
    const template = widgetTemplates.find(t => t.type === type)
    const newWidget: DashboardWidget = {
      id: `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      title: template?.label || 'Nuevo Widget',
      gridPosition: position,
      gridSize: size,
      data: getDefaultWidgetData(type),
    }

    setWidgets(prev => [...prev, newWidget])
    setSelectedWidgetId(newWidget.id)
    return true
  }, [canPlaceWidget])

  // Remove widget
  const removeWidget = useCallback((id: string) => {
    setWidgets(prev => prev.filter(w => w.id !== id))
    if (selectedWidgetId === id) setSelectedWidgetId(null)
  }, [selectedWidgetId])

  // Move widget
  const moveWidget = useCallback((id: string, newPosition: { col: number; row: number }): boolean => {
    const widget = widgets.find(w => w.id === id)
    if (!widget) return false

    if (!canPlaceWidget(widget.type, newPosition, id)) {
      return false
    }

    setWidgets(prev => prev.map(w =>
      w.id === id ? { ...w, gridPosition: newPosition } : w
    ))
    return true
  }, [widgets, canPlaceWidget])

  return (
    <DashboardGridContext.Provider value={{
      widgets,
      isEditMode,
      selectedWidgetId,
      draggedWidgetId,
      setWidgets,
      setIsEditMode,
      setSelectedWidgetId,
      setDraggedWidgetId,
      addWidget,
      removeWidget,
      moveWidget,
      canPlaceWidget,
      getOccupiedCells,
    }}>
      {children}
    </DashboardGridContext.Provider>
  )
}

// Column types for custom tables
export type ColumnType = 'text' | 'number' | 'select' | 'date' | 'status' | 'link'

export interface TableColumn {
  id: string
  name: string
  type: ColumnType
  options?: string[] // For select type
  width?: number
}

export interface TableRow {
  id: string
  cells: Record<string, unknown>
}

// Default data for widgets
function getDefaultWidgetData(type: DashboardWidgetType): Record<string, unknown> {
  switch (type) {
    case 'kpi':
      return { value: 42, label: 'Total', unit: '', trend: '+5%' }
    case 'pie-chart':
      return {
        items: [
          { label: 'Cumple', value: 65, color: '#22c55e' },
          { label: 'Parcial', value: 25, color: '#f59e0b' },
          { label: 'No Cumple', value: 10, color: '#ef4444' },
        ]
      }
    case 'bar-chart':
      return {
        items: [
          { label: 'Ene', value: 45 },
          { label: 'Feb', value: 52 },
          { label: 'Mar', value: 38 },
          { label: 'Abr', value: 61 },
        ]
      }
    case 'custom-table':
      return {
        columns: [
          { id: 'col-1', name: 'Nombre', type: 'text' },
          { id: 'col-2', name: 'Estado', type: 'select', options: ['Activo', 'Inactivo', 'Pendiente'] },
          { id: 'col-3', name: 'Fecha', type: 'date' },
          { id: 'col-4', name: 'Responsable', type: 'text' },
        ] as TableColumn[],
        rows: [
          { id: 'row-1', cells: { 'col-1': 'Tarea de revision', 'col-2': 'Activo', 'col-3': '2024-03-15', 'col-4': 'Juan Perez' } },
          { id: 'row-2', cells: { 'col-1': 'Inspeccion mensual', 'col-2': 'Pendiente', 'col-3': '2024-03-20', 'col-4': 'Maria Garcia' } },
          { id: 'row-3', cells: { 'col-1': 'Capacitacion SST', 'col-2': 'Activo', 'col-3': '2024-03-10', 'col-4': 'Carlos Lopez' } },
        ] as TableRow[],
        title: 'Mi Tabla',
      }
    case 'mini-requisitos':
      // Pre-loaded sample data for requisitos legales
      return {
        title: 'Obligaciones Legales',
        vinculaciones: [
          { id: 'vinc-1', norma: 'D.S. 40/2012', articulo: '5', unidadControl: 'Planta Principal', criticidad: 'alta' as const, estado: 'cumple' as const },
          { id: 'vinc-2', norma: 'D.S. 40/2012', articulo: '8', unidadControl: 'Bodega Central', criticidad: 'media' as const, estado: 'parcial' as const },
          { id: 'vinc-3', norma: 'Ley 19.300', articulo: '11', unidadControl: 'Area Produccion', criticidad: 'alta' as const, estado: 'no-cumple' as const },
          { id: 'vinc-4', norma: 'D.S. 594/1999', articulo: '3', unidadControl: 'Oficinas', criticidad: 'baja' as const, estado: 'cumple' as const },
          { id: 'vinc-5', norma: 'D.S. 594/1999', articulo: '12', unidadControl: 'Laboratorio', criticidad: 'media' as const, estado: 'pendiente' as const },
        ],
        evaluaciones: [
          { id: 'eval-1', fecha: '2024-01-15', responsable: 'Juan Perez', resultados: 85 },
          { id: 'eval-2', fecha: '2024-02-20', responsable: 'Maria Garcia', resultados: 72 },
        ],
        hallazgos: [
          { id: 'hall-1', descripcion: 'Falta senaletica de seguridad', tipo: 'nc-menor' as const, estado: 'en-proceso' as const },
          { id: 'hall-2', descripcion: 'Plan de emergencia desactualizado', tipo: 'nc-mayor' as const, estado: 'abierto' as const },
        ],
      }
    case 'mini-matriz':
      // Pre-loaded sample data for matriz de riesgo
      return {
        title: 'Matriz de Riesgo',
        procesos: [
          {
            id: 'proc-1',
            nombre: 'Operaciones de Planta',
            tareas: [{
              id: 'tarea-1',
              nombre: 'Operacion de maquinaria',
              peligros: [
                { id: 'pel-1', descripcion: 'Ruido excesivo', riesgo: 'Perdida auditiva', probabilidad: 4, consecuencia: 3, vep: 12, nivel: 'alto' as const, medidas: ['Uso de protectores auditivos'] },
                { id: 'pel-2', descripcion: 'Partes moviles expuestas', riesgo: 'Atrapamiento', probabilidad: 2, consecuencia: 5, vep: 10, nivel: 'alto' as const, medidas: ['Guardas de proteccion'] },
              ]
            }]
          },
          {
            id: 'proc-2',
            nombre: 'Mantenimiento',
            tareas: [{
              id: 'tarea-2',
              nombre: 'Mantenimiento preventivo',
              peligros: [
                { id: 'pel-3', descripcion: 'Trabajo en altura', riesgo: 'Caida a distinto nivel', probabilidad: 3, consecuencia: 5, vep: 15, nivel: 'alto' as const, medidas: ['Linea de vida', 'Arnes de seguridad'] },
                { id: 'pel-4', descripcion: 'Contacto electrico', riesgo: 'Electrocucion', probabilidad: 2, consecuencia: 5, vep: 10, nivel: 'alto' as const, medidas: ['Bloqueo y etiquetado'] },
              ]
            }]
          },
          {
            id: 'proc-3',
            nombre: 'Almacenamiento',
            tareas: [{
              id: 'tarea-3',
              nombre: 'Manejo de materiales',
              peligros: [
                { id: 'pel-5', descripcion: 'Levantamiento manual', riesgo: 'Lesion dorsolumbar', probabilidad: 3, consecuencia: 2, vep: 6, nivel: 'medio' as const, medidas: ['Capacitacion ergonomica'] },
              ]
            }]
          },
        ],
        configuracion: {
          escalaProbabilidad: [1, 2, 3, 4, 5],
          escalaConsecuencia: [1, 2, 3, 4, 5],
          nivelesRiesgo: [
            { min: 1, max: 4, nivel: 'bajo', color: '#22c55e' },
            { min: 5, max: 9, nivel: 'medio', color: '#f59e0b' },
            { min: 10, max: 16, nivel: 'alto', color: '#f97316' },
            { min: 17, max: 25, nivel: 'critico', color: '#ef4444' },
          ]
        }
      }
    default:
      return {}
  }
}

// ---- Generic Helper Functions (Reusable for any app) ----

// Export dashboard to JSON file
function handleExportDashboard(widgets: DashboardWidget[]) {
  const exportData = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    gridConfig: { cols: GRID_COLS, rows: GRID_ROWS },
    widgets: widgets.map(w => ({
      ...w,
      // Remove runtime-specific IDs for clean export
      id: undefined,
    })),
  }
  
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `dashboard-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
  
  toast.success('Dashboard exportado', {
    description: `${widgets.length} widgets exportados correctamente`
  })
}

// Import dashboard from JSON file
function handleImportDashboard(
  e: React.ChangeEvent<HTMLInputElement>,
  setWidgets: React.Dispatch<React.SetStateAction<DashboardWidget[]>>
) {
  const file = e.target.files?.[0]
  if (!file) return
  
  const reader = new FileReader()
  reader.onload = (event) => {
    try {
      const data = JSON.parse(event.target?.result as string)
      if (data.widgets && Array.isArray(data.widgets)) {
        const importedWidgets = data.widgets.map((w: Partial<DashboardWidget>, idx: number) => ({
          ...w,
          id: `widget-imported-${Date.now()}-${idx}`,
        })) as DashboardWidget[]
        
        setWidgets(importedWidgets)
        toast.success('Dashboard importado', {
          description: `${importedWidgets.length} widgets importados correctamente`
        })
      }
    } catch {
      toast.error('Error al importar', {
        description: 'El archivo no tiene el formato correcto'
      })
    }
  }
  reader.readAsText(file)
  e.target.value = '' // Reset input
}

// Duplicate all widgets (offset by 1 cell)
function handleDuplicateDashboard(
  widgets: DashboardWidget[],
  setWidgets: React.Dispatch<React.SetStateAction<DashboardWidget[]>>
) {
  const duplicated = widgets.map(w => ({
    ...w,
    id: `widget-dup-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    gridPosition: {
      col: Math.min(w.gridPosition.col + 1, GRID_COLS - w.gridSize.cols),
      row: Math.min(w.gridPosition.row + 1, GRID_ROWS - w.gridSize.rows),
    }
  }))
  
  setWidgets(prev => [...prev, ...duplicated])
  toast.success('Widgets duplicados', {
    description: `${duplicated.length} widgets duplicados`
  })
}

// Generic CRUD operations for any data type
export const genericCRUD = {
  create: <T extends { id: string }>(items: T[], newItem: Omit<T, 'id'>): T[] => {
    return [...items, { ...newItem, id: `item-${Date.now()}` } as T]
  },
  update: <T extends { id: string }>(items: T[], id: string, updates: Partial<T>): T[] => {
    return items.map(item => item.id === id ? { ...item, ...updates } : item)
  },
  delete: <T extends { id: string }>(items: T[], id: string): T[] => {
    return items.filter(item => item.id !== id)
  },
  findById: <T extends { id: string }>(items: T[], id: string): T | undefined => {
    return items.find(item => item.id === id)
  },
}

// Generic statistics calculator
export const calculateStats = <T>(items: T[], groupByKey: keyof T): Record<string, number> => {
  return items.reduce((acc, item) => {
    const key = String(item[groupByKey])
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {} as Record<string, number>)
}

// ---- Main Dashboard Grid Component ----
export function DashboardGrid({ viewName = 'Dashboard' }: { viewName?: string }) {
  const {
    widgets,
    setWidgets,
    isEditMode,
    setIsEditMode,
    selectedWidgetId,
    setSelectedWidgetId,
    draggedWidgetId,
    setDraggedWidgetId,
    addWidget,
    moveWidget,
    canPlaceWidget,
    getOccupiedCells,
  } = useDashboardGrid()

  const [dragOverPosition, setDragOverPosition] = useState<{ col: number; row: number } | null>(null)
  const [dragWidgetType, setDragWidgetType] = useState<DashboardWidgetType | null>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  // Handle drag over grid cell
  const handleDragOver = useCallback((e: React.DragEvent, col: number, row: number) => {
    e.preventDefault()
    setDragOverPosition({ col, row })
  }, [])

  // Handle drop on grid cell
  const handleDrop = useCallback((e: React.DragEvent, col: number, row: number) => {
    e.preventDefault()
    setDragOverPosition(null)

    // If dragging existing widget
    if (draggedWidgetId) {
      moveWidget(draggedWidgetId, { col, row })
      setDraggedWidgetId(null)
      return
    }

    // If dragging new widget from palette
    if (dragWidgetType) {
      addWidget(dragWidgetType, { col, row })
      setDragWidgetType(null)
    }
  }, [draggedWidgetId, dragWidgetType, moveWidget, addWidget, setDraggedWidgetId])

  // Handle drag leave
  const handleDragLeave = useCallback(() => {
    setDragOverPosition(null)
  }, [])

  // Check if position is valid for drop
  const isValidDropPosition = useCallback((col: number, row: number): boolean => {
    if (draggedWidgetId) {
      const widget = widgets.find(w => w.id === draggedWidgetId)
      if (widget) {
        return canPlaceWidget(widget.type, { col, row }, draggedWidgetId)
      }
    }
    if (dragWidgetType) {
      return canPlaceWidget(dragWidgetType, { col, row })
    }
    return false
  }, [draggedWidgetId, dragWidgetType, widgets, canPlaceWidget])

  const occupiedGrid = getOccupiedCells()

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Toolbar */}
      <div className="sticky top-0 z-20 bg-background border-b px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold">{viewName}</h1>
          {isEditMode && (
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              Modo Edicion
            </Badge>
          )}
          <Badge variant="outline" className="text-xs">{GRID_COLS}x{GRID_ROWS}</Badge>
        </div>
        <div className="flex items-center gap-2">
          {/* Import/Export Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExportDashboard(widgets)}>
                <Download className="w-4 h-4 mr-2" />
                Exportar Dashboard
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => document.getElementById('import-file')?.click()}>
                <Upload className="w-4 h-4 mr-2" />
                Importar Dashboard
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleDuplicateDashboard(widgets, setWidgets)}>
                <Copy className="w-4 h-4 mr-2" />
                Duplicar Widgets
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <input
            id="import-file"
            type="file"
            accept=".json"
            className="hidden"
            onChange={(e) => handleImportDashboard(e, setWidgets)}
          />
          
          {isEditMode && (
            <WidgetPalette onDragStart={setDragWidgetType} onDragEnd={() => setDragWidgetType(null)} />
          )}
          <Button
            variant={isEditMode ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setIsEditMode(!isEditMode)
              if (isEditMode) setSelectedWidgetId(null)
            }}
          >
            {isEditMode ? (
              <>
                <Save className="w-4 h-4 mr-1" />
                Guardar
              </>
            ) : (
              <>
                <Pencil className="w-4 h-4 mr-1" />
                Editar
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Grid Container */}
      <div className="flex-1 p-6 overflow-auto">
        <div
          ref={gridRef}
          className="relative mx-auto"
          style={{
            width: GRID_COLS * CELL_SIZE,
            height: GRID_ROWS * CELL_SIZE,
          }}
        >
          {/* Grid Cells (invisible grid for positioning) */}
          {isEditMode && (
            <div className="absolute inset-0 grid"
              style={{
                gridTemplateColumns: `repeat(${GRID_COLS}, ${CELL_SIZE}px)`,
                gridTemplateRows: `repeat(${GRID_ROWS}, ${CELL_SIZE}px)`,
              }}
            >
              {Array.from({ length: GRID_ROWS }).map((_, row) =>
                Array.from({ length: GRID_COLS }).map((_, col) => {
                  const isOccupied = occupiedGrid[row]?.[col]?.occupied
                  const isDragOver = dragOverPosition?.col === col && dragOverPosition?.row === row
                  const isValid = isDragOver && isValidDropPosition(col, row)

                  return (
                    <div
                      key={`cell-${row}-${col}`}
                      className={cn(
                        "border border-dashed transition-colors",
                        isOccupied ? "border-transparent" : "border-muted-foreground/20",
                        isDragOver && isValid && "bg-primary/10 border-primary",
                        isDragOver && !isValid && "bg-destructive/10 border-destructive"
                      )}
                      onDragOver={(e) => handleDragOver(e, col, row)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, col, row)}
                    />
                  )
                })
              )}
            </div>
          )}

          {/* Widgets */}
          {widgets.map(widget => (
            <WidgetWrapper key={widget.id} widget={widget} />
          ))}

          {/* Empty State */}
          {widgets.length === 0 && !isEditMode && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <LayoutGrid className="w-12 h-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">Tu dashboard esta vacio</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Haz clic en "Editar" para agregar widgets
              </p>
              <Button variant="outline" onClick={() => setIsEditMode(true)}>
                <Plus className="w-4 h-4 mr-1" />
                Agregar Widgets
              </Button>
            </div>
          )}

          {/* Edit Mode Empty State */}
          {widgets.length === 0 && isEditMode && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              <LayoutGrid className="w-12 h-12 text-muted-foreground/30 mb-4" />
              <h3 className="text-base font-medium text-muted-foreground/50 mb-2">
                Arrastra widgets desde el panel
              </h3>
              <p className="text-sm text-muted-foreground/40">
                o haz clic en "Agregar Widget" para comenzar
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ---- Widget Palette ----
function WidgetPalette({
  onDragStart,
  onDragEnd
}: {
  onDragStart: (type: DashboardWidgetType) => void
  onDragEnd: () => void
}) {
  const { addWidget, getOccupiedCells } = useDashboardGrid()
  const [open, setOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState<WidgetCategory>('visualizacion')

  // Find first available position for a widget type
  const findFirstAvailablePosition = (type: DashboardWidgetType): { col: number; row: number } | null => {
    const grid = getOccupiedCells()
    const size = widgetSizeConfig[type]

    for (let row = 0; row <= GRID_ROWS - size.rows; row++) {
      for (let col = 0; col <= GRID_COLS - size.cols; col++) {
        let canPlace = true
        for (let r = row; r < row + size.rows && canPlace; r++) {
          for (let c = col; c < col + size.cols && canPlace; c++) {
            if (grid[r]?.[c]?.occupied) {
              canPlace = false
            }
          }
        }
        if (canPlace) {
          return { col, row }
        }
      }
    }
    return null
  }

  const handleAddWidget = (type: DashboardWidgetType) => {
    const position = findFirstAvailablePosition(type)
    if (position) {
      addWidget(type, position)
      setOpen(false)
    }
  }

  const filteredTemplates = widgetTemplates.filter(t => t.category === activeCategory)

  const categoryConfig: Record<WidgetCategory, { label: string; description: string }> = {
    visualizacion: { label: 'Visualizacion', description: 'Graficos y KPIs para mostrar datos' },
    modulos: { label: 'Modulos', description: 'Componentes con logica reutilizable' },
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="w-4 h-4 mr-1" />
          Agregar Widget
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-96">
        <SheetHeader>
          <SheetTitle>Componentes</SheetTitle>
        </SheetHeader>
        
        {/* Category Tabs */}
        <Tabs value={activeCategory} onValueChange={(v) => setActiveCategory(v as WidgetCategory)} className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="visualizacion" className="text-xs">
              <BarChart3 className="w-3 h-3 mr-1" />
              Visualizacion
            </TabsTrigger>
            <TabsTrigger value="modulos" className="text-xs">
              <LayoutGrid className="w-3 h-3 mr-1" />
              Modulos
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeCategory} className="mt-4">
            <p className="text-xs text-muted-foreground mb-4">
              {categoryConfig[activeCategory].description}
            </p>
            <ScrollArea className="h-[calc(100vh-220px)]">
              <div className="space-y-3 pr-4">
                {filteredTemplates.map(template => {
                  const size = widgetSizeConfig[template.type]
                  const isModule = template.category === 'modulos'
                  
                  return (
                    <div
                      key={template.type}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.effectAllowed = 'move'
                        onDragStart(template.type)
                      }}
                      onDragEnd={onDragEnd}
                      className={`p-4 border rounded-lg cursor-grab active:cursor-grabbing hover:border-primary hover:bg-muted/50 transition-colors ${
                        isModule ? 'border-dashed' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                          template.type === 'mini-requisitos' ? 'bg-teal-500/10' :
                          template.type === 'mini-matriz' ? 'bg-red-500/10' :
                          template.type === 'custom-table' ? 'bg-blue-500/10' :
                          'bg-primary/10'
                        }`}>
                          <template.icon className={`h-5 w-5 ${
                            template.type === 'mini-requisitos' ? 'text-teal-600' :
                            template.type === 'mini-matriz' ? 'text-red-600' :
                            template.type === 'custom-table' ? 'text-blue-600' :
                            'text-primary'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="text-sm font-medium truncate">{template.label}</h4>
                            <Badge variant="outline" className="text-xs shrink-0">
                              {size.cols}x{size.rows}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {template.description}
                          </p>
                          {isModule && (
                            <Badge variant="secondary" className="mt-2 text-xs">
                              Logica Reutilizable
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-full mt-3"
                        onClick={() => handleAddWidget(template.type)}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Agregar
                      </Button>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}

// ---- Widget Wrapper ----
function WidgetWrapper({ widget }: { widget: DashboardWidget }) {
  const {
    isEditMode,
    selectedWidgetId,
    setSelectedWidgetId,
    setDraggedWidgetId,
    removeWidget
  } = useDashboardGrid()

  const isSelected = selectedWidgetId === widget.id

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move'
    setDraggedWidgetId(widget.id)
  }

  const handleDragEnd = () => {
    setDraggedWidgetId(null)
  }

  return (
    <div
      className={cn(
        "absolute transition-all duration-200",
        isEditMode && "cursor-grab active:cursor-grabbing",
        isEditMode && isSelected && "ring-2 ring-primary ring-offset-2 z-10"
      )}
      style={{
        left: widget.gridPosition.col * CELL_SIZE,
        top: widget.gridPosition.row * CELL_SIZE,
        width: widget.gridSize.cols * CELL_SIZE - 8,
        height: widget.gridSize.rows * CELL_SIZE - 8,
        margin: 4,
      }}
      draggable={isEditMode}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={() => isEditMode && setSelectedWidgetId(widget.id)}
    >
      {/* Edit Controls */}
      {isEditMode && isSelected && (
        <div className="absolute -top-2 -right-2 z-20 flex items-center gap-1">
          <Button
            variant="secondary"
            size="icon"
            className="h-6 w-6 shadow-sm bg-background"
          >
            <Move className="w-3 h-3" />
          </Button>
          <Button
            variant="destructive"
            size="icon"
            className="h-6 w-6 shadow-sm"
            onClick={(e) => {
              e.stopPropagation()
              removeWidget(widget.id)
            }}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      )}

      <WidgetContent widget={widget} />
    </div>
  )
}

// ---- Widget Content ----
function WidgetContent({ widget }: { widget: DashboardWidget }) {
  switch (widget.type) {
    case 'kpi':
      return <KPIWidget widget={widget} />
    case 'pie-chart':
      return <PieChartWidget widget={widget} />
    case 'bar-chart':
      return <BarChartWidget widget={widget} />
    case 'custom-table':
      return <CustomTableWidget widget={widget} />
    case 'mini-requisitos':
      return <MiniRequisitosWidget widget={widget} />
    case 'mini-matriz':
      return <MiniMatrizWidget widget={widget} />
    default:
      return (
        <Card className="h-full">
          <CardContent className="flex items-center justify-center h-full">
            <span className="text-muted-foreground text-sm">Widget no soportado</span>
          </CardContent>
        </Card>
      )
  }
}

// ---- KPI Widget (1x1) - Editable ----
function KPIWidget({ widget }: { widget: DashboardWidget }) {
  const { setWidgets, isEditMode } = useDashboardGrid()
  const data = widget.data as { value: number; label: string; unit?: string; trend?: string; color?: string }
  const [showEdit, setShowEdit] = useState(false)
  const [editData, setEditData] = useState(data)

  const handleSave = () => {
    setWidgets(prev => prev.map(w => w.id === widget.id ? { ...w, data: editData } : w))
    setShowEdit(false)
  }

  const isPositive = data.trend?.startsWith('+')
  const isNegative = data.trend?.startsWith('-')

  return (
    <>
      <Card className="h-full group relative">
        {isEditMode && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-1 right-1 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity z-10"
            onClick={() => setShowEdit(true)}
          >
            <Pencil className="h-3 w-3" />
          </Button>
        )}
        <CardContent className="flex flex-col items-center justify-center h-full p-2">
          <div className="text-2xl font-bold" style={{ color: data.color || 'inherit' }}>
            {data.value}{data.unit}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5 text-center line-clamp-1">{data.label}</div>
          {data.trend && (
            <Badge 
              variant="secondary" 
              className={`mt-1 text-xs ${isPositive ? 'bg-green-100 text-green-700' : isNegative ? 'bg-red-100 text-red-700' : ''}`}
            >
              {isPositive && <TrendingUp className="h-3 w-3 mr-0.5" />}
              {isNegative && <TrendingDown className="h-3 w-3 mr-0.5" />}
              {data.trend}
            </Badge>
          )}
        </CardContent>
      </Card>

      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle>Editar KPI</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label className="text-xs">Valor</Label>
              <Input type="number" value={editData.value} onChange={(e) => setEditData(p => ({ ...p, value: Number(e.target.value) }))} className="h-8" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Etiqueta</Label>
              <Input value={editData.label} onChange={(e) => setEditData(p => ({ ...p, label: e.target.value }))} className="h-8" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Unidad</Label>
                <Input value={editData.unit || ''} onChange={(e) => setEditData(p => ({ ...p, unit: e.target.value }))} placeholder="%, $, etc" className="h-8" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Tendencia</Label>
                <Input value={editData.trend || ''} onChange={(e) => setEditData(p => ({ ...p, trend: e.target.value }))} placeholder="+5%, -2%" className="h-8" />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Color</Label>
              <div className="flex gap-2">
                {['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#000000'].map(color => (
                  <button
                    key={color}
                    className={`w-6 h-6 rounded-full border-2 ${editData.color === color ? 'border-foreground' : 'border-transparent'}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setEditData(p => ({ ...p, color }))}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setShowEdit(false)}>Cancelar</Button>
            <Button size="sm" onClick={handleSave}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

// ---- Pie Chart Widget (2x2) - Editable ----
function PieChartWidget({ widget }: { widget: DashboardWidget }) {
  const { setWidgets, isEditMode } = useDashboardGrid()
  const data = widget.data as { items: { label: string; value: number; color: string }[] }
  const [showEdit, setShowEdit] = useState(false)
  const [editItems, setEditItems] = useState(data.items)
  
  const total = data.items.reduce((acc, item) => acc + item.value, 0)

  // Calculate segments
  let currentAngle = 0
  const segments = data.items.map(item => {
    const percentage = total > 0 ? (item.value / total) * 100 : 0
    const angle = (percentage / 100) * 360
    const startAngle = currentAngle
    currentAngle += angle
    return { ...item, percentage, startAngle, angle }
  })

  // SVG path for pie segment
  const createPiePath = (startAngle: number, angle: number, radius: number) => {
    const startRad = (startAngle - 90) * Math.PI / 180
    const endRad = (startAngle + angle - 90) * Math.PI / 180
    const x1 = 50 + radius * Math.cos(startRad)
    const y1 = 50 + radius * Math.sin(startRad)
    const x2 = 50 + radius * Math.cos(endRad)
    const y2 = 50 + radius * Math.sin(endRad)
    const largeArc = angle > 180 ? 1 : 0
    return `M 50 50 L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`
  }

  const handleSave = () => {
    setWidgets(prev => prev.map(w => w.id === widget.id ? { ...w, data: { items: editItems } } : w))
    setShowEdit(false)
  }

  const handleAddItem = () => {
    const colors = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']
    setEditItems(prev => [...prev, { label: 'Nuevo', value: 10, color: colors[prev.length % colors.length] }])
  }

  const handleUpdateItem = (idx: number, field: string, value: string | number) => {
    setEditItems(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item))
  }

  const handleRemoveItem = (idx: number) => {
    setEditItems(prev => prev.filter((_, i) => i !== idx))
  }

  return (
    <>
      <Card className="h-full group relative">
        {isEditMode && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-1 right-1 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity z-10"
            onClick={() => { setEditItems(data.items); setShowEdit(true) }}
          >
            <Pencil className="h-3 w-3" />
          </Button>
        )}
        <CardHeader className="pb-1 pt-2 px-3">
          <CardTitle className="text-xs font-medium">{widget.title}</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between p-2 pt-0 h-[calc(100%-36px)]">
          {/* Pie Chart */}
          <div className="relative w-24 h-24 shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {segments.map((seg, i) => (
                <path
                  key={i}
                  d={createPiePath(seg.startAngle, seg.angle, 40)}
                  fill={seg.color}
                  className="transition-opacity hover:opacity-80"
                />
              ))}
              <circle cx="50" cy="50" r="18" fill="white" className="dark:fill-background" />
              <text x="50" y="54" textAnchor="middle" className="text-xs font-bold fill-foreground">
                {total}
              </text>
            </svg>
          </div>

          {/* Legend */}
          <div className="flex-1 pl-2 space-y-1 overflow-auto max-h-full">
            {segments.map((seg, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs">
                <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: seg.color }} />
                <span className="flex-1 text-muted-foreground truncate">{seg.label}</span>
                <span className="font-medium">{seg.percentage.toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Grafico</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2 max-h-[50vh] overflow-auto">
            {editItems.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 p-2 border rounded-lg">
                <input
                  type="color"
                  value={item.color}
                  onChange={(e) => handleUpdateItem(idx, 'color', e.target.value)}
                  className="w-8 h-8 rounded border-0 cursor-pointer"
                />
                <Input
                  value={item.label}
                  onChange={(e) => handleUpdateItem(idx, 'label', e.target.value)}
                  placeholder="Etiqueta"
                  className="h-8 flex-1"
                />
                <Input
                  type="number"
                  value={item.value}
                  onChange={(e) => handleUpdateItem(idx, 'value', Number(e.target.value))}
                  className="h-8 w-20"
                />
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => handleRemoveItem(idx)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" className="w-full" onClick={handleAddItem}>
              <Plus className="h-4 w-4 mr-1" />
              Agregar Segmento
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setShowEdit(false)}>Cancelar</Button>
            <Button size="sm" onClick={handleSave}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

// ---- Bar Chart Widget (3x2) - Editable ----
function BarChartWidget({ widget }: { widget: DashboardWidget }) {
  const { setWidgets, isEditMode } = useDashboardGrid()
  const data = widget.data as { items: { label: string; value: number; color?: string }[] }
  const [showEdit, setShowEdit] = useState(false)
  const [editItems, setEditItems] = useState(data.items)
  
  const maxValue = Math.max(...data.items.map(item => item.value), 1)

  const handleSave = () => {
    setWidgets(prev => prev.map(w => w.id === widget.id ? { ...w, data: { items: editItems } } : w))
    setShowEdit(false)
  }

  const handleAddItem = () => {
    setEditItems(prev => [...prev, { label: 'Nuevo', value: 50 }])
  }

  const handleUpdateItem = (idx: number, field: string, value: string | number) => {
    setEditItems(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item))
  }

  const handleRemoveItem = (idx: number) => {
    setEditItems(prev => prev.filter((_, i) => i !== idx))
  }

  return (
    <>
      <Card className="h-full group relative">
        {isEditMode && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-1 right-1 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity z-10"
            onClick={() => { setEditItems(data.items); setShowEdit(true) }}
          >
            <Pencil className="h-3 w-3" />
          </Button>
        )}
        <CardHeader className="pb-1 pt-2 px-3">
          <CardTitle className="text-xs font-medium">{widget.title}</CardTitle>
        </CardHeader>
        <CardContent className="flex items-end gap-2 p-3 pt-0 h-[calc(100%-36px)]">
          {data.items.map((item, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 min-w-0">
              <span className="text-xs font-medium">{item.value}</span>
              <div
                className="w-full rounded-t transition-all"
                style={{ 
                  height: `${Math.max((item.value / maxValue) * 100, 4)}%`,
                  backgroundColor: item.color || 'hsl(var(--primary))',
                  minHeight: '4px'
                }}
              />
              <span className="text-xs text-muted-foreground truncate w-full text-center">{item.label}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Grafico de Barras</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2 max-h-[50vh] overflow-auto">
            {editItems.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 p-2 border rounded-lg">
                <Input
                  value={item.label}
                  onChange={(e) => handleUpdateItem(idx, 'label', e.target.value)}
                  placeholder="Etiqueta"
                  className="h-8 flex-1"
                />
                <Input
                  type="number"
                  value={item.value}
                  onChange={(e) => handleUpdateItem(idx, 'value', Number(e.target.value))}
                  className="h-8 w-24"
                />
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => handleRemoveItem(idx)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" className="w-full" onClick={handleAddItem}>
              <Plus className="h-4 w-4 mr-1" />
              Agregar Barra
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setShowEdit(false)}>Cancelar</Button>
            <Button size="sm" onClick={handleSave}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

// ---- Custom Table Widget (4x3) ----
function CustomTableWidget({ widget }: { widget: DashboardWidget }) {
  const { setWidgets } = useDashboardGrid()
  const data = widget.data as { columns: TableColumn[]; rows: TableRow[]; title: string }
  const [showAddColumn, setShowAddColumn] = useState(false)
  const [newColumnName, setNewColumnName] = useState('')
  const [newColumnType, setNewColumnType] = useState<ColumnType>('text')
  const [showAddRow, setShowAddRow] = useState(false)

  const handleAddColumn = () => {
    if (!newColumnName.trim()) return
    const newColumn: TableColumn = {
      id: `col-${Date.now()}`,
      name: newColumnName.trim(),
      type: newColumnType,
      options: newColumnType === 'select' ? ['Opcion 1', 'Opcion 2', 'Opcion 3'] : undefined,
    }
    const updatedData = { ...data, columns: [...data.columns, newColumn] }
    setWidgets(prev => prev.map(w => w.id === widget.id ? { ...w, data: updatedData } : w))
    setNewColumnName('')
    setNewColumnType('text')
    setShowAddColumn(false)
  }

  const handleAddRow = () => {
    const newRow: TableRow = {
      id: `row-${Date.now()}`,
      cells: data.columns.reduce((acc, col) => ({ ...acc, [col.id]: '' }), {}),
    }
    const updatedData = { ...data, rows: [...data.rows, newRow] }
    setWidgets(prev => prev.map(w => w.id === widget.id ? { ...w, data: updatedData } : w))
  }

  const handleCellChange = (rowId: string, colId: string, value: unknown) => {
    const updatedRows = data.rows.map(row => 
      row.id === rowId ? { ...row, cells: { ...row.cells, [colId]: value } } : row
    )
    const updatedData = { ...data, rows: updatedRows }
    setWidgets(prev => prev.map(w => w.id === widget.id ? { ...w, data: updatedData } : w))
  }

  const handleDeleteRow = (rowId: string) => {
    const updatedData = { ...data, rows: data.rows.filter(r => r.id !== rowId) }
    setWidgets(prev => prev.map(w => w.id === widget.id ? { ...w, data: updatedData } : w))
  }

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <CardHeader className="py-2 px-3 border-b flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <Table2 className="h-4 w-4 text-blue-600" />
          <CardTitle className="text-sm font-medium">{data.title}</CardTitle>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => setShowAddColumn(true)}>
            <Plus className="h-3 w-3 mr-1" />
            Columna
          </Button>
          <Button variant="ghost" size="sm" className="h-7 px-2" onClick={handleAddRow}>
            <Plus className="h-3 w-3 mr-1" />
            Fila
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0 overflow-auto">
        {data.columns.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <Table2 className="h-8 w-8 text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">Agrega columnas para comenzar</p>
          </div>
        ) : (
          <table className="w-full text-xs">
            <thead className="bg-muted/50 sticky top-0">
              <tr>
                {data.columns.map(col => (
                  <th key={col.id} className="px-2 py-1.5 text-left font-medium text-muted-foreground border-b">
                    {col.name}
                  </th>
                ))}
                <th className="w-8 border-b"></th>
              </tr>
            </thead>
            <tbody>
              {data.rows.length === 0 ? (
                <tr>
                  <td colSpan={data.columns.length + 1} className="px-2 py-4 text-center text-muted-foreground">
                    Sin datos. Agrega filas para comenzar.
                  </td>
                </tr>
              ) : (
                data.rows.map(row => (
                  <tr key={row.id} className="border-b hover:bg-muted/30">
                    {data.columns.map(col => (
                      <td key={col.id} className="px-2 py-1">
                        {col.type === 'select' ? (
                          <select
                            value={String(row.cells[col.id] || '')}
                            onChange={(e) => handleCellChange(row.id, col.id, e.target.value)}
                            className="w-full bg-transparent text-xs border-0 focus:ring-0 p-0"
                          >
                            <option value="">Seleccionar...</option>
                            {col.options?.map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={col.type === 'number' ? 'number' : col.type === 'date' ? 'date' : 'text'}
                            value={String(row.cells[col.id] || '')}
                            onChange={(e) => handleCellChange(row.id, col.id, e.target.value)}
                            className="w-full bg-transparent text-xs border-0 focus:ring-0 p-0"
                            placeholder="..."
                          />
                        )}
                      </td>
                    ))}
                    <td className="px-1">
                      <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => handleDeleteRow(row.id)}>
                        <X className="h-3 w-3" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </CardContent>

      {/* Add Column Dialog */}
      <Dialog open={showAddColumn} onOpenChange={setShowAddColumn}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Nueva Columna</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input value={newColumnName} onChange={(e) => setNewColumnName(e.target.value)} placeholder="Nombre de la columna" />
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={newColumnType} onValueChange={(v) => setNewColumnType(v as ColumnType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Texto</SelectItem>
                  <SelectItem value="number">Numero</SelectItem>
                  <SelectItem value="date">Fecha</SelectItem>
                  <SelectItem value="select">Seleccion</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddColumn(false)}>Cancelar</Button>
            <Button onClick={handleAddColumn} disabled={!newColumnName.trim()}>Agregar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

// ---- Mini Requisitos (Obligaciones Legales) Widget (4x4) ----
function MiniRequisitosWidget({ widget }: { widget: DashboardWidget }) {
  const { setWidgets } = useDashboardGrid()
  const data = widget.data as {
    title: string
    vinculaciones: Array<{
      id: string
      norma: string
      articulo: string
      unidadControl: string
      criticidad: 'alta' | 'media' | 'baja'
      estado: 'pendiente' | 'cumple' | 'no-cumple' | 'parcial'
    }>
    evaluaciones: Array<{ id: string; fecha: string; responsable: string; resultados: number }>
    hallazgos: Array<{ id: string; descripcion: string; tipo: 'nc-mayor' | 'nc-menor' | 'observacion'; estado: 'abierto' | 'en-proceso' | 'cerrado' }>
  }
  
  const [activeTab, setActiveTab] = useState<'vinculaciones' | 'hallazgos'>('vinculaciones')
  const [showAddVinculacion, setShowAddVinculacion] = useState(false)
  const [newVinculacion, setNewVinculacion] = useState({ norma: '', articulo: '', unidadControl: '', criticidad: 'media' as const })

  const handleAddVinculacion = () => {
    if (!newVinculacion.norma.trim()) return
    const vinculacion = {
      id: `vinc-${Date.now()}`,
      ...newVinculacion,
      estado: 'pendiente' as const,
    }
    const updatedData = { ...data, vinculaciones: [...data.vinculaciones, vinculacion] }
    setWidgets(prev => prev.map(w => w.id === widget.id ? { ...w, data: updatedData } : w))
    setNewVinculacion({ norma: '', articulo: '', unidadControl: '', criticidad: 'media' })
    setShowAddVinculacion(false)
  }

  const handleUpdateEstado = (vinculacionId: string, estado: 'pendiente' | 'cumple' | 'no-cumple' | 'parcial') => {
    const updatedVinculaciones = data.vinculaciones.map(v => 
      v.id === vinculacionId ? { ...v, estado } : v
    )
    const updatedData = { ...data, vinculaciones: updatedVinculaciones }
    setWidgets(prev => prev.map(w => w.id === widget.id ? { ...w, data: updatedData } : w))
  }

  const estadoColors = {
    'pendiente': 'bg-gray-100 text-gray-700',
    'cumple': 'bg-green-100 text-green-700',
    'no-cumple': 'bg-red-100 text-red-700',
    'parcial': 'bg-yellow-100 text-yellow-700',
  }

  const criticidadColors = {
    'alta': 'bg-red-500',
    'media': 'bg-yellow-500',
    'baja': 'bg-green-500',
  }

  // Stats
  const cumple = data.vinculaciones.filter(v => v.estado === 'cumple').length
  const noCumple = data.vinculaciones.filter(v => v.estado === 'no-cumple').length
  const parcial = data.vinculaciones.filter(v => v.estado === 'parcial').length
  const pendiente = data.vinculaciones.filter(v => v.estado === 'pendiente').length

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <CardHeader className="py-2 px-3 border-b flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <Scale className="h-4 w-4 text-teal-600" />
          <CardTitle className="text-sm font-medium">{data.title}</CardTitle>
          <Badge variant="secondary" className="text-xs">{data.vinculaciones.length}</Badge>
        </div>
      </CardHeader>
      
      {/* Stats */}
      <div className="grid grid-cols-4 gap-1 p-2 border-b bg-muted/30">
        <div className="text-center">
          <div className="text-lg font-bold text-green-600">{cumple}</div>
          <div className="text-xs text-muted-foreground">Cumple</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-yellow-600">{parcial}</div>
          <div className="text-xs text-muted-foreground">Parcial</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-red-600">{noCumple}</div>
          <div className="text-xs text-muted-foreground">No Cumple</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-gray-600">{pendiente}</div>
          <div className="text-xs text-muted-foreground">Pendiente</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center border-b px-2">
        <button
          onClick={() => setActiveTab('vinculaciones')}
          className={`px-3 py-1.5 text-xs font-medium border-b-2 transition-colors ${
            activeTab === 'vinculaciones' ? 'border-teal-500 text-teal-600' : 'border-transparent text-muted-foreground'
          }`}
        >
          Vinculaciones
        </button>
        <button
          onClick={() => setActiveTab('hallazgos')}
          className={`px-3 py-1.5 text-xs font-medium border-b-2 transition-colors ${
            activeTab === 'hallazgos' ? 'border-teal-500 text-teal-600' : 'border-transparent text-muted-foreground'
          }`}
        >
          Hallazgos ({data.hallazgos.length})
        </button>
        <div className="flex-1" />
        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={() => setShowAddVinculacion(true)}>
          <Plus className="h-3 w-3 mr-1" />
          Agregar
        </Button>
      </div>

      <CardContent className="flex-1 p-0 overflow-auto">
        {activeTab === 'vinculaciones' && (
          data.vinculaciones.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <Scale className="h-8 w-8 text-muted-foreground/50 mb-2" />
              <p className="text-xs text-muted-foreground">Sin vinculaciones. Agrega normativas para evaluar.</p>
            </div>
          ) : (
            <div className="divide-y">
              {data.vinculaciones.map(vinc => (
                <div key={vinc.id} className="p-2 hover:bg-muted/30">
                  <div className="flex items-start gap-2">
                    <div className={`w-1 h-full rounded-full ${criticidadColors[vinc.criticidad]}`} style={{ minHeight: '40px' }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-medium truncate">{vinc.norma}</span>
                        <span className="text-xs text-muted-foreground">Art. {vinc.articulo}</span>
                      </div>
                      <div className="text-xs text-muted-foreground truncate">{vinc.unidadControl}</div>
                    </div>
                    <select
                      value={vinc.estado}
                      onChange={(e) => handleUpdateEstado(vinc.id, e.target.value as typeof vinc.estado)}
                      className={`text-xs px-1.5 py-0.5 rounded border-0 ${estadoColors[vinc.estado]}`}
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="cumple">Cumple</option>
                      <option value="parcial">Parcial</option>
                      <option value="no-cumple">No Cumple</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
        {activeTab === 'hallazgos' && (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <AlertTriangle className="h-8 w-8 text-muted-foreground/50 mb-2" />
            <p className="text-xs text-muted-foreground">Los hallazgos se generan al evaluar vinculaciones</p>
          </div>
        )}
      </CardContent>

      {/* Add Vinculacion Dialog */}
      <Dialog open={showAddVinculacion} onOpenChange={setShowAddVinculacion}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nueva Vinculacion</DialogTitle>
            <DialogDescription>Agrega una normativa para evaluar su cumplimiento</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label className="text-xs">Norma/Decreto</Label>
              <Input value={newVinculacion.norma} onChange={(e) => setNewVinculacion(p => ({ ...p, norma: e.target.value }))} placeholder="Ej: D.S. 40/2012" className="h-8 text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Articulo</Label>
              <Input value={newVinculacion.articulo} onChange={(e) => setNewVinculacion(p => ({ ...p, articulo: e.target.value }))} placeholder="Ej: 5" className="h-8 text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Unidad de Control</Label>
              <Input value={newVinculacion.unidadControl} onChange={(e) => setNewVinculacion(p => ({ ...p, unidadControl: e.target.value }))} placeholder="Ej: Planta Principal" className="h-8 text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Criticidad</Label>
              <Select value={newVinculacion.criticidad} onValueChange={(v) => setNewVinculacion(p => ({ ...p, criticidad: v as 'alta' | 'media' | 'baja' }))}>
                <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="media">Media</SelectItem>
                  <SelectItem value="baja">Baja</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setShowAddVinculacion(false)}>Cancelar</Button>
            <Button size="sm" onClick={handleAddVinculacion} disabled={!newVinculacion.norma.trim()}>Agregar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

// ---- Mini Matriz de Riesgo Widget (4x4) ----
function MiniMatrizWidget({ widget }: { widget: DashboardWidget }) {
  const { setWidgets } = useDashboardGrid()
  const data = widget.data as {
    title: string
    procesos: Array<{
      id: string
      nombre: string
      tareas: Array<{
        id: string
        nombre: string
        peligros: Array<{
          id: string
          descripcion: string
          riesgo: string
          probabilidad: number
          consecuencia: number
          vep: number
          nivel: 'bajo' | 'medio' | 'alto' | 'critico'
          medidas: string[]
        }>
      }>
    }>
    configuracion: {
      escalaProbabilidad: number[]
      escalaConsecuencia: number[]
      nivelesRiesgo: Array<{ min: number; max: number; nivel: string; color: string }>
    }
  }
  
  const [activeTab, setActiveTab] = useState<'identificacion' | 'matriz'>('identificacion')
  const [showAddProceso, setShowAddProceso] = useState(false)
  const [showAddPeligro, setShowAddPeligro] = useState(false)
  const [selectedProcesoId, setSelectedProcesoId] = useState<string | null>(null)
  const [newProceso, setNewProceso] = useState('')
  const [newPeligro, setNewPeligro] = useState({ descripcion: '', riesgo: '', probabilidad: 3, consecuencia: 3 })

  // Count all peligros
  const allPeligros = data.procesos.flatMap(p => p.tareas.flatMap(t => t.peligros))
  const countByNivel = {
    bajo: allPeligros.filter(p => p.nivel === 'bajo').length,
    medio: allPeligros.filter(p => p.nivel === 'medio').length,
    alto: allPeligros.filter(p => p.nivel === 'alto').length,
    critico: allPeligros.filter(p => p.nivel === 'critico').length,
  }

  const getNivel = (vep: number): 'bajo' | 'medio' | 'alto' | 'critico' => {
    if (vep <= 4) return 'bajo'
    if (vep <= 9) return 'medio'
    if (vep <= 16) return 'alto'
    return 'critico'
  }

  const nivelColors = {
    'bajo': 'bg-green-100 text-green-700',
    'medio': 'bg-yellow-100 text-yellow-700',
    'alto': 'bg-orange-100 text-orange-700',
    'critico': 'bg-red-100 text-red-700',
  }

  const handleAddProceso = () => {
    if (!newProceso.trim()) return
    const proceso = {
      id: `proc-${Date.now()}`,
      nombre: newProceso.trim(),
      tareas: [{ id: `tarea-${Date.now()}`, nombre: 'Tarea General', peligros: [] }],
    }
    const updatedData = { ...data, procesos: [...data.procesos, proceso] }
    setWidgets(prev => prev.map(w => w.id === widget.id ? { ...w, data: updatedData } : w))
    setNewProceso('')
    setShowAddProceso(false)
  }

  const handleAddPeligro = () => {
    if (!newPeligro.descripcion.trim() || !selectedProcesoId) return
    const vep = newPeligro.probabilidad * newPeligro.consecuencia
    const peligro = {
      id: `peligro-${Date.now()}`,
      ...newPeligro,
      vep,
      nivel: getNivel(vep),
      medidas: [],
    }
    
    const updatedProcesos = data.procesos.map(proc => {
      if (proc.id === selectedProcesoId && proc.tareas[0]) {
        return {
          ...proc,
          tareas: [{
            ...proc.tareas[0],
            peligros: [...proc.tareas[0].peligros, peligro]
          }]
        }
      }
      return proc
    })
    
    const updatedData = { ...data, procesos: updatedProcesos }
    setWidgets(prev => prev.map(w => w.id === widget.id ? { ...w, data: updatedData } : w))
    setNewPeligro({ descripcion: '', riesgo: '', probabilidad: 3, consecuencia: 3 })
    setShowAddPeligro(false)
  }

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <CardHeader className="py-2 px-3 border-b flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-red-600" />
          <CardTitle className="text-sm font-medium">{data.title}</CardTitle>
          <Badge variant="secondary" className="text-xs">{allPeligros.length} riesgos</Badge>
        </div>
      </CardHeader>
      
      {/* Stats */}
      <div className="grid grid-cols-4 gap-1 p-2 border-b bg-muted/30">
        <div className="text-center">
          <div className="text-lg font-bold text-green-600">{countByNivel.bajo}</div>
          <div className="text-xs text-muted-foreground">Bajo</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-yellow-600">{countByNivel.medio}</div>
          <div className="text-xs text-muted-foreground">Medio</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-orange-600">{countByNivel.alto}</div>
          <div className="text-xs text-muted-foreground">Alto</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-red-600">{countByNivel.critico}</div>
          <div className="text-xs text-muted-foreground">Critico</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center border-b px-2">
        <button
          onClick={() => setActiveTab('identificacion')}
          className={`px-3 py-1.5 text-xs font-medium border-b-2 transition-colors ${
            activeTab === 'identificacion' ? 'border-red-500 text-red-600' : 'border-transparent text-muted-foreground'
          }`}
        >
          Identificacion
        </button>
        <button
          onClick={() => setActiveTab('matriz')}
          className={`px-3 py-1.5 text-xs font-medium border-b-2 transition-colors ${
            activeTab === 'matriz' ? 'border-red-500 text-red-600' : 'border-transparent text-muted-foreground'
          }`}
        >
          Matriz PxC
        </button>
        <div className="flex-1" />
        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={() => setShowAddProceso(true)}>
          <Plus className="h-3 w-3 mr-1" />
          Proceso
        </Button>
      </div>

      <CardContent className="flex-1 p-0 overflow-auto">
        {activeTab === 'identificacion' && (
          data.procesos.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <ShieldAlert className="h-8 w-8 text-muted-foreground/50 mb-2" />
              <p className="text-xs text-muted-foreground">Agrega procesos para identificar peligros</p>
            </div>
          ) : (
            <div className="divide-y">
              {data.procesos.map(proceso => (
                <div key={proceso.id} className="p-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium">{proceso.nombre}</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-5 px-1.5 text-xs"
                      onClick={() => { setSelectedProcesoId(proceso.id); setShowAddPeligro(true) }}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  {proceso.tareas[0]?.peligros.map(peligro => (
                    <div key={peligro.id} className="ml-2 pl-2 border-l-2 border-muted py-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs truncate flex-1">{peligro.descripcion}</span>
                        <Badge className={`text-xs ml-1 ${nivelColors[peligro.nivel]}`}>
                          VEP: {peligro.vep}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )
        )}
        
        {activeTab === 'matriz' && (
          <div className="p-3">
            <div className="text-xs text-center text-muted-foreground mb-2">Matriz Probabilidad x Consecuencia</div>
            <div className="grid grid-cols-6 gap-0.5 text-xs max-w-xs mx-auto">
              <div className="p-1"></div>
              {[1, 2, 3, 4, 5].map(c => (
                <div key={c} className="p-1 text-center font-medium text-muted-foreground">C{c}</div>
              ))}
              {[5, 4, 3, 2, 1].map(p => (
                <React.Fragment key={p}>
                  <div className="p-1 font-medium text-muted-foreground">P{p}</div>
                  {[1, 2, 3, 4, 5].map(c => {
                    const vep = p * c
                    const nivel = getNivel(vep)
                    const count = allPeligros.filter(pel => pel.probabilidad === p && pel.consecuencia === c).length
                    return (
                      <div
                        key={`${p}-${c}`}
                        className={`p-1 text-center rounded text-xs ${nivelColors[nivel]} ${count > 0 ? 'font-bold ring-2 ring-foreground/20' : ''}`}
                      >
                        {count > 0 ? count : vep}
                      </div>
                    )
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}
      </CardContent>

      {/* Add Proceso Dialog */}
      <Dialog open={showAddProceso} onOpenChange={setShowAddProceso}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Nuevo Proceso</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label className="text-xs">Nombre del Proceso</Label>
            <Input value={newProceso} onChange={(e) => setNewProceso(e.target.value)} placeholder="Ej: Operaciones de Planta" className="h-8 text-sm" />
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setShowAddProceso(false)}>Cancelar</Button>
            <Button size="sm" onClick={handleAddProceso} disabled={!newProceso.trim()}>Agregar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Peligro Dialog */}
      <Dialog open={showAddPeligro} onOpenChange={setShowAddPeligro}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nuevo Peligro/Riesgo</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label className="text-xs">Peligro</Label>
              <Input value={newPeligro.descripcion} onChange={(e) => setNewPeligro(p => ({ ...p, descripcion: e.target.value }))} placeholder="Descripcion del peligro" className="h-8 text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Riesgo Asociado</Label>
              <Input value={newPeligro.riesgo} onChange={(e) => setNewPeligro(p => ({ ...p, riesgo: e.target.value }))} placeholder="Descripcion del riesgo" className="h-8 text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Probabilidad (1-5)</Label>
                <Select value={String(newPeligro.probabilidad)} onValueChange={(v) => setNewPeligro(p => ({ ...p, probabilidad: Number(v) }))}>
                  <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map(n => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Consecuencia (1-5)</Label>
                <Select value={String(newPeligro.consecuencia)} onValueChange={(v) => setNewPeligro(p => ({ ...p, consecuencia: Number(v) }))}>
                  <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map(n => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="p-2 bg-muted rounded text-center">
              <span className="text-xs text-muted-foreground">VEP: </span>
              <span className={`text-sm font-bold px-2 py-0.5 rounded ${nivelColors[getNivel(newPeligro.probabilidad * newPeligro.consecuencia)]}`}>
                {newPeligro.probabilidad * newPeligro.consecuencia} ({getNivel(newPeligro.probabilidad * newPeligro.consecuencia)})
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setShowAddPeligro(false)}>Cancelar</Button>
            <Button size="sm" onClick={handleAddPeligro} disabled={!newPeligro.descripcion.trim()}>Agregar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

// ---- Export DashboardView for use in workspace ----
interface DashboardViewProps {
  viewId?: string
  viewName?: string
}

export function DashboardView({ viewId = 'default', viewName = 'Dashboard' }: DashboardViewProps) {
  return (
    <DashboardGridProvider key={viewId}>
      <DashboardGrid viewName={viewName} />
    </DashboardGridProvider>
  )
}
