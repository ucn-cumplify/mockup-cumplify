import type {
  Decreto, UnidadControlRL, UsuarioRL,
  VinculacionNormativa, EvaluacionRL, ResultadoEvaluacion,
  HallazgoRL, ActividadRL,
} from './types'

// --- Decretos with articles ---

export const mockDecretos: Decreto[] = [
  {
    id: 'd1',
    nombre: 'Decreto 148',
    descripcion: 'Aprueba Reglamento Sanitario sobre Manejo de Residuos Peligrosos',
    ministerio: 'Ministerio de Salud',
    fechaPublicacion: '2024-06-16',
    categoria: 'ambiental',
    articulos: [
      { id: 'art-1', decretoId: 'd1', numero: 'Art. 5', contenido: 'Todo generador de residuos peligrosos sera responsable de que el manejo de estos no provoque riesgos para la salud y el medio ambiente.' },
      { id: 'art-2', decretoId: 'd1', numero: 'Art. 25', contenido: 'Las instalaciones de almacenamiento de residuos peligrosos deberan contar con autorizacion sanitaria vigente.' },
      { id: 'art-3', decretoId: 'd1', numero: 'Art. 33', contenido: 'El transporte de residuos peligrosos debera realizarse en vehiculos que cumplan con las normas establecidas por el Ministerio de Transportes.' },
    ],
  },
  {
    id: 'd2',
    nombre: 'Decreto 594',
    descripcion: 'Aprueba Reglamento sobre Condiciones Sanitarias y Ambientales Basicas en los Lugares de Trabajo',
    ministerio: 'Ministerio de Salud',
    fechaPublicacion: '2000-09-15',
    categoria: 'sst',
    articulos: [
      { id: 'art-4', decretoId: 'd2', numero: 'Art. 3', contenido: 'El empleador estara obligado a mantener en los lugares de trabajo las condiciones sanitarias y ambientales necesarias para proteger la vida y la salud de los trabajadores.' },
      { id: 'art-5', decretoId: 'd2', numero: 'Art. 12', contenido: 'Todo lugar de trabajo debera contar con agua potable destinada al consumo humano y necesidades basicas de higiene y aseo personal.' },
      { id: 'art-6', decretoId: 'd2', numero: 'Art. 53', contenido: 'Los agentes fisicos, quimicos y biologicos capaces de provocar efectos adversos en la salud debera ser evaluados y controlados periodicamente.' },
    ],
  },
  {
    id: 'd3',
    nombre: 'Decreto 43',
    descripcion: 'Aprueba el Reglamento de Almacenamiento de Sustancias Peligrosas',
    ministerio: 'Ministerio de Salud',
    fechaPublicacion: '2016-03-12',
    categoria: 'ambiental',
    articulos: [
      { id: 'art-7', decretoId: 'd3', numero: 'Art. 8', contenido: 'Las bodegas de almacenamiento de sustancias peligrosas deberan contar con sistema de contencion de derrames con capacidad suficiente.' },
      { id: 'art-8', decretoId: 'd3', numero: 'Art. 15', contenido: 'Las sustancias peligrosas incompatibles entre si deberan almacenarse en sectores separados dentro de la bodega.' },
    ],
  },
  {
    id: 'd4',
    nombre: 'D.S. 90',
    descripcion: 'Establece Norma de Emision para la Regulacion de Contaminantes Asociados a las Descargas de Residuos Liquidos',
    ministerio: 'Ministerio del Medio Ambiente',
    fechaPublicacion: '2001-03-07',
    categoria: 'ambiental',
    articulos: [
      { id: 'art-9', decretoId: 'd4', numero: 'Art. 4', contenido: 'Los establecimientos que descarguen residuos liquidos deberan cumplir con los limites maximos permitidos establecidos en las tablas del presente decreto.' },
      { id: 'art-10', decretoId: 'd4', numero: 'Art. 7', contenido: 'Los titulares deberan realizar autocontroles periodicos de sus descargas y reportar los resultados a la autoridad competente.' },
    ],
  },
  {
    id: 'd5',
    nombre: 'Ley 20.920',
    descripcion: 'Establece Marco para la Gestion de Residuos, la Responsabilidad Extendida del Productor y Fomento al Reciclaje (REP)',
    ministerio: 'Ministerio del Medio Ambiente',
    fechaPublicacion: '2016-06-01',
    categoria: 'ambiental',
    articulos: [
      { id: 'art-11', decretoId: 'd5', numero: 'Art. 2', contenido: 'Todo residuo potencialmente valorizable debera, preferentemente, ser destinado a valorizacion y solo como ultima alternativa a eliminacion.' },
      { id: 'art-12', decretoId: 'd5', numero: 'Art. 10', contenido: 'Los productores de productos prioritarios seran responsables de organizar y financiar la recoleccion y valorizacion de los residuos derivados de sus productos.' },
    ],
  },
]

