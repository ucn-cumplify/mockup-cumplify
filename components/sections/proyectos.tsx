'use client'

import React, { useState } from 'react'
import { useApp } from '@/lib/app-context'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Plus,
  Search,
  FolderKanban,
  MapPin,
  Calendar,
  ChevronRight,
  FileText,
  Shield,
  ClipboardCheck,
  BarChart3,
  Users,
  Link2,
  Settings,
  CheckCircle2,
} from 'lucide-react'
import type { Project, LegalBody } from '@/lib/types'
import { categoryLabels } from '@/lib/mock-data'

type WorkflowStep = 'selecciona' | 'vincula' | 'conecta' | 'finaliza'

interface WorkflowStepConfig {
  id: WorkflowStep
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const workflowSteps: WorkflowStepConfig[] = [
  { id: 'selecciona', label: 'Selecciona', icon: Users },
  { id: 'vincula', label: 'Vincula', icon: Link2 },
  { id: 'conecta', label: 'Conecta', icon: Settings },
  { id: 'finaliza', label: 'Finaliza', icon: CheckCircle2 },
]

export function ProyectosSection() {
  const { projects, addProject, currentProject, setCurrentProject } = useApp()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCreateProject = (data: Partial<Project>) => {
    const newProject: Project = {
      id: `proj-${Date.now()}`,
      name: data.name || '',
      description: data.description || '',
      location: data.location || '',
      productiveSector: data.productiveSector || '',
      activityType: data.activityType || '',
      status: 'identification',
      createdAt: new Date(),
      legalBodies: []
    }
    addProject(newProject)
    setIsCreateOpen(false)
  }

  if (currentProject) {
    return <ProjectWorkflow project={currentProject} onBack={() => setCurrentProject(null)} />
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <PageHeader 
        title="Proyectos"
        breadcrumbs={[{ label: 'Inicio' }, { label: 'Proyectos' }]}
      />

      <main className="flex-1 p-6 overflow-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar proyectos..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Nuevo Proyecto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Crear Nuevo Proyecto</DialogTitle>
              </DialogHeader>
              <CreateProjectForm onSubmit={handleCreateProject} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map(project => (
            <ProjectCard 
              key={project.id} 
              project={project} 
              onClick={() => setCurrentProject(project)}
            />
          ))}

          {filteredProjects.length === 0 && (
            <Card className="col-span-full">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FolderKanban className="w-12 h-12 text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">No se encontraron proyectos</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}

function ProjectCard({ project, onClick }: { project: Project; onClick: () => void }) {
  const statusConfig: Record<string, { label: string; className: string }> = {
    identification: { label: 'Identificación', className: 'bg-chart-2/20 text-chart-2' },
    evaluation: { label: 'Evaluación', className: 'bg-chart-1/20 text-chart-1' },
    control: { label: 'Control', className: 'bg-chart-4/20 text-chart-4' },
    completed: { label: 'Completado', className: 'bg-chart-5/20 text-chart-5' },
  }
  const status = statusConfig[project.status] || statusConfig.identification

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <FolderKanban className="w-5 h-5 text-primary" />
          </div>
          <Badge className={status.className}>{status.label}</Badge>
        </div>

        <h3 className="font-semibold mb-1 line-clamp-1">{project.name}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {project.description || 'Sin descripción'}
        </p>

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {project.location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {project.location}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {project.createdAt.toLocaleDateString('es-CL')}
          </span>
        </div>

        <div className="mt-4 pt-4 border-t border-border grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-lg font-semibold">{project.legalBodies.length}</p>
            <p className="text-xs text-muted-foreground">Cuerpos</p>
          </div>
          <div>
            <p className="text-lg font-semibold">0</p>
            <p className="text-xs text-muted-foreground">Artículos</p>
          </div>
          <div>
            <p className="text-lg font-semibold">0</p>
            <p className="text-xs text-muted-foreground">U. Control</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ProjectWorkflow({ project, onBack }: { project: Project; onBack: () => void }) {
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('selecciona')
  const currentStepIndex = workflowSteps.findIndex(s => s.id === currentStep)

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <PageHeader 
        title={project.name}
        breadcrumbs={[{ label: 'Proyecto' }, { label: 'Identificación' }]}
      />

      <main className="flex-1 p-6 overflow-auto">
        {/* Back link */}
        <button 
          onClick={onBack}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ChevronRight className="w-4 h-4 rotate-180" />
          Volver a Proyectos
        </button>

        {/* Workflow Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-0">
            {workflowSteps.map((step, index) => {
              const Icon = step.icon
              const isActive = index === currentStepIndex
              const isCompleted = index < currentStepIndex

              return (
                <div key={step.id} className="flex items-center">
                  <button
                    onClick={() => setCurrentStep(step.id)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-primary text-primary-foreground' 
                        : isCompleted 
                          ? 'bg-chart-1/20 text-chart-1' 
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{step.label}</span>
                  </button>
                  {index < workflowSteps.length - 1 && (
                    <div className={`w-12 h-0.5 ${index < currentStepIndex ? 'bg-chart-1' : 'bg-border'}`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Step Content */}
        {currentStep === 'selecciona' && (
          <SelectStep onNext={() => setCurrentStep('vincula')} />
        )}
        {currentStep === 'vincula' && (
          <VinculaStep onNext={() => setCurrentStep('conecta')} onBack={() => setCurrentStep('selecciona')} />
        )}
        {currentStep === 'conecta' && (
          <ConectaStep onNext={() => setCurrentStep('finaliza')} onBack={() => setCurrentStep('vincula')} />
        )}
        {currentStep === 'finaliza' && (
          <FinalizaStep onBack={() => setCurrentStep('conecta')} />
        )}
      </main>
    </div>
  )
}

function SelectStep({ onNext }: { onNext: () => void }) {
  const { legalBodies } = useApp()
  const [selectedBodies, setSelectedBodies] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string>('todos')

  const categories = ['todos', ...Object.keys(categoryLabels)]
  
  const filteredBodies = legalBodies.filter(body => {
    const matchesCategory = activeCategory === 'todos' || body.category === activeCategory
    const matchesSearch = searchQuery === '' || 
      body.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      body.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const toggleBody = (id: string) => {
    setSelectedBodies(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <Button
              key={cat}
              variant={activeCategory === cat ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveCategory(cat)}
            >
              {cat === 'todos' ? 'Todos' : categoryLabels[cat]}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar el Cuerpo Legal"
              className="pl-9 w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button size="sm">Buscar</Button>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredBodies.map(body => (
          <LegalBodyCard 
            key={body.id}
            body={body}
            isSelected={selectedBodies.includes(body.id)}
            onToggle={() => toggleBody(body.id)}
          />
        ))}
      </div>

      {/* Action */}
      <div className="flex justify-end pt-4">
        <Button onClick={onNext} disabled={selectedBodies.length === 0}>
          Continuar ({selectedBodies.length} seleccionados)
        </Button>
      </div>
    </div>
  )
}

function LegalBodyCard({ 
  body, 
  isSelected, 
  onToggle 
}: { 
  body: LegalBody
  isSelected: boolean
  onToggle: () => void 
}) {
  const permCount = body.articles.filter(a => a.attributeType === 'permiso').length
  const reportCount = body.articles.filter(a => a.attributeType === 'reporte').length
  const monitorCount = body.articles.filter(a => a.attributeType === 'monitoreo').length

  return (
    <Card 
      className={`cursor-pointer transition-all ${isSelected ? 'ring-2 ring-primary' : 'hover:shadow-md'}`}
      onClick={onToggle}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
            <FileText className="w-5 h-5 text-muted-foreground" />
          </div>
          <Checkbox checked={isSelected} className="mt-1" />
        </div>

        <h4 className="font-semibold text-primary mb-1">{body.name}</h4>
        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
          {body.description}
        </p>
        <p className="text-xs text-muted-foreground mb-1">{body.ministry}</p>
        <p className="text-xs text-muted-foreground mb-4">
          FECHA PUBLICACIÓN: {formatDateShort(body.publicationDate)}
        </p>

        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border text-center">
          <div>
            <Shield className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
            <p className="text-xs text-muted-foreground">Permiso</p>
            <p className="font-semibold">{permCount}</p>
          </div>
          <div>
            <ClipboardCheck className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
            <p className="text-xs text-muted-foreground">Reporte</p>
            <p className="font-semibold">{reportCount}</p>
          </div>
          <div>
            <BarChart3 className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
            <p className="text-xs text-muted-foreground">Monitoreo</p>
            <p className="font-semibold">{monitorCount}</p>
          </div>
        </div>

        <Button variant="outline" size="sm" className="w-full mt-4 bg-transparent" onClick={(e) => { e.stopPropagation() }}>
          Ver detalle
        </Button>
      </CardContent>
    </Card>
  )
}

function VinculaStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { legalBodies, controlUnits } = useApp()
  const [viewMode, setViewMode] = useState<'cuerpos' | 'unidades'>('cuerpos')

  return (
    <div className="space-y-6">
      {/* Toggle View */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button 
            variant={viewMode === 'cuerpos' ? 'default' : 'outline'}
            onClick={() => setViewMode('cuerpos')}
          >
            Cuerpos Legales
          </Button>
          <Button 
            variant={viewMode === 'unidades' ? 'default' : 'outline'}
            onClick={() => setViewMode('unidades')}
          >
            Unidades de Control
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar el Cuerpo Legal" className="pl-9 w-64" />
        </div>
      </div>

      <h3 className="text-sm font-semibold uppercase text-muted-foreground">
        Cuerpos Legales Seleccionados
      </h3>

      {/* List */}
      <div className="space-y-3">
        {legalBodies.slice(0, 6).map(body => (
          <Card key={body.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex-1">
                <h4 className="font-semibold text-foreground">{body.shortName}</h4>
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {body.description}
                </p>
              </div>
              <div className="text-right mx-4">
                <p className="text-lg font-semibold">2</p>
                <p className="text-xs text-muted-foreground">Unidades de Control Vinculadas</p>
              </div>
              <Button variant="link" className="text-primary">
                Modificar Vinculación
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>Anterior</Button>
        <Button onClick={onNext}>Continuar</Button>
      </div>
    </div>
  )
}

function ConectaStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { legalBodies, controlUnits } = useApp()

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Conecta los artículos de los cuerpos legales con las unidades de control específicas.
      </p>

      {/* Articles list */}
      <div className="space-y-3">
        {legalBodies.slice(0, 3).flatMap(body => 
          body.articles.map(article => (
            <Card key={article.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary">{body.shortName}</Badge>
                      <span className="font-semibold">Art. {article.number}</span>
                      <Badge 
                        variant="outline"
                        className={
                          article.criticality === 'alta' ? 'border-destructive text-destructive' :
                          article.criticality === 'media' ? 'border-chart-2 text-chart-2' :
                          'border-muted-foreground text-muted-foreground'
                        }
                      >
                        {article.criticality}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {article.content}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Badge variant="outline">{article.attributeType}</Badge>
                    <Button size="sm" variant="outline">Conectar UC</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>Anterior</Button>
        <Button onClick={onNext}>Finalizar</Button>
      </div>
    </div>
  )
}

function FinalizaStep({ onBack }: { onBack: () => void }) {
  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-primary">6</p>
            <p className="text-sm text-muted-foreground">Cuerpos Legales</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-primary">24</p>
            <p className="text-sm text-muted-foreground">Artículos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-primary">5</p>
            <p className="text-sm text-muted-foreground">Unidades de Control</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-primary">12</p>
            <p className="text-sm text-muted-foreground">Obligaciones</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts placeholder */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Por Tipo de Atributo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Permisos</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-chart-1 w-[60%]" />
                  </div>
                  <span className="text-sm font-medium">6</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Reportes</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-chart-2 w-[40%]" />
                  </div>
                  <span className="text-sm font-medium">4</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Monitoreos</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-chart-4 w-[20%]" />
                  </div>
                  <span className="text-sm font-medium">2</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Por Categoría</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Normativa Ambiental</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-chart-1 w-[50%]" />
                  </div>
                  <span className="text-sm font-medium">12</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Normativa SST</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-chart-2 w-[35%]" />
                  </div>
                  <span className="text-sm font-medium">8</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Normativa General</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-chart-4 w-[15%]" />
                  </div>
                  <span className="text-sm font-medium">4</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>Anterior</Button>
        <Button className="gap-2">
          <CheckCircle2 className="w-4 h-4" />
          Completar Identificación
        </Button>
      </div>
    </div>
  )
}

function CreateProjectForm({ onSubmit }: { onSubmit: (data: Partial<Project>) => void }) {
  const [formData, setFormData] = useState<Partial<Project>>({
    name: '',
    description: '',
    location: '',
    productiveSector: '',
    activityType: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nombre del Proyecto</Label>
        <Input 
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Ej: Proyecto Planta Norte"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descripción</Label>
        <Textarea 
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Descripción del proyecto..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="location">Ubicación</Label>
          <Input 
            id="location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="Ej: Región Metropolitana"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sector">Sector Productivo</Label>
          <Input 
            id="sector"
            value={formData.productiveSector}
            onChange={(e) => setFormData({ ...formData, productiveSector: e.target.value })}
            placeholder="Ej: Manufactura"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="activity">Tipo de Actividad</Label>
        <Input 
          id="activity"
          value={formData.activityType}
          onChange={(e) => setFormData({ ...formData, activityType: e.target.value })}
          placeholder="Ej: Producción Industrial"
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit">Crear Proyecto</Button>
      </div>
    </form>
  )
}

function formatDateShort(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-CL', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric' 
  }).toUpperCase()
}
