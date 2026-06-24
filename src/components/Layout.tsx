import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Icons, type IconName } from "./icons";
import { RoleBadge } from "./badges";
import { cn } from "../lib/utils";
import type { Role } from "../types";

interface NavItem {
  to: string;
  label: string;
  icon: IconName;
  roles: Role[];
}

const navItems: NavItem[] = [
  { to: "/", label: "Dashboard", icon: "dashboard", roles: ["admin", "manager", "staff"] },
  { to: "/inventory", label: "Inventory", icon: "box", roles: ["admin", "manager", "staff"] },
  { to: "/movements", label: "Stock In/Out", icon: "swap", roles: ["admin", "manager", "staff"] },
  { to: "/events", label: "Events & Allocation", icon: "calendar", roles: ["admin", "manager", "staff"] },
  { to: "/categories", label: "Categories", icon: "tag", roles: ["admin", "manager"] },
  { to: "/vendors", label: "Vendors", icon: "truck", roles: ["admin", "manager"] },
  { to: "/reports", label: "Reports", icon: "chart", roles: ["admin", "manager"] },
  { to: "/users", label: "Users", icon: "users", roles: ["admin"] },
];

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user } = useAuth();
  if (!user) return null;

  const items = navItems.filter((i) => i.roles.includes(user.role));

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden" onClick={onClose} />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center gap-2.5 border-b border-slate-100 px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
            <Icons.sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="text-base font-extrabold leading-tight text-slate-900">BIzzo</p>
            <p className="text-[11px] font-medium text-slate-400">Event Inventory</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {items.map((item) => {
            const Icon = Icons[item.icon];
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-brand-50 text-brand-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )
                }
              >
                <Icon className="h-5 w-5 shrink-0" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-slate-100 p-3">
          <div className="flex items-center gap-3 rounded-lg px-2 py-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
              {user.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-800">{user.name}</p>
              <RoleBadge role={user.role} />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

export function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/80 px-4 backdrop-blur lg:px-6">
      <button
        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
        onClick={onMenuClick}
        aria-label="Open menu"
      >
        <Icons.menu className="h-6 w-6" />
      </button>
      <div className="flex-1" />
      <div className="hidden items-center gap-2 text-sm text-slate-500 sm:flex">
        <span className="font-medium text-slate-700">{user?.name}</span>
      </div>
      <button
        onClick={() => {
          logout();
          navigate("/login");
        }}
        className="btn-secondary !px-3"
        title="Sign out"
      >
        <Icons.logout className="h-4 w-4" />
        <span className="hidden sm:inline">Logout</span>
      </button>
    </header>
  );
}
