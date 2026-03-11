import type { LegalBody, Project, User, ControlUnit, ManagementUnit, ComplianceStats, DepartmentNode } from './types'

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Carlos Mendoza',
    email: 'carlos.mendoza@empresa.cl',
    role: 'super_admin',
    department: 'Administración',
    createdAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    name: 'María González',
    email: 'maria.gonzalez@empresa.cl',
    role: 'admin',
    department: 'Gestión Ambiental',
    createdAt: new Date('2024-02-10'),
  },
  {
    id: '3',
    name: 'Juan Pérez',
    email: 'juan.perez@empresa.cl',
    role: 'evaluator',
    department: 'Cumplimiento',
    createdAt: new Date('2024-03-05'),
  },
  {
    id: '4',
    name: 'Ana Silva',
    email: 'ana.silva@empresa.cl',
    role: 'area_manager',
    department: 'Operaciones',
    createdAt: new Date('2024-03-20'),
  },
]

export const mockLegalBodies: LegalBody[] = [
  {
    id: '1',
    name: 'Decreto 4 EXENTO',
    shortName: 'Decreto 4 EXENTO',
    description: 'MODIFICA DECRETO Nº 92 EXENTO (V. Y U.), DE 2025 QUE APRUEBA PROGRAMA DE EXPROPIACIONES DE TERRENO DESTINADO A LA IMPLEMENTACIÓN DEL PROYECTO DENOMINADO "CONSTRUCCIÓN PARQUE LA RUFINA, CHILLÁN", EN LA COMUNA DE CHILLÁN, DE LA REGIÓN DE ÑUBLE, PARA EL AÑO 2025 Y SIGUIENTES',
    ministry: 'MINISTERIO DE VIVIENDA Y URBANISMO',
    publicationDate: '2026-02-02',
    promulgationDate: '2026-01-26',
    category: 'general',
    isInternal: false,
    articles: [
      {
        id: 'a1',
        legalBodyId: '1',
        number: '1',
        content: 'Modifíquese el decreto exento Nº 92 (V. y U.), de 2025 que aprueba el programa de expropiaciones para la ejecución del Proyecto "Construcción Parque La Rufina, Chillán", para el año 2025 y siguientes, en el sentido de reemplazar la tabla consignada en el numeral 1.',
        criticality: 'media',
        attributeType: 'otro',
        obligations: []
      }
    ]
  },
  {
    id: '2',
    name: 'Resolución 52 EXENTA',
    shortName: 'Resolución 52 EXENTA',
    description: 'DEJA SIN EFECTO RESOLUCIÓN Nº 157 EXENTA, DE 2025, DE ESTE ORIGEN, Y DELEGA FACULTAD DE FIRMAR POR ORDEN DEL SUBSECRETARIO DE SEGURIDAD PÚBLICA LOS ACTOS QUE INDICA',
    ministry: 'MINISTERIO DE SEGURIDAD PÚBLICA; SUBSECRETARÍA DE SEGURIDAD PÚBLICA',
    publicationDate: '2026-02-02',
    promulgationDate: '2026-01-26',
    category: 'general',
    isInternal: false,
    articles: [
      {
        id: 'a2',
        legalBodyId: '2',
        number: '1',
        content: 'Déjase sin efecto la resolución Nº 157 exenta, de 2025.',
        criticality: 'baja',
        attributeType: 'otro',
        obligations: []
      }
    ]
  },
  {
    id: '3',
    name: 'Resolución 128 EXENTA',
    shortName: 'Resolución 128 EXENTA',
    description: 'MODIFICA LA RESOLUCIÓN Nº 325 EXENTA (V. Y U.), DE 2024, QUE LLAMA A PROCESO DE SELECCIÓN EN CONDICIONES ESPECIALES PARA EL OTORGAMIENTO DE SUBSIDIOS DEL PROGRAMA HABITACIONAL FONDO SOLIDARIO DE ELECCIÓN DE VIVIENDA',
    ministry: 'MINISTERIO DE VIVIENDA Y URBANISMO',
    publicationDate: '2026-02-02',
    promulgationDate: '2026-01-23',
    category: 'general',
    isInternal: false,
    articles: [
      {
        id: 'a3',
        legalBodyId: '3',
        number: '1',
        content: 'Modifícase la Resolución Nº 325 Exenta (V. y U.), de 2024.',
        criticality: 'media',
        attributeType: 'permiso',
        obligations: []
      }
    ]
  },
  {
    id: '4',
    name: 'Decreto 148',
    shortName: 'Decreto 148',
    description: 'APRUEBA REGLAMENTO SANITARIO SOBRE MANEJO DE RESIDUOS PELIGROSOS',
    ministry: 'MINISTERIO DE SALUD',
    publicationDate: '2024-06-16',
    promulgationDate: '2024-06-10',
    category: 'ambiental',
    isInternal: false,
    articles: [
      {
        id: 'a4',
        legalBodyId: '4',
        number: '1',
        content: 'Se establecen las condiciones sanitarias y de seguridad mínimas a que deberá someterse la generación, tenencia, almacenamiento, transporte, tratamiento, reúso, reciclaje, disposición final y otras formas de eliminación de los residuos peligrosos.',
        criticality: 'alta',
        attributeType: 'permiso',
        obligations: [
          {
            id: 'o1',
            articleId: 'a4',
            name: 'Plan de Manejo de Residuos',
            description: 'Desarrollar e implementar plan de manejo de residuos peligrosos',
            status: 'in_progress'
          }
        ]
      }
    ]
  },
  {
    id: '5',
    name: 'Decreto 594',
    shortName: 'Decreto 594',
    description: 'APRUEBA REGLAMENTO SOBRE CONDICIONES SANITARIAS Y AMBIENTALES BASICAS EN LOS LUGARES DE TRABAJO',
    ministry: 'MINISTERIO DE SALUD',
    publicationDate: '2000-09-15',
    promulgationDate: '2000-09-01',
    category: 'sst',
    isInternal: false,
    articles: [
      {
        id: 'a5',
        legalBodyId: '5',
        number: '1',
        content: 'Establece las condiciones sanitarias y ambientales básicas que deberá cumplir todo lugar de trabajo.',
        criticality: 'alta',
        attributeType: 'monitoreo',
        obligations: [
          {
            id: 'o2',
            articleId: 'a5',
            name: 'Monitoreo Ambiental',
            description: 'Realizar monitoreo periódico de condiciones ambientales',
            status: 'pending'
          }
        ]
      }
    ]
  },
  {
    id: '6',
    name: 'Decreto 43',
    shortName: 'Decreto 43',
    description: 'APRUEBA EL REGLAMENTO DE ALMACENAMIENTO DE SUSTANCIAS PELIGROSAS',
    ministry: 'MINISTERIO DE SALUD',
    publicationDate: '2016-03-12',
    promulgationDate: '2016-03-01',
    category: 'ambiental',
    isInternal: false,
    articles: [
      {
        id: 'a6',
        legalBodyId: '6',
        number: '1',
        content: 'Establece las condiciones de seguridad de las instalaciones de almacenamiento de sustancias peligrosas.',
        criticality: 'alta',
        attributeType: 'permiso',
        obligations: []
      }
    ]
  },
  {
    id: '7',
    name: 'Decreto 2 EXENTO',
    shortName: 'Decreto 2 EXENTO',
    description: 'ORDENA TRASPASO DEL PERSONAL DE LA SUBSECRETARÍA DEL MEDIO AMBIENTE AL SERVICIO DE BIODIVERSIDAD Y ÁREAS PROTEGIDAS',
    ministry: 'MINISTERIO DEL MEDIO AMBIENTE',
    publicationDate: '2026-02-02',
    promulgationDate: '2026-01-21',
    category: 'ambiental',
    isInternal: false,
    articles: [
      {
        id: 'a7',
        legalBodyId: '7',
        number: '1',
        content: 'Ordénase el traspaso del personal.',
        criticality: 'baja',
        attributeType: 'otro',
        obligations: []
      }
    ]
  },
  {
    id: '8',
    name: 'Resolución 71 EXENTA',
    shortName: 'Resolución 71 EXENTA',
    description: 'PROHÍBE CIRCULACIÓN DE VEHÍCULOS MOTORIZADOS EN VÍAS QUE INDICA, EN LA COMUNA DE RANCAGUA',
    ministry: 'MINISTERIO DE TRANSPORTES Y TELECOMUNICACIONES',
    publicationDate: '2026-02-02',
    promulgationDate: '2026-01-21',
    category: 'general',
    isInternal: false,
    articles: [
      {
        id: 'a8',
        legalBodyId: '8',
        number: '1',
        content: 'Prohíbese la circulación de vehículos motorizados en las vías que se indican.',
        criticality: 'media',
        attributeType: 'reporte',
        obligations: []
      }
    ]
  },
]