// --- Unidades de Control ---

export const mockUnidadesControl: UnidadControlRL[] = [
  { id: 'uc1', nombre: 'Bodega de Quimicos', tipo: 'Instalacion', descripcion: 'Bodega principal de almacenamiento de sustancias quimicas' },
  { id: 'uc2', nombre: 'Planta de Tratamiento', tipo: 'Proceso', descripcion: 'Planta de tratamiento de aguas residuales industriales' },
  { id: 'uc3', nombre: 'Area de Produccion', tipo: 'Area', descripcion: 'Lineas de produccion principales de la planta' },
]

// --- Usuarios ---

export const mockUsuariosRL: UsuarioRL[] = [
  { id: 'u1', nombre: 'Carlos Mendoza', email: 'carlos.mendoza@empresa.cl', departamento: 'Administracion' },
  { id: 'u2', nombre: 'Maria Gonzalez', email: 'maria.gonzalez@empresa.cl', departamento: 'Gestion Ambiental' },
  { id: 'u3', nombre: 'Juan Perez', email: 'juan.perez@empresa.cl', departamento: 'Cumplimiento' },
  { id: 'u4', nombre: 'Ana Silva', email: 'ana.silva@empresa.cl', departamento: 'Operaciones' },
]

// --- Mapping: Unidades de Control -> Usuarios asignados ---
export const ucUsuariosMap: Record<string, string[]> = {
  'uc1': ['u2', 'u4'],
  'uc2': ['u2', 'u3'],
  'uc3': ['u1', 'u4'],
}

// --- Vinculaciones (many-to-many: each articulo-UC combination is a separate vinculacion) ---

