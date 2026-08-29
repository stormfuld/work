import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Loader2, SendHorizonal, CheckCircle2 } from "lucide-react";
import { Reveal, SectionLabel } from "./Reveal";
import { BUSINESS, SERVICES, SERVICE_EXCLUSIONS } from "../../lib/site-data";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const inputCls =
  "w-full bg-[#0A0A0C] border border-white/10 rounded-sm px-4 py-3.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-[#00F0FF] focus:ring-1 focus:ring-[#00F0FF] transition-[border-color,box-shadow] duration-300";

const labelCls = "block font-mono-tech text-[10px] tracking-[0.2em] uppercase text-zinc-500 mb-2";

const INITIAL = {
  name: "",
  email: "",
  phone: "",
  device_type: "Laptop",
  service: "General Repair",
  preferred_date: "",
  time_slot: "",
  message: "",
};

const slotBtnCls = (selected, available) =>
  `font-mono-tech text-[11px] tracking-[0.15em] uppercase px-5 py-3 rounded-sm border transition-colors duration-300 ${
    !available
      ? "border-white/5 text-zinc-700 line-through cursor-not-allowed"
      : selected
      ? "border-[#00F0FF] text-[#00F0FF] bg-[#00F0FF]/10"
      : "border-white/15 text-zinc-300 hover:border-[#00F0FF] hover:text-[#00F0FF]"
  }`;

