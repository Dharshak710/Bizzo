import { NavLink } from 'react-router-dom'
import { Icon } from './Icon'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'

const navItems = [
  { to: '/', label: 'Dashboard', icon: 'dashboard', roles: ['Admin', 'Staff', 'Viewer'] },
  { to: '/inventory', label: 'Inventory', icon: 'box', roles: ['Admin', 'Staff', 'Viewer'] },
  { to: '/events', label: 'Events', icon: 'calendar', roles: ['Admin', 'Staff', 'Viewer'] },
  { to: '/bookings', label: 'Bookings', icon: 'clipboard', roles: ['Admin', 'Staff', 'Viewer'] },
  { to: '/vendors', label: 'Vendors', icon: 'truck', roles: ['Admin', 'Staff', 'Viewer'] },
  { to: '/reports', label: 'Reports', icon: 'chart', roles: ['Admin', 'Staff'] },
  { to: '/users', label: 'Users', icon: 'users', roles: ['Admin'] },
]

export default function Sidebar({ open, onClose }) {
  const { user } = useAuth()
  const { lowStockCount } = useData()

  const items = navItems.filter((n) => user && n.roles.includes(user.role))

  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden" onClick={onClose} />}
      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex items-center gap-3 px-6 h-16 border-b border-slate-200 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold text-sm">EP</div>
          <div>
            <p className="font-bold text-slate-800 text-sm leading-tight">
Bizzo
</p>

<p className="text-xs text-slate-400 leading-tight">
Inventory
</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                }`
              }
            >
              <Icon name={item.icon} className="w-5 h-5 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.to === '/inventory' && lowStockCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-600">{lowStockCount}</span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-slate-200 shrink-0">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-semibold text-sm">
              {user?.name?.split(' ').map((n) => n[0]).join('')}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-800 truncate">{user?.name}</p>
              <p className="text-xs text-slate-400">{user?.role}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
