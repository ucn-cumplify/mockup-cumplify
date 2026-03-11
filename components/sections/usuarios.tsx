'use client'

import React, { useState } from 'react'
import { useApp } from '@/lib/app-context'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  Plus,
  Search,
  Edit2,
  Trash2,
  Mail,
  Building,
  Shield,
  MoreHorizontal,
} from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import type { User } from '@/lib/types'
import { roleLabels } from '@/lib/mock-data'

export function UsuariosSection() {
  const { users, addUser, updateUser, deleteUser } = useApp()
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCreateUser = (data: Partial<User>) => {
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: data.name || '',
      email: data.email || '',
      role: data.role || 'operator',
      department: data.department || '',
      createdAt: new Date(),
    }
    addUser(newUser)
    setIsCreateOpen(false)
  }

  const handleUpdateUser = (data: Partial<User>) => {
    if (editingUser) {
      updateUser(editingUser.id, data)
      setEditingUser(null)
    }
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <PageHeader 
        title="Usuarios"
        breadcrumbs={[{ label: 'Configuración' }, { label: 'Usuarios' }]}
      />

      <main className="flex-1 p-6 overflow-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar usuarios..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Nuevo Usuario
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Crear Usuario</DialogTitle>
              </DialogHeader>
              <UserForm onSubmit={handleCreateUser} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <p className="text-2xl font-bold">{users.length}</p>
              <p className="text-sm text-muted-foreground">Total Usuarios</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-2xl font-bold">{users.filter(u => u.role === 'admin' || u.role === 'super_admin').length}</p>
              <p className="text-sm text-muted-foreground">Administradores</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-2xl font-bold">{users.filter(u => u.role === 'evaluator').length}</p>
              <p className="text-sm text-muted-foreground">Evaluadores</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-2xl font-bold">{users.filter(u => u.role === 'operator').length}</p>
              <p className="text-sm text-muted-foreground">Operadores</p>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Departamento</TableHead>
                  <TableHead>Fecha Creación</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map(user => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{user.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground">{user.email}</span>
                    </TableCell>
                    <TableCell>
                      <RoleBadge role={user.role} />
                    </TableCell>
                    <TableCell>{user.department || '-'}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {user.createdAt.toLocaleDateString('es-CL')}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditingUser(user)}>
                            <Edit2 className="w-4 h-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => deleteUser(user.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}

                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No se encontraron usuarios
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Editar Usuario</DialogTitle>
            </DialogHeader>
            {editingUser && (
              <UserForm 
                initialData={editingUser} 
                onSubmit={handleUpdateUser} 
              />
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}

function RoleBadge({ role }: { role: User['role'] }) {
  const config: Record<User['role'], { label: string; className: string }> = {
    super_admin: { label: 'Super Admin', className: 'bg-chart-4/20 text-chart-4' },
    admin: { label: 'Administrador', className: 'bg-chart-1/20 text-chart-1' },
    evaluator: { label: 'Evaluador', className: 'bg-chart-2/20 text-chart-2' },
    area_manager: { label: 'Enc. de Área', className: 'bg-chart-5/20 text-chart-5' },
    operator: { label: 'Operador', className: 'bg-muted text-muted-foreground' },
  }
  const { label, className } = config[role]

  return <Badge className={className}>{label}</Badge>
}

function UserForm({ 
  initialData,
  onSubmit 
}: { 
  initialData?: User
  onSubmit: (data: Partial<User>) => void 
}) {
  const [formData, setFormData] = useState<Partial<User>>({
    name: initialData?.name || '',
    email: initialData?.email || '',
    role: initialData?.role || 'operator',
    department: initialData?.department || '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nombre Completo</Label>
        <Input 
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Juan Pérez"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input 
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="juan@empresa.cl"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Rol</Label>
        <Select 
          value={formData.role} 
          onValueChange={(v) => setFormData({ ...formData, role: v as User['role'] })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar rol" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(roleLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="department">Departamento</Label>
        <Input 
          id="department"
          value={formData.department}
          onChange={(e) => setFormData({ ...formData, department: e.target.value })}
          placeholder="Ej: Gestión Ambiental"
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit">
          {initialData ? 'Guardar Cambios' : 'Crear Usuario'}
        </Button>
      </div>
    </form>
  )
}
