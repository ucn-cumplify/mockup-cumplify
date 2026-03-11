'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Building2,
  Users,
  AppWindow,
  AlertTriangle,
  CheckCircle2,
  Pause,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react'

const stats = [
  {
    title: 'Total Empresas',
    value: '24',
    change: '+3 este mes',
    icon: Building2,
    iconBg: 'bg-foreground/5',
    iconColor: 'text-foreground',
  },
  {
    title: 'Total Usuarios',
    value: '186',
    change: '+12 este mes',
    icon: Users,
    iconBg: 'bg-foreground/5',
    iconColor: 'text-foreground',
  },
  {
    title: 'Empresas Activas',
    value: '21',
    change: '87.5%',
    icon: CheckCircle2,
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-600',
  },
  {
    title: 'Empresas Suspendidas',
    value: '3',
    change: '12.5%',
    icon: Pause,
    iconBg: 'bg-destructive/10',
    iconColor: 'text-destructive',
  },
  {
    title: 'Apps Creadas',
    value: '67',
    change: '+8 este mes',
    icon: AppWindow,
    iconBg: 'bg-foreground/5',
    iconColor: 'text-foreground',
  },
  {
    title: 'Crecimiento Mensual',
    value: '+14%',
    change: 'vs. mes anterior',
    icon: TrendingUp,
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-600',
  },
]

const recentActivity = [
  { action: 'Nueva empresa registrada', detail: 'Minera Norte SpA', time: 'Hace 2 horas', type: 'create' as const },
  { action: 'Empresa suspendida', detail: 'Constructora ABC Ltda.', time: 'Hace 5 horas', type: 'suspend' as const },
  { action: 'Nuevo usuario creado', detail: 'pedro.lopez@mineranorte.cl', time: 'Hace 1 dia', type: 'user' as const },
  { action: 'Empresa reactivada', detail: 'Aguas del Valle S.A.', time: 'Hace 2 dias', type: 'reactivate' as const },
  { action: 'App creada', detail: 'Matriz de Riesgos - Energias Renovables SpA', time: 'Hace 3 dias', type: 'app' as const },
  { action: 'Nuevo usuario creado', detail: 'ana.martinez@aguasdelvalle.cl', time: 'Hace 3 dias', type: 'user' as const },
]

export function SuperadminDashboard() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Warning banner */}
      <div className="flex items-center gap-3 rounded-lg border border-amber-500/30 bg-amber-50 dark:bg-amber-950/20 px-4 py-3">
        <ShieldCheck className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
            Estas en modo Superadministrador
          </p>
          <p className="text-xs text-amber-700/70 dark:text-amber-300/60">
            Tienes acceso completo a todas las empresas, usuarios y configuraciones del sistema.
          </p>
        </div>
        <Badge variant="outline" className="border-amber-500/40 text-amber-700 dark:text-amber-300 text-[10px] shrink-0">
          Modo demo
        </Badge>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Resumen general del sistema Cumplify</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title} className="border border-border">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold text-foreground tracking-tight">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.change}</p>
                  </div>
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.iconBg}`}>
                    <Icon className={`h-5 w-5 ${stat.iconColor}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent activity */}
      <Card className="border border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-foreground">Actividad reciente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-0">
            {recentActivity.map((item, i) => (
              <div key={i} className={`flex items-center gap-4 py-3 ${i < recentActivity.length - 1 ? 'border-b border-border' : ''}`}>
                <div className={`flex h-8 w-8 items-center justify-center rounded-full shrink-0
                  ${item.type === 'create' ? 'bg-emerald-500/10' : ''}
                  ${item.type === 'suspend' ? 'bg-destructive/10' : ''}
                  ${item.type === 'user' ? 'bg-foreground/5' : ''}
                  ${item.type === 'reactivate' ? 'bg-emerald-500/10' : ''}
                  ${item.type === 'app' ? 'bg-foreground/5' : ''}
                `}>
                  {item.type === 'create' && <Building2 className="h-3.5 w-3.5 text-emerald-600" />}
                  {item.type === 'suspend' && <AlertTriangle className="h-3.5 w-3.5 text-destructive" />}
                  {item.type === 'user' && <Users className="h-3.5 w-3.5 text-foreground/60" />}
                  {item.type === 'reactivate' && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />}
                  {item.type === 'app' && <AppWindow className="h-3.5 w-3.5 text-foreground/60" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{item.action}</p>
                  <p className="text-xs text-muted-foreground truncate">{item.detail}</p>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">{item.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
