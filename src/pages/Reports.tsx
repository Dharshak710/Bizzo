import { useState } from "react";
import { useData } from "../context/DataContext";
import { PageHeader } from "../components/ui";
import { Icons } from "../components/icons";
import { formatCurrency, cn } from "../lib/utils";

type Tab = "stock" | "availability" | "usage" | "events";

export function Reports() {
  const { items, categories, events, movements, getAvailable } = useData();
  const [tab, setTab] = useState<Tab>("stock");

  const totalValue = items.reduce((s, i) => s + i.quantity * i.unitCost, 0);
  const totalUnits = items.reduce((s, i) => s + i.quantity, 0);
  const totalAvailable = items.reduce((s, i) => s + getAvailable(i.id), 0);
  const totalAllocated = totalUnits - totalAvailable;

  const tabs: { key: Tab; label: string; icon: keyof typeof Icons }[] = [
    { key: "stock", label: "Stock Value", icon: "chart" },
    { key: "availability", label: "Availability", icon: "box" },
    { key: "usage", label: "Usage", icon: "swap" },
    { key: "events", label: "Events", icon: "calendar" },
  ];

  const exportCSV = (filename: string, rows: (string | number)[][]) => {
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <PageHeader
        title="Reports & Analytics"
        subtitle="Insights into stock value, availability, usage and event allocation."
        actions={
          <button
            className="btn-secondary"
            onClick={() => {
              if (tab === "stock") exportCSV("stock-value-report.csv", [
                ["Item", "SKU", "Category", "Quantity", "Unit Cost", "Total Value", "Location", "Condition"],
                ...items.map((i) => [i.name, i.sku, categories.find((c) => c.id === i.categoryId)?.name ?? "", i.quantity, i.unitCost, i.quantity * i.unitCost, i.location, i.condition]),
              ]);
              else if (tab === "availability") exportCSV("availability-report.csv", [
                ["Item", "SKU", "Total", "Available", "Allocated", "Threshold", "Status"],
                ...items.map((i) => {
                  const a = getAvailable(i.id);
                  return [i.name, i.sku, i.quantity, a, i.quantity - a, i.lowStockThreshold, a <= 0 ? "Out" : a <= i.lowStockThreshold ? "Low" : "OK"];
                }),
              ]);
              else if (tab === "usage") exportCSV("usage-report.csv", [
                ["Item", "Times Allocated", "Total Allocated Units", "Stock In", "Stock Out"],
                ...items.map((i) => [
                  i.name,
                  events.filter((e) => e.items.some((ei) => ei.itemId === i.id)).length,
                  events.reduce((s, e) => s + (e.items.find((ei) => ei.itemId === i.id)?.quantity ?? 0), 0),
                  movements.filter((m) => m.itemId === i.id && m.type === "in").reduce((s, m) => s + m.quantity, 0),
                  movements.filter((m) => m.itemId === i.id && m.type === "out").reduce((s, m) => s + m.quantity, 0),
                ]),
              ]);
              else exportCSV("events-report.csv", [
                ["Event", "Client", "Date", "Status", "Item Types", "Total Units Allocated", "Units Returned"],
                ...events.map((e) => [e.name, e.client, new Date(e.date).toLocaleDateString(), e.status, e.items.length, e.items.reduce((s, i) => s + i.quantity, 0), e.items.reduce((s, i) => s + i.returned, 0)]),
              ]);
            }}
          >
            <Icons.download className="h-4 w-4" /> Export CSV
          </button>
        }
      />

      {/* Summary tiles */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Stock Value", value: formatCurrency(totalValue), icon: Icons.chart, color: "text-emerald-600 bg-emerald-50" },
          { label: "Total Units", value: totalUnits.toString(), icon: Icons.box, color: "text-brand-600 bg-brand-50" },
          { label: "Available", value: totalAvailable.toString(), icon: Icons.check, color: "text-blue-600 bg-blue-50" },
          { label: "Allocated", value: totalAllocated.toString(), icon: Icons.calendar, color: "text-amber-600 bg-amber-50" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="card p-4">
              <div className={cn("mb-2 flex h-9 w-9 items-center justify-center rounded-lg", s.color)}><Icon className="h-5 w-5" /></div>
              <p className="text-2xl font-bold text-slate-900">{s.value}</p>
              <p className="text-xs text-slate-400">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="mb-5 flex flex-wrap gap-2">
        {tabs.map((t) => {
          const Icon = Icons[t.icon];
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
                tab === t.key ? "bg-brand-600 text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              )}
            >
              <Icon className="h-4 w-4" /> {t.label}
            </button>
          );
        })}
      </div>

      {tab === "stock" && <StockReport items={items} categories={categories} />}
      {tab === "availability" && <AvailabilityReport items={items} categories={categories} getAvailable={getAvailable} />}
      {tab === "usage" && <UsageReport items={items} events={events} movements={movements} categories={categories} />}
      {tab === "events" && <EventsReport events={events} items={items} />}
    </div>
  );
}

function BarRow({ label, value, max, color, suffix }: { label: string; value: number; max: number; color: string; suffix?: string }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="text-slate-500">{value.toLocaleString()}{suffix}</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full" style={{ width: `${max ? (value / max) * 100 : 0}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

function StockReport({ items, categories }: { items: ReturnType<typeof useData>["items"]; categories: ReturnType<typeof useData>["categories"] }) {
  const byCategory = categories.map((c) => {
    const list = items.filter((i) => i.categoryId === c.id);
    return { name: c.name, color: c.color, units: list.reduce((s, i) => s + i.quantity, 0), value: list.reduce((s, i) => s + i.quantity * i.unitCost, 0) };
  }).sort((a, b) => b.value - a.value);
  const maxValue = Math.max(1, ...byCategory.map((c) => c.value));

  const topValue = [...items].sort((a, b) => b.quantity * b.unitCost - a.quantity * a.unitCost).slice(0, 8);
  const maxItem = Math.max(1, ...topValue.map((i) => i.quantity * i.unitCost));

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="card p-5">
        <h3 className="mb-4 font-bold text-slate-900">Stock Value by Category</h3>
        <div className="space-y-3">
          {byCategory.map((c) => <BarRow key={c.name} label={c.name} value={c.value} max={maxValue} color={c.color} suffix={` (${formatCurrency(c.value)})`} />)}
        </div>
      </div>
      <div className="card p-5">
        <h3 className="mb-4 font-bold text-slate-900">Top Items by Value</h3>
        <div className="space-y-3">
          {topValue.map((i) => <BarRow key={i.id} label={i.name} value={i.quantity * i.unitCost} max={maxItem} color="#7c3aed" suffix={` (${formatCurrency(i.quantity * i.unitCost)})`} />)}
        </div>
      </div>
    </div>
  );
}

function AvailabilityReport({ items, categories, getAvailable }: { items: ReturnType<typeof useData>["items"]; categories: ReturnType<typeof useData>["categories"]; getAvailable: (id: string) => number }) {
  const lowStock = items.filter((i) => getAvailable(i.id) <= i.lowStockThreshold).sort((a, b) => getAvailable(a.id) - getAvailable(b.id));
  const outOfStock = items.filter((i) => getAvailable(i.id) <= 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card p-5 text-center">
          <p className="text-3xl font-bold text-emerald-600">{items.filter((i) => getAvailable(i.id) > i.lowStockThreshold).length}</p>
          <p className="text-sm text-slate-500">Items in stock</p>
        </div>
        <div className="card p-5 text-center">
          <p className="text-3xl font-bold text-amber-600">{lowStock.filter((i) => getAvailable(i.id) > 0).length}</p>
          <p className="text-sm text-slate-500">Low stock items</p>
        </div>
        <div className="card p-5 text-center">
          <p className="text-3xl font-bold text-red-600">{outOfStock.length}</p>
          <p className="text-sm text-slate-500">Out of stock</p>
        </div>
      </div>
      <div className="card overflow-hidden">
        <div className="border-b border-slate-100 px-5 py-4"><h3 className="font-bold text-slate-900">Low & Out of Stock Items</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-2.5 font-semibold">Item</th>
                <th className="px-4 py-2.5 font-semibold">Category</th>
                <th className="px-4 py-2.5 text-center font-semibold">Available</th>
                <th className="px-4 py-2.5 text-center font-semibold">Total</th>
                <th className="px-4 py-2.5 text-center font-semibold">Threshold</th>
                <th className="px-4 py-2.5 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {lowStock.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-slate-400">All items are well stocked.</td></tr>
              ) : lowStock.map((i) => {
                const a = getAvailable(i.id);
                return (
                  <tr key={i.id}>
                    <td className="px-5 py-2.5 font-semibold text-slate-800">{i.name}</td>
                    <td className="px-4 py-2.5 text-slate-500">{categories.find((c) => c.id === i.categoryId)?.name}</td>
                    <td className="px-4 py-2.5 text-center font-bold text-slate-800">{a}</td>
                    <td className="px-4 py-2.5 text-center text-slate-500">{i.quantity}</td>
                    <td className="px-4 py-2.5 text-center text-slate-500">{i.lowStockThreshold}</td>
                    <td className="px-4 py-2.5"><span className={cn("badge", a <= 0 ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700")}>{a <= 0 ? "Out of stock" : "Low stock"}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function UsageReport({ items, events, movements, categories }: { items: ReturnType<typeof useData>["items"]; events: ReturnType<typeof useData>["events"]; movements: ReturnType<typeof useData>["movements"]; categories: ReturnType<typeof useData>["categories"] }) {
  const usage = items.map((i) => {
    const allocations = events.reduce((s, e) => s + (e.items.find((ei) => ei.itemId === i.id)?.quantity ?? 0), 0);
    const stockIn = movements.filter((m) => m.itemId === i.id && m.type === "in").reduce((s, m) => s + m.quantity, 0);
    const stockOut = movements.filter((m) => m.itemId === i.id && m.type === "out").reduce((s, m) => s + m.quantity, 0);
    return { item: i, allocations, stockIn, stockOut, eventCount: events.filter((e) => e.items.some((ei) => ei.itemId === i.id)).length };
  }).sort((a, b) => b.allocations - a.allocations).slice(0, 10);

  const maxAlloc = Math.max(1, ...usage.map((u) => u.allocations));

  const byCondition = categories.length && items.reduce<Record<string, number>>((acc, i) => {
    acc[i.condition] = (acc[i.condition] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="card p-5">
        <h3 className="mb-4 font-bold text-slate-900">Most Allocated Items (Top 10)</h3>
        <div className="space-y-3">
          {usage.map((u) => <BarRow key={u.item.id} label={u.item.name} value={u.allocations} max={maxAlloc} color="#7c3aed" suffix={` · ${u.eventCount} events`} />)}
        </div>
      </div>
      <div className="card overflow-hidden">
        <div className="border-b border-slate-100 px-5 py-4"><h3 className="font-bold text-slate-900">Detailed Usage</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-2.5 font-semibold">Item</th>
                <th className="px-4 py-2.5 text-center font-semibold">Events</th>
                <th className="px-4 py-2.5 text-center font-semibold">Allocated</th>
                <th className="px-4 py-2.5 text-center font-semibold">Stock In</th>
                <th className="px-4 py-2.5 text-center font-semibold">Stock Out</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {usage.map((u) => (
                <tr key={u.item.id}>
                  <td className="px-5 py-2.5 font-semibold text-slate-800">{u.item.name}</td>
                  <td className="px-4 py-2.5 text-center text-slate-600">{u.eventCount}</td>
                  <td className="px-4 py-2.5 text-center font-bold text-brand-600">{u.allocations}</td>
                  <td className="px-4 py-2.5 text-center text-emerald-600">+{u.stockIn}</td>
                  <td className="px-4 py-2.5 text-center text-red-600">−{u.stockOut}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {byCondition && (
        <div className="card p-5">
          <h3 className="mb-4 font-bold text-slate-900">Items by Condition</h3>
          <div className="flex flex-wrap gap-3">
            {Object.entries(byCondition).map(([cond, count]) => (
              <div key={cond} className="flex items-center gap-2 rounded-lg bg-slate-50 px-4 py-2">
                <span className="capitalize text-sm font-medium text-slate-700">{cond}</span>
                <span className="badge bg-white text-slate-600">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function EventsReport({ events }: { events: ReturnType<typeof useData>["events"]; items: ReturnType<typeof useData>["items"] }) {
  const sorted = [...events].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="card overflow-hidden">
      <div className="border-b border-slate-100 px-5 py-4"><h3 className="font-bold text-slate-900">Event Allocation Summary</h3></div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-2.5 font-semibold">Event</th>
              <th className="px-4 py-2.5 font-semibold">Date</th>
              <th className="px-4 py-2.5 font-semibold">Status</th>
              <th className="px-4 py-2.5 text-center font-semibold">Item Types</th>
              <th className="px-4 py-2.5 text-center font-semibold">Allocated</th>
              <th className="px-4 py-2.5 text-center font-semibold">Returned</th>
              <th className="px-4 py-2.5 text-center font-semibold">Pending</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {sorted.map((e) => {
              const allocated = e.items.reduce((s, i) => s + i.quantity, 0);
              const returned = e.items.reduce((s, i) => s + i.returned, 0);
              const pending = allocated - returned;
              return (
                <tr key={e.id}>
                  <td className="px-5 py-2.5">
                    <p className="font-semibold text-slate-800">{e.name}</p>
                    <p className="text-xs text-slate-400">{e.client}</p>
                  </td>
                  <td className="px-4 py-2.5 text-slate-500">{new Date(e.date).toLocaleDateString()}</td>
                  <td className="px-4 py-2.5 capitalize text-slate-600">{e.status.replace("_", " ")}</td>
                  <td className="px-4 py-2.5 text-center text-slate-600">{e.items.length}</td>
                  <td className="px-4 py-2.5 text-center font-bold text-slate-800">{allocated}</td>
                  <td className="px-4 py-2.5 text-center text-emerald-600">{returned}</td>
                  <td className={cn("px-4 py-2.5 text-center font-semibold", pending > 0 ? "text-amber-600" : "text-slate-400")}>{pending}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="border-t border-slate-100 px-5 py-3 text-xs text-slate-400">
        {events.length} events · {events.reduce((s, e) => s + e.items.reduce((a, i) => a + i.quantity, 0), 0)} total units allocated across all events
      </div>
    </div>
  );
}
