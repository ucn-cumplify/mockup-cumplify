'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Building2,
  Users,
  AppWindow,
  Search,
  Eye,
  Pause,
  Play,
  ArrowLeft,
  CreditCard,
  BarChart3,
  Clock,
} from 'lucide-react'

// ---- Mock data ----

interface Empresa {
  id: string
  name: string
  rut: string
  plan: string
  totalUsers: number
  activeApps: number
  status: 'activa' | 'suspendida'
  createdAt: string
  lastActivity: string
  contactEmail: string
  users: EmpresaUser[]
  apps: EmpresaApp[]
  payments: EmpresaPayment[]
}

interface EmpresaUser {
  id: string
  name: string
  email: string
  roles: string[]
  lastLogin: string
  lastAccess: string
}

interface EmpresaApp {
  id: string
  name: string
  category: string
  status: 'activa' | 'inactiva'
  createdAt: string
}

interface EmpresaPayment {
  id: string
  date: string
  amount: string
  method: string
  status: 'pagado' | 'pendiente' | 'vencido'
}

const mockEmpresas: Empresa[] = [
  {
    id: 'e1',
    name: 'Minera Los Andes S.A.',
    rut: '76.123.456-7',
    plan: 'Enterprise',
    totalUsers: 32,
    activeApps: 8,
    status: 'activa',
    createdAt: '2025-03-15',
    lastActivity: '2026-02-18',
    contactEmail: 'admin@mineralosandes.cl',
    users: [
      { id: 'u1', name: 'Carlos Mendoza', email: 'carlos.mendoza@mineralosandes.cl', roles: ['Administrador'], lastLogin: '2026-02-18 09:30', lastAccess: '2026-02-18 14:22' },
      { id: 'u2', name: 'Maria Gonzalez', email: 'maria.gonzalez@mineralosandes.cl', roles: ['Evaluador', 'Encargado de Area'], lastLogin: '2026-02-17 11:15', lastAccess: '2026-02-17 17:45' },
      { id: 'u3', name: 'Juan Perez', email: 'juan.perez@mineralosandes.cl', roles: ['Operador'], lastLogin: '2026-02-16 08:00', lastAccess: '2026-02-16 16:30' },
      { id: 'u4', name: 'Ana Silva', email: 'ana.silva@mineralosandes.cl', roles: ['Evaluador'], lastLogin: '2026-02-15 10:00', lastAccess: '2026-02-15 15:10' },
    ],
    apps: [
      { id: 'a1', name: 'Manejo de Residuos', category: 'Residuos', status: 'activa', createdAt: '2025-04-10' },
      { id: 'a2', name: 'Matriz de Riesgos', category: 'Riesgos', status: 'activa', createdAt: '2025-05-20' },
      { id: 'a3', name: 'Control de Monitoreos', category: 'Monitoreo', status: 'activa', createdAt: '2025-06-01' },
    ],
    payments: [
      { id: 'p1', date: '2026-02-01', amount: '$1.200.000', method: 'Transferencia', status: 'pagado' },
      { id: 'p2', date: '2026-01-01', amount: '$1.200.000', method: 'Transferencia', status: 'pagado' },
      { id: 'p3', date: '2025-12-01', amount: '$1.100.000', method: 'Tarjeta', status: 'pagado' },
    ],
  },
  {
    id: 'e2',
    name: 'Aguas del Valle S.A.',
    rut: '76.234.567-8',
    plan: 'Professional',
    totalUsers: 18,
    activeApps: 5,
    status: 'activa',
    createdAt: '2025-05-20',
    lastActivity: '2026-02-17',
    contactEmail: 'contacto@aguasdelvalle.cl',
    users: [
      { id: 'u5', name: 'Pedro Lopez', email: 'pedro.lopez@aguasdelvalle.cl', roles: ['Administrador'], lastLogin: '2026-02-17 08:45', lastAccess: '2026-02-17 18:00' },
      { id: 'u6', name: 'Sofia Reyes', email: 'sofia.reyes@aguasdelvalle.cl', roles: ['Evaluador'], lastLogin: '2026-02-16 09:00', lastAccess: '2026-02-16 14:30' },
    ],
    apps: [
      { id: 'a4', name: 'Control de Monitoreos', category: 'Monitoreo', status: 'activa', createdAt: '2025-06-15' },
      { id: 'a5', name: 'Gestion ESG', category: 'ESG', status: 'activa', createdAt: '2025-07-01' },
    ],
    payments: [
      { id: 'p4', date: '2026-02-01', amount: '$650.000', method: 'Transferencia', status: 'pagado' },
      { id: 'p5', date: '2026-01-01', amount: '$650.000', method: 'Transferencia', status: 'pagado' },
    ],
  },
  {
    id: 'e3',
    name: 'Constructora ABC Ltda.',
    rut: '76.345.678-9',
    plan: 'Starter',
    totalUsers: 6,
    activeApps: 2,
    status: 'suspendida',
    createdAt: '2025-08-10',
    lastActivity: '2026-01-05',
    contactEmail: 'admin@constructoraabc.cl',
    users: [
      { id: 'u7', name: 'Roberto Diaz', email: 'roberto.diaz@constructoraabc.cl', roles: ['Administrador'], lastLogin: '2026-01-05 11:00', lastAccess: '2026-01-05 12:15' },
    ],
    apps: [
      { id: 'a6', name: 'Matriz de Riesgos', category: 'Riesgos', status: 'inactiva', createdAt: '2025-09-01' },
    ],
    payments: [
      { id: 'p6', date: '2026-01-01', amount: '$250.000', method: 'Tarjeta', status: 'vencido' },
      { id: 'p7', date: '2025-12-01', amount: '$250.000', method: 'Tarjeta', status: 'pagado' },
    ],
  },
  {
    id: 'e4',
    name: 'Energias Renovables SpA',
    rut: '76.456.789-0',
    plan: 'Professional',
    totalUsers: 14,
    activeApps: 4,
    status: 'activa',
    createdAt: '2025-06-01',
    lastActivity: '2026-02-18',
    contactEmail: 'info@energiasrenovables.cl',
    users: [
      { id: 'u8', name: 'Laura Torres', email: 'laura.torres@energiasrenovables.cl', roles: ['Administrador', 'Evaluador'], lastLogin: '2026-02-18 07:30', lastAccess: '2026-02-18 16:45' },
      { id: 'u9', name: 'Diego Morales', email: 'diego.morales@energiasrenovables.cl', roles: ['Operador'], lastLogin: '2026-02-17 13:00', lastAccess: '2026-02-17 17:00' },
    ],
    apps: [
      { id: 'a7', name: 'Gestion ESG', category: 'ESG', status: 'activa', createdAt: '2025-07-15' },
      { id: 'a8', name: 'Certificaciones', category: 'Certificaciones', status: 'activa', createdAt: '2025-08-01' },
    ],
    payments: [
      { id: 'p8', date: '2026-02-01', amount: '$650.000', method: 'Transferencia', status: 'pagado' },
    ],
  },
  {
    id: 'e5',
    name: 'Forestal del Sur S.A.',
    rut: '76.567.890-1',
    plan: 'Enterprise',
    totalUsers: 28,
    activeApps: 6,
    status: 'activa',
    createdAt: '2025-04-01',
    lastActivity: '2026-02-16',
    contactEmail: 'cumplimiento@forestaldelsur.cl',
    users: [
      { id: 'u10', name: 'Camila Herrera', email: 'camila.herrera@forestaldelsur.cl', roles: ['Administrador'], lastLogin: '2026-02-16 10:00', lastAccess: '2026-02-16 18:30' },
    ],
    apps: [
      { id: 'a9', name: 'Manejo de Residuos', category: 'Residuos', status: 'activa', createdAt: '2025-04-20' },
      { id: 'a10', name: 'Sustancias Peligrosas', category: 'Sustancias', status: 'activa', createdAt: '2025-05-10' },
    ],
    payments: [
      { id: 'p9', date: '2026-02-01', amount: '$1.200.000', method: 'Transferencia', status: 'pagado' },
    ],
  },
  {
    id: 'e6',
    name: 'Pesquera Oceano Ltda.',
    rut: '76.678.901-2',
    plan: 'Starter',
    totalUsers: 4,
    activeApps: 1,
    status: 'suspendida',
    createdAt: '2025-10-15',
    lastActivity: '2025-12-20',
    contactEmail: 'admin@pesqueraOceano.cl',
    users: [
      { id: 'u11', name: 'Miguel Fuentes', email: 'miguel.fuentes@pesqueraoceano.cl', roles: ['Administrador'], lastLogin: '2025-12-20 09:00', lastAccess: '2025-12-20 10:15' },
    ],
    apps: [
      { id: 'a11', name: 'Control de Monitoreos', category: 'Monitoreo', status: 'inactiva', createdAt: '2025-11-01' },
    ],
    payments: [
      { id: 'p10', date: '2026-01-01', amount: '$250.000', method: 'Tarjeta', status: 'vencido' },
    ],
  },
  {
    id: 'e7',
    name: 'Minera Norte SpA',
    rut: '76.789.012-3',
    plan: 'Professional',
    totalUsers: 10,
    activeApps: 3,
    status: 'activa',
    createdAt: '2026-02-01',
    lastActivity: '2026-02-18',
    contactEmail: 'soporte@mineranorte.cl',
    users: [
      { id: 'u12', name: 'Fernanda Vega', email: 'fernanda.vega@mineranorte.cl', roles: ['Administrador'], lastLogin: '2026-02-18 08:00', lastAccess: '2026-02-18 15:30' },
    ],
    apps: [
      { id: 'a12', name: 'Matriz de Riesgos', category: 'Riesgos', status: 'activa', createdAt: '2026-02-05' },
    ],
    payments: [
      { id: 'p11', date: '2026-02-15', amount: '$650.000', method: 'Transferencia', status: 'pendiente' },
    ],
  },
]

