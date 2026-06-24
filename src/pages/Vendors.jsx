import { useState, useMemo } from 'react'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import Badge from '../components/Badge'
import { Icon } from '../components/Icon'

const emptyForm = { name: '', contactPerson: '', email: '', phone: '', address: '', category: 'Decor', notes: '' }

export default function Vendors() {
  const { vendors, items, CATEGORIES, addVendor, updateVendor, deleteVendor } = useData()
  const { hasRole } = useAuth()
  const canEdit = hasRole('Admin', 'Staff')

  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('All')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const filtered = useMemo(() => {
    return vendors
      .filter((v) => catFilter === 'All' || v.category === catFilter)
      .filter((v) => {
        const q = search.toLowerCase()
        return !q || v.name.toLowerCase().includes(q) || v.contactPerson.toLowerCase().includes(q) || v.email.toLowerCase().includes(q)
      })
  }, [vendors, search, catFilter])

  const vendorItemCount = (vendorId) => items.filter((i) => i.vendorId === vendorId).length

  const openAdd = () => { setEditing(null); setForm(emptyForm); setModalOpen(true) }
  const openEdit = (v) => {
    setEditing(v)
    setForm({ name: v.name, contactPerson: v.contactPerson, email: v.email, phone: v.phone, address: v.address, category: v.category, notes: v.notes || '' })
    setModalOpen(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    const payload = { ...form, name: form.name.trim() }
    if (editing) updateVendor(editing.id, payload)
    else addVendor(payload)
    setModalOpen(false)
  }

  return (
    <div className="space-y-4 animate-fade">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Icon name="search" className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input pl-10" placeholder="Search vendors..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="select w-auto" value={catFilter} onChange={(e) => setCatFilter(e.target.value)}>
          <option value="All">All Categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        {canEdit && (
          <button className="btn-primary shrink-0" onClick={openAdd}>
            <Icon name="plus" className="w-4 h-4" /> Add Vendor
          </button>
        )}
      </div>

      {/* Vendor cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full card p-12 text-center text-slate-400">No vendors found.</div>
        ) : filtered.map((v) => (
          <div key={v.id} className="card p-5 hover:shadow-md transition">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center font-bold shrink-0">
                  {v.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-slate-800 truncate">{v.name}</h3>
                  <Badge tone="indigo">{v.category}</Badge>
                </div>
              </div>
            </div>
            <div className="space-y-1.5 text-sm text-slate-500 mb-4">
              {v.contactPerson && (
                <div className="flex items-center gap-2">
                  <Icon name="users" className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="truncate">{v.contactPerson}</span>
                </div>
              )}
              {v.email && (
                <div className="flex items-center gap-2">
                  <Icon name="mail" className="w-4 h-4 text-slate-400 shrink-0" />
                  <a href={`mailto:${v.email}`} className="truncate hover:text-brand-600">{v.email}</a>
                </div>
              )}
              {v.phone && (
                <div className="flex items-center gap-2">
                  <Icon name="phone" className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{v.phone}</span>
                </div>
              )}
              {v.address && (
                <div className="flex items-center gap-2">
                  <Icon name="mapPin" className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="truncate">{v.address}</span>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <span className="text-sm text-slate-400">{vendorItemCount(v.id)} item(s) supplied</span>
              {canEdit && (
                <div className="flex items-center gap-1">
                  <button onClick={() => openEdit(v)} className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100" title="Edit">
                    <Icon name="edit" className="w-4 h-4" />
                  </button>
                  <button onClick={() => setDeleteTarget(v)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50" title="Delete">
                    <Icon name="trash" className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            {v.notes && <p className="mt-3 text-xs text-slate-400 bg-slate-50 rounded-lg p-2.5">{v.notes}</p>}
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Vendor' : 'Add Vendor'} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Vendor Name *</label>
            <input className="input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Luminosa Lighting Co." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Contact Person</label>
              <input className="input" value={form.contactPerson} onChange={(e) => setForm((f) => ({ ...f, contactPerson: e.target.value }))} placeholder="e.g. Marco Rossi" />
            </div>
            <div>
              <label className="label">Category</label>
              <select className="select" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Email</label>
              <input type="email" className="input" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="contact@vendor.com" />
            </div>
            <div>
              <label className="label">Phone</label>
              <input className="input" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="+1 (555) 000-0000" />
            </div>
          </div>
          <div>
            <label className="label">Address</label>
            <input className="input" value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} placeholder="Street, City, State" />
          </div>
          <div>
            <label className="label">Notes</label>
            <textarea className="input" rows={2} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder="Terms, delivery notes, etc." />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary">{editing ? 'Save Changes' : 'Add Vendor'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteVendor(deleteTarget.id)}
        title="Delete Vendor"
        message={`Delete "${deleteTarget?.name}"? This cannot be undone.`}
        confirmText="Delete"
      />
    </div>
  )
}