export const mockVinculaciones: VinculacionNormativa[] = [
  // D.148 Art.5 -> Bodega de Quimicos
  { id: 'v1', decretoId: 'd1', articuloId: 'art-1', unidadControlId: 'uc1', responsableIds: ['u2', 'u4'], criticidad: 'alta', atributo: 'permiso', estado: 'activo', fechaCreacion: '2025-08-15' },
  // D.148 Art.5 -> Planta de Tratamiento
  { id: 'v2', decretoId: 'd1', articuloId: 'art-1', unidadControlId: 'uc2', responsableIds: ['u2', 'u3'], criticidad: 'alta', atributo: 'permiso', estado: 'activo', fechaCreacion: '2025-08-15' },
  // D.148 Art.25 -> Bodega de Quimicos
  { id: 'v3', decretoId: 'd1', articuloId: 'art-2', unidadControlId: 'uc1', responsableIds: ['u2'], criticidad: 'alta', atributo: 'permiso', estado: 'activo', fechaCreacion: '2025-08-20' },
  // D.148 Art.33 -> Bodega + Planta
  { id: 'v4', decretoId: 'd1', articuloId: 'art-3', unidadControlId: 'uc1', responsableIds: ['u3'], criticidad: 'alta', atributo: 'permiso', estado: 'activo', fechaCreacion: '2025-11-15' },
  { id: 'v5', decretoId: 'd1', articuloId: 'art-3', unidadControlId: 'uc2', responsableIds: ['u3'], criticidad: 'alta', atributo: 'permiso', estado: 'activo', fechaCreacion: '2025-11-15' },
  // D.594 Art.53 -> Area de Produccion
  { id: 'v6', decretoId: 'd2', articuloId: 'art-6', unidadControlId: 'uc3', responsableIds: ['u3', 'u4'], criticidad: 'media', atributo: 'monitoreo', estado: 'activo', fechaCreacion: '2025-09-01' },
  // D.594 Art.3 -> all 3 UCs
  { id: 'v7', decretoId: 'd2', articuloId: 'art-4', unidadControlId: 'uc1', responsableIds: ['u1'], criticidad: 'media', atributo: 'monitoreo', estado: 'activo', fechaCreacion: '2025-10-01' },
  { id: 'v8', decretoId: 'd2', articuloId: 'art-4', unidadControlId: 'uc2', responsableIds: ['u1'], criticidad: 'media', atributo: 'monitoreo', estado: 'activo', fechaCreacion: '2025-10-01' },
  { id: 'v9', decretoId: 'd2', articuloId: 'art-4', unidadControlId: 'uc3', responsableIds: ['u1'], criticidad: 'media', atributo: 'otros', estado: 'activo', fechaCreacion: '2025-10-01' },
  // D.43 Art.8 -> Bodega
  { id: 'v10', decretoId: 'd3', articuloId: 'art-7', unidadControlId: 'uc1', responsableIds: ['u4'], criticidad: 'alta', atributo: 'permiso', estado: 'activo', fechaCreacion: '2025-09-10' },
  // D.43 Art.15 -> Bodega
  { id: 'v11', decretoId: 'd3', articuloId: 'art-8', unidadControlId: 'uc1', responsableIds: ['u4'], criticidad: 'baja', atributo: 'permiso', estado: 'por_definir', fechaCreacion: '2025-10-15' },
  // D.S.90 Art.4 -> Planta
  { id: 'v12', decretoId: 'd4', articuloId: 'art-9', unidadControlId: 'uc2', responsableIds: ['u2', 'u4'], criticidad: 'media', atributo: 'monitoreo', estado: 'activo', fechaCreacion: '2025-12-01' },
  // D.S.90 Art.7 -> Planta
  { id: 'v13', decretoId: 'd4', articuloId: 'art-10', unidadControlId: 'uc2', responsableIds: ['u2', 'u3'], criticidad: 'media', atributo: 'reporte', estado: 'activo', fechaCreacion: '2025-09-20' },
  // Ley 20.920 Art.2 -> Area de Produccion
  { id: 'v14', decretoId: 'd5', articuloId: 'art-11', unidadControlId: 'uc3', responsableIds: ['u2'], criticidad: 'baja', atributo: 'reporte', estado: 'activo', fechaCreacion: '2025-11-01' },
]

// --- Evaluaciones (independent entities) ---

export const mockEvaluaciones: EvaluacionRL[] = [
  {
    id: 'eval-1',
    nombre: 'Evaluacion Q4 2025 - Bodega de Quimicos',
    articuloIds: ['art-1', 'art-2', 'art-7', 'art-8'],
    unidadControlIds: ['uc1'],
    fechaCreacion: '2025-10-15',
  },
  {
    id: 'eval-2',
    nombre: 'Evaluacion General Enero 2026',
    articuloIds: [],  // all
    unidadControlIds: [],  // all
    fechaCreacion: '2026-01-10',
  },
  {
    id: 'eval-3',
    nombre: 'Evaluacion Planta de Tratamiento',
    articuloIds: [],
    unidadControlIds: ['uc2'],
    fechaCreacion: '2025-12-20',
  },
]

// --- Resultados de Evaluacion ---

