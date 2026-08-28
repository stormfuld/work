import { useState } from "react";
import { Loader2, Lock } from "lucide-react";
import { useAuth, formatApiErrorDetail } from "../../context/AuthContext";

const inputCls =
  "w-full bg-[#0A0A0C] border border-white/10 rounded-sm px-4 py-3.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-[#00F0FF] focus:ring-1 focus:ring-[#00F0FF] transition-[border-color,box-shadow] duration-300";
const labelCls = "block font-mono-tech text-[10px] tracking-[0.2em] uppercase text-zinc-500 mb-2";

export const AdminLogin = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await login(email, password);
    } catch (err) {
      setError(formatApiErrorDetail(err.response?.data?.detail) || err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center px-6" data-testid="admin-login-page">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 mb-10">
          <Lock size={18} className="text-[#00F0FF]" />
          <p className="font-mono-tech text-xs tracking-[0.25em] uppercase text-zinc-400">
            CircuitWorks / Owner Access
          </p>
        </div>
        <form onSubmit={submit} className="border border-white/10 rounded-sm p-8 md:p-10 bg-[#0A0A0C]" data-testid="admin-login-form">
          <h1 className="font-display font-bold uppercase tracking-tight text-3xl text-zinc-100 mb-8">
            Owner <span className="text-[#00F0FF]">login.</span>
          </h1>
          <div className="mb-6">
            <label className={labelCls} htmlFor="admin-email">Email</label>
            <input
              id="admin-email"
              data-testid="admin-email-input"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="owner@circuitworks.tech"
              className={inputCls}
            />
          </div>
          <div className="mb-6">
            <label className={labelCls} htmlFor="admin-password">Password</label>
            <input
              id="admin-password"
              data-testid="admin-password-input"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className={inputCls}
            />
          </div>
          {error && (
            <p className="font-mono-tech text-xs text-red-400 mb-6" data-testid="admin-login-error">{error}</p>
          )}
          <button
            type="submit"
            data-testid="admin-login-submit"
            disabled={busy}
            className="w-full font-mono-tech text-xs tracking-[0.2em] uppercase bg-[#00F0FF] text-black px-10 py-4 rounded-sm font-bold hover:bg-white transition-colors duration-300 disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {busy && <Loader2 size={16} className="animate-spin" />}
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <a href="/" className="inline-block mt-8 font-mono-tech text-[10px] tracking-[0.2em] uppercase text-zinc-600 hover:text-[#00F0FF] transition-colors" data-testid="admin-back-home-link">
          ← Back to site
        </a>
      </div>
    </div>
  );
};
