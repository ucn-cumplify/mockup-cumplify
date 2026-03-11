'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Users,
  Search,
  Building2,
} from 'lucide-react'

// ---- Mock data ----

interface GlobalUser {
  id: string
  name: string
  email: string
  empresa: string
  empresaId: string
  roles: string[]
  status: 'activo' | 'bloqueado'
  lastLogin: string
}

const mockGlobalUsers: GlobalUser[] = [
  { id: 'gu1', name: 'Carlos Mendoza', email: 'carlos.mendoza@mineralosandes.cl', empresa: 'Minera Los Andes S.A.', empresaId: 'e1', roles: ['Administrador'], status: 'activo', lastLogin: '2026-02-18 09:30' },
  { id: 'gu2', name: 'Maria Gonzalez', email: 'maria.gonzalez@mineralosandes.cl', empresa: 'Minera Los Andes S.A.', empresaId: 'e1', roles: ['Evaluador', 'Encargado de Area'], status: 'activo', lastLogin: '2026-02-17 11:15' },
  { id: 'gu3', name: 'Juan Perez', email: 'juan.perez@mineralosandes.cl', empresa: 'Minera Los Andes S.A.', empresaId: 'e1', roles: ['Operador'], status: 'activo', lastLogin: '2026-02-16 08:00' },
  { id: 'gu4', name: 'Ana Silva', email: 'ana.silva@mineralosandes.cl', empresa: 'Minera Los Andes S.A.', empresaId: 'e1', roles: ['Evaluador'], status: 'bloqueado', lastLogin: '2026-01-20 10:00' },
  { id: 'gu5', name: 'Pedro Lopez', email: 'pedro.lopez@aguasdelvalle.cl', empresa: 'Aguas del Valle S.A.', empresaId: 'e2', roles: ['Administrador'], status: 'activo', lastLogin: '2026-02-17 08:45' },
  { id: 'gu6', name: 'Sofia Reyes', email: 'sofia.reyes@aguasdelvalle.cl', empresa: 'Aguas del Valle S.A.', empresaId: 'e2', roles: ['Evaluador'], status: 'activo', lastLogin: '2026-02-16 09:00' },
  { id: 'gu7', name: 'Roberto Diaz', email: 'roberto.diaz@constructoraabc.cl', empresa: 'Constructora ABC Ltda.', empresaId: 'e3', roles: ['Administrador'], status: 'bloqueado', lastLogin: '2026-01-05 11:00' },
  { id: 'gu8', name: 'Laura Torres', email: 'laura.torres@energiasrenovables.cl', empresa: 'Energias Renovables SpA', empresaId: 'e4', roles: ['Administrador', 'Evaluador'], status: 'activo', lastLogin: '2026-02-18 07:30' },
  { id: 'gu9', name: 'Diego Morales', email: 'diego.morales@energiasrenovables.cl', empresa: 'Energias Renovables SpA', empresaId: 'e4', roles: ['Operador'], status: 'activo', lastLogin: '2026-02-17 13:00' },
  { id: 'gu10', name: 'Camila Herrera', email: 'camila.herrera@forestaldelsur.cl', empresa: 'Forestal del Sur S.A.', empresaId: 'e5', roles: ['Administrador'], status: 'activo', lastLogin: '2026-02-16 10:00' },
  { id: 'gu11', name: 'Miguel Fuentes', email: 'miguel.fuentes@pesqueraoceano.cl', empresa: 'Pesquera Oceano Ltda.', empresaId: 'e6', roles: ['Administrador'], status: 'bloqueado', lastLogin: '2025-12-20 09:00' },
  { id: 'gu12', name: 'Fernanda Vega', email: 'fernanda.vega@mineranorte.cl', empresa: 'Minera Norte SpA', empresaId: 'e7', roles: ['Administrador'], status: 'activo', lastLogin: '2026-02-18 08:00' },
  { id: 'gu13', name: 'Andres Castillo', email: 'andres.castillo@mineralosandes.cl', empresa: 'Minera Los Andes S.A.', empresaId: 'e1', roles: ['Encargado de Area'], status: 'activo', lastLogin: '2026-02-14 14:30' },
  { id: 'gu14', name: 'Valentina Rojas', email: 'valentina.rojas@aguasdelvalle.cl', empresa: 'Aguas del Valle S.A.', empresaId: 'e2', roles: ['Operador'], status: 'activo', lastLogin: '2026-02-13 09:15' },
  { id: 'gu15', name: 'Sebastian Pinto', email: 'sebastian.pinto@forestaldelsur.cl', empresa: 'Forestal del Sur S.A.', empresaId: 'e5', roles: ['Evaluador', 'Operador'], status: 'activo', lastLogin: '2026-02-15 11:00' },
  { id: 'gu16', name: 'Carolina Munoz', email: 'carolina.munoz@energiasrenovables.cl', empresa: 'Energias Renovables SpA', empresaId: 'e4', roles: ['Encargado de Area'], status: 'activo', lastLogin: '2026-02-12 16:00' },
]

