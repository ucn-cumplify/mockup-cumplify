// Types for Environmental Management System

export interface User {
  id: string
  name: string
  email: string
  role: 'super_admin' | 'admin' | 'evaluator' | 'area_manager' | 'operator'
  avatar?: string
  department?: string
  createdAt: Date
}

export interface Company {
  id: string
  name: string
  description?: string
  logo?: string
}

export interface ManagementUnit {
  id: string
  name: string
  type: 'area_admin' | 'area_operativa' | 'agrupacion' | 'operacion' | 'proceso' | 'subproceso'
  parentId?: string
  children?: ManagementUnit[]
}

export interface ControlUnit {
  id: string
  name: string
  type: string
  managementUnitIds: string[]
  description?: string
}

export interface LegalBody {
  id: string
  name: string
  shortName: string
  description: string
  ministry: string
  publicationDate: string
  promulgationDate: string
  lastModificationDate?: string
  category: 'general' | 'ambiental' | 'sst' | 'laboral' | 'energia'
  articles: Article[]
  isInternal: boolean
}

export interface Article {
  id: string
  legalBodyId: string
  number: string
  content: string
  criticality: 'alta' | 'media' | 'baja'
  attributeType: 'permiso' | 'reporte' | 'monitoreo' | 'otro'
  obligations: Obligation[]
}

export interface Obligation {
  id: string
  articleId: string
  name: string
  description: string
  backupName?: string
  status: 'pending' | 'in_progress' | 'completed'
}

export interface Project {
  id: string
  name: string
  description?: string
  location?: string
  productiveSector?: string
  activityType?: string
  status: 'identification' | 'evaluation' | 'control' | 'completed'
  createdAt: Date
  legalBodies: ProjectLegalBody[]
}

export interface ProjectLegalBody {
  legalBodyId: string
  controlUnitIds: string[]
  articleConnections: ArticleConnection[]
}

export interface ArticleConnection {
  articleId: string
  controlUnitId: string
  status: 'gestionar' | 'no_gestionar' | 'pendiente'
  assignedUserId?: string
}

export interface Evaluation {
  id: string
  projectId: string
  name: string
  evaluatorId: string
  description?: string
  status: 'in_progress' | 'completed'
  createdAt: Date
  results: EvaluationResult[]
}

export interface EvaluationResult {
  id: string
  evaluationId: string
  articleId: string
  controlUnitId: string
  complianceStatus: 'cumple' | 'cumple_parcial' | 'no_cumple' | 'pendiente'
  comment?: string
  evidenceUrl?: string
  evaluatedAt: Date
  findings: Finding[]
}

export interface Finding {
  id: string
  evaluationResultId: string
  description: string
  status: 'pendiente' | 'completado'
  createdAt: Date
  completedAt?: Date
}

export interface Task {
  id: string
  findingId?: string
  name: string
  description?: string
  assignedUserId: string
  dueDate: Date
  priority: 'alta' | 'media' | 'baja'
  status: 'pendiente' | 'en_progreso' | 'completada'
  createdAt: Date
}

export interface Audit {
  id: string
  projectId: string
  name: string
  auditorId: string
  auditingEntity?: string
  scope?: string
  startDate: Date
  endDate: Date
  type: string
  description?: string
  status: 'planned' | 'in_progress' | 'completed'
}

export interface ComplianceStats {
  total: number
  compliant: number
  partiallyCompliant: number
  nonCompliant: number
  pending: number
}

export interface DepartmentNode {
  id: string
  name: string
  role?: string
  children?: DepartmentNode[]
  norms?: string[]
}

// Customization Types
export interface Widget {
  id: string
  type: 'donut-chart' | 'bar-chart' | 'stats-card' | 'list' | 'progress-bar' | 'table' | 'org-tree'
  title: string
  size: 'small' | 'medium' | 'large' | 'full'
  config: WidgetConfig
  position: { x: number; y: number }
}

export interface WidgetConfig {
  dataSource?: string
  metric?: string
  filters?: Record<string, string>
  colors?: string[]
  showLegend?: boolean
  customData?: unknown
}

export interface CustomView {
  id: string
  name: string
  icon?: string
  widgets: Widget[]
  isDefault?: boolean
  createdAt: Date
}

export interface SidebarItem {
  id: string
  label: string
  icon: string
  section: string
  order: number
  isVisible: boolean
  isCustom?: boolean
  parentId?: string
  children?: SidebarItem[]
}

export interface UserPreferences {
  sidebarItems: SidebarItem[]
  customViews: CustomView[]
  theme: 'light' | 'dark' | 'system'
  language: string
}
