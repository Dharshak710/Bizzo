import { useState } from "react";
import { useData } from "../context/DataContext";
import { useAuth } from "../context/AuthContext";
import { Modal, ConfirmDialog, PageHeader, EmptyState } from "../components/ui";
import { Icons } from "../components/icons";
import { RoleBadge } from "../components/badges";
import { formatDate, cn } from "../lib/utils";
import type { Role, User } from "../types";

const roles: Role[] = ["admin", "manager", "staff"];

export function Users() {
  const { user: current } = useAuth();
  const { users, addUser, updateUser, deleteUser } = useData();
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  return (
    <div>
      <PageHeader
        title="User Management"
        subtitle="Manage team members and their access roles."
        actions={
          <button className="btn-primary" onClick={() => { setEditing(null); setFormOpen(true); }}>
            <Icons.plus className="h-4 w-4" /> Add User
          </button>
        }
      />

      <div className="card mb-5 p-4">
        <div className="relative">
          <Icons.search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input className="input pl-9" placeholder="Search name or email..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card"><EmptyState title="No users found" /></div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">User</th>
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold">Role</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Joined</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                          {u.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{u.name}{u.id === current?.id && <span className="ml-1.5 text-xs text-slate-400">(you)</span>}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{u.email}</td>
                    <td className="px-4 py-3"><RoleBadge role={u.role} /></td>
                    <td className="px-4 py-3">
                      <span className={cn("badge", u.active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500")}>
                        {u.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{formatDate(u.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button className="btn-ghost !px-2 !py-1.5 text-xs" onClick={() => { setEditing(u); setFormOpen(true); }}><Icons.edit className="h-4 w-4" /></button>
                        {u.id !== current?.id && (
                          <button className="btn-ghost !px-2 !py-1.5 text-xs text-red-600 hover:bg-red-50" onClick={() => setDeleteTarget(u)}><Icons.trash className="h-4 w-4" /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {formOpen && (
        <UserForm
          user={editing}
          onClose={() => setFormOpen(false)}
          onSave={(payload) => {
            if (editing) updateUser(editing.id, payload);
            else addUser(payload as Omit<User, "id" | "createdAt">);
            setFormOpen(false);
          }}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete user"
        message={`Delete "${deleteTarget?.name}"? They will lose access immediately.`}
        confirmLabel="Delete"
        danger
        onConfirm={() => { if (deleteTarget) deleteUser(deleteTarget.id); setDeleteTarget(null); }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

function UserForm({
  user,
  onClose,
  onSave,
}: {
  user: User | null;
  onClose: () => void;
  onSave: (payload: Partial<User>) => void;
}) {
  const [form, setForm] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
    password: user?.password ?? "",
    role: user?.role ?? ("staff" as Role),
    active: user?.active ?? true,
  });
  const set = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));
  const valid = form.name.trim() && form.email.trim() && form.password.trim();

  return (
    <Modal
      open
      onClose={onClose}
      title={user ? "Edit User" : "Add User"}
      size="md"
      footer={
        <>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" disabled={!valid} onClick={() => onSave({
            name: form.name.trim(),
            email: form.email.trim(),
            password: form.password,
            role: form.role,
            active: form.active,
          })}>{user ? "Save" : "Add User"}</button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="label">Full name *</label>
          <input className="input" value={form.name} onChange={(e) => set("name", e.target.value)} />
        </div>
        <div>
          <label className="label">Email *</label>
          <input type="email" className="input" value={form.email} onChange={(e) => set("email", e.target.value)} />
        </div>
        <div>
          <label className="label">Password *</label>
          <input className="input" value={form.password} onChange={(e) => set("password", e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Role</label>
            <select className="input" value={form.role} onChange={(e) => set("role", e.target.value)}>
              {roles.map((r) => <option key={r} value={r} className="capitalize">{r}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Status</label>
            <select className="input" value={String(form.active)} onChange={(e) => set("active", e.target.value === "true")}>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>
        <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
          <p className="mb-1 font-semibold text-slate-600">Role permissions:</p>
          <p>• <b>Admin</b> — full access including user management</p>
          <p>• <b>Manager</b> — manage inventory, events, vendors, reports</p>
          <p>• <b>Staff</b> — view inventory, movements and events</p>
        </div>
      </div>
    </Modal>
  );
}
