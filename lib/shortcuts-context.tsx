'use client'

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import type { ViewType } from '@/lib/platform-context'

export interface Shortcut {
  id: string
  appId: string
  viewId: string
  appName: string
  viewName: string
  appIcon: string
  appColor: string
  viewType: ViewType
}

interface ShortcutsContextType {
  shortcuts: Shortcut[]
  addShortcut: (shortcut: Shortcut) => void
  removeShortcut: (id: string) => void
  isShortcut: (appId: string, viewId: string) => boolean
  reorderShortcuts: (fromIdx: number, toIdx: number) => void
}

const ShortcutsContext = createContext<ShortcutsContextType | undefined>(undefined)

const STORAGE_KEY = 'cumplify-shortcuts'

function loadShortcuts(): Shortcut[] | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as Shortcut[]
  } catch {
    // ignore
  }
  return null
}

function saveShortcuts(shortcuts: Shortcut[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(shortcuts))
  } catch {
    // ignore
  }
}

export function ShortcutsProvider({ children }: { children: ReactNode }) {
  const [shortcuts, setShortcuts] = useState<Shortcut[]>([])
  const [loaded, setLoaded] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    const stored = loadShortcuts()
    if (stored) {
      setShortcuts(stored)
    }
    setLoaded(true)
  }, [])

  // Persist to localStorage on change (only after initial load)
  useEffect(() => {
    if (loaded) {
      saveShortcuts(shortcuts)
    }
  }, [shortcuts, loaded])

  const addShortcut = useCallback((shortcut: Shortcut) => {
    setShortcuts(prev => {
      if (prev.some(s => s.id === shortcut.id)) return prev
      return [...prev, shortcut]
    })
  }, [])

  const removeShortcut = useCallback((id: string) => {
    setShortcuts(prev => prev.filter(s => s.id !== id))
  }, [])

  const isShortcut = useCallback((appId: string, viewId: string) => {
    return shortcuts.some(s => s.appId === appId && s.viewId === viewId)
  }, [shortcuts])

  const reorderShortcuts = useCallback((fromIdx: number, toIdx: number) => {
    setShortcuts(prev => {
      const next = [...prev]
      const [moved] = next.splice(fromIdx, 1)
      next.splice(toIdx, 0, moved)
      return next
    })
  }, [])

  return (
    <ShortcutsContext.Provider value={{ shortcuts, addShortcut, removeShortcut, isShortcut, reorderShortcuts }}>
      {children}
    </ShortcutsContext.Provider>
  )
}

export function useShortcuts() {
  const ctx = useContext(ShortcutsContext)
  if (!ctx) throw new Error('useShortcuts must be used within ShortcutsProvider')
  return ctx
}
