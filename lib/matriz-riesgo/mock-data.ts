import type {
  ParametroItem, ParametroCategoria,
  UnidadControlMR, UsuarioMR,
  ProcesoMR, TareaMR, FilaIPER, MedidaPreventiva,
  VerificacionRecord, HistorialMR,
} from './types'

// --- Parametros (configurable lists) ---
export const mockParametros: Record<ParametroCategoria, ParametroItem[]> = {
  peligros: [
    { id: 'pel-1', nombre: 'Exposicion a sustancias quimicas', familiaId: 'fp-1' },
    { id: 'pel-2', nombre: 'Trabajo en altura', familiaId: 'fp-2' },
    { id: 'pel-3', nombre: 'Manejo manual de cargas', familiaId: 'fp-2' },
    { id: 'pel-4', nombre: 'Exposicion a ruido', familiaId: 'fp-1' },
    { id: 'pel-5', nombre: 'Contacto electrico', familiaId: 'fp-3' },
    { id: 'pel-6', nombre: 'Atrapamiento por maquinaria', familiaId: 'fp-3' },
    { id: 'pel-7', nombre: 'Caida al mismo nivel', familiaId: 'fp-2' },
    { id: 'pel-8', nombre: 'Exposicion a temperaturas extremas', familiaId: 'fp-1' },
  ],
  familias_peligros: [
    { id: 'fp-1', nombre: 'Agentes Ambientales' },
    { id: 'fp-2', nombre: 'Condiciones de Seguridad' },
    { id: 'fp-3', nombre: 'Agentes Mecanicos' },
  ],
  riesgos_especificos: [
    { id: 're-1', nombre: 'Intoxicacion aguda', familiaId: 'fp-1', agenteRiesgo: 'Solventes organicos', efectoAgente: 'Dano hepatico y neurologico' },
    { id: 're-2', nombre: 'Caida de distinto nivel', familiaId: 'fp-2', agenteRiesgo: 'Superficie elevada', efectoAgente: 'Fractura, traumatismo' },
    { id: 're-3', nombre: 'Lumbalgia ocupacional', familiaId: 'fp-2', agenteRiesgo: 'Carga mayor a 25kg', efectoAgente: 'Lesion musculoesqueletica' },
    { id: 're-4', nombre: 'Hipoacusia inducida por ruido', familiaId: 'fp-1', agenteRiesgo: 'Ruido sobre 85 dB', efectoAgente: 'Perdida auditiva progresiva' },
    { id: 're-5', nombre: 'Electrocucion', familiaId: 'fp-3', agenteRiesgo: 'Corriente electrica', efectoAgente: 'Quemaduras, paro cardiaco' },
    { id: 're-6', nombre: 'Amputacion traumatica', familiaId: 'fp-3', agenteRiesgo: 'Partes moviles de maquinaria', efectoAgente: 'Perdida de extremidad' },
  ],
  probabilidad: [
    { id: 'prob-1', nombre: 'Rara vez', valor: 1, descripcion: 'Puede ocurrir solo en circunstancias excepcionales' },
    { id: 'prob-2', nombre: 'Improbable', valor: 2, descripcion: 'Podria ocurrir en algun momento' },
    { id: 'prob-3', nombre: 'Posible', valor: 3, descripcion: 'Podria ocurrir en algun momento' },
    { id: 'prob-4', nombre: 'Probable', valor: 4, descripcion: 'Probablemente ocurrira en la mayoria de circunstancias' },
    { id: 'prob-5', nombre: 'Casi seguro', valor: 5, descripcion: 'Se espera que ocurra en la mayoria de circunstancias' },
  ],
  consecuencia: [
    { id: 'cons-1', nombre: 'Insignificante', valor: 1, descripcion: 'Sin lesion o lesion menor sin primeros auxilios' },
    { id: 'cons-2', nombre: 'Menor', valor: 2, descripcion: 'Lesion menor con primeros auxilios' },
    { id: 'cons-3', nombre: 'Moderada', valor: 3, descripcion: 'Incapacidad temporal' },
    { id: 'cons-4', nombre: 'Mayor', valor: 4, descripcion: 'Incapacidad permanente parcial' },
    { id: 'cons-5', nombre: 'Catastrofica', valor: 5, descripcion: 'Muerte o incapacidad permanente total' },
  ],
  nivel_riesgo: [
    { id: 'nr-1', nombre: 'Bajo', valor: 4, color: 'success', descripcion: '1-4: Riesgo aceptable' },
    { id: 'nr-2', nombre: 'Moderado', valor: 9, color: 'warning', descripcion: '5-9: Requiere atencion' },
    { id: 'nr-3', nombre: 'Alto', valor: 16, color: 'chart-5', descripcion: '10-16: Requiere accion inmediata' },
    { id: 'nr-4', nombre: 'Critico', valor: 25, color: 'destructive', descripcion: '17-25: Inaceptable, detener actividad' },
  ],
  verificadores: [
    { id: 'ver-1', nombre: 'Inspeccion visual', familiaId: 'fv-1' },
    { id: 'ver-2', nombre: 'Registro fotografico', familiaId: 'fv-1' },
    { id: 'ver-3', nombre: 'Medicion instrumental', familiaId: 'fv-2' },
    { id: 'ver-4', nombre: 'Auditoria interna', familiaId: 'fv-2' },
    { id: 'ver-5', nombre: 'Informe tecnico', familiaId: 'fv-3' },
    { id: 'ver-6', nombre: 'Capacitacion registrada', familiaId: 'fv-3' },
  ],
  familias_verificadores: [
    { id: 'fv-1', nombre: 'Verificacion en Terreno' },
    { id: 'fv-2', nombre: 'Verificacion Tecnica' },
    { id: 'fv-3', nombre: 'Documentacion' },
  ],
  tipos_riesgo: [
    { id: 'tr-1', nombre: 'Seguridad' },
    { id: 'tr-2', nombre: 'Salud Ocupacional' },
    { id: 'tr-3', nombre: 'Ambiental' },
    { id: 'tr-4', nombre: 'Ergonomico' },
    { id: 'tr-5', nombre: 'Psicosocial' },
  ],
  calidad_control: [
    { id: 'cc-1', nombre: 'Alta', valor: 1, descripcion: 'Control de maxima eficacia' },
    { id: 'cc-2', nombre: 'Media', valor: 2, descripcion: 'Control de eficacia moderada' },
    { id: 'cc-3', nombre: 'Baja', valor: 3, descripcion: 'Control de baja eficacia' },
  ],
  orden_prelacion: [
    { id: 'op-1', nombre: 'Eliminacion', valor: 6, descripcion: 'Eliminar el peligro completamente' },
    { id: 'op-2', nombre: 'Sustitucion', valor: 5, descripcion: 'Reemplazar por algo menos peligroso' },
    { id: 'op-3', nombre: 'Control de ingenieria', valor: 4, descripcion: 'Aislar personas del peligro' },
    { id: 'op-4', nombre: 'Advertencias', valor: 3, descripcion: 'Senalizacion y alarmas' },
    { id: 'op-5', nombre: 'Control administrativo', valor: 2, descripcion: 'Procedimientos y capacitacion' },
    { id: 'op-6', nombre: 'EPP', valor: 1, descripcion: 'Equipo de proteccion personal' },
  ],
  familias_control: [
    { id: 'fc-1', nombre: 'Ingenieria' },
    { id: 'fc-2', nombre: 'Administrativa' },
    { id: 'fc-3', nombre: 'Proteccion Personal' },
  ],
}

