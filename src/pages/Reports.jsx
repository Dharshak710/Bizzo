import { useMemo, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line, AreaChart, Area } from 'recharts'
import { useData } from '../context/DataContext'
import { Icon } from '../components/Icon'
import Badge, { conditionTone } from '../components/Badge'

const COLORS = ['#7c3aed', '#6366f1', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#14b8a6']

export default function Reports() {
  const { items, events, bookings, transactions, vendors, getItem, getEvent } = useData()
  const [tab, setTab] = useState('stock')

  /* Stock report data */
  const stockByCategory = useMemo(() => {
    const map = {}
    items.forEach((i) => {
      if (!map[i.category]) map[i.category] = { category: i.category, total: 0, available: 0, value: 0 }
      map[i.category].total += i.quantity
      map[i.category].available += i.available
      map[i.category].value += i.quantity * i.price
    })
    return Object.values(map).sort((a, b) => b.total - a.total)
  }, [items])

  const conditionDist = useMemo(() => {
    const map = {}
    items.forEach((i) => { map[i.condition] = (map[i.condition] || 0) + 1 })
    return Object.entries(map).map(([name, value]) => ({ name, value }))
  }, [items])

  const locationDist = useMemo(() => {
    const map = {}
    items.forEach((i) => { map[i.location] = (map[i.location] || 0) + i.quantity })
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)
  }, [items])

  /* Usage report data */
  const usageByItem = useMemo(() => {
    const map = {}
    bookings.forEach((b) => {
      const item = getItem(b.itemId)
      if (!item) return
      if (!map[b.itemId]) map[b.itemId] = { name: item.name, category: item.category, booked: 0, events: new Set() }
      map[b.itemId].booked += b.quantity
      map[b.itemId].events.add(b.eventId)
    })
    return Object.values(map).map((m) => ({ ...m, events: m.events.size })).sort((a, b) => b.booked - a.booked).slice(0, 10)
  }, [bookings, getItem])

  const eventAllocations = useMemo(() => {
    return events.map((ev) => {
      const evBookings = bookings.filter((b) => b.eventId === ev.id)
      return {
        name: ev.name,
        units: evBookings.reduce((s, b) => s + b.quantity, 0),
        items: evBookings.length,
      }
    }).sort((a, b) => b.units - a.units)
  }, [events, bookings])

  /* Transaction timeline */
  const txTimeline = useMemo(() => {
    const map = {}
    transactions.forEach((t) => {
      const m = t.date.slice(0, 7)
      if (!map[m]) map[m] = { month: m, in: 0, out: 0 }
      if (t.type === 'in') map[m].in += t.quantity
      else map[m].out += t.quantity
    })
    return Object.values(map).sort((a, b) => a.month.localeCompare(b.month))
  }, [transactions])

  /* Vendor report */
  const vendorStats = useMemo(() => {
    return vendors.map((v) => {
      const vendorItems = items.filter((i) => i.vendorId === v.id)
      return {
        ...v,
        itemCount: vendorItems.length,
        totalUnits: vendorItems.reduce((s, i) => s + i.quantity, 0),
        totalValue: vendorItems.reduce((s, i) => s + i.quantity * i.price, 0),
      }
    }).sort((a, b) => b.totalValue - a.totalValue)
  }, [vendors, items])

  const totalValue = items.reduce((s, i) => s + i.quantity * i.price, 0)

  const tabs = [
    { id: 'stock', label: 'Stock & Availability', icon: 'box' },
    { id: 'usage', label: 'Usage & Allocation', icon: 'chart' },
    { id: 'vendors', label: 'Vendor Analysis', icon: 'truck' },
  ]

  return (
    <div className="space-y-5 animate-fade">
      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-lg w-fit">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition ${tab === t.id ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Icon name={t.icon} className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {/* Stock & Availability */}
      {tab === 'stock' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="card p-5">
              <h3 className="font-semibold text-slate-800 mb-4">Stock by Category</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stockByCategory} layout="vertical" margin={{ left: 20, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis type="category" dataKey="category" tick={{ fontSize: 11, fill: '#64748b' }} width={100} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
                  <Bar dataKey="total" name="Total Units" fill="#7c3aed" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="available" name="Available" fill="#c4b5fd" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="card p-5">
              <h3 className="font-semibold text-slate-800 mb-4">Condition Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={conditionDist} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                    {conditionDist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="font-semibold text-slate-800 mb-4">Stock Value by Category</h3>
            <div className="table-wrap">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="th">Category</th>
                    <th className="th">Total Units</th>
                    <th className="th">Available</th>
                    <th className="th">Allocated</th>
                    <th className="th">Value</th>
                    <th className="th">% of Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {stockByCategory.map((c) => (
                    <tr key={c.category} className="hover:bg-slate-50">
                      <td className="td font-medium text-slate-700">{c.category}</td>
                      <td className="td">{c.total}</td>
                      <td className="td text-emerald-600">{c.available}</td>
                      <td className="td text-amber-600">{c.total - c.available}</td>
                      <td className="td font-semibold">${c.value.toLocaleString()}</td>
                      <td className="td">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-brand-500 rounded-full" style={{ width: `${totalValue ? (c.value / totalValue * 100) : 0}%` }} />
                          </div>
                          <span className="text-xs text-slate-400">{totalValue ? (c.value / totalValue * 100).toFixed(1) : 0}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50 font-semibold">
                    <td className="td">Total</td>
                    <td className="td">{stockByCategory.reduce((s, c) => s + c.total, 0)}</td>
                    <td className="td text-emerald-600">{stockByCategory.reduce((s, c) => s + c.available, 0)}</td>
                    <td className="td text-amber-600">{stockByCategory.reduce((s, c) => s + (c.total - c.available), 0)}</td>
                    <td className="td">${totalValue.toLocaleString()}</td>
                    <td className="td">100%</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="font-semibold text-slate-800 mb-4">Units by Storage Location</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={locationDist} margin={{ left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} angle={-20} textAnchor="end" height={60} interval={0} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
                <Bar dataKey="value" name="Units" radius={[6, 6, 0, 0]} fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Usage & Allocation */}
      {tab === 'usage' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="card p-5">
              <h3 className="font-semibold text-slate-800 mb-4">Top 10 Most Booked Items</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={usageByItem} layout="vertical" margin={{ left: 20, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} width={120} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
                  <Bar dataKey="booked" name="Units Booked" radius={[0, 4, 4, 0]} fill="#7c3aed" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="card p-5">
              <h3 className="font-semibold text-slate-800 mb-4">Units Allocated per Event</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={eventAllocations} margin={{ left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} angle={-25} textAnchor="end" height={70} interval={0} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
                  <Bar dataKey="units" name="Units Allocated" radius={[6, 6, 0, 0]} fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="font-semibold text-slate-800 mb-4">Stock Movement Timeline</h3>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={txTimeline} margin={{ left: -10 }}>
                <defs>
                  <linearGradient id="gIn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gOut" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="in" name="Stock In" stroke="#10b981" fill="url(#gIn)" strokeWidth={2} />
                <Area type="monotone" dataKey="out" name="Stock Out" stroke="#ef4444" fill="url(#gOut)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="card p-5">
            <h3 className="font-semibold text-slate-800 mb-4">Item Usage Detail</h3>
            <div className="table-wrap">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="th">Item</th>
                    <th className="th">Category</th>
                    <th className="th">Total Booked</th>
                    <th className="th">Events</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {usageByItem.map((u) => (
                    <tr key={u.name} className="hover:bg-slate-50">
                      <td className="td font-medium text-slate-700">{u.name}</td>
                      <td className="td"><Badge tone="indigo">{u.category}</Badge></td>
                      <td className="td font-semibold">{u.booked}</td>
                      <td className="td">{u.events}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Vendor Analysis */}
      {tab === 'vendors' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="card p-5">
              <h3 className="font-semibold text-slate-800 mb-4">Inventory Value by Vendor</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={vendorStats} layout="vertical" margin={{ left: 20, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} width={120} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} formatter={(v) => `$${v.toLocaleString()}`} />
                  <Bar dataKey="totalValue" name="Value" radius={[0, 4, 4, 0]} fill="#7c3aed" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="card p-5">
              <h3 className="font-semibold text-slate-800 mb-4">Units Supplied by Vendor</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={vendorStats} dataKey="totalUnits" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ totalUnits }) => totalUnits}>
                    {vendorStats.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="font-semibold text-slate-800 mb-4">Vendor Summary</h3>
            <div className="table-wrap">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="th">Vendor</th>
                    <th className="th">Category</th>
                    <th className="th">Contact</th>
                    <th className="th">Items</th>
                    <th className="th">Total Units</th>
                    <th className="th">Total Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {vendorStats.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50">
                      <td className="td font-medium text-slate-700">{v.name}</td>
                      <td className="td"><Badge tone="indigo">{v.category}</Badge></td>
                      <td className="td text-slate-500">{v.contactPerson || '—'}</td>
                      <td className="td">{v.itemCount}</td>
                      <td className="td">{v.totalUnits}</td>
                      <td className="td font-semibold">${v.totalValue.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
