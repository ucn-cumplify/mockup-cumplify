'use client'

import React, { useState, useRef } from 'react'
import { usePlatform, categoryConfig } from '@/lib/platform-context'
import { useShortcuts } from '@/lib/shortcuts-context'
import { Button } from '@/components/ui/button'
import {
  X, GripVertical, PanelLeftClose, PanelLeft, Bookmark,
  Table2, Kanban, Calendar, LayoutDashboard, FileInput, Clock,
  Recycle, ShieldAlert, Activity, Leaf, Award,
  FileText, Users, FlaskConical, Scale, Settings,
} from 'lucide-react'
import type { ViewType } from '@/lib/platform-context'

const appIconMap: Record<string, React.ElementType> = {
  Recycle, ShieldAlert, Activity, Leaf, Award,
  FileText, Users, FlaskConical, Scale, Settings,
}

const viewIconMap: Record<ViewType, React.ElementType> = {
  table: Table2,
  kanban: Kanban,
  calendar: Calendar,
  dashboard: LayoutDashboard,
  form: FileInput,
  timeline: Clock,
}

export function HubShortcutsSidebar() {
  const { openApp } = usePlatform()
  const { shortcuts, removeShortcut, reorderShortcuts } = useShortcuts()
  const [collapsed, setCollapsed] = useState(false)
  const [dragIdx, setDragIdx] = useState<number | null>(null)
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null)
  const dragRef = useRef<number | null>(null)

  const handleDragStart = (idx: number) => {
    dragRef.current = idx
    setDragIdx(idx)
  }

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault()
    setDragOverIdx(idx)
  }

  const handleDrop = (idx: number) => {
    const from = dragRef.current
    if (from === null || from === idx) {
      setDragIdx(null)
      setDragOverIdx(null)
      return
    }
    reorderShortcuts(from, idx)
    setDragIdx(null)
    setDragOverIdx(null)
    dragRef.current = null
  }

  const handleDragEnd = () => {
    setDragIdx(null)
    setDragOverIdx(null)
    dragRef.current = null
  }

  const handleShortcutClick = (shortcut: { appId: string; viewId: string }) => {
    openApp(shortcut.appId, shortcut.viewId)
  }

  if (collapsed) {
    return (
      <div className="hidden lg:flex flex-col items-center py-4 px-2 border-l border-border bg-muted/30 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={() => setCollapsed(false)}
          aria-label="Expandir atajos"
        >
          <PanelLeft className="h-4 w-4" />
        </Button>
        <div className="mt-4 flex flex-col items-center gap-2">
          {shortcuts.slice(0, 8).map(s => {
            const Icon = appIconMap[s.appIcon] || Settings
            return (
              <button
                key={s.id}
                onClick={() => handleShortcutClick(s)}
                className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-accent transition-colors"
                style={{ color: s.appColor }}
                title={`${s.appName} | ${s.viewName}`}
              >
                <Icon className="h-4 w-4" />
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="hidden lg:flex flex-col w-64 border-l border-border bg-muted/30 shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Bookmark className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Atajos</span>
          {shortcuts.length > 0 && (
            <span className="text-[11px] text-muted-foreground bg-muted rounded-full px-1.5 py-0.5">{shortcuts.length}</span>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-foreground"
          onClick={() => setCollapsed(true)}
          aria-label="Colapsar atajos"
        >
          <PanelLeftClose className="h-4 w-4" />
        </Button>
      </div>

      {/* Shortcuts list */}
      <div className="flex-1 overflow-y-auto px-2 py-2">
        {shortcuts.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted mb-3">
              <Bookmark className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              No tienes atajos configurados aun. Marca una vista como atajo para verla aqui.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-1">
            {shortcuts.map((shortcut, idx) => {
              const AppIcon = appIconMap[shortcut.appIcon] || Settings
              const ViewIcon = viewIconMap[shortcut.viewType] || Table2
              const isDragging = dragIdx === idx
              const isDragOver = dragOverIdx === idx

              return (
                <li
                  key={shortcut.id}
                  draggable
                  onDragStart={() => handleDragStart(idx)}
                  onDragOver={(e) => handleDragOver(e, idx)}
                  onDrop={() => handleDrop(idx)}
                  onDragEnd={handleDragEnd}
                  className={`group flex items-center gap-2 rounded-lg px-2 py-2 cursor-pointer transition-all text-sm
                    ${isDragging ? 'opacity-40' : ''}
                    ${isDragOver ? 'bg-primary/10 border border-dashed border-primary/30' : 'hover:bg-accent border border-transparent'}
                  `}
                  onClick={() => handleShortcutClick(shortcut)}
                >
                  <span
                    className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground shrink-0"
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <GripVertical className="h-3.5 w-3.5" />
                  </span>
                  <div
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded"
                    style={{ backgroundColor: `${shortcut.appColor}15`, color: shortcut.appColor }}
                  >
                    <AppIcon className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 text-xs text-foreground truncate font-medium">
                      <span className="truncate">{shortcut.appName}</span>
                      <span className="text-muted-foreground">|</span>
                      <span className="truncate text-muted-foreground">{shortcut.viewName}</span>
                    </div>
                  </div>
                  <button
                    className="opacity-0 group-hover:opacity-100 shrink-0 text-muted-foreground hover:text-destructive transition-all"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeShortcut(shortcut.id)
                    }}
                    aria-label={`Eliminar atajo ${shortcut.appName} ${shortcut.viewName}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {/* Footer hint */}
      {shortcuts.length > 0 && (
        <div className="px-4 py-2 border-t border-border">
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Arrastra para reordenar
          </p>
        </div>
      )}
    </div>
  )
}
