import { useState, useMemo } from 'react'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import Badge, { statusTone, conditionTone } from '../components/Badge'
import { Icon } from '../components/Icon'

const emptyForm = { name: '', client: '', eventDate: '', venue: '', status: 'upcoming', description: '' }

const EVENT_STATUSES = ['upcoming', 'ongoing', 'completed', 'cancelled']

export default function Events() {
  const { events, items, bookings, addEvent, updateEvent, deleteEvent, addBooking, getItem } = useData()
  const { hasRole } = useAuth()
  const canEdit = hasRole('Admin', 'Staff')

  const [statusFilter, setStatusFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [detailEvent, setDetailEvent] = useState(null)
  const [allocForm, setAllocForm] = useState({ itemId: '', quantity: 1, returnDate: '', notes: '' })

  const filtered = useMemo(() => {
    return events
      .filter((e) => statusFilter === 'All' || e.status === statusFilter)
      .filter((e) => {
        const q = search.toLowerCase()
        return !q || e.name.toLowerCase().includes(q) || e.client.toLowerCase().includes(q) || e.venue.toLowerCase().includes(q)
      })
      .sort((a, b) => new Date(b.eventDate) - new Date(a.eventDate))
  }, [events, statusFilter, search])

  const openAdd = () => {
    setEditing(null)
    setForm(emptyForm)
    setFormError('')
    setModalOpen(true)
  }

  const openEdit = (ev) => {
    setEditing(ev)
    setForm({ name: ev.name, client: ev.client, eventDate: ev.eventDate, venue: ev.venue, status: ev.status, description: ev.description || '' })
    setFormError('')
    setModalOpen(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return setFormError('Event name is required.')
    if (!form.eventDate) return setFormError('Event date is required.')
    const payload = { ...form, name: form.name.trim() }
    if (editing) updateEvent(editing.id, payload)
    else addEvent(payload)
    setModalOpen(false)
  }

  const openDetail = (ev) => {
    setDetailEvent(ev)
    setAllocForm({ itemId: items[0]?.id || '', quantity: 1, returnDate: '', notes: '' })
  }

  const eventBookings = useMemo(
    () => detailEvent ? bookings.filter((b) => b.eventId === detailEvent.id) : [],
    [detailEvent, bookings]
  )

  const handleAllocate = (e) => {
    e.preventDefault()
    const item = getItem(allocForm.itemId)
    if (!item) return
    const qty = Number(allocForm.quantity)
    if (qty < 1) return alert('Quantity must be at least 1.')
    if (qty > item.available) return alert(`Only ${item.available} units of "${item.name}" available.`)
    addBooking({
      eventId: detailEvent.id,
      itemId: allocForm.itemId,
      quantity: qty,
      status: 'reserved',
      returnDate: allocForm.returnDate || detailEvent.eventDate,
      condition: item.condition,
      notes: allocForm.notes,
    })
    setAllocForm({ itemId: items[0]?.id || '', quantity: 1, returnDate: '', notes: '' })
  }

  const availableItems = items.filter((i) => i.available > 0)

  return (
    <div className="space-y-4 animate-fade">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Icon name="search" className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input pl-10" placeholder="Search events..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="select w-auto" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="All">All Status</option>
          {EVENT_STATUSES.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
        </select>
        {canEdit && (
          <button className="btn-primary shrink-0" onClick={openAdd}>
            <Icon name="plus" className="w-4 h-4" /> Add Event
          </button>
        )}
      </div>

      {/* Event cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full card p-12 text-center text-slate-400">No events found.</div>
        ) : filtered.map((ev) => {
          const evBookings = bookings.filter((b) => b.eventId === ev.id)
          const totalItems = evBookings.reduce((s, b) => s + b.quantity, 0)
          const days = Math.ceil((new Date(ev.eventDate) - new Date()) / (1000 * 60 * 60 * 24))
          return (
            <div key={ev.id} className="card p-5 flex flex-col hover:shadow-md transition">
              <div className="flex items-start justify-between mb-3">
                <div className="min-w-0">
                  <h3 className="font-semibold text-slate-800 truncate">{ev.name}</h3>
                  <p className="text-sm text-slate-500 truncate">{ev.client}</p>
                </div>
                <Badge tone={statusTone(ev.status)}>{ev.status}</Badge>
              </div>
              <div className="space-y-1.5 text-sm text-slate-500 mb-4 flex-1">
                <div className="flex items-center gap-2">
                  <Icon name="calendar" className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{new Date(ev.eventDate).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="mapPin" className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="truncate">{ev.venue}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="package" className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{evBookings.length} item type(s) • {totalItems} units allocated</span>
                </div>
              </div>
              {ev.status === 'upcoming' && days >= 0 && (
                <div className="mb-3 text-xs font-medium text-brand-600 bg-brand-50 px-3 py-1.5 rounded-lg inline-block w-fit">
                  {days === 0 ? 'Happening today' : `In ${days} day(s)`}
                </div>
              )}
              <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                <button className="btn-secondary btn-sm flex-1" onClick={() => openDetail(ev)}>
                  <Icon name="eye" className="w-4 h-4" /> View / Allocate
                </button>
                {canEdit && (
                  <button className="p-2 rounded-lg text-slate-500 hover:bg-slate-100" onClick={() => openEdit(ev)} title="Edit">
                    <Icon name="edit" className="w-4 h-4" />
                  </button>
                )}
                {canEdit && (
                  <button className="p-2 rounded-lg text-red-500 hover:bg-red-50" onClick={() => setDeleteTarget(ev)} title="Delete">
                    <Icon name="trash" className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Add/Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Event' : 'Add Event'} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && <div className="px-4 py-2.5 rounded-lg bg-red-50 text-red-600 text-sm">{formError}</div>}
          <div>
            <label className="label">Event Name *</label>
            <input className="input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Anderson Wedding" />
          </div>
          <div>
            <label className="label">Client Name</label>
            <input className="input" value={form.client} onChange={(e) => setForm((f) => ({ ...f, client: e.target.value }))} placeholder="e.g. Mia & Luke Anderson" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Event Date *</label>
              <input type="date" className="input" value={form.eventDate} onChange={(e) => setForm((f) => ({ ...f, eventDate: e.target.value }))} />
            </div>
            <div>
              <label className="label">Status</label>
              <select className="select" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
                {EVENT_STATUSES.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Venue</label>
            <input className="input" value={form.venue} onChange={(e) => setForm((f) => ({ ...f, venue: e.target.value }))} placeholder="e.g. The Grand Pavilion, Hamptons" />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input" rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Event details, theme, guest count..." />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary">{editing ? 'Save Changes' : 'Add Event'}</button>
          </div>
        </form>
      </Modal>

      {/* Event Detail / Allocation Modal */}
      <Modal open={!!detailEvent} onClose={() => setDetailEvent(null)} title={detailEvent?.name} size="xl">
        {detailEvent && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-slate-50">
                <p className="text-xs text-slate-400">Client</p>
                <p className="text-sm font-medium text-slate-700 truncate">{detailEvent.client || '—'}</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50">
                <p className="text-xs text-slate-400">Date</p>
                <p className="text-sm font-medium text-slate-700">{new Date(detailEvent.eventDate).toLocaleDateString()}</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50">
                <p className="text-xs text-slate-400">Venue</p>
                <p className="text-sm font-medium text-slate-700 truncate">{detailEvent.venue || '—'}</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50">
                <p className="text-xs text-slate-400">Status</p>
                <Badge tone={statusTone(detailEvent.status)}>{detailEvent.status}</Badge>
              </div>
            </div>

            {canEdit && (
              <form onSubmit={handleAllocate} className="p-4 rounded-lg border border-slate-200 bg-slate-50/50">
                <p className="text-sm font-semibold text-slate-700 mb-3">Allocate Inventory to this Event</p>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="sm:col-span-2">
                    <label className="label">Item</label>
                    <select className="select" value={allocForm.itemId} onChange={(e) => setAllocForm((s) => ({ ...s, itemId: e.target.value }))}>
                      <option value="">Select item...</option>
                      {availableItems.map((i) => <option key={i.id} value={i.id}>{i.name} ({i.available} avail)</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Quantity</label>
                    <input type="number" min="1" className="input" value={allocForm.quantity} onChange={(e) => setAllocForm((s) => ({ ...s, quantity: e.target.value }))} />
                  </div>
                  <div>
                    <label className="label">Return Date</label>
                    <input type="date" className="input" value={allocForm.returnDate} onChange={(e) => setAllocForm((s) => ({ ...s, returnDate: e.target.value }))} />
                  </div>
                </div>
                <div className="mt-3">
                  <label className="label">Notes</label>
                  <input className="input" value={allocForm.notes} onChange={(e) => setAllocForm((s) => ({ ...s, notes: e.target.value }))} placeholder="Optional notes" />
                </div>
                <button type="submit" className="btn-primary btn-sm mt-3" disabled={!allocForm.itemId}>
                  <Icon name="plus" className="w-4 h-4" /> Allocate Item
                </button>
              </form>
            )}

            <div>
              <p className="text-sm font-semibold text-slate-700 mb-3">Allocated Items ({eventBookings.length})</p>
              <div className="table-wrap border border-slate-200 rounded-lg">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="th">Item</th>
                      <th className="th">Qty</th>
                      <th className="th">Condition</th>
                      <th className="th">Status</th>
                      <th className="th">Return Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {eventBookings.length === 0 ? (
                      <tr><td colSpan={5} className="td text-center py-6 text-slate-400">No items allocated yet.</td></tr>
                    ) : eventBookings.map((b) => {
                      const item = getItem(b.itemId)
                      return (
                        <tr key={b.id} className="hover:bg-slate-50">
                          <td className="td font-medium text-slate-700">{item?.name || '—'}</td>
                          <td className="td">{b.quantity}</td>
                          <td className="td"><Badge tone={conditionTone(b.condition)}>{b.condition}</Badge></td>
                          <td className="td"><Badge tone={statusTone(b.status)}>{b.status}</Badge></td>
                          <td className="td text-slate-400">{b.returnDate ? new Date(b.returnDate).toLocaleDateString() : '—'}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteEvent(deleteTarget.id)}
        title="Delete Event"
        message={`Delete "${deleteTarget?.name}"? All related bookings will also be removed. This cannot be undone.`}
        confirmText="Delete"
      />
    </div>
  )
}
