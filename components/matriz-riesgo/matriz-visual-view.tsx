'use client'

import React, { useMemo } from 'react'
import { useMatrizRiesgo } from '@/lib/matriz-riesgo/context'
import { getNivelRiesgoColor, getNivelRiesgoLabel } from '@/lib/matriz-riesgo/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Grid3x3 } from 'lucide-react'

export function MatrizVisualView() {
  const {
    parametros, filasIPER,
    getProceso, getTarea, getParametro,
  } = useMatrizRiesgo()

  // Get probability and consequence scales sorted by value
  const probScale = useMemo(() =>
    [...parametros.probabilidad].sort((a, b) => (a.valor || 0) - (b.valor || 0))
  , [parametros.probabilidad])

  const consScale = useMemo(() =>
    [...parametros.consecuencia].sort((a, b) => (a.valor || 0) - (b.valor || 0))
  , [parametros.consecuencia])

  // Map filas to their positions in the matrix
  const matrixData = useMemo(() => {
    const map: Record<string, typeof filasIPER> = {}
    filasIPER.forEach(fila => {
      if (fila.probabilidadId && fila.consecuenciaId) {
        const key = `${fila.probabilidadId}-${fila.consecuenciaId}`
        if (!map[key]) map[key] = []
        map[key].push(fila)
      }
    })
    return map
  }, [filasIPER])

  const gridSize = probScale.length
  const totalWithVEP = filasIPER.filter(f => f.probabilidadId && f.consecuenciaId).length

  // Nivel riesgo color map for cells
  const getCellColor = (probVal: number, consVal: number) => {
    const nivel = probVal * consVal
    const color = getNivelRiesgoColor(nivel, parametros.nivel_riesgo)
    const colorMap: Record<string, string> = {
      success: 'bg-success/20 border-success/30',
      warning: 'bg-warning/20 border-warning/30',
      'chart-5': 'bg-chart-5/20 border-chart-5/30',
      destructive: 'bg-destructive/20 border-destructive/30',
    }
    return colorMap[color] || 'bg-muted/30 border-border'
  }

  const getCellTextColor = (probVal: number, consVal: number) => {
    const nivel = probVal * consVal
    const color = getNivelRiesgoColor(nivel, parametros.nivel_riesgo)
    const colorMap: Record<string, string> = {
      success: 'text-success',
      warning: 'text-warning-foreground',
      'chart-5': 'text-chart-5',
      destructive: 'text-destructive',
    }
    return colorMap[color] || 'text-muted-foreground'
  }

  return (
    <div className="space-y-5">
      {/* Info */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Grid3x3 className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Dimension</div>
              <div className="text-2xl font-bold text-foreground">{gridSize}x{consScale.length}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">Riesgos Evaluados</div>
            <div className="text-2xl font-bold text-foreground mt-1">{totalWithVEP}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">Niveles de Riesgo</div>
            <div className="flex flex-wrap gap-1 mt-2">
              {parametros.nivel_riesgo.map(nr => {
                const colorMap: Record<string, string> = {
                  success: 'bg-success/15 text-success border-success/30',
                  warning: 'bg-warning/15 text-warning-foreground border-warning/30',
                  'chart-5': 'bg-chart-5/15 text-chart-5 border-chart-5/30',
                  destructive: 'bg-destructive/15 text-destructive border-destructive/30',
                }
                return (
                  <Badge key={nr.id} variant="outline" className={`text-[10px] ${colorMap[nr.color || ''] || ''}`}>
                    {nr.nombre} (1-{nr.valor})
                  </Badge>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Matrix */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Grid3x3 className="h-4 w-4 text-muted-foreground" />
            Matriz de Probabilidad x Consecuencia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TooltipProvider delayDuration={200}>
            <div className="overflow-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="p-2 text-xs font-medium text-muted-foreground text-center w-32">
                      P \ C
                    </th>
                    {consScale.map(cons => (
                      <th key={cons.id} className="p-2 text-xs font-medium text-foreground text-center min-w-[100px]">
                        <div>{cons.nombre}</div>
                        <div className="text-[10px] text-muted-foreground font-normal">({cons.valor})</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* Reverse probability so highest is at top */}
                  {[...probScale].reverse().map(prob => (
                    <tr key={prob.id}>
                      <td className="p-2 text-xs font-medium text-foreground text-right pr-4 border-r border-border">
                        <div>{prob.nombre}</div>
                        <div className="text-[10px] text-muted-foreground font-normal">({prob.valor})</div>
                      </td>
                      {consScale.map(cons => {
                        const key = `${prob.id}-${cons.id}`
                        const cellFilas = matrixData[key] || []
                        const nivel = (prob.valor || 0) * (cons.valor || 0)
                        const cellColor = getCellColor(prob.valor || 0, cons.valor || 0)
                        const textColor = getCellTextColor(prob.valor || 0, cons.valor || 0)

                        return (
                          <td key={cons.id} className={`p-1 border border-border ${cellColor} transition-colors`}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="min-h-[60px] flex flex-col items-center justify-center p-2 rounded-md cursor-default">
                                  <span className={`text-lg font-bold ${textColor}`}>{nivel}</span>
                                  {cellFilas.length > 0 && (
                                    <Badge variant="secondary" className="text-[10px] mt-1 h-5">
                                      {cellFilas.length} riesgo{cellFilas.length !== 1 ? 's' : ''}
                                    </Badge>
                                  )}
                                </div>
                              </TooltipTrigger>
                              {cellFilas.length > 0 && (
                                <TooltipContent side="right" className="max-w-xs p-3">
                                  <p className="text-xs font-semibold mb-2">
                                    {getNivelRiesgoLabel(nivel, parametros.nivel_riesgo)} ({nivel})
                                  </p>
                                  <div className="space-y-1.5">
                                    {cellFilas.map(fila => {
                                      const proc = getProceso(fila.procesoId)
                                      const tarea = getTarea(fila.tareaId)
                                      const pel = getParametro('peligros', fila.peligroId)
                                      return (
                                        <div key={fila.id} className="text-xs">
                                          <span className="text-destructive font-medium">{pel?.nombre}</span>
                                          <br />
                                          <span className="text-muted-foreground">{proc?.nombre} / {tarea?.nombre}</span>
                                        </div>
                                      )
                                    })}
                                  </div>
                                </TooltipContent>
                              )}
                            </Tooltip>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TooltipProvider>

          {/* Legend */}
          <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-border">
            {parametros.nivel_riesgo.map(nr => {
              const colorMap: Record<string, string> = {
                success: 'bg-success/30',
                warning: 'bg-warning/30',
                'chart-5': 'bg-chart-5/30',
                destructive: 'bg-destructive/30',
              }
              return (
                <div key={nr.id} className="flex items-center gap-1.5">
                  <div className={`h-3 w-3 rounded ${colorMap[nr.color || ''] || 'bg-muted'}`} />
                  <span className="text-xs text-foreground">{nr.nombre}</span>
                  <span className="text-[10px] text-muted-foreground">(1-{nr.valor})</span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
