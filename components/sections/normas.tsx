'use client'

import React, { useState } from 'react'
import { useApp } from '@/lib/app-context'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Plus,
  Search,
  FileText,
  Edit2,
  Trash2,
  Calendar,
  Building2,
  Eye,
} from 'lucide-react'
import type { LegalBody } from '@/lib/types'
import { categoryLabels } from '@/lib/mock-data'

export function NormasSection() {
  const { legalBodies, addLegalBody, deleteLegalBody } = useApp()
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  // Only show internal norms
  const internalNorms = legalBodies.filter(b => b.isInternal)
  
  const filteredNorms = internalNorms.filter(norm =>
    norm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    norm.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCreateNorm = (data: Partial<LegalBody>) => {
    const newNorm: LegalBody = {
      id: `norm-${Date.now()}`,
      name: data.name || '',
      shortName: data.shortName || data.name || '',
      description: data.description || '',
      ministry: data.ministry || 'Interno',
      publicationDate: data.publicationDate || new Date().toISOString().split('T')[0],
      promulgationDate: data.promulgationDate || new Date().toISOString().split('T')[0],
      category: data.category || 'general',
      isInternal: true,
      articles: []
    }
    addLegalBody(newNorm)
    setIsCreateOpen(false)
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <PageHeader 
        title="Normas Internas"
        breadcrumbs={[{ label: 'Administración' }, { label: 'Normas' }]}
      />

      <main className="flex-1 p-6 overflow-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar normas internas..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Nueva Norma
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Crear Norma Interna</DialogTitle>
              </DialogHeader>
              <NormForm onSubmit={handleCreateNorm} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Info Card */}
        <Card className="mb-6 border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Normas Internas del Sistema</h3>
                <p className="text-sm text-muted-foreground">
                  Aquí puedes gestionar las normas internas de la empresa que no provienen de la Biblioteca del Congreso Nacional.
                  Estas normas pueden ser políticas internas, procedimientos, instructivos u otros documentos normativos propios de la organización.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Norms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNorms.map(norm => (
            <NormCard 
              key={norm.id} 
              norm={norm}
              onDelete={() => deleteLegalBody(norm.id)}
            />
          ))}

          {filteredNorms.length === 0 && (
            <Card className="col-span-full">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="w-12 h-12 text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground mb-4">No hay normas internas registradas</p>
                <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Crear Primera Norma
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}

function NormCard({ norm, onDelete }: { norm: LegalBody; onDelete: () => void }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <Badge variant="secondary">{categoryLabels[norm.category]}</Badge>
        </div>

        <h3 className="font-semibold mb-1 line-clamp-1">{norm.name}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {norm.description || 'Sin descripción'}
        </p>

        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {norm.publicationDate}
          </span>
          <span className="flex items-center gap-1">
            <Building2 className="w-3 h-3" />
            {norm.ministry}
          </span>
        </div>

        <div className="flex items-center gap-2 pt-3 border-t border-border">
          <Button variant="outline" size="sm" className="flex-1 gap-1 bg-transparent">
            <Eye className="w-4 h-4" />
            Ver
          </Button>
          <Button variant="outline" size="sm" className="flex-1 gap-1 bg-transparent">
            <Edit2 className="w-4 h-4" />
            Editar
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-destructive hover:bg-destructive hover:text-destructive-foreground bg-transparent"
            onClick={onDelete}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function NormForm({ onSubmit }: { onSubmit: (data: Partial<LegalBody>) => void }) {
  const [formData, setFormData] = useState<Partial<LegalBody>>({
    name: '',
    shortName: '',
    description: '',
    ministry: 'Interno',
    category: 'general',
    publicationDate: new Date().toISOString().split('T')[0],
    promulgationDate: new Date().toISOString().split('T')[0],
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nombre de la Norma</Label>
        <Input 
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Ej: Política Ambiental Corporativa"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="shortName">Nombre Corto</Label>
        <Input 
          id="shortName"
          value={formData.shortName}
          onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
          placeholder="Ej: PAC-001"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="ministry">Área / Departamento</Label>
        <Input 
          id="ministry"
          value={formData.ministry}
          onChange={(e) => setFormData({ ...formData, ministry: e.target.value })}
          placeholder="Ej: Gerencia Ambiental"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Categoría</Label>
        <Select 
          value={formData.category} 
          onValueChange={(v) => setFormData({ ...formData, category: v as LegalBody['category'] })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar categoría" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(categoryLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="publicationDate">Fecha de Vigencia</Label>
          <Input 
            id="publicationDate"
            type="date"
            value={formData.publicationDate}
            onChange={(e) => setFormData({ ...formData, publicationDate: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="promulgationDate">Fecha de Aprobación</Label>
          <Input 
            id="promulgationDate"
            type="date"
            value={formData.promulgationDate}
            onChange={(e) => setFormData({ ...formData, promulgationDate: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descripción</Label>
        <Textarea 
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Descripción de la norma interna..."
          rows={4}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit">Crear Norma</Button>
      </div>
    </form>
  )
}
