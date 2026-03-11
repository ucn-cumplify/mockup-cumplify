'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
  UserCircle,
  Mail,
  Building2,
  Shield,
  Save,
  CalendarDays,
  Clock,
} from 'lucide-react'

interface ProfileData {
  name: string
  email: string
  role: string
  company: string
  phone: string
}

export function PerfilPage() {
  const [profile, setProfile] = useState<ProfileData>({
    name: 'Carlos Mendoza',
    email: 'carlos@empresa.cl',
    role: 'Administrador',
    company: 'Mi Empresa S.A.',
    phone: '+56 9 1234 5678',
  })

  const handleSave = () => {
    toast.success('Cambios guardados correctamente')
  }

  const initials = profile.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-6">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground tracking-tight text-balance">Perfil</h1>
        <p className="text-sm text-muted-foreground mt-1">Gestiona tu informacion personal</p>
      </div>

      <div className="flex flex-col gap-6">
        {/* Profile overview card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-5">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="text-xl bg-primary/10 text-primary font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-foreground">{profile.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs font-normal">
                    <Shield className="mr-1 h-3 w-3" />
                    {profile.role}
                  </Badge>
                  <Badge variant="secondary" className="text-xs font-normal">
                    <Building2 className="mr-1 h-3 w-3" />
                    {profile.company}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" />
                  {profile.email}
                </p>
              </div>
              <Button variant="outline" size="sm" className="shrink-0">
                Cambiar foto
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Personal info form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <UserCircle className="h-4 w-4" />
              Informacion Personal
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="name">Nombre completo</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Correo electronico</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="phone">Telefono</Label>
                <Input
                  id="phone"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="company">Empresa</Label>
                <Input
                  id="company"
                  value={profile.company}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="role">Rol</Label>
                <Input
                  id="role"
                  value={profile.role}
                  disabled
                  className="bg-muted"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-primary-foreground" onClick={handleSave}>
                <Save className="h-4 w-4" />
                Guardar cambios
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Activity card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Actividad
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 rounded-lg border border-border bg-secondary/30 p-4">
                <CalendarDays className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Fecha de ingreso</p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">15/03/2024</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg border border-border bg-secondary/30 p-4">
                <Clock className="h-5 w-5 text-chart-2 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Ultima conexion</p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">18/02/2026 - 09:14</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
