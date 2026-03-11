'use client'

import React, { useState, useMemo } from 'react'
import { usePlatform, categoryConfig, type AppCategory, type AppModule, type AppView, type ViewType } from '@/lib/platform-context'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { toast } from 'sonner'
import {
  ArrowLeft, ArrowRight, Check, Plus, X, Loader2,
  Recycle, ShieldAlert, Activity, Leaf, Award,
  FileText, Users, FlaskConical, Scale, Settings,
  Table2, Kanban, Calendar, LayoutDashboard, FileInput, Clock,
  Palette, Search, ChevronUp, ChevronDown, ChevronRight, Star,
  BookOpen, ClipboardList, BarChart3, TreePine, Factory, Gauge,
  FileCheck, Layers,
} from 'lucide-react'

/* ================================================================== */
/*  ICON / CONFIG                                                     */
/* ================================================================== */

const iconMap: Record<string, React.ElementType> = {
  Recycle, ShieldAlert, Activity, Leaf, Award,
  FileText, Users, FlaskConical, Scale, Settings,
  BookOpen, ClipboardList, BarChart3, TreePine, Factory, Gauge,
  FileCheck, Layers,
}

function getIcon(name: string) {
  return iconMap[name] || Settings
}

const viewTypeConfig: Record<ViewType, { label: string; icon: React.ElementType; description: string }> = {
  table: { label: 'Tabla', icon: Table2, description: 'Vista de datos en filas y columnas' },
  kanban: { label: 'Kanban', icon: Kanban, description: 'Tablero de tarjetas por estado' },
  calendar: { label: 'Calendario', icon: Calendar, description: 'Visualiza eventos y fechas' },
  dashboard: { label: 'Dashboard', icon: LayoutDashboard, description: 'Graficos y metricas' },
  form: { label: 'Formulario', icon: FileInput, description: 'Ingreso de datos' },
  timeline: { label: 'Linea de Tiempo', icon: Clock, description: 'Cronologia de eventos' },
}

/* ================================================================== */
/*  WIZARD TEMPLATES (12 predefined)                                  */
/* ================================================================== */

interface WizardTemplate {
  id: string
  name: string
  description: string
  icon: string
  color: string
  category: AppCategory
  configFields: { label: string; placeholder: string; type: 'text' | 'select'; options?: string[] }[]
  views: { id: string; name: string; type: ViewType }[]
}

