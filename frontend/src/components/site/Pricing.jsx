import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Reveal, SectionLabel } from "./Reveal";
import { PRICING } from "../../lib/site-data";

export const Pricing = () => (
  <section id="pricing" className="py-32 md:py-48" data-testid="pricing-section">
    <div className="max-w-7xl mx-auto px-6 md:px-10">
      <SectionLabel index="03" title="Transparent Pricing" testId="pricing-label" />

      <Reveal>
        <h2 className="font-display font-bold uppercase tracking-tight text-4xl md:text-5xl text-zinc-100 max-w-3xl mb-6" data-testid="pricing-heading">
          Fixed quotes. <span className="text-zinc-500">No surprises on the invoice.</span>
        </h2>
      </Reveal>
      <Reveal delay={0.1}>
        <p className="text-zinc-400 text-base md:text-lg max-w-xl mb-24">
          You approve the price before a single screw turns. Parts always at cost.
        </p>
      </Reveal>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {PRICING.map((tier, i) => (
          <motion.div
            key={tier.id}
            initial={{ opacity: 0, y: 48 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.8, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
            className={`relative border rounded-sm p-8 md:p-10 flex flex-col bg-[#0A0A0C] transition-[border-color,box-shadow] duration-500 ${
              tier.featured
                ? "border-[#00F0FF]/60 glow-cyan"
                : "border-white/10 hover:border-white/25"
            }`}
            data-testid={`pricing-card-${tier.id}`}
          >
            {tier.featured && (
              <span className="absolute -top-3 left-8 font-mono-tech text-[10px] tracking-[0.2em] uppercase bg-[#00F0FF] text-black px-3 py-1 font-bold" data-testid="pricing-featured-badge">
                Most booked
              </span>
            )}
            <p className="font-mono-tech text-xs tracking-[0.2em] uppercase text-zinc-500 mb-6">{tier.name}</p>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="font-mono-tech text-xs text-zinc-500 uppercase">{tier.unit}</span>
              <span className={`font-display font-black text-5xl md:text-6xl tracking-tighter ${tier.featured ? "text-[#00F0FF]" : "text-zinc-100"}`}>
                {tier.price}
              </span>
            </div>
            <p className="text-zinc-400 text-sm leading-relaxed mb-10">{tier.desc}</p>
            <ul className="space-y-3 mb-10 flex-1">
              {tier.features.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-zinc-300">
                  <Check size={14} className="text-[#00F0FF] shrink-0" /> {f}
                </li>
              ))}
            </ul>
            <button
              data-testid={`pricing-cta-${tier.id}`}
              onClick={() => document.querySelector("#booking")?.scrollIntoView({ behavior: "smooth" })}
              className={`font-mono-tech text-xs tracking-[0.2em] uppercase px-6 py-3.5 rounded-sm font-bold transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#00F0FF] ${
                tier.featured
                  ? "bg-[#00F0FF] text-black hover:bg-white"
                  : "border border-white/20 text-zinc-200 hover:border-[#00F0FF] hover:text-[#00F0FF]"
              }`}
            >
              Book this
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);
