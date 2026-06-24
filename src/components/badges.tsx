import type { Condition, EventStatus, MovementType, Role } from "../types";
import { cn } from "../lib/utils";

export function ConditionBadge({ condition }: { condition: Condition }) {
  const map: Record<Condition, string> = {
    excellent: "bg-emerald-100 text-emerald-700",
    good: "bg-blue-100 text-blue-700",
    fair: "bg-amber-100 text-amber-700",
    damaged: "bg-red-100 text-red-700",
  };
  return <span className={cn("badge capitalize", map[condition])}>{condition}</span>;
}

export function EventStatusBadge({ status }: { status: EventStatus }) {
  const map: Record<EventStatus, { cls: string; label: string }> = {
    planning: { cls: "bg-slate-100 text-slate-700", label: "Planning" },
    reserved: { cls: "bg-indigo-100 text-indigo-700", label: "Reserved" },
    allocated: { cls: "bg-blue-100 text-blue-700", label: "Allocated" },
    in_progress: { cls: "bg-amber-100 text-amber-700", label: "In Progress" },
    completed: { cls: "bg-emerald-100 text-emerald-700", label: "Completed" },
    cancelled: { cls: "bg-red-100 text-red-700", label: "Cancelled" },
  };
  const s = map[status];
  return <span className={cn("badge", s.cls)}>{s.label}</span>;
}

export function MovementBadge({ type }: { type: MovementType }) {
  const map: Record<MovementType, { cls: string; label: string }> = {
    in: { cls: "bg-emerald-100 text-emerald-700", label: "Stock In" },
    out: { cls: "bg-red-100 text-red-700", label: "Stock Out" },
    adjustment: { cls: "bg-amber-100 text-amber-700", label: "Adjustment" },
  };
  const s = map[type];
  return <span className={cn("badge", s.cls)}>{s.label}</span>;
}

export function RoleBadge({ role }: { role: Role }) {
  const map: Record<Role, string> = {
    admin: "bg-brand-100 text-brand-700",
    manager: "bg-blue-100 text-blue-700",
    staff: "bg-slate-100 text-slate-700",
  };
  return <span className={cn("badge capitalize", map[role])}>{role}</span>;
}

export function StockBadge({
  available,
  threshold,
  quantity,
}: {
  available: number;
  threshold: number;
  quantity: number;
}) {
  if (available <= 0 && quantity > 0) {
    return <span className="badge bg-red-100 text-red-700">Out of stock</span>;
  }
  if (available <= threshold) {
    return <span className="badge bg-amber-100 text-amber-700">Low stock</span>;
  }
  return <span className="badge bg-emerald-100 text-emerald-700">In stock</span>;
}