// ---- Component ----

export function SuperadminEmpresas({
  selectedEmpresaId,
  onSelectedEmpresaChange,
}: {
  selectedEmpresaId: string | null
  onSelectedEmpresaChange: (id: string | null) => void
}) {
  const [search, setSearch] = useState('')
  const [empresas, setEmpresas] = useState(mockEmpresas)

  const filtered = empresas.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.rut.includes(search)
  )

  const selectedEmpresa = selectedEmpresaId ? empresas.find(e => e.id === selectedEmpresaId) : null

  const toggleStatus = (id: string) => {
    setEmpresas(prev => prev.map(e =>
      e.id === id ? { ...e, status: e.status === 'activa' ? 'suspendida' as const : 'activa' as const } : e
    ))
  }

  // ---- Detail view ----
  if (selectedEmpresa) {
    return (
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onSelectedEmpresaChange(null)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-foreground tracking-tight">{selectedEmpresa.name}</h1>
              <Badge
                variant="outline"
                className={selectedEmpresa.status === 'activa'
                  ? 'border-emerald-500/40 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30'
                  : 'border-destructive/40 text-destructive bg-destructive/5'}
              >
                {selectedEmpresa.status === 'activa' ? 'Activa' : 'Suspendida'}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              RUT: {selectedEmpresa.rut} &middot; Plan: {selectedEmpresa.plan} &middot; Creada: {selectedEmpresa.createdAt}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toggleStatus(selectedEmpresa.id)}
            className={selectedEmpresa.status === 'activa'
              ? 'text-destructive hover:text-destructive border-destructive/30'
              : 'text-emerald-700 hover:text-emerald-700 border-emerald-500/30'}
          >
            {selectedEmpresa.status === 'activa' ? (
              <><Pause className="mr-1.5 h-3.5 w-3.5" /> Suspender</>
            ) : (
              <><Play className="mr-1.5 h-3.5 w-3.5" /> Reactivar</>
            )}
          </Button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card className="border border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-foreground/5">
                <Users className="h-4 w-4 text-foreground/60" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">{selectedEmpresa.totalUsers}</p>
                <p className="text-xs text-muted-foreground">Usuarios</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-foreground/5">
                <AppWindow className="h-4 w-4 text-foreground/60" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">{selectedEmpresa.activeApps}</p>
                <p className="text-xs text-muted-foreground">Apps activas</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-foreground/5">
                <BarChart3 className="h-4 w-4 text-foreground/60" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">{selectedEmpresa.plan}</p>
                <p className="text-xs text-muted-foreground">Plan</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-foreground/5">
                <Clock className="h-4 w-4 text-foreground/60" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground truncate">{selectedEmpresa.lastActivity}</p>
                <p className="text-xs text-muted-foreground">Ultima actividad</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="resumen" className="w-full">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="resumen">Resumen</TabsTrigger>
            <TabsTrigger value="usuarios">Usuarios</TabsTrigger>
            <TabsTrigger value="apps">Aplicaciones activas</TabsTrigger>
            <TabsTrigger value="pagos">Historial de pagos</TabsTrigger>
          </TabsList>

          <TabsContent value="resumen" className="mt-4">
            <Card className="border border-border">
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Nombre</p>
                    <p className="font-medium text-foreground">{selectedEmpresa.name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">RUT</p>
                    <p className="font-medium text-foreground">{selectedEmpresa.rut}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Plan</p>
                    <p className="font-medium text-foreground">{selectedEmpresa.plan}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Email de contacto</p>
                    <p className="font-medium text-foreground">{selectedEmpresa.contactEmail}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Fecha de creacion</p>
                    <p className="font-medium text-foreground">{selectedEmpresa.createdAt}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Ultima actividad</p>
                    <p className="font-medium text-foreground">{selectedEmpresa.lastActivity}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="usuarios" className="mt-4">
            <Card className="border border-border">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="text-left font-medium text-muted-foreground px-4 py-3">Nombre</th>
                        <th className="text-left font-medium text-muted-foreground px-4 py-3">Email</th>
                        <th className="text-left font-medium text-muted-foreground px-4 py-3">Roles</th>
                        <th className="text-left font-medium text-muted-foreground px-4 py-3">Ultimo login</th>
                        <th className="text-left font-medium text-muted-foreground px-4 py-3">Ultimo acceso</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedEmpresa.users.map(user => (
                        <tr key={user.id} className="border-b border-border last:border-b-0 hover:bg-muted/20">
                          <td className="px-4 py-3 font-medium text-foreground">{user.name}</td>
                          <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                              {user.roles.map(role => (
                                <Badge key={role} variant="secondary" className="text-[10px] h-5">{role}</Badge>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground text-xs">{user.lastLogin}</td>
                          <td className="px-4 py-3 text-muted-foreground text-xs">{user.lastAccess}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="apps" className="mt-4">
            <Card className="border border-border">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="text-left font-medium text-muted-foreground px-4 py-3">Nombre</th>
                        <th className="text-left font-medium text-muted-foreground px-4 py-3">Categoria</th>
                        <th className="text-left font-medium text-muted-foreground px-4 py-3">Estado</th>
                        <th className="text-left font-medium text-muted-foreground px-4 py-3">Fecha creacion</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedEmpresa.apps.map(app => (
                        <tr key={app.id} className="border-b border-border last:border-b-0 hover:bg-muted/20">
                          <td className="px-4 py-3 font-medium text-foreground">{app.name}</td>
                          <td className="px-4 py-3 text-muted-foreground">{app.category}</td>
                          <td className="px-4 py-3">
                            <Badge
                              variant="outline"
                              className={app.status === 'activa'
                                ? 'border-emerald-500/40 text-emerald-700 dark:text-emerald-400'
                                : 'border-muted-foreground/30 text-muted-foreground'}
                            >
                              {app.status === 'activa' ? 'Activa' : 'Inactiva'}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground text-xs">{app.createdAt}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pagos" className="mt-4">
            <Card className="border border-border">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="text-left font-medium text-muted-foreground px-4 py-3">Fecha</th>
                        <th className="text-left font-medium text-muted-foreground px-4 py-3">Monto</th>
                        <th className="text-left font-medium text-muted-foreground px-4 py-3">Metodo</th>
                        <th className="text-left font-medium text-muted-foreground px-4 py-3">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedEmpresa.payments.map(payment => (
                        <tr key={payment.id} className="border-b border-border last:border-b-0 hover:bg-muted/20">
                          <td className="px-4 py-3 text-foreground">{payment.date}</td>
                          <td className="px-4 py-3 font-medium text-foreground">{payment.amount}</td>
                          <td className="px-4 py-3 text-muted-foreground">{payment.method}</td>
                          <td className="px-4 py-3">
                            <Badge
                              variant="outline"
                              className={
                                payment.status === 'pagado' ? 'border-emerald-500/40 text-emerald-700 dark:text-emerald-400' :
                                payment.status === 'pendiente' ? 'border-amber-500/40 text-amber-700 dark:text-amber-400' :
                                'border-destructive/40 text-destructive'
                              }
                            >
                              {payment.status === 'pagado' ? 'Pagado' : payment.status === 'pendiente' ? 'Pendiente' : 'Vencido'}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    )
  }

  // ---- List view ----
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Empresas</h1>
          <p className="text-sm text-muted-foreground mt-1">Gestiona todas las empresas del sistema</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre o RUT..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-10"
        />
      </div>

      {/* Table */}
      <Card className="border border-border">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left font-medium text-muted-foreground px-4 py-3">Empresa</th>
                  <th className="text-left font-medium text-muted-foreground px-4 py-3">Usuarios</th>
                  <th className="text-left font-medium text-muted-foreground px-4 py-3">Apps activas</th>
                  <th className="text-left font-medium text-muted-foreground px-4 py-3">Plan</th>
                  <th className="text-left font-medium text-muted-foreground px-4 py-3">Estado</th>
                  <th className="text-right font-medium text-muted-foreground px-4 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(empresa => (
                  <tr key={empresa.id} className="border-b border-border last:border-b-0 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-foreground">{empresa.name}</p>
                        <p className="text-xs text-muted-foreground">{empresa.rut}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-foreground">{empresa.totalUsers}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <AppWindow className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-foreground">{empresa.activeApps}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary" className="text-[10px]">{empresa.plan}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="outline"
                        className={empresa.status === 'activa'
                          ? 'border-emerald-500/40 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30'
                          : 'border-destructive/40 text-destructive bg-destructive/5'}
                      >
                        {empresa.status === 'activa' ? 'Activa' : 'Suspendida'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button variant="ghost" size="sm" className="h-7 text-xs"
                          onClick={() => onSelectedEmpresaChange(empresa.id)}>
                          <Eye className="mr-1 h-3 w-3" />
                          Ver detalles
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`h-7 text-xs ${empresa.status === 'activa' ? 'text-destructive hover:text-destructive' : 'text-emerald-700 hover:text-emerald-700'}`}
                          onClick={() => toggleStatus(empresa.id)}
                        >
                          {empresa.status === 'activa' ? (
                            <><Pause className="mr-1 h-3 w-3" /> Suspender</>
                          ) : (
                            <><Play className="mr-1 h-3 w-3" /> Reactivar</>
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No se encontraron empresas</p>
        </div>
      )}
    </div>
  )
}
