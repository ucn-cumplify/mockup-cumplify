'use client'

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { usePlatform } from '@/lib/platform-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  ArrowLeft, Building2, ChevronRight, ChevronDown,
  Plus, Pencil, Trash2, Users,
  Network, UserPlus, List, GitBranchPlus, X,
  Tag, Settings2, Search, PanelRightOpen, PanelRightClose,
  AlertTriangle, Link2, Crosshair, ArrowRightLeft, ZoomIn, ZoomOut,
  Move,
} from 'lucide-react'

// ---- Types ----

interface UnitType {
  id: string
  name: string
  color: string
}

interface Etiqueta {
  id: string
  name: string
  color: string
  associatedTypeId: string | null // null = custom tag, string = linked to a UnitType
}

interface Unidad {
  id: string
  name: string
  typeId: string
  description: string
  parentId: string | null
  children: Unidad[]
  etiquetaIds: string[]
  assignedUserIds: string[]
  /** Additional parent IDs for multi-parent units (primary parent stays in parentId) */
  multiParentIds?: string[]
}

interface UserData {
  id: string
  name: string
  email: string
  role: string
}

// ---- Helpers ----

let counter = 100
function generateId(prefix = 'id') {
  counter++
  return `${prefix}-${Date.now()}-${counter}`
}

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

function findNodeById(node: Unidad, id: string): Unidad | null {
  if (node.id === id) return node
  for (const child of node.children) {
    const found = findNodeById(child, id)
    if (found) return found
  }
  return null
}

function findParentNode(root: Unidad, childId: string): Unidad | null {
  for (const child of root.children) {
    if (child.id === childId) return root
    const found = findParentNode(child, childId)
    if (found) return found
  }
  return null
}

function addChildToNode(node: Unidad, parentId: string, child: Unidad): Unidad {
  if (node.id === parentId) return { ...node, children: [...node.children, child] }
  return { ...node, children: node.children.map(c => addChildToNode(c, parentId, child)) }
}

function updateNodeInTree(node: Unidad, nodeId: string, updates: Partial<Unidad>): Unidad {
  if (node.id === nodeId) return { ...node, ...updates }
  return { ...node, children: node.children.map(c => updateNodeInTree(c, nodeId, updates)) }
}

function removeNodeFromTree(node: Unidad, nodeId: string): Unidad {
  return { ...node, children: node.children.filter(c => c.id !== nodeId).map(c => removeNodeFromTree(c, nodeId)) }
}

function collectAllNodes(node: Unidad): Unidad[] {
  const nodes: Unidad[] = [node]
  for (const child of node.children) nodes.push(...collectAllNodes(child))
  return nodes
}

function collectAllIds(node: Unidad): string[] {
  return collectAllNodes(node).map(n => n.id)
}

function reassignChildrenToParent(root: Unidad, nodeId: string, newParentId: string): Unidad {
  const target = findNodeById(root, nodeId)
  if (!target) return root
  const children = target.children.map(c => ({ ...c, parentId: newParentId }))
  let updated = removeNodeFromTree(root, nodeId)
  for (const child of children) {
    updated = addChildToNode(updated, newParentId, child)
  }
  return updated
}

// ---- Multi-parent helpers ----

/** Registry of units that have multiple parents. Maps unit ID -> all parent IDs (including primary). */
interface MultiParentRegistry {
  [unitId: string]: string[]
}

function buildMultiParentRegistry(root: Unidad): MultiParentRegistry {
  const registry: MultiParentRegistry = {}
  function walk(node: Unidad) {
    if (node.multiParentIds && node.multiParentIds.length > 0 && node.parentId) {
      registry[node.id] = [node.parentId, ...node.multiParentIds]
    }
    for (const child of node.children) walk(child)
  }
  walk(root)
  return registry
}

/** Given a unit id & the root, find the full path from root to the unit */
function getPathToNode(root: Unidad, targetId: string, currentPath: string[] = []): string[] | null {
  const path = [...currentPath, root.name]
  if (root.id === targetId) return path
  for (const child of root.children) {
    const found = getPathToNode(child, targetId, path)
    if (found) return found
  }
  return null
}

/** Build a display tree that duplicates multi-parent units as references under secondary parents.
 * Returns a new tree where reference copies are marked. */
function buildDisplayTree(root: Unidad): Unidad & { _isReference?: boolean; _primaryParentId?: string } {
  const registry = buildMultiParentRegistry(root)

  // Collect all multi-parent units (full original nodes)
  const multiParentUnits: Map<string, Unidad> = new Map()
  function collectMultiParent(node: Unidad) {
    if (registry[node.id]) multiParentUnits.set(node.id, node)
    for (const child of node.children) collectMultiParent(child)
  }
  collectMultiParent(root)

  // Deep clone a node and mark all descendants as references
  function cloneAsReference(node: Unidad, primaryParentId: string): Unidad & { _isReference?: boolean; _primaryParentId?: string } {
    return {
      ...node,
      _isReference: true,
      _primaryParentId: primaryParentId,
      children: node.children.map(c => cloneAsReference(c, primaryParentId)),
    } as Unidad & { _isReference?: boolean; _primaryParentId?: string }
  }

  // Walk the tree and inject reference copies under secondary parents
  function injectReferences(node: Unidad): Unidad & { _isReference?: boolean; _primaryParentId?: string } {
    const processedChildren = node.children.map(c => injectReferences(c))

    // Check if any multi-parent unit lists this node as a secondary parent
    const additionalChildren: (Unidad & { _isReference?: boolean; _primaryParentId?: string })[] = []
    for (const [unitId, parentIds] of Object.entries(registry)) {
      const secondaryParents = parentIds.slice(1) // first is primary
      if (secondaryParents.includes(node.id)) {
        const original = multiParentUnits.get(unitId)
        if (original) {
          additionalChildren.push(cloneAsReference(original, parentIds[0]))
        }
      }
    }

    return {
      ...node,
      children: [...processedChildren, ...additionalChildren],
    } as Unidad & { _isReference?: boolean; _primaryParentId?: string }
  }

  return injectReferences(root)
}

// ---- Color palette ----

const TYPE_COLORS = [
  '#2563EB', '#059669', '#DC2626', '#7C3AED', '#EA580C',
  '#0891B2', '#D97706', '#E11D48', '#4F46E5', '#0D9488',
]

function getColorForIndex(i: number) {
  return TYPE_COLORS[i % TYPE_COLORS.length]
}

// ---- Initial Data ----

const initialTypes: UnitType[] = [
  { id: 'type-1', name: 'Empresa', color: '#2563EB' },
  { id: 'type-2', name: 'Agrupacion', color: '#059669' },
  { id: 'type-3', name: 'Operacion', color: '#DC2626' },
  { id: 'type-4', name: 'Area Administrativa', color: '#7C3AED' },
  { id: 'type-5', name: 'Area Operativa', color: '#EA580C' },
  { id: 'type-6', name: 'Proceso', color: '#0891B2' },
  { id: 'type-7', name: 'Subproceso', color: '#D97706' },
]

function createEtiquetasFromTypes(types: UnitType[]): Etiqueta[] {
  return types.map(t => ({
    id: `etq-auto-${t.id}`,
    name: normalizeText(t.name),
    color: t.color,
    associatedTypeId: t.id,
  }))
}

const initialEtiquetas: Etiqueta[] = [
  ...createEtiquetasFromTypes(initialTypes),
  { id: 'etq-custom-1', name: 'vehiculo', color: '#E11D48', associatedTypeId: null },
  { id: 'etq-custom-2', name: 'planta', color: '#4F46E5', associatedTypeId: null },
  { id: 'etq-custom-3', name: 'zona norte', color: '#0D9488', associatedTypeId: null },
]

const initialUsers: UserData[] = [
  { id: 'u-1', name: 'Carlos Mendoza', email: 'carlos@empresa.cl', role: 'Gerente' },
  { id: 'u-2', name: 'Maria Gonzalez', email: 'maria@empresa.cl', role: 'Jefa de Area' },
  { id: 'u-3', name: 'Juan Perez', email: 'juan@empresa.cl', role: 'Operador' },
  { id: 'u-4', name: 'Ana Silva', email: 'ana@empresa.cl', role: 'Analista' },
  { id: 'u-5', name: 'Pedro Torres', email: 'pedro@empresa.cl', role: 'Supervisor' },
]

