'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

// ---- Types ----

export type AppCategory =
  | 'residuos'
  | 'riesgos'
  | 'monitoreo'
  | 'esg'
  | 'certificaciones'
  | 'declaraciones'
  | 'rrhh'
  | 'sustancias'
  | 'cumplimiento'
  | 'personalizado'

export type AppStatus = 'draft' | 'active' | 'archived'
export type ViewType = 'table' | 'kanban' | 'calendar' | 'dashboard' | 'form' | 'timeline'

export interface AppColumn {
  id: string
  name: string
  type: 'text' | 'number' | 'date' | 'select' | 'checkbox' | 'user' | 'status' | 'file' | 'formula'
  options?: string[]
  required?: boolean
  width?: number
}

export interface AppTable {
  id: string
  name: string
  columns: AppColumn[]
  rows: Record<string, unknown>[]
}

export interface AppView {
  id: string
  name: string
  type: ViewType
  tableId: string
  config?: Record<string, unknown>
}

export interface CalendarEvent {
  id: string
  title: string
  date: string
  endDate?: string
  color?: string
  description?: string
}

export interface AppModule {
  id: string
  name: string
  description: string
  category: AppCategory
  status: AppStatus
  icon: string
  color: string
  createdAt: Date
  updatedAt: Date
  tables: AppTable[]
  views: AppView[]
  events: CalendarEvent[]
  isTemplate?: boolean
  templateId?: string // Identifies the source template for custom rendering
}

export interface AppTemplate {
  id: string
  name: string
  description: string
  category: AppCategory
  icon: string
  color: string
  previewDescription: string
  tables: AppTable[]
  views: AppView[]
}

// ---- Category Config ----

export const categoryConfig: Record<AppCategory, { label: string; color: string; icon: string }> = {
  residuos: { label: 'Manejo de Residuos', color: '#059669', icon: 'Recycle' },
  riesgos: { label: 'Matrices de Riesgos', color: '#DC2626', icon: 'ShieldAlert' },
  monitoreo: { label: 'Control de Monitoreos', color: '#2563EB', icon: 'Activity' },
  esg: { label: 'Gestion ESG', color: '#7C3AED', icon: 'Leaf' },
  certificaciones: { label: 'Certificaciones', color: '#0891B2', icon: 'Award' },
  declaraciones: { label: 'Declaraciones Ambientales', color: '#CA8A04', icon: 'FileText' },
  rrhh: { label: 'Gestion de RRHH', color: '#E11D48', icon: 'Users' },
  sustancias: { label: 'Sustancias Peligrosas', color: '#EA580C', icon: 'FlaskConical' },
  cumplimiento: { label: 'Cumplimiento Legal', color: '#0D9488', icon: 'Scale' },
  personalizado: { label: 'Personalizado', color: '#6B7280', icon: 'Settings' },
}

// ---- Default Templates ----

