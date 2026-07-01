import { useState } from "react";
import { useData } from "../context/DataContext";
import { Modal, ConfirmDialog, PageHeader, EmptyState } from "../components/ui";
import { Icons } from "../components/icons";
import { ConditionBadge, StockBadge } from "../components/badges";
import { useAuth } from "../context/AuthContext";
import { formatCurrency, cn } from "../lib/utils";
import type { Condition, InventoryItem, MovementType } from "../types";

const conditions: Condition[] = ["excellent", "good", "fair", "damaged"];

type SortKey = "name" | "quantity" | "available" | "value";

export function Inventory() {
  const { user } = useAuth();
  const canEdit = user?.role === "admin" || user?.role === "manager";

  const { items, categories, addItem, updateItem, deleteItem, getAvailable, addMovement } = useData();

  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [condFilter, setCondFilter] = useState("");
  const [stockFilter, setStockFilter] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<InventoryItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<InventoryItem | null>(null);
  const [moveTarget, setMoveTarget] = useState<InventoryItem | null>(null);

  const catName = (id: string) => categories.find((c) => c.id === id)?.name ?? "—";

  const filtered = items
    .filter((i) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q || i.name.toLowerCase().includes(q) || i.sku.toLowerCase().includes(q) || i.location.toLowerCase().includes(q);
      const matchCat = !catFilter || i.categoryId === catFilter;
      const matchCond = !condFilter || i.condition === condFilter;
      const avail = getAvailable(i.id);
      const matchStock =
        !stockFilter ||
        (stockFilter === "low" && avail <= i.lowStockThreshold && avail > 0) ||
        (stockFilter === "out" && avail <= 0) ||
        (stockFilter === "ok" && avail > i.lowStockThreshold);
      return matchSearch && matchCat && matchCond && matchStock;
    })
    .sort((a, b) => {
      if (sortKey === "name") return a.name.localeCompare(b.name);
      if (sortKey === "quantity") return b.quantity - a.quantity;
      if (sortKey === "available") return getAvailable(b.id) - getAvailable(a.id);
      return b.quantity * b.unitCost - a.quantity * a.unitCost;
    });

  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (item: InventoryItem) => {
    setEditing(item);
    setFormOpen(true);
  };

  return (
    <div>
      <PageHeader
        title="Inventory"
        subtitle={`${items.length} items · ${items.reduce((s, i) => s + i.quantity, 0)} units in stock`}
        actions={
          canEdit && (
            <button className="btn-primary" onClick={openAdd}>
              <Icons.plus className="h-4 w-4" /> Add Item
            </button>
          )
        }
      />

      {/* Filters */}
      <div className="card mb-5 p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div className="relative lg:col-span-2">
            <Icons.search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              className="input pl-9"
              placeholder="Search name, SKU, location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select className="input" value={catFilter} onChange={(e) => setCatFilter(e.target.value)}>
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select className="input" value={condFilter} onChange={(e) => setCondFilter(e.target.value)}>
            <option value="">All conditions</option>
            {conditions.map((c) => (
              <option key={c} value={c} className="capitalize">{c}</option>
            ))}
          </select>
          <select className="input" value={stockFilter} onChange={(e) => setStockFilter(e.target.value)}>
            <option value="">All stock levels</option>
            <option value="ok">In stock</option>
            <option value="low">Low stock</option>
            <option value="out">Out of stock</option>
          </select>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <p className="text-xs text-slate-400">{filtered.length} result(s)</p>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Sort by</span>
            <select
              className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700"
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
            >
              <option value="name">Name</option>
              <option value="quantity">Total quantity</option>
              <option value="available">Available</option>
              <option value="value">Stock value</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            title="No items found"
            message="Try adjusting your filters or add a new inventory item."
            action={canEdit && <button className="btn-primary" onClick={openAdd}><Icons.plus className="h-4 w-4" /> Add Item</button>}
          />
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Item</th>
                  <th className="px-4 py-3 font-semibold">Category</th>
                  <th className="px-4 py-3 text-center font-semibold">Available</th>
                  <th className="px-4 py-3 text-center font-semibold">Total</th>
                  <th className="px-4 py-3 font-semibold">Condition</th>
                  <th className="px-4 py-3 font-semibold">Location</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((item) => {
                  const avail = getAvailable(item.id);
                  const outstanding = item.quantity - avail;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/60">
                      <td className="px-5 py-3">
                        <p className="font-semibold text-slate-800">{item.name}</p>
                        <p className="text-xs text-slate-400">{item.sku} · {formatCurrency(item.unitCost)}/unit</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="badge" style={{ backgroundColor: categories.find((c) => c.id === item.categoryId)?.color + "20", color: categories.find((c) => c.id === item.categoryId)?.color }}>
                          {catName(item.categoryId)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={cn("font-bold", avail <= item.lowStockThreshold ? "text-amber-600" : "text-slate-800")}>{avail}</span>
                        {outstanding > 0 && <p className="text-[11px] text-slate-400">{outstanding} allocated</p>}
                      </td>
                      <td className="px-4 py-3 text-center font-medium text-slate-600">{item.quantity}</td>
                      <td className="px-4 py-3"><ConditionBadge condition={item.condition} /></td>
                      <td className="px-4 py-3 text-slate-600">{item.location}</td>
                      <td className="px-4 py-3"><StockBadge available={avail} threshold={item.lowStockThreshold} quantity={item.quantity} /></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {canEdit && (
                            <button className="btn-ghost !px-2 !py-1.5 text-xs" onClick={() => setMoveTarget(item)} title="Stock in/out">
                              <Icons.swap className="h-4 w-4" />
                            </button>
                          )}
                          <button className="btn-ghost !px-2 !py-1.5 text-xs" onClick={() => openEdit(item)} title="View / Edit">
                            <Icons.edit className="h-4 w-4" />
                          </button>
                          {canEdit && (
                            <button className="btn-ghost !px-2 !py-1.5 text-xs text-red-600 hover:bg-red-50" onClick={() => setDeleteTarget(item)} title="Delete">
                              <Icons.trash className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {formOpen && (
        <ItemFormModal
          item={editing}
          onClose={() => setFormOpen(false)}
          onSave={(payload) => {
            if (editing) updateItem(editing.id, payload);
            else addItem(payload as Omit<InventoryItem, "id" | "createdAt" | "updatedAt">);
            setFormOpen(false);
          }}
        />
      )}

      {moveTarget && (
        <QuickMoveModal
          item={moveTarget}
          available={getAvailable(moveTarget.id)}
          onClose={() => setMoveTarget(null)}
          onSubmit={(type, qty, note, reference) => {
            addMovement({
              itemId: moveTarget.id,
              type,
              quantity: qty,
              date: new Date().toISOString(),
              note,
              reference,
              userId: user!.id,
            });
            setMoveTarget(null);
          }}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete item"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This also removes its stock history and event allocations. This cannot be undone.`}
        confirmLabel="Delete"
        danger
        onConfirm={() => {
          if (deleteTarget) deleteItem(deleteTarget.id);
          setDeleteTarget(null);
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

function ItemFormModal({
  item,
  onClose,
  onSave,
}: {
  item: InventoryItem | null;
  onClose: () => void;
  onSave: (payload: Partial<InventoryItem>) => void;
}) {
  const { categories, vendors } = useData();
  const canEdit = useAuth().user?.role !== "staff";
  const [form, setForm] = useState({
    name: item?.name ?? "",
    sku: item?.sku ?? "",
    categoryId: item?.categoryId ?? categories[0]?.id ?? "",
    description: item?.description ?? "",
    quantity: item?.quantity ?? 0,
    location: item?.location ?? "",
    condition: item?.condition ?? ("good" as Condition),
    unitCost: item?.unitCost ?? 0,
    vendorId: item?.vendorId ?? "",
    lowStockThreshold: item?.lowStockThreshold ?? 5,
  });

  const set = (k: string, v: string | number) => setForm((f) => ({ ...f, [k]: v }));

  const valid = form.name.trim() && form.sku.trim() && form.categoryId;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    onSave({
      name: form.name.trim(),
      sku: form.sku.trim().toUpperCase(),
      categoryId: form.categoryId,
      description: form.description.trim(),
      quantity: Number(form.quantity),
      location: form.location.trim(),
      condition: form.condition,
      unitCost: Number(form.unitCost),
      vendorId: form.vendorId || undefined,
      lowStockThreshold: Number(form.lowStockThreshold),
    });
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={item ? (canEdit ? "Edit Item" : "Item Details") : "Add Inventory Item"}
      description={item ? item.sku : "Create a new item in your inventory."}
      size="lg"
      footer={
        <>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          {canEdit && <button className="btn-primary" onClick={submit}>{item ? "Save Changes" : "Add Item"}</button>}
        </>
      }
    >
      <form onSubmit={submit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="label">Item name *</label>
          <input className="input" value={form.name} disabled={!canEdit} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Gold Candelabra 24&quot;" />
        </div>
        <div>
          <label className="label">SKU *</label>
          <input className="input" value={form.sku} disabled={!canEdit} onChange={(e) => set("sku", e.target.value)} placeholder="DEC-CDL-024" />
        </div>
        <div>
          <label className="label">Category *</label>
          <select className="input" value={form.categoryId} disabled={!canEdit} onChange={(e) => set("categoryId", e.target.value)}>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="label">Description</label>
          <textarea className="input" rows={2} value={form.description} disabled={!canEdit} onChange={(e) => set("description", e.target.value)} />
        </div>
        <div>
          <label className="label">Quantity owned</label>
          <input type="number" min={0} className="input" value={form.quantity} disabled={!canEdit} onChange={(e) => set("quantity", Number(e.target.value))} />
        </div>
        <div>
          <label className="label">Condition</label>
          <select className="input" value={form.condition} disabled={!canEdit} onChange={(e) => set("condition", e.target.value)}>
            {conditions.map((c) => <option key={c} value={c} className="capitalize">{c}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Location</label>
          <input className="input" value={form.location} disabled={!canEdit} onChange={(e) => set("location", e.target.value)} placeholder="Warehouse A — Shelf 3" />
        </div>
        <div>
          <label className="label">Unit cost (₹)</label>
          <input type="number" min={0} step="0.01" className="input" value={form.unitCost} disabled={!canEdit} onChange={(e) => set("unitCost", Number(e.target.value))} />
        </div>
        <div>
          <label className="label">Supplier</label>
          <select className="input" value={form.vendorId} disabled={!canEdit} onChange={(e) => set("vendorId", e.target.value)}>
            <option value="">— None —</option>
            {vendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Low stock threshold</label>
          <input type="number" min={0} className="input" value={form.lowStockThreshold} disabled={!canEdit} onChange={(e) => set("lowStockThreshold", Number(e.target.value))} />
        </div>
      </form>
    </Modal>
  );
}

function QuickMoveModal({
  item,
  available,
  onClose,
  onSubmit,
}: {
  item: InventoryItem;
  available: number;
  onClose: () => void;
  onSubmit: (type: MovementType, qty: number, note: string, reference: string) => void;
}) {
  const [type, setType] = useState<MovementType>("in");
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");
  const [reference, setReference] = useState("");

  const valid = qty > 0 && (type !== "out" || qty <= item.quantity);

  return (
    <Modal
      open
      onClose={onClose}
      title="Stock Movement"
      description={`${item.name} — ${item.quantity} owned, ${available} available`}
      size="md"
      footer={
        <>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" disabled={!valid} onClick={() => onSubmit(type, qty, note, reference)}>Record Movement</button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="label">Movement type</label>
          <div className="grid grid-cols-3 gap-2">
            {([
              { v: "in", l: "Stock In", d: "Restock / receive", c: "emerald" },
              { v: "out", l: "Stock Out", d: "Remove / damaged", c: "red" },
              { v: "adjustment", l: "Adjustment", d: "Reconcile count", c: "amber" },
            ] as const).map((o) => (
              <button
                key={o.v}
                type="button"
                onClick={() => setType(o.v)}
                className={cn(
                  "rounded-lg border p-3 text-left transition-colors",
                  type === o.v ? "border-brand-400 bg-brand-50" : "border-slate-200 hover:bg-slate-50"
                )}
              >
                <p className="text-sm font-semibold text-slate-800">{o.l}</p>
                <p className="text-xs text-slate-400">{o.d}</p>
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="label">
            {type === "adjustment" ? "New total quantity" : "Quantity"}
          </label>
          <input type="number" min={0} className="input" value={qty} onChange={(e) => setQty(Number(e.target.value))} />
          {type === "out" && qty > item.quantity && (
            <p className="mt-1 text-xs text-red-600">Cannot remove more than {item.quantity} owned.</p>
          )}
          {type === "adjustment" && (
            <p className="mt-1 text-xs text-slate-400">Sets owned quantity to this value.</p>
          )}
        </div>
        <div>
          <label className="label">Reference (PO / invoice no.)</label>
          <input className="input" value={reference} onChange={(e) => setReference(e.target.value)} placeholder="PO-1024" />
        </div>
        <div>
          <label className="label">Note</label>
          <textarea className="input" rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Reason for movement..." />
        </div>
      </div>
    </Modal>
  );
}