export const BookingForm = () => {
  const [form, setForm] = useState(INITIAL);
  const [slots, setSlots] = useState(null);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const fetchSlots = async (date) => {
    if (!date) {
      setSlots(null);
      return;
    }
    try {
      const { data } = await axios.get(`${API}/availability`, { params: { date } });
      setSlots(data.slots);
    } catch {
      setSlots([]);
    }
  };

  const onDateChange = (e) => {
    const date = e.target.value;
    setForm((f) => ({ ...f, preferred_date: date, time_slot: "" }));
    fetchSlots(date);
  };

  const pickSlot = (slot) =>
    setForm((f) => ({ ...f, time_slot: f.time_slot === slot ? "" : slot }));

  const submit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await axios.post(`${API}/bookings`, {
        ...form,
        preferred_date: form.preferred_date || null,
        time_slot: form.time_slot || null,
      });
      setDone(true);
      setForm(INITIAL);
      setSlots(null);
      toast.success("Request received — I'll get back to you within one business day.");
    } catch (err) {
      if (err.response?.status === 409) {
        toast.error(err.response.data.detail);
        fetchSlots(form.preferred_date);
        setForm((f) => ({ ...f, time_slot: "" }));
      } else {
        toast.error("Something went wrong sending your request. Please try again or call directly.");
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="booking" className="py-32 md:py-48" data-testid="booking-section">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <SectionLabel index="06" title="Request a Quote" testId="booking-label" />

        <div className="grid grid-cols-12 gap-12">
          <div className="col-span-12 md:col-span-5">
            <Reveal>
              <h2 className="font-display font-bold uppercase tracking-tight text-4xl md:text-5xl text-zinc-100 mb-8" data-testid="booking-heading">
                Tell me what's <span className="text-[#00F0FF]">broken.</span>
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="text-zinc-400 text-base md:text-lg leading-relaxed mb-12">
                Describe the fault and I'll reply with a fixed quote within one
                business day. No obligation, no repair-speak.
              </p>
            </Reveal>
            <Reveal delay={0.2}>
              <div className="space-y-6 border-t border-white/10 pt-8" data-testid="booking-contact-info">
                {[
                  ["Phone", BUSINESS.phone],
                  ["Email", BUSINESS.email],
                  ["Hours", BUSINESS.hours],
                  ["Coverage", BUSINESS.area],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className={labelCls}>{label}</p>
                    <p className="font-mono-tech text-sm text-zinc-200">{value}</p>
                  </div>
                ))}
              </div>
            </Reveal>
            <Reveal delay={0.25}>
              <div className="mt-10 border-t border-white/10 pt-8" data-testid="booking-exclusions">
                <p className={labelCls}>Good to know</p>
                <ul className="space-y-2">
                  {SERVICE_EXCLUSIONS.map((line) => (
                    <li key={line} className="text-zinc-500 text-xs leading-relaxed">
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>

          <div className="col-span-12 md:col-span-7">
            <Reveal delay={0.15}>
              {done ? (
                <div className="border border-[#00F0FF]/40 rounded-sm p-12 md:p-16 bg-[#0A0A0C] glow-cyan text-center" data-testid="booking-success">
                  <CheckCircle2 size={48} className="text-[#00F0FF] mx-auto mb-6" />
                  <h3 className="font-display font-bold uppercase text-2xl md:text-3xl text-zinc-100 mb-4">Request received.</h3>
                  <p className="text-zinc-400 text-base mb-10">I'll reply with a fixed quote within one business day.</p>
                  <button
                    data-testid="booking-another-button"
                    onClick={() => setDone(false)}
                    className="font-mono-tech text-xs tracking-[0.2em] uppercase border border-white/20 text-zinc-200 px-6 py-3 rounded-sm hover:border-[#00F0FF] hover:text-[#00F0FF] transition-colors duration-300"
                  >
                    Send another request
                  </button>
                </div>
              ) : (
                <form onSubmit={submit} className="border border-white/10 rounded-sm p-8 md:p-12 bg-[#0A0A0C]" data-testid="booking-form">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className={labelCls} htmlFor="bk-name">Name *</label>
                      <input id="bk-name" data-testid="booking-name-input" required value={form.name} onChange={set("name")} placeholder="Jane Doe" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls} htmlFor="bk-email">Email *</label>
                      <input id="bk-email" data-testid="booking-email-input" required type="email" value={form.email} onChange={set("email")} placeholder="jane@email.com" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls} htmlFor="bk-phone">Phone</label>
                      <input id="bk-phone" data-testid="booking-phone-input" value={form.phone} onChange={set("phone")} placeholder="(555) 000-0000" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls} htmlFor="bk-date">Preferred date</label>
                      <input
                        id="bk-date"
                        data-testid="booking-date-input"
                        type="date"
                        min={new Date().toLocaleDateString("en-CA")}
                        value={form.preferred_date}
                        onChange={onDateChange}
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className={labelCls} htmlFor="bk-device">Device *</label>
                      <select id="bk-device" data-testid="booking-device-select" value={form.device_type} onChange={set("device_type")} className={inputCls}>
                        {["Laptop", "Desktop PC", "Mac", "Phone / Tablet", "Network gear", "Other"].map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls} htmlFor="bk-service">Service *</label>
                      <select id="bk-service" data-testid="booking-service-select" value={form.service} onChange={set("service")} className={inputCls}>
                        {SERVICES.map((s) => (
                          <option key={s.id} value={s.title}>{s.title}</option>
                        ))}
                        <option value="Not sure — diagnose it">Not sure — diagnose it</option>
                      </select>
                    </div>
                  </div>
                  {form.preferred_date && (
                    <div className="mb-8" data-testid="booking-slot-picker">
                      <label className={labelCls}>Appointment slot — 2 hrs, I come to you (optional)</label>
                      {slots === null ? (
                        <p className="font-mono-tech text-xs text-zinc-500 flex items-center gap-2">
                          <Loader2 size={12} className="animate-spin" /> Checking availability…
                        </p>
                      ) : slots.length > 0 && slots.every((s) => !s.available) ? (
                        <p className="font-mono-tech text-xs text-zinc-500" data-testid="booking-no-slots">
                          No slots left on this day — pick another date, or send without a slot and I'll reach out.
                        </p>
                      ) : (
                        <div className="flex flex-wrap gap-3">
                          {slots.map((s) => (
                            <button
                              key={s.slot}
                              type="button"
                              data-testid={`booking-slot-${s.slot}`}
                              disabled={!s.available}
                              onClick={() => pickSlot(s.slot)}
                              className={slotBtnCls(form.time_slot === s.slot, s.available)}
                            >
                              {s.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  <div className="mb-8">
                    <label className={labelCls} htmlFor="bk-message">What's happening? *</label>
                    <textarea
                      id="bk-message"
                      data-testid="booking-message-input"
                      required
                      rows={5}
                      value={form.message}
                      onChange={set("message")}
                      placeholder="e.g. Laptop won't boot past the logo screen, makes a clicking sound…"
                      className={`${inputCls} resize-none`}
                    />
                  </div>
                  <button
                    type="submit"
                    data-testid="booking-submit-button"
                    disabled={sending}
                    className="w-full sm:w-auto font-mono-tech text-xs tracking-[0.2em] uppercase bg-[#00F0FF] text-black px-10 py-4 rounded-sm font-bold hover:bg-white transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 focus:outline-none focus:ring-2 focus:ring-white"
                  >
                    {sending ? <Loader2 size={16} className="animate-spin" /> : <SendHorizonal size={16} />}
                    {sending ? "Sending…" : "Send request"}
                  </button>
                </form>
              )}
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
};
