'use client'

import React, { useState } from 'react'
import { useApp } from '@/lib/app-context'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { 
  Search, 
  Plus, 
  Upload, 
  RefreshCw, 
  FileText, 
  Eye, 
  Trash2, 
  Calendar,
  Building2,
  ChevronRight
} from 'lucide-react'
import type { LegalBody } from '@/lib/types'
import { categoryLabels } from '@/lib/mock-data'

type TabType = 'biblioteca' | 'internos' | 'obligaciones'
type SearchMode = 'id' | 'texto'

export function BibliotecaSection() {
  const { legalBodies, addLegalBody, deleteLegalBody } = useApp()
  const [activeTab, setActiveTab] = useState<TabType>('biblioteca')
  const [searchMode, setSearchMode] = useState<SearchMode>('texto')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBody, setSelectedBody] = useState<LegalBody | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const filteredBodies = legalBodies.filter(body => {
    const matchesTab = activeTab === 'biblioteca' ? !body.isInternal : 
                       activeTab === 'internos' ? body.isInternal : true
    const matchesSearch = searchQuery === '' || 
      body.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      body.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesTab && matchesSearch
  })

  const handleCreateBody = (data: Partial<LegalBody>) => {
    const newBody: LegalBody = {
      id: `lb-${Date.now()}`,
      name: data.name || '',
      shortName: data.shortName || data.name || '',
      description: data.description || '',
      ministry: data.ministry || '',
      publicationDate: data.publicationDate || new Date().toISOString().split('T')[0],
      promulgationDate: data.promulgationDate || new Date().toISOString().split('T')[0],
      category: data.category || 'general',
      isInternal: activeTab === 'internos',
      articles: []
    }
    addLegalBody(newBody)
    setIsCreateOpen(false)
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <PageHeader 
        title="Biblioteca"
        breadcrumbs={[{ label: 'Biblioteca' }, { label: 'Cuerpos Legales' }]}
      />

      <main className="flex-1 p-6 overflow-auto">
        {selectedBody ? (
          <LegalBodyDetail 
            body={selectedBody} 
            onBack={() => setSelectedBody(null)} 
          />
        ) : (
          <>
            {/* Search and Actions */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Cuerpos Legales</h2>
                <div className="flex items-center gap-4 mt-2">
                  <RadioGroup 
                    value={searchMode} 
                    onValueChange={(v) => setSearchMode(v as SearchMode)}
                    className="flex items-center gap-4"
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="id" id="search-id" />
                      <Label htmlFor="search-id" className="text-sm cursor-pointer">Por id Norma</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="texto" id="search-texto" />
                      <Label htmlFor="search-texto" className="text-sm cursor-pointer">Por texto Norma</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-none">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Buscar..."
                    className="pl-9 w-full sm:w-64"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button size="icon" variant="secondary">
                  <Search className="w-4 h-4" />
                </Button>
                
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <Plus className="w-4 h-4" />
                      <span className="hidden sm:inline">Crear Documento</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Crear Cuerpo Legal</DialogTitle>
                    </DialogHeader>
                    <CreateLegalBodyForm onSubmit={handleCreateBody} />
                  </DialogContent>
                </Dialog>
                
                <Button variant="secondary" className="gap-2">
                  <Upload className="w-4 h-4" />
                  <span className="hidden sm:inline">Carga Masiva</span>
                </Button>
                <Button variant="outline" className="gap-2 bg-transparent">
                  <RefreshCw className="w-4 h-4" />
                  <span className="hidden sm:inline">Sincronizar</span>
                </Button>
              </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabType)}>
              <TabsList className="w-full justify-start bg-transparent border-b rounded-none h-auto p-0 mb-6">
                <TabsTrigger 
                  value="biblioteca"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
                >
                  Biblioteca
                </TabsTrigger>
                <TabsTrigger 
                  value="internos"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
                >
                  Internos
                </TabsTrigger>
                <TabsTrigger 
                  value="obligaciones"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
                >
                  Obligaciones
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-0">
                {/* Table Header */}
                <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-3 bg-muted/50 rounded-t-lg text-sm font-medium text-muted-foreground">
                  <div className="col-span-2">Cuerpo Legal</div>
                  <div className="col-span-6">Encabezado</div>
                  <div className="col-span-2">Características</div>
                  <div className="col-span-2 text-right">Acción</div>
                </div>

                {/* Body List */}
                <div className="divide-y divide-border border border-t-0 rounded-b-lg">
                  {filteredBodies.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      No se encontraron cuerpos legales
                    </div>
                  ) : (
                    filteredBodies.map(body => (
                      <LegalBodyRow 
                        key={body.id} 
                        body={body} 
                        onView={() => setSelectedBody(body)}
                        onDelete={() => deleteLegalBody(body.id)}
                      />
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>
    </div>
  )
}

function LegalBodyRow({ 
  body, 
  onView, 
  onDelete 
}: { 
  body: LegalBody
  onView: () => void
  onDelete: () => void 
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 hover:bg-muted/30 transition-colors">
      <div className="md:col-span-2">
        <p className="font-semibold text-primary">{body.name}</p>
        <p className="text-sm text-muted-foreground">{body.shortName}</p>
      </div>
      <div className="md:col-span-6">
        <p className="text-sm text-foreground line-clamp-3">{body.description}</p>
      </div>
      <div className="md:col-span-2 flex flex-col gap-1">
        <p className="text-xs text-muted-foreground">
          Publicado el {formatDate(body.publicationDate)}
        </p>
        <p className="text-xs text-muted-foreground">
          Promulgación: {body.promulgationDate}
        </p>
      </div>
      <div className="md:col-span-2 flex items-center justify-end gap-2">
        <Button size="icon" variant="ghost" onClick={onView}>
          <Eye className="w-4 h-4 text-primary" />
        </Button>
        <Button size="icon" variant="ghost" onClick={onDelete}>
          <Trash2 className="w-4 h-4 text-destructive" />
        </Button>
      </div>
    </div>
  )
}

function LegalBodyDetail({ body, onBack }: { body: LegalBody; onBack: () => void }) {
  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <button onClick={onBack} className="hover:text-foreground transition-colors">
          Biblioteca
        </button>
        <ChevronRight className="w-4 h-4" />
        <span>Cuerpos Legales</span>
        <ChevronRight className="w-4 h-4" />
        <span className="text-foreground">Detalle</span>
      </div>

      {/* Search */}
      <div className="flex justify-end">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar..." className="pl-9 w-64" />
        </div>
      </div>

      {/* Detail Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-primary uppercase">{body.name}</h2>
              <p className="text-sm text-muted-foreground mt-1">{body.ministry}</p>
            </div>
            <Badge variant="secondary">{categoryLabels[body.category]}</Badge>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-sm text-muted-foreground mb-2">DESCRIPCIÓN</h3>
            <p className="text-sm text-foreground leading-relaxed">{body.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4 border-t border-b border-border">
            <div>
              <p className="text-xs text-muted-foreground uppercase">Publicación:</p>
              <p className="font-medium">{body.publicationDate}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase">Promulgación:</p>
              <p className="font-medium">{body.promulgationDate}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase">Última Modificación:</p>
              <p className="font-medium">{body.lastModificationDate || body.publicationDate}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Articles */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="md:col-span-1">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3">Contenido</h3>
            <div className="space-y-2">
              {body.articles.map(article => (
                <button 
                  key={article.id}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left rounded-lg hover:bg-muted transition-colors"
                >
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  Artículo {article.number}
                </button>
              ))}
              {body.articles.length === 0 && (
                <p className="text-sm text-muted-foreground px-3">Sin artículos</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardContent className="p-4">
            {body.articles.length > 0 ? (
              <div className="space-y-4">
                {body.articles.map(article => (
                  <div key={article.id} className="p-4 border border-border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold">Artículo {article.number}</h4>
                      <Button size="sm" variant="ghost" className="text-primary">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-foreground">{article.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="w-12 h-12 text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">No hay artículos disponibles</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-start">
        <Button variant="outline" onClick={onBack}>
          Volver a Biblioteca
        </Button>
      </div>
    </div>
  )
}

function CreateLegalBodyForm({ onSubmit }: { onSubmit: (data: Partial<LegalBody>) => void }) {
  const [formData, setFormData] = useState<Partial<LegalBody>>({
    name: '',
    shortName: '',
    description: '',
    ministry: '',
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
        <Label htmlFor="name">Nombre del Cuerpo Legal</Label>
        <Input 
          id="name" 
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Ej: Decreto 148"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="shortName">Nombre Corto</Label>
        <Input 
          id="shortName" 
          value={formData.shortName}
          onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
          placeholder="Ej: D.S. 148"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="ministry">Ministerio / Organismo</Label>
        <Input 
          id="ministry" 
          value={formData.ministry}
          onChange={(e) => setFormData({ ...formData, ministry: e.target.value })}
          placeholder="Ej: Ministerio de Salud"
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
          <Label htmlFor="publicationDate">Fecha de Publicación</Label>
          <Input 
            id="publicationDate" 
            type="date"
            value={formData.publicationDate}
            onChange={(e) => setFormData({ ...formData, publicationDate: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="promulgationDate">Fecha de Promulgación</Label>
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
          placeholder="Descripción del cuerpo legal..."
          rows={4}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit">Crear Cuerpo Legal</Button>
      </div>
    </form>
  )
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-CL', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric' 
  }).toUpperCase()
}
