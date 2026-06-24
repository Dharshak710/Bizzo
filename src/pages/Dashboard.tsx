import { Link } from "react-router-dom";
import { useData } from "../context/DataContext";
import { useAuth } from "../context/AuthContext";
import { PageHeader } from "../components/ui";
import { Icons } from "../components/icons";
import { EventStatusBadge, StockBadge } from "../components/badges";
import { formatCurrency, formatDate, cn } from "../lib/utils";

export function Dashboard() {
  const { user } = useAuth();
  const { items, categories, events, movements, vendors, getAvailable } = useData();

  const totalItems = items.length;
  const totalUnits = items.reduce((s, i) => s + i.quantity, 0);
  const totalValue = items.reduce((s, i) => s + i.quantity * i.unitCost, 0);
  const availableUnits = items.reduce((s, i) => s + getAvailable(i.id), 0);
  const allocatedUnits = totalUnits - availableUnits;

  const lowStock = items
    .map((i) => ({ item: i, available: getAvailable(i.id) }))
    .filter(({ item, available }) => available <= item.lowStockThreshold)
    .sort((a, b) => a.available - b.available);

  const upcomingEvents = [...events]
    .filter((e) => !["completed", "cancelled"].includes(e.status))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  const recentMovements = [...movements]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);

  const stats = [
    {
      label: "Inventory Items",
      value: totalItems.toString(),
      sub: `${totalUnits} total units`,
      icon: Icons.box,
      color: "bg-brand-50 text-brand-600",
    },
    {
      label: "Stock Value",
      value: formatCurrency(totalValue),
      sub: "Across all categories",
      icon: Icons.chart,
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Available Units",
      value: availableUnits.toString(),
      sub: `${allocatedUnits} allocated to events`,
      icon: Icons.check,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Low Stock Alerts",
      value: lowStock.length.toString(),
      sub: lowStock.length ? "Needs attention" : "All healthy",
      icon: Icons.alert,
      color: lowStock.length ? "bg-amber-50 text-amber-600" : "bg-slate-100 text-slate-500",
    },
  ];

  const categoryBreakdown = categories
    .map((c) => {
      const catItems = items.filter((i) => i.categoryId === c.id);
      return {
        ...c,
        count: catItems.length,
        units: catItems.reduce((s, i) => s + i.quantity, 0),
      };
    })
    .sort((a, b) => b.units - a.units);
  const maxUnits = Math.max(1, ...categoryBreakdown.map((c) => c.units));

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${user?.name.split(" ")[0]}`}
        subtitle="Here's what's happening with your inventory today."
      />

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">{s.label}</p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">{s.value}</p>
                  <p className="mt-1 text-xs text-slate-400">{s.sub}</p>
                </div>
                <div className={cn("flex h-11 w-11 items-center justify-center rounded-lg", s.color)}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Low stock alerts */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div className="flex items-center gap-2">
              <Icons.alert className="h-5 w-5 text-amber-500" />
              <h2 className="font-bold text-slate-900">Low Stock Alerts</h2>
            </div>
            <Link to="/inventory" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
              View all
            </Link>
          </div>
          {lowStock.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-slate-500">
              <Icons.check className="mx-auto mb-2 h-8 w-8 text-emerald-500" />
              All items are well stocked.
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {lowStock.slice(0, 6).map(({ item, available }) => (
                <div key={item.id} className="flex items-center justify-between px-5 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800">{item.name}</p>
                    <p className="text-xs text-slate-400">
                      {item.sku} · {categories.find((c) => c.id === item.categoryId)?.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-900">{available}</p>
                      <p className="text-[11px] text-slate-400">of {item.quantity}</p>
                    </div>
                    <StockBadge available={available} threshold={item.lowStockThreshold} quantity={item.quantity} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Category breakdown */}
        <div className="card">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="font-bold text-slate-900">Stock by Category</h2>
          </div>
          <div className="space-y-3 px-5 py-4">
            {categoryBreakdown.map((c) => (
              <div key={c.id}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">{c.name}</span>
                  <span className="text-slate-400">{c.units} units</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${(c.units / maxUnits) * 100}%`, backgroundColor: c.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Upcoming events */}
        <div className="card">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h2 className="font-bold text-slate-900">Upcoming Events</h2>
            <Link to="/events" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
              View all
            </Link>
          </div>
          {upcomingEvents.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-slate-500">No upcoming events.</div>
          ) : (
            <div className="divide-y divide-slate-50">
              {upcomingEvents.map((e) => (
                <div key={e.id} className="flex items-center justify-between px-5 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800">{e.name}</p>
                    <p className="text-xs text-slate-400">
                      {e.client} · {formatDate(e.date)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400">{e.items.length} items</span>
                    <EventStatusBadge status={e.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent movements */}
        <div className="card">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h2 className="font-bold text-slate-900">Recent Stock Activity</h2>
            <Link to="/movements" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
              View all
            </Link>
          </div>
          {recentMovements.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-slate-500">No recent activity.</div>
          ) : (
            <div className="divide-y divide-slate-50">
              {recentMovements.map((m) => {
                const item = items.find((i) => i.id === m.itemId);
                const isIn = m.type === "in";
                return (
                  <div key={m.id} className="flex items-center justify-between px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-full",
                          isIn ? "bg-emerald-50 text-emerald-600" : m.type === "out" ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"
                        )}
                      >
                        {isIn ? <Icons.arrowDown className="h-4 w-4" /> : <Icons.arrowUp className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{item?.name ?? "Unknown item"}</p>
                        <p className="text-xs text-slate-400">{formatDate(m.date)}</p>
                      </div>
                    </div>
                    <span className={cn("text-sm font-bold", isIn ? "text-emerald-600" : m.type === "out" ? "text-red-600" : "text-amber-600")}>
                      {isIn ? "+" : m.type === "out" ? "−" : "="}{m.quantity}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-slate-400">
        {vendors.length} vendors · {events.length} events tracked
      </p>
    </div>
  );
}
