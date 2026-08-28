import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, LogOut, RefreshCw, Inbox } from "lucide-react";
import { useAuth, api } from "../../context/AuthContext";
import { BookingCard } from "./BookingCard";
import { AvailabilityPanel } from "./AvailabilityPanel";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "new", label: "New" },
  { key: "accepted", label: "Accepted" },
  { key: "handled", label: "Handled" },
];

export const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [view, setView] = useState("requests");
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
      if (status === "new") {
        toast.success("Moved back to new.");
      } else if (data.email_sent) {
        toast.success(status === "accepted"
          ? "Accepted — confirmation email sent to the customer."
          : "Marked handled — completion email sent to the customer.");
      } else if (data.email_sent === false) {
        toast.warning("Status updated, but the email could not be sent — consider contacting the customer directly.");
      } else {
        toast.success("Status updated.");
      }
    } catch (err) {
      toast.error(err.response?.status === 409 ? err.response.data.detail : "Update failed. Please try again.");
    } finally {
      setUpdating(null);
    }
  };

  const list = bookings || [];
  const counts = {
    all: list.length,
    new: list.filter((b) => b.status === "new").length,
    accepted: list.filter((b) => b.status === "accepted").length,
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
              {view === "requests" ? "Quote requests" : "Availability"}<span className="text-[#00F0FF]">.</span>
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
        <div className="max-w-6xl mx-auto px-6 flex gap-6">
          {[
            ["requests", "Requests"],
            ["availability", "Availability"],
          ].map(([key, label]) => (
            <button
              key={key}
              data-testid={`admin-view-${key}`}
              onClick={() => setView(key)}
              className={`font-mono-tech text-[11px] tracking-[0.2em] uppercase pb-3 border-b-2 transition-colors duration-300 ${
                view === key ? "border-[#00F0FF] text-[#00F0FF]" : "border-transparent text-zinc-500 hover:text-zinc-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        {view === "availability" ? (
          <AvailabilityPanel bookings={list} />
        ) : (
          <>
            <div className="flex flex-wrap gap-2 mb-8" data-testid="admin-filter-tabs">
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
                  <BookingCard key={b.id} booking={b} updating={updating} onSetStatus={setStatus} />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};
