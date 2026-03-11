// Types for the "Requisitos Legales" app template
// Redesigned for many-to-many model with independent evaluations

export type Criticidad = 'alta' | 'media' | 'baja'
export type Atributo = 'permiso' | 'monitoreo' | 'reporte' | 'otros'
export type IdentificacionEstado = 'activo' | 'por_definir'
export type CumplimientoEstado = 'cumple' | 'no_cumple' | 'parcial'
export type HallazgoEstado = 'abierto' | 'cerrado'

// --- Core entities ---

export interface Decreto {
  id: string
  nombre: string
  descripcion: string
  ministerio: string
  fechaPublicacion: string
  categoria: 'general' | 'ambiental' | 'sst' | 'laboral' | 'energia'
  articulos: ArticuloDecreto[]
}

export interface ArticuloDecreto {
  id: string
  decretoId: string
  numero: string
  contenido: string
}

export interface UnidadControlRL {
  id: string
  nombre: string
  tipo: string
  descripcion?: string
}

export interface UsuarioRL {
  id: string
  nombre: string
  email: string
  departamento?: string
}

// --- Vinculacion (many-to-many: articulo <-> unidad de control) ---
// Each vinculacion is a unique combination of articulo + unidad de control

export interface VinculacionNormativa {
  id: string
  decretoId: string
  articuloId: string
  unidadControlId: string        // single UC per vinculacion (many-to-many junction)
  responsableIds: string[]
  criticidad: Criticidad
  atributo: Atributo
  estado: IdentificacionEstado
  fechaCreacion: string
  notas?: string
}

// --- Evaluacion (independent entity, configurable scope) ---

export interface EvaluacionRL {
  id: string
  nombre: string
  // Scope filters: which articulos and/or unidades to include
  articuloIds: string[]          // filter by specific articulos
  unidadControlIds: string[]     // filter by specific unidades
  fechaCreacion: string
}

// --- Resultado de evaluacion (one per vinculacion evaluated within an evaluacion) ---

export interface ResultadoEvaluacion {
  id: string
  evaluacionId: string
  vinculacionId: string
  estadoCumplimiento: CumplimientoEstado
  fechaEvaluacion: string
  comentarios?: string
  evidencia?: string
  evaluadorId: string
}

// --- Hallazgo ---

export interface HallazgoRL {
  id: string
  vinculacionId: string
  resultadoEvaluacionId: string
  evaluacionId: string
  descripcion: string
  estado: HallazgoEstado
  fechaCreacion: string
  fechaCierre?: string
}

// --- Activity log for historial ---

export interface ActividadRL {
  id: string
  vinculacionId?: string
  evaluacionId?: string
  tipo: 'creacion' | 'evaluacion' | 'cambio_estado' | 'hallazgo_creado' | 'hallazgo_cerrado' | 'bulk_link'
  descripcion: string
  fecha: string
  usuarioId: string
}

// --- Permissions ---

export type RLVistaKey = 'dashboard' | 'identificacion' | 'evaluacion' | 'control' | 'historial'
export type RLPermisoKey = 'ver' | 'crear' | 'editar' | 'eliminar'

export interface RLPermisoVista {
  vista: RLVistaKey
  permisos: Record<RLPermisoKey, boolean | null>
}

export const RL_PERMISOS_DEFAULT: RLPermisoVista[] = [
  { vista: 'dashboard', permisos: { ver: true, crear: null, editar: null, eliminar: null } },
  { vista: 'identificacion', permisos: { ver: true, crear: true, editar: true, eliminar: true } },
  { vista: 'evaluacion', permisos: { ver: true, crear: true, editar: null, eliminar: null } },
  { vista: 'control', permisos: { ver: true, crear: null, editar: null, eliminar: null } },
  { vista: 'historial', permisos: { ver: true, crear: null, editar: null, eliminar: null } },
]

export const VISTA_LABELS: Record<RLVistaKey, string> = {
  dashboard: 'Dashboard',
  identificacion: 'Identificacion',
  evaluacion: 'Evaluacion',
  control: 'Control',
  historial: 'Historial',
}

export const CRITICIDAD_LABELS: Record<Criticidad, string> = {
  alta: 'Alta',
  media: 'Media',
  baja: 'Baja',
}

export const ATRIBUTO_LABELS: Record<Atributo, string> = {
  permiso: 'Permiso',
  monitoreo: 'Monitoreo',
  reporte: 'Reporte',
  otros: 'Otros',
}

export const IDENTIFICACION_ESTADO_LABELS: Record<IdentificacionEstado, string> = {
  activo: 'Activo',
  por_definir: 'Por definir',
}

export const CUMPLIMIENTO_ESTADO_LABELS: Record<CumplimientoEstado, string> = {
  cumple: 'Cumple',
  no_cumple: 'No cumple',
  parcial: 'Cumple parcial',
}

export const HALLAZGO_ESTADO_LABELS: Record<HallazgoEstado, string> = {
  abierto: 'Abierto',
  cerrado: 'Cerrado',
}
