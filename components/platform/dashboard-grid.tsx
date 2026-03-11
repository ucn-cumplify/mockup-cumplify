'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
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
  LayoutGrid
} from 'lucide-react'

// ---- Types ----
export type DashboardWidgetType = 'kpi' | 'pie-chart' | 'bar-chart'

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
const GRID_COLS = 4
const GRID_ROWS = 6
const CELL_SIZE = 150

// Widget size configurations (fixed sizes)
const widgetSizeConfig: Record<DashboardWidgetType, { cols: number; rows: number }> = {
  'kpi': { cols: 1, rows: 1 },
  'pie-chart': { cols: 2, rows: 2 },
  'bar-chart': { cols: 2, rows: 1 },
}

// Widget templates
const widgetTemplates: { type: DashboardWidgetType; label: string; icon: typeof PieChart; description: string }[] = [
  { type: 'kpi', label: 'Card de KPI', icon: Hash, description: 'Componente pequeno 1x1 que muestra un KPI' },
  { type: 'pie-chart', label: 'Grafico de Torta', icon: PieChart, description: 'Grafico circular 2x2 para datos visuales' },
  { type: 'bar-chart', label: 'Grafico de Barras', icon: BarChart3, description: 'Grafico en barras 2x1 comparativo' },
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
    default:
      return {}
  }
}

// ---- Main Dashboard Grid Component ----
export function DashboardGrid() {
  const {
    widgets,
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
          <h1 className="text-lg font-semibold">Dashboard</h1>
          {isEditMode && (
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              Modo Edicion
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
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

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="w-4 h-4 mr-1" />
          Agregar Widget
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80">
        <SheetHeader>
          <SheetTitle>Componentes</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-3">
          {widgetTemplates.map(template => {
            const size = widgetSizeConfig[template.type]
            return (
              <div
                key={template.type}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.effectAllowed = 'move'
                  onDragStart(template.type)
                }}
                onDragEnd={onDragEnd}
                className="p-4 border rounded-lg cursor-grab active:cursor-grabbing hover:border-primary hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <template.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">{template.label}</h4>
                      <Badge variant="outline" className="text-xs">
                        {size.cols}x{size.rows}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {template.description}
                    </p>
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

// ---- KPI Widget (1x1) ----
function KPIWidget({ widget }: { widget: DashboardWidget }) {
  const data = widget.data as { value: number; label: string; unit?: string; trend?: string }

  return (
    <Card className="h-full">
      <CardContent className="flex flex-col items-center justify-center h-full p-3">
        <div className="text-3xl font-bold text-foreground">
          {data.value}{data.unit}
        </div>
        <div className="text-xs text-muted-foreground mt-1">{data.label}</div>
        {data.trend && (
          <Badge variant="secondary" className="mt-2 text-xs">
            {data.trend}
          </Badge>
        )}
      </CardContent>
    </Card>
  )
}

// ---- Pie Chart Widget (2x2) ----
function PieChartWidget({ widget }: { widget: DashboardWidget }) {
  const data = widget.data as { items: { label: string; value: number; color: string }[] }
  const total = data.items.reduce((acc, item) => acc + item.value, 0)

  // Calculate segments
  let currentAngle = 0
  const segments = data.items.map(item => {
    const percentage = (item.value / total) * 100
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

  return (
    <Card className="h-full">
      <CardHeader className="pb-2 pt-3 px-3">
        <CardTitle className="text-sm font-medium">{widget.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-between p-3 pt-0 h-[calc(100%-48px)]">
        {/* Pie Chart */}
        <div className="relative w-32 h-32">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {segments.map((seg, i) => (
              <path
                key={i}
                d={createPiePath(seg.startAngle, seg.angle, 40)}
                fill={seg.color}
                className="transition-opacity hover:opacity-80"
              />
            ))}
            <circle cx="50" cy="50" r="20" fill="white" className="dark:fill-background" />
            <text x="50" y="54" textAnchor="middle" className="text-xs font-bold fill-foreground">
              {total}
            </text>
          </svg>
        </div>

        {/* Legend */}
        <div className="flex-1 pl-4 space-y-2">
          {segments.map((seg, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: seg.color }} />
              <span className="flex-1 text-muted-foreground">{seg.label}</span>
              <span className="font-medium">{seg.percentage.toFixed(0)}%</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ---- Bar Chart Widget (2x1) ----
function BarChartWidget({ widget }: { widget: DashboardWidget }) {
  const data = widget.data as { items: { label: string; value: number }[] }
  const maxValue = Math.max(...data.items.map(item => item.value))

  return (
    <Card className="h-full">
      <CardHeader className="pb-1 pt-2 px-3">
        <CardTitle className="text-sm font-medium">{widget.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex items-end gap-1 p-3 pt-0 h-[calc(100%-40px)]">
        {data.items.map((item, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full bg-primary rounded-t transition-all"
              style={{ height: `${(item.value / maxValue) * 60}px` }}
            />
            <span className="text-xs text-muted-foreground">{item.label}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

// ---- Export DashboardView for use in workspace ----
export function DashboardView() {
  return (
    <DashboardGridProvider>
      <DashboardGrid />
    </DashboardGridProvider>
  )
}
