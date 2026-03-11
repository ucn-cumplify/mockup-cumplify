'use client'

import React, { useMemo } from 'react'
import { useMatrizRiesgo } from '@/lib/matriz-riesgo/context'
import { getNivelRiesgoLabel, getNivelRiesgoColor } from '@/lib/matriz-riesgo/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  AlertTriangle, CheckCircle2, ShieldAlert, Activity,
  Clock, Layers, ListTodo, Shield,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'

export function DashboardViewMR() {
  const {
    procesos, tareas, filasIPER, medidas, verificaciones, historial, parametros,
    getProceso, getTarea, getParametro, getUnidadControl,
    getMedidasByFila, getUsuario,
  } = useMatrizRiesgo()

  // --- Metrics ---
  const totalFilas = filasIPER.length
  const filasConVEP = filasIPER.filter(f => f.probabilidadId && f.consecuenciaId)
  const filasConMedida = filasIPER.filter(f => getMedidasByFila(f.id).length > 0)
  const verificados = filasIPER.filter(f => f.estadoVerificacion === 'verificado').length
  const pendientes = filasIPER.filter(f => f.estadoVerificacion === 'pendiente').length
  const riesgosCriticos = filasConVEP.filter(f => f.vepInicial >= 15).length
  const pctVerificado = totalFilas > 0 ? Math.round((verificados / totalFilas) * 100) : 0

  // --- Charts data ---

  // Riesgos por nivel
  const porNivel = useMemo(() => {
    const counts: Record<string, { count: number; fill: string }> = {}
    parametros.nivel_riesgo.forEach(nr => {
      counts[nr.nombre] = { count: 0, fill: `var(--${nr.color || 'muted'})` }
    })
    filasConVEP.forEach(f => {
      const label = getNivelRiesgoLabel(f.vepInicial, parametros.nivel_riesgo)
      if (counts[label]) counts[label].count++
    })
    return Object.entries(counts).map(([name, { count, fill }]) => ({ name, value: count, fill }))
  }, [filasConVEP, parametros.nivel_riesgo])

  // Riesgos por proceso
  const porProceso = useMemo(() => {
    const counts: Record<string, number> = {}
    filasIPER.forEach(f => {
      const proc = getProceso(f.procesoId)
      const name = proc?.nombre || 'Desconocido'
      counts[name] = (counts[name] || 0) + 1
    })
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [filasIPER, getProceso])

  // Estado verificacion pie
  const estadoVerificacion = useMemo(() => [
    { name: 'Verificado', value: verificados, fill: 'var(--success)' },
    { name: 'Pendiente', value: pendientes, fill: 'var(--muted-foreground)' },
  ], [verificados, pendientes])

  // Critical risks
  const criticalRisks = useMemo(() =>
    filasConVEP
      .sort((a, b) => b.vepInicial - a.vepInicial)
      .slice(0, 5)
  , [filasConVEP])

  // Recent activity
  const recentHistory = useMemo(() =>
    [...historial]
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
      .slice(0, 6)
  , [historial])

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Layers className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Procesos</div>
                <div className="text-2xl font-bold text-foreground">{procesos.length}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-2/10 text-chart-2">
                <ListTodo className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Tareas</div>
                <div className="text-2xl font-bold text-foreground">{tareas.length}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-5/10 text-chart-5">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Peligros</div>
                <div className="text-2xl font-bold text-foreground">{totalFilas}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Criticos</div>
                <div className="text-2xl font-bold text-foreground">{riesgosCriticos}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10 text-success">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Verificados</div>
                <div className="text-2xl font-bold text-foreground">{verificados}</div>
              </div>
            </div>
            <Progress value={pctVerificado} className="mt-3 h-1.5" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Medidas</div>
                <div className="text-2xl font-bold text-foreground">{medidas.length}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Riesgos por nivel */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Riesgos por Nivel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={porNivel} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
                  <XAxis type="number" tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fill: 'var(--foreground)' }} width={75} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px', color: 'var(--foreground)' }} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                    {porNivel.map((entry, idx) => (<Cell key={idx} fill={entry.fill} />))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Riesgos por proceso */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Peligros por Proceso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={porProceso} margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} />
                  <YAxis tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px', color: 'var(--foreground)' }} />
                  <Bar dataKey="value" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Verificacion state pie */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Estado de Verificacion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={estadoVerificacion} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={40} paddingAngle={3} strokeWidth={0}>
                    {estadoVerificacion.map((entry, idx) => (<Cell key={idx} fill={entry.fill} />))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px', color: 'var(--foreground)' }} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Riesgos criticos */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              Riesgos Criticos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {criticalRisks.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">Sin riesgos identificados</p>
              ) : criticalRisks.map(fila => {
                const peligro = getParametro('peligros', fila.peligroId)
                const proc = getProceso(fila.procesoId)
                const tarea = getTarea(fila.tareaId)
                const color = getNivelRiesgoColor(fila.vepInicial, parametros.nivel_riesgo)
                const colorClass = color === 'success' ? 'text-success' : color === 'warning' ? 'text-warning-foreground' : color === 'destructive' ? 'text-destructive' : 'text-chart-5'

                return (
                  <div key={fila.id} className="flex items-start gap-3 p-2 rounded-lg bg-muted/20">
                    <div className={`text-lg font-bold ${colorClass} min-w-[30px] text-center`}>{fila.vepInicial}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground">{peligro?.nombre}</p>
                      <p className="text-[10px] text-muted-foreground">{proc?.nombre} / {tarea?.nombre}</p>
                    </div>
                    <Badge variant="outline" className={`text-[10px] ${
                      color === 'destructive' ? 'bg-destructive/15 text-destructive border-destructive/30' : 'bg-chart-5/15 text-chart-5 border-chart-5/30'
                    }`}>
                      {getNivelRiesgoLabel(fila.vepInicial, parametros.nivel_riesgo)}
                    </Badge>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent activity */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Actividad Reciente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentHistory.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">Sin actividad</p>
              ) : recentHistory.map(h => {
                const usuario = getUsuario(h.usuarioId)
                return (
                  <div key={h.id} className="flex items-start gap-2">
                    <div className="mt-0.5 shrink-0">
                      {h.tipo === 'actividad_creada' && <Layers className="h-3 w-3 text-primary" />}
                      {h.tipo === 'tarea_creada' && <ListTodo className="h-3 w-3 text-chart-2" />}
                      {h.tipo === 'fila_creada' && <ShieldAlert className="h-3 w-3 text-chart-5" />}
                      {h.tipo === 'medida_creada' && <Shield className="h-3 w-3 text-success" />}
                      {h.tipo === 'verificacion' && <CheckCircle2 className="h-3 w-3 text-success" />}
                      {h.tipo === 'parametro_modificado' && <Clock className="h-3 w-3 text-muted-foreground" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-foreground truncate">{h.descripcion}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-muted-foreground">{usuario?.nombre}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(h.fecha).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