export const mockProjects: Project[] = [
  {
    id: '1',
    name: 'PROYECTO LANZAMIENTO (NO MODIFICAR)',
    description: 'Proyecto de cumplimiento normativo para operaciones de producción',
    location: 'Región Metropolitana',
    productiveSector: 'Manufactura',
    activityType: 'Producción Industrial',
    status: 'identification',
    createdAt: new Date('2024-01-15'),
    legalBodies: [
      {
        legalBodyId: '4',
        controlUnitIds: ['cu1', 'cu2'],
        articleConnections: []
      },
      {
        legalBodyId: '5',
        controlUnitIds: ['cu1', 'cu2'],
        articleConnections: []
      },
      {
        legalBodyId: '6',
        controlUnitIds: ['cu1', 'cu2', 'cu3'],
        articleConnections: []
      }
    ]
  },
  {
    id: '2',
    name: 'Proyecto Minería Norte',
    description: 'Gestión ambiental para operaciones mineras',
    location: 'Región de Antofagasta',
    productiveSector: 'Minería',
    activityType: 'Extracción',
    status: 'evaluation',
    createdAt: new Date('2024-02-20'),
    legalBodies: []
  }
]

export const mockControlUnits: ControlUnit[] = [
  { id: 'cu1', name: 'Bodega de Químicos', type: 'Instalación', managementUnitIds: ['mg1'], description: 'Bodega principal de almacenamiento' },
  { id: 'cu2', name: 'Planta de Tratamiento', type: 'Proceso', managementUnitIds: ['mg1'], description: 'Planta de tratamiento de aguas' },
  { id: 'cu3', name: 'Área de Producción', type: 'Área', managementUnitIds: ['mg2'], description: 'Líneas de producción principales' },
  { id: 'cu4', name: 'Laboratorio', type: 'Instalación', managementUnitIds: ['mg2'], description: 'Laboratorio de control de calidad' },
  { id: 'cu5', name: 'Oficinas Administrativas', type: 'Edificio', managementUnitIds: ['mg3'], description: 'Edificio administrativo principal' },
]