const wizardTemplates: WizardTemplate[] = [
  {
    id: 'tpl-requisitos',
    name: 'Requisitos legales',
    description: 'Gestion y seguimiento de requisitos legales aplicables a la operacion.',
    icon: 'Scale',
    color: '#0D9488',
    category: 'cumplimiento',
    configFields: [
      { label: 'Jurisdiccion / Pais', placeholder: 'Ej: Chile', type: 'text' },
      { label: 'Rubro principal', placeholder: 'Ej: Mineria', type: 'text' },
      { label: 'Unidades de control asociadas', placeholder: 'Ej: Planta Norte, Planta Sur', type: 'text' },
    ],
    views: [
      { id: 'v-req-1', name: 'Registro de Requisitos', type: 'table' },
      { id: 'v-req-2', name: 'Por Estado', type: 'kanban' },
      { id: 'v-req-3', name: 'Dashboard de Cumplimiento', type: 'dashboard' },
    ],
  },
  {
    id: 'tpl-compromisos-amb',
    name: 'Compromisos ambientales',
    description: 'Seguimiento de compromisos ambientales derivados de RCA u otros instrumentos.',
    icon: 'TreePine',
    color: '#059669',
    category: 'monitoreo',
    configFields: [
      { label: 'Instrumento de origen', placeholder: 'Ej: RCA 123/2020', type: 'text' },
      { label: 'Componentes ambientales', placeholder: 'Ej: Aire, Agua, Suelo', type: 'text' },
    ],
    views: [
      { id: 'v-camb-1', name: 'Compromisos', type: 'table' },
      { id: 'v-camb-2', name: 'Calendario de Verificacion', type: 'calendar' },
      { id: 'v-camb-3', name: 'Dashboard', type: 'dashboard' },
    ],
  },
  {
    id: 'tpl-compromisos-soc',
    name: 'Compromisos sociales',
    description: 'Gestion de compromisos con comunidades, stakeholders y autoridades.',
    icon: 'Users',
    color: '#E11D48',
    category: 'esg',
    configFields: [
      { label: 'Comunidades asociadas', placeholder: 'Ej: Comunidad X, Junta de Vecinos Y', type: 'text' },
      { label: 'Periodo de vigencia', placeholder: 'Ej: 2025-2030', type: 'text' },
    ],
    views: [
      { id: 'v-csoc-1', name: 'Registro de Compromisos', type: 'table' },
      { id: 'v-csoc-2', name: 'Linea de Tiempo', type: 'timeline' },
      { id: 'v-csoc-3', name: 'Dashboard', type: 'dashboard' },
    ],
  },
  {
    id: 'tpl-residuos',
    name: 'Residuos',
    description: 'Gestion integral de residuos industriales y peligrosos con trazabilidad completa.',
    icon: 'Recycle',
    color: '#059669',
    category: 'residuos',
    configFields: [
      { label: 'Tipo de residuos principales', placeholder: 'Ej: Peligrosos, No Peligrosos, Inertes', type: 'text' },
      { label: 'Destino de residuos', placeholder: 'Ej: Vertedero autorizado, Reciclaje', type: 'text' },
    ],
    views: [
      { id: 'v-res-1', name: 'Tabla de Residuos', type: 'table' },
      { id: 'v-res-2', name: 'Calendario de Retiros', type: 'calendar' },
      { id: 'v-res-3', name: 'Dashboard de Indicadores', type: 'dashboard' },
      { id: 'v-res-4', name: 'Reporte Mensual', type: 'form' },
    ],
  },
  {
    id: 'tpl-sustancias',
    name: 'Sustancias peligrosas',
    description: 'Control y trazabilidad de sustancias quimicas peligrosas.',
    icon: 'FlaskConical',
    color: '#EA580C',
    category: 'sustancias',
    configFields: [
      { label: 'Familias de sustancias', placeholder: 'Ej: Acidos, Solventes, Gases', type: 'text' },
      { label: 'Areas de almacenamiento', placeholder: 'Ej: Bodega A, Bodega B', type: 'text' },
    ],
    views: [
      { id: 'v-sust-1', name: 'Inventario', type: 'table' },
      { id: 'v-sust-2', name: 'Vencimientos', type: 'calendar' },
      { id: 'v-sust-3', name: 'Dashboard', type: 'dashboard' },
    ],
  },
  {
    id: 'tpl-monitoreos',
    name: 'Monitoreos ambientales',
    description: 'Programacion y seguimiento de monitoreos ambientales periodicos.',
    icon: 'Activity',
    color: '#2563EB',
    category: 'monitoreo',
    configFields: [
      { label: 'Tipos de monitoreo', placeholder: 'Ej: Aire, Agua, Ruido, Suelo', type: 'text' },
      { label: 'Frecuencia base', placeholder: 'Ej: Mensual, Trimestral', type: 'text' },
      { label: 'Norma de referencia', placeholder: 'Ej: DS 90, DS 59', type: 'text' },
    ],
    views: [
      { id: 'v-mon-1', name: 'Registro de Monitoreos', type: 'table' },
      { id: 'v-mon-2', name: 'Calendario Anual', type: 'calendar' },
      { id: 'v-mon-3', name: 'Tendencias', type: 'dashboard' },
    ],
  },
  {
    id: 'tpl-riesgos',
    name: 'Matrices de riesgos',
    description: 'Identificacion, evaluacion y control de riesgos ambientales y operacionales.',
    icon: 'ShieldAlert',
    color: '#DC2626',
    category: 'riesgos',
    configFields: [
      { label: 'Tipo de matriz', placeholder: 'Ej: Ambiental, Operacional, Legal', type: 'text' },
      { label: 'Metodologia de evaluacion', placeholder: 'Ej: Probabilidad x Severidad', type: 'text' },
    ],
    views: [
      { id: 'v-risk-1', name: 'Matriz (Heatmap)', type: 'dashboard' },
      { id: 'v-risk-2', name: 'Tabla de Riesgos', type: 'table' },
      { id: 'v-risk-3', name: 'Dashboard de Riesgos', type: 'dashboard' },
      { id: 'v-risk-4', name: 'Por Estado', type: 'kanban' },
    ],
  },
  {
    id: 'tpl-estandares',
    name: 'Estandares',
    description: 'Gestion de certificaciones ISO 14001, ISO 45001, GRI y otras normas.',
    icon: 'Award',
    color: '#0891B2',
    category: 'certificaciones',
    configFields: [
      { label: 'Normas aplicables', placeholder: 'Ej: ISO 14001, ISO 45001, GRI', type: 'text' },
      { label: 'Fecha proxima auditoria', placeholder: 'Ej: Junio 2026', type: 'text' },
    ],
    views: [
      { id: 'v-std-1', name: 'Checklist de Requisitos', type: 'table' },
      { id: 'v-std-2', name: 'Por Estado', type: 'kanban' },
      { id: 'v-std-3', name: 'Calendario de Auditorias', type: 'calendar' },
    ],
  },
  {
    id: 'tpl-esg',
    name: 'ESG',
    description: 'Seguimiento de indicadores ambientales, sociales y de gobernanza.',
    icon: 'Leaf',
    color: '#7C3AED',
    category: 'esg',
    configFields: [
      { label: 'Periodo de reporte', placeholder: 'Ej: Anual 2026', type: 'text' },
      { label: 'Framework de reporte', placeholder: 'Ej: GRI, SASB, TCFD', type: 'text' },
      { label: 'Indicadores base', placeholder: 'Ej: Emisiones CO2, Consumo agua, Diversidad', type: 'text' },
    ],
    views: [
      { id: 'v-esg-1', name: 'Indicadores ESG', type: 'table' },
      { id: 'v-esg-2', name: 'Dashboard ESG', type: 'dashboard' },
    ],
  },
  {
    id: 'tpl-declaraciones',
    name: 'Declaraciones ambientales',
    description: 'Gestion de declaraciones ambientales ante autoridades competentes.',
    icon: 'FileText',
    color: '#CA8A04',
    category: 'declaraciones',
    configFields: [
      { label: 'Tipo de declaracion', placeholder: 'Ej: RETC, SINADER, DS 90', type: 'text' },
      { label: 'Autoridad receptora', placeholder: 'Ej: SMA, SAG, SISS', type: 'text' },
    ],
    views: [
      { id: 'v-decl-1', name: 'Registro de Declaraciones', type: 'table' },
      { id: 'v-decl-2', name: 'Calendario de Plazos', type: 'calendar' },
      { id: 'v-decl-3', name: 'Dashboard', type: 'dashboard' },
    ],
  },
  {
    id: 'tpl-documental',
    name: 'Control documental',
    description: 'Gestion centralizada de documentos, versiones y aprobaciones.',
    icon: 'FileCheck',
    color: '#6B7280',
    category: 'personalizado',
    configFields: [
      { label: 'Categorias de documentos', placeholder: 'Ej: Procedimientos, Politicas, Manuales', type: 'text' },
      { label: 'Flujo de aprobacion', placeholder: 'Ej: Autor > Revisor > Aprobador', type: 'text' },
    ],
    views: [
      { id: 'v-doc-1', name: 'Repositorio', type: 'table' },
      { id: 'v-doc-2', name: 'Por Estado', type: 'kanban' },
      { id: 'v-doc-3', name: 'Formulario de Carga', type: 'form' },
    ],
  },
  {
    id: 'tpl-planes',
    name: 'Planes de trabajo',
    description: 'Planificacion y seguimiento de planes de accion y proyectos ambientales.',
    icon: 'ClipboardList',
    color: '#4F46E5',
    category: 'personalizado',
    configFields: [
      { label: 'Tipo de plan', placeholder: 'Ej: Plan de accion, Plan de mejora, Plan de cierre', type: 'text' },
      { label: 'Periodo', placeholder: 'Ej: Q1 2026', type: 'text' },
    ],
    views: [
      { id: 'v-plan-1', name: 'Tareas', type: 'table' },
      { id: 'v-plan-2', name: 'Tablero Kanban', type: 'kanban' },
      { id: 'v-plan-3', name: 'Cronograma', type: 'timeline' },
      { id: 'v-plan-4', name: 'Dashboard', type: 'dashboard' },
    ],
  },
]

