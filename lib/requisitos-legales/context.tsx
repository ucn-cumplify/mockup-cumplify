'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type {
  Decreto, UnidadControlRL, UsuarioRL,
  VinculacionNormativa, EvaluacionRL, ResultadoEvaluacion,
  HallazgoRL, ActividadRL,
} from './types'
import {
  mockDecretos, mockUnidadesControl, mockUsuariosRL,
  mockVinculaciones, mockEvaluaciones, mockResultados,
  mockHallazgos, mockActividades, ucUsuariosMap,
} from './mock-data'

type RLVista = 'dashboard' | 'identificacion' | 'evaluacion' | 'control' | 'historial'

interface RequisitosLegalesContextType {
  // Navigation
  vistaActual: RLVista
  setVistaActual: (v: RLVista) => void

  // Data
  decretos: Decreto[]
  unidadesControl: UnidadControlRL[]
  usuarios: UsuarioRL[]
  vinculaciones: VinculacionNormativa[]
  evaluaciones: EvaluacionRL[]
  resultados: ResultadoEvaluacion[]
  hallazgos: HallazgoRL[]
  actividades: ActividadRL[]

  // UC -> Users mapping
  ucUsuarios: Record<string, string[]>

  // Shortcuts
  shortcuts: string[]
  addShortcut: (vista: RLVista) => void
  removeShortcut: (vista: RLVista) => void

  // Actions - Vinculaciones
  addVinculacion: (v: VinculacionNormativa) => void
  addVinculaciones: (vs: VinculacionNormativa[]) => void  // bulk
  updateVinculacion: (id: string, data: Partial<VinculacionNormativa>) => void
  deleteVinculacion: (id: string) => void

  // Actions - Evaluaciones
  addEvaluacion: (e: EvaluacionRL) => void
  updateEvaluacion: (id: string, data: Partial<EvaluacionRL>) => void

  // Actions - Resultados
  addResultado: (r: ResultadoEvaluacion) => void

  // Actions - Hallazgos
  addHallazgo: (h: HallazgoRL) => void
  updateHallazgo: (id: string, data: Partial<HallazgoRL>) => void

  // Actions - Actividades
  addActividad: (a: ActividadRL) => void

  // Helpers
  getDecreto: (id: string) => Decreto | undefined
  getArticulo: (articuloId: string) => { decreto: Decreto; articulo: Decreto['articulos'][0] } | undefined
  getUnidadControl: (id: string) => UnidadControlRL | undefined
  getUsuario: (id: string) => UsuarioRL | undefined
  getVinculacion: (id: string) => VinculacionNormativa | undefined
  getVinculacionesByArticuloUC: (articuloId: string, ucId: string) => VinculacionNormativa | undefined
  getVinculacionesByUC: (ucId: string) => VinculacionNormativa[]
  getVinculacionesByArticulo: (articuloId: string) => VinculacionNormativa[]
  getResultadosByEvaluacion: (evaluacionId: string) => ResultadoEvaluacion[]
  getResultadosByVinculacion: (vinculacionId: string) => ResultadoEvaluacion[]
  getLastResultadoByVinculacion: (vinculacionId: string) => ResultadoEvaluacion | undefined
  getHallazgosByVinculacion: (vinculacionId: string) => HallazgoRL[]
  getHallazgosByEvaluacion: (evaluacionId: string) => HallazgoRL[]
  getActividadesByVinculacion: (vinculacionId: string) => ActividadRL[]
  getUsuariosByUC: (ucId: string) => UsuarioRL[]
  getVinculacionesForEvaluacion: (evaluacion: EvaluacionRL) => VinculacionNormativa[]
}

const RequisitosLegalesContext = createContext<RequisitosLegalesContextType | undefined>(undefined)

