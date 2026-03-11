'use client'

import React, { useState } from 'react'
import { PageHeader } from '@/components/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Building2,
  Users,
  ChevronDown,
  ChevronRight,
  FileText,
  Plus,
} from 'lucide-react'
import { mockOrganization } from '@/lib/mock-data'
import type { DepartmentNode } from '@/lib/types'
import { cn } from '@/lib/utils'

export function OrganigramaSection() {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <PageHeader 
        title="Organigrama"
        breadcrumbs={[{ label: 'Configuración' }, { label: 'Organigrama' }]}
        actions={
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Agregar Departamento
          </Button>
        }
      />

      <main className="flex-1 p-6 overflow-auto">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground mb-6">
              Estructura organizacional con las normas asignadas a cada departamento.
            </p>
            
            <div className="flex justify-center">
              <OrgTree node={mockOrganization} isRoot />
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

function OrgTree({ node, isRoot = false }: { node: DepartmentNode; isRoot?: boolean }) {
  const [isExpanded, setIsExpanded] = useState(true)
  const hasChildren = node.children && node.children.length > 0

  return (
    <div className={cn('flex flex-col items-center', !isRoot && 'mt-4')}>
      {/* Node */}
      <div 
        className={cn(
          'relative flex flex-col items-center cursor-pointer group',
          !isRoot && 'before:content-[""] before:absolute before:top-0 before:left-1/2 before:-translate-x-1/2 before:w-px before:h-4 before:bg-border before:-translate-y-full'
        )}
        onClick={() => hasChildren && setIsExpanded(!isExpanded)}
      >
        <div 
          className={cn(
            'flex flex-col items-center p-4 rounded-xl border-2 transition-all min-w-48',
            isRoot 
              ? 'bg-primary/5 border-primary' 
              : 'bg-card border-border hover:border-primary/50 hover:shadow-md'
          )}
        >
          <div className={cn(
            'w-12 h-12 rounded-full flex items-center justify-center mb-2',
            isRoot ? 'bg-primary text-primary-foreground' : 'bg-muted'
          )}>
            {isRoot ? <Building2 className="w-6 h-6" /> : <Users className="w-6 h-6 text-muted-foreground" />}
          </div>
          
          <h4 className={cn(
            'font-semibold text-center mb-1',
            isRoot && 'text-primary'
          )}>
            {node.name}
          </h4>
          
          {node.role && (
            <p className="text-xs text-muted-foreground mb-2">{node.role}</p>
          )}

          {node.norms && node.norms.length > 0 && (
            <div className="flex flex-wrap gap-1 justify-center max-w-48">
              {node.norms.slice(0, 3).map(norm => (
                <Badge key={norm} variant="secondary" className="text-xs">
                  <FileText className="w-3 h-3 mr-1" />
                  {norm}
                </Badge>
              ))}
              {node.norms.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{node.norms.length - 3}
                </Badge>
              )}
            </div>
          )}

          {hasChildren && (
            <div className="mt-2 text-muted-foreground">
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="relative mt-4">
          {/* Horizontal connector */}
          {node.children && node.children.length > 1 && (
            <div 
              className="absolute top-0 left-1/2 -translate-x-1/2 h-px bg-border"
              style={{
                width: `calc(100% - 12rem)`,
              }}
            />
          )}
          
          {/* Vertical connector from parent */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-4 bg-border -translate-y-full" />

          <div className="flex gap-8 justify-center">
            {node.children?.map(child => (
              <OrgTree key={child.id} node={child} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