function createInitialTree(): Unidad {
  return {
    id: 'root',
    name: 'Mi Empresa S.A.',
    typeId: 'type-1',
    description: 'Empresa principal',
    parentId: null,
    etiquetaIds: ['etq-auto-type-1'],
    assignedUserIds: ['u-1'],
    children: [
      // ---- Operacion Norte ----
      {
        id: 'op-norte',
        name: 'Operacion Norte',
        typeId: 'type-3',
        description: 'Operacion minera zona norte',
        parentId: 'root',
        etiquetaIds: ['etq-auto-type-3', 'etq-custom-3'],
        assignedUserIds: ['u-2'],
        children: [
          // Vehiculos - primary parent is Operacion Norte, also under Operacion Sur and Area Administrativa
          {
            id: 'vehiculos',
            name: 'Vehiculos',
            typeId: 'type-5',
            description: 'Flota de vehiculos compartida entre operaciones',
            parentId: 'op-norte',
            etiquetaIds: ['etq-auto-type-5', 'etq-custom-1'],
            assignedUserIds: ['u-3'],
            multiParentIds: ['op-sur', 'aa-corp'],
            children: [
              {
                id: 'camion-a',
                name: 'Camion A',
                typeId: 'type-6',
                description: 'Camion de carga pesada modelo CAT 797F',
                parentId: 'vehiculos',
                etiquetaIds: ['etq-auto-type-6', 'etq-custom-1'],
                assignedUserIds: ['u-5'],
                children: [],
              },
              {
                id: 'camion-b',
                name: 'Camion B',
                typeId: 'type-6',
                description: 'Camion de carga mediana modelo Komatsu HD785',
                parentId: 'vehiculos',
                etiquetaIds: ['etq-auto-type-6', 'etq-custom-1'],
                assignedUserIds: [],
                children: [],
              },
            ],
          },
          // Planta Antofagasta
          {
            id: 'planta-antof',
            name: 'Planta Antofagasta',
            typeId: 'type-3',
            description: 'Operacion minera Antofagasta',
            parentId: 'op-norte',
            etiquetaIds: ['etq-auto-type-3', 'etq-custom-2', 'etq-custom-3'],
            assignedUserIds: ['u-2'],
            children: [
              {
                id: 'aa-planta',
                name: 'Administracion Planta',
                typeId: 'type-4',
                description: 'Area administrativa de la planta',
                parentId: 'planta-antof',
                etiquetaIds: ['etq-auto-type-4'],
                assignedUserIds: ['u-4'],
                children: [],
              },
              {
                id: 'ao-prod',
                name: 'Produccion',
                typeId: 'type-5',
                description: 'Area de produccion principal',
                parentId: 'planta-antof',
                etiquetaIds: ['etq-auto-type-5'],
                assignedUserIds: ['u-3'],
                children: [
                  {
                    id: 'proc-fund',
                    name: 'Proceso de Fundicion',
                    typeId: 'type-6',
                    description: 'Proceso de fundicion de mineral',
                    parentId: 'ao-prod',
                    etiquetaIds: ['etq-auto-type-6'],
                    assignedUserIds: ['u-5'],
                    children: [
                      {
                        id: 'sub-carga',
                        name: 'Subproceso de Carga',
                        typeId: 'type-7',
                        description: 'Carga de material al horno',
                        parentId: 'proc-fund',
                        etiquetaIds: ['etq-auto-type-7'],
                        assignedUserIds: [],
                        children: [],
                      },
                    ],
                  },
                ],
              },
            ],
          },
          // Seguridad - primary under Op Norte, also under Op Sur
          {
            id: 'seguridad',
            name: 'Seguridad Industrial',
            typeId: 'type-5',
            description: 'Equipo de seguridad compartido entre operaciones norte y sur',
            parentId: 'op-norte',
            etiquetaIds: ['etq-auto-type-5'],
            assignedUserIds: ['u-5'],
            multiParentIds: ['op-sur'],
            children: [
              {
                id: 'seg-prev',
                name: 'Prevencion de Riesgos',
                typeId: 'type-6',
                description: 'Equipo de prevencion de riesgos laborales',
                parentId: 'seguridad',
                etiquetaIds: ['etq-auto-type-6'],
                assignedUserIds: ['u-5'],
                children: [],
              },
              {
                id: 'seg-emerg',
                name: 'Brigada de Emergencia',
                typeId: 'type-6',
                description: 'Equipo de respuesta ante emergencias',
                parentId: 'seguridad',
                etiquetaIds: ['etq-auto-type-6'],
                assignedUserIds: [],
                children: [],
              },
            ],
          },
        ],
      },
      // ---- Operacion Sur ----
      {
        id: 'op-sur',
        name: 'Operacion Sur',
        typeId: 'type-3',
        description: 'Operacion minera zona sur',
        parentId: 'root',
        etiquetaIds: ['etq-auto-type-3'],
        assignedUserIds: ['u-3'],
        children: [
          {
            id: 'planta-stgo',
            name: 'Planta Santiago',
            typeId: 'type-3',
            description: 'Operacion en Santiago',
            parentId: 'op-sur',
            etiquetaIds: ['etq-auto-type-3', 'etq-custom-2'],
            assignedUserIds: [],
            children: [],
          },
          // Laboratorio - primary under Op Sur, also under Op Norte and Area Administrativa
          {
            id: 'laboratorio',
            name: 'Laboratorio de Calidad',
            typeId: 'type-5',
            description: 'Laboratorio compartido entre operaciones y administracion',
            parentId: 'op-sur',
            etiquetaIds: ['etq-auto-type-5'],
            assignedUserIds: ['u-4'],
            multiParentIds: ['op-norte', 'aa-corp'],
            children: [
              {
                id: 'lab-quim',
                name: 'Analisis Quimico',
                typeId: 'type-6',
                description: 'Seccion de analisis quimico de muestras',
                parentId: 'laboratorio',
                etiquetaIds: ['etq-auto-type-6'],
                assignedUserIds: ['u-4'],
                children: [],
              },
              {
                id: 'lab-fis',
                name: 'Ensayos Fisicos',
                typeId: 'type-6',
                description: 'Seccion de ensayos fisicos y mecanicos',
                parentId: 'laboratorio',
                etiquetaIds: ['etq-auto-type-6'],
                assignedUserIds: [],
                children: [],
              },
            ],
          },
        ],
      },
      // ---- Area Administrativa ----
      {
        id: 'aa-corp',
        name: 'Area Administrativa',
        typeId: 'type-4',
        description: 'Area administrativa corporativa',
        parentId: 'root',
        etiquetaIds: ['etq-auto-type-4'],
        assignedUserIds: ['u-4'],
        children: [
          {
            id: 'ger-general',
            name: 'Gerencia General',
            typeId: 'type-4',
            description: 'Gerencia general de la empresa',
            parentId: 'aa-corp',
            etiquetaIds: ['etq-auto-type-4'],
            assignedUserIds: ['u-1'],
            children: [],
          },
          {
            id: 'rrhh',
            name: 'Recursos Humanos',
            typeId: 'type-4',
            description: 'Departamento de recursos humanos',
            parentId: 'aa-corp',
            etiquetaIds: ['etq-auto-type-4'],
            assignedUserIds: ['u-2'],
            children: [],
          },
        ],
      },
    ],
  }
}

// ---- Tree List Node (left sidebar) ----

