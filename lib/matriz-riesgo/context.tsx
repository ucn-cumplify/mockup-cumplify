'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type {
  ParametroItem, ParametroCategoria,
  UnidadControlMR, UsuarioMR,
  ProcesoMR, TareaMR, FilaIPER, MedidaPreventiva,
  VerificacionRecord, HistorialMR,
} from './types'
import {
  mockParametros, mockUnidadesControlMR, mockUsuariosMR,
  mockProcesos, mockTareas, mockFilasIPER, mockMedidas,
  mockVerificaciones, mockHistorial,
} from './mock-data'

type MRVista = 'dashboard' | 'identificacion' | 'evaluacion' | 'verificaciones' | 'matriz' | 'historial' | 'parametros'

interface MatrizRiesgoContextType {
  // Navigation
  vistaActual: MRVista
  setVistaActual: (v: MRVista) => void

  // Data
  parametros: Record<ParametroCategoria, ParametroItem[]>
  unidadesControl: UnidadControlMR[]
  usuarios: UsuarioMR[]
  procesos: ProcesoMR[]
  tareas: TareaMR[]
  filasIPER: FilaIPER[]
  medidas: MedidaPreventiva[]
  verificaciones: VerificacionRecord[]
  historial: HistorialMR[]

  // Shortcuts
  shortcuts: string[]
  addShortcut: (vista: MRVista) => void
  removeShortcut: (vista: MRVista) => void

  // Actions - Parametros
  addParametro: (categoria: ParametroCategoria, item: ParametroItem) => void
  updateParametro: (categoria: ParametroCategoria, id: string, data: Partial<ParametroItem>) => void
  deleteParametro: (categoria: ParametroCategoria, id: string) => void

  // Actions - Procesos
  addProceso: (p: ProcesoMR) => void
  updateProceso: (id: string, data: Partial<ProcesoMR>) => void
  deleteProceso: (id: string) => void

  // Actions - Tareas
  addTarea: (t: TareaMR) => void
  updateTarea: (id: string, data: Partial<TareaMR>) => void
  deleteTarea: (id: string) => void

  // Actions - FilasIPER
  addFilaIPER: (f: FilaIPER) => void
  updateFilaIPER: (id: string, data: Partial<FilaIPER>) => void
  deleteFilaIPER: (id: string) => void

  // Actions - Medidas
  addMedida: (m: MedidaPreventiva) => void
  updateMedida: (id: string, data: Partial<MedidaPreventiva>) => void
  deleteMedida: (id: string) => void

  // Actions - Verificaciones
  addVerificacion: (v: VerificacionRecord) => void

  // Actions - Historial
  addHistorial: (h: HistorialMR) => void

  // Helpers
  getParametro: (categoria: ParametroCategoria, id: string) => ParametroItem | undefined
  getUnidadControl: (id: string) => UnidadControlMR | undefined
  getUsuario: (id: string) => UsuarioMR | undefined
  getProceso: (id: string) => ProcesoMR | undefined
  getTarea: (id: string) => TareaMR | undefined
  getTareasByProceso: (procesoId: string) => TareaMR[]
  getProcesosByUC: (ucId: string) => ProcesoMR[]
  getFilaIPER: (id: string) => FilaIPER | undefined
  getFilasByTarea: (tareaId: string) => FilaIPER[]
  getFilasByProceso: (procesoId: string) => FilaIPER[]
  getMedidasByFila: (filaId: string) => MedidaPreventiva[]
  getVerificacionesByVerificador: (verId: string) => VerificacionRecord[]
  getVerificacionesByFila: (filaId: string) => VerificacionRecord[]
  getLastVerificacion: (verId: string, filaId: string) => VerificacionRecord | undefined
}

const MatrizRiesgoContext = createContext<MatrizRiesgoContextType | undefined>(undefined)

