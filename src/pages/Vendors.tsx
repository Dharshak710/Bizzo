import { useState } from "react";
import { useData } from "../context/DataContext";
import { Modal, ConfirmDialog, PageHeader, EmptyState } from "../components/ui";
import { Icons } from "../components/icons";
import { formatCurrency } from "../lib/utils";
import type { Vendor } from "../types";

export function Vendors() {
  const { vendors, items, addVendor, updateVendor, deleteVendor } = useData();
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Vendor | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Vendor | null>(null);

  const itemStats = (id: string) => {
    const list = items.filter((i) => i.vendorId === id);
    return { count: list.length, value: list.reduce((s, i) => s + i.quantity * i.unitCost, 0) };
  };

  const filtered = vendors.filter((v) => {
    const q = search.toLowerCase();
    return !q || v.name.toLowerCase().includes(q) || (v.contactPerson?.toLowerCase().includes(q) ?? false) || (v.category?.toLowerCase().includes(q) ?? false);
  });

  return (
    <div>
      <PageHeader
        title="Vendors & Suppliers"
        subtitle="Manage suppliers and their supplied inventory."
        actions={
          <button className="btn-primary" onClick={() => { setEditing(null); setFormOpen(true); }}>
            <Icons.plus className="h-4 w-4" /> Add Vendor
          </button>
        }
      />

      <div className="card mb-5 p-4">
        <div className="relative">
          <Icons.search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input className="input pl-9" placeholder="Search vendor, contact, category..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card"><EmptyState title="No vendors found" message="Add a supplier to start tracking sourcing." /></div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((v) => {
            const stats = itemStats(v.id);
            return (
              <div key={v.id} className="card p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                      <Icons.truck className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{v.name}</p>
                      {v.category && <span className="badge bg-slate-100 text-slate-600">{v.category}</span>}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button className="btn-ghost !px-2 !py-1.5" onClick={() => { setEditing(v); setFormOpen(true); }}><Icons.edit className="h-4 w-4" /></button>
                    <button className="btn-ghost !px-2 !py-1.5 text-red-600 hover:bg-red-50" onClick={() => setDeleteTarget(v)}><Icons.trash className="h-4 w-4" /></button>
                  </div>
                </div>
                <div className="mt-4 space-y-1.5 text-sm text-slate-500">
                  {v.contactPerson && <p className="flex items-center gap-2"><Icons.users className="h-4 w-4 text-slate-400" />{v.contactPerson}</p>}
                  {v.email && <p className="flex items-center gap-2"><Icons.edit className="h-4 w-4 text-slate-400" />{v.email}</p>}
                  {v.phone && <p className="flex items-center gap-2"><Icons.location className="h-4 w-4 text-slate-400" />{v.phone}</p>}
                  {v.address && <p className="flex items-center gap-2"><Icons.truck className="h-4 w-4 text-slate-400" />{v.address}</p>}
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-sm">
                  <span className="text-slate-500">{stats.count} items supplied</span>
                  <span className="font-semibold text-slate-700">{formatCurrency(stats.value)} value</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {formOpen && (
        <VendorForm
          vendor={editing}
          onClose={() => setFormOpen(false)}
          onSave={(payload) => {
            if (editing) updateVendor(editing.id, payload);
            else addVendor(payload as Omit<Vendor, "id" | "createdAt">);
            setFormOpen(false);
          }}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete vendor"
        message={`Delete "${deleteTarget?.name}"? Linked items will be unassigned from this vendor.`}
        confirmLabel="Delete"
        danger
        onConfirm={() => { if (deleteTarget) deleteVendor(deleteTarget.id); setDeleteTarget(null); }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

function VendorForm({
  vendor,
  onClose,
  onSave,
}: {
  vendor: Vendor | null;
  onClose: () => void;
  onSave: (payload: Partial<Vendor>) => void;
}) {
  const [form, setForm] = useState({
    name: vendor?.name ?? "",
    contactPerson: vendor?.contactPerson ?? "",
    email: vendor?.email ?? "",
    phone: vendor?.phone ?? "",
    address: vendor?.address ?? "",
    category: vendor?.category ?? "",
    notes: vendor?.notes ?? "",
  });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const valid = form.name.trim().length > 0;

  return (
    <Modal
      open
      onClose={onClose}
      title={vendor ? "Edit Vendor" : "Add Vendor"}
      size="lg"
      footer={
        <>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" disabled={!valid} onClick={() => onSave({
            name: form.name.trim(),
            contactPerson: form.contactPerson.trim() || undefined,
            email: form.email.trim() || undefined,
            phone: form.phone.trim() || undefined,
            address: form.address.trim() || undefined,
            category: form.category.trim() || undefined,
            notes: form.notes.trim() || undefined,
          })}>{vendor ? "Save" : "Add"}</button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="label">Vendor name *</label>
          <input className="input" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Luminosa Lighting Co." />
        </div>
        <div>
          <label className="label">Contact person</label>
          <input className="input" value={form.contactPerson} onChange={(e) => set("contactPerson", e.target.value)} />
        </div>
        <div>
          <label className="label">Category</label>
          <input className="input" value={form.category} onChange={(e) => set("category", e.target.value)} placeholder="Lights" />
        </div>
        <div>
          <label className="label">Email</label>
          <input type="email" className="input" value={form.email} onChange={(e) => set("email", e.target.value)} />
        </div>
        <div>
          <label className="label">Phone</label>
          <input className="input" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Address</label>
          <input className="input" value={form.address} onChange={(e) => set("address", e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Notes</label>
          <textarea className="input" rows={2} value={form.notes} onChange={(e) => set("notes", e.target.value)} />
        </div>
      </div>
    </Modal>
  );
}