function TreeListNode({
  node,
  level,
  selectedId,
  expandedIds,
  types,
  isReference = false,
  onSelect,
  onToggle,
  onAddChild,
  onEdit,
  onDelete,
  onOpenDetail,
}: {
  node: Unidad & { _isReference?: boolean; _primaryParentId?: string }
  level: number
  selectedId: string | null
  expandedIds: Set<string>
  types: UnitType[]
  isReference?: boolean
  onSelect: (id: string) => void
  onToggle: (id: string) => void
  onAddChild: (parentId: string) => void
  onEdit: (node: Unidad) => void
  onDelete: (node: Unidad) => void
  onOpenDetail: (node: Unidad, isRef: boolean) => void
}) {
  const nodeIsReference = isReference || !!(node as { _isReference?: boolean })._isReference
  const uniqueKey = nodeIsReference ? `ref-${node.id}-${level}` : node.id
  const isExpanded = expandedIds.has(uniqueKey) || expandedIds.has(node.id)
  const isSelected = !nodeIsReference && selectedId === node.id
  const hasChildren = node.children.length > 0
  const isRoot = node.parentId === null
  const unitType = types.find(t => t.id === node.typeId)

  return (
    <div>
      <div
        className={`group flex items-center gap-1 rounded-md px-2 py-1.5 cursor-pointer transition-colors
          ${isSelected ? 'bg-primary/10 text-foreground' : 'hover:bg-accent text-foreground'}
          ${nodeIsReference ? 'opacity-55' : ''}`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={() => {
          if (nodeIsReference) {
            onOpenDetail(node, true)
          } else {
            onSelect(node.id)
            if (hasChildren && !isExpanded) onToggle(uniqueKey)
          }
        }}
      >
        <button
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded hover:text-foreground ${nodeIsReference ? 'text-muted-foreground/60' : 'text-muted-foreground'}`}
          onClick={(e) => { e.stopPropagation(); if (hasChildren) onToggle(uniqueKey) }}
        >
          {hasChildren ? (
            isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />
          ) : (
            <span className="h-3.5 w-3.5" />
          )}
        </button>

        {unitType && (
          <span
            className={`text-[10px] px-1.5 py-0 rounded font-medium shrink-0 ${nodeIsReference ? 'grayscale' : ''}`}
            style={{
              backgroundColor: nodeIsReference ? 'var(--muted)' : unitType.color + '20',
              color: nodeIsReference ? 'var(--muted-foreground)' : unitType.color,
            }}
          >
            {unitType.name.substring(0, 3).toUpperCase()}
          </span>
        )}

        <span className={`text-sm truncate flex-1 font-medium ${nodeIsReference ? 'text-muted-foreground' : ''}`}>{node.name}</span>

        {nodeIsReference && (
          <Badge variant="outline" className="text-[9px] h-4 px-1.5 shrink-0 border-muted-foreground/30 text-muted-foreground bg-muted/50">
            Ubi. secundaria
          </Badge>
        )}

        {!nodeIsReference && (
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <Button variant="ghost" size="icon" className="h-6 w-6"
              onClick={(e) => { e.stopPropagation(); onAddChild(node.id) }} title="Agregar hijo">
              <Plus className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6"
              onClick={(e) => { e.stopPropagation(); onEdit(node) }} title="Editar">
              <Pencil className="h-3 w-3" />
            </Button>
            {!isRoot && (
              <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive"
                onClick={(e) => { e.stopPropagation(); onDelete(node) }} title="Eliminar">
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        )}
      </div>

      {isExpanded && hasChildren && (
        <div>
          {node.children.map((child, idx) => {
            const childIsRef = nodeIsReference || !!(child as { _isReference?: boolean })._isReference
            return (
              <TreeListNode key={childIsRef ? `ref-${child.id}-${level}-${idx}` : child.id} node={child} level={level + 1}
                selectedId={selectedId} expandedIds={expandedIds} types={types}
                isReference={nodeIsReference}
                onSelect={onSelect} onToggle={onToggle}
                onAddChild={onAddChild} onEdit={onEdit} onDelete={onDelete}
                onOpenDetail={onOpenDetail} />
            )
          })}
        </div>
      )}
    </div>
  )
}

// ---- Org Tree Card Node (visual tree) ----

function OrgTreeCardNode({
  node,
  types,
  users,
  isReference = false,
  onNodeClick,
}: {
  node: Unidad & { _isReference?: boolean; _primaryParentId?: string }
  types: UnitType[]
  users: UserData[]
  isReference?: boolean
  onNodeClick: (node: Unidad, isRef: boolean) => void
}) {
  const [expanded, setExpanded] = useState(true)
  const nodeIsReference = isReference || !!node._isReference
  const hasChildren = node.children.length > 0
  const unitType = types.find(t => t.id === node.typeId)
  const assignedUsers = users.filter(u => node.assignedUserIds.includes(u.id))

  return (
    <div className="flex flex-col items-center">
      <div
        className={`cursor-pointer rounded-lg border shadow-sm hover:shadow-md transition-shadow w-52 p-3
          ${nodeIsReference ? 'border-dashed border-muted-foreground/30 bg-muted/40 opacity-60' : 'border-border bg-card'}`}
        onClick={() => onNodeClick(node, nodeIsReference)}
      >
        <div className="flex items-center gap-2 mb-1.5">
          {unitType && (
            <span
              className={`text-[9px] px-1.5 py-0 rounded font-medium shrink-0 ${nodeIsReference ? 'grayscale' : ''}`}
              style={{
                backgroundColor: nodeIsReference ? 'var(--muted)' : unitType.color + '20',
                color: nodeIsReference ? 'var(--muted-foreground)' : unitType.color,
              }}
            >
              {unitType.name.substring(0, 3).toUpperCase()}
            </span>
          )}
          {nodeIsReference && (
            <Badge variant="outline" className="text-[8px] h-3.5 px-1 shrink-0 border-muted-foreground/30 text-muted-foreground bg-muted/50">
              Ubi. sec.
            </Badge>
          )}
          {hasChildren && (
            <button
              className="ml-auto h-5 w-5 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-accent"
              onClick={(e) => { e.stopPropagation(); setExpanded(!expanded) }}
            >
              {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            </button>
          )}
        </div>
        <p className={`text-sm font-semibold truncate leading-tight ${nodeIsReference ? 'text-muted-foreground' : 'text-foreground'}`}>{node.name}</p>
        <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-0.5"><Users className="h-2.5 w-2.5" />{assignedUsers.length}</span>
          <span className="flex items-center gap-0.5">{node.children.length} hijo{node.children.length !== 1 ? 's' : ''}</span>
        </div>
        {assignedUsers.length > 0 && !nodeIsReference && (
          <div className="flex -space-x-1.5 mt-2">
            {assignedUsers.slice(0, 4).map(u => (
              <Avatar key={u.id} className="h-5 w-5 border border-card">
                <AvatarFallback className="text-[8px] bg-primary/10 text-primary font-semibold">
                  {u.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            ))}
            {assignedUsers.length > 4 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[8px] font-medium text-muted-foreground border border-card">
                +{assignedUsers.length - 4}
              </span>
            )}
          </div>
        )}
      </div>

      {hasChildren && expanded && (
        <div className="flex flex-col items-center mt-0">
          <div className="w-px h-5 bg-border" />
          <div className="flex items-start gap-6 relative">
            {node.children.length > 1 && (
              <div className="absolute top-0 h-px bg-border"
                style={{
                  left: `calc(50% - ${(node.children.length - 1) * 50}% + 26px)`,
                  right: `calc(50% - ${(node.children.length - 1) * 50}% + 26px)`,
                  width: `calc(100% - 52px - ${(node.children.length - 1) * 24}px + ${(node.children.length - 1) * 24}px)`,
                }}
              />
            )}
            {node.children.map((child, idx) => {
              const childIsRef = nodeIsReference || !!(child as { _isReference?: boolean })._isReference
              return (
                <div key={childIsRef ? `ref-${child.id}-${idx}` : child.id} className="flex flex-col items-center">
                  <div className={`w-px h-5 ${childIsRef ? 'border-l border-dashed border-muted-foreground/30' : 'bg-border'}`} />
                  <OrgTreeCardNode node={child} types={types} users={users}
                    isReference={nodeIsReference} onNodeClick={onNodeClick} />
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ---- Detail Panel ----

function UnitDetailPanel({
  node,
  types,
  etiquetas,
  users,
  root,
  showHeader,
  isReference = false,
  onEdit,
  onDelete,
  onAddChild,
  onAssignUser,
  onUnassignUser,
  onChangePrimary,
}: {
  node: Unidad
  types: UnitType[]
  etiquetas: Etiqueta[]
  users: UserData[]
  root: Unidad
  showHeader?: boolean
  isReference?: boolean
  onEdit: () => void
  onDelete: () => void
  onAddChild: () => void
  onAssignUser: () => void
  onUnassignUser: (userId: string) => void
  onChangePrimary?: (nodeId: string, newPrimaryParentId: string) => void
}) {
  const [changingPrimary, setChangingPrimary] = useState(false)
  const unitType = types.find(t => t.id === node.typeId)
  const unitEtiquetas = etiquetas.filter(e => node.etiquetaIds.includes(e.id))
  const assignedUsers = users.filter(u => node.assignedUserIds.includes(u.id))
  const parentNode = node.parentId ? findNodeById(root, node.parentId) : null
  const isRoot = node.parentId === null

  // Multi-parent info
  const allParentIds = node.parentId
    ? [node.parentId, ...(node.multiParentIds || [])]
    : (node.multiParentIds || [])
  const hasMultipleParents = allParentIds.length > 1
  const primaryPath = node.parentId ? getPathToNode(root, node.parentId) : null

  return (
    <div className="space-y-6">
      {/* Reference warning banner */}
      {isReference && (
        <Alert className="border-amber-500/30 bg-amber-50 dark:bg-amber-950/20">
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertDescription className="text-amber-800 dark:text-amber-200 text-sm">
            Esta es una referencia. Unidad principal ubicada en:{' '}
            <span className="font-semibold">{primaryPath ? primaryPath.join(' > ') : 'Raiz'} {'>'} {node.name}</span>
          </AlertDescription>
        </Alert>
      )}

      {showHeader !== false && (
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              {unitType && (
                <Badge
                  className="text-xs border-0"
                  style={{ backgroundColor: unitType.color + '20', color: unitType.color }}
                >
                  {unitType.name}
                </Badge>
              )}
              {isReference && (
                <Badge variant="outline" className="text-[10px] border-muted-foreground/30 text-muted-foreground bg-muted/50">
                  Referencia
                </Badge>
              )}
              <h2 className="text-xl font-semibold text-foreground truncate">{node.name}</h2>
            </div>
            {node.description && (
              <p className="text-sm text-muted-foreground leading-relaxed">{node.description}</p>
            )}
          </div>
          {!isReference && (
            <div className="flex items-center gap-1.5 shrink-0">
              <Button size="sm" variant="outline" onClick={onEdit}>
                <Pencil className="mr-1.5 h-3.5 w-3.5" />
                Editar
              </Button>
              <Button size="sm" variant="outline" onClick={onAddChild}>
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Agregar hija
              </Button>
              {!isRoot && (
                <Button size="sm" variant="outline" className="text-destructive hover:text-destructive" onClick={onDelete}>
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                  Eliminar
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Informacion General */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            Informacion general
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Nombre</span>
              <p className="font-medium text-foreground mt-1">{node.name}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Tipo de unidad</span>
              <div className="mt-1">
                {unitType ? (
                  <Badge className="text-xs border-0" style={{ backgroundColor: unitType.color + '20', color: unitType.color }}>
                    {unitType.name}
                  </Badge>
                ) : (
                  <span className="text-muted-foreground">Sin tipo</span>
                )}
              </div>
            </div>
            <div className="col-span-2">
              <span className="text-muted-foreground">Descripcion</span>
              <p className="font-medium text-foreground mt-1">{node.description || 'Sin descripcion'}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Etiquetas</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {unitEtiquetas.length > 0 ? unitEtiquetas.map(e => (
                  <Badge key={e.id} variant="outline" className="text-[10px]" style={{ borderColor: e.color + '60', color: e.color, backgroundColor: e.color + '10' }}>
                    {e.name}
                  </Badge>
                )) : (
                  <span className="text-xs text-muted-foreground">Sin etiquetas</span>
                )}
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Unidad padre</span>
              <p className="font-medium text-foreground mt-1">{parentNode?.name || 'Ninguna (raiz)'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ubicaciones (Padres) - only shown if unit has multiple parents */}
      {hasMultipleParents && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Link2 className="h-4 w-4 text-muted-foreground" />
                Ubicaciones (Padres)
                <Badge variant="secondary" className="text-[10px] ml-1">{allParentIds.length}</Badge>
              </CardTitle>
              {!isReference && onChangePrimary && (
                <Button size="sm" variant="outline" className="h-7 text-xs"
                  onClick={() => setChangingPrimary(!changingPrimary)}>
                  <ArrowRightLeft className="mr-1 h-3 w-3" />
                  {changingPrimary ? 'Cancelar' : 'Cambiar ubicacion principal'}
                </Button>
              )}
            </div>
            {changingPrimary && (
              <p className="text-xs text-muted-foreground mt-2">Haz click en una ubicacion secundaria para convertirla en principal.</p>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {allParentIds.map((pid, idx) => {
                const parentPath = getPathToNode(root, pid)
                const pNode = findNodeById(root, pid)
                const isPrimary = idx === 0
                const canClick = changingPrimary && !isPrimary && !isReference && onChangePrimary
                return (
                  <div key={pid}
                    className={`flex items-center gap-3 rounded-lg border p-3 transition-colors
                      ${isPrimary ? 'border-primary/30 bg-primary/5' : 'border-border'}
                      ${canClick ? 'cursor-pointer hover:border-primary/50 hover:bg-primary/5' : ''}`}
                    onClick={() => {
                      if (canClick && onChangePrimary) {
                        onChangePrimary(node.id, pid)
                        setChangingPrimary(false)
                      }
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground">{pNode?.name || 'Desconocido'}</p>
                        {isPrimary && (
                          <Badge className="text-[9px] h-4 bg-primary/10 text-primary border-0">Principal</Badge>
                        )}
                        {!isPrimary && (
                          <Badge variant="outline" className="text-[9px] h-4 border-muted-foreground/30 text-muted-foreground">Secundario</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {parentPath ? parentPath.join(' > ') : 'Raiz'}
                      </p>
                    </div>
                    {canClick && (
                      <Badge variant="outline" className="text-[9px] shrink-0 border-primary/40 text-primary">
                        Hacer principal
                      </Badge>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Usuarios asignados */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              Usuarios asignados
              <Badge variant="secondary" className="text-[10px] ml-1">{assignedUsers.length}</Badge>
            </CardTitle>
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={onAssignUser}>
              <UserPlus className="mr-1 h-3 w-3" />
              Agregar usuarios
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {assignedUsers.length === 0 ? (
            <div className="rounded-lg border-2 border-dashed border-border p-6 text-center">
              <Users className="mx-auto h-7 w-7 text-muted-foreground" />
              <p className="mt-2 text-sm font-medium text-foreground">Sin usuarios asignados</p>
              <p className="text-xs text-muted-foreground mt-1">Asigna usuarios a esta unidad.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {assignedUsers.map(u => (
                <div key={u.id} className="flex items-center gap-3 rounded-lg border border-border p-3 hover:bg-accent/30 transition-colors">
                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarFallback className="text-sm bg-primary/10 text-primary font-semibold">
                      {getInitials(u.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{u.name}</p>
                    <p className="text-xs text-muted-foreground">{u.email} - {u.role}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive shrink-0"
                    title="Quitar de la unidad" onClick={() => onUnassignUser(u.id)}>
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Unidades hijas */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Network className="h-4 w-4 text-muted-foreground" />
              Unidades de control hijas
              <Badge variant="secondary" className="text-[10px] ml-1">{node.children.length}</Badge>
            </CardTitle>
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={onAddChild}>
              <Plus className="mr-1 h-3 w-3" />
              Agregar unidad hija
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {node.children.length === 0 ? (
            <div className="rounded-lg border-2 border-dashed border-border p-6 text-center">
              <Network className="mx-auto h-7 w-7 text-muted-foreground" />
              <p className="mt-2 text-sm font-medium text-foreground">Sin unidades hijas</p>
              <p className="text-xs text-muted-foreground mt-1">Agrega unidades hijas a esta unidad.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {node.children.map(child => {
                const childType = types.find(t => t.id === child.typeId)
                const childUsers = users.filter(u => child.assignedUserIds.includes(u.id))
                return (
                  <div key={child.id} className="rounded-lg border border-border p-4 hover:bg-accent/30 transition-colors">
                    <div className="flex items-center gap-2">
                      {childType && (
                        <Badge className="text-[10px] border-0" style={{ backgroundColor: childType.color + '20', color: childType.color }}>
                          {childType.name}
                        </Badge>
                      )}
                      <h4 className="text-sm font-semibold text-foreground">{child.name}</h4>
                    </div>
                    {child.description && (
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{child.description}</p>
                    )}
                    {childUsers.length > 0 && (
                      <div className="flex -space-x-1.5 mt-2">
                        {childUsers.slice(0, 4).map(u => (
                          <Avatar key={u.id} className="h-5 w-5 border border-background">
                            <AvatarFallback className="text-[8px] bg-primary/10 text-primary font-semibold">
                              {u.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                        {childUsers.length > 4 && (
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[8px] font-medium text-muted-foreground border border-background">
                            +{childUsers.length - 4}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ---- Right Sidebar: Units grouped by Tag ----

function TagSidebar({
  etiquetas,
  allNodes,
  types,
  onUnitClick,
}: {
  etiquetas: Etiqueta[]
  allNodes: Unidad[]
  types: UnitType[]
  onUnitClick: (node: Unidad) => void
}) {
  const [search, setSearch] = useState('')
  const [expandedTags, setExpandedTags] = useState<Set<string>>(new Set())

  const toggleTag = (tagId: string) => {
    setExpandedTags(prev => {
      const next = new Set(prev)
      if (next.has(tagId)) next.delete(tagId)
      else next.add(tagId)
      return next
    })
  }

  const grouped = useMemo(() => {
    const lowerSearch = search.toLowerCase()
    return etiquetas.map(etq => {
      const units = allNodes.filter(n => {
        if (!n.etiquetaIds.includes(etq.id)) return false
        if (lowerSearch && !n.name.toLowerCase().includes(lowerSearch)) return false
        return true
      })
      return { etiqueta: etq, units }
    })
  }, [etiquetas, allNodes, search])

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-border">
        <div className="flex items-center gap-2 mb-2">
          <Tag className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">Unidades de control por etiqueta</h3>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar unidades..."
            className="h-8 text-xs pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-0.5">
          {grouped.map(({ etiqueta, units }) => {
            const isExpanded = expandedTags.has(etiqueta.id)
            const isEmpty = units.length === 0
            return (
              <div key={etiqueta.id}>
                <button
                  className={`w-full flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm transition-colors
                    ${isEmpty ? 'text-muted-foreground/50' : 'text-foreground hover:bg-accent'}`}
                  onClick={() => toggleTag(etiqueta.id)}
                >
                  {isExpanded ? <ChevronDown className="h-3 w-3 shrink-0" /> : <ChevronRight className="h-3 w-3 shrink-0" />}
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: isEmpty ? etiqueta.color + '40' : etiqueta.color }}
                  />
                  <span className={`text-xs font-medium truncate flex-1 text-left ${isEmpty ? 'opacity-50' : ''}`}>
                    {etiqueta.name}
                  </span>
                  <span className={`text-[10px] font-medium ${isEmpty ? 'opacity-40' : 'text-muted-foreground'}`}>
                    ({units.length})
                  </span>
                </button>
                {isExpanded && units.length > 0 && (
                  <div className="ml-4 pl-3 border-l border-border/50 space-y-0.5 mt-0.5 mb-1">
                    {units.map(unit => {
                      const ut = types.find(t => t.id === unit.typeId)
                      return (
                        <button
                          key={unit.id}
                          className="w-full flex items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-accent transition-colors"
                          onClick={() => onUnitClick(unit)}
                        >
                          {ut && (
                            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: ut.color }} />
                          )}
                          <span className="text-xs text-foreground truncate">{unit.name}</span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}

// ---- Infinite Canvas Tree ----

function InfiniteCanvasTree({
  displayTree,
  unitTypes,
  allUsers,
  onNodeClick,
}: {
  displayTree: Unidad & { _isReference?: boolean; _primaryParentId?: string }
  unitTypes: UnitType[]
  allUsers: UserData[]
  onNodeClick: (node: Unidad, isRef: boolean) => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.85)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const dragStartRef = useRef({ x: 0, y: 0 })
  const posStartRef = useRef({ x: 0, y: 0 })

  // Center the tree on mount
  useEffect(() => {
    if (containerRef.current && contentRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect()
      const contentRect = contentRef.current.getBoundingClientRect()
      const scaledWidth = contentRect.width
      const x = (containerRect.width - scaledWidth) / 2
      setPosition({ x: Math.max(0, x), y: 40 })
    }
  }, [])

  const handleCenter = useCallback(() => {
    if (containerRef.current && contentRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect()
      const contentRect = contentRef.current.getBoundingClientRect()
      const actualWidth = contentRect.width / scale
      const actualHeight = contentRect.height / scale
      const newScale = Math.min(
        containerRect.width / (actualWidth + 80),
        containerRect.height / (actualHeight + 80),
        1
      )
      const scaledWidth = actualWidth * newScale
      const x = (containerRect.width - scaledWidth) / 2
      setScale(Math.max(0.2, newScale))
      setPosition({ x: Math.max(0, x), y: 40 })
    }
  }, [scale])

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault()
      const delta = e.deltaY > 0 ? -0.05 : 0.05
      setScale(prev => Math.min(1.5, Math.max(0.15, prev + delta)))
    } else {
      setPosition(prev => ({
        x: prev.x - e.deltaX,
        y: prev.y - e.deltaY,
      }))
    }
  }, [])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Only pan on middle-click or when clicking empty space
    if (e.button === 1 || (e.button === 0 && (e.target as HTMLElement).closest('[data-canvas-bg]'))) {
      e.preventDefault()
      setIsDragging(true)
      dragStartRef.current = { x: e.clientX, y: e.clientY }
      posStartRef.current = { ...position }
    }
  }, [position])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return
    const dx = e.clientX - dragStartRef.current.x
    const dy = e.clientY - dragStartRef.current.y
    setPosition({
      x: posStartRef.current.x + dx,
      y: posStartRef.current.y + dy,
    })
  }, [isDragging])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const zoomIn = useCallback(() => setScale(prev => Math.min(1.5, prev + 0.15)), [])
  const zoomOut = useCallback(() => setScale(prev => Math.max(0.15, prev - 0.15)), [])

  return (
    <div className="flex-1 relative overflow-hidden bg-muted/30" data-canvas-bg>
      {/* Canvas */}
      <div
        ref={containerRef}
        className={`w-full h-full overflow-hidden ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        data-canvas-bg
      >
        {/* Dot pattern background */}
        <div className="absolute inset-0 pointer-events-none" data-canvas-bg
          style={{
            backgroundImage: 'radial-gradient(circle, hsl(var(--border)) 1px, transparent 1px)',
            backgroundSize: `${24 * scale}px ${24 * scale}px`,
            backgroundPosition: `${position.x % (24 * scale)}px ${position.y % (24 * scale)}px`,
          }}
        />

        <div
          ref={contentRef}
          className="origin-top-left will-change-transform"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          }}
        >
          <div className="inline-flex p-8" data-canvas-bg>
            <OrgTreeCardNode
              node={displayTree}
              types={unitTypes}
              users={allUsers}
              onNodeClick={onNodeClick}
            />
          </div>
        </div>
      </div>

      {/* Floating controls */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-lg border border-border bg-background/95 backdrop-blur-sm shadow-lg px-2 py-1.5">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={zoomOut} title="Alejar">
          <ZoomOut className="h-3.5 w-3.5" />
        </Button>
        <span className="text-xs font-medium text-muted-foreground w-12 text-center select-none">
          {Math.round(scale * 100)}%
        </span>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={zoomIn} title="Acercar">
          <ZoomIn className="h-3.5 w-3.5" />
        </Button>
        <div className="w-px h-4 bg-border mx-1" />
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCenter} title="Centrar arbol">
          <Crosshair className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Hint tooltip */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-md bg-background/80 backdrop-blur-sm border border-border px-3 py-1.5 text-[11px] text-muted-foreground shadow-sm pointer-events-none select-none">
        <Move className="h-3 w-3" />
        Click y arrastra para navegar &middot; Scroll para mover &middot; Ctrl+Scroll para zoom
      </div>
    </div>
  )
}

