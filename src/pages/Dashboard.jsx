import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import StatCard from '../components/StatCard'
import Badge, { conditionTone, statusTone } from '../components/Badge'
import { Icon } from '../components/Icon'

const CATEGORY_COLORS = ['#7c3aed', '#6366f1', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#14b8a6']

export default function Dashboard() {
  const { user } = useAuth()
  const { items, events, bookings, lowStockItems, getItem, getEvent } = useData()

  const stats = useMemo(() => {
    const totalItems = items.length
    const totalUnits = items.reduce((s, i) => s + i.quantity, 0)
    const availableUnits = items.reduce((s, i) => s + i.available, 0)
    const totalValue = items.reduce((s, i) => s + i.quantity * i.price, 0)
    const upcomingEvents = events.filter((e) => e.status === 'upcoming').length
    const activeBookings = bookings.filter((b) => b.status === 'reserved' || b.status === 'allocated').length
    const pendingReturns = bookings.filter((b) => b.status === 'allocated' || b.status === 'partial-return').length
    return { totalItems, totalUnits, availableUnits, totalValue, upcomingEvents, activeBookings, pendingReturns }
  }, [items, events, bookings])

  const categoryData = useMemo(() => {
    const map = {}
    items.forEach((i) => {
      map[i.category] = (map[i.category] || 0) + i.quantity
    })
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)
  }, [items])

  const availabilityData = useMemo(() => {
    let available = 0, allocated = 0, damaged = 0
    items.forEach((i) => {
      available += i.available
      allocated += i.quantity - i.available
      if (i.condition === 'Damaged' || i.condition === 'Needs Repair') damaged += i.quantity
    })
    return [
      { name: 'Available', value: available },
      { name: 'Allocated', value: allocated },
    ]
  }, [items])

  const upcomingEvents = useMemo(
    () => events.filter((e) => e.status === 'upcoming').sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate)).slice(0, 5),
    [events]
  )

  const recentBookings = useMemo(
    () => [...bookings].sort((a, b) => new Date(b.bookedAt) - new Date(a.bookedAt)).slice(0, 6),
    [bookings]
  )

  return (
    <div className="space-y-6 animate-fade">
      {/* Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Hello, {user?.name?.split(' ')[0]} </h2>
          <p className="text-sm text-slate-500">Here's what's happening with your inventory today.</p>
        </div>
        {lowStockItems.length > 0 && (
          <Link to="/inventory" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 text-red-700 text-sm font-medium hover:bg-red-100 transition">
            <Icon name="alert" className="w-4 h-4" />
            {lowStockItems.length} item(s) need restocking
          </Link>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Items" value={stats.totalItems} icon="package" tone="purple" sub={`${stats.totalUnits} units in stock`} />
        <StatCard label="Inventory Value" value={`$${stats.totalValue.toLocaleString()}`} icon="dollar" tone="green" sub="Total replacement value" />
        <StatCard label="Low Stock Alerts" value={lowStockItems.length} icon="alert" tone="red" sub="At or below minimum" />
        <StatCard label="Active Bookings" value={stats.activeBookings} icon="clipboard" tone="blue" sub={`${stats.pendingReturns} pending returns`} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">Inventory by Category</h3>
            <Link to="/reports" className="text-sm text-brand-600 hover:text-brand-700 font-medium">View reports →</Link>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={categoryData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} angle={-30} textAnchor="end" height={60} interval={0} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
              <Bar dataKey="value" name="Units" radius={[6, 6, 0, 0]}>
                {categoryData.map((_, i) => (
                  <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold text-slate-800 mb-4">Stock Availability</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={availabilityData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3}>
                <Cell fill="#10b981" />
                <Cell fill="#c4b5fd" />
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Available units</span>
              <span className="font-semibold text-emerald-600">{stats.availableUnits}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Allocated units</span>
              <span className="font-semibold text-brand-600">{stats.totalUnits - stats.availableUnits}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Low stock + upcoming events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <Icon name="alert" className="w-4 h-4 text-red-500" /> Low Stock Alerts
            </h3>
            <Link to="/inventory" className="text-sm text-brand-600 hover:text-brand-700 font-medium">View all →</Link>
          </div>
          {lowStockItems.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">All items are well stocked.</div>
          ) : (
            <div className="space-y-2">
              {lowStockItems.slice(0, 6).map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-red-50/50 border border-red-100">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{item.name}</p>
                    <p className="text-xs text-slate-400">{item.category} • Min: {item.minStock}</p>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className="text-sm font-bold text-red-600">{item.available}</p>
                    <p className="text-xs text-slate-400">available</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <Icon name="calendar" className="w-4 h-4 text-brand-500" /> Upcoming Events
            </h3>
            <Link to="/events" className="text-sm text-brand-600 hover:text-brand-700 font-medium">View all →</Link>
          </div>
          {upcomingEvents.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">No upcoming events.</div>
          ) : (
            <div className="space-y-2">
              {upcomingEvents.map((ev) => {
                const eventBookings = bookings.filter((b) => b.eventId === ev.id)
                const days = Math.ceil((new Date(ev.eventDate) - new Date()) / (1000 * 60 * 60 * 24))
                return (
                  <Link key={ev.id} to="/events" className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 border border-slate-100 transition">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate">{ev.name}</p>
                      <p className="text-xs text-slate-400 truncate">{ev.venue}</p>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <p className="text-sm font-semibold text-slate-700">{new Date(ev.eventDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                      <p className="text-xs text-slate-400">{days <= 0 ? 'Today' : `${days} day(s)`}</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent bookings */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-800">Recent Bookings</h3>
          <Link to="/bookings" className="text-sm text-brand-600 hover:text-brand-700 font-medium">View all →</Link>
        </div>
        <div className="table-wrap">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="th">Item</th>
                <th className="th">Event</th>
                <th className="th">Qty</th>
                <th className="th">Status</th>
                <th className="th">Booked</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {recentBookings.map((b) => {
                const item = getItem(b.itemId)
                const ev = getEvent(b.eventId)
                return (
                  <tr key={b.id} className="hover:bg-slate-50">
                    <td className="td font-medium text-slate-700">{item?.name || '—'}</td>
                    <td className="td">{ev?.name || '—'}</td>
                    <td className="td">{b.quantity}</td>
                    <td className="td"><Badge tone={statusTone(b.status)}>{b.status}</Badge></td>
                    <td className="td text-slate-400">{new Date(b.bookedAt).toLocaleDateString()}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
