'use client'

import * as React from 'react'
import { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { 
  GripVertical, 
  Settings, 
  Trash2, 
  Plus,
  Pencil,
  Save,
  X,
  PieChart,
  BarChart3,
  Hash,
  List,
  Activity,
  Table,
  GitBranch,
  Type,
  Image,
  LayoutGrid,
  Palette,
  Database,
  Eye,
  EyeOff,
  Copy,
  MoveUp,
  MoveDown,
  Maximize2,
  Minimize2,
  ChevronRight,
  Sparkles
} from 'lucide-react'
import { mockComplianceStats, mockProjects, mockLegalBodies, mockControlUnits, mockManagementUnits } from '@/lib/mock-data'

// Types
export interface PageWidget {
  id: string
  type: WidgetType
  title: string
  size: 'small' | 'medium' | 'large' | 'full'
  config: WidgetConfig
  position: number
  isVisible: boolean
}

export type WidgetType = 
  | 'donut-chart' 
  | 'bar-chart' 
  | 'stats-card' 
  | 'list' 
  | 'progress-bar' 
  | 'table' 
  | 'text-block'
  | 'heading'
  | 'image'
  | 'spacer'
  | 'divider'
  | 'kpi-card'
  | 'timeline'

export interface WidgetConfig {
  dataSource?: string
  metric?: string
  content?: string
  fontSize?: string
  textAlign?: 'left' | 'center' | 'right'
  backgroundColor?: string
  textColor?: string
  showLegend?: boolean
  height?: number
  imageUrl?: string
  items?: Array<{ label: string; value: number; color?: string }>
}

// Data sources available
const dataSources = [
  { id: 'compliance', label: 'Estadísticas de Cumplimiento', data: mockComplianceStats },
  { id: 'projects', label: 'Proyectos', data: mockProjects },
  { id: 'legalBodies', label: 'Cuerpos Legales', data: mockLegalBodies },
  { id: 'controlUnits', label: 'Unidades de Control', data: mockControlUnits },
  { id: 'managementUnits', label: 'Unidades de Gestión', data: mockManagementUnits },
]

// Widget Templates
const widgetTemplates: Array<{ type: WidgetType; label: string; icon: typeof PieChart; category: string }> = [
  // Charts
  { type: 'donut-chart', label: 'Gráfico Circular', icon: PieChart, category: 'charts' },
  { type: 'bar-chart', label: 'Gráfico de Barras', icon: BarChart3, category: 'charts' },
  { type: 'progress-bar', label: 'Barras de Progreso', icon: Activity, category: 'charts' },
  // Data
  { type: 'stats-card', label: 'Tarjeta KPI', icon: Hash, category: 'data' },
  { type: 'kpi-card', label: 'KPI Grande', icon: Sparkles, category: 'data' },
  { type: 'list', label: 'Lista', icon: List, category: 'data' },
  { type: 'table', label: 'Tabla', icon: Table, category: 'data' },
  { type: 'timeline', label: 'Línea de Tiempo', icon: GitBranch, category: 'data' },
  // Content
  { type: 'heading', label: 'Título', icon: Type, category: 'content' },
  { type: 'text-block', label: 'Bloque de Texto', icon: Type, category: 'content' },
  { type: 'image', label: 'Imagen', icon: Image, category: 'content' },
  { type: 'spacer', label: 'Espaciador', icon: Maximize2, category: 'layout' },
  { type: 'divider', label: 'Divisor', icon: Minimize2, category: 'layout' },
]

// Main Page Builder Context
interface PageBuilderContextType {
  widgets: PageWidget[]
  isEditMode: boolean
  selectedWidgetId: string | null
  setWidgets: React.Dispatch<React.SetStateAction<PageWidget[]>>
  setIsEditMode: React.Dispatch<React.SetStateAction<boolean>>
  setSelectedWidgetId: React.Dispatch<React.SetStateAction<string | null>>
  addWidget: (type: WidgetType) => void
  removeWidget: (id: string) => void
  updateWidget: (id: string, updates: Partial<PageWidget>) => void
  duplicateWidget: (id: string) => void
  moveWidget: (id: string, direction: 'up' | 'down') => void
}

const PageBuilderContext = React.createContext<PageBuilderContextType | undefined>(undefined)

export function usePageBuilder() {
  const context = React.useContext(PageBuilderContext)
  if (!context) throw new Error('usePageBuilder must be used within PageBuilderProvider')
  return context
}

// Default widgets for dashboard
const defaultDashboardWidgets: PageWidget[] = [
  {
    id: 'w1',
    type: 'heading',
    title: 'Resumen General',
    size: 'full',
    config: { content: 'Panel de Control', fontSize: '2xl', textAlign: 'left' },
    position: 0,
    isVisible: true
  },
  {
    id: 'w2',
    type: 'stats-card',
    title: 'Total Obligaciones',
    size: 'small',
    config: { dataSource: 'compliance', metric: 'total' },
    position: 1,
    isVisible: true
  },
  {
    id: 'w3',
    type: 'stats-card',
    title: 'Cumple',
    size: 'small',
    config: { dataSource: 'compliance', metric: 'compliant', backgroundColor: '#dcfce7', textColor: '#166534' },
    position: 2,
    isVisible: true
  },
  {
    id: 'w4',
    type: 'stats-card',
    title: 'Cumple Parcial',
    size: 'small',
    config: { dataSource: 'compliance', metric: 'partiallyCompliant', backgroundColor: '#fef3c7', textColor: '#92400e' },
    position: 3,
    isVisible: true
  },
  {
    id: 'w5',
    type: 'stats-card',
    title: 'No Cumple',
    size: 'small',
    config: { dataSource: 'compliance', metric: 'nonCompliant', backgroundColor: '#fee2e2', textColor: '#991b1b' },
    position: 4,
    isVisible: true
  },
  {
    id: 'w6',
    type: 'donut-chart',
    title: 'Estado de Cumplimiento',
    size: 'medium',
    config: { 
      dataSource: 'compliance', 
      showLegend: true,
      items: [
        { label: 'Cumple', value: 98, color: '#22c55e' },
        { label: 'Parcial', value: 32, color: '#f59e0b' },
        { label: 'No Cumple', value: 14, color: '#ef4444' },
      ]
    },
    position: 5,
    isVisible: true
  },
  {
    id: 'w7',
    type: 'bar-chart',
    title: 'Por Categoría Normativa',
    size: 'medium',
    config: { 
      dataSource: 'legalBodies',
      items: [
        { label: 'Ambiental', value: 42 },
        { label: 'SST', value: 35 },
        { label: 'General', value: 28 },
        { label: 'Laboral', value: 18 },
      ]
    },
    position: 6,
    isVisible: true
  },
  {
    id: 'w8',
    type: 'list',
    title: 'Proyectos Recientes',
    size: 'medium',
    config: { dataSource: 'projects' },
    position: 7,
    isVisible: true
  },
  {
    id: 'w9',
    type: 'table',
    title: 'Cuerpos Legales Pendientes',
    size: 'medium',
    config: { dataSource: 'legalBodies' },
    position: 8,
    isVisible: true
  },
]

// Provider Component
export function PageBuilderProvider({ children }: { children: React.ReactNode }) {
  const [widgets, setWidgets] = useState<PageWidget[]>(defaultDashboardWidgets)
  const [isEditMode, setIsEditMode] = useState(false)
  const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null)

  const addWidget = useCallback((type: WidgetType) => {
    const template = widgetTemplates.find(t => t.type === type)
    const newWidget: PageWidget = {
      id: `widget-${Date.now()}`,
      type,
      title: template?.label || 'Nuevo Widget',
      size: type === 'heading' || type === 'divider' || type === 'spacer' ? 'full' : 'small',
      config: getDefaultConfig(type),
      position: widgets.length,
      isVisible: true
    }
    setWidgets(prev => [...prev, newWidget])
    setSelectedWidgetId(newWidget.id)
  }, [widgets.length])

  const removeWidget = useCallback((id: string) => {
    setWidgets(prev => prev.filter(w => w.id !== id))
    if (selectedWidgetId === id) setSelectedWidgetId(null)
  }, [selectedWidgetId])

  const updateWidget = useCallback((id: string, updates: Partial<PageWidget>) => {
    setWidgets(prev => prev.map(w => w.id === id ? { ...w, ...updates } : w))
  }, [])

  const duplicateWidget = useCallback((id: string) => {
    const widget = widgets.find(w => w.id === id)
    if (widget) {
      const newWidget: PageWidget = {
        ...widget,
        id: `widget-${Date.now()}`,
        title: `${widget.title} (copia)`,
        position: widgets.length
      }
      setWidgets(prev => [...prev, newWidget])
    }
  }, [widgets])

  const moveWidget = useCallback((id: string, direction: 'up' | 'down') => {
    setWidgets(prev => {
      const index = prev.findIndex(w => w.id === id)
      if (index === -1) return prev
      if (direction === 'up' && index === 0) return prev
      if (direction === 'down' && index === prev.length - 1) return prev

      const newWidgets = [...prev]
      const swapIndex = direction === 'up' ? index - 1 : index + 1
      ;[newWidgets[index], newWidgets[swapIndex]] = [newWidgets[swapIndex], newWidgets[index]]
      return newWidgets.map((w, i) => ({ ...w, position: i }))
    })
  }, [])

  return (
    <PageBuilderContext.Provider value={{
      widgets,
      isEditMode,
      selectedWidgetId,
      setWidgets,
      setIsEditMode,
      setSelectedWidgetId,
      addWidget,
      removeWidget,
      updateWidget,
      duplicateWidget,
      moveWidget
    }}>
      {children}
    </PageBuilderContext.Provider>
  )
}

