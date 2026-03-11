'use client'

import React from 'react'
import { RequisitosLegalesProvider, useRequisitosLegales } from '@/lib/requisitos-legales/context'
import { VISTA_LABELS, type RLVistaKey } from '@/lib/requisitos-legales/types'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  ArrowLeft, LayoutDashboard, Search, ClipboardCheck,
  Shield, History, Scale, Star, StarOff,
} from 'lucide-react'

// Lazy-imported views
import { DashboardView } from './dashboard-view'
import { IdentificacionView } from './identificacion-view'
import { EvaluacionView } from './evaluacion-view'
import { ControlView } from './control-view'
import { HistorialView } from './historial-view'

const vistaIcons: Record<RLVistaKey, React.ElementType> = {
  dashboard: LayoutDashboard,
  identificacion: Search,
  evaluacion: ClipboardCheck,
  control: Shield,
  historial: History,
}

function RequisitosLegalesContent({ onBack }: { onBack: () => void }) {
  const { vistaActual, setVistaActual, shortcuts, addShortcut, removeShortcut } = useRequisitosLegales()

  const vistas: RLVistaKey[] = ['dashboard', 'identificacion', 'evaluacion', 'control', 'historial']

  const isShortcut = shortcuts.includes(vistaActual)

  const handleToggleShortcut = () => {
    if (isShortcut) {
      removeShortcut(vistaActual)
      toast.success(`"${VISTA_LABELS[vistaActual]}" removido de atajos`)
    } else {
      addShortcut(vistaActual)
      toast.success(`"${VISTA_LABELS[vistaActual]}" agregado a atajos`)
    }
  }

  const renderView = () => {
    switch (vistaActual) {
      case 'dashboard': return <DashboardView />
      case 'identificacion': return <IdentificacionView />
      case 'evaluacion': return <EvaluacionView />
      case 'control': return <ControlView />
      case 'historial': return <HistorialView />
      default: return <DashboardView />
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
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Scale className="h-4 w-4" />
              </div>
              <div>
                <h1 className="text-sm font-semibold text-foreground">Requisitos Legales</h1>
                <p className="text-xs text-muted-foreground">Gestion de cumplimiento normativo</p>
              </div>
            </div>

            {/* Shortcut button */}
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={handleToggleShortcut}>
              {isShortcut ? <StarOff className="h-3.5 w-3.5" /> : <Star className="h-3.5 w-3.5" />}
              {isShortcut ? 'Quitar de Atajos' : 'Agregar a Atajos'}
            </Button>
          </div>

          {/* Vista tabs */}
          <div className="mt-3 flex items-center gap-1 -mb-px">
            {vistas.map(vista => {
              const Icon = vistaIcons[vista]
              const isActive = vistaActual === vista
              return (
                <button
                  key={vista}
                  onClick={() => setVistaActual(vista)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors',
                    isActive
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {VISTA_LABELS[vista]}
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

export function RequisitosLegalesApp({ onBack }: { onBack: () => void }) {
  return (
    <RequisitosLegalesProvider>
      <RequisitosLegalesContent onBack={onBack} />
    </RequisitosLegalesProvider>
  )
}
