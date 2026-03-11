'use client'

import React, { useState, useMemo, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import {
  Search,
  BookOpen,
  Plus,
  FileText,
  Calendar,
  Building2,
  ChevronRight,
  MoreVertical,
  Pencil,
  Trash2,
  Upload,
  Scale,
  ExternalLink,
  Download,
  X,
} from 'lucide-react'

/* ================================================================== */
/*  MOCK DATA                                                         */
/* ================================================================== */

interface DecreeArticle {
  id: string
  number: string
  title: string
  content: string
}

interface Decree {
  id: string
  title: string
  code: string
  publishDate: string
  organism: string
  summary: string
  fullText: string
  articles: DecreeArticle[]
  bcnUrl: string
}

interface InternalNorm {
  id: string
  name: string
  code: string
  type: 'Procedimiento' | 'Politica' | 'Reglamento' | 'Otro'
  description: string
  fileName?: string
  createdAt: string
}

interface Obligation {
  id: string
  name: string
  description: string
  decreeId: string
  articleId: string
}

const mockDecrees: Decree[] = [
  {
    id: 'd1',
    title: 'Reglamento sobre Condiciones Sanitarias y Ambientales Basicas en los Lugares de Trabajo',
    code: 'Decreto Supremo N 594',
    publishDate: '2000-09-15',
    organism: 'Ministerio de Salud',
    summary: 'Establece las condiciones sanitarias y ambientales basicas que debera cumplir todo lugar de trabajo, asi como los limites permisibles de exposicion ambiental a agentes quimicos y agentes fisicos.',
    fullText: '',
    bcnUrl: 'https://www.bcn.cl/leychile/navegar?idNorma=167766',
    articles: [
      { id: 'd1-a1', number: '1', title: 'Articulo 1', content: 'Todo lugar de trabajo debera cumplir con las condiciones sanitarias y ambientales basicas que establece el presente reglamento, ademas de las que establezcan las normas especificas vigentes.' },
      { id: 'd1-a2', number: '2', title: 'Articulo 2', content: 'Correspondera a las Secretarias Regionales Ministeriales de Salud y a los demas organismos competentes, fiscalizar y controlar el cumplimiento de las disposiciones del presente reglamento.' },
      { id: 'd1-a3', number: '3', title: 'Articulo 3', content: 'La empresa esta obligada a mantener en los lugares de trabajo las condiciones sanitarias y ambientales necesarias para proteger la vida y la salud de los trabajadores que en ellos se desempenan.' },
      { id: 'd1-a4', number: '4', title: 'Articulo 4', content: 'Los pisos de los lugares de trabajo, asi como los pasillos de transito, se mantendran libres de todo obstaculo y seran de material resistente al desgaste, no resbaladizos y faciles de lavar.' },
      { id: 'd1-a5', number: '5', title: 'Articulo 5', content: 'Las paredes interiores de los lugares de trabajo, los cielos rasos, puertas y ventanas y demas elementos estructurales, seran mantenidos en buen estado de limpieza y conservacion.' },
    ],
  },
  {
    id: 'd2',
    title: 'Reglamento para el Manejo de Lodos Generados en Plantas de Tratamiento de Aguas Servidas',
    code: 'Decreto Supremo N 4',
    publishDate: '2009-11-03',
    organism: 'Ministerio Secretaria General de la Presidencia',
    summary: 'Regula el manejo de lodos provenientes de plantas de tratamiento de aguas servidas, estableciendo los requisitos para su disposicion final, tratamiento y aplicacion beneficiosa al suelo.',
    fullText: '',
    bcnUrl: 'https://www.bcn.cl/leychile/navegar?idNorma=1007456',
    articles: [
      { id: 'd2-a1', number: '1', title: 'Articulo 1', content: 'El presente reglamento establece las normas sanitarias minimas para el manejo de lodos generados en plantas de tratamiento de aguas servidas.' },
      { id: 'd2-a2', number: '2', title: 'Articulo 2', content: 'Las definiciones utilizadas en el presente reglamento corresponden a las establecidas en la normativa ambiental y sanitaria vigente.' },
      { id: 'd2-a3', number: '3', title: 'Articulo 3', content: 'Todo generador de lodos debera contar con un plan de manejo de lodos aprobado por la autoridad sanitaria correspondiente.' },
    ],
  },
  {
    id: 'd3',
    title: 'Norma de Emision para la Regulacion de Contaminantes Asociados a las Descargas de Residuos Liquidos a Aguas Marinas y Continentales Superficiales',
    code: 'Decreto Supremo N 90',
    publishDate: '2001-03-07',
    organism: 'Ministerio Secretaria General de la Presidencia',
    summary: 'Establece los limites maximos permitidos para la descarga de residuos liquidos a cuerpos de aguas marinas y continentales superficiales.',
    fullText: '',
    bcnUrl: 'https://www.bcn.cl/leychile/navegar?idNorma=182637',
    articles: [
      { id: 'd3-a1', number: '1', title: 'Articulo 1', content: 'La presente norma tiene como objetivo la proteccion ambiental de las aguas marinas y continentales superficiales de la Republica.' },
      { id: 'd3-a2', number: '2', title: 'Articulo 2', content: 'Se aplicara a todas las descargas de residuos liquidos que se realicen a cuerpos de aguas marinas y continentales superficiales.' },
      { id: 'd3-a3', number: '3', title: 'Articulo 3', content: 'Todo establecimiento que descargue residuos liquidos debera cumplir con los limites maximos permitidos establecidos en las tablas del presente decreto.' },
      { id: 'd3-a4', number: '4', title: 'Articulo 4', content: 'Los responsables de las fuentes emisoras deberan presentar los programas de monitoreo ante la Superintendencia del Medio Ambiente.' },
    ],
  },
  {
    id: 'd4',
    title: 'Reglamento de Seguridad Minera',
    code: 'Decreto Supremo N 132',
    publishDate: '2004-02-07',
    organism: 'Ministerio de Mineria',
    summary: 'Establece las normas de seguridad que deben cumplir las faenas de la industria extractiva minera para proteger la vida e integridad fisica de las personas.',
    fullText: '',
    bcnUrl: 'https://www.bcn.cl/leychile/navegar?idNorma=221516',
    articles: [
      { id: 'd4-a1', number: '1', title: 'Articulo 1', content: 'El presente reglamento establece las exigencias de seguridad que deberan cumplirse en la industria extractiva minera nacional.' },
      { id: 'd4-a2', number: '2', title: 'Articulo 2', content: 'Las faenas mineras deberan contar con un reglamento interno de seguridad aprobado por el Servicio Nacional de Geologia y Mineria.' },
      { id: 'd4-a3', number: '3', title: 'Articulo 3', content: 'El dueno o administrador de toda faena minera sera responsable de dar cumplimiento a las disposiciones del presente reglamento.' },
    ],
  },
  {
    id: 'd5',
    title: 'Norma de Calidad Primaria para Material Particulado Respirable MP10',
    code: 'Decreto Supremo N 59',
    publishDate: '1998-05-25',
    organism: 'Ministerio Secretaria General de la Presidencia',
    summary: 'Establece las normas de calidad primaria para material particulado respirable MP10, definiendo los valores limite para proteccion de la salud.',
    fullText: '',
    bcnUrl: 'https://www.bcn.cl/leychile/navegar?idNorma=127712',
    articles: [
      { id: 'd5-a1', number: '1', title: 'Articulo 1', content: 'La presente norma establece los valores de las concentraciones y periodos de exposicion para material particulado respirable MP10 en el aire.' },
      { id: 'd5-a2', number: '2', title: 'Articulo 2', content: 'Se fija como norma primaria de calidad del aire un valor anual de 50 microgramos por metro cubico normal.' },
      { id: 'd5-a3', number: '3', title: 'Articulo 3', content: 'El monitoreo de la calidad del aire debera realizarse de acuerdo a los metodos de referencia establecidos.' },
    ],
  },
  {
    id: 'd6',
    title: 'Reglamento Sanitario sobre Manejo de Residuos Peligrosos',
    code: 'Decreto Supremo N 148',
    publishDate: '2004-06-12',
    organism: 'Ministerio de Salud',
    summary: 'Establece las condiciones sanitarias y de seguridad minimas para la generacion, tenencia, almacenamiento, transporte, tratamiento, reuso, reciclaje y disposicion final de residuos peligrosos.',
    fullText: '',
    bcnUrl: 'https://www.bcn.cl/leychile/navegar?idNorma=226458',
    articles: [
      { id: 'd6-a1', number: '1', title: 'Articulo 1', content: 'El presente reglamento establece las condiciones sanitarias y de seguridad minimas a que debera someterse la generacion, tenencia, almacenamiento, transporte, tratamiento, reuso, reciclaje y disposicion final de residuos peligrosos.' },
      { id: 'd6-a2', number: '2', title: 'Articulo 2', content: 'Se considerara como residuo peligroso aquel residuo o mezcla de residuos que presenta riesgo para la salud publica y/o efectos adversos al medio ambiente.' },
      { id: 'd6-a3', number: '3', title: 'Articulo 3', content: 'Todo generador de residuos peligrosos sera responsable de su correcto almacenamiento, transporte y eliminacion.' },
      { id: 'd6-a4', number: '4', title: 'Articulo 4', content: 'Los establecimientos que generen residuos peligrosos deberan llevar un registro de la naturaleza, cantidades y destino de los residuos generados.' },
    ],
  },
  {
    id: 'd7',
    title: 'Reglamento para el Transporte de Cargas Peligrosas por Calles y Caminos',
    code: 'Decreto Supremo N 298',
    publishDate: '1995-02-25',
    organism: 'Ministerio de Transportes y Telecomunicaciones',
    summary: 'Regula el transporte de sustancias o productos peligrosos por calles y caminos, estableciendo requisitos para vehiculos, conductores y documentacion.',
    fullText: '',
    bcnUrl: 'https://www.bcn.cl/leychile/navegar?idNorma=11459',
    articles: [
      { id: 'd7-a1', number: '1', title: 'Articulo 1', content: 'El presente decreto regula el transporte de sustancias peligrosas por calles y caminos de todo el territorio nacional.' },
      { id: 'd7-a2', number: '2', title: 'Articulo 2', content: 'Los vehiculos que transporten cargas peligrosas deberan cumplir con los requisitos tecnicos establecidos en el presente reglamento.' },
      { id: 'd7-a3', number: '3', title: 'Articulo 3', content: 'Los conductores de vehiculos que transporten cargas peligrosas deberan contar con una licencia especial y capacitacion certificada.' },
    ],
  },
  {
    id: 'd8',
    title: 'Ley sobre Bases Generales del Medio Ambiente',
    code: 'Ley N 19.300',
    publishDate: '1994-03-09',
    organism: 'Ministerio Secretaria General de la Presidencia',
    summary: 'Establece el marco juridico general para la regulacion del derecho a vivir en un medio ambiente libre de contaminacion y la proteccion del medio ambiente.',
    fullText: '',
    bcnUrl: 'https://www.bcn.cl/leychile/navegar?idNorma=30667',
    articles: [
      { id: 'd8-a1', number: '1', title: 'Articulo 1', content: 'El derecho a vivir en un medio ambiente libre de contaminacion, la proteccion del medio ambiente, la preservacion de la naturaleza y la conservacion del patrimonio ambiental se regularan por las disposiciones de esta ley.' },
      { id: 'd8-a2', number: '2', title: 'Articulo 2', content: 'Para todos los efectos legales, se entendera por medio ambiente el sistema global constituido por elementos naturales y artificiales de naturaleza fisica, quimica o biologica.' },
      { id: 'd8-a3', number: '3', title: 'Articulo 3', content: 'Sin perjuicio de las sanciones que senale la ley, todo el que culposa o dolosamente cause dano al medio ambiente, estara obligado a repararlo materialmente.' },
      { id: 'd8-a4', number: '4', title: 'Articulo 4', content: 'Es deber del Estado facilitar la participacion ciudadana, permitir el acceso a la informacion ambiental y promover campanas educativas destinadas a la proteccion del medio ambiente.' },
    ],
  },
]

const mockInternalNorms: InternalNorm[] = [
  { id: 'n1', name: 'Procedimiento de Gestion de Residuos Industriales', code: 'PRO-MA-001', type: 'Procedimiento', description: 'Define las etapas y responsabilidades para la gestion integral de residuos industriales solidos y liquidos en todas las instalaciones de la empresa.', fileName: 'PRO-MA-001_Residuos.pdf', createdAt: '2025-08-15' },
  { id: 'n2', name: 'Politica de Seguridad y Salud Ocupacional', code: 'POL-SSO-001', type: 'Politica', description: 'Establece los lineamientos generales de la empresa en materia de seguridad y salud en el trabajo, comprometiendo a la direccion con la mejora continua.', fileName: 'POL-SSO-001_SSO.pdf', createdAt: '2025-06-01' },
  { id: 'n3', name: 'Reglamento Interno de Orden, Higiene y Seguridad', code: 'REG-RIOHS-001', type: 'Reglamento', description: 'Reglamento interno que establece las obligaciones y prohibiciones a que deben sujetarse los trabajadores en relacion al orden, higiene y seguridad.', fileName: 'REG-RIOHS-001.pdf', createdAt: '2025-04-20' },
  { id: 'n4', name: 'Procedimiento de Monitoreo Ambiental', code: 'PRO-MA-002', type: 'Procedimiento', description: 'Detalla la metodologia, frecuencias y puntos de monitoreo para la medicion de parametros ambientales criticos en aire, agua y suelo.', fileName: 'PRO-MA-002_Monitoreo.pdf', createdAt: '2025-09-10' },
]

const initialObligations: Obligation[] = [
  { id: 'o1', name: 'Monitoreo trimestral de calidad del aire MP10', description: 'Realizar mediciones trimestrales de material particulado respirable en todos los puntos de monitoreo.', decreeId: 'd5', articleId: 'd5-a3' },
  { id: 'o2', name: 'Registro mensual de residuos peligrosos', description: 'Mantener actualizado el registro de naturaleza, cantidades y destino de residuos peligrosos generados.', decreeId: 'd6', articleId: 'd6-a4' },
  { id: 'o3', name: 'Plan de manejo de lodos actualizado', description: 'Mantener vigente el plan de manejo de lodos aprobado por la autoridad sanitaria.', decreeId: 'd2', articleId: 'd2-a3' },
  { id: 'o4', name: 'Licencias especiales para conductores de HAZMAT', description: 'Verificar que todos los conductores de vehiculos con carga peligrosa cuenten con licencia especial y capacitacion.', decreeId: 'd7', articleId: 'd7-a3' },
  { id: 'o5', name: 'Cumplimiento limites de descarga DS 90', description: 'Asegurar que todas las descargas de residuos liquidos cumplan con los limites maximos permitidos.', decreeId: 'd3', articleId: 'd3-a3' },
  { id: 'o6', name: 'Reglamento interno de seguridad minera', description: 'Contar con reglamento interno de seguridad aprobado por SERNAGEOMIN.', decreeId: 'd4', articleId: 'd4-a2' },
  { id: 'o7', name: 'Condiciones sanitarias en lugares de trabajo', description: 'Mantener condiciones sanitarias y ambientales necesarias en todos los lugares de trabajo.', decreeId: 'd1', articleId: 'd1-a3' },
  { id: 'o8', name: 'Participacion ciudadana ambiental', description: 'Facilitar acceso a informacion ambiental y promover campanas educativas.', decreeId: 'd8', articleId: 'd8-a4' },
  { id: 'o9', name: 'Programa de monitoreo ante la SMA', description: 'Presentar programas de monitoreo de descargas ante la Superintendencia del Medio Ambiente.', decreeId: 'd3', articleId: 'd3-a4' },
  { id: 'o10', name: 'Reparacion material de dano ambiental', description: 'Mantener protocolo de respuesta para reparacion material en caso de dano al medio ambiente.', decreeId: 'd8', articleId: 'd8-a3' },
]

/* ================================================================== */
/*  DECREE DETAIL VIEW                                                */
/* ================================================================== */

function DecreeDetail({ decree }: { decree: Decree }) {
  return (
    <div className="flex flex-col h-full">
      {/* Fixed header */}
      <div className="shrink-0 border-b border-border px-6 py-4">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-foreground leading-tight">{decree.title}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-wrap items-center gap-3 mt-3">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <FileText className="h-3.5 w-3.5" />
            <span className="font-medium">{decree.code}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            {decree.publishDate}
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Building2 className="h-3.5 w-3.5" />
            {decree.organism}
          </div>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <Button variant="outline" size="sm" className="text-xs gap-1.5" onClick={() => window.open(decree.bcnUrl, '_blank')}>
            <ExternalLink className="h-3 w-3" />
            Abrir en BCN
          </Button>
          <Button variant="outline" size="sm" className="text-xs gap-1.5">
            <Download className="h-3 w-3" />
            Descargar PDF
          </Button>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 min-h-0 overflow-y-auto px-6 py-4">
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-foreground mb-2">Resumen</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{decree.summary}</p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">Articulos ({decree.articles.length})</h3>
          <Accordion type="multiple" className="space-y-2">
            {decree.articles.map(article => (
              <AccordionItem key={article.id} value={article.id} className="border border-border rounded-lg px-4 data-[state=open]:bg-muted/30">
                <AccordionTrigger className="text-sm font-medium hover:no-underline py-3">
                  <span>Articulo {article.number}</span>
                </AccordionTrigger>
                <AccordionContent className="pb-3">
                  <p className="text-sm text-muted-foreground leading-relaxed">{article.content}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  )
}

/* ================================================================== */
/*  DECREE SEARCH POPOVER (for obligation form)                       */
/* ================================================================== */

function DecreeSearchInput({
  value,
  onChange,
}: {
  value: string
  onChange: (decreeId: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const selectedDecree = mockDecrees.find(d => d.id === value)

  const filtered = useMemo(() => {
    if (!query.trim()) return mockDecrees
    const q = query.toLowerCase()
    return mockDecrees.filter(d => d.title.toLowerCase().includes(q) || d.code.toLowerCase().includes(q))
  }, [query])

  return (
    <div className="relative">
      {selectedDecree ? (
        <div className="flex items-center gap-2 rounded-md border border-border px-3 py-2 bg-muted/30">
          <Scale className="h-3.5 w-3.5 text-primary shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{selectedDecree.code}</p>
            <p className="text-xs text-muted-foreground truncate">{selectedDecree.title}</p>
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => { onChange(''); setQuery('') }}>
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      ) : (
        <div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              value={query}
              onChange={e => { setQuery(e.target.value); setOpen(true) }}
              onFocus={() => setOpen(true)}
              placeholder="Buscar decreto por nombre o codigo..."
              className="pl-9"
            />
          </div>
          {open && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
              <div className="absolute z-50 top-full left-0 right-0 mt-1 max-h-60 overflow-y-auto rounded-lg border border-border bg-popover shadow-lg">
                {filtered.length === 0 ? (
                  <div className="p-3 text-sm text-muted-foreground text-center">No se encontraron decretos.</div>
                ) : (
                  filtered.map(d => (
                    <button
                      key={d.id}
                      className="w-full text-left px-3 py-2.5 hover:bg-muted/50 transition-colors border-b border-border last:border-b-0"
                      onClick={() => { onChange(d.id); setOpen(false); setQuery('') }}
                    >
                      <p className="text-sm font-medium text-foreground">{d.code}</p>
                      <p className="text-xs text-muted-foreground truncate">{d.title}</p>
                    </button>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

/* ================================================================== */
/*  MAIN COMPONENT                                                    */
/* ================================================================== */

export function BibliotecaPage() {
  type Tab = 'todos' | 'normativas' | 'obligaciones'
  const [activeTab, setActiveTab] = useState<Tab>('todos')
  const [searchTodos, setSearchTodos] = useState('')
  const [searchNorms, setSearchNorms] = useState('')
  const [searchOblig, setSearchOblig] = useState('')

  // Decree detail
  const [selectedDecree, setSelectedDecree] = useState<Decree | null>(null)

  // Internal norms state
  const [internalNorms, setInternalNorms] = useState(mockInternalNorms)
  const [normModal, setNormModal] = useState<'create' | 'edit' | null>(null)
  const [editingNorm, setEditingNorm] = useState<InternalNorm | null>(null)
  const [normForm, setNormForm] = useState({ name: '', code: '', type: '' as InternalNorm['type'] | '', description: '', fileName: '' })

  // Obligations state
  const [obligations, setObligations] = useState(initialObligations)
  const [obligModal, setObligModal] = useState<'create' | 'edit' | null>(null)
  const [editingOblig, setEditingOblig] = useState<Obligation | null>(null)
  const [obligForm, setObligForm] = useState({ name: '', description: '', decreeId: '', articleId: '' })

  // Norm detail
  const [selectedNorm, setSelectedNorm] = useState<InternalNorm | null>(null)

  /* ---- Filtered data ---- */
  const filteredDecrees = useMemo(() => {
    if (!searchTodos.trim()) return mockDecrees
    const q = searchTodos.toLowerCase()
    return mockDecrees.filter(d => d.title.toLowerCase().includes(q) || d.code.toLowerCase().includes(q) || d.organism.toLowerCase().includes(q))
  }, [searchTodos])

  const filteredNorms = useMemo(() => {
    if (!searchNorms.trim()) return internalNorms
    const q = searchNorms.toLowerCase()
    return internalNorms.filter(n => n.name.toLowerCase().includes(q) || n.code.toLowerCase().includes(q))
  }, [searchNorms, internalNorms])

  const filteredObligations = useMemo(() => {
    if (!searchOblig.trim()) return obligations
    const q = searchOblig.toLowerCase()
    return obligations.filter(o => {
      const decree = mockDecrees.find(d => d.id === o.decreeId)
      const article = decree?.articles.find(a => a.id === o.articleId)
      return o.name.toLowerCase().includes(q) || decree?.title.toLowerCase().includes(q) || decree?.code.toLowerCase().includes(q) || article?.number.includes(q)
    })
  }, [searchOblig, obligations])

  /* ---- Norm CRUD ---- */
  const openCreateNorm = () => {
    setNormForm({ name: '', code: '', type: '', description: '', fileName: '' })
    setEditingNorm(null)
    setNormModal('create')
  }
  const openEditNorm = (norm: InternalNorm) => {
    setNormForm({ name: norm.name, code: norm.code, type: norm.type, description: norm.description, fileName: norm.fileName || '' })
    setEditingNorm(norm)
    setNormModal('edit')
  }
  const saveNorm = () => {
    if (!normForm.name || !normForm.code || !normForm.type) return
    if (normModal === 'edit' && editingNorm) {
      setInternalNorms(prev => prev.map(n => n.id === editingNorm.id ? { ...n, name: normForm.name, code: normForm.code, type: normForm.type as InternalNorm['type'], description: normForm.description, fileName: normForm.fileName } : n))
    } else {
      const newNorm: InternalNorm = { id: `n-${Date.now()}`, name: normForm.name, code: normForm.code, type: normForm.type as InternalNorm['type'], description: normForm.description, fileName: normForm.fileName, createdAt: new Date().toISOString().slice(0, 10) }
      setInternalNorms(prev => [newNorm, ...prev])
    }
    setNormModal(null)
  }
  const deleteNorm = (id: string) => setInternalNorms(prev => prev.filter(n => n.id !== id))

  /* ---- Obligation CRUD ---- */
  const openCreateOblig = () => {
    setObligForm({ name: '', description: '', decreeId: '', articleId: '' })
    setEditingOblig(null)
    setObligModal('create')
  }
  const openEditOblig = (o: Obligation) => {
    setObligForm({ name: o.name, description: o.description, decreeId: o.decreeId, articleId: o.articleId })
    setEditingOblig(o)
    setObligModal('edit')
  }
  const saveOblig = () => {
    if (!obligForm.name || !obligForm.decreeId || !obligForm.articleId) return
    if (obligModal === 'edit' && editingOblig) {
      setObligations(prev => prev.map(o => o.id === editingOblig.id ? { ...o, name: obligForm.name, description: obligForm.description, decreeId: obligForm.decreeId, articleId: obligForm.articleId } : o))
    } else {
      const newOblig: Obligation = { id: `o-${Date.now()}`, name: obligForm.name, description: obligForm.description, decreeId: obligForm.decreeId, articleId: obligForm.articleId }
      setObligations(prev => [newOblig, ...prev])
    }
    setObligModal(null)
  }
  const deleteOblig = (id: string) => setObligations(prev => prev.filter(o => o.id !== id))

  /* ---- Get articles for a decree ---- */
  const selectedDecreeForForm = mockDecrees.find(d => d.id === obligForm.decreeId)

  /* ---- Tabs ---- */
  const tabs: { key: Tab; label: string }[] = [
    { key: 'todos', label: 'Todos' },
    { key: 'normativas', label: 'Normativas internas' },
    { key: 'obligaciones', label: 'Obligaciones' },
  ]

  return (
    <div className="flex flex-col h-full min-h-screen bg-background">
      {/* Page header */}
      <div className="shrink-0 border-b border-border bg-card px-8 py-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Biblioteca</h1>
        </div>
        <p className="text-sm text-muted-foreground ml-12 leading-relaxed">
          Repositorio central de decretos, normativas internas y obligaciones asociadas.
        </p>

        {/* Tabs */}
        <div className="flex items-center gap-1 mt-5 ml-12">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === tab.key
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 min-h-0 overflow-y-auto px-8 py-6">
        {/* ==================== TAB: TODOS ==================== */}
        {activeTab === 'todos' && (
          <div>
            <div className="mb-5">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar por decreto, codigo u organismo..." value={searchTodos} onChange={e => setSearchTodos(e.target.value)} className="pl-9" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredDecrees.map(decree => (
                <Card key={decree.id} className="group hover:shadow-md transition-shadow border border-border">
                  <CardContent className="p-5">
                    <div className="mb-3">
                      <p className="text-xs font-semibold text-primary mb-1">{decree.code}</p>
                      <h3 className="text-sm font-semibold text-foreground leading-snug line-clamp-2">{decree.title}</h3>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {decree.publishDate}
                      </span>
                      <span className="flex items-center gap-1 truncate">
                        <Building2 className="h-3 w-3 shrink-0" />
                        <span className="truncate">{decree.organism}</span>
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-4">{decree.summary}</p>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => setSelectedDecree(decree)}>
                        <ChevronRight className="mr-1 h-3 w-3" />
                        Ver detalle
                      </Button>
                      <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={() => window.open(decree.bcnUrl, '_blank')}>
                        <ExternalLink className="h-3 w-3" />
                        BCN
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {filteredDecrees.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-10 w-10 mx-auto mb-3 opacity-40" />
                <p className="text-sm">No se encontraron decretos.</p>
              </div>
            )}
          </div>
        )}

        {/* ==================== TAB: NORMATIVAS ==================== */}
        {activeTab === 'normativas' && (
          <div>
            <div className="flex items-center justify-between mb-5 gap-4">
              <div className="relative max-w-md flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar normativa por nombre o codigo..." value={searchNorms} onChange={e => setSearchNorms(e.target.value)} className="pl-9" />
              </div>
              <Button onClick={openCreateNorm} className="gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground shrink-0">
                <Plus className="h-4 w-4" />
                Agregar normativa interna
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredNorms.map(norm => (
                <Card key={norm.id} className="group hover:shadow-md transition-shadow border border-border">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-primary mb-1">{norm.code}</p>
                        <h3 className="text-sm font-semibold text-foreground leading-snug line-clamp-2">{norm.name}</h3>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreVertical className="h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelectedNorm(norm)}>
                            <FileText className="mr-2 h-3.5 w-3.5" /> Ver detalle
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEditNorm(norm)}>
                            <Pencil className="mr-2 h-3.5 w-3.5" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => deleteNorm(norm.id)} className="text-destructive focus:text-destructive">
                            <Trash2 className="mr-2 h-3.5 w-3.5" /> Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <Badge variant="outline" className="text-xs mb-2">{norm.type}</Badge>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-3">{norm.description}</p>
                    {norm.fileName && (
                      <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-muted/50 border border-border">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-0">
                          <Upload className="h-3 w-3 shrink-0" />
                          <span className="truncate">{norm.fileName}</span>
                        </div>
                        <Button variant="ghost" size="sm" className="h-6 text-xs gap-1 shrink-0 px-2">
                          <Download className="h-3 w-3" />
                          Descargar
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
            {filteredNorms.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-10 w-10 mx-auto mb-3 opacity-40" />
                <p className="text-sm">No se encontraron normativas internas.</p>
              </div>
            )}
          </div>
        )}

        {/* ==================== TAB: OBLIGACIONES ==================== */}
        {activeTab === 'obligaciones' && (
          <div>
            <div className="flex items-center justify-between mb-5 gap-4">
              <div className="relative max-w-md flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar por obligacion, decreto o articulo..." value={searchOblig} onChange={e => setSearchOblig(e.target.value)} className="pl-9" />
              </div>
              <Button onClick={openCreateOblig} className="gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground shrink-0">
                <Plus className="h-4 w-4" />
                Agregar obligacion
              </Button>
            </div>
            <div className="rounded-lg border border-border overflow-hidden">
              {/* Table header */}
              <div className="bg-muted/50 px-4 py-3 flex items-center gap-4 text-xs font-medium text-muted-foreground border-b border-border">
                <span className="flex-1 min-w-0">Nombre</span>
                <span className="w-48 shrink-0 hidden md:block">Decreto asociado</span>
                <span className="w-28 shrink-0 hidden lg:block">Articulo</span>
                <span className="w-20 shrink-0" />
              </div>
              {/* Rows */}
              {filteredObligations.map(oblig => {
                const decree = mockDecrees.find(d => d.id === oblig.decreeId)
                const article = decree?.articles.find(a => a.id === oblig.articleId)
                return (
                  <div key={oblig.id} className="group flex items-center gap-4 px-4 py-3 border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{oblig.name}</p>
                      {oblig.description && (
                        <p className="text-xs text-muted-foreground truncate mt-0.5">{oblig.description}</p>
                      )}
                    </div>
                    <div className="w-48 shrink-0 hidden md:block">
                      <p className="text-xs font-medium text-foreground truncate">{decree?.code || '-'}</p>
                      <p className="text-xs text-muted-foreground truncate">{decree?.title.slice(0, 60) || ''}...</p>
                    </div>
                    <div className="w-28 shrink-0 hidden lg:block">
                      <span className="text-xs text-muted-foreground">
                        {article ? `Art. ${article.number}` : '-'}
                      </span>
                    </div>
                    <div className="w-20 shrink-0 flex justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreVertical className="h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditOblig(oblig)}>
                            <Pencil className="mr-2 h-3.5 w-3.5" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => deleteOblig(oblig.id)} className="text-destructive focus:text-destructive">
                            <Trash2 className="mr-2 h-3.5 w-3.5" /> Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                )
              })}
              {filteredObligations.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Scale className="h-10 w-10 mx-auto mb-3 opacity-40" />
                  <p className="text-sm">No se encontraron obligaciones.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ==================== DECREE DETAIL MODAL ==================== */}
      <Dialog open={!!selectedDecree} onOpenChange={open => { if (!open) setSelectedDecree(null) }}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col p-0">
          {selectedDecree && <DecreeDetail decree={selectedDecree} />}
        </DialogContent>
      </Dialog>

      {/* ==================== NORM DETAIL MODAL ==================== */}
      <Dialog open={!!selectedNorm} onOpenChange={open => { if (!open) setSelectedNorm(null) }}>
        <DialogContent className="max-w-xl max-h-[80vh] overflow-hidden flex flex-col p-0">
          {selectedNorm && (
            <>
              <div className="shrink-0 border-b border-border px-6 py-4">
                <DialogHeader>
                  <DialogTitle className="text-lg">{selectedNorm.name}</DialogTitle>
                </DialogHeader>
              </div>
              <div className="flex-1 min-h-0 overflow-y-auto px-6 py-4 space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">{selectedNorm.type}</Badge>
                  <span className="text-xs text-muted-foreground font-mono">{selectedNorm.code}</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{selectedNorm.description}</p>
                {selectedNorm.fileName && (
                  <div className="flex items-center justify-between gap-2 p-3 rounded-lg bg-muted/50 border border-border">
                    <div className="flex items-center gap-2 min-w-0">
                      <Upload className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-sm text-foreground truncate">{selectedNorm.fileName}</span>
                    </div>
                    <Button variant="outline" size="sm" className="text-xs gap-1.5 shrink-0">
                      <Download className="h-3 w-3" />
                      Descargar
                    </Button>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">Creada: {selectedNorm.createdAt}</p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ==================== NORM CREATE/EDIT MODAL ==================== */}
      <Dialog open={normModal !== null} onOpenChange={open => { if (!open) setNormModal(null) }}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-hidden flex flex-col p-0">
          <div className="shrink-0 border-b border-border px-6 py-4">
            <DialogHeader>
              <DialogTitle>{normModal === 'edit' ? 'Editar normativa interna' : 'Agregar normativa interna'}</DialogTitle>
            </DialogHeader>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto px-6 py-4 space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Nombre de normativa *</Label>
              <Input value={normForm.name} onChange={e => setNormForm(f => ({ ...f, name: e.target.value }))} placeholder="Ej: Procedimiento de Gestion de Residuos" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Codigo / Identificador interno *</Label>
              <Input value={normForm.code} onChange={e => setNormForm(f => ({ ...f, code: e.target.value }))} placeholder="Ej: PRO-MA-001" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Tipo *</Label>
              <Select value={normForm.type} onValueChange={v => setNormForm(f => ({ ...f, type: v as InternalNorm['type'] }))}>
                <SelectTrigger><SelectValue placeholder="Seleccionar tipo" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Procedimiento">Procedimiento</SelectItem>
                  <SelectItem value="Politica">Politica</SelectItem>
                  <SelectItem value="Reglamento">Reglamento</SelectItem>
                  <SelectItem value="Otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Descripcion</Label>
              <Textarea value={normForm.description} onChange={e => setNormForm(f => ({ ...f, description: e.target.value }))} placeholder="Descripcion de la normativa..." rows={3} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Archivo adjunto</Label>
              <div className="flex items-center gap-2 p-3 rounded-lg border border-dashed border-border bg-muted/30 cursor-pointer">
                <Upload className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {normForm.fileName || 'Arrastra un archivo o haz click para subir'}
                </span>
              </div>
            </div>
          </div>
          <div className="shrink-0 flex items-center justify-end gap-2 px-6 py-4 border-t border-border bg-background">
            <Button variant="outline" onClick={() => setNormModal(null)}>Cancelar</Button>
            <Button onClick={saveNorm} disabled={!normForm.name || !normForm.code || !normForm.type}>
              {normModal === 'edit' ? 'Guardar cambios' : 'Guardar normativa interna'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ==================== OBLIGATION CREATE/EDIT MODAL ==================== */}
      <Dialog open={obligModal !== null} onOpenChange={open => { if (!open) setObligModal(null) }}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-hidden flex flex-col p-0">
          <div className="shrink-0 border-b border-border px-6 py-4">
            <DialogHeader>
              <DialogTitle>{obligModal === 'edit' ? 'Editar obligacion' : 'Crear obligacion'}</DialogTitle>
            </DialogHeader>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto px-6 py-4 space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Nombre de obligacion *</Label>
              <Input value={obligForm.name} onChange={e => setObligForm(f => ({ ...f, name: e.target.value }))} placeholder="Ej: Monitoreo trimestral de calidad del aire" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Descripcion</Label>
              <Textarea value={obligForm.description} onChange={e => setObligForm(f => ({ ...f, description: e.target.value }))} placeholder="Descripcion de la obligacion..." rows={3} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Decreto asociado *</Label>
              <DecreeSearchInput
                value={obligForm.decreeId}
                onChange={v => setObligForm(f => ({ ...f, decreeId: v, articleId: '' }))}
              />
            </div>
            {selectedDecreeForForm && (
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Articulo asociado *</Label>
                <Select value={obligForm.articleId} onValueChange={v => setObligForm(f => ({ ...f, articleId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar articulo" /></SelectTrigger>
                  <SelectContent>
                    {selectedDecreeForForm.articles.map(a => (
                      <SelectItem key={a.id} value={a.id}>Articulo {a.number} - {a.content.slice(0, 80)}...</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <div className="shrink-0 flex items-center justify-end gap-2 px-6 py-4 border-t border-border bg-background">
            <Button variant="outline" onClick={() => setObligModal(null)}>Cancelar</Button>
            <Button onClick={saveOblig} disabled={!obligForm.name || !obligForm.decreeId || !obligForm.articleId}>
              {obligModal === 'edit' ? 'Guardar cambios' : 'Crear obligacion'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
