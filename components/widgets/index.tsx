'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  GripVertical, 
  Settings, 
  Trash2, 
  Maximize2,
  PieChart,
  BarChart3,
  Hash,
  List,
  Activity,
  Table,
  GitBranch
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Widget } from '@/lib/types'

interface WidgetRendererProps {
  widget: Widget
  isEditMode: boolean
  onSelect: () => void
  onRemove: () => void
  isSelected: boolean
}

export function WidgetRenderer({ 
  widget, 
  isEditMode, 
  onSelect, 
  onRemove,
  isSelected 
}: WidgetRendererProps) {
  const sizeClasses = {
    small: 'col-span-1',
    medium: 'col-span-2',
    large: 'col-span-3',
    full: 'col-span-4'
  }

  return (
    <Card 
      className={cn(
        sizeClasses[widget.size],
        'relative transition-all',
        isEditMode && 'cursor-move hover:ring-2 hover:ring-primary/50',
        isSelected && 'ring-2 ring-primary'
      )}
      onClick={isEditMode ? onSelect : undefined}
    >
      {isEditMode && (
        <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
          <Button variant="ghost" size="icon" className="h-7 w-7 bg-background/80">
            <GripVertical className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 bg-background/80">
            <Settings className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 bg-background/80 text-destructive hover:text-destructive"
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )}

      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <WidgetIcon type={widget.type} />
          {widget.title}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <WidgetContent widget={widget} />
      </CardContent>
    </Card>
  )
}

function WidgetIcon({ type }: { type: Widget['type'] }) {
  const icons = {
    'donut-chart': PieChart,
    'bar-chart': BarChart3,
    'stats-card': Hash,
    'list': List,
    'progress-bar': Activity,
    'table': Table,
    'org-tree': GitBranch
  }
  const Icon = icons[type]
  return <Icon className="w-4 h-4 text-primary" />
}

function WidgetContent({ widget }: { widget: Widget }) {
  switch (widget.type) {
    case 'donut-chart':
      return <DonutChartWidget config={widget.config} />
    case 'bar-chart':
      return <BarChartWidget config={widget.config} />
    case 'stats-card':
      return <StatsCardWidget title={widget.title} config={widget.config} />
    case 'list':
      return <ListWidget config={widget.config} />
    case 'progress-bar':
      return <ProgressBarWidget config={widget.config} />
    case 'table':
      return <TableWidget config={widget.config} />
    case 'org-tree':
      return <OrgTreeWidget config={widget.config} />
    default:
      return <div className="text-muted-foreground text-sm">Widget no soportado</div>
  }
}