function getDefaultConfig(type: WidgetType): WidgetConfig {
  switch (type) {
    case 'heading':
      return { content: 'Título de sección', fontSize: 'xl', textAlign: 'left' }
    case 'text-block':
      return { content: 'Escribe tu texto aquí...', textAlign: 'left' }
    case 'spacer':
      return { height: 40 }
    case 'stats-card':
    case 'kpi-card':
      return { dataSource: 'compliance', metric: 'total' }
    case 'donut-chart':
      return { 
        dataSource: 'compliance', 
        showLegend: true,
        items: [
          { label: 'Cumple', value: 98, color: '#22c55e' },
          { label: 'Parcial', value: 32, color: '#f59e0b' },
          { label: 'No Cumple', value: 14, color: '#ef4444' },
        ]
      }
    case 'bar-chart':
      return { 
        dataSource: 'compliance',
        items: [
          { label: 'Categoría 1', value: 45 },
          { label: 'Categoría 2', value: 35 },
          { label: 'Categoría 3', value: 28 },
        ]
      }
    case 'progress-bar':
      return {
        items: [
          { label: 'Objetivo 1', value: 75 },
          { label: 'Objetivo 2', value: 60 },
          { label: 'Objetivo 3', value: 90 },
        ]
      }
    case 'list':
      return { dataSource: 'projects' }
    case 'table':
      return { dataSource: 'legalBodies' }
    default:
      return {}
  }
}