// --- Unidades de Control (reused from company) ---
export const mockUnidadesControlMR: UnidadControlMR[] = [
  { id: 'uc1', nombre: 'Bodega de Quimicos', tipo: 'Instalacion', descripcion: 'Bodega principal de almacenamiento de sustancias quimicas' },
  { id: 'uc2', nombre: 'Planta de Tratamiento', tipo: 'Proceso', descripcion: 'Planta de tratamiento de aguas residuales industriales' },
  { id: 'uc3', nombre: 'Area de Produccion', tipo: 'Area', descripcion: 'Lineas de produccion principales de la planta' },
]

// --- Usuarios ---
export const mockUsuariosMR: UsuarioMR[] = [
  { id: 'u1', nombre: 'Carlos Mendoza', email: 'carlos.mendoza@empresa.cl', departamento: 'Administracion' },
  { id: 'u2', nombre: 'Maria Gonzalez', email: 'maria.gonzalez@empresa.cl', departamento: 'Gestion Ambiental' },
  { id: 'u3', nombre: 'Juan Perez', email: 'juan.perez@empresa.cl', departamento: 'Prevencion de Riesgos' },
  { id: 'u4', nombre: 'Ana Silva', email: 'ana.silva@empresa.cl', departamento: 'Operaciones' },
]

