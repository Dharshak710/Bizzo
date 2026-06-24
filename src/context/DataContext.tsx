import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  AppData,
  Category,
  Event,
  EventItem,
  InventoryItem,
  Role,
  StockMovement,
  User,
  Vendor,
} from "../types";
import { seedData } from "../data/seed";
import { uid } from "../lib/utils";

const STORAGE_KEY = "bizzo_data";
const VERSION_KEY = "bizzo_version";
const DATA_VERSION = "4";

interface DataContextValue extends AppData {
  // items
  addItem: (item: Omit<InventoryItem, "id" | "createdAt" | "updatedAt">) => void;
  updateItem: (id: string, patch: Partial<InventoryItem>) => void;
  deleteItem: (id: string) => void;
  // categories
  addCategory: (cat: Omit<Category, "id">) => void;
  updateCategory: (id: string, patch: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  // vendors
  addVendor: (v: Omit<Vendor, "id" | "createdAt">) => void;
  updateVendor: (id: string, patch: Partial<Vendor>) => void;
  deleteVendor: (id: string) => void;
  // users
  addUser: (u: Omit<User, "id" | "createdAt">) => void;
  updateUser: (id: string, patch: Partial<User>) => void;
  deleteUser: (id: string) => void;
  // movements
  addMovement: (m: Omit<StockMovement, "id">) => void;
  // events
  addEvent: (e: Omit<Event, "id" | "createdAt" | "items"> & { items?: EventItem[] }) => void;
  updateEvent: (id: string, patch: Partial<Event>) => void;
  deleteEvent: (id: string) => void;
  addEventItem: (eventId: string, item: EventItem) => { ok: boolean; error?: string };
  updateEventItem: (eventId: string, itemId: string, qty: number) => { ok: boolean; error?: string };
  removeEventItem: (eventId: string, itemId: string) => void;
  returnEventItems: (eventId: string, itemId: string, returnedQty: number) => void;
  // computed
  getOutstanding: (itemId: string) => number;
  getAvailable: (itemId: string) => number;
  resetData: () => void;
}

const DataContext = createContext<DataContextValue | undefined>(undefined);

function loadData(): AppData {
  try {
    const ver = localStorage.getItem(VERSION_KEY);
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw && ver === DATA_VERSION) return JSON.parse(raw) as AppData;
  } catch {
    /* ignore */
  }
  return seedData;
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(loadData);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    localStorage.setItem(VERSION_KEY, DATA_VERSION);
  }, [data]);

  const outstandingMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const ev of data.events) {
      for (const ei of ev.items) {
        const outstanding = Math.max(0, ei.quantity - ei.returned);
        map.set(ei.itemId, (map.get(ei.itemId) ?? 0) + outstanding);
      }
    }
    return map;
  }, [data.events]);

  const getOutstanding = (itemId: string) => outstandingMap.get(itemId) ?? 0;

  const getAvailable = (itemId: string) => {
    const item = data.items.find((i) => i.id === itemId);
    if (!item) return 0;
    return Math.max(0, item.quantity - getOutstanding(itemId));
  };

  const touch = () => new Date().toISOString();

  // ---- Items ----
  const addItem: DataContextValue["addItem"] = (item) =>
    setData((d) => ({
      ...d,
      items: [
        ...d.items,
        { ...item, id: uid("i"), createdAt: touch(), updatedAt: touch() },
      ],
    }));

  const updateItem: DataContextValue["updateItem"] = (id, patch) =>
    setData((d) => ({
      ...d,
      items: d.items.map((i) =>
        i.id === id ? { ...i, ...patch, updatedAt: touch() } : i
      ),
    }));

  const deleteItem: DataContextValue["deleteItem"] = (id) =>
    setData((d) => ({
      ...d,
      items: d.items.filter((i) => i.id !== id),
      movements: d.movements.filter((m) => m.itemId !== id),
      events: d.events.map((e) => ({
        ...e,
        items: e.items.filter((ei) => ei.itemId !== id),
      })),
    }));

  // ---- Categories ----
  const addCategory: DataContextValue["addCategory"] = (cat) =>
    setData((d) => ({ ...d, categories: [...d.categories, { ...cat, id: uid("c") }] }));

  const updateCategory: DataContextValue["updateCategory"] = (id, patch) =>
    setData((d) => ({
      ...d,
      categories: d.categories.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }));

  const deleteCategory: DataContextValue["deleteCategory"] = (id) =>
    setData((d) => ({
      ...d,
      categories: d.categories.filter((c) => c.id !== id),
    }));

  // ---- Vendors ----
  const addVendor: DataContextValue["addVendor"] = (v) =>
    setData((d) => ({
      ...d,
      vendors: [...d.vendors, { ...v, id: uid("v"), createdAt: touch() }],
    }));

  const updateVendor: DataContextValue["updateVendor"] = (id, patch) =>
    setData((d) => ({
      ...d,
      vendors: d.vendors.map((v) => (v.id === id ? { ...v, ...patch } : v)),
    }));

  const deleteVendor: DataContextValue["deleteVendor"] = (id) =>
    setData((d) => ({
      ...d,
      vendors: d.vendors.filter((v) => v.id !== id),
      items: d.items.map((i) => (i.vendorId === id ? { ...i, vendorId: undefined } : i)),
    }));

  // ---- Users ----
  const addUser: DataContextValue["addUser"] = (u) =>
    setData((d) => ({ ...d, users: [...d.users, { ...u, id: uid("u"), createdAt: touch() }] }));

  const updateUser: DataContextValue["updateUser"] = (id, patch) =>
    setData((d) => ({
      ...d,
      users: d.users.map((u) => (u.id === id ? { ...u, ...patch } : u)),
    }));

  const deleteUser: DataContextValue["deleteUser"] = (id) =>
    setData((d) => ({ ...d, users: d.users.filter((u) => u.id !== id) }));

  // ---- Movements ----
  const addMovement: DataContextValue["addMovement"] = (m) =>
    setData((d) => {
      const items = d.items.map((i) => {
        if (i.id !== m.itemId) return i;
        let quantity = i.quantity;
        if (m.type === "in") quantity += m.quantity;
        else if (m.type === "out") quantity = Math.max(0, quantity - m.quantity);
        else if (m.type === "adjustment") quantity = Math.max(0, m.quantity);
        return { ...i, quantity, updatedAt: touch() };
      });
      return { ...d, items, movements: [{ ...m, id: uid("m") }, ...d.movements] };
    });

  // ---- Events ----
  const addEvent: DataContextValue["addEvent"] = (e) =>
    setData((d) => ({
      ...d,
      events: [
        ...d.events,
        { ...e, id: uid("e"), items: e.items ?? [], createdAt: touch() },
      ],
    }));

  const updateEvent: DataContextValue["updateEvent"] = (id, patch) =>
    setData((d) => ({
      ...d,
      events: d.events.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    }));

  const deleteEvent: DataContextValue["deleteEvent"] = (id) =>
    setData((d) => ({ ...d, events: d.events.filter((e) => e.id !== id) }));

  const addEventItem: DataContextValue["addEventItem"] = (eventId, item) => {
    let result = { ok: true, error: undefined as string | undefined };
    setData((d) => {
      const ev = d.events.find((e) => e.id === eventId);
      if (!ev) {
        result = { ok: false, error: "Event not found." };
        return d;
      }
      if (ev.items.some((ei) => ei.itemId === item.itemId)) {
        result = { ok: false, error: "Item already allocated to this event." };
        return d;
      }
      const available = getAvailable(item.itemId);
      if (item.quantity > available) {
        result = {
          ok: false,
          error: `Only ${available} available to allocate.`,
        };
        return d;
      }
      if (item.quantity <= 0) {
        result = { ok: false, error: "Quantity must be greater than 0." };
        return d;
      }
      return {
        ...d,
        events: d.events.map((e) =>
          e.id === eventId ? { ...e, items: [...e.items, item] } : e
        ),
      };
    });
    return result;
  };

  const updateEventItem: DataContextValue["updateEventItem"] = (eventId, itemId, qty) => {
    let result = { ok: true, error: undefined as string | undefined };
    setData((d) => {
      const ev = d.events.find((e) => e.id === eventId);
      if (!ev) return d;
      const existing = ev.items.find((ei) => ei.itemId === itemId);
      if (!existing) return d;
      if (qty < existing.returned) {
        result = { ok: false, error: "Quantity cannot be less than already returned." };
        return d;
      }
      const otherOutstanding = (outstandingMap.get(itemId) ?? 0) - Math.max(0, existing.quantity - existing.returned);
      const available = (d.items.find((i) => i.id === itemId)?.quantity ?? 0) - otherOutstanding;
      if (qty > available) {
        result = { ok: false, error: `Only ${available} available to allocate.` };
        return d;
      }
      return {
        ...d,
        events: d.events.map((e) =>
          e.id === eventId
            ? {
                ...e,
                items: e.items.map((ei) =>
                  ei.itemId === itemId ? { ...ei, quantity: qty } : ei
                ),
              }
            : e
        ),
      };
    });
    return result;
  };

  const removeEventItem: DataContextValue["removeEventItem"] = (eventId, itemId) =>
    setData((d) => ({
      ...d,
      events: d.events.map((e) =>
        e.id === eventId
          ? { ...e, items: e.items.filter((ei) => ei.itemId !== itemId) }
          : e
      ),
    }));

  const returnEventItems: DataContextValue["returnEventItems"] = (eventId, itemId, returnedQty) =>
    setData((d) => ({
      ...d,
      events: d.events.map((e) =>
        e.id === eventId
          ? {
              ...e,
              items: e.items.map((ei) =>
                ei.itemId === itemId
                  ? { ...ei, returned: Math.min(ei.quantity, Math.max(0, returnedQty)) }
                  : ei
              ),
            }
          : e
      ),
    }));

  const resetData = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(VERSION_KEY);
    setData(seedData);
  };

  const value: DataContextValue = {
    ...data,
    addItem,
    updateItem,
    deleteItem,
    addCategory,
    updateCategory,
    deleteCategory,
    addVendor,
    updateVendor,
    deleteVendor,
    addUser,
    updateUser,
    deleteUser,
    addMovement,
    addEvent,
    updateEvent,
    deleteEvent,
    addEventItem,
    updateEventItem,
    removeEventItem,
    returnEventItems,
    getOutstanding,
    getAvailable,
    resetData,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}

export type { Role };