export const defaultTemplates: AppTemplate[] = [
  {
    id: 'tpl-residuos',
    name: 'Manejo de Residuos',
    description: 'Gestion integral de residuos industriales y peligrosos con trazabilidad completa.',
    category: 'residuos',
    icon: 'Recycle',
    color: '#059669',
    previewDescription: 'Incluye tabla de residuos, registro de retiros, manifiestos y calendario de retiros programados.',
    tables: [
      {
        id: 't1',
        name: 'Registro de Residuos',
        columns: [
          { id: 'c1', name: 'Tipo de Residuo', type: 'select', options: ['Peligroso', 'No Peligroso', 'Asimilable', 'Inerte'], required: true },
          { id: 'c2', name: 'Cantidad (kg)', type: 'number', required: true },
          { id: 'c3', name: 'Fecha de Generacion', type: 'date', required: true },
          { id: 'c4', name: 'Area Generadora', type: 'text' },
          { id: 'c5', name: 'Responsable', type: 'user' },
          { id: 'c6', name: 'Estado', type: 'status', options: ['Almacenado', 'En Transito', 'Dispuesto', 'Reciclado'] },
          { id: 'c7', name: 'Manifiesto', type: 'file' },
        ],
        rows: [
          { c1: 'Peligroso', c2: 150, c3: '2026-01-15', c4: 'Planta Quimica', c5: 'Carlos Mendoza', c6: 'Almacenado', c7: null },
          { c1: 'No Peligroso', c2: 500, c3: '2026-01-20', c4: 'Produccion', c5: 'Maria Gonzalez', c6: 'Dispuesto', c7: null },
          { c1: 'Asimilable', c2: 80, c3: '2026-02-01', c4: 'Oficinas', c5: 'Juan Perez', c6: 'Reciclado', c7: null },
        ],
      },
    ],
    views: [
      { id: 'v1', name: 'Tabla General', type: 'table', tableId: 't1' },
      { id: 'v2', name: 'Calendario de Retiros', type: 'calendar', tableId: 't1' },
      { id: 'v3', name: 'Dashboard', type: 'dashboard', tableId: 't1' },
    ],
  },
  {
    id: 'tpl-riesgos',
    name: 'Matriz de Riesgos',
    description: 'Identificacion, evaluacion y control de riesgos ambientales y operacionales.',
    category: 'riesgos',
    icon: 'ShieldAlert',
    color: '#DC2626',
    previewDescription: 'Incluye matriz de riesgos con probabilidad, severidad, controles y plan de accion.',
    tables: [
      {
        id: 't1',
        name: 'Matriz de Riesgos',
        columns: [
          { id: 'c1', name: 'Riesgo', type: 'text', required: true },
          { id: 'c2', name: 'Categoria', type: 'select', options: ['Ambiental', 'Operacional', 'Legal', 'Reputacional', 'Financiero'] },
          { id: 'c3', name: 'Probabilidad', type: 'select', options: ['Muy Baja', 'Baja', 'Media', 'Alta', 'Muy Alta'] },
          { id: 'c4', name: 'Severidad', type: 'select', options: ['Insignificante', 'Menor', 'Moderada', 'Mayor', 'Catastrofica'] },
          { id: 'c5', name: 'Nivel de Riesgo', type: 'select', options: ['Bajo', 'Medio', 'Alto', 'Critico'] },
          { id: 'c6', name: 'Control Existente', type: 'text' },
          { id: 'c7', name: 'Responsable', type: 'user' },
          { id: 'c8', name: 'Estado', type: 'status', options: ['Identificado', 'En Evaluacion', 'Controlado', 'Cerrado'] },
          { id: 'c9', name: 'Fecha Revision', type: 'date' },
        ],
        rows: [
          { c1: 'Derrame de sustancias quimicas', c2: 'Ambiental', c3: 'Media', c4: 'Mayor', c5: 'Alto', c6: 'Contencion secundaria', c7: 'Carlos Mendoza', c8: 'Controlado', c9: '2026-03-15' },
          { c1: 'Incumplimiento normativo', c2: 'Legal', c3: 'Baja', c4: 'Mayor', c5: 'Medio', c6: 'Auditoria interna', c7: 'Maria Gonzalez', c8: 'En Evaluacion', c9: '2026-02-28' },
          { c1: 'Emision fuera de norma', c2: 'Ambiental', c3: 'Alta', c4: 'Moderada', c5: 'Alto', c6: 'Monitoreo continuo', c7: 'Juan Perez', c8: 'Identificado', c9: '2026-04-01' },
        ],
      },
    ],
    views: [
      { id: 'v1', name: 'Matriz Completa', type: 'table', tableId: 't1' },
      { id: 'v2', name: 'Por Estado', type: 'kanban', tableId: 't1', config: { groupBy: 'c8' } },
      { id: 'v3', name: 'Dashboard', type: 'dashboard', tableId: 't1' },
    ],
  },
  {
    id: 'tpl-monitoreo',
    name: 'Control de Monitoreos',
    description: 'Programacion y seguimiento de monitoreos ambientales periodicos.',
    category: 'monitoreo',
    icon: 'Activity',
    color: '#2563EB',
    previewDescription: 'Incluye programacion de monitoreos, resultados, alertas y calendario anual.',
    tables: [
      {
        id: 't1',
        name: 'Monitoreos',
        columns: [
          { id: 'c1', name: 'Parametro', type: 'text', required: true },
          { id: 'c2', name: 'Tipo', type: 'select', options: ['Aire', 'Agua', 'Suelo', 'Ruido', 'Vibracion'] },
          { id: 'c3', name: 'Punto de Medicion', type: 'text' },
          { id: 'c4', name: 'Valor Medido', type: 'number' },
          { id: 'c5', name: 'Unidad', type: 'text' },
          { id: 'c6', name: 'Limite Norma', type: 'number' },
          { id: 'c7', name: 'Cumple', type: 'checkbox' },
          { id: 'c8', name: 'Fecha Medicion', type: 'date', required: true },
          { id: 'c9', name: 'Responsable', type: 'user' },
        ],
        rows: [
          { c1: 'PM10', c2: 'Aire', c3: 'Estacion Norte', c4: 45, c5: 'ug/m3', c6: 50, c7: true, c8: '2026-01-20', c9: 'Ana Silva' },
          { c1: 'DBO5', c2: 'Agua', c3: 'Descarga 1', c4: 28, c5: 'mg/L', c6: 35, c7: true, c8: '2026-01-25', c9: 'Juan Perez' },
          { c1: 'Ruido Diurno', c2: 'Ruido', c3: 'Limite predial', c4: 72, c5: 'dB(A)', c6: 65, c7: false, c8: '2026-02-01', c9: 'Maria Gonzalez' },
        ],
      },
    ],
    views: [
      { id: 'v1', name: 'Registro', type: 'table', tableId: 't1' },
      { id: 'v2', name: 'Calendario', type: 'calendar', tableId: 't1' },
      { id: 'v3', name: 'Tendencias', type: 'dashboard', tableId: 't1' },
    ],
  },
  {
    id: 'tpl-esg',
    name: 'Gestion ESG',
    description: 'Seguimiento de indicadores ambientales, sociales y de gobernanza.',
    category: 'esg',
    icon: 'Leaf',
    color: '#7C3AED',
    previewDescription: 'Incluye indicadores ESG, metas, avances y reportes para stakeholders.',
    tables: [
      {
        id: 't1',
        name: 'Indicadores ESG',
        columns: [
          { id: 'c1', name: 'Indicador', type: 'text', required: true },
          { id: 'c2', name: 'Dimension', type: 'select', options: ['Ambiental', 'Social', 'Gobernanza'] },
          { id: 'c3', name: 'Meta Anual', type: 'number' },
          { id: 'c4', name: 'Valor Actual', type: 'number' },
          { id: 'c5', name: 'Unidad', type: 'text' },
          { id: 'c6', name: 'Estado', type: 'status', options: ['En Curso', 'Cumplida', 'En Riesgo', 'No Cumplida'] },
          { id: 'c7', name: 'Responsable', type: 'user' },
        ],
        rows: [
          { c1: 'Reduccion emisiones CO2', c2: 'Ambiental', c3: 15, c4: 8, c5: '% reduccion', c6: 'En Curso', c7: 'Carlos Mendoza' },
          { c1: 'Diversidad en directorio', c2: 'Social', c3: 40, c4: 35, c5: '% mujeres', c6: 'En Curso', c7: 'Maria Gonzalez' },
          { c1: 'Transparencia reportes', c2: 'Gobernanza', c3: 100, c4: 100, c5: '% cumplimiento', c6: 'Cumplida', c7: 'Juan Perez' },
        ],
      },
    ],
    views: [
      { id: 'v1', name: 'Indicadores', type: 'table', tableId: 't1' },
      { id: 'v2', name: 'Dashboard ESG', type: 'dashboard', tableId: 't1' },
    ],
  },
  {
    id: 'tpl-certificaciones',
    name: 'Estandares y Certificaciones',
    description: 'Gestion de certificaciones ISO 14001, ISO 45001, GRI y otras.',
    category: 'certificaciones',
    icon: 'Award',
    color: '#0891B2',
    previewDescription: 'Incluye checklist de requisitos, auditorias, no conformidades y plan de accion.',
    tables: [
      {
        id: 't1',
        name: 'Requisitos',
        columns: [
          { id: 'c1', name: 'Norma', type: 'select', options: ['ISO 14001', 'ISO 45001', 'ISO 9001', 'GRI', 'SASB'], required: true },
          { id: 'c2', name: 'Clausula', type: 'text', required: true },
          { id: 'c3', name: 'Requisito', type: 'text' },
          { id: 'c4', name: 'Evidencia', type: 'file' },
          { id: 'c5', name: 'Estado', type: 'status', options: ['Pendiente', 'En Proceso', 'Conforme', 'No Conforme'] },
          { id: 'c6', name: 'Responsable', type: 'user' },
          { id: 'c7', name: 'Fecha Limite', type: 'date' },
        ],
        rows: [
          { c1: 'ISO 14001', c2: '4.1', c3: 'Contexto de la organizacion', c4: null, c5: 'Conforme', c6: 'Carlos Mendoza', c7: '2026-06-30' },
          { c1: 'ISO 14001', c2: '6.1', c3: 'Acciones para abordar riesgos', c4: null, c5: 'En Proceso', c6: 'Maria Gonzalez', c7: '2026-03-15' },
          { c1: 'ISO 45001', c2: '8.1', c3: 'Planificacion y control operacional', c4: null, c5: 'Pendiente', c6: 'Ana Silva', c7: '2026-04-30' },
        ],
      },
    ],
    views: [
      { id: 'v1', name: 'Checklist', type: 'table', tableId: 't1' },
      { id: 'v2', name: 'Por Estado', type: 'kanban', tableId: 't1', config: { groupBy: 'c5' } },
      { id: 'v3', name: 'Calendario', type: 'calendar', tableId: 't1' },
    ],
  },
  {
    id: 'tpl-sustancias',
    name: 'Sustancias Peligrosas',
    description: 'Control y trazabilidad de sustancias quimicas peligrosas.',
    category: 'sustancias',
    icon: 'FlaskConical',
    color: '#EA580C',
    previewDescription: 'Incluye inventario de sustancias, hojas de seguridad, almacenamiento y transporte.',
    tables: [
      {
        id: 't1',
        name: 'Inventario',
        columns: [
          { id: 'c1', name: 'Sustancia', type: 'text', required: true },
          { id: 'c2', name: 'N CAS', type: 'text' },
          { id: 'c3', name: 'Clasificacion UN', type: 'text' },
          { id: 'c4', name: 'Cantidad (L/kg)', type: 'number' },
          { id: 'c5', name: 'Ubicacion', type: 'text' },
          { id: 'c6', name: 'Hoja de Seguridad', type: 'file' },
          { id: 'c7', name: 'Fecha Vencimiento', type: 'date' },
          { id: 'c8', name: 'Estado', type: 'status', options: ['Vigente', 'Por Vencer', 'Vencido', 'Retirado'] },
        ],
        rows: [
          { c1: 'Acido Sulfurico', c2: '7664-93-9', c3: 'UN1830', c4: 200, c5: 'Bodega A', c6: null, c7: '2027-01-15', c8: 'Vigente' },
          { c1: 'Hipoclorito de Sodio', c2: '7681-52-9', c3: 'UN1791', c4: 500, c5: 'Bodega B', c6: null, c7: '2026-06-30', c8: 'Vigente' },
          { c1: 'Solvente Organico', c2: '67-64-1', c3: 'UN1090', c4: 50, c5: 'Bodega A', c6: null, c7: '2026-03-01', c8: 'Por Vencer' },
        ],
      },
    ],
    views: [
      { id: 'v1', name: 'Inventario', type: 'table', tableId: 't1' },
      { id: 'v2', name: 'Vencimientos', type: 'calendar', tableId: 't1' },
    ],
  },
  {
    id: 'tpl-matriz-riesgo',
    name: 'Matriz de Riesgo',
    description: 'Identificacion de peligros y evaluacion de riesgos (IPER) con seguimiento de medidas preventivas.',
    category: 'riesgos',
    icon: 'ShieldAlert',
    color: '#DC2626',
    previewDescription: 'Incluye Dashboard, Identificacion de peligros, Evaluacion de riesgos (P x C), Control de medidas preventivas, Historial y Parametros configurables.',
    tables: [],
    views: [
      { id: 'v-mr-dashboard', name: 'Dashboard', type: 'dashboard', tableId: '' },
      { id: 'v-mr-identificacion', name: 'Identificacion', type: 'table', tableId: '' },
      { id: 'v-mr-evaluacion', name: 'Evaluacion', type: 'table', tableId: '' },
      { id: 'v-mr-control', name: 'Control', type: 'table', tableId: '' },
      { id: 'v-mr-historial', name: 'Historial', type: 'timeline', tableId: '' },
      { id: 'v-mr-parametros', name: 'Parametros', type: 'table', tableId: '' },
    ],
  },
  {
    id: 'tpl-requisitos-legales',
    name: 'Requisitos Legales',
    description: 'Gestion integral de requisitos legales: identificacion, evaluacion, control y seguimiento de vinculaciones normativas.',
    category: 'cumplimiento',
    icon: 'Scale',
    color: '#0D9488',
    previewDescription: 'Incluye Dashboard, Identificacion de vinculaciones normativas, Evaluacion de cumplimiento, Control y seguimiento, e Historial consolidado.',
    tables: [],
    views: [
      { id: 'v-rl-dashboard', name: 'Dashboard', type: 'dashboard', tableId: '' },
      { id: 'v-rl-identificacion', name: 'Identificacion', type: 'table', tableId: '' },
      { id: 'v-rl-evaluacion', name: 'Evaluacion', type: 'table', tableId: '' },
      { id: 'v-rl-control', name: 'table', type: 'table', tableId: '' },
      { id: 'v-rl-historial', name: 'Historial', type: 'timeline', tableId: '' },
    ],
  },
]