// --- Procesos ---
export const mockProcesos: ProcesoMR[] = [
  { id: 'proc-1', nombre: 'Almacenamiento de sustancias', descripcion: 'Manejo y almacenamiento de sustancias quimicas', unidadControlId: 'uc1', creadoPor: 'u3', fechaCreacion: '2025-09-10' },
  { id: 'proc-2', nombre: 'Mantenimiento de equipos', descripcion: 'Mantenimiento preventivo y correctivo de equipos', unidadControlId: 'uc3', creadoPor: 'u3', fechaCreacion: '2025-09-12' },
  { id: 'proc-3', nombre: 'Operacion de linea', descripcion: 'Operacion de lineas de produccion', unidadControlId: 'uc3', creadoPor: 'u4', fechaCreacion: '2025-09-15' },
  { id: 'proc-4', nombre: 'Tratamiento de aguas', descripcion: 'Operacion de la planta de tratamiento', unidadControlId: 'uc2', creadoPor: 'u3', fechaCreacion: '2025-09-18' },
]

// --- Tareas ---
export const mockTareas: TareaMR[] = [
  { id: 'tar-1', nombre: 'Trasvase de quimicos', descripcion: 'Trasvasijado manual de productos quimicos', procesoId: 'proc-1', creadoPor: 'u3', fechaCreacion: '2025-09-10' },
  { id: 'tar-2', nombre: 'Transito por bodega', descripcion: 'Desplazamiento dentro de la bodega', procesoId: 'proc-1', creadoPor: 'u4', fechaCreacion: '2025-09-11' },
  { id: 'tar-3', nombre: 'Trabajo en plataformas elevadas', descripcion: 'Mantenimiento en plataformas sobre 1.8m', procesoId: 'proc-2', creadoPor: 'u3', fechaCreacion: '2025-09-12' },
  { id: 'tar-4', nombre: 'Carga manual de cajas', descripcion: 'Carga y descarga de cajas de producto', procesoId: 'proc-3', creadoPor: 'u4', fechaCreacion: '2025-09-15' },
  { id: 'tar-5', nombre: 'Operacion de maquinaria rotativa', descripcion: 'Uso de equipos con partes moviles', procesoId: 'proc-3', creadoPor: 'u3', fechaCreacion: '2025-09-16' },
  { id: 'tar-6', nombre: 'Limpieza de maquina en operacion', descripcion: 'Limpieza de equipos durante operacion', procesoId: 'proc-3', creadoPor: 'u3', fechaCreacion: '2025-09-17' },
  { id: 'tar-7', nombre: 'Intervencion de tableros', descripcion: 'Mantenimiento electrico de tableros', procesoId: 'proc-4', creadoPor: 'u4', fechaCreacion: '2025-09-18' },
  { id: 'tar-8', nombre: 'Operacion de caldera', descripcion: 'Operacion de calderas de tratamiento', procesoId: 'proc-4', creadoPor: 'u3', fechaCreacion: '2025-09-19' },
]

