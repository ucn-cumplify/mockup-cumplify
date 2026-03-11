'use client'

import * as React from 'react'
import { useState } from 'react'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { WidgetRenderer, WidgetPalette } from '@/components/widgets'
import { CustomizationProvider, useCustomization, widgetTemplates } from '@/lib/customization-context'
import { 
  Plus, 
  Edit3, 
  Save, 
  X, 
  LayoutGrid,
  Eye
} from 'lucide-react'
import type { Widget } from '@/lib/types'
import { cn } from '@/lib/utils'

export function AplicabilidadSection() {
  const { 
    customViews, 
    addCustomView,
    updateCustomView,
    addWidget,
    removeWidget,
    isEditMode,
    setIsEditMode,
    selectedWidget,
    setSelectedWidget,
    activeCustomViewId,
    setActiveCustomViewId
  } = useCustomization()

  const [isCreateViewOpen, setIsCreateViewOpen] = useState(false)
  const [newViewName, setNewViewName] = useState('')
  const [showWidgetPalette, setShowWidgetPalette] = useState(false)

  const activeView = customViews.find(v => v.id === activeCustomViewId) || customViews[0]

  const handleCreateView = () => {
    if (newViewName.trim()) {
      addCustomView({
        name: newViewName,
        widgets: [],
        isDefault: false
      })
      setNewViewName('')
      setIsCreateViewOpen(false)
    }
  }

  const handleAddWidget = (type: Widget['type']) => {
    if (!activeView) return
    
    const template = widgetTemplates.find(t => t.type === type)
    if (template) {
      const existingWidgets = activeView.widgets.length
      addWidget(activeView.id, {
        ...template,
        position: { x: existingWidgets % 4, y: Math.floor(existingWidgets / 4) }
      })
    }
    setShowWidgetPalette(false)
  }

  const handleRemoveWidget = (widgetId: string) => {
    if (!activeView) return
    removeWidget(activeView.id, widgetId)
    setSelectedWidget(null)
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <PageHeader 
        title="Aplicabilidad"
        breadcrumbs={[{ label: 'Dashboard' }, { label: 'Aplicabilidad' }]}
        actions={
          <div className="flex items-center gap-2">
            {isEditMode ? (
              <>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowWidgetPalette(!showWidgetPalette)}
                  className="gap-2 bg-transparent"
                >
                  <Plus className="w-4 h-4" />
                  Agregar Widget
                </Button>
                <Button 
                  size="sm"
                  onClick={() => {
                    setIsEditMode(false)
                    setSelectedWidget(null)
                    setShowWidgetPalette(false)
                  }}
                  className="gap-2"
                >
                  <Save className="w-4 h-4" />
                  Guardar
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsEditMode(true)}
                  className="gap-2 bg-transparent"
                >
                  <Edit3 className="w-4 h-4" />
                  Editar Vista
                </Button>
                <Dialog open={isCreateViewOpen} onOpenChange={setIsCreateViewOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-2">
                      <Plus className="w-4 h-4" />
                      Nueva Vista
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Crear Nueva Vista</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label htmlFor="viewName">Nombre de la Vista</Label>
                        <Input 
                          id="viewName"
                          value={newViewName}
                          onChange={(e) => setNewViewName(e.target.value)}
                          placeholder="Ej: Mi Dashboard Personalizado"
                        />
                      </div>
                      <Button onClick={handleCreateView} className="w-full">
                        Crear Vista
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </>
            )}
          </div>
        }
      />

      <main className="flex-1 p-6 overflow-auto">
        {/* View Tabs */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          {customViews.map(view => (
            <Button
              key={view.id}
              variant={activeView?.id === view.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveCustomViewId(view.id)}
              className={cn(
                'gap-2 whitespace-nowrap',
                activeView?.id !== view.id && 'bg-transparent'
              )}
            >
              <LayoutGrid className="w-4 h-4" />
              {view.name}
            </Button>
          ))}
        </div>

        {/* Edit Mode Banner */}
        {isEditMode && (
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Edit3 className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">Modo de Edición Activo</p>
                  <p className="text-sm text-muted-foreground">
                    Arrastra widgets para reordenarlos, haz clic para editar o eliminar
                  </p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setIsEditMode(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Widget Palette */}
        {showWidgetPalette && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium">Seleccionar Widget</h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowWidgetPalette(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <WidgetPalette onAddWidget={handleAddWidget} />
          </div>
        )}

        {/* Widgets Grid */}
        {activeView ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {activeView.widgets.map(widget => (
              <WidgetRenderer
                key={widget.id}
                widget={widget}
                isEditMode={isEditMode}
                onSelect={() => setSelectedWidget(widget)}
                onRemove={() => handleRemoveWidget(widget.id)}
                isSelected={selectedWidget?.id === widget.id}
              />
            ))}

            {activeView.widgets.length === 0 && (
              <Card className="col-span-full">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <LayoutGrid className="w-12 h-12 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Esta vista no tiene widgets configurados
                  </p>
                  <Button onClick={() => {
                    setIsEditMode(true)
                    setShowWidgetPalette(true)
                  }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Primer Widget
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Eye className="w-12 h-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No hay vistas disponibles</p>
            </CardContent>
          </Card>
        )}

        {/* Widget Editor Panel */}
        {isEditMode && selectedWidget && (
          <WidgetEditor 
            widget={selectedWidget}
            onClose={() => setSelectedWidget(null)}
            viewId={activeView?.id || ''}
          />
        )}
      </main>
    </div>
  )
}

// Widget Editor Panel
function WidgetEditor({ 
  widget, 
  onClose,
  viewId 
}: { 
  widget: Widget
  onClose: () => void
  viewId: string
}) {
  const { updateWidget } = useCustomization()
  const [title, setTitle] = useState(widget.title)
  const [size, setSize] = useState(widget.size)

  const handleSave = () => {
    updateWidget(viewId, widget.id, { title, size })
    onClose()
  }

  return (
    <Card className="fixed bottom-6 right-6 w-80 shadow-lg border-primary/20 z-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Editar Widget</CardTitle>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="widget-title">Título</Label>
          <Input 
            id="widget-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="widget-size">Tamaño</Label>
          <Select value={size} onValueChange={(v) => setSize(v as Widget['size'])}>
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

        <div className="flex gap-2 pt-2">
          <Button variant="outline" className="flex-1 bg-transparent" onClick={onClose}>
            Cancelar
          </Button>
          <Button className="flex-1" onClick={handleSave}>
            Guardar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
