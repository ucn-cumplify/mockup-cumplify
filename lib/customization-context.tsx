'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'
import type { Widget, CustomView, SidebarItem, UserPreferences } from './types'

// Default sidebar items
const defaultSidebarItems: SidebarItem[] = [
  { id: 'tablero', label: 'Tablero', icon: 'LayoutDashboard', section: 'tablero', order: 0, isVisible: true },
  { id: 'configuracion', label: 'Configuración', icon: 'Settings', section: 'configuracion', order: 1, isVisible: true, children: [
    { id: 'empresa', label: 'Empresa', icon: 'Building2', section: 'empresa', order: 0, isVisible: true, parentId: 'configuracion' },
    { id: 'unidades-gestion', label: 'Unidades de Gestión', icon: 'Network', section: 'unidades-gestion', order: 1, isVisible: true, parentId: 'configuracion' },
    { id: 'unidades-control', label: 'Unidades de Control', icon: 'Settings', section: 'unidades-control', order: 2, isVisible: true, parentId: 'configuracion' },
  ]},
  { id: 'proyectos', label: 'Proyectos', icon: 'FolderKanban', section: 'proyectos', order: 2, isVisible: true },
  { id: 'plan-trabajo', label: 'Plan de Trabajo', icon: 'ClipboardList', section: 'plan-trabajo', order: 3, isVisible: true },
  { id: 'biblioteca', label: 'Biblioteca', icon: 'BookOpen', section: 'biblioteca', order: 4, isVisible: true },
  { id: 'usuarios', label: 'Usuarios', icon: 'Users', section: 'usuarios', order: 5, isVisible: true },
  { id: 'perfil', label: 'Perfil', icon: 'User', section: 'perfil', order: 6, isVisible: true },
  { id: 'normas', label: 'Normas', icon: 'Scale', section: 'normas', order: 7, isVisible: true },
  { id: 'organigrama', label: 'Organigrama', icon: 'GitBranch', section: 'organigrama', order: 8, isVisible: true },
]

// Default widgets
const defaultWidgets: Widget[] = [
  {
    id: 'w1',
    type: 'donut-chart',
    title: 'Cuerpos Legales',
    size: 'small',
    config: { dataSource: 'legalBodies', metric: 'status', showLegend: true },
    position: { x: 0, y: 0 }
  },
  {
    id: 'w2',
    type: 'donut-chart',
    title: 'Artículos',
    size: 'small',
    config: { dataSource: 'articles', metric: 'status', showLegend: true },
    position: { x: 1, y: 0 }
  },
  {
    id: 'w3',
    type: 'donut-chart',
    title: 'Instancias de Cumplimiento',
    size: 'small',
    config: { dataSource: 'compliance', metric: 'status', showLegend: true },
    position: { x: 2, y: 0 }
  },
  {
    id: 'w4',
    type: 'donut-chart',
    title: 'Permisos',
    size: 'small',
    config: { dataSource: 'permits', metric: 'status', showLegend: true },
    position: { x: 0, y: 1 }
  },
  {
    id: 'w5',
    type: 'stats-card',
    title: 'Reportes',
    size: 'small',
    config: { dataSource: 'reports', metric: 'count' },
    position: { x: 1, y: 1 }
  },
  {
    id: 'w6',
    type: 'donut-chart',
    title: 'Monitoreos',
    size: 'small',
    config: { dataSource: 'monitoring', metric: 'status', showLegend: true },
    position: { x: 2, y: 1 }
  },
  {
    id: 'w7',
    type: 'donut-chart',
    title: 'Otras Obligaciones',
    size: 'small',
    config: { dataSource: 'obligations', metric: 'status', showLegend: true },
    position: { x: 3, y: 1 }
  },
]

// Widget Templates
export const widgetTemplates: Omit<Widget, 'id' | 'position'>[] = [
  {
    type: 'donut-chart',
    title: 'Gráfico Circular',
    size: 'small',
    config: { dataSource: 'compliance', metric: 'status', showLegend: true }
  },
  {
    type: 'bar-chart',
    title: 'Gráfico de Barras',
    size: 'medium',
    config: { dataSource: 'categories', metric: 'count' }
  },
  {
    type: 'stats-card',
    title: 'Tarjeta de Estadísticas',
    size: 'small',
    config: { dataSource: 'total', metric: 'count' }
  },
  {
    type: 'list',
    title: 'Lista de Items',
    size: 'medium',
    config: { dataSource: 'recent', metric: 'items' }
  },
  {
    type: 'progress-bar',
    title: 'Barra de Progreso',
    size: 'medium',
    config: { dataSource: 'progress', metric: 'percentage' }
  },
  {
    type: 'table',
    title: 'Tabla de Datos',
    size: 'large',
    config: { dataSource: 'data', metric: 'rows' }
  },
  {
    type: 'org-tree',
    title: 'Organigrama',
    size: 'full',
    config: { dataSource: 'organization', metric: 'tree' }
  },
]

interface CustomizationContextType {
  // Sidebar
  sidebarItems: SidebarItem[]
  updateSidebarItems: (items: SidebarItem[]) => void
  reorderSidebarItem: (itemId: string, newOrder: number) => void
  toggleSidebarItemVisibility: (itemId: string) => void
  addCustomSidebarItem: (item: Omit<SidebarItem, 'id'>) => void
  removeSidebarItem: (itemId: string) => void
  
  // Custom Views
  customViews: CustomView[]
  addCustomView: (view: Omit<CustomView, 'id' | 'createdAt'>) => void
  updateCustomView: (id: string, view: Partial<CustomView>) => void
  deleteCustomView: (id: string) => void
  
