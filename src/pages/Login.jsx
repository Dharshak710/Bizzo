import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { Icon } from '../components/Icon'

export default function Login() {
  const { user, login } = useAuth()
  const { users } = useData()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showPwd, setShowPwd] = useState(false)

  if (user) {
    navigate('/', { replace: true })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    const result = login(email, password, users)
    if (result.ok) {
      navigate('/', { replace: true })
    } else {
      setError(result.error)
    }
  }

  const quickFill = (em, pw) => {
    setEmail(em)
    setPassword(pw)
    setError('')
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
        </div>
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center font-bold text-lg">EP</div>
            <span className="text-xl font-bold">Bizzo Inventory</span>
          </div>
          <h1 className="text-4xl font-bold leading-tight mb-4">
            Inventory management<br />for unforgettable events.
          </h1>
          <p className="text-brand-100 text-lg leading-relaxed mb-10 max-w-md">
            Track decor, lighting, furniture, and equipment across every event. Manage stock, bookings, vendors, and returns — all in one place.
          </p>
          <div className="space-y-3 max-w-sm">
            {[
              'Real-time stock & availability tracking',
              'Event-wise allocation & return management',
              'Low-stock alerts and usage reports',
            ].map((f) => (
              <div key={f} className="flex items-center gap-3 text-brand-100">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <Icon name="check" className="w-3 h-3" />
                </div>
                <span className="text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-slate-50">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold">EP</div>
            <span className="text-lg font-bold text-slate-800">Bizzo Inventory</span>
          </div>

          <h2 className="text-2xl font-bold text-slate-800">Welcome back</h2>
          <p className="text-slate-500 mt-1 mb-8">Sign in to your account to continue.</p>

          {error && (
            <div className="mb-4 flex items-center gap-2 px-4 py-3 rounded-lg bg-red-50 text-red-700 text-sm">
              <Icon name="alert" className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email address</label>
              <input
                type="email"
                className="input"
                placeholder="you@events.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  className="input pr-11"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <Icon name="eye" className="w-5 h-5" />
                </button>
              </div>
            </div>
            <button type="submit" className="btn-primary w-full">Sign in</button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-200">
            <p className="text-xs font-medium text-slate-500 mb-3">Quick demo login — click to autofill:</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Admin', email: 'admin@Bizzo.com', pw: 'admin123' },
                { label: 'Staff', email: 'staff@Bizzo.com', pw: 'staff123' },
                { label: 'Viewer', email: 'viewer@Bizzo.com', pw: 'viewer123' },
              ].map((d) => (
                <button
                  key={d.label}
                  onClick={() => quickFill(d.email, d.pw)}
                  className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:border-brand-400 hover:text-brand-600 transition text-center"
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