const empresaOptions = [
  { id: 'all', name: 'Todas las empresas' },
  { id: 'e1', name: 'Minera Los Andes S.A.' },
  { id: 'e2', name: 'Aguas del Valle S.A.' },
  { id: 'e3', name: 'Constructora ABC Ltda.' },
  { id: 'e4', name: 'Energias Renovables SpA' },
  { id: 'e5', name: 'Forestal del Sur S.A.' },
  { id: 'e6', name: 'Pesquera Oceano Ltda.' },
  { id: 'e7', name: 'Minera Norte SpA' },
]

export function SuperadminUsuarios({ onOpenEmpresa }: { onOpenEmpresa: (empresaId: string) => void }) {
  const [search, setSearch] = useState('')
  const [empresaFilter, setEmpresaFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'activo' | 'bloqueado'>('all')

  const filtered = useMemo(() => {
    return mockGlobalUsers.filter(u => {
      const matchSearch = search === '' ||
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
      const matchEmpresa = empresaFilter === 'all' || u.empresaId === empresaFilter
      const matchStatus = statusFilter === 'all' || u.status === statusFilter
      return matchSearch && matchEmpresa && matchStatus
    })
  }, [search, empresaFilter, statusFilter])

  const totalActive = mockGlobalUsers.filter(u => u.status === 'activo').length
  const totalBlocked = mockGlobalUsers.filter(u => u.status === 'bloqueado').length

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Usuarios</h1>
        <p className="text-sm text-muted-foreground mt-1">Todos los usuarios del sistema</p>
      </div>

      {/* Summary badges */}
      <div className="flex items-center gap-3">
        <Badge variant="secondary" className="h-7 px-3 text-xs gap-1.5">
          <Users className="h-3 w-3" />
          {mockGlobalUsers.length} total
        </Badge>
        <Badge variant="outline" className="h-7 px-3 text-xs gap-1.5 border-emerald-500/30 text-emerald-700 dark:text-emerald-400">
          {totalActive} activos
        </Badge>
        <Badge variant="outline" className="h-7 px-3 text-xs gap-1.5 border-destructive/30 text-destructive">
          {totalBlocked} bloqueados
        </Badge>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10"
          />
        </div>
        <Select value={empresaFilter} onValueChange={setEmpresaFilter}>
          <SelectTrigger className="w-[240px] h-10">
            <Building2 className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Filtrar por empresa" />
          </SelectTrigger>
          <SelectContent>
            {empresaOptions.map(opt => (
              <SelectItem key={opt.id} value={opt.id}>{opt.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as 'all' | 'activo' | 'bloqueado')}>
          <SelectTrigger className="w-[160px] h-10">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="activo">Activos</SelectItem>
            <SelectItem value="bloqueado">Bloqueados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card className="border border-border">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left font-medium text-muted-foreground px-4 py-3">Nombre</th>
                  <th className="text-left font-medium text-muted-foreground px-4 py-3">Email</th>
                  <th className="text-left font-medium text-muted-foreground px-4 py-3">Empresa</th>
                  <th className="text-left font-medium text-muted-foreground px-4 py-3">Roles</th>
                  <th className="text-left font-medium text-muted-foreground px-4 py-3">Estado</th>
                  <th className="text-left font-medium text-muted-foreground px-4 py-3">Ultimo login</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(user => (
                  <tr key={user.id} className="border-b border-border last:border-b-0 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">{user.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                    <td className="px-4 py-3">
                      <button
                        className="text-foreground hover:underline text-left"
                        onClick={() => onOpenEmpresa(user.empresaId)}
                      >
                        {user.empresa}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {user.roles.map(role => (
                          <Badge key={role} variant="secondary" className="text-[10px] h-5">{role}</Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="outline"
                        className={user.status === 'activo'
                          ? 'border-emerald-500/40 text-emerald-700 dark:text-emerald-400'
                          : 'border-destructive/40 text-destructive'}
                      >
                        {user.status === 'activo' ? 'Activo' : 'Bloqueado'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{user.lastLogin}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No se encontraron usuarios</p>
        </div>
      )}
    </div>
  )
}