  // Widgets
  activeViewWidgets: Widget[]
  addWidget: (viewId: string, widget: Omit<Widget, 'id'>) => void
  updateWidget: (viewId: string, widgetId: string, widget: Partial<Widget>) => void
  removeWidget: (viewId: string, widgetId: string) => void
  reorderWidgets: (viewId: string, widgets: Widget[]) => void
  
  // Edit Mode
  isEditMode: boolean
  setIsEditMode: (value: boolean) => void
  selectedWidget: Widget | null
  setSelectedWidget: (widget: Widget | null) => void
  
  // Current View
  activeCustomViewId: string | null
  setActiveCustomViewId: (id: string | null) => void
}

const CustomizationContext = createContext<CustomizationContextType | undefined>(undefined)

export function CustomizationProvider({ children }: { children: ReactNode }) {
  const [sidebarItems, setSidebarItems] = useState<SidebarItem[]>(defaultSidebarItems)
  const [customViews, setCustomViews] = useState<CustomView[]>([
    {
      id: 'aplicabilidad',
      name: 'Aplicabilidad',
      widgets: defaultWidgets,
      isDefault: true,
      createdAt: new Date()
    }
  ])
  const [isEditMode, setIsEditMode] = useState(false)
  const [selectedWidget, setSelectedWidget] = useState<Widget | null>(null)
  const [activeCustomViewId, setActiveCustomViewId] = useState<string | null>(null)

  // Get widgets for active view
  const activeViewWidgets = activeCustomViewId 
    ? customViews.find(v => v.id === activeCustomViewId)?.widgets || []
    : []

  // Sidebar functions
  const updateSidebarItems = (items: SidebarItem[]) => {
    setSidebarItems(items)
  }

  const reorderSidebarItem = (itemId: string, newOrder: number) => {
    setSidebarItems(prev => {
      const items = [...prev]
      const itemIndex = items.findIndex(i => i.id === itemId)
      if (itemIndex === -1) return prev
      
      const [item] = items.splice(itemIndex, 1)
      item.order = newOrder
      items.splice(newOrder, 0, item)
      
      return items.map((item, idx) => ({ ...item, order: idx }))
    })
  }

  const toggleSidebarItemVisibility = (itemId: string) => {
    setSidebarItems(prev => 
      prev.map(item => 
        item.id === itemId ? { ...item, isVisible: !item.isVisible } : item
      )
    )
  }

  const addCustomSidebarItem = (item: Omit<SidebarItem, 'id'>) => {
    const newItem: SidebarItem = {
      ...item,
      id: `custom-${Date.now()}`,
      isCustom: true,
    }
    setSidebarItems(prev => [...prev, newItem])
  }

  const removeSidebarItem = (itemId: string) => {
    setSidebarItems(prev => prev.filter(item => item.id !== itemId))
  }

  // Custom views functions
  const addCustomView = (view: Omit<CustomView, 'id' | 'createdAt'>) => {
    const newView: CustomView = {
      ...view,
      id: `view-${Date.now()}`,
      createdAt: new Date()
    }
    setCustomViews(prev => [...prev, newView])
  }

  const updateCustomView = (id: string, view: Partial<CustomView>) => {
    setCustomViews(prev => 
      prev.map(v => v.id === id ? { ...v, ...view } : v)
    )
  }

  const deleteCustomView = (id: string) => {
    setCustomViews(prev => prev.filter(v => v.id !== id))
  }

  // Widget functions
  const addWidget = (viewId: string, widget: Omit<Widget, 'id'>) => {
    const newWidget: Widget = {
      ...widget,
      id: `widget-${Date.now()}`,
    }
    setCustomViews(prev => 
      prev.map(v => 
        v.id === viewId 
          ? { ...v, widgets: [...v.widgets, newWidget] }
          : v
      )
    )
  }

  const updateWidget = (viewId: string, widgetId: string, widget: Partial<Widget>) => {
    setCustomViews(prev => 
      prev.map(v => 
        v.id === viewId 
          ? { ...v, widgets: v.widgets.map(w => w.id === widgetId ? { ...w, ...widget } : w) }
          : v
      )
    )
  }

  const removeWidget = (viewId: string, widgetId: string) => {
    setCustomViews(prev => 
      prev.map(v => 
        v.id === viewId 
          ? { ...v, widgets: v.widgets.filter(w => w.id !== widgetId) }
          : v
      )
    )
  }

  const reorderWidgets = (viewId: string, widgets: Widget[]) => {
    setCustomViews(prev => 
      prev.map(v => v.id === viewId ? { ...v, widgets } : v)
    )
  }

  return (
    <CustomizationContext.Provider value={{
      sidebarItems,
      updateSidebarItems,
      reorderSidebarItem,
      toggleSidebarItemVisibility,
      addCustomSidebarItem,
      removeSidebarItem,
      customViews,
      addCustomView,
      updateCustomView,
      deleteCustomView,
      activeViewWidgets,
      addWidget,
      updateWidget,
      removeWidget,
      reorderWidgets,
      isEditMode,
      setIsEditMode,
      selectedWidget,
      setSelectedWidget,
      activeCustomViewId,
      setActiveCustomViewId,
    }}>
      {children}
    </CustomizationContext.Provider>
  )
}

export function useCustomization() {
  const context = useContext(CustomizationContext)
  if (context === undefined) {
    throw new Error('useCustomization must be used within a CustomizationProvider')
  }
  return context
}
