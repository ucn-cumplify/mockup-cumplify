'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/page-header'
import { mockComplianceStats, mockProjects, mockLegalBodies } from '@/lib/mock-data'
import { CheckCircle2, AlertTriangle, XCircle, Clock, FileText, FolderKanban, Scale, TrendingUp } from 'lucide-react'

export function DashboardSection() {
  const stats = mockComplianceStats
  const compliancePercentage = Math.round((stats.compliant / stats.total) * 100)

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <PageHeader 
        title="Tablero" 
        breadcrumbs={[{ label: 'Inicio' }, { label: 'Tablero' }]}
      />
      
      <main className="flex-1 p-6 overflow-auto">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="Total Obligaciones"
            value={stats.total}
            icon={FileText}
            color="primary"
          />
          <StatCard
            title="Cumple"
            value={stats.compliant}
            icon={CheckCircle2}
            color="success"
            percentage={Math.round((stats.compliant / stats.total) * 100)}
          />
          <StatCard
            title="Cumple Parcial"
            value={stats.partiallyCompliant}
            icon={AlertTriangle}
            color="warning"
            percentage={Math.round((stats.partiallyCompliant / stats.total) * 100)}
          />
          <StatCard
            title="No Cumple"
            value={stats.nonCompliant}
            icon={XCircle}
            color="destructive"
            percentage={Math.round((stats.nonCompliant / stats.total) * 100)}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Compliance Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="w-5 h-5 text-primary" />
                Resumen de Cumplimiento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-8">
                <div className="relative w-48 h-48">
                  <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="12"
                      className="text-muted"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="12"
                      strokeDasharray={`${compliancePercentage * 2.51} 251`}
                      strokeLinecap="round"
                      className="text-primary"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold text-foreground">{compliancePercentage}%</span>
                    <span className="text-sm text-muted-foreground">Cumplimiento</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <span className="w-3 h-3 rounded-full bg-chart-1" />
                    <span className="text-xs text-muted-foreground">Cumple</span>
                  </div>
                  <p className="text-lg font-semibold">{stats.compliant}</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <span className="w-3 h-3 rounded-full bg-chart-2" />
                    <span className="text-xs text-muted-foreground">Parcial</span>
                  </div>
                  <p className="text-lg font-semibold">{stats.partiallyCompliant}</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <span className="w-3 h-3 rounded-full bg-chart-3" />
                    <span className="text-xs text-muted-foreground">No Cumple</span>
                  </div>
                  <p className="text-lg font-semibold">{stats.nonCompliant}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* By Category */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Scale className="w-5 h-5 text-primary" />
                Por Categoría Normativa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <CategoryBar label="Normativa Ambiental" value={42} max={50} color="bg-chart-1" />
                <CategoryBar label="Normativa SST" value={35} max={40} color="bg-chart-2" />
                <CategoryBar label="Normativa General" value={28} max={35} color="bg-chart-4" />
                <CategoryBar label="Normativa Laboral" value={18} max={25} color="bg-chart-5" />
                <CategoryBar label="Normativa de Energía" value={8} max={12} color="bg-chart-3" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Access */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Projects */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FolderKanban className="w-5 h-5 text-primary" />
                Proyectos Recientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockProjects.slice(0, 3).map(project => (
                  <div 
                    key={project.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer"
                  >
                    <div>
                      <p className="font-medium text-sm">{project.name}</p>
                      <p className="text-xs text-muted-foreground">{project.location}</p>
                    </div>
                    <StatusBadge status={project.status} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pending Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="w-5 h-5 text-primary" />
                Pendientes de Revisión
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockLegalBodies.slice(0, 3).map(body => (
                  <div 
                    key={body.id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{body.name}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{body.ministry}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  color,
  percentage 
}: { 
  title: string
  value: number
  icon: React.ComponentType<{ className?: string }>
  color: 'primary' | 'success' | 'warning' | 'destructive'
  percentage?: number
}) {
  const colorClasses = {
    primary: 'bg-primary/10 text-primary',
    success: 'bg-chart-1/10 text-chart-1',
    warning: 'bg-chart-2/10 text-chart-2',
    destructive: 'bg-chart-3/10 text-chart-3',
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {percentage !== undefined && (
              <p className="text-xs text-muted-foreground mt-1">{percentage}% del total</p>
            )}
          </div>
          <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function CategoryBar({ 
  label, 
  value, 
  max, 
  color 
}: { 
  label: string
  value: number
  max: number
  color: string 
}) {
  const percentage = (value / max) * 100
  
  return (
    <div>
      <div className="flex justify-between text-sm mb-1.5">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value}/{max}</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div 
          className={`h-full ${color} rounded-full transition-all`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { label: string; className: string }> = {
    identification: { label: 'Identificación', className: 'bg-chart-2/20 text-chart-2' },
    evaluation: { label: 'Evaluación', className: 'bg-chart-1/20 text-chart-1' },
    control: { label: 'Control', className: 'bg-chart-4/20 text-chart-4' },
    completed: { label: 'Completado', className: 'bg-chart-5/20 text-chart-5' },
  }
  
  const config = statusConfig[status] || statusConfig.identification
  
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.className}`}>
      {config.label}
    </span>
  )
}
