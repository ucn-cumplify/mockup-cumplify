'use client'

import React, { useState } from 'react'
import { useApp } from '@/lib/app-context'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  User,
  Mail,
  Building,
  Shield,
  Calendar,
  Save,
} from 'lucide-react'
import { roleLabels } from '@/lib/mock-data'

export function PerfilSection() {
  const { currentUser, updateUser } = useApp()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    department: currentUser?.department || '',
  })

  if (!currentUser) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">No hay usuario autenticado</p>
      </div>
    )
  }

  const handleSave = () => {
    updateUser(currentUser.id, formData)
    setIsEditing(false)
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <PageHeader 
        title="Mi Perfil"
        breadcrumbs={[{ label: 'Cuenta' }, { label: 'Perfil' }]}
      />

      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Profile Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <Avatar className="w-24 h-24">
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                    {currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 text-center sm:text-left">
                  <h2 className="text-2xl font-bold mb-1">{currentUser.name}</h2>
                  <p className="text-muted-foreground mb-3">{currentUser.email}</p>
                  <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                    <Badge variant="secondary" className="gap-1">
                      <Shield className="w-3 h-3" />
                      {roleLabels[currentUser.role]}
                    </Badge>
                    {currentUser.department && (
                      <Badge variant="outline" className="gap-1">
                        <Building className="w-3 h-3" />
                        {currentUser.department}
                      </Badge>
                    )}
                  </div>
                </div>

                <Button 
                  variant={isEditing ? 'secondary' : 'default'}
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? 'Cancelar' : 'Editar Perfil'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Información Personal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre Completo</Label>
                    <Input 
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Departamento</Label>
                    <Input 
                      id="department"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    />
                  </div>
                  <Button onClick={handleSave} className="gap-2">
                    <Save className="w-4 h-4" />
                    Guardar Cambios
                  </Button>
                </>
              ) : (
                <div className="grid gap-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <User className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Nombre</p>
                      <p className="font-medium">{currentUser.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Mail className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="font-medium">{currentUser.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Building className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Departamento</p>
                      <p className="font-medium">{currentUser.department || 'No asignado'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Miembro desde</p>
                      <p className="font-medium">{currentUser.createdAt.toLocaleDateString('es-CL', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Permissions Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Permisos y Accesos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <PermissionItem 
                  label="Gestión de Proyectos" 
                  hasAccess={['super_admin', 'admin'].includes(currentUser.role)} 
                />
                <PermissionItem 
                  label="Evaluación de Cumplimiento" 
                  hasAccess={['super_admin', 'admin', 'evaluator'].includes(currentUser.role)} 
                />
                <PermissionItem 
                  label="Administración de Usuarios" 
                  hasAccess={['super_admin', 'admin'].includes(currentUser.role)} 
                />
                <PermissionItem 
                  label="Gestión de Normas Internas" 
                  hasAccess={currentUser.role === 'super_admin'} 
                />
                <PermissionItem 
                  label="Carga de Evidencias" 
                  hasAccess={true} 
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

function PermissionItem({ label, hasAccess }: { label: string; hasAccess: boolean }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
      <span className="text-sm">{label}</span>
      <Badge variant={hasAccess ? 'default' : 'secondary'} className={hasAccess ? 'bg-chart-1 hover:bg-chart-1' : ''}>
        {hasAccess ? 'Habilitado' : 'No disponible'}
      </Badge>
    </div>
  )
}
