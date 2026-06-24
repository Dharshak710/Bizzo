import { useState } from "react";
import { useData } from "../context/DataContext";
import { useAuth } from "../context/AuthContext";
import { Modal, ConfirmDialog, PageHeader, EmptyState } from "../components/ui";
import { Icons } from "../components/icons";
import { EventStatusBadge } from "../components/badges";
import { formatDate, toDateInput, cn } from "../lib/utils";
import type { Event, EventStatus, EventItem } from "../types";

const statuses: EventStatus[] = ["planning", "reserved", "allocated", "in_progress", "completed", "cancelled"];

export function Events() {
  const { user } = useAuth();
  const canEdit = user?.role === "admin" || user?.role === "manager";

  const { events, items, addEvent, updateEvent, deleteEvent, getAvailable } = useData();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Event | null>(null);
  const [detailEvent, setDetailEvent] = useState<Event | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Event | null>(null);

  const itemName = (id: string) => items.find((i) => i.id === id)?.name ?? "Unknown";

  const filtered = [...events]
    .filter((e) => {
      const q = search.toLowerCase();
      const matchSearch = !q || e.name.toLowerCase().includes(q) || e.client.toLowerCase().includes(q) || e.venue.toLowerCase().includes(q);
      const matchStatus = !statusFilter || e.status === statusFilter;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div>
      <PageHeader
        title="Events & Allocation"
        subtitle="Allocate inventory to events and track returns."
        actions={
          canEdit && (
            <button className="btn-primary" onClick={() => { setEditing(null); setFormOpen(true); }}>
              <Icons.plus className="h-4 w-4" /> New Event
            </button>
          )
        }
      />

      <div className="card mb-5 p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="relative sm:col-span-2">
            <Icons.search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input className="input pl-9" placeholder="Search event, client, venue..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All statuses</option>
            {statuses.map((s) => <option key={s} value={s} className="capitalize">{s.replace("_", " ")}</option>)}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card"><EmptyState title="No events found" message="Create an event to start allocating inventory." /></div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((e) => {
            const totalAllocated = e.items.reduce((s, i) => s + i.quantity, 0);
            const totalReturned = e.items.reduce((s, i) => s + i.returned, 0);
            const pending = totalAllocated - totalReturned;
            const pct = totalAllocated ? Math.round((totalReturned / totalAllocated) * 100) : 0;
            return (
              <div key={e.id} className="card flex flex-col p-5">
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <h3 className="truncate font-bold text-slate-900">{e.name}</h3>
                    <p className="text-sm text-slate-500">{e.client}</p>
                  </div>
                  <EventStatusBadge status={e.status} />
                </div>
                <div className="mt-3 space-y-1.5 text-sm text-slate-500">
                  <p className="flex items-center gap-2"><Icons.calendar className="h-4 w-4 text-slate-400" />{formatDate(e.date)}</p>
                  <p className="flex items-center gap-2"><Icons.location className="h-4 w-4 text-slate-400" />{e.venue}</p>
                </div>
                <div className="mt-4 border-t border-slate-100 pt-3">
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-600">{e.items.length} item types · {totalAllocated} units</span>
                    {pending > 0 && <span className="text-amber-600">{pending} pending return</span>}
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div className={cn("h-full rounded-full", pct === 100 ? "bg-emerald-500" : "bg-brand-500")} style={{ width: `${pct}%` }} />
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <button className="btn-secondary flex-1 !py-1.5 text-xs" onClick={() => setDetailEvent(e)}>Manage</button>
                  {canEdit && (
                    <>
                      <button className="btn-ghost !px-2 !py-1.5" onClick={() => { setEditing(e); setFormOpen(true); }}><Icons.edit className="h-4 w-4" /></button>
                      <button className="btn-ghost !px-2 !py-1.5 text-red-600 hover:bg-red-50" onClick={() => setDeleteTarget(e)}><Icons.trash className="h-4 w-4" /></button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {formOpen && (
        <EventForm
          event={editing}
          onClose={() => setFormOpen(false)}
          onSave={(payload) => {
            if (editing) updateEvent(editing.id, payload);
            else addEvent(payload as Omit<Event, "id" | "createdAt" | "items">);
            setFormOpen(false);
          }}
        />
      )}

      {detailEvent && (
        <EventDetail
          event={events.find((e) => e.id === detailEvent.id) ?? detailEvent}
          onClose={() => setDetailEvent(null)}
          available={getAvailable}
          itemName={itemName}
          canEdit={canEdit}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete event"
        message={`Delete "${deleteTarget?.name}"? Allocated items will be released back to available stock. This cannot be undone.`}
        confirmLabel="Delete"
        danger
        onConfirm={() => { if (deleteTarget) deleteEvent(deleteTarget.id); setDeleteTarget(null); }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

function EventForm({
  event,
  onClose,
  onSave,
}: {
  event: Event | null;
  onClose: () => void;
  onSave: (payload: Partial<Event>) => void;
}) {
  const [form, setForm] = useState({
    name: event?.name ?? "",
    client: event?.client ?? "",
    date: toDateInput(event?.date ?? new Date().toISOString()),
    endDate: toDateInput(event?.endDate ?? ""),
    venue: event?.venue ?? "",
    status: event?.status ?? ("planning" as EventStatus),
    notes: event?.notes ?? "",
  });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const valid = form.name.trim() && form.client.trim();

  return (
    <Modal
      open
      onClose={onClose}
      title={event ? "Edit Event" : "New Event"}
      size="lg"
      footer={
        <>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" disabled={!valid} onClick={() => onSave({
            name: form.name.trim(),
            client: form.client.trim(),
            date: new Date(form.date).toISOString(),
            endDate: form.endDate ? new Date(form.endDate).toISOString() : undefined,
            venue: form.venue.trim(),
            status: form.status,
            notes: form.notes.trim(),
          })}>{event ? "Save" : "Create Event"}</button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="label">Event name *</label>
          <input className="input" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Thompson Garden Wedding" />
        </div>
        <div>
          <label className="label">Client *</label>
          <input className="input" value={form.client} onChange={(e) => set("client", e.target.value)} placeholder="Emily & David Thompson" />
        </div>
        <div>
          <label className="label">Status</label>
          <select className="input" value={form.status} onChange={(e) => set("status", e.target.value)}>
            {statuses.map((s) => <option key={s} value={s} className="capitalize">{s.replace("_", " ")}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Start date</label>
          <input type="date" className="input" value={form.date} onChange={(e) => set("date", e.target.value)} />
        </div>
        <div>
          <label className="label">End date (optional)</label>
          <input type="date" className="input" value={form.endDate} onChange={(e) => set("endDate", e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Venue</label>
          <input className="input" value={form.venue} onChange={(e) => set("venue", e.target.value)} placeholder="Riverside Botanical Gardens" />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Notes</label>
          <textarea className="input" rows={2} value={form.notes} onChange={(e) => set("notes", e.target.value)} />
        </div>
      </div>
    </Modal>
  );
}

function EventDetail({
  event,
  onClose,
  available,
  itemName,
  canEdit,
}: {
  event: Event;
  onClose: () => void;
  available: (id: string) => number;
  itemName: (id: string) => string;
  canEdit: boolean;
}) {
  const { items, addEventItem, updateEventItem, removeEventItem, returnEventItems, updateEvent } = useData();
  const [addItemId, setAddItemId] = useState("");
  const [addQty, setAddQty] = useState(1);
  const [error, setError] = useState("");
  const [returnTarget, setReturnTarget] = useState<EventItem | null>(null);
  const [returnQty, setReturnQty] = useState(0);

  const allocatable = items.filter((i) => !event.items.some((ei) => ei.itemId === i.id));
  const isClosed = event.status === "completed" || event.status === "cancelled";

  const handleAdd = () => {
    if (!addItemId) return;
    setError("");
    const res = addEventItem(event.id, { itemId: addItemId, quantity: addQty, returned: 0 });
    if (!res.ok) { setError(res.error ?? "Failed"); return; }
    setAddItemId("");
    setAddQty(1);
  };

  const totalAllocated = event.items.reduce((s, i) => s + i.quantity, 0);
  const totalReturned = event.items.reduce((s, i) => s + i.returned, 0);

  return (
    <Modal
      open
      onClose={onClose}
      title={event.name}
      description={`${event.client} · ${formatDate(event.date)} · ${event.venue}`}
      size="xl"
      footer={
        <div className="flex w-full items-center justify-between">
          <span className="text-sm text-slate-500">
            {totalAllocated} units allocated · {totalReturned} returned
          </span>
          <div className="flex gap-2">
            <button className="btn-secondary" onClick={onClose}>Close</button>
            {canEdit && event.items.length > 0 && event.status !== "completed" && (
              <button className="btn-primary" onClick={() => {
                const allReturned = event.items.every((i) => i.returned >= i.quantity);
                if (allReturned) updateEvent(event.id, { status: "completed" });
                else {
                  event.items.forEach((i) => returnEventItems(event.id, i.itemId, i.quantity));
                  updateEvent(event.id, { status: "completed" });
                }
              }}>
                <Icons.check className="h-4 w-4" /> Mark Complete & Return All
              </button>
            )}
          </div>
        </div>
      }
    >
      {/* Status quick-change */}
      {canEdit && (
        <div className="mb-4 flex items-center gap-2">
          <span className="text-sm font-medium text-slate-600">Status:</span>
          <select
            className="input !w-auto !py-1.5"
            value={event.status}
            onChange={(e) => updateEvent(event.id, { status: e.target.value as EventStatus })}
          >
            {statuses.map((s) => <option key={s} value={s} className="capitalize">{s.replace("_", " ")}</option>)}
          </select>
        </div>
      )}

      {/* Add item */}
      {canEdit && !isClosed && allocatable.length > 0 && (
        <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="mb-2 text-sm font-semibold text-slate-700">Allocate item</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <select className="input" value={addItemId} onChange={(e) => setAddItemId(e.target.value)}>
              <option value="">Select an item...</option>
              {allocatable.map((i) => (
                <option key={i.id} value={i.id}>{i.name} ({available(i.id)} available)</option>
              ))}
            </select>
            <input type="number" min={1} className="input sm:!w-24" value={addQty} onChange={(e) => setAddQty(Number(e.target.value))} />
            <button className="btn-primary !shrink-0" disabled={!addItemId} onClick={handleAdd}>
              <Icons.plus className="h-4 w-4" /> Allocate
            </button>
          </div>
          {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
        </div>
      )}

      {/* Allocated items */}
      {event.items.length === 0 ? (
        <EmptyState title="No items allocated" message="Allocate inventory to this event from the panel above." />
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-2.5 font-semibold">Item</th>
                <th className="px-4 py-2.5 text-center font-semibold">Allocated</th>
                <th className="px-4 py-2.5 text-center font-semibold">Returned</th>
                <th className="px-4 py-2.5 text-center font-semibold">Available now</th>
                <th className="px-4 py-2.5 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {event.items.map((ei) => {
                const outstanding = ei.quantity - ei.returned;
                const fullyReturned = ei.returned >= ei.quantity;
                return (
                  <tr key={ei.itemId} className="hover:bg-slate-50/60">
                    <td className="px-4 py-2.5 font-medium text-slate-800">{itemName(ei.itemId)}</td>
                    <td className="px-4 py-2.5 text-center">
                      {canEdit && !isClosed ? (
                        <input
                          type="number"
                          min={ei.returned}
                          className="mx-auto w-16 rounded border border-slate-200 px-2 py-1 text-center"
                          value={ei.quantity}
                          onChange={(e) => {
                            const res = updateEventItem(event.id, ei.itemId, Number(e.target.value));
                            if (!res.ok) setError(res.error ?? "Failed");
                          }}
                        />
                      ) : ei.quantity}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <span className={cn("font-medium", fullyReturned ? "text-emerald-600" : "text-slate-600")}>
                        {ei.returned}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-center text-slate-500">{available(ei.itemId)}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center justify-end gap-1">
                        {canEdit && !isClosed && outstanding > 0 && (
                          <button
                            className="btn-ghost !px-2 !py-1.5 text-xs text-emerald-700 hover:bg-emerald-50"
                            onClick={() => { setReturnTarget(ei); setReturnQty(ei.quantity); }}
                            title="Record return"
                          >
                            <Icons.arrowDown className="h-4 w-4" /> Return
                          </button>
                        )}
                        {canEdit && !isClosed && (
                          <button
                            className="btn-ghost !px-2 !py-1.5 text-xs text-red-600 hover:bg-red-50"
                            onClick={() => removeEventItem(event.id, ei.itemId)}
                            title="Remove allocation"
                          >
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
      )}
      {event.notes && (
        <div className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
          <span className="font-semibold">Notes: </span>{event.notes}
        </div>
      )}

      {returnTarget && (
        <Modal
          open
          onClose={() => setReturnTarget(null)}
          title="Record Return"
          description={`${itemName(returnTarget.itemId)} — ${returnTarget.quantity} allocated, ${returnTarget.returned} already returned`}
          size="sm"
          footer={
            <>
              <button className="btn-secondary" onClick={() => setReturnTarget(null)}>Cancel</button>
              <button className="btn-primary" onClick={() => {
                returnEventItems(event.id, returnTarget.itemId, returnQty);
                setReturnTarget(null);
              }}>Save Return</button>
            </>
          }
        >
          <div>
            <label className="label">Total returned quantity</label>
            <input
              type="number"
              min={returnTarget.returned}
              max={returnTarget.quantity}
              className="input"
              value={returnQty}
              onChange={(e) => setReturnQty(Number(e.target.value))}
            />
            <p className="mt-2 text-xs text-slate-400">
              Returned items are added back to available stock. Max {returnTarget.quantity}.
            </p>
          </div>
        </Modal>
      )}
    </Modal>
  );
}
