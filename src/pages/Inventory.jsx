import { useState, useMemo } from 'react'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import Badge, { conditionTone } from '../components/Badge'
import { Icon } from '../components/Icon'

const emptyForm = {
  name: '', category: 'Decor', sku: '', quantity: '', available: '', condition: 'Excellent',
  location: 'Warehouse A', vendorId: '', minStock: '', price: '', description: '',
}

export default function Inventory() {
  const { items, vendors, CATEGORIES, CONDITIONS, LOCATIONS, addItem, updateItem, deleteItem, adjustStock, getVendor } = useData()
  const { hasRole } = useAuth()
  const canEdit = hasRole('Admin', 'Staff')

  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('All')
  const [locFilter, setLocFilter] = useState('All')
  const [condFilter, setCondFilter] = useState('All')
  const [stockFilter, setStockFilter] = useState('All')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [stockTarget, setStockTarget] = useState(null)
  const [stockForm, setStockForm] = useState({ type: 'in', quantity: 1, note: '' })

  const filtered = useMemo(() => {
    return items.filter((i) => {
      const q = search.toLowerCase()
      const matchSearch = !q || i.name.toLowerCase().includes(q) || i.sku.toLowerCase().includes(q) || i.description.toLowerCase().includes(q)
      const matchCat = catFilter === 'All' || i.category === catFilter
      const matchLoc = locFilter === 'All' || i.location === locFilter
      const matchCond = condFilter === 'All' || i.condition === condFilter
      const isLow = i.available <= i.minStock
      const matchStock = stockFilter === 'All' || (stockFilter === 'low' && isLow) || (stockFilter === 'out' && i.available === 0) || (stockFilter === 'ok' && !isLow)
      return matchSearch && matchCat && matchLoc && matchCond && matchStock
    })
  }, [items, search, catFilter, locFilter, condFilter, stockFilter])

  const openAdd = () => {
    setEditing(null)
    setForm(emptyForm)
    setFormError('')
    setModalOpen(true)
  }

  const openEdit = (item) => {
    setEditing(item)
    setForm({
      name: item.name, category: item.category, sku: item.sku,
      quantity: item.quantity, available: item.available, condition: item.condition,
      location: item.location, vendorId: item.vendorId || '', minStock: item.minStock,
      price: item.price, description: item.description || '',
    })
    setFormError('')
    setModalOpen(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return setFormError('Item name is required.')
    const qty = Number(form.quantity)
    const avail = form.available === '' ? qty : Number(form.available)
    if (qty < 0 || avail < 0 || avail > qty) return setFormError('Check quantity values. Available cannot exceed total.')

    const payload = {
      name: form.name.trim(),
      category: form.category,
      sku: form.sku.trim() || `SKU-${Date.now().toString().slice(-6)}`,
      quantity: qty,
      available: avail,
      condition: form.condition,
      location: form.location,
      vendorId: form.vendorId,
      minStock: Number(form.minStock) || 0,
      price: Number(form.price) || 0,
      description: form.description.trim(),
    }

    if (editing) {
      updateItem(editing.id, payload)
    } else {
      addItem(payload)
    }
    setModalOpen(false)
  }

  const handleStockAdjust = (e) => {
    e.preventDefault()
    const qty = Number(stockForm.quantity)
    if (!qty || qty <= 0) return
    const item = stockTarget
    if (stockForm.type === 'out' && qty > item.available) {
      alert(`Only ${item.available} units available.`)
      return
    }
    adjustStock(item.id, stockForm.type, qty, stockForm.note || `Manual stock ${stockForm.type}`)
    setStockTarget(null)
    setStockForm({ type: 'in', quantity: 1, note: '' })
  }

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  return (
    <div className="space-y-4 animate-fade">
      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <Icon name="search" className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="input pl-10"
            placeholder="Search by name, SKU, or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {canEdit && (
          <button className="btn-primary shrink-0" onClick={openAdd}>
            <Icon name="plus" className="w-4 h-4" /> Add Item
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select className="select w-auto" value={catFilter} onChange={(e) => setCatFilter(e.target.value)}>
          <option value="All">All Categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="select w-auto" value={locFilter} onChange={(e) => setLocFilter(e.target.value)}>
          <option value="All">All Locations</option>
          {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
        <select className="select w-auto" value={condFilter} onChange={(e) => setCondFilter(e.target.value)}>
          <option value="All">All Conditions</option>
          {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="select w-auto" value={stockFilter} onChange={(e) => setStockFilter(e.target.value)}>
          <option value="All">All Stock</option>
          <option value="ok">In Stock</option>
          <option value="low">Low Stock</option>
          <option value="out">Out of Stock</option>
        </select>
        {(search || catFilter !== 'All' || locFilter !== 'All' || condFilter !== 'All' || stockFilter !== 'All') && (
          <button className="btn-ghost btn-sm" onClick={() => { setSearch(''); setCatFilter('All'); setLocFilter('All'); setCondFilter('All'); setStockFilter('All') }}>
            Clear filters
          </button>
        )}
        <span className="text-sm text-slate-400 self-center ml-auto">{filtered.length} item(s)</span>
      </div>

      {/* Table */}
      <div className="card">
        <div className="table-wrap">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="th">Item</th>
                <th className="th">Category</th>
                <th className="th">SKU</th>
                <th className="th">Stock</th>
                <th className="th">Condition</th>
                <th className="th">Location</th>
                <th className="th">Vendor</th>
                <th className="th text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="td text-center py-12 text-slate-400">No items found. Try adjusting your filters.</td>
                </tr>
              ) : filtered.map((item) => {
                const low = item.available <= item.minStock
                const out = item.available === 0
                const vendor = getVendor(item.vendorId)
                return (
                  <tr key={item.id} className="hover:bg-slate-50/70">
                    <td className="td">
                      <div className="font-medium text-slate-800">{item.name}</div>
                      <div className="text-xs text-slate-400">${item.price}/unit</div>
                    </td>
                    <td className="td"><Badge tone="indigo">{item.category}</Badge></td>
                    <td className="td text-slate-400 font-mono text-xs">{item.sku}</td>
                    <td className="td">
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold ${out ? 'text-red-600' : low ? 'text-amber-600' : 'text-slate-700'}`}>
                          {item.available}
                        </span>
                        <span className="text-slate-300">/</span>
                        <span className="text-slate-400">{item.quantity}</span>
                        {out ? <Badge tone="red">Out</Badge> : low ? <Badge tone="yellow">Low</Badge> : null}
                      </div>
                    </td>
                    <td className="td"><Badge tone={conditionTone(item.condition)}>{item.condition}</Badge></td>
                    <td className="td text-slate-500">{item.location}</td>
                    <td className="td text-slate-500">{vendor?.name || '—'}</td>
                    <td className="td">
                      <div className="flex items-center justify-end gap-1">
                        {canEdit && (
                          <button onClick={() => { setStockTarget(item); setStockForm({ type: 'in', quantity: 1, note: '' }) }} className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50" title="Stock in/out">
                            <Icon name="arrowRight" className="w-4 h-4" />
                          </button>
                        )}
                        {canEdit && (
                          <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100" title="Edit">
                            <Icon name="edit" className="w-4 h-4" />
                          </button>
                        )}
                        {canEdit && (
                          <button onClick={() => setDeleteTarget(item)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50" title="Delete">
                            <Icon name="trash" className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Item' : 'Add Inventory Item'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && <div className="px-4 py-2.5 rounded-lg bg-red-50 text-red-600 text-sm">{formError}</div>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="label">Item Name *</label>
              <input className="input" value={form.name} onChange={(e) => setField('name', e.target.value)} placeholder="e.g. Gold Chiavari Chair" />
            </div>
            <div>
              <label className="label">Category</label>
              <select className="select" value={form.category} onChange={(e) => setField('category', e.target.value)}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">SKU</label>
              <input className="input" value={form.sku} onChange={(e) => setField('sku', e.target.value)} placeholder="Auto-generated if blank" />
            </div>
            <div>
              <label className="label">Total Quantity *</label>
              <input type="number" min="0" className="input" value={form.quantity} onChange={(e) => setField('quantity', e.target.value)} placeholder="0" />
            </div>
            <div>
              <label className="label">Available</label>
              <input type="number" min="0" className="input" value={form.available} onChange={(e) => setField('available', e.target.value)} placeholder="Defaults to total" />
            </div>
            <div>
              <label className="label">Condition</label>
              <select className="select" value={form.condition} onChange={(e) => setField('condition', e.target.value)}>
                {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Location</label>
              <select className="select" value={form.location} onChange={(e) => setField('location', e.target.value)}>
                {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Vendor / Supplier</label>
              <select className="select" value={form.vendorId} onChange={(e) => setField('vendorId', e.target.value)}>
                <option value="">— None —</option>
                {vendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Min Stock (alert threshold)</label>
              <input type="number" min="0" className="input" value={form.minStock} onChange={(e) => setField('minStock', e.target.value)} placeholder="0" />
            </div>
            <div>
              <label className="label">Unit Price ($)</label>
              <input type="number" min="0" step="0.01" className="input" value={form.price} onChange={(e) => setField('price', e.target.value)} placeholder="0.00" />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Description</label>
              <textarea className="input" rows={2} value={form.description} onChange={(e) => setField('description', e.target.value)} placeholder="Optional notes about this item" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary">{editing ? 'Save Changes' : 'Add Item'}</button>
          </div>
        </form>
      </Modal>

      {/* Stock In/Out Modal */}
      <Modal open={!!stockTarget} onClose={() => setStockTarget(null)} title="Stock Adjustment" size="sm">
        {stockTarget && (
          <form onSubmit={handleStockAdjust} className="space-y-4">
            <div className="p-3 rounded-lg bg-slate-50">
              <p className="font-medium text-slate-800">{stockTarget.name}</p>
              <p className="text-sm text-slate-500">Available: {stockTarget.available} / {stockTarget.quantity}</p>
            </div>
            <div>
              <label className="label">Movement Type</label>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setStockForm((s) => ({ ...s, type: 'in' }))} className={`btn ${stockForm.type === 'in' ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-300 text-slate-600'}`}>
                  <Icon name="arrowDown" className="w-4 h-4" /> Stock In
                </button>
                <button type="button" onClick={() => setStockForm((s) => ({ ...s, type: 'out' }))} className={`btn ${stockForm.type === 'out' ? 'bg-red-600 text-white' : 'bg-white border border-slate-300 text-slate-600'}`}>
                  <Icon name="arrowUp" className="w-4 h-4" /> Stock Out
                </button>
              </div>
            </div>
            <div>
              <label className="label">Quantity</label>
              <input type="number" min="1" className="input" value={stockForm.quantity} onChange={(e) => setStockForm((s) => ({ ...s, quantity: e.target.value }))} />
            </div>
            <div>
              <label className="label">Note</label>
              <input className="input" value={stockForm.note} onChange={(e) => setStockForm((s) => ({ ...s, note: e.target.value }))} placeholder="Reason for adjustment" />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" className="btn-secondary" onClick={() => setStockTarget(null)}>Cancel</button>
              <button type="submit" className="btn-primary">Confirm</button>
            </div>
          </form>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteItem(deleteTarget.id)}
        title="Delete Item"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This will also remove related bookings and transactions. This cannot be undone.`}
        confirmText="Delete"
      />
    </div>
  )
}
