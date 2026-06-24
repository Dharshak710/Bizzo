import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { Sidebar, Header } from "./components/Layout";
import { useState, type ReactNode } from "react";
import type { Role } from "./types";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { Inventory } from "./pages/Inventory";
import { Movements } from "./pages/Movements";
import { Events } from "./pages/Events";
import { Categories } from "./pages/Categories";
import { Vendors } from "./pages/Vendors";
import { Reports } from "./pages/Reports";
import { Users } from "./pages/Users";

function Shell({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-64">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="mx-auto max-w-7xl px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}

function Protected({ children, roles }: { children: ReactNode; roles?: Role[] }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return <Shell>{children}</Shell>;
}

function PublicOnly({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  if (user) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
      <Route path="/" element={<Protected><Dashboard /></Protected>} />
      <Route path="/inventory" element={<Protected><Inventory /></Protected>} />
      <Route path="/movements" element={<Protected><Movements /></Protected>} />
      <Route path="/events" element={<Protected><Events /></Protected>} />
      <Route path="/categories" element={<Protected roles={["admin", "manager"]}><Categories /></Protected>} />
      <Route path="/vendors" element={<Protected roles={["admin", "manager"]}><Vendors /></Protected>} />
      <Route path="/reports" element={<Protected roles={["admin", "manager"]}><Reports /></Protected>} />
      <Route path="/users" element={<Protected roles={["admin"]}><Users /></Protected>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