// ---- Context ----

type PlatformView = 'hub' | 'builder' | 'workspace' | 'empresa-config' | 'usuarios' | 'perfil' | 'biblioteca' | 'roles-permisos'

interface PlatformContextType {
  // Navigation
  currentView: PlatformView
  setCurrentView: (view: PlatformView) => void

  // Apps
  apps: AppModule[]
  addApp: (app: AppModule) => void
  updateApp: (id: string, data: Partial<AppModule>) => void
  deleteApp: (id: string) => void

  // Active app (when inside workspace)
  activeApp: AppModule | null
  setActiveApp: (app: AppModule | null) => void
  openApp: (appId: string, viewId?: string) => void
  initialViewId: string | null

  // Builder
  builderStep: number
  setBuilderStep: (step: number) => void
  builderDraft: Partial<AppModule> | null
  setBuilderDraft: (draft: Partial<AppModule> | null) => void
  startBuilder: (template?: AppTemplate) => void
  finishBuilder: () => void

  // Templates
  templates: AppTemplate[]

  // Search
  searchQuery: string
  setSearchQuery: (q: string) => void
  categoryFilter: AppCategory | 'all'
  setCategoryFilter: (c: AppCategory | 'all') => void
}

const PlatformContext = createContext<PlatformContextType | undefined>(undefined)

