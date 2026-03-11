'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'
import type { User, LegalBody, Project, ControlUnit, ManagementUnit } from './types'
import { mockUsers, mockLegalBodies, mockProjects, mockControlUnits, mockManagementUnits } from './mock-data'

interface AppContextType {
  // Current user
  currentUser: User | null
  setCurrentUser: (user: User | null) => void
  
  // Legal bodies
  legalBodies: LegalBody[]
  addLegalBody: (body: LegalBody) => void
  updateLegalBody: (id: string, body: Partial<LegalBody>) => void
  deleteLegalBody: (id: string) => void
  
  // Projects
  projects: Project[]
  addProject: (project: Project) => void
  updateProject: (id: string, project: Partial<Project>) => void
  deleteProject: (id: string) => void
  currentProject: Project | null
  setCurrentProject: (project: Project | null) => void
  
  // Control Units
  controlUnits: ControlUnit[]
  addControlUnit: (unit: ControlUnit) => void
  updateControlUnit: (id: string, unit: Partial<ControlUnit>) => void
  deleteControlUnit: (id: string) => void
  
  // Management Units
  managementUnits: ManagementUnit[]
  addManagementUnit: (unit: ManagementUnit) => void
  updateManagementUnit: (id: string, unit: Partial<ManagementUnit>) => void
  deleteManagementUnit: (id: string) => void
  
  // Users
  users: User[]
  addUser: (user: User) => void
  updateUser: (id: string, user: Partial<User>) => void
  deleteUser: (id: string) => void
  
  // Navigation
  activeSection: string
  setActiveSection: (section: string) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(mockUsers[0])
  const [legalBodies, setLegalBodies] = useState<LegalBody[]>(mockLegalBodies)
  const [projects, setProjects] = useState<Project[]>(mockProjects)
  const [controlUnits, setControlUnits] = useState<ControlUnit[]>(mockControlUnits)
  const [managementUnits, setManagementUnits] = useState<ManagementUnit[]>(mockManagementUnits)
  const [users, setUsers] = useState<User[]>(mockUsers)
  const [currentProject, setCurrentProject] = useState<Project | null>(null)
  const [activeSection, setActiveSection] = useState('tablero')

  const addLegalBody = (body: LegalBody) => {
    setLegalBodies(prev => [...prev, body])
  }

  const updateLegalBody = (id: string, body: Partial<LegalBody>) => {
    setLegalBodies(prev => prev.map(b => b.id === id ? { ...b, ...body } : b))
  }

  const deleteLegalBody = (id: string) => {
    setLegalBodies(prev => prev.filter(b => b.id !== id))
  }

  const addProject = (project: Project) => {
    setProjects(prev => [...prev, project])
  }

  const updateProject = (id: string, project: Partial<Project>) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...project } : p))
  }

  const deleteProject = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id))
  }

  const addControlUnit = (unit: ControlUnit) => {
    setControlUnits(prev => [...prev, unit])
  }

  const updateControlUnit = (id: string, unit: Partial<ControlUnit>) => {
    setControlUnits(prev => prev.map(u => u.id === id ? { ...u, ...unit } : u))
  }

  const deleteControlUnit = (id: string) => {
    setControlUnits(prev => prev.filter(u => u.id !== id))
  }

  const addManagementUnit = (unit: ManagementUnit) => {
    setManagementUnits(prev => [...prev, unit])
  }

  const updateManagementUnit = (id: string, unit: Partial<ManagementUnit>) => {
    setManagementUnits(prev => prev.map(u => u.id === id ? { ...u, ...unit } : u))
  }

  const deleteManagementUnit = (id: string) => {
    setManagementUnits(prev => prev.filter(u => u.id !== id))
  }

  const addUser = (user: User) => {
    setUsers(prev => [...prev, user])
  }

  const updateUser = (id: string, user: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...user } : u))
  }

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id))
  }

  return (
    <AppContext.Provider value={{
      currentUser,
      setCurrentUser,
      legalBodies,
      addLegalBody,
      updateLegalBody,
      deleteLegalBody,
      projects,
      addProject,
      updateProject,
      deleteProject,
      currentProject,
      setCurrentProject,
      controlUnits,
      addControlUnit,
      updateControlUnit,
      deleteControlUnit,
      managementUnits,
      addManagementUnit,
      updateManagementUnit,
      deleteManagementUnit,
      users,
      addUser,
      updateUser,
      deleteUser,
      activeSection,
      setActiveSection,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
