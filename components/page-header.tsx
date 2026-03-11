'use client'

import React, { Fragment } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Menu, Search, Bell } from 'lucide-react'

interface PageHeaderProps {
  title: string
  breadcrumbs?: { label: string; href?: string }[]
  actions?: React.ReactNode
  showSearch?: boolean
  searchPlaceholder?: string
  onSearch?: (value: string) => void
  onMenuClick?: () => void
}

export function PageHeader({
  title,
  breadcrumbs = [],
  actions,
  showSearch = false,
  searchPlaceholder = 'Buscar...',
  onSearch,
  onMenuClick,
}: PageHeaderProps) {
  return (
    <header className="sticky top-0 z-10 bg-background border-b border-border">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onMenuClick}
          >
            <Menu className="w-5 h-5" />
          </Button>
          
          <div>
            <h1 className="text-xl font-semibold text-foreground">{title}</h1>
            {breadcrumbs.length > 0 && (
              <Breadcrumb className="mt-1">
                <BreadcrumbList>
                  {breadcrumbs.map((crumb, index) => (
                    <Fragment key={crumb.label}>
                      <BreadcrumbItem>
                        <BreadcrumbPage className="text-muted-foreground text-xs">
                          {crumb.label}
                        </BreadcrumbPage>
                      </BreadcrumbItem>
                      {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                    </Fragment>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {showSearch && (
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                className="pl-9 w-64 bg-secondary/50"
                onChange={(e) => onSearch?.(e.target.value)}
              />
            </div>
          )}
          
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
          </Button>

          {actions}
        </div>
      </div>
    </header>
  )
}