// ---- Main Component ----

export function EmpresaConfiguracion() {
  const { setCurrentView } = usePlatform()
  const { toast } = useToast()

  // View
  const [viewMode, setViewMode] = useState<'list' | 'tree'>('list')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Core data
  const [tree, setTree] = useState<Unidad>(createInitialTree)
  const [unitTypes, setUnitTypes] = useState<UnitType[]>(initialTypes)
  const [etiquetas, setEtiquetas] = useState<Etiqueta[]>(initialEtiquetas)
  const [allUsers] = useState<UserData[]>(initialUsers)

  // List view state
  const [selectedId, setSelectedId] = useState<string | null>('root')
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(['root', 'op-norte', 'op-sur', 'aa-corp', 'planta-antof', 'ao-prod', 'proc-fund', 'vehiculos', 'seguridad', 'laboratorio']))

  // Modals
  const [detailModalNode, setDetailModalNode] = useState<Unidad | null>(null)
  const [addChildModal, setAddChildModal] = useState<{ parentId: string } | null>(null)
  const [editNodeModal, setEditNodeModal] = useState<Unidad | null>(null)
  const [deleteNodeModal, setDeleteNodeModal] = useState<Unidad | null>(null)
  const [deleteOption, setDeleteOption] = useState<'delete-all' | 'reassign'>('delete-all')
  const [reassignTargetId, setReassignTargetId] = useState<string>('')
  const [assignUserModal, setAssignUserModal] = useState<string | null>(null)
  const [manageTypesModal, setManageTypesModal] = useState(false)
  const [manageTagsModal, setManageTagsModal] = useState(false)
  const [createTypeModal, setCreateTypeModal] = useState(false)
  const [createTagModal, setCreateTagModal] = useState(false)
  const [editTypeModal, setEditTypeModal] = useState<UnitType | null>(null)
  const [editTagModal, setEditTagModal] = useState<Etiqueta | null>(null)

  // Form state
  const [formName, setFormName] = useState('')
  const [formTypeId, setFormTypeId] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formEtiquetaIds, setFormEtiquetaIds] = useState<string[]>([])
  const [formUserIds, setFormUserIds] = useState<string[]>([])
  const [formParentId, setFormParentId] = useState<string>('')
  const [newTypeName, setNewTypeName] = useState('')
  const [newTypeColor, setNewTypeColor] = useState(TYPE_COLORS[0])
  const [newTagName, setNewTagName] = useState('')
  const [newTagColor, setNewTagColor] = useState(TYPE_COLORS[3])
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])
  const [formMultiParentIds, setFormMultiParentIds] = useState<string[]>([])

  // Reference detail modal state
  const [refDetailNode, setRefDetailNode] = useState<Unidad | null>(null)

  // Derived
  const allNodes = useMemo(() => collectAllNodes(tree), [tree])
  const displayTree = useMemo(() => buildDisplayTree(tree), [tree])

  const selectedNode = useMemo(() => {
    if (!selectedId) return null
    return findNodeById(tree, selectedId)
  }, [tree, selectedId])

  const toggleExpand = useCallback((id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  // ---- CRUD Operations ----

  const openAddChildModal = useCallback((parentId: string) => {
    setFormName('')
    setFormTypeId(unitTypes[0]?.id || '')
    setFormDescription('')
    setFormEtiquetaIds([])
    setFormUserIds([])
    setFormParentId(parentId)
    setAddChildModal({ parentId })
  }, [unitTypes])

  const handleAddChild = useCallback(() => {
    if (!addChildModal || !formName.trim() || !formTypeId) return
    const type = unitTypes.find(t => t.id === formTypeId)
    // Auto-add the type's associated etiqueta
    const autoEtq = etiquetas.find(e => e.associatedTypeId === formTypeId)
    const finalEtqIds = autoEtq
      ? [...new Set([...formEtiquetaIds, autoEtq.id])]
      : formEtiquetaIds

    const newNode: Unidad = {
      id: generateId('unit'),
      name: formName.trim(),
      typeId: formTypeId,
      description: formDescription.trim(),
      parentId: addChildModal.parentId,
      children: [],
      etiquetaIds: finalEtqIds,
      assignedUserIds: formUserIds,
    }
    setTree(prev => addChildToNode(prev, addChildModal.parentId, newNode))
    setExpandedIds(prev => new Set([...prev, addChildModal.parentId]))
    setAddChildModal(null)
    toast({ title: 'Unidad creada', description: `"${newNode.name}" se agrego correctamente.` })
  }, [addChildModal, formName, formTypeId, formDescription, formEtiquetaIds, formUserIds, unitTypes, etiquetas, toast])

  const openEditNodeModal = useCallback((node: Unidad) => {
    setFormName(node.name)
    setFormTypeId(node.typeId)
    setFormDescription(node.description)
    setFormEtiquetaIds(node.etiquetaIds)
    setFormParentId(node.parentId || '')
    setFormMultiParentIds(node.multiParentIds || [])
    setEditNodeModal(node)
  }, [])

  const handleEditNode = useCallback(() => {
    if (!editNodeModal || !formName.trim()) return
    const autoEtq = etiquetas.find(e => e.associatedTypeId === formTypeId)
    const cleanedEtqs = formEtiquetaIds.filter(eid => {
      const etq = etiquetas.find(e => e.id === eid)
      if (!etq) return false
      if (etq.associatedTypeId && etq.associatedTypeId !== formTypeId) return false
      return true
    })
    const finalEtqIds = autoEtq ? [...new Set([...cleanedEtqs, autoEtq.id])] : cleanedEtqs

    // Handle parent change
    const cleanedMultiParents = formMultiParentIds.filter(pid => pid !== formParentId && pid !== editNodeModal.id)
    let newTree = updateNodeInTree(tree, editNodeModal.id, {
      name: formName.trim(),
      typeId: formTypeId,
      description: formDescription.trim(),
      etiquetaIds: finalEtqIds,
      multiParentIds: cleanedMultiParents.length > 0 ? cleanedMultiParents : undefined,
    })

    if (formParentId && formParentId !== editNodeModal.parentId && formParentId !== editNodeModal.id) {
      const node = findNodeById(newTree, editNodeModal.id)
      if (node) {
        newTree = removeNodeFromTree(newTree, editNodeModal.id)
        newTree = addChildToNode(newTree, formParentId, { ...node, parentId: formParentId })
      }
    }

    setTree(newTree)
    setEditNodeModal(null)
    toast({ title: 'Unidad actualizada', description: 'Los cambios se guardaron correctamente.' })
  }, [editNodeModal, formName, formTypeId, formDescription, formEtiquetaIds, formParentId, formMultiParentIds, tree, etiquetas, toast])

  const openDeleteNodeModal = useCallback((node: Unidad) => {
    setDeleteOption('delete-all')
    setReassignTargetId('')
    setDeleteNodeModal(node)
  }, [])

  const handleDeleteNode = useCallback(() => {
    if (!deleteNodeModal) return
    if (deleteOption === 'reassign' && reassignTargetId) {
      setTree(prev => reassignChildrenToParent(prev, deleteNodeModal.id, reassignTargetId))
    } else {
      setTree(prev => removeNodeFromTree(prev, deleteNodeModal.id))
    }
    if (selectedId === deleteNodeModal.id) setSelectedId('root')
    setDeleteNodeModal(null)
    toast({ title: 'Unidad eliminada', description: `"${deleteNodeModal.name}" fue eliminada.`, variant: 'destructive' })
  }, [deleteNodeModal, deleteOption, reassignTargetId, selectedId, toast])

  const handleAssignUsers = useCallback(() => {
    if (!assignUserModal || selectedUserIds.length === 0) return
    setTree(prev => updateNodeInTree(prev, assignUserModal, {
      assignedUserIds: [...new Set([
        ...(findNodeById(prev, assignUserModal)?.assignedUserIds || []),
        ...selectedUserIds,
      ])],
    }))
    setAssignUserModal(null)
    setSelectedUserIds([])
    toast({ title: 'Usuarios asignados', description: 'Los usuarios fueron asignados correctamente.' })
  }, [assignUserModal, selectedUserIds, toast])

  const handleUnassignUser = useCallback((nodeId: string, userId: string) => {
    setTree(prev => {
      const node = findNodeById(prev, nodeId)
      if (!node) return prev
      return updateNodeInTree(prev, nodeId, {
        assignedUserIds: node.assignedUserIds.filter(id => id !== userId),
      })
    })
    toast({ title: 'Usuario desasignado', description: 'El usuario fue desasignado de la unidad.' })
  }, [toast])

  // ---- Tipos CRUD ----

  const handleCreateType = useCallback(() => {
    if (!newTypeName.trim()) return
    const typeId = generateId('type')
    const newType: UnitType = { id: typeId, name: newTypeName.trim(), color: newTypeColor }
    setUnitTypes(prev => [...prev, newType])
    // Auto-create associated etiqueta
    const autoEtq: Etiqueta = {
      id: `etq-auto-${typeId}`,
      name: normalizeText(newTypeName.trim()),
      color: newTypeColor,
      associatedTypeId: typeId,
    }
    setEtiquetas(prev => [...prev, autoEtq])
    setNewTypeName('')
    setNewTypeColor(getColorForIndex(unitTypes.length))
    setCreateTypeModal(false)
    toast({ title: 'Tipo creado', description: `"${newType.name}" y su etiqueta asociada fueron creados.` })
  }, [newTypeName, newTypeColor, unitTypes.length, toast])

  const handleEditType = useCallback(() => {
    if (!editTypeModal || !newTypeName.trim()) return
    setUnitTypes(prev => prev.map(t => t.id === editTypeModal.id ? { ...t, name: newTypeName.trim(), color: newTypeColor } : t))
    // Update associated etiqueta
    setEtiquetas(prev => prev.map(e => {
      if (e.associatedTypeId === editTypeModal.id) {
        return { ...e, name: normalizeText(newTypeName.trim()), color: newTypeColor }
      }
      return e
    }))
    setEditTypeModal(null)
    toast({ title: 'Tipo actualizado', description: 'El tipo y su etiqueta asociada fueron actualizados.' })
  }, [editTypeModal, newTypeName, newTypeColor, toast])

  const handleDeleteType = useCallback((typeId: string) => {
    const usedByUnit = allNodes.some(n => n.typeId === typeId)
    if (usedByUnit) {
      toast({ title: 'No se puede eliminar', description: 'Existen unidades usando este tipo.', variant: 'destructive' })
      return
    }
    setUnitTypes(prev => prev.filter(t => t.id !== typeId))
    setEtiquetas(prev => prev.filter(e => e.associatedTypeId !== typeId))
    toast({ title: 'Tipo eliminado', description: 'El tipo y su etiqueta asociada fueron eliminados.' })
  }, [allNodes, toast])

  // ---- Etiquetas CRUD ----

  const handleCreateTag = useCallback(() => {
    if (!newTagName.trim()) return
    const newTag: Etiqueta = {
      id: generateId('etq'),
      name: normalizeText(newTagName.trim()),
      color: newTagColor,
      associatedTypeId: null,
    }
    setEtiquetas(prev => [...prev, newTag])
    setNewTagName('')
    setNewTagColor(getColorForIndex(etiquetas.length))
    setCreateTagModal(false)
    toast({ title: 'Etiqueta creada', description: `"${newTag.name}" fue creada.` })
  }, [newTagName, newTagColor, etiquetas.length, toast])

  const handleEditTag = useCallback(() => {
    if (!editTagModal || !newTagName.trim()) return
    setEtiquetas(prev => prev.map(e => e.id === editTagModal.id ? { ...e, name: normalizeText(newTagName.trim()), color: newTagColor } : e))
    setEditTagModal(null)
    toast({ title: 'Etiqueta actualizada', description: 'La etiqueta fue actualizada.' })
  }, [editTagModal, newTagName, newTagColor, toast])

  const handleDeleteTag = useCallback((tagId: string) => {
    const tag = etiquetas.find(e => e.id === tagId)
    if (tag?.associatedTypeId) {
      toast({ title: 'No se puede eliminar', description: 'Esta etiqueta esta asociada a un tipo.', variant: 'destructive' })
      return
    }
    // Remove tag from all units
    setTree(prev => {
      function strip(node: Unidad): Unidad {
        return { ...node, etiquetaIds: node.etiquetaIds.filter(id => id !== tagId), children: node.children.map(strip) }
      }
      return strip(prev)
    })
    setEtiquetas(prev => prev.filter(e => e.id !== tagId))
    toast({ title: 'Etiqueta eliminada', description: 'La etiqueta fue eliminada.' })
  }, [etiquetas, toast])

  // Change primary parent (swap primary with a secondary)
  const handleChangePrimaryParent = useCallback((nodeId: string, newPrimaryParentId: string) => {
    setTree(prev => {
      const node = findNodeById(prev, nodeId)
      if (!node || !node.parentId) return prev
      const oldPrimaryId = node.parentId
      // Build new multiParentIds: remove the new primary, add the old primary
      const oldSecondaries = node.multiParentIds || []
      const newSecondaries = oldSecondaries.filter(pid => pid !== newPrimaryParentId)
      newSecondaries.push(oldPrimaryId)

      // Remove from old parent, add to new parent
      let updated = removeNodeFromTree(prev, nodeId)
      const movedNode: Unidad = {
        ...node,
        parentId: newPrimaryParentId,
        multiParentIds: newSecondaries,
      }
      updated = addChildToNode(updated, newPrimaryParentId, movedNode)
      return updated
    })
    toast({ title: 'Ubicacion principal cambiada', description: 'La ubicacion principal fue actualizada.' })
  }, [toast])

  // Tree click -> open detail modal (handle reference vs normal)
  const handleTreeNodeClick = useCallback((node: Unidad, isRef: boolean) => {
    if (isRef) {
      // For reference clicks, look up the original node
      const original = findNodeById(tree, node.id)
      if (original) setRefDetailNode(original)
    } else {
      setDetailModalNode(node)
    }
  }, [tree])

  // Sidebar click -> open detail modal
  const handleSidebarUnitClick = useCallback((node: Unidad) => {
    setDetailModalNode(node)
  }, [])

  // List tree reference click -> open reference detail modal
  const handleListRefDetailOpen = useCallback((node: Unidad, isRef: boolean) => {
    if (isRef) {
      const original = findNodeById(tree, node.id)
      if (original) setRefDetailNode(original)
    }
  }, [tree])

  // Potential parent nodes for reassign (exclude the node being deleted and its children)
  const getReassignTargets = useCallback((nodeToDelete: Unidad): Unidad[] => {
    const excludeIds = collectAllIds(nodeToDelete)
    return allNodes.filter(n => !excludeIds.includes(n.id))
  }, [allNodes])

  // All potential parent nodes for edit modal
  const getAllPotentialParents = useCallback((nodeId: string): Unidad[] => {
    const excludeIds = findNodeById(tree, nodeId) ? collectAllIds(findNodeById(tree, nodeId)!) : [nodeId]
    return allNodes.filter(n => !excludeIds.includes(n.id))
  }, [allNodes, tree])

  // Helper for detail modal: the freshest version of the node
  const freshDetailNode = useMemo(() => {
    if (!detailModalNode) return null
    return findNodeById(tree, detailModalNode.id)
  }, [tree, detailModalNode])

  // Etiqueta toggle in form
  const toggleFormEtiqueta = useCallback((eId: string) => {
    setFormEtiquetaIds(prev => prev.includes(eId) ? prev.filter(id => id !== eId) : [...prev, eId])
  }, [])

  // User toggle in form
  const toggleFormUser = useCallback((uId: string) => {
    setFormUserIds(prev => prev.includes(uId) ? prev.filter(id => id !== uId) : [...prev, uId])
  }, [])

  // Custom etiquetas (not associated to a type)
  const customEtiquetas = useMemo(() => etiquetas.filter(e => !e.associatedTypeId), [etiquetas])

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="mx-auto max-w-[1800px] px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => setCurrentView('hub')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
            <h1 className="text-lg font-bold text-foreground tracking-tight">Unidades de control</h1>
            <p className="text-xs text-muted-foreground">Estructura organizacional y unidades de control</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Manage Tipos */}
              <Button variant="outline" size="sm" onClick={() => setManageTypesModal(true)}>
                <Settings2 className="mr-1.5 h-3.5 w-3.5" />
                Gestionar tipos
              </Button>
              {/* Manage Etiquetas */}
              <Button variant="outline" size="sm" onClick={() => setManageTagsModal(true)}>
                <Tag className="mr-1.5 h-3.5 w-3.5" />
                Gestionar etiquetas
              </Button>
              {/* Sidebar toggle */}
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} title={sidebarOpen ? 'Ocultar sidebar' : 'Mostrar sidebar'}>
                {sidebarOpen ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
              </Button>
              {/* View toggle */}
              <div className="flex items-center rounded-lg border border-border bg-secondary/50 p-0.5 ml-1">
                <button
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors
                    ${viewMode === 'list' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-3.5 w-3.5" />
                  Lista
                </button>
                <button
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors
                    ${viewMode === 'tree' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                  onClick={() => setViewMode('tree')}
                >
                  <GitBranchPlus className="h-3.5 w-3.5" />
                  Arbol
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Main area */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {viewMode === 'list' ? (
            /* ======== LIST VIEW ======== */
            <div className="flex flex-1 min-h-0 overflow-hidden mx-auto max-w-[1600px] w-full">
              {/* Left tree sidebar */}
              <div className="w-[380px] shrink-0 border-r border-border flex flex-col">
                <div className="p-4 border-b border-border">
                  <div className="flex items-center gap-2">
                    <Network className="h-4 w-4 text-muted-foreground" />
                    <h2 className="text-sm font-semibold text-foreground">Arbol Jerarquico</h2>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Selecciona un nodo para ver sus detalles</p>
                </div>
                <ScrollArea className="flex-1">
                  <div className="p-2">
                    <TreeListNode
                      node={displayTree} level={0}
                      selectedId={selectedId} expandedIds={expandedIds}
                      types={unitTypes}
                      onSelect={setSelectedId} onToggle={toggleExpand}
                      onAddChild={openAddChildModal}
                      onEdit={openEditNodeModal}
                      onDelete={openDeleteNodeModal}
                      onOpenDetail={handleListRefDetailOpen}
                    />
                  </div>
                </ScrollArea>
              </div>

              {/* Right detail panel */}
              <div className="flex-1 flex flex-col min-h-0">
                {selectedNode ? (
                  <ScrollArea className="h-full">
                    <div className="p-6">
                      <UnitDetailPanel
                        node={selectedNode}
                        types={unitTypes}
                        etiquetas={etiquetas}
                        users={allUsers}
                        root={tree}
                        onEdit={() => openEditNodeModal(selectedNode)}
                        onDelete={() => openDeleteNodeModal(selectedNode)}
                        onAddChild={() => openAddChildModal(selectedNode.id)}
                        onAssignUser={() => {
                          setSelectedUserIds([])
                          setAssignUserModal(selectedNode.id)
                        }}
                        onUnassignUser={(userId) => handleUnassignUser(selectedNode.id, userId)}
                        onChangePrimary={handleChangePrimaryParent}
                      />
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <Network className="mx-auto h-12 w-12 text-muted-foreground" />
                      <p className="mt-4 text-sm font-medium text-foreground">Selecciona un nodo</p>
                      <p className="text-xs text-muted-foreground mt-1">Haz click en un elemento del arbol para ver sus detalles.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* ======== TREE VIEW (Infinite Canvas) ======== */
            <InfiniteCanvasTree
              displayTree={displayTree}
              unitTypes={unitTypes}
              allUsers={allUsers}
              onNodeClick={handleTreeNodeClick}
            />
          )}
        </div>

        {/* Right sidebar: units grouped by tag */}
        {sidebarOpen && (
          <div className="w-[280px] shrink-0 border-l border-border bg-background">
            <TagSidebar
              etiquetas={etiquetas}
              allNodes={allNodes}
              types={unitTypes}
              onUnitClick={handleSidebarUnitClick}
            />
          </div>
        )}
      </div>

      {/* ---- DETAIL MODAL (from tree/sidebar click) ---- */}
      <Dialog open={!!freshDetailNode} onOpenChange={(open) => { if (!open) setDetailModalNode(null) }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col p-0">
          {/* Fixed header */}
          <div className="shrink-0 border-b border-border px-6 py-4">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {freshDetailNode && (() => {
                  const ut = unitTypes.find(t => t.id === freshDetailNode.typeId)
                  return (
                    <>
                      {ut && (
                        <Badge className="text-xs border-0" style={{ backgroundColor: ut.color + '20', color: ut.color }}>
                          {ut.name}
                        </Badge>
                      )}
                      {freshDetailNode.name}
                    </>
                  )
                })()}
              </DialogTitle>
            </DialogHeader>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 min-h-0 overflow-y-auto px-6 py-4">
            {freshDetailNode && (
              <UnitDetailPanel
                node={freshDetailNode}
                types={unitTypes}
                etiquetas={etiquetas}
                users={allUsers}
                root={tree}
                showHeader={false}
                onEdit={() => { setDetailModalNode(null); openEditNodeModal(freshDetailNode) }}
                onDelete={() => { setDetailModalNode(null); openDeleteNodeModal(freshDetailNode) }}
                onAddChild={() => { setDetailModalNode(null); openAddChildModal(freshDetailNode.id) }}
                onAssignUser={() => {
                  setSelectedUserIds([])
                  setAssignUserModal(freshDetailNode.id)
                }}
                onUnassignUser={(userId) => handleUnassignUser(freshDetailNode.id, userId)}
                onChangePrimary={handleChangePrimaryParent}
              />
            )}
          </div>

          {/* Fixed footer */}
          {freshDetailNode && (
            <div className="shrink-0 flex items-center gap-2 px-6 py-4 border-t border-border bg-background">
              <Button variant="outline" size="sm" onClick={() => { setDetailModalNode(null); openEditNodeModal(freshDetailNode) }}>
                <Pencil className="mr-1.5 h-3.5 w-3.5" />
                Editar unidad
              </Button>
              <Button variant="outline" size="sm" onClick={() => { setDetailModalNode(null); openAddChildModal(freshDetailNode.id) }}>
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Agregar unidad hija
              </Button>
              {freshDetailNode.parentId !== null && (
                <Button variant="outline" size="sm" className="text-destructive hover:text-destructive"
                  onClick={() => { setDetailModalNode(null); openDeleteNodeModal(freshDetailNode) }}>
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                  Eliminar unidad
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ---- REFERENCE DETAIL MODAL ---- */}
      <Dialog open={!!refDetailNode} onOpenChange={(open) => { if (!open) setRefDetailNode(null) }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col p-0">
          {/* Fixed header */}
          <div className="shrink-0 border-b border-border px-6 py-4">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {refDetailNode && (() => {
                  const ut = unitTypes.find(t => t.id === refDetailNode.typeId)
                  return (
                    <>
                      {ut && (
                        <Badge className="text-xs border-0" style={{ backgroundColor: ut.color + '20', color: ut.color }}>
                          {ut.name}
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-[10px] border-muted-foreground/30 text-muted-foreground bg-muted/50">
                        Referencia
                      </Badge>
                      {refDetailNode.name}
                    </>
                  )
                })()}
              </DialogTitle>
            </DialogHeader>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 min-h-0 overflow-y-auto px-6 py-4">
            {refDetailNode && (
              <UnitDetailPanel
                node={refDetailNode}
                types={unitTypes}
                etiquetas={etiquetas}
                users={allUsers}
                root={tree}
                showHeader={false}
                isReference={true}
                onEdit={() => {}}
                onDelete={() => {}}
                onAddChild={() => {}}
                onAssignUser={() => {}}
                onUnassignUser={() => {}}
              />
            )}
          </div>

          {/* Fixed footer */}
          <div className="shrink-0 flex items-center gap-2 px-6 py-4 border-t border-border bg-background">
            <Button variant="outline" size="sm" onClick={() => {
              if (refDetailNode) {
                setRefDetailNode(null)
                setSelectedId(refDetailNode.id)
                setDetailModalNode(null)
              }
            }}>
              <Link2 className="mr-1.5 h-3.5 w-3.5" />
              Ir a unidad principal
            </Button>
            <Button variant="outline" size="sm" onClick={() => setRefDetailNode(null)}>
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ---- ADD CHILD MODAL ---- */}
      <Dialog open={!!addChildModal} onOpenChange={(open) => { if (!open) setAddChildModal(null) }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Agregar Unidad</DialogTitle>
            <DialogDescription>
              Nueva unidad hija de{' '}
              {addChildModal ? findNodeById(tree, addChildModal.parentId)?.name : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            <div className="space-y-2">
              <Label>Nombre *</Label>
              <Input placeholder="Nombre de la unidad" value={formName} onChange={(e) => setFormName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Tipo *</Label>
              <Select value={formTypeId} onValueChange={setFormTypeId}>
                <SelectTrigger><SelectValue placeholder="Seleccionar tipo" /></SelectTrigger>
                <SelectContent>
                  {unitTypes.map(t => (
                    <SelectItem key={t.id} value={t.id}>
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color }} />
                        {t.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="button" variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground"
                onClick={() => { setNewTypeName(''); setNewTypeColor(getColorForIndex(unitTypes.length)); setCreateTypeModal(true) }}>
                <Plus className="h-3 w-3 mr-1" />
                Crear nuevo tipo
              </Button>
            </div>
            <div className="space-y-2">
              <Label>Unidad padre</Label>
              <Input value={addChildModal ? (findNodeById(tree, addChildModal.parentId)?.name || '') : ''} disabled className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label>Descripcion</Label>
              <Textarea placeholder="Descripcion de la unidad" value={formDescription} onChange={(e) => setFormDescription(e.target.value)} rows={2} />
            </div>
            <div className="space-y-2">
              <Label>Usuarios asignados</Label>
              <div className="flex flex-wrap gap-1.5 p-2 rounded-lg border border-border min-h-[40px]">
                {allUsers.map(u => {
                  const selected = formUserIds.includes(u.id)
                  return (
                    <button key={u.id} type="button"
                      className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-xs transition-colors border
                        ${selected ? 'border-primary bg-primary/10 text-foreground' : 'border-transparent hover:bg-accent text-muted-foreground'}`}
                      onClick={() => toggleFormUser(u.id)}
                    >
                      <Avatar className="h-4 w-4">
                        <AvatarFallback className="text-[7px]">{u.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      {u.name.split(' ')[0]}
                    </button>
                  )
                })}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Etiquetas</Label>
              <div className="flex flex-wrap gap-1.5 p-2 rounded-lg border border-border min-h-[40px]">
                {customEtiquetas.map(e => {
                  const selected = formEtiquetaIds.includes(e.id)
                  return (
                    <button key={e.id} type="button"
                      className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-xs transition-colors border
                        ${selected ? 'bg-opacity-20 text-foreground' : 'border-transparent hover:bg-accent text-muted-foreground'}`}
                      style={selected ? { borderColor: e.color, backgroundColor: e.color + '15' } : {}}
                      onClick={() => toggleFormEtiqueta(e.id)}
                    >
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: e.color }} />
                      {e.name}
                    </button>
                  )
                })}
              </div>
              <Button type="button" variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground"
                onClick={() => { setNewTagName(''); setNewTagColor(getColorForIndex(etiquetas.length)); setCreateTagModal(true) }}>
                <Plus className="h-3 w-3 mr-1" />
                Crear nueva etiqueta
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddChildModal(null)}>Cancelar</Button>
            <Button onClick={handleAddChild} disabled={!formName.trim() || !formTypeId}>Crear</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---- EDIT NODE MODAL ---- */}
      <Dialog open={!!editNodeModal} onOpenChange={(open) => { if (!open) setEditNodeModal(null) }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Unidad</DialogTitle>
            <DialogDescription>Modifica los datos de la unidad.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            <div className="space-y-2">
              <Label>Nombre *</Label>
              <Input value={formName} onChange={(e) => setFormName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Tipo *</Label>
              <Select value={formTypeId} onValueChange={setFormTypeId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {unitTypes.map(t => (
                    <SelectItem key={t.id} value={t.id}>
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color }} />
                        {t.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="button" variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground"
                onClick={() => { setNewTypeName(''); setNewTypeColor(getColorForIndex(unitTypes.length)); setCreateTypeModal(true) }}>
                <Plus className="h-3 w-3 mr-1" />
                Crear nuevo tipo
              </Button>
            </div>
            <div className="space-y-2">
              <Label>Unidad padre (principal)</Label>
              {editNodeModal?.parentId === null ? (
                <Input value="Ninguna (raiz)" disabled className="bg-muted" />
              ) : (
                <Select value={formParentId} onValueChange={(val) => {
                  setFormParentId(val)
                  // Remove from secondary if chosen as primary
                  setFormMultiParentIds(prev => prev.filter(pid => pid !== val))
                }}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar padre" /></SelectTrigger>
                  <SelectContent>
                    {editNodeModal && getAllPotentialParents(editNodeModal.id).map(n => (
                      <SelectItem key={n.id} value={n.id}>{n.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            {/* Secondary parents multi-select */}
            {editNodeModal?.parentId !== null && (
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  Ubicaciones secundarias
                  {formMultiParentIds.length > 0 && (
                    <Badge variant="secondary" className="text-[10px]">{formMultiParentIds.length}</Badge>
                  )}
                </Label>
                <p className="text-xs text-muted-foreground">La unidad aparecera como referencia bajo cada ubicacion secundaria.</p>
                <div className="flex flex-wrap gap-1.5 p-2 rounded-lg border border-border min-h-[40px]">
                  {editNodeModal && getAllPotentialParents(editNodeModal.id)
                    .filter(n => n.id !== formParentId) // exclude primary parent
                    .map(n => {
                      const selected = formMultiParentIds.includes(n.id)
                      const nodeType = unitTypes.find(t => t.id === n.typeId)
                      return (
                        <button key={n.id} type="button"
                          className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-xs transition-colors border
                            ${selected ? 'border-primary bg-primary/10 text-foreground' : 'border-transparent hover:bg-accent text-muted-foreground'}`}
                          onClick={() => {
                            setFormMultiParentIds(prev =>
                              prev.includes(n.id) ? prev.filter(id => id !== n.id) : [...prev, n.id]
                            )
                          }}
                        >
                          {nodeType && (
                            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: nodeType.color }} />
                          )}
                          {n.name}
                          {selected && <X className="h-2.5 w-2.5 ml-0.5" />}
                        </button>
                      )
                    })
                  }
                </div>
                {formMultiParentIds.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {formMultiParentIds.map(pid => {
                      const pNode = allNodes.find(n => n.id === pid)
                      return pNode ? (
                        <Badge key={pid} variant="outline" className="text-[10px] h-5 gap-1">
                          {pNode.name}
                          <button type="button" onClick={() => setFormMultiParentIds(prev => prev.filter(id => id !== pid))}>
                            <X className="h-2.5 w-2.5" />
                          </button>
                        </Badge>
                      ) : null
                    })}
                  </div>
                )}
              </div>
            )}
            <div className="space-y-2">
              <Label>Descripcion</Label>
              <Textarea value={formDescription} onChange={(e) => setFormDescription(e.target.value)} rows={2} />
            </div>
            <div className="space-y-2">
              <Label>Etiquetas</Label>
              <div className="flex flex-wrap gap-1.5 p-2 rounded-lg border border-border min-h-[40px]">
                {customEtiquetas.map(e => {
                  const selected = formEtiquetaIds.includes(e.id)
                  return (
                    <button key={e.id} type="button"
                      className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-xs transition-colors border
                        ${selected ? 'bg-opacity-20 text-foreground' : 'border-transparent hover:bg-accent text-muted-foreground'}`}
                      style={selected ? { borderColor: e.color, backgroundColor: e.color + '15' } : {}}
                      onClick={() => toggleFormEtiqueta(e.id)}
                    >
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: e.color }} />
                      {e.name}
                    </button>
                  )
                })}
              </div>
              <Button type="button" variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground"
                onClick={() => { setNewTagName(''); setNewTagColor(getColorForIndex(etiquetas.length)); setCreateTagModal(true) }}>
                <Plus className="h-3 w-3 mr-1" />
                Crear nueva etiqueta
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditNodeModal(null)}>Cancelar</Button>
            <Button onClick={handleEditNode} disabled={!formName.trim()}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---- DELETE NODE MODAL ---- */}
      <Dialog open={!!deleteNodeModal} onOpenChange={(open) => { if (!open) setDeleteNodeModal(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Unidad</DialogTitle>
            <DialogDescription>
              {'Esta accion eliminara "'}{deleteNodeModal?.name}{'".'}
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            Al eliminar esta unidad, se perderan sus datos y configuraciones asociadas. Esta accion no se puede deshacer.
          </div>
          {deleteNodeModal && deleteNodeModal.children.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground">Esta unidad tiene {deleteNodeModal.children.length} unidad{deleteNodeModal.children.length > 1 ? 'es' : ''} hija{deleteNodeModal.children.length > 1 ? 's' : ''}. Selecciona una opcion:</p>
              <div className="space-y-2">
                <label className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${deleteOption === 'delete-all' ? 'border-destructive bg-destructive/5' : 'border-border hover:bg-accent'}`}>
                  <input type="radio" name="deleteOption" value="delete-all" checked={deleteOption === 'delete-all'}
                    onChange={() => setDeleteOption('delete-all')} className="mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Eliminar unidad y todas sus hijas</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Se eliminaran {collectAllIds(deleteNodeModal).length - 1} unidad{collectAllIds(deleteNodeModal).length - 1 !== 1 ? 'es' : ''} hija{collectAllIds(deleteNodeModal).length - 1 !== 1 ? 's' : ''}.</p>
                  </div>
                </label>
                <label className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${deleteOption === 'reassign' ? 'border-primary bg-primary/5' : 'border-border hover:bg-accent'}`}>
                  <input type="radio" name="deleteOption" value="reassign" checked={deleteOption === 'reassign'}
                    onChange={() => setDeleteOption('reassign')} className="mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">Reasignar las hijas a otra unidad padre</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Las unidades hijas seran movidas a la unidad que selecciones.</p>
                    {deleteOption === 'reassign' && (
                      <div className="mt-2">
                        <Select value={reassignTargetId} onValueChange={setReassignTargetId}>
                          <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Seleccionar nueva unidad padre" /></SelectTrigger>
                          <SelectContent>
                            {getReassignTargets(deleteNodeModal).map(n => (
                              <SelectItem key={n.id} value={n.id}>{n.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                </label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteNodeModal(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDeleteNode}
              disabled={deleteOption === 'reassign' && deleteNodeModal?.children && deleteNodeModal.children.length > 0 && !reassignTargetId}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---- ASSIGN USER MODAL ---- */}
      <Dialog open={!!assignUserModal} onOpenChange={(open) => { if (!open) { setAssignUserModal(null); setSelectedUserIds([]) } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Asignar Usuarios</DialogTitle>
            <DialogDescription>Selecciona los usuarios que deseas asignar a la unidad.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {allUsers.map(u => {
              const currentNode = assignUserModal ? findNodeById(tree, assignUserModal) : null
              const alreadyAssigned = currentNode?.assignedUserIds.includes(u.id)
              if (alreadyAssigned) return null
              const isSelected = selectedUserIds.includes(u.id)
              return (
                <div key={u.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors
                    ${isSelected ? 'border-primary bg-primary/5' : 'border-border hover:bg-accent'}`}
                  onClick={() => setSelectedUserIds(prev => prev.includes(u.id) ? prev.filter(id => id !== u.id) : [...prev, u.id])}
                >
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className={`text-xs font-semibold ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                      {u.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{u.name}</p>
                    <p className="text-xs text-muted-foreground">{u.email} - {u.role}</p>
                  </div>
                </div>
              )
            })}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setAssignUserModal(null); setSelectedUserIds([]) }}>Cancelar</Button>
            <Button onClick={handleAssignUsers} disabled={selectedUserIds.length === 0}>
              Asignar ({selectedUserIds.length})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---- MANAGE TYPES MODAL ---- */}
      <Dialog open={manageTypesModal} onOpenChange={setManageTypesModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Gestionar Tipos de Unidad</DialogTitle>
            <DialogDescription>Administra los tipos disponibles para las unidades.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {unitTypes.map(t => {
              const usedCount = allNodes.filter(n => n.typeId === t.id).length
              return (
                <div key={t.id} className="group flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent/30 transition-colors">
                  <span className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: t.color }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{usedCount} unidad{usedCount !== 1 ? 'es' : ''}</p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-7 w-7"
                      onClick={() => { setNewTypeName(t.name); setNewTypeColor(t.color); setEditTypeModal(t) }}>
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => handleDeleteType(t.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setNewTypeName(''); setNewTypeColor(getColorForIndex(unitTypes.length)); setCreateTypeModal(true) }}>
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Crear tipo
            </Button>
            <Button variant="outline" onClick={() => setManageTypesModal(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---- CREATE TYPE MODAL ---- */}
      <Dialog open={createTypeModal} onOpenChange={setCreateTypeModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Crear Tipo de Unidad</DialogTitle>
            <DialogDescription>El sistema creara una etiqueta asociada automaticamente.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input placeholder="Nombre del tipo" value={newTypeName} onChange={(e) => setNewTypeName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {TYPE_COLORS.map(c => (
                  <button key={c} type="button"
                    className={`w-7 h-7 rounded-full border-2 transition-all ${newTypeColor === c ? 'border-foreground scale-110' : 'border-transparent hover:scale-105'}`}
                    style={{ backgroundColor: c }}
                    onClick={() => setNewTypeColor(c)}
                  />
                ))}
              </div>
            </div>
            {newTypeName.trim() && (
              <div className="rounded-lg bg-muted p-3">
                <p className="text-xs text-muted-foreground">Etiqueta que se creara automaticamente:</p>
                <Badge variant="outline" className="mt-1 text-xs" style={{ borderColor: newTypeColor + '60', color: newTypeColor, backgroundColor: newTypeColor + '10' }}>
                  {normalizeText(newTypeName.trim())}
                </Badge>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateTypeModal(false)}>Cancelar</Button>
            <Button onClick={handleCreateType} disabled={!newTypeName.trim()}>Crear</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---- EDIT TYPE MODAL ---- */}
      <Dialog open={!!editTypeModal} onOpenChange={(open) => { if (!open) setEditTypeModal(null) }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Editar Tipo de Unidad</DialogTitle>
            <DialogDescription>Se actualizara tambien su etiqueta asociada.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input value={newTypeName} onChange={(e) => setNewTypeName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {TYPE_COLORS.map(c => (
                  <button key={c} type="button"
                    className={`w-7 h-7 rounded-full border-2 transition-all ${newTypeColor === c ? 'border-foreground scale-110' : 'border-transparent hover:scale-105'}`}
                    style={{ backgroundColor: c }}
                    onClick={() => setNewTypeColor(c)}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTypeModal(null)}>Cancelar</Button>
            <Button onClick={handleEditType} disabled={!newTypeName.trim()}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---- MANAGE TAGS MODAL ---- */}
      <Dialog open={manageTagsModal} onOpenChange={setManageTagsModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Gestionar Etiquetas</DialogTitle>
            <DialogDescription>Administra las etiquetas disponibles.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {etiquetas.map(e => {
              const isTypeAssociated = !!e.associatedTypeId
              const usedCount = allNodes.filter(n => n.etiquetaIds.includes(e.id)).length
              return (
                <div key={e.id} className="group flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent/30 transition-colors">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: e.color }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground">{e.name}</p>
                      {isTypeAssociated && (
                        <Badge variant="outline" className="text-[9px] h-4">auto</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{usedCount} unidad{usedCount !== 1 ? 'es' : ''}</p>
                  </div>
                  {!isTypeAssociated && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-7 w-7"
                        onClick={() => { setNewTagName(e.name); setNewTagColor(e.color); setEditTagModal(e) }}>
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => handleDeleteTag(e.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setNewTagName(''); setNewTagColor(getColorForIndex(etiquetas.length)); setCreateTagModal(true) }}>
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Crear etiqueta
            </Button>
            <Button variant="outline" onClick={() => setManageTagsModal(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---- CREATE TAG MODAL ---- */}
      <Dialog open={createTagModal} onOpenChange={setCreateTagModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Crear Etiqueta</DialogTitle>
            <DialogDescription>El nombre se normalizara automaticamente (minusculas, sin acentos).</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input placeholder="Nombre de la etiqueta" value={newTagName} onChange={(e) => setNewTagName(e.target.value)} />
              {newTagName.trim() && (
                <p className="text-xs text-muted-foreground">Se guardara como: <span className="font-medium">{normalizeText(newTagName.trim())}</span></p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {TYPE_COLORS.map(c => (
                  <button key={c} type="button"
                    className={`w-7 h-7 rounded-full border-2 transition-all ${newTagColor === c ? 'border-foreground scale-110' : 'border-transparent hover:scale-105'}`}
                    style={{ backgroundColor: c }}
                    onClick={() => setNewTagColor(c)}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateTagModal(false)}>Cancelar</Button>
            <Button onClick={handleCreateTag} disabled={!newTagName.trim()}>Crear</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---- EDIT TAG MODAL ---- */}
      <Dialog open={!!editTagModal} onOpenChange={(open) => { if (!open) setEditTagModal(null) }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Editar Etiqueta</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input value={newTagName} onChange={(e) => setNewTagName(e.target.value)} />
              {newTagName.trim() && (
                <p className="text-xs text-muted-foreground">Se guardara como: <span className="font-medium">{normalizeText(newTagName.trim())}</span></p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {TYPE_COLORS.map(c => (
                  <button key={c} type="button"
                    className={`w-7 h-7 rounded-full border-2 transition-all ${newTagColor === c ? 'border-foreground scale-110' : 'border-transparent hover:scale-105'}`}
                    style={{ backgroundColor: c }}
                    onClick={() => setNewTagColor(c)}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTagModal(null)}>Cancelar</Button>
            <Button onClick={handleEditTag} disabled={!newTagName.trim()}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