export const mockResultados: ResultadoEvaluacion[] = [
  // eval-1: Bodega Q4
  { id: 'res-1', evaluacionId: 'eval-1', vinculacionId: 'v1', estadoCumplimiento: 'cumple', fechaEvaluacion: '2025-10-15', comentarios: 'Plan de manejo vigente y operativo. Sin observaciones.', evidencia: 'plan_manejo_respel_2025.pdf', evaluadorId: 'u3' },
  { id: 'res-2', evaluacionId: 'eval-1', vinculacionId: 'v3', estadoCumplimiento: 'parcial', fechaEvaluacion: '2025-10-15', comentarios: 'Autorizacion en tramite. Expediente ingresado a SEREMI.', evaluadorId: 'u2' },
  { id: 'res-3', evaluacionId: 'eval-1', vinculacionId: 'v10', estadoCumplimiento: 'no_cumple', fechaEvaluacion: '2025-10-15', comentarios: 'Contencion secundaria con grietas visibles. Requiere reparacion urgente.', evaluadorId: 'u4' },
  { id: 'res-4', evaluacionId: 'eval-1', vinculacionId: 'v11', estadoCumplimiento: 'cumple', fechaEvaluacion: '2025-10-15', comentarios: 'Segregacion correcta de sustancias incompatibles.', evaluadorId: 'u4' },

  // eval-2: General Enero 2026
  { id: 'res-5', evaluacionId: 'eval-2', vinculacionId: 'v1', estadoCumplimiento: 'cumple', fechaEvaluacion: '2026-01-10', comentarios: 'Revision semestral aprobada.', evidencia: 'revision_semestral_ene2026.pdf', evaluadorId: 'u3' },
  { id: 'res-6', evaluacionId: 'eval-2', vinculacionId: 'v2', estadoCumplimiento: 'parcial', fechaEvaluacion: '2026-01-10', comentarios: 'Plan parcialmente implementado en Planta de Tratamiento.', evaluadorId: 'u2' },
  { id: 'res-7', evaluacionId: 'eval-2', vinculacionId: 'v6', estadoCumplimiento: 'cumple', fechaEvaluacion: '2026-01-10', comentarios: 'Monitoreo trimestral realizado sin hallazgos.', evidencia: 'informe_monitoreo_q4.pdf', evaluadorId: 'u3' },
  { id: 'res-8', evaluacionId: 'eval-2', vinculacionId: 'v7', estadoCumplimiento: 'parcial', fechaEvaluacion: '2026-01-10', comentarios: 'Capacitacion realizada en Bodega de Quimicos.', evaluadorId: 'u1' },
  { id: 'res-9', evaluacionId: 'eval-2', vinculacionId: 'v8', estadoCumplimiento: 'cumple', fechaEvaluacion: '2026-01-10', comentarios: 'Capacitacion completada en Planta de Tratamiento.', evaluadorId: 'u1' },
  { id: 'res-10', evaluacionId: 'eval-2', vinculacionId: 'v9', estadoCumplimiento: 'no_cumple', fechaEvaluacion: '2026-01-10', comentarios: 'Capacitacion no realizada en Area de Produccion.', evaluadorId: 'u1' },
  { id: 'res-11', evaluacionId: 'eval-2', vinculacionId: 'v12', estadoCumplimiento: 'no_cumple', fechaEvaluacion: '2026-01-20', comentarios: 'Descarga supera limite de DBO5 establecido en tabla del decreto.', evaluadorId: 'u2' },

  // eval-3: Planta
  { id: 'res-12', evaluacionId: 'eval-3', vinculacionId: 'v13', estadoCumplimiento: 'cumple', fechaEvaluacion: '2025-12-20', comentarios: 'Autocontrol ejecutado y reportado a SMA.', evidencia: 'autocontrol_dic2025.xlsx', evaluadorId: 'u2' },
  { id: 'res-13', evaluacionId: 'eval-3', vinculacionId: 'v2', estadoCumplimiento: 'cumple', fechaEvaluacion: '2025-12-20', comentarios: 'Plan de manejo operativo en planta.', evaluadorId: 'u2' },
  { id: 'res-14', evaluacionId: 'eval-3', vinculacionId: 'v5', estadoCumplimiento: 'cumple', fechaEvaluacion: '2025-12-20', comentarios: 'Transporte cumple con normativa vigente.', evaluadorId: 'u3' },
]

// --- Hallazgos ---

