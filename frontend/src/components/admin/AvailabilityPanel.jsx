import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Ban } from "lucide-react";
import { api } from "../../context/AuthContext";

const toISO = (d) => d.toLocaleDateString("en-CA");

const nextDays = (n) => {
  const days = [];
  const today = new Date();
  for (let i = 0; i < n; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push(d);
  }
  return days;
};

export const AvailabilityPanel = ({ bookings }) => {
  const [blocked, setBlocked] = useState(null);
  const [busyDate, setBusyDate] = useState(null);

  useEffect(() => {
    api
      .get("/blocked-days")
      .then(({ data }) => setBlocked(data.map((d) => d.date)))
      .catch(() => {
        toast.error("Failed to load blocked days.");
        setBlocked([]);
      });
  }, []);

  const bookedCount = (iso) =>
    bookings.filter((b) => b.preferred_date === iso && b.time_slot && (b.status === "new" || b.status === "accepted")).length;

  const toggle = async (iso) => {
    setBusyDate(iso);
    const isBlocked = blocked.includes(iso);
    try {
      if (isBlocked) {
        await api.delete(`/blocked-days/${iso}`);
        setBlocked((prev) => prev.filter((d) => d !== iso));
        toast.success(`${iso} reopened for bookings.`);
      } else {
        await api.post("/blocked-days", { date: iso });
        setBlocked((prev) => [...prev, iso]);
        toast.success(`${iso} blocked — customers can't book it.`);
      }
    } catch {
      toast.error("Update failed. Please try again.");
    } finally {
      setBusyDate(null);
    }
  };

  if (blocked === null) {
    return (
      <div className="flex items-center justify-center py-32 text-zinc-500" data-testid="availability-loading">
        <Loader2 size={24} className="animate-spin" />
      </div>
    );
  }

  return (
    <div data-testid="availability-panel">
      <p className="font-mono-tech text-[11px] tracking-[0.15em] uppercase text-zinc-500 mb-6">
        Next 28 days — tap a day to block or reopen it. Blocked days show no slots to customers.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {nextDays(28).map((d) => {
          const iso = toISO(d);
          const isBlocked = blocked.includes(iso);
          const count = bookedCount(iso);
          return (
            <button
              key={iso}
              data-testid={`availability-day-${iso}`}
              onClick={() => toggle(iso)}
              disabled={busyDate === iso}
              className={`text-left border rounded-sm p-4 transition-colors duration-300 disabled:opacity-50 ${
                isBlocked
                  ? "border-red-500/40 bg-red-500/5 hover:border-red-400"
                  : "border-white/10 bg-[#0A0A0C] hover:border-[#00F0FF]"
              }`}
            >
              <p className="font-mono-tech text-[9px] tracking-[0.2em] uppercase text-zinc-500">
                {d.toLocaleDateString(undefined, { weekday: "short" })}
              </p>
              <p className="font-display font-bold text-lg text-zinc-100 mb-2">
                {d.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
              </p>
              {busyDate === iso ? (
                <Loader2 size={12} className="animate-spin text-zinc-500" />
              ) : isBlocked ? (
                <p className="flex items-center gap-1.5 font-mono-tech text-[9px] tracking-[0.15em] uppercase text-red-400">
                  <Ban size={10} /> Blocked
                </p>
              ) : (
                <p className={`font-mono-tech text-[9px] tracking-[0.15em] uppercase ${count > 0 ? "text-[#00F0FF]" : "text-zinc-600"}`}>
                  {count > 0 ? `${count} booked` : "Open"}
                </p>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
