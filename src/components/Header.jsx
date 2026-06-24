import { useNavigate } from 'react-router-dom'
import { Icon } from './Icon'
import { useAuth } from '../context/AuthContext'

export default function Header({ title, subtitle, onMenu }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        <button onClick={onMenu} className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100">
          <Icon name="menu" />
        </button>
        <div className="min-w-0">
          <h1 className="text-lg sm:text-xl font-bold text-slate-800 truncate">{title}</h1>
          {subtitle && <p className="text-xs text-slate-400 hidden sm:block truncate">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <div className="hidden md:flex items-center gap-2 text-sm text-slate-500">
          <Icon name="clock" className="w-4 h-4" />
          <span>{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
        </div>
        <button
          onClick={() => { logout(); navigate('/login') }}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition"
          title="Logout"
        >
          <Icon name="logout" className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  )
}
