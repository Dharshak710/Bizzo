import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import {
  CATEGORIES, CONDITIONS, LOCATIONS, ROLES,
  seedUsers, seedVendors, seedItems, seedEvents, seedBookings, seedTransactions,
} from '../utils/seedData'

const DataContext = createContext(null)

const STORAGE_KEY = 'eip_data_v1'

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    /* ignore */
  }
  return {
    users: seedUsers,
    vendors: seedVendors,
    items: seedItems,
    events: seedEvents,
    bookings: seedBookings,
    transactions: seedTransactions,
  }
}

function uid(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}

export function DataProvider({ children }) {
  const [state, setState] = useState(loadState)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  const { users, vendors, items, events, bookings, transactions } = state

  /* ---------- Items ---------- */
  const addItem = useCallback((data) => {
    const id = uid('i')
    setState((s) => ({
      ...s,
      items: [...s.items, { ...data, id, available: data.available ?? data.quantity }],
    }))
    return id
  }, [])

  const updateItem = useCallback((id, data) => {
    setState((s) => ({
      ...s,
      items: s.items.map((it) => (it.id === id ? { ...it, ...data } : it)),
    }))
  }, [])

  const deleteItem = useCallback((id) => {
    setState((s) => ({
      ...s,
      items: s.items.filter((it) => it.id !== id),
      bookings: s.bookings.filter((b) => b.itemId !== id),
      transactions: s.transactions.filter((t) => t.itemId !== id),
    }))
  }, [])

  const adjustStock = useCallback((id, type, quantity, note, eventId = '') => {
    setState((s) => {
      const item = s.items.find((i) => i.id === id)
      if (!item) return s
      const delta = type === 'in' ? quantity : -quantity
      const newAvailable = Math.max(0, Math.min(item.quantity, item.available + delta))
      return {
        ...s,
        items: s.items.map((i) =>
          i.id === id ? { ...i, available: newAvailable } : i
        ),
        transactions: [
          ...s.transactions,
          { id: uid('t'), itemId: id, type, quantity, date: new Date().toISOString().slice(0, 10), note, eventId },
        ],
      }
    })
  }, [])

  /* ---------- Events ---------- */
  const addEvent = useCallback((data) => {
    const id = uid('e')
    setState((s) => ({ ...s, events: [...s.events, { ...data, id }] }))
    return id
  }, [])

  const updateEvent = useCallback((id, data) => {
    setState((s) => ({
      ...s,
      events: s.events.map((ev) => (ev.id === id ? { ...ev, ...data } : ev)),
    }))
  }, [])

  const deleteEvent = useCallback((id) => {
    setState((s) => ({
      ...s,
      events: s.events.filter((ev) => ev.id !== id),
      bookings: s.bookings.filter((b) => b.eventId !== id),
    }))
  }, [])

  /* ---------- Bookings ---------- */
  const addBooking = useCallback((data) => {
    const id = uid('b')
    setState((s) => {
      const item = s.items.find((i) => i.id === data.itemId)
      if (!item) return s
      const newAvailable = Math.max(0, item.available - data.quantity)
      return {
        ...s,
        items: s.items.map((i) =>
          i.id === data.itemId ? { ...i, available: newAvailable } : i
        ),
        bookings: [...s.bookings, { ...data, id, bookedAt: data.bookedAt || new Date().toISOString().slice(0, 10) }],
      }
    })
    return id
  }, [])

  const updateBooking = useCallback((id, data) => {
    setState((s) => {
      const existing = s.bookings.find((b) => b.id === id)
      if (!existing) return s
      let items = s.items
      // Handle quantity change
      if (data.quantity !== undefined && data.quantity !== existing.quantity) {
        const diff = existing.quantity - data.quantity
        const item = items.find((i) => i.id === existing.itemId)
        if (item) {
          const newAvailable = Math.max(0, Math.min(item.quantity, item.available + diff))
          items = items.map((i) => (i.id === item.id ? { ...i, available: newAvailable } : i))
        }
      }
      // Handle return — restore available stock
      if (data.status === 'returned' && existing.status !== 'returned') {
        const qty = data.quantity ?? existing.quantity
        const item = items.find((i) => i.id === existing.itemId)
        if (item) {
          const newAvailable = Math.min(item.quantity, item.available + qty)
          items = items.map((i) => (i.id === item.id ? { ...i, available: newAvailable } : i))
        }
      }
      // Handle partial return
      if (data.status === 'partial-return' && existing.status !== 'partial-return' && data.returnedQty) {
        const item = items.find((i) => i.id === existing.itemId)
        if (item) {
          const newAvailable = Math.min(item.quantity, item.available + data.returnedQty)
          items = items.map((i) => (i.id === item.id ? { ...i, available: newAvailable } : i))
        }
      }
      return {
        ...s,
        items,
        bookings: s.bookings.map((b) => (b.id === id ? { ...b, ...data } : b)),
      }
    })
  }, [])

  const deleteBooking = useCallback((id) => {
    setState((s) => {
      const booking = s.bookings.find((b) => b.id === id)
      let items = s.items
      if (booking && booking.status !== 'returned') {
        const item = items.find((i) => i.id === booking.itemId)
        if (item) {
          const newAvailable = Math.min(item.quantity, item.available + booking.quantity)
          items = items.map((i) => (i.id === item.id ? { ...i, available: newAvailable } : i))
        }
      }
      return {
        ...s,
        items,
        bookings: s.bookings.filter((b) => b.id !== id),
      }
    })
  }, [])

  /* ---------- Vendors ---------- */
  const addVendor = useCallback((data) => {
    const id = uid('v')
    setState((s) => ({ ...s, vendors: [...s.vendors, { ...data, id }] }))
    return id
  }, [])

  const updateVendor = useCallback((id, data) => {
    setState((s) => ({
      ...s,
      vendors: s.vendors.map((v) => (v.id === id ? { ...v, ...data } : v)),
    }))
  }, [])

  const deleteVendor = useCallback((id) => {
    setState((s) => ({
      ...s,
      vendors: s.vendors.filter((v) => v.id !== id),
    }))
  }, [])

  /* ---------- Users ---------- */
  const addUser = useCallback((data) => {
    const id = uid('u')
    setState((s) => ({ ...s, users: [...s.users, { ...data, id }] }))
    return id
  }, [])

  const updateUser = useCallback((id, data) => {
    setState((s) => ({
      ...s,
      users: s.users.map((u) => (u.id === id ? { ...u, ...data } : u)),
    }))
  }, [])

  const deleteUser = useCallback((id) => {
    setState((s) => ({ ...s, users: s.users.filter((u) => u.id !== id) }))
  }, [])

  /* ---------- Computed helpers ---------- */
  const lowStockItems = items.filter((i) => i.available <= i.minStock)
  const lowStockCount = lowStockItems.length

  const getItem = useCallback((id) => items.find((i) => i.id === id), [items])
  const getEvent = useCallback((id) => events.find((e) => e.id === id), [events])
  const getVendor = useCallback((id) => vendors.find((v) => v.id === id), [vendors])

  const resetData = useCallback(() => {
    const fresh = {
      users: seedUsers,
      vendors: seedVendors,
      items: seedItems,
      events: seedEvents,
      bookings: seedBookings,
      transactions: seedTransactions,
    }
    setState(fresh)
  }, [])

  const value = {
    users, vendors, items, events, bookings, transactions,
    CATEGORIES, CONDITIONS, LOCATIONS, ROLES,
    addItem, updateItem, deleteItem, adjustStock,
    addEvent, updateEvent, deleteEvent,
    addBooking, updateBooking, deleteBooking,
    addVendor, updateVendor, deleteVendor,
    addUser, updateUser, deleteUser,
    lowStockItems, lowStockCount,
    getItem, getEvent, getVendor,
    resetData,
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}