// --- Filas IPER ---
export const mockFilasIPER: FilaIPER[] = [
  { id: 'fila-1', procesoId: 'proc-1', tareaId: 'tar-1', peligroId: 'pel-1', riesgoEspecificoId: 're-1', probabilidadId: 'prob-3', consecuenciaId: 'cons-4', vepInicial: 12, vepPost: 4, estadoVerificacion: 'verificado', fechaCreacion: '2025-09-15', creadoPor: 'u3' },
  { id: 'fila-2', procesoId: 'proc-2', tareaId: 'tar-3', peligroId: 'pel-2', riesgoEspecificoId: 're-2', probabilidadId: 'prob-2', consecuenciaId: 'cons-5', vepInicial: 10, vepPost: 3, estadoVerificacion: 'pendiente', fechaCreacion: '2025-09-20', creadoPor: 'u3' },
  { id: 'fila-3', procesoId: 'proc-3', tareaId: 'tar-4', peligroId: 'pel-3', riesgoEspecificoId: 're-3', probabilidadId: 'prob-4', consecuenciaId: 'cons-2', vepInicial: 8, vepPost: 3, estadoVerificacion: 'verificado', fechaCreacion: '2025-10-01', creadoPor: 'u4' },
  { id: 'fila-4', procesoId: 'proc-3', tareaId: 'tar-5', peligroId: 'pel-4', riesgoEspecificoId: 're-4', probabilidadId: 'prob-3', consecuenciaId: 'cons-3', vepInicial: 9, vepPost: 4, estadoVerificacion: 'pendiente', fechaCreacion: '2025-10-05', creadoPor: 'u3' },
  { id: 'fila-5', procesoId: 'proc-4', tareaId: 'tar-7', peligroId: 'pel-5', riesgoEspecificoId: 're-5', probabilidadId: 'prob-2', consecuenciaId: 'cons-5', vepInicial: 10, vepPost: 3, estadoVerificacion: 'verificado', fechaCreacion: '2025-10-10', creadoPor: 'u4' },
  { id: 'fila-6', procesoId: 'proc-3', tareaId: 'tar-6', peligroId: 'pel-6', riesgoEspecificoId: 're-6', probabilidadId: 'prob-3', consecuenciaId: 'cons-5', vepInicial: 15, vepPost: 5, estadoVerificacion: 'pendiente', fechaCreacion: '2025-10-20', creadoPor: 'u3' },
  { id: 'fila-7', procesoId: 'proc-1', tareaId: 'tar-2', peligroId: 'pel-7', riesgoEspecificoId: 're-2', probabilidadId: 'prob-3', consecuenciaId: 'cons-1', vepInicial: 3, vepPost: 2, estadoVerificacion: 'verificado', fechaCreacion: '2025-11-01', creadoPor: 'u4' },
  { id: 'fila-8', procesoId: 'proc-4', tareaId: 'tar-8', peligroId: 'pel-8', riesgoEspecificoId: 're-6', probabilidadId: 'prob-2', consecuenciaId: 'cons-4', vepInicial: 8, vepPost: 4, estadoVerificacion: 'pendiente', fechaCreacion: '2025-11-10', creadoPor: 'u3' },
]

// --- Medidas Preventivas ---
export const mockMedidas: MedidaPreventiva[] = [
  { id: 'med-1', filaIPERId: 'fila-1', descripcion: 'Implementar sistema de extraccion localizada y uso obligatorio de EPP', familiaControlId: 'fc-1', verificadorId: 'ver-3', calidadControlId: 'cc-1', ordenPrelacionId: 'op-3', fechaCreacion: '2025-09-20' },
  { id: 'med-2', filaIPERId: 'fila-2', descripcion: 'Instalacion de barandas y uso de arnes con doble cola de vida', familiaControlId: 'fc-1', verificadorId: 'ver-1', calidadControlId: 'cc-1', ordenPrelacionId: 'op-3', fechaCreacion: '2025-09-25' },
  { id: 'med-3', filaIPERId: 'fila-3', descripcion: 'Capacitacion en manejo manual de cargas y ayuda mecanica', familiaControlId: 'fc-2', verificadorId: 'ver-6', calidadControlId: 'cc-2', ordenPrelacionId: 'op-5', fechaCreacion: '2025-10-05' },
  { id: 'med-4', filaIPERId: 'fila-4', descripcion: 'Programa de proteccion auditiva y medicion periodica', familiaControlId: 'fc-3', verificadorId: 'ver-3', calidadControlId: 'cc-2', ordenPrelacionId: 'op-6', fechaCreacion: '2025-10-10' },
  { id: 'med-5', filaIPERId: 'fila-5', descripcion: 'Bloqueo y etiquetado (LOTO) obligatorio antes de intervencion', familiaControlId: 'fc-2', verificadorId: 'ver-4', calidadControlId: 'cc-1', ordenPrelacionId: 'op-1', fechaCreacion: '2025-10-15' },
  { id: 'med-6', filaIPERId: 'fila-6', descripcion: 'Instalacion de guardas de seguridad y sensor de proximidad', familiaControlId: 'fc-1', verificadorId: 'ver-1', calidadControlId: 'cc-1', ordenPrelacionId: 'op-3', fechaCreacion: '2025-10-25' },
]

