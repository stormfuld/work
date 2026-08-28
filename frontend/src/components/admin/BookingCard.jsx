import { Loader2, CheckCircle2, RotateCcw, ThumbsUp, CalendarClock } from "lucide-react";

const STATUS_BADGE = {
  new: "border-[#00F0FF]/50 text-[#00F0FF]",
  accepted: "border-emerald-400/50 text-emerald-400",
  handled: "border-zinc-600 text-zinc-500",
};

const CARD_BORDER = {
  new: "border-[#00F0FF]/30",
  accepted: "border-emerald-400/30",
  handled: "border-white/10 opacity-80",
};

const slotLabel = (slot) => `${slot}–${parseInt(slot, 10) + 2}:00`;

const fmtDate = (iso) => {
  try {
    return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return iso;
  }
};

const primaryBtn =
  "flex items-center gap-2 font-mono-tech text-[10px] tracking-[0.2em] uppercase bg-[#00F0FF] text-black font-bold px-5 py-2.5 rounded-sm hover:bg-white transition-colors duration-300 disabled:opacity-50";
const outlineBtn =
  "flex items-center gap-2 font-mono-tech text-[10px] tracking-[0.2em] uppercase border border-white/20 text-zinc-300 px-5 py-2.5 rounded-sm hover:border-[#00F0FF] hover:text-[#00F0FF] transition-colors duration-300 disabled:opacity-50";

export const BookingCard = ({ booking: b, updating, onSetStatus }) => {
  const busy = updating === b.id;
  const spinner = busy ? <Loader2 size={12} className="animate-spin" /> : null;

  return (
    <article
      data-testid={`admin-booking-card-${b.id}`}
      className={`border rounded-sm bg-[#0A0A0C] p-6 md:p-8 transition-colors duration-300 ${CARD_BORDER[b.status] || CARD_BORDER.handled}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="font-display font-bold uppercase text-lg text-zinc-100" data-testid="booking-card-name">{b.name}</h2>
            <span
              data-testid="booking-card-status"
              className={`font-mono-tech text-[9px] tracking-[0.2em] uppercase px-2.5 py-1 rounded-sm border ${STATUS_BADGE[b.status] || STATUS_BADGE.handled}`}
            >
              {b.status}
            </span>
          </div>
          <p className="font-mono-tech text-[10px] tracking-[0.15em] text-zinc-500">{fmtDate(b.created_at)}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {b.status === "new" && (
            <>
              <button onClick={() => onSetStatus(b.id, "accepted")} data-testid={`booking-accept-${b.id}`} disabled={busy} className={primaryBtn}>
                {spinner || <ThumbsUp size={12} />} Accept
              </button>
              <button onClick={() => onSetStatus(b.id, "handled")} data-testid={`booking-mark-handled-${b.id}`} disabled={busy} className={outlineBtn}>
                {spinner || <CheckCircle2 size={12} />} Mark handled
              </button>
            </>
          )}
          {b.status === "accepted" && (
            <>
              <button onClick={() => onSetStatus(b.id, "handled")} data-testid={`booking-mark-handled-${b.id}`} disabled={busy} className={primaryBtn}>
                {spinner || <CheckCircle2 size={12} />} Mark handled
              </button>
              <button onClick={() => onSetStatus(b.id, "new")} data-testid={`booking-reopen-${b.id}`} disabled={busy} className={outlineBtn}>
                {spinner || <RotateCcw size={12} />} Back to new
              </button>
            </>
          )}
          {b.status === "handled" && (
            <button onClick={() => onSetStatus(b.id, "new")} data-testid={`booking-reopen-${b.id}`} disabled={busy} className={outlineBtn}>
              {spinner || <RotateCcw size={12} />} Reopen
            </button>
          )}
        </div>
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
        <p className="flex items-center gap-2 font-mono-tech text-[11px] tracking-[0.1em] text-zinc-400 mb-3" data-testid="booking-card-appointment">
          <CalendarClock size={13} className="text-[#00F0FF]" />
          {b.time_slot ? (
            <>Appointment: <span className="text-zinc-100">{b.preferred_date} · {slotLabel(b.time_slot)}</span></>
          ) : (
            <>Preferred date: <span className="text-zinc-100">{b.preferred_date}</span> (no slot picked)</>
          )}
        </p>
      )}
      <p className="text-sm text-zinc-400 leading-relaxed border-t border-white/5 pt-4" data-testid="booking-card-message">{b.message || "No message."}</p>
    </article>
  );
};