/* ================================================================== */
/*  ICON PICKER & COLORS                                              */
/* ================================================================== */

const availableIcons = [
  { name: 'Recycle', icon: Recycle },
  { name: 'ShieldAlert', icon: ShieldAlert },
  { name: 'Activity', icon: Activity },
  { name: 'Leaf', icon: Leaf },
  { name: 'Award', icon: Award },
  { name: 'FileText', icon: FileText },
  { name: 'Users', icon: Users },
  { name: 'FlaskConical', icon: FlaskConical },
  { name: 'Scale', icon: Scale },
  { name: 'Settings', icon: Settings },
  { name: 'BookOpen', icon: BookOpen },
  { name: 'ClipboardList', icon: ClipboardList },
  { name: 'BarChart3', icon: BarChart3 },
  { name: 'TreePine', icon: TreePine },
  { name: 'Factory', icon: Factory },
  { name: 'Gauge', icon: Gauge },
  { name: 'FileCheck', icon: FileCheck },
  { name: 'Layers', icon: Layers },
]

const colorOptions = [
  '#059669', '#DC2626', '#2563EB', '#7C3AED', '#0891B2',
  '#CA8A04', '#E11D48', '#EA580C', '#0D9488', '#6B7280',
  '#4F46E5', '#D97706',
]

