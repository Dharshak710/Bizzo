import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Icons } from "../components/icons";

const demoAccounts = [
  { role: "Admin", email: "admin@bizzo.com", password: "admin123" },
  { role: "Manager", email: "manager@bizzo.com", password: "manager123" },
  { role: "Staff", email: "staff@bizzo.com", password: "staff123" },
];

export function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPwd, setShowPwd] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = login(email, password);
    if (!res.ok) setError(res.error ?? "Login failed.");
  };

  const quickLogin = (em: string, pw: string) => {
    setEmail(em);
    setPassword(pw);
    setError("");
    login(em, pw);
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Left brand panel */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-brand-700 p-12 text-white lg:flex">
        <div className="absolute -right-16 -top-16 h-72 w-72 rounded-full bg-white/10" />
        <div className="absolute -bottom-24 -left-10 h-80 w-80 rounded-full bg-white/10" />
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
            <Icons.sparkles className="h-6 w-6" />
          </div>
          <span className="text-xl font-extrabold">BIzzo</span>
        </div>
        <div className="relative z-10">
          <h1 className="text-4xl font-extrabold leading-tight">
            Inventory management for unforgettable events.
          </h1>
          <p className="mt-4 max-w-md text-brand-100">
            Track decor, lighting, furniture and equipment across every wedding and production.
            Allocate to events, manage returns, and never run short on the big day.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-4">
            {[
              { n: "1,000+", l: "Items tracked" },
              { n: "Real-time", l: "Availability" },
              { n: "Role-based", l: "Access control" },
            ].map((s) => (
              <div key={s.l}>
                <p className="text-2xl font-bold">{s.n}</p>
                <p className="text-sm text-brand-200">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="relative z-10 text-sm text-brand-200">
          © {new Date().getFullYear()} BIzzo — Event Production Suite
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 lg:px-20">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600 text-white">
              <Icons.sparkles className="h-5 w-5" />
            </div>
            <span className="text-lg font-extrabold text-slate-900">BIzzo</span>
          </div>

          <h2 className="text-2xl font-bold text-slate-900">Welcome back</h2>
          <p className="mt-1 text-sm text-slate-500">Sign in to manage your event inventory.</p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            <div>
              <label className="label" htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                className="input"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label" htmlFor="password">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPwd ? "text" : "password"}
                  className="input pr-11"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((s) => !s)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-xs font-medium text-slate-500 hover:text-slate-700"
                >
                  {showPwd ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            <button type="submit" className="btn-primary w-full">Sign in</button>
          </form>

          <div className="mt-8">
            <div className="relative mb-4 text-center">
              <span className="bg-slate-50 px-3 text-xs font-medium uppercase tracking-wide text-slate-400">
                Quick demo access
              </span>
              <div className="absolute inset-x-0 top-1/2 -z-10 h-px bg-slate-200" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {demoAccounts.map((a) => (
                <button
                  key={a.role}
                  onClick={() => quickLogin(a.email, a.password)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-center text-sm font-semibold text-slate-700 transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
                >
                  {a.role}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