function createAppFromTemplate(template: AppTemplate): AppModule {
  const now = new Date()
  return {
    id: `app-${Date.now()}`,
    name: template.name,
    description: template.description,
    category: template.category,
    status: 'active',
    icon: template.icon,
    color: template.color,
    createdAt: now,
    updatedAt: now,
    tables: template.tables.map(t => ({ ...t, id: `${t.id}-${Date.now()}` })),
    views: template.views.map(v => ({ ...v, id: `${v.id}-${Date.now()}` })),
    events: [],
    templateId: template.id,
  }
}

// Pre-create some active apps from templates
const matrizRiesgoTemplateIndex = defaultTemplates.findIndex(t => t.id === 'tpl-matriz-riesgo')
const requisitosLegalesTemplateIndex = defaultTemplates.findIndex(t => t.id === 'tpl-requisitos-legales')

const initialApps: AppModule[] = [
  createAppFromTemplate(defaultTemplates[0]),
  createAppFromTemplate(defaultTemplates[1]),
  createAppFromTemplate(defaultTemplates[2]),
  createAppFromTemplate(defaultTemplates[matrizRiesgoTemplateIndex]), // Matriz de Riesgo
  createAppFromTemplate(defaultTemplates[requisitosLegalesTemplateIndex]), // Requisitos Legales
].map((app, i) => ({
  ...app,
  id: `app-initial-${i + 1}`,
  createdAt: new Date(2026, 0, 10 + i * 5),
  updatedAt: new Date(2026, 1, 1 + i * 2),
}))

