import { useState } from "react";
import axios from "axios";
import { Loader2, MapPin, CheckCircle2, AlertTriangle, Phone, SendHorizonal } from "lucide-react";
import { Reveal, SectionLabel } from "./Reveal";
import { BUSINESS } from "../../lib/site-data";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const scrollToBooking = () => document.querySelector("#booking")?.scrollIntoView({ behavior: "smooth" });

export const ServiceArea = () => {
  const [postal, setPostal] = useState("");
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const check = async (e) => {
    e.preventDefault();
    if (!postal.trim()) return;
    setChecking(true);
    setResult(null);
    setError("");
    try {
      const { data } = await axios.get(`${API}/service-area`, { params: { postal_code: postal } });
      setResult(data);
    } catch (err) {
      setError(
        typeof err.response?.data?.detail === "string"
          ? err.response.data.detail
          : "Enter a valid Canadian postal code (e.g. E3V 1A1)."
      );
    } finally {
      setChecking(false);
    }
  };

  return (
    <section id="coverage" className="py-32 md:py-48" data-testid="coverage-section">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <SectionLabel index="05" title="Service Area" testId="coverage-label" />

        <div className="grid grid-cols-12 gap-12 items-start">
          <div className="col-span-12 md:col-span-5">
            <Reveal>
              <h2 className="font-display font-bold uppercase tracking-tight text-4xl md:text-5xl text-zinc-100 mb-8" data-testid="coverage-heading">
                Am I in <span className="text-[#00F0FF]">your area?</span>
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="text-zinc-400 text-base md:text-lg leading-relaxed" data-testid="coverage-subtitle">
                I'm based in Edmundston and drive up to 1.5 hours out — covering
                Edmundston and the surrounding area, all the way to Grand Falls
                and beyond. Punch in your postal code to check whether I come to you.
              </p>
            </Reveal>
          </div>

          <div className="col-span-12 md:col-span-7">
            <Reveal delay={0.15}>
              <div className="border border-white/10 rounded-sm p-8 md:p-12 bg-[#0A0A0C]">
                <form onSubmit={check} className="flex flex-col sm:flex-row gap-4" data-testid="coverage-form">
                  <div className="relative flex-1">
                    <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" />
                    <input
                      data-testid="coverage-postal-input"
                      value={postal}
                      onChange={(e) => setPostal(e.target.value.toUpperCase())}
                      placeholder="E3V 1A1"
                      maxLength={7}
                      className="w-full bg-[#050505] border border-white/10 rounded-sm pl-11 pr-4 py-4 font-mono-tech text-sm tracking-[0.15em] text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-[#00F0FF] focus:ring-1 focus:ring-[#00F0FF] transition-[border-color,box-shadow] duration-300"
                    />
                  </div>
                  <button
                    type="submit"
                    data-testid="coverage-check-button"
                    disabled={checking || !postal.trim()}
                    className="font-mono-tech text-xs tracking-[0.2em] uppercase bg-[#00F0FF] text-black px-8 py-4 rounded-sm font-bold hover:bg-white transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  >
                    {checking ? <Loader2 size={14} className="animate-spin" /> : <MapPin size={14} />}
                    {checking ? "Checking…" : "Check coverage"}
                  </button>
                </form>

                {error && (
                  <p className="mt-6 font-mono-tech text-xs text-red-400" data-testid="coverage-error">{error}</p>
                )}

                {result && result.in_area && (
                  <div className="mt-8 border border-[#00F0FF]/40 rounded-sm p-6 md:p-8 bg-[#00F0FF]/5" data-testid="coverage-result-in">
                    <div className="flex items-center gap-3 mb-3">
                      <CheckCircle2 size={20} className="text-[#00F0FF]" />
                      <p className="font-display font-bold uppercase text-lg text-zinc-100">You're covered.</p>
                    </div>
                    <p className="text-sm text-zinc-300 leading-relaxed mb-6">
                      {result.drive_minutes <= 5
                        ? `${result.place} is right around the corner from Edmundston.`
                        : `${result.place} is about ${result.drive_minutes} min from Edmundston.`}{" "}
                      I come to you, no drop-off needed.
                    </p>
                    <button
                      data-testid="coverage-quote-button"
                      onClick={scrollToBooking}
                      className="font-mono-tech text-xs tracking-[0.2em] uppercase bg-[#00F0FF] text-black px-6 py-3 rounded-sm font-bold hover:bg-white transition-colors duration-300 flex items-center gap-2"
                    >
                      <SendHorizonal size={12} /> Request a quote
                    </button>
                  </div>
                )}

                {result && !result.in_area && (
                  <div className="mt-8 border border-amber-400/40 rounded-sm p-6 md:p-8 bg-amber-400/5" data-testid="coverage-result-out">
                    <div className="flex items-center gap-3 mb-3">
                      <AlertTriangle size={20} className="text-amber-400" />
                      <p className="font-display font-bold uppercase text-lg text-zinc-100">Too far for a house call.</p>
                    </div>
                    <p className="text-sm text-zinc-300 leading-relaxed mb-6">
                      {result.place} is roughly {result.drive_minutes} min from
                      Edmundston — outside my usual 1.5 hour range. Get in touch
                      anyway — for the right job I'll make the trip, or we can
                      sort it remotely.
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <a
                        href={`tel:${BUSINESS.phone.replace(/[^0-9+]/g, "")}`}
                        data-testid="coverage-call-link"
                        className="font-mono-tech text-xs tracking-[0.2em] uppercase bg-amber-400 text-black px-6 py-3 rounded-sm font-bold hover:bg-white transition-colors duration-300 flex items-center gap-2"
                      >
                        <Phone size={12} /> Call / text {BUSINESS.phone}
                      </a>
                      <button
                        data-testid="coverage-request-anyway-button"
                        onClick={scrollToBooking}
                        className="font-mono-tech text-xs tracking-[0.2em] uppercase border border-white/20 text-zinc-200 px-6 py-3 rounded-sm hover:border-[#00F0FF] hover:text-[#00F0FF] transition-colors duration-300"
                      >
                        Send a request anyway
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
};
