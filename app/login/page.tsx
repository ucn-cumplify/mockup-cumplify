'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Leaf, LogIn, ArrowRight, Eye, EyeOff, ShieldCheck } from 'lucide-react'

export default function LoginPage() {
  const { login, loginMockup, loginSuperadmin, isAuthenticated, role } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // If already authenticated, redirect based on role
  if (isAuthenticated) {
    router.push(role === 'superadmin' ? '/superadmin' : '/')
    return null
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    login(email, password)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      {/* Background subtle pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/[0.03]" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-primary/[0.03]" />
      </div>

      <div className="relative w-full max-w-md flex flex-col items-center">
        {/* Logo & Brand */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground mb-4">
            <Leaf className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Cumplify</h1>
        </div>

        {/* Login Card */}
        <Card className="w-full border border-border shadow-lg">
          <CardContent className="p-8">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-foreground">Iniciar sesion</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Ingresa tus credenciales para acceder a la plataforma
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Correo electronico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  className="h-11"
                />
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Contrasena</Label>
                  <button
                    type="button"
                    className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
                    onClick={() => {}}
                  >
                    Olvidaste tu contrasena?
                  </button>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Ingresa tu contrasena"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    className="h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showPassword ? 'Ocultar contrasena' : 'Mostrar contrasena'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="h-11 w-full font-medium mt-1">
                <LogIn className="mr-2 h-4 w-4" />
                Iniciar sesion
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-card px-3 text-muted-foreground">o bien</span>
              </div>
            </div>

            {/* Mockup entry buttons */}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="h-12 flex-1 font-medium border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5 text-foreground"
                onClick={loginMockup}
              >
                <ArrowRight className="mr-2 h-4 w-4 text-primary" />
                Entrar como Usuario (mockup)
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-12 flex-1 font-medium border-2 border-muted-foreground/20 hover:border-muted-foreground/40 hover:bg-muted/50 text-foreground"
                onClick={loginSuperadmin}
              >
                <ShieldCheck className="mr-2 h-4 w-4 text-muted-foreground" />
                Ingresar como Superadministrador (mockup)
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <div className="mt-6 rounded-lg border border-border bg-muted/50 px-4 py-3 text-center">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Este login es parte del mockup. La autenticacion real se implementara posteriormente.
          </p>
        </div>
      </div>
    </div>
  )
}