// Main Page Builder Component
export function PageBuilder() {
  const { isEditMode, setIsEditMode, widgets, selectedWidgetId, setSelectedWidgetId } = usePageBuilder()

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Toolbar */}
      <div className="sticky top-0 z-20 bg-background border-b px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold">Tablero</h1>
          {isEditMode && (
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              Modo Edición
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isEditMode && <WidgetPalette />}
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
                Editar Página
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 flex">
        <ScrollArea className={cn("flex-1 p-6", isEditMode && selectedWidgetId && "pr-80")}>
          <div className={cn(
            "grid gap-4",
            "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
          )}>
            {widgets.filter(w => w.isVisible).map(widget => (
              <WidgetWrapper key={widget.id} widget={widget} />
            ))}
          </div>

          {isEditMode && widgets.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <LayoutGrid className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Tu página está vacía</h3>
              <p className="text-muted-foreground mb-4">
                Agrega widgets desde el panel de componentes para comenzar
              </p>
            </div>
          )}
        </ScrollArea>

        {/* Properties Panel */}
        {isEditMode && selectedWidgetId && (
          <PropertiesPanel />
        )}
      </div>
    </div>
  )
}

// Widget Palette (Add new widgets)
function WidgetPalette() {
  const { addWidget } = usePageBuilder()
  const [open, setOpen] = useState(false)

  const categories = [
    { id: 'charts', label: 'Gráficos' },
    { id: 'data', label: 'Datos' },
    { id: 'content', label: 'Contenido' },
    { id: 'layout', label: 'Diseño' },
  ]

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
        <Tabs defaultValue="charts" className="mt-4">
          <TabsList className="grid grid-cols-4 w-full">
            {categories.map(cat => (
              <TabsTrigger key={cat.id} value={cat.id} className="text-xs">
                {cat.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {categories.map(cat => (
            <TabsContent key={cat.id} value={cat.id} className="mt-4">
              <div className="grid grid-cols-2 gap-2">
                {widgetTemplates.filter(t => t.category === cat.id).map(template => (
                  <Button
                    key={template.type}
                    variant="outline"
                    className="h-auto flex-col gap-2 py-4"
                    onClick={() => {
                      addWidget(template.type)
                      setOpen(false)
                    }}
                  >
                    <template.icon className="w-6 h-6 text-primary" />
                    <span className="text-xs">{template.label}</span>
                  </Button>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}

// Widget Wrapper with edit controls
function WidgetWrapper({ widget }: { widget: PageWidget }) {
  const { isEditMode, selectedWidgetId, setSelectedWidgetId, removeWidget, duplicateWidget, moveWidget, updateWidget } = usePageBuilder()

  const sizeClasses = {
    small: 'col-span-1',
    medium: 'col-span-1 sm:col-span-2',
    large: 'col-span-1 sm:col-span-2 lg:col-span-3',
    full: 'col-span-1 sm:col-span-2 lg:col-span-4'
  }

  const isSelected = selectedWidgetId === widget.id

  return (
    <div
      className={cn(
        sizeClasses[widget.size],
        "relative group transition-all",
        isEditMode && "cursor-pointer",
        isEditMode && isSelected && "ring-2 ring-primary ring-offset-2 rounded-lg"
      )}
      onClick={() => isEditMode && setSelectedWidgetId(widget.id)}
    >
      {/* Edit Controls */}
      {isEditMode && (
        <div className={cn(
          "absolute -top-2 -right-2 z-10 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity",
          isSelected && "opacity-100"
        )}>
          <Button
            variant="secondary"
            size="icon"
            className="h-7 w-7 shadow-sm"
            onClick={(e) => { e.stopPropagation(); moveWidget(widget.id, 'up') }}
          >
            <MoveUp className="w-3 h-3" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="h-7 w-7 shadow-sm"
            onClick={(e) => { e.stopPropagation(); moveWidget(widget.id, 'down') }}
          >
            <MoveDown className="w-3 h-3" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="h-7 w-7 shadow-sm"
            onClick={(e) => { e.stopPropagation(); duplicateWidget(widget.id) }}
          >
            <Copy className="w-3 h-3" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="h-7 w-7 shadow-sm"
            onClick={(e) => { e.stopPropagation(); updateWidget(widget.id, { isVisible: false }) }}
          >
            <EyeOff className="w-3 h-3" />
          </Button>
          <Button
            variant="destructive"
            size="icon"
            className="h-7 w-7 shadow-sm"
            onClick={(e) => { e.stopPropagation(); removeWidget(widget.id) }}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      )}

      <WidgetContent widget={widget} />
    </div>
  )
}

// Widget Content Renderer
function WidgetContent({ widget }: { widget: PageWidget }) {
  switch (widget.type) {
    case 'heading':
      return <HeadingWidget widget={widget} />
    case 'text-block':
      return <TextBlockWidget widget={widget} />
    case 'spacer':
      return <SpacerWidget widget={widget} />
    case 'divider':
      return <DividerWidget />
    case 'stats-card':
      return <StatsCardWidget widget={widget} />
    case 'kpi-card':
      return <KPICardWidget widget={widget} />
    case 'donut-chart':
      return <DonutChartWidget widget={widget} />
    case 'bar-chart':
      return <BarChartWidget widget={widget} />
    case 'progress-bar':
      return <ProgressBarWidget widget={widget} />
    case 'list':
      return <ListWidget widget={widget} />
    case 'table':
      return <TableWidget widget={widget} />
    case 'image':
      return <ImageWidget widget={widget} />
    case 'timeline':
      return <TimelineWidget widget={widget} />
    default:
      return <div className="p-4 bg-muted rounded-lg text-center text-muted-foreground">Widget no soportado</div>
  }
}

// Individual Widget Components
function HeadingWidget({ widget }: { widget: PageWidget }) {
  const fontSizes: Record<string, string> = {
    'sm': 'text-sm',
    'base': 'text-base',
    'lg': 'text-lg',
    'xl': 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
  }

  const textAligns: Record<string, string> = {
    'left': 'text-left',
    'center': 'text-center',
    'right': 'text-right',
  }

  return (
    <h2 className={cn(
      "font-bold py-2",
      fontSizes[widget.config.fontSize || 'xl'],
      textAligns[widget.config.textAlign || 'left']
    )}>
      {widget.config.content || widget.title}
    </h2>
  )
}

function TextBlockWidget({ widget }: { widget: PageWidget }) {
  const textAligns: Record<string, string> = {
    'left': 'text-left',
    'center': 'text-center',
    'right': 'text-right',
  }

  return (
    <div className={cn(
      "py-2",
      textAligns[widget.config.textAlign || 'left']
    )} style={{
      color: widget.config.textColor,
      backgroundColor: widget.config.backgroundColor
    }}>
      <p className="text-muted-foreground whitespace-pre-wrap">
        {widget.config.content || 'Escribe tu texto aquí...'}
      </p>
    </div>
  )
}

function SpacerWidget({ widget }: { widget: PageWidget }) {
  return <div style={{ height: widget.config.height || 40 }} />
}

function DividerWidget() {
  return <Separator className="my-4" />
}

function StatsCardWidget({ widget }: { widget: PageWidget }) {
  const getValue = () => {
    if (widget.config.dataSource === 'compliance' && widget.config.metric) {
      return mockComplianceStats[widget.config.metric as keyof typeof mockComplianceStats] || 0
    }
    if (widget.config.dataSource === 'projects') return mockProjects.length
    if (widget.config.dataSource === 'legalBodies') return mockLegalBodies.length
    return 0
  }

  return (
    <Card style={{ backgroundColor: widget.config.backgroundColor }}>
      <CardContent className="p-4">
        <p className="text-sm text-muted-foreground mb-1" style={{ color: widget.config.textColor }}>
          {widget.title}
        </p>
        <p className="text-3xl font-bold" style={{ color: widget.config.textColor }}>
          {getValue()}
        </p>
      </CardContent>
    </Card>
  )
}

function KPICardWidget({ widget }: { widget: PageWidget }) {
  const getValue = () => {
    if (widget.config.dataSource === 'compliance' && widget.config.metric) {
      return mockComplianceStats[widget.config.metric as keyof typeof mockComplianceStats] || 0
    }
    return 0
  }

  const total = mockComplianceStats.total
  const value = getValue()
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0

  return (
    <Card style={{ backgroundColor: widget.config.backgroundColor }}>
      <CardContent className="p-6 text-center">
        <p className="text-sm text-muted-foreground mb-2" style={{ color: widget.config.textColor }}>
          {widget.title}
        </p>
        <p className="text-5xl font-bold mb-2" style={{ color: widget.config.textColor }}>
          {value}
        </p>
        <p className="text-sm text-muted-foreground" style={{ color: widget.config.textColor }}>
          {percentage}% del total
        </p>
      </CardContent>
    </Card>
  )
}

function DonutChartWidget({ widget }: { widget: PageWidget }) {
  const items = widget.config.items || [
    { label: 'Cumple', value: 98, color: '#22c55e' },
    { label: 'Parcial', value: 32, color: '#f59e0b' },
    { label: 'No Cumple', value: 14, color: '#ef4444' },
  ]
  const total = items.reduce((acc, d) => acc + d.value, 0)

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <PieChart className="w-4 h-4 text-primary" />
          {widget.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center py-4">
          <div className="relative w-32 h-32">
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="35" fill="none" stroke="#e5e7eb" strokeWidth="12" />
              {items.reduce((acc, item, i) => {
                const prevOffset = i === 0 ? 0 : acc.offset
                const percentage = (item.value / total) * 100
                const dashArray = (percentage / 100) * 220
                acc.elements.push(
                  <circle
                    key={item.label}
                    cx="50"
                    cy="50"
                    r="35"
                    fill="none"
                    stroke={item.color || '#6366f1'}
                    strokeWidth="12"
                    strokeDasharray={`${dashArray} 220`}
                    strokeDashoffset={-prevOffset}
                    strokeLinecap="round"
                  />
                )
                acc.offset = prevOffset + dashArray
                return acc
              }, { elements: [] as React.ReactNode[], offset: 0 }).elements}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold">{total}</span>
            </div>
          </div>
        </div>
        {widget.config.showLegend && (
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {items.map(item => (
              <div key={item.label} className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-xs text-muted-foreground">{item.label}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function BarChartWidget({ widget }: { widget: PageWidget }) {
  const items = widget.config.items || [
    { label: 'Categoría 1', value: 45 },
    { label: 'Categoría 2', value: 35 },
    { label: 'Categoría 3', value: 28 },
  ]
  const max = Math.max(...items.map(d => d.value))

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-primary" />
          {widget.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 py-2">
          {items.map((item) => (
            <div key={item.label}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">{item.label}</span>
                <span className="font-medium">{item.value}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${(item.value / max) * 100}%`, backgroundColor: item.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function ProgressBarWidget({ widget }: { widget: PageWidget }) {
  const items = widget.config.items || [
    { label: 'Objetivo 1', value: 75 },
    { label: 'Objetivo 2', value: 60 },
    { label: 'Objetivo 3', value: 90 },
  ]

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" />
          {widget.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 py-2">
          {items.map((item) => (
            <div key={item.label}>
              <div className="flex justify-between text-sm mb-1">
                <span>{item.label}</span>
                <span className="text-muted-foreground">{item.value}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${item.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function ListWidget({ widget }: { widget: PageWidget }) {
  const items = widget.config.dataSource === 'projects' 
    ? mockProjects.map(p => ({ title: p.name, subtitle: p.location || '' }))
    : mockLegalBodies.slice(0, 5).map(l => ({ title: l.name, subtitle: l.ministry }))

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <List className="w-4 h-4 text-primary" />
          {widget.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {items.slice(0, 5).map((item, i) => (
            <div key={i} className="p-2 rounded bg-muted/50 hover:bg-muted transition-colors cursor-pointer">
              <p className="text-sm font-medium truncate">{item.title}</p>
              <p className="text-xs text-muted-foreground truncate">{item.subtitle}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function TableWidget({ widget }: { widget: PageWidget }) {
  const rows = mockLegalBodies.slice(0, 4).map(l => ({
    name: l.shortName,
    category: l.category,
    articles: l.articles.length
  }))

  const categoryLabels: Record<string, { label: string; className: string }> = {
    ambiental: { label: 'Ambiental', className: 'bg-green-100 text-green-700' },
    sst: { label: 'SST', className: 'bg-blue-100 text-blue-700' },
    general: { label: 'General', className: 'bg-gray-100 text-gray-700' },
    laboral: { label: 'Laboral', className: 'bg-purple-100 text-purple-700' },
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Table className="w-4 h-4 text-primary" />
          {widget.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 font-medium">Norma</th>
                <th className="text-left py-2 font-medium">Categoría</th>
                <th className="text-right py-2 font-medium">Arts.</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-b last:border-0">
                  <td className="py-2">{row.name}</td>
                  <td className="py-2">
                    <Badge className={categoryLabels[row.category]?.className || 'bg-gray-100'}>
                      {categoryLabels[row.category]?.label || row.category}
                    </Badge>
                  </td>
                  <td className="py-2 text-right">{row.articles}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

function ImageWidget({ widget }: { widget: PageWidget }) {
  return (
    <Card>
      <CardContent className="p-4">
        {widget.config.imageUrl ? (
          <img 
            src={widget.config.imageUrl} 
            alt={widget.title}
            className="w-full h-auto rounded"
          />
        ) : (
          <div className="flex items-center justify-center h-32 bg-muted rounded">
            <Image className="w-8 h-8 text-muted-foreground" />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function TimelineWidget({ widget }: { widget: PageWidget }) {
  const items = [
    { date: '2026-02-03', title: 'Actualización normativa', description: 'Decreto 148 modificado' },
    { date: '2026-02-01', title: 'Auditoría completada', description: 'Proyecto Planta Norte' },
    { date: '2026-01-28', title: 'Nuevo proyecto', description: 'Minería Norte agregado' },
  ]

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-primary" />
          {widget.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.map((item, i) => (
            <div key={i} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-2 h-2 rounded-full bg-primary" />
                {i < items.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
              </div>
              <div className="pb-4">
                <p className="text-xs text-muted-foreground">{item.date}</p>
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// Properties Panel
function PropertiesPanel() {
  const { widgets, selectedWidgetId, updateWidget, removeWidget } = usePageBuilder()
  const widget = widgets.find(w => w.id === selectedWidgetId)

  if (!widget) return null

  return (
    <div className="w-72 border-l bg-background p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Propiedades</h3>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => removeWidget(widget.id)}
        >
          <Trash2 className="w-4 h-4 text-destructive" />
        </Button>
      </div>

      <div className="space-y-4">
        {/* Title */}
        <div className="space-y-2">
          <Label>Título</Label>
          <Input
            value={widget.title}
            onChange={(e) => updateWidget(widget.id, { title: e.target.value })}
          />
        </div>

        {/* Size */}
        <div className="space-y-2">
          <Label>Tamaño</Label>
          <Select
            value={widget.size}
            onValueChange={(value: PageWidget['size']) => updateWidget(widget.id, { size: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="small">Pequeño (1 columna)</SelectItem>
              <SelectItem value="medium">Mediano (2 columnas)</SelectItem>
              <SelectItem value="large">Grande (3 columnas)</SelectItem>
              <SelectItem value="full">Completo (4 columnas)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Data Source for data widgets */}
        {['stats-card', 'kpi-card', 'list', 'table'].includes(widget.type) && (
          <div className="space-y-2">
            <Label>Fuente de Datos</Label>
            <Select
              value={widget.config.dataSource || ''}
              onValueChange={(value) => updateWidget(widget.id, { 
                config: { ...widget.config, dataSource: value } 
              })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar..." />
              </SelectTrigger>
              <SelectContent>
                {dataSources.map(ds => (
                  <SelectItem key={ds.id} value={ds.id}>{ds.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Metric for stats cards */}
        {['stats-card', 'kpi-card'].includes(widget.type) && widget.config.dataSource === 'compliance' && (
          <div className="space-y-2">
            <Label>Métrica</Label>
            <Select
              value={widget.config.metric || ''}
              onValueChange={(value) => updateWidget(widget.id, { 
                config: { ...widget.config, metric: value } 
              })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="total">Total</SelectItem>
                <SelectItem value="compliant">Cumple</SelectItem>
                <SelectItem value="partiallyCompliant">Cumple Parcial</SelectItem>
                <SelectItem value="nonCompliant">No Cumple</SelectItem>
                <SelectItem value="pending">Pendiente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Content for text widgets */}
        {['heading', 'text-block'].includes(widget.type) && (
          <div className="space-y-2">
            <Label>Contenido</Label>
            {widget.type === 'heading' ? (
              <Input
                value={widget.config.content || ''}
                onChange={(e) => updateWidget(widget.id, { 
                  config: { ...widget.config, content: e.target.value } 
                })}
              />
            ) : (
              <Textarea
                value={widget.config.content || ''}
                onChange={(e) => updateWidget(widget.id, { 
                  config: { ...widget.config, content: e.target.value } 
                })}
                rows={4}
              />
            )}
          </div>
        )}

        {/* Font size for headings */}
        {widget.type === 'heading' && (
          <div className="space-y-2">
            <Label>Tamaño de Fuente</Label>
            <Select
              value={widget.config.fontSize || 'xl'}
              onValueChange={(value) => updateWidget(widget.id, { 
                config: { ...widget.config, fontSize: value } 
              })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sm">Pequeño</SelectItem>
                <SelectItem value="base">Normal</SelectItem>
                <SelectItem value="lg">Grande</SelectItem>
                <SelectItem value="xl">Extra Grande</SelectItem>
                <SelectItem value="2xl">2X Grande</SelectItem>
                <SelectItem value="3xl">3X Grande</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Text align */}
        {['heading', 'text-block'].includes(widget.type) && (
          <div className="space-y-2">
            <Label>Alineación</Label>
            <Select
              value={widget.config.textAlign || 'left'}
              onValueChange={(value: 'left' | 'center' | 'right') => updateWidget(widget.id, { 
                config: { ...widget.config, textAlign: value } 
              })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Izquierda</SelectItem>
                <SelectItem value="center">Centro</SelectItem>
                <SelectItem value="right">Derecha</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Show Legend for charts */}
        {['donut-chart'].includes(widget.type) && (
          <div className="flex items-center justify-between">
            <Label>Mostrar Leyenda</Label>
            <Switch
              checked={widget.config.showLegend || false}
              onCheckedChange={(checked) => updateWidget(widget.id, { 
                config: { ...widget.config, showLegend: checked } 
              })}
            />
          </div>
        )}

        {/* Height for spacer */}
        {widget.type === 'spacer' && (
          <div className="space-y-2">
            <Label>Altura (px)</Label>
            <Input
              type="number"
              value={widget.config.height || 40}
              onChange={(e) => updateWidget(widget.id, { 
                config: { ...widget.config, height: parseInt(e.target.value) || 40 } 
              })}
            />
          </div>
        )}

        {/* Background color */}
        {['stats-card', 'kpi-card'].includes(widget.type) && (
          <div className="space-y-2">
            <Label>Color de Fondo</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={widget.config.backgroundColor || '#ffffff'}
                onChange={(e) => updateWidget(widget.id, { 
                  config: { ...widget.config, backgroundColor: e.target.value } 
                })}
                className="w-12 h-10 p-1"
              />
              <Input
                value={widget.config.backgroundColor || ''}
                onChange={(e) => updateWidget(widget.id, { 
                  config: { ...widget.config, backgroundColor: e.target.value } 
                })}
                placeholder="#ffffff"
                className="flex-1"
              />
            </div>
          </div>
        )}

        {/* Text color */}
        {['stats-card', 'kpi-card'].includes(widget.type) && (
          <div className="space-y-2">
            <Label>Color de Texto</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={widget.config.textColor || '#000000'}
                onChange={(e) => updateWidget(widget.id, { 
                  config: { ...widget.config, textColor: e.target.value } 
                })}
                className="w-12 h-10 p-1"
              />
              <Input
                value={widget.config.textColor || ''}
                onChange={(e) => updateWidget(widget.id, { 
                  config: { ...widget.config, textColor: e.target.value } 
                })}
                placeholder="#000000"
                className="flex-1"
              />
            </div>
          </div>
        )}

        {/* Image URL */}
        {widget.type === 'image' && (
          <div className="space-y-2">
            <Label>URL de Imagen</Label>
            <Input
              value={widget.config.imageUrl || ''}
              onChange={(e) => updateWidget(widget.id, { 
                config: { ...widget.config, imageUrl: e.target.value } 
              })}
              placeholder="https://..."
            />
          </div>
        )}
      </div>
    </div>
  )
}

// Export main component with provider
export function CustomizableDashboard() {
  return (
    <PageBuilderProvider>
      <PageBuilder />
    </PageBuilderProvider>
  )
}