export const mockManagementUnits: ManagementUnit[] = [
  { id: 'mg1', name: 'Operaciones', type: 'area_operativa' },
  { id: 'mg2', name: 'Producción', type: 'area_operativa', parentId: 'mg1' },
  { id: 'mg3', name: 'Administración', type: 'area_admin' },
  { id: 'mg4', name: 'Logística', type: 'proceso', parentId: 'mg1' },
]

export const mockComplianceStats: ComplianceStats = {
  total: 156,
  compliant: 98,
  partiallyCompliant: 32,
  nonCompliant: 14,
  pending: 12
}

export const mockOrganization: DepartmentNode = {
  id: 'root',
  name: 'Empresa S.A.',
  role: 'Organización',
  children: [
    {
      id: 'd1',
      name: 'Gerencia General',
      role: 'Dirección',
      norms: ['ISO 14001', 'ISO 45001'],
      children: [
        {
          id: 'd2',
          name: 'Gerencia de Operaciones',
          role: 'Gestión',
          norms: ['Decreto 148', 'Decreto 594'],
          children: [
            { id: 'd5', name: 'Producción', role: 'Área', norms: ['Decreto 43'] },
            { id: 'd6', name: 'Mantenimiento', role: 'Área', norms: ['Decreto 594'] },
          ]
        },
        {
          id: 'd3',
          name: 'Gerencia Ambiental',
          role: 'Gestión',
          norms: ['Ley 19.300', 'Decreto 40'],
          children: [
            { id: 'd7', name: 'Cumplimiento', role: 'Área', norms: ['RCA'] },
            { id: 'd8', name: 'Monitoreo', role: 'Área', norms: ['D.S. 90'] },
          ]
        },
        {
          id: 'd4',
          name: 'Gerencia RRHH',
          role: 'Gestión',
          norms: ['Código del Trabajo'],
          children: [
            { id: 'd9', name: 'Prevención de Riesgos', role: 'Área', norms: ['Ley 16.744'] },
          ]
        },
      ]
    }
  ]
}

export const categoryLabels: Record<string, string> = {
  general: 'Normativa general',
  ambiental: 'Normativa ambiental',
  sst: 'Normativa SST',
  laboral: 'Normativa laboral',
  energia: 'Normativa de energía'
}

export const roleLabels: Record<string, string> = {
  super_admin: 'Super Administrador',
  admin: 'Administrador',
  evaluator: 'Evaluador',
  area_manager: 'Encargado de Área',
  operator: 'Operador'
}
