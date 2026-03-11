'use client'

import React from 'react'
import { MatrizRiesgoProvider, useMatrizRiesgo } from '@/lib/matriz-riesgo/context'
import { MR_VISTA_LABELS, type MRVistaKey } from '@/lib/matriz-riesgo/types'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  ArrowLeft, LayoutDashboard, Search, ClipboardList, CheckSquare,
  Grid3x3, History, Settings2, ShieldAlert, Star, StarOff,
} from 'lucide-react'

// View components
import { DashboardViewMR } from './dashboard-view'
import { IdentificacionView } from './identificacion-view'
import { EvaluacionView } from './evaluacion-view'
import { VerificacionesView } from './verificaciones-view'
import { MatrizVisualView } from './matriz-visual-view'
import { HistorialViewMR } from './historial-view'
import { ParametrosView } from './parametros-view'

const vistaIcons: Record<MRVistaKey, React.ElementType> = {
  dashboard: LayoutDashboard,
  identificacion: Search,
  evaluacion: ClipboardList,
  verificaciones: CheckSquare,
  matriz: Grid3x3,
  historial: History,
  parametros: Settings2,
}

function MatrizRiesgoContent({ onBack }: { onBack: () => void }) {
  const { vistaActual, setVistaActual, shortcuts, addShortcut, removeShortcut } = useMatrizRiesgo()

  const vistas: MRVistaKey[] = ['dashboard', 'identificacion', 'evaluacion', 'verificaciones', 'matriz', 'historial', 'parametros']

  const isShortcut = shortcuts.includes(vistaActual)

  const handleToggleShortcut = () => {
    if (isShortcut) {
      removeShortcut(vistaActual)
      toast.success(`"${MR_VISTA_LABELS[vistaActual]}" removido de atajos`)
    } else {
      addShortcut(vistaActual)
      toast.success(`"${MR_VISTA_LABELS[vistaActual]}" agregado a atajos`)
    }
  }

  const renderView = () => {
    switch (vistaActual) {
      case 'dashboard': return <DashboardViewMR />
      case 'identificacion': return <IdentificacionView />
      case 'evaluacion': return <EvaluacionView />
      case 'verificaciones': return <VerificacionesView />
      case 'matriz': return <MatrizVisualView />
      case 'historial': return <HistorialViewMR />
      case 'parametros': return <ParametrosView />
      default: return <DashboardViewMR />
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onBack}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="h-5 w-px bg-border" />
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                <ShieldAlert className="h-4 w-4" />
              </div>
              <div>
                <h1 className="text-sm font-semibold text-foreground">Matriz de Riesgo</h1>
                <p className="text-xs text-muted-foreground">Identificacion de Peligros y Evaluacion de Riesgos (IPER)</p>
              </div>
            </div>

            {/* Shortcut button */}
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={handleToggleShortcut}>
              {isShortcut ? <StarOff className="h-3.5 w-3.5" /> : <Star className="h-3.5 w-3.5" />}
              {isShortcut ? 'Quitar de Atajos' : 'Agregar a Atajos'}
            </Button>
          </div>

          {/* Vista tabs */}
          <div className="mt-3 flex items-center gap-1 -mb-px overflow-x-auto">
            {vistas.map(vista => {
              const Icon = vistaIcons[vista]
              const isActive = vistaActual === vista
              return (
                <button
                  key={vista}
                  onClick={() => setVistaActual(vista)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap',
                    isActive
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {MR_VISTA_LABELS[vista]}
                </button>
              )
            })}
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 p-6">
        <div className="mx-auto max-w-7xl">
          {renderView()}
        </div>
      </div>
    </div>
  )
}

export function MatrizRiesgoApp({ onBack }: { onBack: () => void }) {
  return (
    <MatrizRiesgoProvider>
      <MatrizRiesgoContent onBack={onBack} />
    </MatrizRiesgoProvider>
  )
}
