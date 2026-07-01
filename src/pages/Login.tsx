import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Icons } from "../components/icons";
import { cn } from "../lib/utils";

const demoAccounts = [
  { role: "Admin", email: "admin@bizzo.com", password: "admin123", desc: "Full access" },
  { role: "Manager", email: "manager@bizzo.com", password: "manager123", desc: "Operations" },
  { role: "Staff", email: "staff@bizzo.com", password: "staff123", desc: "View only" },
];

const features = [
  "Real-time stock availability across warehouses",
  "Event-wise allocation & return tracking",
  "Low-stock alerts and usage analytics",
  "Role-based access for your production team",
];

export function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = login(email, password);
    setLoading(false);
    if (!res.ok) setError(res.error ?? "Login failed.");
  };

  const quickLogin = (em: string, pw: string) => {
    setEmail(em);
    setPassword(pw);
    setError("");
    login(em, pw);
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left brand panel */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-brand-700 via-brand-800 to-slate-900 p-12 text-white lg:flex xl:p-16">
        {/* decorative orbs */}
        <div className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full bg-brand-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-brand-300/10 blur-3xl" />
        <div className="pointer-events-none absolute right-10 top-1/3 h-40 w-40 rounded-full bg-amber-300/10 blur-2xl" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 shadow-lg ring-1 ring-white/20 backdrop-blur">
            <Icons.sparkles className="h-6 w-6" />
          </div>
          <span className="text-xl font-extrabold tracking-tight">BIzzo</span>
        </div>

        {/* Headline + features */}
        <div className="relative z-10 max-w-lg">
          <h1 className="text-4xl font-extrabold leading-[1.15] xl:text-5xl">
            Inventory management for unforgettable events.
          </h1>
          <p className="mt-5 max-w-md text-brand-100/90">
            Track decor, lighting, furniture and equipment across every wedding and production.
            Allocate to events, manage returns, and never run short on the big day.
          </p>
          <ul className="mt-8 space-y-3.5">
            {features.map((f) => (
              <li key={f} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-400/20 ring-1 ring-emerald-300/30">
                  <Icons.check className="h-3.5 w-3.5 text-emerald-300" />
                </span>
                <span className="text-sm text-brand-50/90">{f}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Stat card */}
        <div className="relative z-10 flex items-center gap-6 rounded-2xl bg-white/5 p-5 ring-1 ring-white/10 backdrop-blur">
          {[
            { n: "1,000+", l: "Items tracked" },
            { n: "Real-time", l: "Availability" },
            { n: "Role-based", l: "Access control" },
          ].map((s, i) => (
            <div key={s.l} className={cn("flex-1", i > 0 && "border-l border-white/10 pl-6")}>
              <p className="text-2xl font-bold">{s.n}</p>
              <p className="text-xs text-brand-200/80">{s.l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex w-full flex-col justify-center px-6 py-12 sm:px-10 lg:w-1/2 lg:px-20 xl:px-28">
        <div className="mx-auto w-full max-w-sm">
          {/* Mobile logo */}
          <div className="mb-10 flex items-center gap-2.5 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white shadow-lg shadow-brand-600/20">
              <Icons.sparkles className="h-5 w-5" />
            </div>
            <span className="text-lg font-extrabold tracking-tight text-slate-900">BIzzo</span>
          </div>

          <div className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500" /> Event Production Suite
          </div>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">Welcome back</h2>
          <p className="mt-2 text-sm text-slate-500">Sign in to manage your event inventory workspace.</p>

          <form onSubmit={submit} className="mt-8 space-y-5">
            <div>
              <label className="label" htmlFor="email">Email address</label>
              <div className="relative">
                <Icons.mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className="input !pl-10"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <label className="label" htmlFor="password">Password</label>
              <div className="relative">
                <Icons.lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="password"
                  type={showPwd ? "text" : "password"}
                  autoComplete="current-password"
                  className="input !pl-10 pr-14"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((s) => !s)}
                  className="absolute inset-y-0 right-0 flex items-center px-3.5 text-xs font-semibold text-slate-500 transition-colors hover:text-brand-600"
                >
                  {showPwd ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700">
                <Icons.alert className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full !py-2.5 text-sm shadow-lg shadow-brand-600/25 transition-transform hover:shadow-brand-600/40 active:scale-[0.99]"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          {/* Demo access */}
          <div className="mt-9">
            <div className="relative mb-4 text-center">
              <span className="relative z-10 bg-white px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Quick demo access
              </span>
              <div className="absolute inset-x-0 top-1/2 -z-0 h-px bg-slate-200" />
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              {demoAccounts.map((a) => (
                <button
                  key={a.role}
                  onClick={() => quickLogin(a.email, a.password)}
                  className="group rounded-xl border border-slate-200 bg-white px-3 py-3 text-left transition-all hover:border-brand-300 hover:shadow-md hover:shadow-brand-600/5"
                >
                  <p className="text-sm font-bold text-slate-800 group-hover:text-brand-700">{a.role}</p>
                  <p className="mt-0.5 text-[11px] text-slate-400">{a.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <p className="mt-10 text-center text-xs text-slate-400">
            © {new Date().getFullYear()} BIzzo · Event Production Suite
          </p>
        </div>
      </div>
    </div>
  );
}
