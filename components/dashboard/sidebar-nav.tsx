'use client'

import { motion } from 'framer-motion'
import {
  Stethoscope,
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Activity,
  Heart,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  icon: React.ElementType
  label: string
  id: string
  active?: boolean
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Tableau de bord', id: 'dashboard', active: true },
  { icon: Users, label: 'Patientes', id: 'patients' },
  { icon: Activity, label: 'Analyses', id: 'analytics' },
  { icon: FileText, label: 'Rapports', id: 'reports' },
  { icon: Heart, label: 'Suivi PNC', id: 'pnc-followup' },
]

const bottomItems: NavItem[] = [
  { icon: Settings, label: 'Paramètres', id: 'settings' },
  { icon: HelpCircle, label: 'Aide', id: 'help' },
]

export interface SidebarNavProps {
  collapsed: boolean
  onCollapsedChange: (collapsed: boolean) => void
  activeItem: string
  onActiveItemChange: (id: string) => void
}

export function SidebarNav({
  collapsed,
  onCollapsedChange,
  activeItem,
  onActiveItemChange,
}: SidebarNavProps) {

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 260 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed left-0 top-0 z-40 flex h-screen flex-col bg-sidebar text-sidebar-foreground"
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
        <motion.div
          animate={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : 'auto' }}
          transition={{ duration: 0.2 }}
          className="flex items-center gap-3 overflow-hidden"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary">
            <Stethoscope className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-tight">PNC Predict</span>
            <span className="text-xs text-sidebar-foreground/70">Anticiper pour protéger</span>
          </div>
        </motion.div>
        {collapsed && (
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary">
            <Stethoscope className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-1 p-3">
        <div className="mb-2 px-3">
          <span className={cn(
            "text-xs font-medium uppercase tracking-wider text-sidebar-foreground/50 transition-opacity",
            collapsed && "opacity-0"
          )}>
            Menu principal
          </span>
        </div>
        {navItems.map((item) => (
          <NavButton 
            key={item.id} 
            item={item} 
            collapsed={collapsed} 
            isActive={activeItem === item.id}
            onClick={() => onActiveItemChange(item.id)}
          />
        ))}

        <div className="mt-auto">
          <div className="mb-2 px-3">
            <span className={cn(
              "text-xs font-medium uppercase tracking-wider text-sidebar-foreground/50 transition-opacity",
              collapsed && "opacity-0"
            )}>
              Support
            </span>
          </div>
          {bottomItems.map((item) => (
            <NavButton 
              key={item.id} 
              item={item} 
              collapsed={collapsed} 
              isActive={activeItem === item.id}
              onClick={() => onActiveItemChange(item.id)}
            />
          ))}
        </div>
      </nav>

      {/* Collapse button */}
      <button
        onClick={() => onCollapsedChange(!collapsed)}
        className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full border border-sidebar-border bg-sidebar text-sidebar-foreground shadow-sm transition-colors hover:bg-sidebar-accent"
      >
        {collapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </button>
    </motion.aside>
  )
}

function NavButton({ 
  item, 
  collapsed, 
  isActive, 
  onClick 
}: { 
  item: NavItem; 
  collapsed: boolean; 
  isActive: boolean;
  onClick: () => void;
}) {
  const Icon = item.icon

  return (
    <motion.button
      onClick={onClick}
      className={cn(
        "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all w-full text-left",
        isActive
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
      )}
      whileHover={{ x: 2 }}
      whileTap={{ scale: 0.98 }}
    >
      <Icon className="h-5 w-5 shrink-0" />
      <motion.span
        animate={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : 'auto' }}
        transition={{ duration: 0.2 }}
        className="overflow-hidden whitespace-nowrap"
      >
        {item.label}
      </motion.span>
    </motion.button>
  )
}