/* ================================================================== */
/*  WIZARD COMPONENT                                                  */
/* ================================================================== */

type CreationType = null | 'template' | 'custom'

export function AppBuilder() {
  const { apps, setCurrentView, setBuilderDraft, builderDraft, addApp, setActiveApp } = usePlatform()

  // Wizard state
  const [step, setStep] = useState(0)
  const [creationType, setCreationType] = useState<CreationType>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<WizardTemplate | null>(null)
  const [templateConfig, setTemplateConfig] = useState<Record<string, string>>({})

  // App info
  const [appName, setAppName] = useState(builderDraft?.name || '')
  const [appDesc, setAppDesc] = useState(builderDraft?.description || '')
  const [appIcon, setAppIcon] = useState(builderDraft?.icon || 'Settings')
  const [appColor, setAppColor] = useState(builderDraft?.color || '#6B7280')

  // Custom app: view selection from TEMPLATES
  const [selectedViews, setSelectedViews] = useState<{ templateId: string; viewId: string }[]>([])
  const [initialViewIdx, setInitialViewIdx] = useState(0)
  const [viewSearch, setViewSearch] = useState('')
  const [expandedTemplates, setExpandedTemplates] = useState<string[]>([])

  // Creation state (prevent duplicates, show feedback)
  const [isCreating, setIsCreating] = useState(false)

  /* ---- Derived: template views filtered by search ---- */
  const filteredTemplates = useMemo(() => {
    if (!viewSearch.trim()) return wizardTemplates
    const q = viewSearch.toLowerCase()
    return wizardTemplates
      .map(tpl => ({
        ...tpl,
        views: tpl.views.filter(v =>
          v.name.toLowerCase().includes(q) || tpl.name.toLowerCase().includes(q)
        ),
      }))
      .filter(tpl => tpl.views.length > 0)
  }, [viewSearch])

  /* ---- Resolved selected view info ---- */
  const resolvedSelectedViews = useMemo(() => {
    return selectedViews.map(sv => {
      const tpl = wizardTemplates.find(t => t.id === sv.templateId)
      const view = tpl?.views.find(v => v.id === sv.viewId)
      return { ...sv, templateName: tpl?.name || '', templateIcon: tpl?.icon || 'Settings', templateColor: tpl?.color || '#6B7280', viewName: view?.name || '', viewType: (view?.type || 'table') as ViewType }
    })
  }, [selectedViews])

  /* ---- Step definitions based on path ---- */
  const getSteps = () => {
    if (creationType === 'template') {
      return ['Tipo de creacion', 'Seleccionar plantilla', 'Informacion general', 'Configuracion inicial', 'Resumen']
    }
    if (creationType === 'custom') {
      return ['Tipo de creacion', 'Informacion general', 'Seleccionar vistas', 'Organizar vistas', 'Resumen']
    }
    return ['Tipo de creacion']
  }
  const steps = getSteps()

  /* ---- Navigation ---- */
  const handleBack = () => {
    if (step === 0) {
      setBuilderDraft(null)
      setCurrentView('hub')
    } else {
      setStep(step - 1)
    }
  }

  const canProceed = () => {
    if (isCreating) return false
    if (step === 0) return creationType !== null
    if (creationType === 'template') {
      if (step === 1) return selectedTemplate !== null
      if (step === 2) return appName.trim().length > 0
      if (step === 3) return true
      if (step === 4) return true
    }
    if (creationType === 'custom') {
      if (step === 1) return appName.trim().length > 0
      if (step === 2) return selectedViews.length > 0
      if (step === 3) return true
      if (step === 4) return true
    }
    return false
  }

  const handleNext = () => {
    if (isCreating) return
    if (step === 0) { setStep(1); return }

    // If last step, create
    if (step === steps.length - 1) { handleCreate(); return }

    // Template path: pre-fill info
    if (creationType === 'template' && step === 1 && selectedTemplate) {
      if (!appName) {
        setAppName(selectedTemplate.name)
        setAppDesc(selectedTemplate.description)
        setAppIcon(selectedTemplate.icon)
        setAppColor(selectedTemplate.color)
      }
    }

    setStep(step + 1)
  }

  const handleCreate = async () => {
    if (isCreating) return
    setIsCreating(true)

    try {
      // Simulate a small delay for UX feedback
      await new Promise(resolve => setTimeout(resolve, 800))

      const now = new Date()
      const newApp: AppModule = {
        id: `app-${Date.now()}`,
        name: appName,
        description: appDesc,
        category: selectedTemplate?.category || 'personalizado',
        status: 'active',
        icon: appIcon,
        color: appColor,
        createdAt: now,
        updatedAt: now,
        tables: [],
        views: creationType === 'template' && selectedTemplate
          ? selectedTemplate.views.map((v, i) => ({ id: `v-${Date.now()}-${i}`, name: v.name, type: v.type, tableId: 't1' }))
          : resolvedSelectedViews.map((sv, i) => ({
              id: `v-${Date.now()}-${i}`,
              name: sv.viewName,
              type: sv.viewType,
              tableId: 't1',
            })),
        events: [],
      }

      addApp(newApp)
      setBuilderDraft(null)

      toast.success('Aplicacion creada exitosamente', {
        description: `"${newApp.name}" se ha agregado a tus aplicaciones.`,
      })

      // Navigate directly to the new app's workspace using the app object
      // we already have, instead of openApp which relies on stale state
      setActiveApp(newApp)
      setCurrentView('workspace')
    } catch {
      toast.error('Error al crear la aplicacion', {
        description: 'Por favor, intenta nuevamente.',
      })
      setIsCreating(false)
    }
  }

  /* ---- View selection toggle (for custom path) ---- */
  const toggleView = (templateId: string, viewId: string) => {
    setSelectedViews(prev => {
      const exists = prev.find(v => v.templateId === templateId && v.viewId === viewId)
      if (exists) return prev.filter(v => !(v.templateId === templateId && v.viewId === viewId))
      return [...prev, { templateId, viewId }]
    })
  }

  const isViewSelected = (templateId: string, viewId: string) => {
    return selectedViews.some(v => v.templateId === templateId && v.viewId === viewId)
  }

  const toggleExpandTemplate = (tplId: string) => {
    setExpandedTemplates(prev =>
      prev.includes(tplId) ? prev.filter(id => id !== tplId) : [...prev, tplId]
    )
  }

  const moveView = (index: number, direction: 'up' | 'down') => {
    const newArr = [...selectedViews]
    const targetIdx = direction === 'up' ? index - 1 : index + 1
    if (targetIdx < 0 || targetIdx >= newArr.length) return
    ;[newArr[index], newArr[targetIdx]] = [newArr[targetIdx], newArr[index]]
    setSelectedViews(newArr)
    if (initialViewIdx === index) setInitialViewIdx(targetIdx)
    else if (initialViewIdx === targetIdx) setInitialViewIdx(index)
  }

  /* ---- Render Step Content ---- */
  const renderStepContent = () => {
    /* --- Step 0: Choose creation type --- */
    if (step === 0) {
      return (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Nueva Aplicacion</h2>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">Selecciona como quieres crear tu aplicacion.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => setCreationType('template')}
              className={`text-left rounded-xl border-2 p-6 transition-all ${
                creationType === 'template'
                  ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                  : 'border-border hover:border-primary/40 hover:bg-muted/30'
              }`}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
                <Layers className="h-6 w-6" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-1">Usar plantilla</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Crea una aplicacion completa basada en un modulo predefinido.
              </p>
            </button>
            <button
              onClick={() => setCreationType('custom')}
              className={`text-left rounded-xl border-2 p-6 transition-all ${
                creationType === 'custom'
                  ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                  : 'border-border hover:border-primary/40 hover:bg-muted/30'
              }`}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground mb-4">
                <Palette className="h-6 w-6" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-1">Crear aplicacion personalizada</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Selecciona vistas desde las plantillas oficiales para armar tu aplicacion a medida.
              </p>
            </button>
          </div>
        </div>
      )
    }

    /* --- TEMPLATE PATH --- */
    if (creationType === 'template') {
      if (step === 1) {
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Seleccionar plantilla</h2>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">Elige una plantilla predefinida para comenzar.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {wizardTemplates.map(tpl => {
                const Icon = getIcon(tpl.icon)
                const isSelected = selectedTemplate?.id === tpl.id
                return (
                  <button
                    key={tpl.id}
                    onClick={() => setSelectedTemplate(tpl)}
                    className={`text-left rounded-xl border-2 p-4 transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                        : 'border-border hover:border-primary/30 hover:bg-muted/20'
                    }`}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg mb-3"
                      style={{ backgroundColor: `${tpl.color}15`, color: tpl.color }}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-sm font-semibold text-foreground mb-1">{tpl.name}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{tpl.description}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {tpl.views.map(v => (
                        <Badge key={v.id} variant="outline" className="text-[10px] py-0 px-1.5">{v.name}</Badge>
                      ))}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )
      }

      if (step === 2) return renderAppInfoStep()

      if (step === 3 && selectedTemplate) {
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Configuracion inicial</h2>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                Configura los parametros iniciales de la plantilla <span className="font-medium text-foreground">{selectedTemplate.name}</span>.
              </p>
            </div>
            <Card className="border border-border">
              <CardContent className="p-5 space-y-4">
                {selectedTemplate.configFields.map((field, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <Label className="text-sm font-medium">{field.label}</Label>
                    {field.type === 'select' && field.options ? (
                      <Select
                        value={templateConfig[field.label] || ''}
                        onValueChange={v => setTemplateConfig(prev => ({ ...prev, [field.label]: v }))}
                      >
                        <SelectTrigger><SelectValue placeholder={field.placeholder} /></SelectTrigger>
                        <SelectContent>
                          {field.options.map(opt => (
                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        value={templateConfig[field.label] || ''}
                        onChange={e => setTemplateConfig(prev => ({ ...prev, [field.label]: e.target.value }))}
                        placeholder={field.placeholder}
                      />
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )
      }

      if (step === 4 && selectedTemplate) {
        const Icon = getIcon(appIcon)
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Resumen</h2>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">Revisa la configuracion antes de crear la aplicacion.</p>
            </div>
            <Card className="border border-border">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `${appColor}15`, color: appColor }}>
                    <Icon className="h-7 w-7" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-foreground">{appName || 'Sin nombre'}</h3>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{appDesc || 'Sin descripcion'}</p>
                  </div>
                </div>
                <div className="mt-5 pt-5 border-t border-border space-y-4">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Plantilla seleccionada</p>
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg"
                        style={{ backgroundColor: `${selectedTemplate.color}15`, color: selectedTemplate.color }}>
                        {React.createElement(getIcon(selectedTemplate.icon), { className: 'h-4 w-4' })}
                      </div>
                      <span className="text-sm font-medium text-foreground">{selectedTemplate.name}</span>
                    </div>
                  </div>
                  {Object.entries(templateConfig).filter(([, v]) => v).length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Configuracion</p>
                      <div className="space-y-1.5">
                        {Object.entries(templateConfig).filter(([, v]) => v).map(([key, val]) => (
                          <div key={key} className="flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground">{key}:</span>
                            <span className="text-foreground font-medium">{val}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Vistas incluidas</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedTemplate.views.map((v) => {
                        const cfg = viewTypeConfig[v.type]
                        const VIcon = cfg?.icon || Table2
                        return (
                          <Badge key={v.id} variant="secondary" className="text-xs gap-1.5 py-1">
                            <VIcon className="h-3 w-3" /> {v.name}
                          </Badge>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      }
    }

    /* --- CUSTOM PATH --- */
    if (creationType === 'custom') {
      if (step === 1) return renderAppInfoStep()

      /* Step 2: Select views FROM TEMPLATES */
      if (step === 2) {
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Seleccionar vistas desde plantillas</h2>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                Explora las plantillas oficiales y selecciona las vistas que deseas incluir en tu aplicacion personalizada. Puedes elegir vistas de multiples plantillas.
              </p>
            </div>

            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar plantillas o vistas..." value={viewSearch} onChange={e => setViewSearch(e.target.value)} className="pl-9" />
            </div>

            {selectedViews.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="secondary">{selectedViews.length}</Badge>
                <span>vista{selectedViews.length !== 1 ? 's' : ''} seleccionada{selectedViews.length !== 1 ? 's' : ''}</span>
              </div>
            )}

            <div className="space-y-2">
              {filteredTemplates.map(tpl => {
                const TplIcon = getIcon(tpl.icon)
                const isExpanded = expandedTemplates.includes(tpl.id)
                const selectedCount = tpl.views.filter(v => isViewSelected(tpl.id, v.id)).length
                return (
                  <Collapsible key={tpl.id} open={isExpanded} onOpenChange={() => toggleExpandTemplate(tpl.id)}>
                    <CollapsibleTrigger asChild>
                      <button className={`flex items-center gap-3 w-full rounded-xl border p-4 text-left transition-all hover:bg-muted/30 ${
                        selectedCount > 0 ? 'border-primary/30 bg-primary/5' : 'border-border'
                      }`}>
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                          style={{ backgroundColor: `${tpl.color}15`, color: tpl.color }}>
                          <TplIcon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-semibold text-foreground">{tpl.name}</h3>
                            {selectedCount > 0 && (
                              <Badge variant="default" className="text-[10px] h-5 px-1.5">{selectedCount}</Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-1">{tpl.description}</p>
                        </div>
                        <span className="text-xs text-muted-foreground shrink-0">{tpl.views.length} vistas</span>
                        <ChevronRight className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                      </button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-2 pl-[52px]">
                        {tpl.views.map(v => {
                          const selected = isViewSelected(tpl.id, v.id)
                          const cfg = viewTypeConfig[v.type]
                          const VIcon = cfg?.icon || Table2
                          return (
                            <button
                              key={v.id}
                              onClick={() => toggleView(tpl.id, v.id)}
                              className={`flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left transition-all text-sm ${
                                selected
                                  ? 'border-primary bg-primary/5 text-foreground ring-1 ring-primary/20'
                                  : 'border-border hover:border-primary/30 text-muted-foreground hover:text-foreground'
                              }`}
                            >
                              <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${
                                selected ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                              }`}>
                                <VIcon className="h-3.5 w-3.5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className="truncate block text-sm">{v.name}</span>
                                <span className="text-xs text-muted-foreground">{cfg?.label || v.type}</span>
                              </div>
                              {selected && <Check className="h-4 w-4 text-primary shrink-0" />}
                            </button>
                          )
                        })}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )
              })}
            </div>

            {filteredTemplates.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Search className="h-10 w-10 mx-auto mb-3 opacity-40" />
                <p className="text-sm">No se encontraron plantillas o vistas que coincidan.</p>
              </div>
            )}
          </div>
        )
      }

      /* Step 3: Organize views */
      if (step === 3) {
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Organizar vistas</h2>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">Ordena las vistas y selecciona cual sera la vista inicial de tu aplicacion.</p>
            </div>
            <div className="space-y-2">
              {resolvedSelectedViews.map((sv, idx) => {
                const cfg = viewTypeConfig[sv.viewType]
                const VIcon = cfg?.icon || Table2
                const isInitial = idx === initialViewIdx
                return (
                  <div key={`${sv.templateId}-${sv.viewId}`}
                    className={`flex items-center gap-3 rounded-lg border p-3 transition-all ${
                      isInitial ? 'border-primary bg-primary/5' : 'border-border'
                    }`}>
                    <div className="flex flex-col gap-0.5">
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveView(idx, 'up')} disabled={idx === 0}>
                        <ChevronUp className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveView(idx, 'down')} disabled={idx === resolvedSelectedViews.length - 1}>
                        <ChevronDown className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                      isInitial ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                    }`}>
                      <VIcon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{sv.viewName}</p>
                      <p className="text-xs text-muted-foreground">
                        {cfg?.label} &middot; desde {sv.templateName}
                      </p>
                    </div>
                    {isInitial ? (
                      <Badge variant="default" className="text-xs shrink-0 gap-1">
                        <Star className="h-3 w-3" /> Vista inicial
                      </Badge>
                    ) : (
                      <Button variant="ghost" size="sm" className="text-xs shrink-0" onClick={() => setInitialViewIdx(idx)}>
                        Establecer como inicial
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                      onClick={() => {
                        setSelectedViews(prev => prev.filter((_, i) => i !== idx))
                        if (initialViewIdx >= idx && initialViewIdx > 0) setInitialViewIdx(initialViewIdx - 1)
                      }}>
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )
              })}
            </div>
          </div>
        )
      }

      /* Step 4: Summary */
      if (step === 4) {
        const Icon = getIcon(appIcon)
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Resumen</h2>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">Revisa la configuracion antes de crear la aplicacion.</p>
            </div>
            <Card className="border border-border">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `${appColor}15`, color: appColor }}>
                    <Icon className="h-7 w-7" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-foreground">{appName || 'Sin nombre'}</h3>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{appDesc || 'Sin descripcion'}</p>
                    <Badge variant="secondary" className="text-xs mt-2">Personalizado</Badge>
                  </div>
                </div>
                <div className="mt-5 pt-5 border-t border-border">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                    Vistas seleccionadas ({resolvedSelectedViews.length})
                  </p>
                  <div className="space-y-2">
                    {resolvedSelectedViews.map((sv, idx) => {
                      const cfg = viewTypeConfig[sv.viewType]
                      const VIcon = cfg?.icon || Table2
                      return (
                        <div key={idx} className="flex items-center gap-2.5 text-sm">
                          <VIcon className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-foreground font-medium">{sv.viewName}</span>
                          <span className="text-muted-foreground">desde {sv.templateName}</span>
                          {idx === initialViewIdx && (
                            <Badge variant="secondary" className="text-[10px] ml-auto">Vista inicial</Badge>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      }
    }

    return null
  }

  /* ---- Reusable: App Info form ---- */
  const renderAppInfoStep = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Informacion de la aplicacion</h2>
        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">Define los datos basicos de tu nueva aplicacion.</p>
      </div>
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">Nombre de la aplicacion *</Label>
          <Input value={appName} onChange={e => setAppName(e.target.value)} placeholder="Ej: Control de Monitoreos Ambientales" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">Descripcion corta</Label>
          <Textarea value={appDesc} onChange={e => setAppDesc(e.target.value)} placeholder="Describe brevemente el proposito de esta aplicacion..." rows={3} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">Icono</Label>
          <div className="flex flex-wrap gap-2">
            {availableIcons.map(({ name, icon: Ic }) => (
              <button key={name} onClick={() => setAppIcon(name)}
                className={`flex h-10 w-10 items-center justify-center rounded-lg border-2 transition-all ${
                  appIcon === name ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-primary/30 hover:text-foreground'
                }`}>
                <Ic className="h-5 w-5" />
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">Color principal</Label>
          <div className="flex flex-wrap gap-2">
            {colorOptions.map(color => (
              <button key={color} onClick={() => setAppColor(color)}
                className={`h-9 w-9 rounded-full border-2 transition-all ${
                  appColor === color ? 'border-foreground scale-110' : 'border-transparent hover:scale-105'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  /* ---- Main render ---- */
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="mx-auto max-w-3xl px-6 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={handleBack} disabled={isCreating}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {step === 0 ? 'Volver al Hub' : 'Atras'}
            </Button>
            <h1 className="text-sm font-semibold text-foreground">Crear Nueva Aplicacion</h1>
            <div className="w-24" />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-6 py-6">
        {/* Step indicator */}
        {steps.length > 1 && (
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((label, i) => (
                <React.Fragment key={i}>
                  <div className="flex flex-col items-center">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium transition-all ${
                      i < step ? 'bg-primary text-primary-foreground' :
                      i === step ? 'bg-primary text-primary-foreground ring-4 ring-primary/20' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {i < step ? <Check className="h-4 w-4" /> : i + 1}
                    </div>
                    <span className={`mt-2 text-xs font-medium text-center max-w-[80px] ${i <= step ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {label}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`flex-1 h-px mx-3 ${i < step ? 'bg-primary' : 'bg-border'}`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {/* Step content */}
        <ScrollArea className="min-h-[400px]">
          {renderStepContent()}
        </ScrollArea>

        {/* Footer */}
        <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
          <Button variant="outline" onClick={handleBack} disabled={isCreating}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {step === 0 ? 'Cancelar' : 'Atras'}
          </Button>
          <Button onClick={handleNext} disabled={!canProceed()}>
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creando aplicacion...
              </>
            ) : step === steps.length - 1 ? (
              <>
                <Check className="mr-2 h-4 w-4" /> Crear aplicacion
              </>
            ) : (
              <>
                Siguiente <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