export const mockHallazgos: HallazgoRL[] = [
  { id: 'h1', vinculacionId: 'v10', resultadoEvaluacionId: 'res-3', evaluacionId: 'eval-1', descripcion: 'Contencion secundaria de bodega de quimicos presenta grietas estructurales. Riesgo de derrame no contenido.', estado: 'abierto', fechaCreacion: '2025-10-15' },
  { id: 'h2', vinculacionId: 'v9', resultadoEvaluacionId: 'res-10', evaluacionId: 'eval-2', descripcion: 'Capacitacion SST no completada en area de produccion dentro del plazo establecido.', estado: 'cerrado', fechaCreacion: '2026-01-10', fechaCierre: '2026-02-01' },
  { id: 'h3', vinculacionId: 'v12', resultadoEvaluacionId: 'res-11', evaluacionId: 'eval-2', descripcion: 'Descarga de planta de tratamiento supera limite de DBO5 (42 mg/L vs 35 mg/L permitido).', estado: 'abierto', fechaCreacion: '2026-01-20' },
]

// --- Actividades ---

export const mockActividades: ActividadRL[] = [
  { id: 'act1', vinculacionId: 'v1', tipo: 'creacion', descripcion: 'Vinculacion creada - D.148 Art.5 con Bodega de Quimicos', fecha: '2025-08-15', usuarioId: 'u2' },
  { id: 'act2', tipo: 'bulk_link', descripcion: 'Vinculacion masiva: D.148 Art.5 vinculado a Bodega de Quimicos, Planta de Tratamiento', fecha: '2025-08-15', usuarioId: 'u2' },
  { id: 'act3', evaluacionId: 'eval-1', tipo: 'evaluacion', descripcion: 'Evaluacion Q4 2025 - Bodega de Quimicos creada', fecha: '2025-10-15', usuarioId: 'u3' },
  { id: 'act4', vinculacionId: 'v1', evaluacionId: 'eval-1', tipo: 'evaluacion', descripcion: 'Evaluacion realizada: Cumple - D.148 Art.5 / Bodega de Quimicos', fecha: '2025-10-15', usuarioId: 'u3' },
  { id: 'act5', vinculacionId: 'v10', evaluacionId: 'eval-1', tipo: 'evaluacion', descripcion: 'Evaluacion realizada: No cumple - D.43 Art.8 / Bodega de Quimicos', fecha: '2025-10-15', usuarioId: 'u4' },
  { id: 'act6', vinculacionId: 'v10', tipo: 'hallazgo_creado', descripcion: 'Hallazgo generado: Grietas en contencion secundaria', fecha: '2025-10-15', usuarioId: 'u4' },
  { id: 'act7', evaluacionId: 'eval-3', tipo: 'evaluacion', descripcion: 'Evaluacion Planta de Tratamiento creada', fecha: '2025-12-20', usuarioId: 'u2' },
  { id: 'act8', evaluacionId: 'eval-2', tipo: 'evaluacion', descripcion: 'Evaluacion General Enero 2026 creada', fecha: '2026-01-10', usuarioId: 'u3' },
  { id: 'act9', vinculacionId: 'v9', evaluacionId: 'eval-2', tipo: 'evaluacion', descripcion: 'Evaluacion realizada: No cumple - D.594 Art.3 / Area de Produccion', fecha: '2026-01-10', usuarioId: 'u1' },
  { id: 'act10', vinculacionId: 'v9', tipo: 'hallazgo_creado', descripcion: 'Hallazgo generado: Capacitacion pendiente en produccion', fecha: '2026-01-10', usuarioId: 'u1' },
  { id: 'act11', vinculacionId: 'v9', tipo: 'hallazgo_cerrado', descripcion: 'Hallazgo cerrado: Capacitacion completada', fecha: '2026-02-01', usuarioId: 'u1' },
  { id: 'act12', vinculacionId: 'v12', evaluacionId: 'eval-2', tipo: 'evaluacion', descripcion: 'Evaluacion realizada: No cumple - D.S.90 Art.4 / Planta de Tratamiento', fecha: '2026-01-20', usuarioId: 'u2' },
  { id: 'act13', vinculacionId: 'v12', tipo: 'hallazgo_creado', descripcion: 'Hallazgo generado: DBO5 sobre limite normativo', fecha: '2026-01-20', usuarioId: 'u2' },
]
