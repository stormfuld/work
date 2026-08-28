import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, LogOut, RefreshCw, CheckCircle2, RotateCcw, Inbox } from "lucide-react";
import { useAuth, api } from "../../context/AuthContext";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "new", label: "New" },
  { key: "handled", label: "Handled" },
];

const fmtDate = (iso) => {
  try {
    return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return iso;
  }
};

export const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [bookings, setBookings] = useState(null);
  const [filter, setFilter] = useState("all");
  const [updating, setUpdating] = useState(null);

  const load = async () => {
    try {
      const { data } = await api.get("/bookings");
      setBookings(data);
    } catch {
      toast.error("Failed to load quote requests.");
      setBookings([]);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const setStatus = async (id, status) => {
    setUpdating(id);
    try {
      const { data } = await api.patch(`/bookings/${id}`, { status });
      setBookings((prev) => prev.map((b) => (b.id === id ? data : b)));
      toast.success(status === "handled" ? "Marked as handled." : "Reopened.");
    } catch {
      toast.error("Update failed. Please try again.");
    } finally {
      setUpdating(null);
    }
  };

  const list = bookings || [];
  const counts = {
    all: list.length,
    new: list.filter((b) => b.status === "new").length,
    handled: list.filter((b) => b.status === "handled").length,
  };
  const visible = filter === "all" ? list : list.filter((b) => b.status === filter);

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100" data-testid="admin-dashboard">
      <header className="border-b border-white/10 bg-[#0A0A0C]/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <p className="font-mono-tech text-[10px] tracking-[0.25em] uppercase text-zinc-500">CircuitWorks / Owner</p>
            <h1 className="font-display font-bold uppercase tracking-tight text-xl text-zinc-100">
              Quote requests<span className="text-[#00F0FF]">.</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:block font-mono-tech text-[10px] tracking-[0.15em] text-zinc-500" data-testid="admin-user-email">{user?.email}</span>
            <button
              onClick={load}
              data-testid="admin-refresh-button"
              className="p-2.5 border border-white/10 rounded-sm text-zinc-400 hover:text-[#00F0FF] hover:border-[#00F0FF] transition-colors duration-300"
              title="Refresh"
            >
              <RefreshCw size={14} />
            </button>
            <button
              onClick={logout}
              data-testid="admin-logout-button"
              className="flex items-center gap-2 font-mono-tech text-[10px] tracking-[0.2em] uppercase border border-white/10 text-zinc-300 px-4 py-2.5 rounded-sm hover:border-[#00F0FF] hover:text-[#00F0FF] transition-colors duration-300"
            >
              <LogOut size={12} /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex gap-2 mb-8" data-testid="admin-filter-tabs">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              data-testid={`admin-filter-${f.key}`}
              onClick={() => setFilter(f.key)}
              className={`font-mono-tech text-[11px] tracking-[0.15em] uppercase px-5 py-2.5 rounded-sm border transition-colors duration-300 ${
                filter === f.key
                  ? "border-[#00F0FF] text-[#00F0FF] bg-[#00F0FF]/5"
                  : "border-white/10 text-zinc-500 hover:text-zinc-200"
              }`}
            >
              {f.label} <span className="opacity-60">({counts[f.key]})</span>
            </button>
          ))}
        </div>

        {bookings === null ? (
          <div className="flex items-center justify-center py-32 text-zinc-500" data-testid="admin-loading">
            <Loader2 size={24} className="animate-spin" />
          </div>
        ) : visible.length === 0 ? (
          <div className="border border-white/10 rounded-sm bg-[#0A0A0C] py-24 text-center" data-testid="admin-empty-state">
            <Inbox size={32} className="text-zinc-700 mx-auto mb-4" />
            <p className="font-mono-tech text-xs tracking-[0.2em] uppercase text-zinc-500">No {filter !== "all" ? filter : ""} requests</p>
          </div>
        ) : (
          <div className="space-y-4">
            {visible.map((b) => (
              <article
                key={b.id}
                data-testid={`admin-booking-card-${b.id}`}
                className={`border rounded-sm bg-[#0A0A0C] p-6 md:p-8 transition-colors duration-300 ${
                  b.status === "new" ? "border-[#00F0FF]/30" : "border-white/10 opacity-80"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="font-display font-bold uppercase text-lg text-zinc-100" data-testid="booking-card-name">{b.name}</h2>
                      <span
                        data-testid="booking-card-status"
                        className={`font-mono-tech text-[9px] tracking-[0.2em] uppercase px-2.5 py-1 rounded-sm border ${
                          b.status === "new"
                            ? "border-[#00F0FF]/50 text-[#00F0FF]"
                            : "border-zinc-600 text-zinc-500"
                        }`}
                      >
                        {b.status}
                      </span>
                    </div>
                    <p className="font-mono-tech text-[10px] tracking-[0.15em] text-zinc-500">{fmtDate(b.created_at)}</p>
                  </div>
                  {b.status === "new" ? (
                    <button
                      onClick={() => setStatus(b.id, "handled")}
                      data-testid={`booking-mark-handled-${b.id}`}
                      disabled={updating === b.id}
                      className="flex items-center gap-2 font-mono-tech text-[10px] tracking-[0.2em] uppercase bg-[#00F0FF] text-black font-bold px-5 py-2.5 rounded-sm hover:bg-white transition-colors duration-300 disabled:opacity-50"
                    >
                      {updating === b.id ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
                      Mark handled
                    </button>
                  ) : (
                    <button
                      onClick={() => setStatus(b.id, "new")}
                      data-testid={`booking-reopen-${b.id}`}
                      disabled={updating === b.id}
                      className="flex items-center gap-2 font-mono-tech text-[10px] tracking-[0.2em] uppercase border border-white/20 text-zinc-300 px-5 py-2.5 rounded-sm hover:border-[#00F0FF] hover:text-[#00F0FF] transition-colors duration-300 disabled:opacity-50"
                    >
                      {updating === b.id ? <Loader2 size={12} className="animate-spin" /> : <RotateCcw size={12} />}
                      Reopen
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4 mb-5">
                  {[
                    ["Email", b.email],
                    ["Phone", b.phone || "—"],
                    ["Device", b.device_type],
                    ["Service", b.service],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <p className="font-mono-tech text-[9px] tracking-[0.2em] uppercase text-zinc-600 mb-1">{label}</p>
                      <p className="font-mono-tech text-xs text-zinc-200 break-words">{value}</p>
                    </div>
                  ))}
                </div>
                {b.preferred_date && (
                  <p className="font-mono-tech text-[10px] tracking-[0.15em] text-zinc-500 mb-3">
                    Preferred date: <span className="text-zinc-300">{b.preferred_date}</span>
                  </p>
                )}
                <p className="text-sm text-zinc-400 leading-relaxed border-t border-white/5 pt-4" data-testid="booking-card-message">{b.message || "No message."}</p>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
