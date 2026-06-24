import { useState, useMemo } from 'react'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import Badge, { statusTone, conditionTone } from '../components/Badge'
import { Icon } from '../components/Icon'

const BOOKING_STATUSES = ['reserved', 'allocated', 'returned', 'partial-return']

export default function Bookings() {
  const { bookings, items, events, addBooking, updateBooking, deleteBooking, getItem, getEvent } = useData()
  const { hasRole } = useAuth()
  const canEdit = hasRole('Admin', 'Staff')

  const [statusFilter, setStatusFilter] = useState('All')
  const [eventFilter, setEventFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [returnTarget, setReturnTarget] = useState(null)
  const [returnForm, setReturnForm] = useState({ type: 'full', returnedQty: 0, condition: 'Excellent', notes: '' })
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [addForm, setAddForm] = useState({ eventId: '', itemId: '', quantity: 1, status: 'reserved', returnDate: '', condition: 'Excellent', notes: '' })
  const [addError, setAddError] = useState('')

  const filtered = useMemo(() => {
    return bookings
      .filter((b) => statusFilter === 'All' || b.status === statusFilter)
      .filter((b) => eventFilter === 'All' || b.eventId === eventFilter)
      .filter((b) => {
        if (!search) return true
        const q = search.toLowerCase()
        const item = getItem(b.itemId)
        const ev = getEvent(b.eventId)
        return item?.name.toLowerCase().includes(q) || ev?.name.toLowerCase().includes(q)
      })
      .sort((a, b) => new Date(b.bookedAt) - new Date(a.bookedAt))
  }, [bookings, statusFilter, eventFilter, search, getItem, getEvent])

  const stats = useMemo(() => {
    return {
      total: bookings.length,
      reserved: bookings.filter((b) => b.status === 'reserved').length,
      allocated: bookings.filter((b) => b.status === 'allocated').length,
      returned: bookings.filter((b) => b.status === 'returned').length,
      partial: bookings.filter((b) => b.status === 'partial-return').length,
    }
  }, [bookings])

  const openReturn = (booking) => {
    setReturnTarget(booking)
    setReturnForm({ type: 'full', returnedQty: booking.quantity, condition: booking.condition, notes: '' })
  }

  const handleReturn = (e) => {
    e.preventDefault()
    const b = returnTarget
    if (returnForm.type === 'full') {
      updateBooking(b.id, { status: 'returned', condition: returnForm.condition, notes: returnForm.notes || b.notes })
    } else {
      const qty = Number(returnForm.returnedQty)
      if (qty < 1 || qty >= b.quantity) return alert('Returned quantity must be between 1 and ' + (b.quantity - 1))
      updateBooking(b.id, { status: 'partial-return', returnedQty: qty, condition: returnForm.condition, notes: returnForm.notes || b.notes })
    }
    setReturnTarget(null)
  }

  const handleAdd = (e) => {
    e.preventDefault()
    setAddError('')
    const item = getItem(addForm.itemId)
    if (!item) return setAddError('Please select an item.')
    const qty = Number(addForm.quantity)
    if (qty < 1) return setAddError('Quantity must be at least 1.')
    if (qty > item.available) return setAddError(`Only ${item.available} units available.`)
    if (!addForm.eventId) return setAddError('Please select an event.')
    addBooking({
      eventId: addForm.eventId,
      itemId: addForm.itemId,
      quantity: qty,
      status: addForm.status,
      returnDate: addForm.returnDate,
      condition: addForm.condition,
      notes: addForm.notes,
    })
    setAddOpen(false)
    setAddForm({ eventId: '', itemId: '', quantity: 1, status: 'reserved', returnDate: '', condition: 'Excellent', notes: '' })
  }

  const availableItems = items.filter((i) => i.available > 0)

  return (
    <div className="space-y-4 animate-fade">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: 'Total', value: stats.total, tone: 'text-slate-700', bg: 'bg-slate-50' },
          { label: 'Reserved', value: stats.reserved, tone: 'text-brand-600', bg: 'bg-brand-50' },
          { label: 'Allocated', value: stats.allocated, tone: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Partial Return', value: stats.partial, tone: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Returned', value: stats.returned, tone: 'text-emerald-600', bg: 'bg-emerald-50' },
        ].map((s) => (
          <div key={s.label} className={`card p-4 ${s.bg} border-0`}>
            <p className="text-xs text-slate-500">{s.label}</p>
            <p className={`text-2xl font-bold ${s.tone}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Icon name="search" className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input pl-10" placeholder="Search by item or event..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="select w-auto" value={eventFilter} onChange={(e) => setEventFilter(e.target.value)}>
          <option value="All">All Events</option>
          {events.map((ev) => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
        </select>
        <select className="select w-auto" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="All">All Status</option>
          {BOOKING_STATUSES.map((s) => <option key={s} value={s} className="capitalize">{s.replace('-', ' ')}</option>)}
        </select>
        {canEdit && (
          <button className="btn-primary shrink-0" onClick={() => setAddOpen(true)}>
            <Icon name="plus" className="w-4 h-4" /> New Booking
          </button>
        )}
      </div>

      {/* Table */}
      <div className="card">
        <div className="table-wrap">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="th">Item</th>
                <th className="th">Event</th>
                <th className="th">Qty</th>
                <th className="th">Status</th>
                <th className="th">Condition</th>
                <th className="th">Booked</th>
                <th className="th">Return Due</th>
                <th className="th text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="td text-center py-12 text-slate-400">No bookings found.</td></tr>
              ) : filtered.map((b) => {
                const item = getItem(b.itemId)
                const ev = getEvent(b.eventId)
                const overdue = b.returnDate && (b.status === 'allocated' || b.status === 'reserved' || b.status === 'partial-return') && new Date(b.returnDate) < new Date()
                return (
                  <tr key={b.id} className="hover:bg-slate-50/70">
                    <td className="td">
                      <div className="font-medium text-slate-800">{item?.name || 'Unknown'}</div>
                      {b.notes && <div className="text-xs text-slate-400 truncate max-w-[200px]">{b.notes}</div>}
                    </td>
                    <td className="td">{ev?.name || '—'}</td>
                    <td className="td font-semibold">{b.quantity}</td>
                    <td className="td"><Badge tone={statusTone(b.status)}>{b.status.replace('-', ' ')}</Badge></td>
                    <td className="td"><Badge tone={conditionTone(b.condition)}>{b.condition}</Badge></td>
                    <td className="td text-slate-400">{new Date(b.bookedAt).toLocaleDateString()}</td>
                    <td className="td">
                      {b.returnDate ? (
                        <span className={overdue ? 'text-red-600 font-medium' : 'text-slate-400'}>
                          {new Date(b.returnDate).toLocaleDateString()}
                          {overdue && ' ⚠'}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="td">
                      <div className="flex items-center justify-end gap-1">
                        {canEdit && (b.status === 'reserved' || b.status === 'allocated' || b.status === 'partial-return') && (
                          <button onClick={() => openReturn(b)} className="px-2.5 py-1 rounded-lg text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100" title="Process return">
                            <Icon name="arrowDown" className="w-3.5 h-3.5 inline mr-0.5" />Return
                          </button>
                        )}
                        {canEdit && (
                          <button onClick={() => setDeleteTarget(b)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50" title="Delete">
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

      {/* New Booking Modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="New Booking / Reservation" size="md">
        <form onSubmit={handleAdd} className="space-y-4">
          {addError && <div className="px-4 py-2.5 rounded-lg bg-red-50 text-red-600 text-sm">{addError}</div>}
          <div>
            <label className="label">Event *</label>
            <select className="select" value={addForm.eventId} onChange={(e) => setAddForm((s) => ({ ...s, eventId: e.target.value }))}>
              <option value="">Select event...</option>
              {events.map((ev) => <option key={ev.id} value={ev.id}>{ev.name} — {new Date(ev.eventDate).toLocaleDateString()}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Item *</label>
            <select className="select" value={addForm.itemId} onChange={(e) => setAddForm((s) => ({ ...s, itemId: e.target.value }))}>
              <option value="">Select item...</option>
              {availableItems.map((i) => <option key={i.id} value={i.id}>{i.name} ({i.available} available)</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Quantity *</label>
              <input type="number" min="1" className="input" value={addForm.quantity} onChange={(e) => setAddForm((s) => ({ ...s, quantity: e.target.value }))} />
            </div>
            <div>
              <label className="label">Status</label>
              <select className="select" value={addForm.status} onChange={(e) => setAddForm((s) => ({ ...s, status: e.target.value }))}>
                <option value="reserved">Reserved</option>
                <option value="allocated">Allocated</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Expected Return Date</label>
              <input type="date" className="input" value={addForm.returnDate} onChange={(e) => setAddForm((s) => ({ ...s, returnDate: e.target.value }))} />
            </div>
            <div>
              <label className="label">Condition at Booking</label>
              <select className="select" value={addForm.condition} onChange={(e) => setAddForm((s) => ({ ...s, condition: e.target.value }))}>
                {['Excellent', 'Good', 'Fair', 'Damaged', 'Needs Repair'].map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Notes</label>
            <input className="input" value={addForm.notes} onChange={(e) => setAddForm((s) => ({ ...s, notes: e.target.value }))} placeholder="Optional" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setAddOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary">Create Booking</button>
          </div>
        </form>
      </Modal>

      {/* Return Modal */}
      <Modal open={!!returnTarget} onClose={() => setReturnTarget(null)} title="Process Return" size="sm">
        {returnTarget && (
          <form onSubmit={handleReturn} className="space-y-4">
            <div className="p-3 rounded-lg bg-slate-50">
              <p className="font-medium text-slate-800">{getItem(returnTarget.itemId)?.name}</p>
              <p className="text-sm text-slate-500">Event: {getEvent(returnTarget.eventId)?.name}</p>
              <p className="text-sm text-slate-500">Booked Qty: {returnTarget.quantity}</p>
            </div>
            <div>
              <label className="label">Return Type</label>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setReturnForm((s) => ({ ...s, type: 'full' }))} className={`btn ${returnForm.type === 'full' ? 'bg-brand-600 text-white' : 'bg-white border border-slate-300 text-slate-600'}`}>
                  Full Return
                </button>
                <button type="button" onClick={() => setReturnForm((s) => ({ ...s, type: 'partial' }))} className={`btn ${returnForm.type === 'partial' ? 'bg-brand-600 text-white' : 'bg-white border border-slate-300 text-slate-600'}`}>
                  Partial Return
                </button>
              </div>
            </div>
            {returnForm.type === 'partial' && (
              <div>
                <label className="label">Quantity Returned</label>
                <input type="number" min="1" max={returnTarget.quantity - 1} className="input" value={returnForm.returnedQty} onChange={(e) => setReturnForm((s) => ({ ...s, returnedQty: e.target.value }))} />
                <p className="text-xs text-slate-400 mt-1">Remaining will stay allocated. Available stock increases by this amount.</p>
              </div>
            )}
            <div>
              <label className="label">Condition on Return</label>
              <select className="select" value={returnForm.condition} onChange={(e) => setReturnForm((s) => ({ ...s, condition: e.target.value }))}>
                {['Excellent', 'Good', 'Fair', 'Damaged', 'Needs Repair'].map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Return Notes</label>
              <input className="input" value={returnForm.notes} onChange={(e) => setReturnForm((s) => ({ ...s, notes: e.target.value }))} placeholder="e.g. 2 items damaged" />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" className="btn-secondary" onClick={() => setReturnTarget(null)}>Cancel</button>
              <button type="submit" className="btn-primary">Confirm Return</button>
            </div>
          </form>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteBooking(deleteTarget.id)}
        title="Cancel Booking"
        message={`Cancel this booking? Allocated stock will be returned to available inventory.`}
        confirmText="Cancel Booking"
      />
    </div>
  )
}