export function MatrizRiesgoProvider({ children }: { children: ReactNode }) {
  const [vistaActual, setVistaActual] = useState<MRVista>('dashboard')
  const [parametros, setParametros] = useState<Record<ParametroCategoria, ParametroItem[]>>(mockParametros)
  const [unidadesControl] = useState<UnidadControlMR[]>(mockUnidadesControlMR)
  const [usuarios] = useState<UsuarioMR[]>(mockUsuariosMR)
  const [procesos, setProcesos] = useState<ProcesoMR[]>(mockProcesos)
  const [tareas, setTareas] = useState<TareaMR[]>(mockTareas)
  const [filasIPER, setFilasIPER] = useState<FilaIPER[]>(mockFilasIPER)
  const [medidas, setMedidas] = useState<MedidaPreventiva[]>(mockMedidas)
  const [verificaciones, setVerificaciones] = useState<VerificacionRecord[]>(mockVerificaciones)
  const [historial, setHistorial] = useState<HistorialMR[]>(mockHistorial)
  const [shortcuts, setShortcuts] = useState<string[]>(['dashboard'])

  // Shortcuts
  const addShortcut = useCallback((vista: MRVista) => {
    setShortcuts(prev => prev.includes(vista) ? prev : [...prev, vista])
  }, [])
  const removeShortcut = useCallback((vista: MRVista) => {
    setShortcuts(prev => prev.filter(s => s !== vista))
  }, [])

  // Parametros
  const addParametro = useCallback((categoria: ParametroCategoria, item: ParametroItem) => {
    setParametros(prev => ({ ...prev, [categoria]: [...prev[categoria], item] }))
  }, [])
  const updateParametro = useCallback((categoria: ParametroCategoria, id: string, data: Partial<ParametroItem>) => {
    setParametros(prev => ({ ...prev, [categoria]: prev[categoria].map(p => p.id === id ? { ...p, ...data } : p) }))
  }, [])
  const deleteParametro = useCallback((categoria: ParametroCategoria, id: string) => {
    setParametros(prev => ({ ...prev, [categoria]: prev[categoria].filter(p => p.id !== id) }))
  }, [])

  // Procesos
  const addProceso = useCallback((p: ProcesoMR) => { setProcesos(prev => [...prev, p]) }, [])
  const updateProceso = useCallback((id: string, data: Partial<ProcesoMR>) => {
    setProcesos(prev => prev.map(p => p.id === id ? { ...p, ...data } : p))
  }, [])
  const deleteProceso = useCallback((id: string) => { setProcesos(prev => prev.filter(p => p.id !== id)) }, [])

  // Tareas
  const addTarea = useCallback((t: TareaMR) => { setTareas(prev => [...prev, t]) }, [])
  const updateTarea = useCallback((id: string, data: Partial<TareaMR>) => {
    setTareas(prev => prev.map(t => t.id === id ? { ...t, ...data } : t))
  }, [])
  const deleteTarea = useCallback((id: string) => { setTareas(prev => prev.filter(t => t.id !== id)) }, [])

  // FilasIPER
  const addFilaIPER = useCallback((f: FilaIPER) => { setFilasIPER(prev => [...prev, f]) }, [])
  const updateFilaIPER = useCallback((id: string, data: Partial<FilaIPER>) => {
    setFilasIPER(prev => prev.map(f => f.id === id ? { ...f, ...data } : f))
  }, [])
  const deleteFilaIPER = useCallback((id: string) => { setFilasIPER(prev => prev.filter(f => f.id !== id)) }, [])

  // Medidas
  const addMedida = useCallback((m: MedidaPreventiva) => { setMedidas(prev => [...prev, m]) }, [])
  const updateMedida = useCallback((id: string, data: Partial<MedidaPreventiva>) => {
    setMedidas(prev => prev.map(m => m.id === id ? { ...m, ...data } : m))
  }, [])
  const deleteMedida = useCallback((id: string) => { setMedidas(prev => prev.filter(m => m.id !== id)) }, [])

  // Verificaciones
  const addVerificacion = useCallback((v: VerificacionRecord) => { setVerificaciones(prev => [...prev, v]) }, [])

  // Historial
  const addHistorial = useCallback((h: HistorialMR) => { setHistorial(prev => [...prev, h]) }, [])

  // Helpers
  const getParametro = useCallback((cat: ParametroCategoria, id: string) => parametros[cat]?.find(p => p.id === id), [parametros])
  const getUnidadControl = useCallback((id: string) => unidadesControl.find(u => u.id === id), [unidadesControl])
  const getUsuario = useCallback((id: string) => usuarios.find(u => u.id === id), [usuarios])
  const getProceso = useCallback((id: string) => procesos.find(p => p.id === id), [procesos])
  const getTarea = useCallback((id: string) => tareas.find(t => t.id === id), [tareas])
  const getTareasByProceso = useCallback((procesoId: string) => tareas.filter(t => t.procesoId === procesoId), [tareas])
  const getProcesosByUC = useCallback((ucId: string) => procesos.filter(p => p.unidadControlId === ucId), [procesos])
  const getFilaIPER = useCallback((id: string) => filasIPER.find(f => f.id === id), [filasIPER])
  const getFilasByTarea = useCallback((tareaId: string) => filasIPER.filter(f => f.tareaId === tareaId), [filasIPER])
  const getFilasByProceso = useCallback((procesoId: string) => filasIPER.filter(f => f.procesoId === procesoId), [filasIPER])
  const getMedidasByFila = useCallback((filaId: string) => medidas.filter(m => m.filaIPERId === filaId), [medidas])
  const getVerificacionesByVerificador = useCallback((verId: string) => verificaciones.filter(v => v.verificadorId === verId), [verificaciones])
  const getVerificacionesByFila = useCallback((filaId: string) => verificaciones.filter(v => v.filaIPERId === filaId), [verificaciones])
  const getLastVerificacion = useCallback((verId: string, filaId: string) => {
    const recs = verificaciones.filter(v => v.verificadorId === verId && v.filaIPERId === filaId)
    return recs.sort((a, b) => new Date(b.fechaVerificacion).getTime() - new Date(a.fechaVerificacion).getTime())[0]
  }, [verificaciones])

  return (
    <MatrizRiesgoContext.Provider value={{
      vistaActual, setVistaActual,
      parametros, unidadesControl, usuarios,
      procesos, tareas, filasIPER, medidas, verificaciones, historial,
      shortcuts, addShortcut, removeShortcut,
      addParametro, updateParametro, deleteParametro,
      addProceso, updateProceso, deleteProceso,
      addTarea, updateTarea, deleteTarea,
      addFilaIPER, updateFilaIPER, deleteFilaIPER,
      addMedida, updateMedida, deleteMedida,
      addVerificacion,
      addHistorial,
      getParametro, getUnidadControl, getUsuario,
      getProceso, getTarea, getTareasByProceso, getProcesosByUC,
      getFilaIPER, getFilasByTarea, getFilasByProceso, getMedidasByFila,
      getVerificacionesByVerificador, getVerificacionesByFila, getLastVerificacion,
    }}>
      {children}
    </MatrizRiesgoContext.Provider>
  )
}

export function useMatrizRiesgo() {
  const ctx = useContext(MatrizRiesgoContext)
  if (!ctx) throw new Error('useMatrizRiesgo must be used within MatrizRiesgoProvider')
  return ctx
}
