'use client'

import React, { useState } from 'react'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Plus,
  Search,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  Circle,
  User,
  Filter,
} from 'lucide-react'
import type { Task } from '@/lib/types'

const mockTasks: Task[] = [
  {
    id: '1',
    name: 'Actualizar plan de manejo de residuos',
    description: 'Revisar y actualizar el plan de manejo de residuos peligrosos según Decreto 148',
    assignedUserId: '1',
    dueDate: new Date('2026-02-15'),
    priority: 'alta',
    status: 'pendiente',
    createdAt: new Date('2026-01-20'),
  },
  {
    id: '2',
    name: 'Realizar monitoreo ambiental mensual',
    description: 'Ejecutar monitoreo de calidad de aire según plan establecido',
    assignedUserId: '2',
    dueDate: new Date('2026-02-10'),
    priority: 'media',
    status: 'en_progreso',
    createdAt: new Date('2026-01-25'),
  },
  {
    id: '3',
    name: 'Capacitación en seguridad',
    description: 'Organizar capacitación de seguridad para personal de planta',
    assignedUserId: '3',
    dueDate: new Date('2026-02-28'),
    priority: 'baja',
    status: 'pendiente',
    createdAt: new Date('2026-01-28'),
  },
  {
    id: '4',
    name: 'Renovar permiso sanitario',
    description: 'Gestionar renovación de permiso sanitario de bodega de químicos',
    assignedUserId: '1',
    dueDate: new Date('2026-01-30'),
    priority: 'alta',
    status: 'completada',
    createdAt: new Date('2026-01-10'),
  },
]

export function PlanTrabajoSection() {
  const [tasks, setTasks] = useState<Task[]>(mockTasks)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const pendingCount = tasks.filter(t => t.status === 'pendiente').length
  const inProgressCount = tasks.filter(t => t.status === 'en_progreso').length
  const completedCount = tasks.filter(t => t.status === 'completada').length

  const handleCreateTask = (data: Partial<Task>) => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      name: data.name || '',
      description: data.description || '',
      assignedUserId: data.assignedUserId || '1',
      dueDate: data.dueDate || new Date(),
      priority: data.priority || 'media',
      status: 'pendiente',
      createdAt: new Date(),
    }
    setTasks([...tasks, newTask])
    setIsCreateOpen(false)
  }

  const toggleTaskStatus = (taskId: string) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        const newStatus = task.status === 'completada' ? 'pendiente' : 'completada'
        return { ...task, status: newStatus }
      }
      return task
    }))
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <PageHeader 
        title="Plan de Trabajo"
        breadcrumbs={[{ label: 'Gestión' }, { label: 'Plan de Trabajo' }]}
      />

      <main className="flex-1 p-6 overflow-auto">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-chart-2/20 flex items-center justify-center">
                  <Circle className="w-5 h-5 text-chart-2" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{pendingCount}</p>
                  <p className="text-sm text-muted-foreground">Pendientes</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-chart-1/20 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-chart-1" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{inProgressCount}</p>
                  <p className="text-sm text-muted-foreground">En Progreso</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-chart-5/20 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-chart-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{completedCount}</p>
                  <p className="text-sm text-muted-foreground">Completadas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar tareas..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filtrar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="pendiente">Pendientes</SelectItem>
                <SelectItem value="en_progreso">En Progreso</SelectItem>
                <SelectItem value="completada">Completadas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Nueva Tarea
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Crear Nueva Tarea</DialogTitle>
              </DialogHeader>
              <TaskForm onSubmit={handleCreateTask} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Tasks List */}
        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {filteredTasks.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  No se encontraron tareas
                </div>
              ) : (
                filteredTasks.map(task => (
                  <TaskItem 
                    key={task.id} 
                    task={task} 
                    onToggle={() => toggleTaskStatus(task.id)}
                  />
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

function TaskItem({ task, onToggle }: { task: Task; onToggle: () => void }) {
  const priorityConfig: Record<string, { label: string; className: string }> = {
    alta: { label: 'Alta', className: 'bg-chart-3/20 text-chart-3' },
    media: { label: 'Media', className: 'bg-chart-2/20 text-chart-2' },
    baja: { label: 'Baja', className: 'bg-muted text-muted-foreground' },
  }

  const statusConfig: Record<string, { icon: React.ComponentType<{ className?: string }>; className: string }> = {
    pendiente: { icon: Circle, className: 'text-muted-foreground' },
    en_progreso: { icon: Clock, className: 'text-chart-1' },
    completada: { icon: CheckCircle2, className: 'text-chart-5' },
  }

  const priority = priorityConfig[task.priority]
  const status = statusConfig[task.status]
  const StatusIcon = status.icon
  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'completada'

  return (
    <div className="flex items-start gap-4 p-4 hover:bg-muted/30 transition-colors">
      <Checkbox 
        checked={task.status === 'completada'}
        onCheckedChange={onToggle}
        className="mt-1"
      />
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className={`font-medium ${task.status === 'completada' ? 'line-through text-muted-foreground' : ''}`}>
              {task.name}
            </h4>
            {task.description && (
              <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                {task.description}
              </p>
            )}
          </div>
          <Badge className={priority.className}>{priority.label}</Badge>
        </div>

        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
          <span className={`flex items-center gap-1 ${isOverdue ? 'text-destructive' : ''}`}>
            {isOverdue && <AlertCircle className="w-3 h-3" />}
            <Calendar className="w-3 h-3" />
            {task.dueDate.toLocaleDateString('es-CL')}
          </span>
          <span className="flex items-center gap-1">
            <User className="w-3 h-3" />
            Asignado
          </span>
          <span className={`flex items-center gap-1 ${status.className}`}>
            <StatusIcon className="w-3 h-3" />
            {task.status === 'pendiente' ? 'Pendiente' : task.status === 'en_progreso' ? 'En Progreso' : 'Completada'}
          </span>
        </div>
      </div>
    </div>
  )
}

function TaskForm({ onSubmit }: { onSubmit: (data: Partial<Task>) => void }) {
  const [formData, setFormData] = useState<Partial<Task>>({
    name: '',
    description: '',
    priority: 'media',
    dueDate: new Date(),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nombre de la Tarea</Label>
        <Input 
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Ej: Actualizar documentación"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descripción</Label>
        <Textarea 
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe la tarea..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="priority">Prioridad</Label>
          <Select 
            value={formData.priority} 
            onValueChange={(v) => setFormData({ ...formData, priority: v as Task['priority'] })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="alta">Alta</SelectItem>
              <SelectItem value="media">Media</SelectItem>
              <SelectItem value="baja">Baja</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="dueDate">Fecha Vencimiento</Label>
          <Input 
            id="dueDate"
            type="date"
            value={formData.dueDate?.toISOString().split('T')[0]}
            onChange={(e) => setFormData({ ...formData, dueDate: new Date(e.target.value) })}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit">Crear Tarea</Button>
      </div>
    </form>
  )
}