// --- Verificacion records ---
export const mockVerificaciones: VerificacionRecord[] = [
  { id: 'vr-1', verificadorId: 'ver-3', filaIPERId: 'fila-1', medidaId: 'med-1', cumple: true, calidadReal: 3, comentarios: 'Sistema de extraccion funcionando correctamente', fechaVerificacion: '2025-12-10', verificadoPor: 'u3', proximaVerificacion: '2026-03-10' },
  { id: 'vr-2', verificadorId: 'ver-6', filaIPERId: 'fila-3', medidaId: 'med-3', cumple: true, calidadReal: 2, comentarios: 'Capacitacion realizada, se requiere refuerzo', fechaVerificacion: '2025-12-15', verificadoPor: 'u4', proximaVerificacion: '2026-03-15' },
  { id: 'vr-3', verificadorId: 'ver-4', filaIPERId: 'fila-5', medidaId: 'med-5', cumple: true, calidadReal: 3, comentarios: 'Procedimiento LOTO cumplido al 100%', fechaVerificacion: '2025-12-20', verificadoPor: 'u4', proximaVerificacion: '2026-03-20' },
  { id: 'vr-4', verificadorId: 'ver-1', filaIPERId: 'fila-7', medidaId: '', cumple: true, calidadReal: 3, comentarios: 'Senalizacion de pisos verificada', fechaVerificacion: '2025-11-18', verificadoPor: 'u2', proximaVerificacion: '2026-02-18' },
]

// --- Historial ---
export const mockHistorial: HistorialMR[] = [
  { id: 'h-1', tipo: 'proceso_creado', descripcion: 'Proceso creado: Almacenamiento de sustancias', fecha: '2025-09-10', usuarioId: 'u3', procesoId: 'proc-1' },
  { id: 'h-2', tipo: 'tarea_creada', descripcion: 'Tarea creada: Trasvase de quimicos en Almacenamiento', fecha: '2025-09-10', usuarioId: 'u3', tareaId: 'tar-1' },
  { id: 'h-3', tipo: 'fila_creada', descripcion: 'Peligro identificado: Exposicion a sustancias quimicas en Trasvase de quimicos', fecha: '2025-09-15', usuarioId: 'u3', filaIPERId: 'fila-1' },
  { id: 'h-4', tipo: 'medida_creada', descripcion: 'Medida preventiva registrada para Exposicion a sustancias quimicas', fecha: '2025-09-20', usuarioId: 'u3', filaIPERId: 'fila-1' },
  { id: 'h-5', tipo: 'fila_creada', descripcion: 'Peligro identificado: Trabajo en altura en Plataformas elevadas', fecha: '2025-09-20', usuarioId: 'u3', filaIPERId: 'fila-2' },
  { id: 'h-6', tipo: 'verificacion', descripcion: 'Verificacion completada: Medicion instrumental - Cumple', fecha: '2025-12-10', usuarioId: 'u3', filaIPERId: 'fila-1' },
  { id: 'h-7', tipo: 'verificacion', descripcion: 'Verificacion completada: Capacitacion registrada - Cumple', fecha: '2025-12-15', usuarioId: 'u4', filaIPERId: 'fila-3' },
  { id: 'h-8', tipo: 'fila_creada', descripcion: 'Peligro identificado: Atrapamiento por maquinaria en Limpieza', fecha: '2025-10-20', usuarioId: 'u3', filaIPERId: 'fila-6' },
  { id: 'h-9', tipo: 'medida_creada', descripcion: 'Medida preventiva registrada: Guardas de seguridad para Atrapamiento', fecha: '2025-10-25', usuarioId: 'u3', filaIPERId: 'fila-6' },
  { id: 'h-10', tipo: 'verificacion', descripcion: 'Verificacion completada: Auditoria interna LOTO - Cumple', fecha: '2025-12-20', usuarioId: 'u4', filaIPERId: 'fila-5' },
]