export function RequisitosLegalesProvider({ children }: { children: ReactNode }) {
  const [vistaActual, setVistaActual] = useState<RLVista>('dashboard')
  const [decretos] = useState<Decreto[]>(mockDecretos)
  const [unidadesControl] = useState<UnidadControlRL[]>(mockUnidadesControl)
  const [usuarios] = useState<UsuarioRL[]>(mockUsuariosRL)
  const [vinculaciones, setVinculaciones] = useState<VinculacionNormativa[]>(mockVinculaciones)
  const [evaluaciones, setEvaluaciones] = useState<EvaluacionRL[]>(mockEvaluaciones)
  const [resultados, setResultados] = useState<ResultadoEvaluacion[]>(mockResultados)
  const [hallazgos, setHallazgos] = useState<HallazgoRL[]>(mockHallazgos)
  const [actividades, setActividades] = useState<ActividadRL[]>(mockActividades)
  const [shortcuts, setShortcuts] = useState<string[]>(['dashboard'])

  // Shortcuts
  const addShortcut = useCallback((vista: RLVista) => {
    setShortcuts(prev => prev.includes(vista) ? prev : [...prev, vista])
  }, [])
  const removeShortcut = useCallback((vista: RLVista) => {
    setShortcuts(prev => prev.filter(s => s !== vista))
  }, [])

  // Vinculaciones
  const addVinculacion = useCallback((v: VinculacionNormativa) => {
    setVinculaciones(prev => [...prev, v])
  }, [])

  const addVinculaciones = useCallback((vs: VinculacionNormativa[]) => {
    setVinculaciones(prev => [...prev, ...vs])
  }, [])

  const updateVinculacion = useCallback((id: string, data: Partial<VinculacionNormativa>) => {
    setVinculaciones(prev => prev.map(v => v.id === id ? { ...v, ...data } : v))
  }, [])

  const deleteVinculacion = useCallback((id: string) => {
    setVinculaciones(prev => prev.filter(v => v.id !== id))
  }, [])

  // Evaluaciones
  const addEvaluacion = useCallback((e: EvaluacionRL) => {
    setEvaluaciones(prev => [...prev, e])
  }, [])

  const updateEvaluacion = useCallback((id: string, data: Partial<EvaluacionRL>) => {
    setEvaluaciones(prev => prev.map(e => e.id === id ? { ...e, ...data } : e))
  }, [])

  // Resultados
  const addResultado = useCallback((r: ResultadoEvaluacion) => {
    setResultados(prev => [...prev, r])
  }, [])

  // Hallazgos
  const addHallazgo = useCallback((h: HallazgoRL) => {
    setHallazgos(prev => [...prev, h])
  }, [])

  const updateHallazgo = useCallback((id: string, data: Partial<HallazgoRL>) => {
    setHallazgos(prev => prev.map(h => h.id === id ? { ...h, ...data } : h))
  }, [])

  // Actividades
  const addActividad = useCallback((a: ActividadRL) => {
    setActividades(prev => [...prev, a])
  }, [])

  // Helpers
  const getDecreto = useCallback((id: string) => decretos.find(d => d.id === id), [decretos])

  const getArticulo = useCallback((articuloId: string) => {
    for (const d of decretos) {
      const art = d.articulos.find(a => a.id === articuloId)
      if (art) return { decreto: d, articulo: art }
    }
    return undefined
  }, [decretos])

  const getUnidadControl = useCallback((id: string) => unidadesControl.find(u => u.id === id), [unidadesControl])
  const getUsuario = useCallback((id: string) => usuarios.find(u => u.id === id), [usuarios])
  const getVinculacion = useCallback((id: string) => vinculaciones.find(v => v.id === id), [vinculaciones])

  const getVinculacionesByArticuloUC = useCallback((articuloId: string, ucId: string) =>
    vinculaciones.find(v => v.articuloId === articuloId && v.unidadControlId === ucId)
  , [vinculaciones])

  const getVinculacionesByUC = useCallback((ucId: string) =>
    vinculaciones.filter(v => v.unidadControlId === ucId)
  , [vinculaciones])

  const getVinculacionesByArticulo = useCallback((articuloId: string) =>
    vinculaciones.filter(v => v.articuloId === articuloId)
  , [vinculaciones])

  const getResultadosByEvaluacion = useCallback((evaluacionId: string) =>
    resultados.filter(r => r.evaluacionId === evaluacionId)
      .sort((a, b) => new Date(b.fechaEvaluacion).getTime() - new Date(a.fechaEvaluacion).getTime())
  , [resultados])

  const getResultadosByVinculacion = useCallback((vinculacionId: string) =>
    resultados.filter(r => r.vinculacionId === vinculacionId)
      .sort((a, b) => new Date(b.fechaEvaluacion).getTime() - new Date(a.fechaEvaluacion).getTime())
  , [resultados])

  const getLastResultadoByVinculacion = useCallback((vinculacionId: string) => {
    const sorted = resultados
      .filter(r => r.vinculacionId === vinculacionId)
      .sort((a, b) => new Date(b.fechaEvaluacion).getTime() - new Date(a.fechaEvaluacion).getTime())
    return sorted[0]
  }, [resultados])

  const getHallazgosByVinculacion = useCallback((vinculacionId: string) =>
    hallazgos.filter(h => h.vinculacionId === vinculacionId), [hallazgos])

  const getHallazgosByEvaluacion = useCallback((evaluacionId: string) =>
    hallazgos.filter(h => h.evaluacionId === evaluacionId), [hallazgos])

  const getActividadesByVinculacion = useCallback((vinculacionId: string) =>
    actividades.filter(a => a.vinculacionId === vinculacionId).sort((a, b) =>
      new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
    ), [actividades])

  const getUsuariosByUC = useCallback((ucId: string) => {
    const userIds = ucUsuariosMap[ucId] || []
    return usuarios.filter(u => userIds.includes(u.id))
  }, [usuarios])

  const getVinculacionesForEvaluacion = useCallback((evaluacion: EvaluacionRL) => {
    return vinculaciones.filter(v => {
      // Filter by articulos if specified
      if (evaluacion.articuloIds.length > 0 && !evaluacion.articuloIds.includes(v.articuloId)) return false
      // Filter by UCs if specified
      if (evaluacion.unidadControlIds.length > 0 && !evaluacion.unidadControlIds.includes(v.unidadControlId)) return false
      // Only include active vinculaciones
      if (v.estado !== 'activo') return false
      return true
    })
  }, [vinculaciones])

  return (
    <RequisitosLegalesContext.Provider value={{
      vistaActual, setVistaActual,
      decretos, unidadesControl, usuarios,
      vinculaciones, evaluaciones, resultados, hallazgos, actividades,
      ucUsuarios: ucUsuariosMap,
      shortcuts, addShortcut, removeShortcut,
      addVinculacion, addVinculaciones, updateVinculacion, deleteVinculacion,
      addEvaluacion, updateEvaluacion,
      addResultado,
      addHallazgo, updateHallazgo,
      addActividad,
      getDecreto, getArticulo, getUnidadControl,
      getUsuario, getVinculacion,
      getVinculacionesByArticuloUC, getVinculacionesByUC, getVinculacionesByArticulo,
      getResultadosByEvaluacion, getResultadosByVinculacion, getLastResultadoByVinculacion,
      getHallazgosByVinculacion, getHallazgosByEvaluacion,
      getActividadesByVinculacion, getUsuariosByUC,
      getVinculacionesForEvaluacion,
    }}>
      {children}
    </RequisitosLegalesContext.Provider>
  )
}

export function useRequisitosLegales() {
  const ctx = useContext(RequisitosLegalesContext)
  if (!ctx) throw new Error('useRequisitosLegales must be used within RequisitosLegalesProvider')
  return ctx
}
