import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'

const titles = {
  '/': { title: 'Dashboard', subtitle: 'Inventory overview at a glance' },
  '/inventory': { title: 'Inventory', subtitle: 'Manage all event inventory items' },
  '/events': { title: 'Events', subtitle: 'Track events and allocate inventory' },
  '/bookings': { title: 'Bookings & Reservations', subtitle: 'Manage bookings and returns' },
  '/vendors': { title: 'Vendors & Suppliers', subtitle: 'Manage supplier relationships' },
  '/reports': { title: 'Reports', subtitle: 'Usage, stock, and availability analytics' },
  '/users': { title: 'User Management', subtitle: 'Manage users and roles' },
}

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const meta = titles[location.pathname] || { title: 'EventInventory Pro', subtitle: '' }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header title={meta.title} subtitle={meta.subtitle} onMenu={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
