import { useState } from "react";
import { useData } from "../context/DataContext";
import { useAuth } from "../context/AuthContext";
import { PageHeader, EmptyState, Modal } from "../components/ui";
import { Icons } from "../components/icons";
import { MovementBadge } from "../components/badges";
import { formatDateTime, toDateInput, cn } from "../lib/utils";
import type { MovementType } from "../types";

export function Movements() {
  const { user } = useAuth();
  const canEdit = user?.role === "admin" || user?.role === "manager";

  const { movements, items, users, addMovement } = useData();

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [itemFilter, setItemFilter] = useState("");

  const itemName = (id: string) => items.find((i) => i.id === id)?.name ?? "Unknown";
  const userName = (id: string) => users.find((u) => u.id === id)?.name ?? "—";

  const filtered = [...movements]
    .filter((m) => {
      const q = search.toLowerCase();
      const item = items.find((i) => i.id === m.itemId);
      const matchSearch =
        !q ||
        (item?.name.toLowerCase().includes(q) ?? false) ||
        (item?.sku.toLowerCase().includes(q) ?? false) ||
        (m.note?.toLowerCase().includes(q) ?? false) ||
        (m.reference?.toLowerCase().includes(q) ?? false);
      const matchType = !typeFilter || m.type === typeFilter;
      const matchItem = !itemFilter || m.itemId === itemFilter;
      return matchSearch && matchType && matchItem;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totals = {
    in: movements.filter((m) => m.type === "in").reduce((s, m) => s + m.quantity, 0),
    out: movements.filter((m) => m.type === "out").reduce((s, m) => s + m.quantity, 0),
  };

  const [showForm, setShowForm] = useState(false);

  return (
    <div>
      <PageHeader
        title="Stock In / Out"
        subtitle="Track all stock movements — restocks, removals and adjustments."
        actions={
          canEdit && (
            <button className="btn-primary" onClick={() => setShowForm(true)}>
              <Icons.plus className="h-4 w-4" /> New Movement
            </button>
          )
        }
      />

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600"><Icons.arrowDown className="h-5 w-5" /></div>
            <div><p className="text-xs text-slate-400">Total units in</p><p className="text-xl font-bold text-slate-900">{totals.in}</p></div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-600"><Icons.arrowUp className="h-5 w-5" /></div>
            <div><p className="text-xs text-slate-400">Total units out</p><p className="text-xl font-bold text-slate-900">{totals.out}</p></div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600"><Icons.swap className="h-5 w-5" /></div>
            <div><p className="text-xs text-slate-400">Total movements</p><p className="text-xl font-bold text-slate-900">{movements.length}</p></div>
          </div>
        </div>
      </div>

      <div className="card mb-5 p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="relative">
            <Icons.search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input className="input pl-9" placeholder="Search item, note, reference..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="input" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="">All types</option>
            <option value="in">Stock In</option>
            <option value="out">Stock Out</option>
            <option value="adjustment">Adjustment</option>
          </select>
          <select className="input" value={itemFilter} onChange={(e) => setItemFilter(e.target.value)}>
            <option value="">All items</option>
            {items.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card"><EmptyState title="No movements found" message="Record stock in/out activity to see it here." /></div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Item</th>
                  <th className="px-4 py-3 font-semibold">Type</th>
                  <th className="px-4 py-3 text-center font-semibold">Qty</th>
                  <th className="px-4 py-3 font-semibold">Reference</th>
                  <th className="px-4 py-3 font-semibold">Note</th>
                  <th className="px-4 py-3 font-semibold">By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/60">
                    <td className="whitespace-nowrap px-5 py-3 text-slate-600">{formatDateTime(m.date)}</td>
                    <td className="px-4 py-3 font-semibold text-slate-800">{itemName(m.itemId)}</td>
                    <td className="px-4 py-3"><MovementBadge type={m.type} /></td>
                    <td className={cn("px-4 py-3 text-center font-bold", m.type === "in" ? "text-emerald-600" : m.type === "out" ? "text-red-600" : "text-amber-600")}>
                      {m.type === "in" ? "+" : m.type === "out" ? "−" : "="}{m.quantity}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{m.reference ?? "—"}</td>
                    <td className="max-w-xs px-4 py-3 text-slate-500">{m.note ?? "—"}</td>
                    <td className="px-4 py-3 text-slate-500">{userName(m.userId)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showForm && canEdit && (
        <MovementForm
          onClose={() => setShowForm(false)}
          onSubmit={(payload) => {
            addMovement({ ...payload, userId: user!.id });
            setShowForm(false);
          }}
        />
      )}
    </div>
  );
}

function MovementForm({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (payload: { itemId: string; type: MovementType; quantity: number; date: string; note?: string; reference?: string }) => void;
}) {
  const { items, getAvailable } = useData();
  const [itemId, setItemId] = useState(items[0]?.id ?? "");
  const [type, setType] = useState<MovementType>("in");
  const [quantity, setQuantity] = useState(1);
  const [date, setDate] = useState(toDateInput(new Date().toISOString()));
  const [note, setNote] = useState("");
  const [reference, setReference] = useState("");

  const selected = items.find((i) => i.id === itemId);
  const available = selected ? getAvailable(selected.id) : 0;
  const owned = selected?.quantity ?? 0;
  const valid = itemId && quantity > 0 && (type !== "out" || quantity <= owned);

  return (
    <Modal
      open
      onClose={onClose}
      title="New Stock Movement"
      size="md"
      footer={
        <>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" disabled={!valid} onClick={() => onSubmit({ itemId, type, quantity, date: new Date(date).toISOString(), note: note.trim() || undefined, reference: reference.trim() || undefined })}>
            Record Movement
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="label">Item *</label>
          <select className="input" value={itemId} onChange={(e) => setItemId(e.target.value)}>
            {items.map((i) => <option key={i.id} value={i.id}>{i.name} ({i.sku})</option>)}
          </select>
          {selected && <p className="mt-1 text-xs text-slate-400">{owned} owned · {available} available</p>}
        </div>
        <div>
          <label className="label">Type</label>
          <div className="grid grid-cols-3 gap-2">
            {([
              { v: "in", l: "Stock In", d: "Receive" },
              { v: "out", l: "Stock Out", d: "Remove" },
              { v: "adjustment", l: "Adjust", d: "Set total" },
            ] as const).map((o) => (
              <button key={o.v} type="button" onClick={() => setType(o.v)} className={cn("rounded-lg border p-2.5 text-center transition-colors", type === o.v ? "border-brand-400 bg-brand-50" : "border-slate-200 hover:bg-slate-50")}>
                <p className="text-sm font-semibold text-slate-800">{o.l}</p>
                <p className="text-xs text-slate-400">{o.d}</p>
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">{type === "adjustment" ? "New total" : "Quantity"}</label>
            <input type="number" min={0} className="input" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
            {type === "out" && quantity > owned && <p className="mt-1 text-xs text-red-600">Max {owned} owned.</p>}
          </div>
          <div>
            <label className="label">Date</label>
            <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
        </div>
        <div>
          <label className="label">Reference</label>
          <input className="input" value={reference} onChange={(e) => setReference(e.target.value)} placeholder="PO-1024 / WR-001" />
        </div>
        <div>
          <label className="label">Note</label>
          <textarea className="input" rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
        </div>
      </div>
    </Modal>
  );
}