// Donut Chart Widget
function DonutChartWidget({ config }: { config: Widget['config'] }) {
  const data = [
    { label: 'Gestionar', value: 7, color: '#22c55e' },
    { label: 'Por definir', value: 3, color: '#f59e0b' },
  ]
  const total = data.reduce((acc, d) => acc + d.value, 0)

  return (
    <div className="flex items-center justify-center py-4">
      <div className="relative w-32 h-32">
        <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="35"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="12"
          />
          {data.reduce((acc, item, i) => {
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
                stroke={item.color}
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
          <span className="text-xl font-bold">{total}</span>
        </div>
      </div>
    </div>
  )
}

// Bar Chart Widget
function BarChartWidget({ config }: { config: Widget['config'] }) {
  const data = [
    { label: 'Ambiental', value: 45 },
    { label: 'SST', value: 32 },
    { label: 'General', value: 28 },
    { label: 'Laboral', value: 15 },
  ]
  const max = Math.max(...data.map(d => d.value))

  return (
    <div className="space-y-3 py-2">
      {data.map((item, i) => (
        <div key={item.label}>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground">{item.label}</span>
            <span className="font-medium">{item.value}</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${(item.value / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

// Stats Card Widget
function StatsCardWidget({ title, config }: { title: string; config: Widget['config'] }) {
  return (
    <div className="flex flex-col items-center justify-center py-6">
      <p className="text-muted-foreground text-sm mb-2">No existe información</p>
    </div>
  )
}

// List Widget
function ListWidget({ config }: { config: Widget['config'] }) {
  const items = [
    { id: 1, title: 'Decreto 148', subtitle: 'Residuos Peligrosos' },
    { id: 2, title: 'Decreto 594', subtitle: 'Condiciones Sanitarias' },
    { id: 3, title: 'Decreto 43', subtitle: 'Sustancias Peligrosas' },
  ]

  return (
    <div className="space-y-2 py-2">
      {items.map(item => (
        <div key={item.id} className="p-2 rounded bg-muted/50 hover:bg-muted transition-colors cursor-pointer">
          <p className="text-sm font-medium">{item.title}</p>
          <p className="text-xs text-muted-foreground">{item.subtitle}</p>
        </div>
      ))}
    </div>
  )
}

// Progress Bar Widget
function ProgressBarWidget({ config }: { config: Widget['config'] }) {
  const categories = [
    { label: 'Permisos', current: 8, total: 10 },
    { label: 'Reportes', current: 15, total: 20 },
    { label: 'Monitoreos', current: 5, total: 8 },
  ]

  return (
    <div className="space-y-4 py-2">
      {categories.map(cat => (
        <div key={cat.label}>
          <div className="flex justify-between text-sm mb-1">
            <span>{cat.label}</span>
            <span className="text-muted-foreground">{cat.current}/{cat.total}</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full"
              style={{ width: `${(cat.current / cat.total) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

// Table Widget
function TableWidget({ config }: { config: Widget['config'] }) {
  const rows = [
    { norm: 'Decreto 148', status: 'Cumple', articles: 12 },
    { norm: 'Decreto 594', status: 'Parcial', articles: 8 },
    { norm: 'Decreto 43', status: 'Pendiente', articles: 15 },
  ]

  const statusColors: Record<string, string> = {
    'Cumple': 'bg-green-100 text-green-700',
    'Parcial': 'bg-amber-100 text-amber-700',
    'Pendiente': 'bg-gray-100 text-gray-700',
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2 font-medium">Norma</th>
            <th className="text-left py-2 font-medium">Estado</th>
            <th className="text-right py-2 font-medium">Arts.</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b last:border-0">
              <td className="py-2">{row.norm}</td>
              <td className="py-2">
                <Badge className={statusColors[row.status]}>{row.status}</Badge>
              </td>
              <td className="py-2 text-right">{row.articles}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Org Tree Widget (simplified)
function OrgTreeWidget({ config }: { config: Widget['config'] }) {
  return (
    <div className="flex flex-col items-center py-4">
      <div className="px-4 py-2 rounded-lg bg-sidebar text-sidebar-foreground text-sm font-medium">
        Empresa
      </div>
      <div className="w-px h-6 bg-border" />
      <div className="flex gap-8">
        {['Operaciones', 'Administrativa', 'Agrupación'].map((name, i) => (
          <div key={name} className="flex flex-col items-center">
            <div className={cn(
              'px-3 py-1.5 rounded text-xs font-medium',
              i === 0 ? 'bg-amber-500 text-white' : 
              i === 1 ? 'bg-primary text-white' : 
              'bg-gray-700 text-white'
            )}>
              {name}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Widget Palette for adding new widgets
interface WidgetPaletteProps {
  onAddWidget: (type: Widget['type']) => void
}

export function WidgetPalette({ onAddWidget }: WidgetPaletteProps) {
  const widgetTypes: { type: Widget['type']; label: string; icon: typeof PieChart }[] = [
    { type: 'donut-chart', label: 'Gráfico Circular', icon: PieChart },
    { type: 'bar-chart', label: 'Gráfico de Barras', icon: BarChart3 },
    { type: 'stats-card', label: 'Tarjeta Stats', icon: Hash },
    { type: 'list', label: 'Lista', icon: List },
    { type: 'progress-bar', label: 'Progreso', icon: Activity },
    { type: 'table', label: 'Tabla', icon: Table },
    { type: 'org-tree', label: 'Organigrama', icon: GitBranch },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-4 bg-muted/50 rounded-lg">
      {widgetTypes.map(({ type, label, icon: Icon }) => (
        <Button
          key={type}
          variant="outline"
          className="h-auto flex-col gap-2 py-3 bg-background"
          onClick={() => onAddWidget(type)}
        >
          <Icon className="w-5 h-5 text-primary" />
          <span className="text-xs">{label}</span>
        </Button>
      ))}
    </div>
  )
}