export function PlatformProvider({ children }: { children: ReactNode }) {
  const [currentView, setCurrentView] = useState<PlatformView>('hub')
  const [apps, setApps] = useState<AppModule[]>(initialApps)
  const [activeApp, setActiveApp] = useState<AppModule | null>(null)
  const [builderStep, setBuilderStep] = useState(0)
  const [builderDraft, setBuilderDraft] = useState<Partial<AppModule> | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<AppCategory | 'all'>('all')
  const [initialViewId, setInitialViewId] = useState<string | null>(null)

  const addApp = useCallback((app: AppModule) => {
    setApps(prev => [...prev, app])
  }, [])

  const updateApp = useCallback((id: string, data: Partial<AppModule>) => {
    setApps(prev => prev.map(a => a.id === id ? { ...a, ...data, updatedAt: new Date() } : a))
  }, [])

  const deleteApp = useCallback((id: string) => {
    setApps(prev => prev.filter(a => a.id !== id))
  }, [])

  const openApp = useCallback((appId: string, viewId?: string) => {
    const app = apps.find(a => a.id === appId)
    if (app) {
      setActiveApp(app)
      setInitialViewId(viewId || null)
      setCurrentView('workspace')
    }
  }, [apps])

  const startBuilder = useCallback((template?: AppTemplate) => {
    if (template) {
      // For custom template apps (like Requisitos Legales), create the app immediately
      // and navigate to workspace, skipping the builder wizard
      if (template.id === 'tpl-requisitos-legales' || template.id === 'tpl-matriz-riesgo') {
        const newApp = createAppFromTemplate(template)
        const finalApp: AppModule = {
          ...newApp,
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
        } as AppModule
        setApps(prev => [...prev, finalApp])
        setActiveApp(finalApp)
        setInitialViewId(null)
        setCurrentView('workspace')
        return
      }
      const newApp = createAppFromTemplate(template)
      setBuilderDraft({ ...newApp, status: 'draft' })
    } else {
      setBuilderDraft({
        id: `app-${Date.now()}`,
        name: '',
        description: '',
        category: 'personalizado',
        status: 'draft',
        icon: 'Settings',
        color: '#6B7280',
        tables: [],
        views: [],
        events: [],
      })
    }
    setBuilderStep(0)
    setCurrentView('builder')
  }, [])

  const finishBuilder = useCallback(() => {
    if (builderDraft && builderDraft.name) {
      const now = new Date()
      const newApp: AppModule = {
        id: builderDraft.id || `app-${Date.now()}`,
        name: builderDraft.name,
        description: builderDraft.description || '',
        category: builderDraft.category || 'personalizado',
        status: 'active',
        icon: builderDraft.icon || 'Settings',
        color: builderDraft.color || '#6B7280',
        createdAt: now,
        updatedAt: now,
        tables: (builderDraft.tables || []) as AppTable[],
        views: (builderDraft.views || []) as AppView[],
        events: (builderDraft.events || []) as CalendarEvent[],
        templateId: builderDraft.templateId,
      }
      addApp(newApp)
      setBuilderDraft(null)
      setBuilderStep(0)
      setCurrentView('hub')
    }
  }, [builderDraft, addApp])

  return (
    <PlatformContext.Provider value={{
      currentView, setCurrentView,
      apps, addApp, updateApp, deleteApp,
      activeApp, setActiveApp, openApp, initialViewId,
      builderStep, setBuilderStep,
      builderDraft, setBuilderDraft,
      startBuilder, finishBuilder,
      templates: defaultTemplates,
      searchQuery, setSearchQuery,
      categoryFilter, setCategoryFilter,
    }}>
      {children}
    </PlatformContext.Provider>
  )
}

export function usePlatform() {
  const ctx = useContext(PlatformContext)
  if (!ctx) throw new Error('usePlatform must be used within PlatformProvider')
  return ctx
}
