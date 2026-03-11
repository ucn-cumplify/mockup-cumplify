// Types for the "Matriz de Riesgo" (IPER) app template
// Hierarchy: Unidades de Control → Procesos → Tareas → Peligro → Riesgo → Medida → Verificador

// --- Parameter list item ---
export interface ParametroItem {
  id: string
  nombre: string
  valor?: number
  descripcion?: string
  color?: string
  familiaId?: string
  agenteRiesgo?: string
  efectoAgente?: string
}

// --- Parameter categories ---
export type ParametroCategoria =
  | 'peligros'
  | 'familias_peligros'
  | 'riesgos_especificos'
  | 'probabilidad'
  | 'consecuencia'
  | 'nivel_riesgo'
  | 'verificadores'
  | 'familias_verificadores'
  | 'tipos_riesgo'
  | 'calidad_control'
  | 'orden_prelacion'
  | 'familias_control'

export const PARAMETRO_CATEGORIA_LABELS: Record<ParametroCategoria, string> = {
  peligros: 'Peligros',
  familias_peligros: 'Familias de Peligros',
  riesgos_especificos: 'Riesgos Especificos',
  probabilidad: 'Probabilidad',
  consecuencia: 'Consecuencia',
  nivel_riesgo: 'Nivel de Riesgo',
  verificadores: 'Verificadores',
  familias_verificadores: 'Familias de Verificadores',
  tipos_riesgo: 'Tipos de Riesgo',
  calidad_control: 'Calidad de Control',
  orden_prelacion: 'Orden de Prelacion',
  familias_control: 'Familias de Control',
}

// --- Control unit (reused from company, NOT created inside the app) ---
export interface UnidadControlMR {
  id: string
  nombre: string
  tipo: string
  descripcion?: string
}

// --- User ---
export interface UsuarioMR {
  id: string
  nombre: string
  email: string
  departamento?: string
}

// --- Proceso (belongs to a UC) ---
export interface ProcesoMR {
  id: string
  nombre: string
  descripcion?: string
  unidadControlId: string
  usaUnidadComoNombre?: boolean // true if using UC name as proceso name
  creadoPor: string
  fechaCreacion: string
}

// --- Tarea (belongs to a Proceso) ---
export interface TareaMR {
  id: string
  nombre: string
  descripcion?: string
  procesoId: string
  creadoPor: string
  fechaCreacion: string
}

// --- IPER row: one row per Proceso+Tarea+Peligro+Riesgo combination ---
export interface FilaIPER {
  id: string
  procesoId: string
  tareaId: string
  peligroId: string
  riesgoEspecificoId: string
  // VEP Inicial
  probabilidadId: string
  consecuenciaId: string
  vepInicial: number // P x C
  // VEP Post (calculated from medida's calidad + prelacion)
  vepPost: number
  // Verification state (managed from Verificadores view)
  estadoVerificacion: 'pendiente' | 'verificado'
  fechaCreacion: string
  creadoPor: string
}

// --- Medida Preventiva (belongs to a FilaIPER) ---
export interface MedidaPreventiva {
  id: string
  filaIPERId: string
  descripcion: string
  familiaControlId: string
  verificadorId: string
  calidadControlId: string
  ordenPrelacionId: string
  fechaCreacion: string
}

// --- Verificacion record (logged from Verificadores view) ---
export interface VerificacionRecord {
  id: string
  verificadorId: string
  filaIPERId: string
  medidaId: string
  cumple: boolean
  calidadReal: number // 1, 2, or 3
  comentarios?: string
  evidencia?: string
  fechaVerificacion: string
  verificadoPor: string
  proximaVerificacion?: string
}

// --- Activity log ---
export interface HistorialMR {
  id: string
  tipo: 'proceso_creado' | 'tarea_creada' | 'fila_creada' | 'medida_creada' | 'verificacion' | 'parametro_modificado'
  descripcion: string
  fecha: string
  usuarioId: string
  filaIPERId?: string
  procesoId?: string
  tareaId?: string
}

// --- Navigation views ---
export type MRVistaKey = 'dashboard' | 'identificacion' | 'evaluacion' | 'verificaciones' | 'matriz' | 'historial' | 'parametros'

export const MR_VISTA_LABELS: Record<MRVistaKey, string> = {
  dashboard: 'Dashboard',
  identificacion: 'Identificacion',
  evaluacion: 'Evaluacion',
  verificaciones: 'Verificaciones',
  matriz: 'Matriz PxC',
  historial: 'Historial',
  parametros: 'Parametros',
}

// --- Risk level helpers ---
export function getNivelRiesgoColor(nivel: number, parametros?: ParametroItem[]): string {
  if (parametros && parametros.length > 0) {
    const sorted = [...parametros].sort((a, b) => (a.valor || 0) - (b.valor || 0))
    for (const p of sorted) {
      if (nivel <= (p.valor || 0)) return p.color || 'success'
    }
    return sorted[sorted.length - 1]?.color || 'destructive'
  }
  // Fallback defaults
  if (nivel <= 4) return 'success'
  if (nivel <= 9) return 'warning'
  if (nivel <= 16) return 'chart-5'
  return 'destructive'
}

export function getNivelRiesgoLabel(nivel: number, parametros?: ParametroItem[]): string {
  if (parametros && parametros.length > 0) {
    const sorted = [...parametros].sort((a, b) => (a.valor || 0) - (b.valor || 0))
    for (const p of sorted) {
      if (nivel <= (p.valor || 0)) return p.nombre
    }
    return sorted[sorted.length - 1]?.nombre || 'Critico'
  }
  if (nivel <= 4) return 'Bajo'
  if (nivel <= 9) return 'Moderado'
  if (nivel <= 16) return 'Alto'
  return 'Critico'
}

// --- VEP POST calculation (configurable, not hardcoded) ---
// Formula: VEP(i) * (calidadControlValor / maxCalidad) * (1 - ordenPrelacionValor / (maxPrelacion + 1))
// This reduces risk based on quality of control and hierarchy of prevention
export function calcularVEPPost(
  vepInicial: number,
  calidadControlValor: number,
  ordenPrelacionValor: number,
  maxCalidad: number,
  maxPrelacion: number,
): number {
  if (maxCalidad === 0 || maxPrelacion === 0) return vepInicial
  const factorCalidad = calidadControlValor / maxCalidad
  const factorPrelacion = 1 - (ordenPrelacionValor / (maxPrelacion + 1))
  const result = Math.max(1, Math.round(vepInicial * factorCalidad * factorPrelacion))
  return result
}
