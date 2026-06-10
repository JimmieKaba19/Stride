import { Outlet, NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Target, CheckSquare,
  Flame, BookOpen, Settings, LogOut, Menu
} from 'lucide-react'
import { ROUTES, APP_NAME } from '../../constants'
import { useAuth } from '../../hooks/useAuth'
import { useUIStore } from '../../store/useUIStore'
import { cn, initials } from '../../utils'

const NAV = [
  { to: ROUTES.DASHBOARD, icon: LayoutDashboard, label: 'Dashboard'     },
  { to: ROUTES.GOALS,     icon: Target,          label: 'Goals'         },
  { to: ROUTES.CHECKIN,   icon: CheckSquare,     label: 'Check-in'      },
  { to: ROUTES.MISSION,   icon: Flame,           label: "Tonight's mission" },
  { to: ROUTES.REVIEW,    icon: BookOpen,        label: 'Weekly review' },
]

export const AppLayout = () => {
  const { profile, signOut }       = useAuth()
  const { sidebarOpen, toggleSidebar } = useUIStore()

  return (
    <div className="flex h-screen overflow-hidden bg-surface-50">
      {/* Sidebar */}
      <aside className={cn(
        'flex flex-col bg-white border-r border-surface-200 shrink-0 transition-all duration-200',
        sidebarOpen ? 'w-60' : 'w-16'
      )}>
        {/* Logo */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-surface-200">
          {sidebarOpen && (
            <span className="text-lg font-bold text-brand-600">{APP_NAME}</span>
          )}
          <button onClick={toggleSidebar} className="p-1.5 rounded-lg hover:bg-surface-100 text-surface-400">
            <Menu size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 space-y-0.5">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => cn(
                'flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors',
                isActive
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-surface-500 hover:bg-surface-50 hover:text-surface-800'
              )}
            >
              <Icon size={18} className="shrink-0" />
              {sidebarOpen && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div className="p-2 border-t border-surface-200 space-y-0.5">
          <NavLink
            to={ROUTES.SETTINGS}
            className={({ isActive }) => cn(
              'flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors',
              isActive ? 'bg-brand-50 text-brand-700' : 'text-surface-500 hover:bg-surface-50'
            )}
          >
            <Settings size={18} className="shrink-0" />
            {sidebarOpen && <span>Settings</span>}
          </NavLink>

          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-surface-500 hover:bg-surface-50"
          >
            <LogOut size={18} className="shrink-0" />
            {sidebarOpen && <span>Sign out</span>}
          </button>

          {profile && sidebarOpen && (
            <div className="flex items-center gap-2.5 px-3 py-2 mt-1">
              <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-xs font-bold shrink-0">
                {initials(profile.name)}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-surface-900 truncate">{profile.name}</p>
                <p className="text-xs text-surface-400 truncate">{profile.email}</p>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
