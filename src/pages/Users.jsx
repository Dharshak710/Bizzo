import { useState } from 'react'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import Badge from '../components/Badge'
import { Icon } from '../components/Icon'

const emptyForm = { name: '', email: '', password: '', role: 'Staff' }

const roleTone = { Admin: 'red', Staff: 'blue', Viewer: 'gray' }

export default function Users() {
  const { users, ROLES, addUser, updateUser, deleteUser } = useData()
  const { user: currentUser } = useAuth()

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)

  const openAdd = () => { setEditing(null); setForm(emptyForm); setError(''); setModalOpen(true) }
  const openEdit = (u) => {
    setEditing(u)
    setForm({ name: u.name, email: u.email, password: u.password, role: u.role })
    setError('')
    setModalOpen(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    if (!form.name.trim()) return setError('Name is required.')
    if (!form.email.trim()) return setError('Email is required.')
    if (!form.password.trim()) return setError('Password is required.')
    const dup = users.find((u) => u.email.toLowerCase() === form.email.toLowerCase() && u.id !== editing?.id)
    if (dup) return setError('A user with this email already exists.')

    if (editing) updateUser(editing.id, { ...form, name: form.name.trim() })
    else addUser({ ...form, name: form.name.trim() })
    setModalOpen(false)
  }

  return (
    <div className="space-y-4 animate-fade">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{users.length} user(s) registered</p>
        <button className="btn-primary" onClick={openAdd}>
          <Icon name="plus" className="w-4 h-4" /> Add User
        </button>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="th">User</th>
                <th className="th">Email</th>
                <th className="th">Role</th>
                <th className="th text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/70">
                  <td className="td">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-semibold text-sm shrink-0">
                        {u.name.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{u.name}</p>
                        {u.id === currentUser?.id && <p className="text-xs text-brand-600">You</p>}
                      </div>
                    </div>
                  </td>
                  <td className="td text-slate-500">{u.email}</td>
                  <td className="td"><Badge tone={roleTone[u.role] || 'gray'}>{u.role}</Badge></td>
                  <td className="td">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(u)} className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100" title="Edit">
                        <Icon name="edit" className="w-4 h-4" />
                      </button>
                      {u.id !== currentUser?.id && (
                        <button onClick={() => setDeleteTarget(u)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50" title="Delete">
                          <Icon name="trash" className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role legend */}
      <div className="card p-5">
        <h3 className="font-semibold text-slate-800 mb-3">Role Permissions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-lg bg-red-50">
            <div className="flex items-center gap-2 mb-2">
              <Badge tone="red">Admin</Badge>
            </div>
            <p className="text-sm text-slate-600">Full access. Manage inventory, events, bookings, vendors, users, and view all reports.</p>
          </div>
          <div className="p-4 rounded-lg bg-blue-50">
            <div className="flex items-center gap-2 mb-2">
              <Badge tone="blue">Staff</Badge>
            </div>
            <p className="text-sm text-slate-600">Manage inventory, events, bookings, and vendors. View reports. Cannot manage users.</p>
          </div>
          <div className="p-4 rounded-lg bg-slate-50">
            <div className="flex items-center gap-2 mb-2">
              <Badge tone="gray">Viewer</Badge>
            </div>
            <p className="text-sm text-slate-600">Read-only access to dashboard, inventory, events, bookings, and vendors.</p>
          </div>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit User' : 'Add User'} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="px-4 py-2.5 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>}
          <div>
            <label className="label">Full Name *</label>
            <input className="input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Sarah Mitchell" />
          </div>
          <div>
            <label className="label">Email *</label>
            <input type="email" className="input" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="user@events.com" />
          </div>
          <div>
            <label className="label">Password *</label>
            <input type="text" className="input" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} placeholder="Set a password" />
          </div>
          <div>
            <label className="label">Role</label>
            <select className="select" value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}>
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary">{editing ? 'Save Changes' : 'Add User'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteUser(deleteTarget.id)}
        title="Delete User"
        message={`Delete user "${deleteTarget?.name}"? They will no longer be able to log in.`}
        confirmText="Delete"
      />
    </div>
  )
}
