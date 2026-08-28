import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, Cpu } from "lucide-react";
import { MaskedLine } from "./Reveal";
import { IMAGES, BUSINESS } from "../../lib/site-data";

export const Hero = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section ref={ref} className="relative min-h-screen flex flex-col justify-end overflow-hidden" data-testid="hero-section">
      <motion.div style={{ y: bgY }} className="absolute inset-0">
        <img
          src={IMAGES.heroBg}
          alt="Server lights in the dark"
          className="w-full h-[120%] object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-black/40" />
      </motion.div>

      <motion.div style={{ opacity: fade }} className="relative z-10 max-w-7xl mx-auto w-full px-6 md:px-10 pb-16 md:pb-24 pt-40">
        <MaskedLine delay={0.4}>
          <p className="font-mono-tech text-xs md:text-sm tracking-[0.3em] uppercase text-[#00F0FF] mb-8 flex items-center gap-3" data-testid="hero-kicker">
            <Cpu size={16} /> Independent computer technician — mobile, I come to you
          </p>
        </MaskedLine>

        <h1 className="font-display font-black uppercase tracking-tighter leading-[0.95] text-5xl sm:text-7xl lg:text-[6.5rem] text-zinc-100" data-testid="hero-heading">
          <MaskedLine delay={0.55}>We bring dead</MaskedLine>
          <MaskedLine delay={0.7}>hardware</MaskedLine>
          <MaskedLine delay={0.85}>
            <span className="text-[#00F0FF]">back to life.</span>
          </MaskedLine>
        </h1>

        <div className="mt-12 flex flex-col md:flex-row md:items-end justify-between gap-10">
          <MaskedLine delay={1.05}>
            <p className="text-zinc-400 text-base md:text-lg max-w-md leading-relaxed" data-testid="hero-subtitle">
              Repair, recovery and upgrades with bench-level precision.
              Fixed quotes, same-day diagnostics, 90-day warranty on every fix.
            </p>
          </MaskedLine>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.25, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-4"
          >
            <button
              data-testid="hero-quote-button"
              onClick={() => document.querySelector("#booking")?.scrollIntoView({ behavior: "smooth" })}
              className="font-mono-tech text-xs md:text-sm tracking-[0.2em] uppercase bg-[#00F0FF] text-black px-8 py-4 rounded-sm font-bold hover:bg-white transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-white"
            >
              Request a quote
            </button>
            <button
              data-testid="hero-services-button"
              onClick={() => document.querySelector("#services")?.scrollIntoView({ behavior: "smooth" })}
              className="font-mono-tech text-xs md:text-sm tracking-[0.2em] uppercase border border-white/20 text-zinc-200 px-8 py-4 rounded-sm hover:border-[#00F0FF] hover:text-[#00F0FF] transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#00F0FF]"
            >
              See services
            </button>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 1 }}
          className="mt-16 pt-8 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-6"
          data-testid="hero-stats"
        >
          {[
            ["500+", "Devices revived"],
            ["48h", "Avg. turnaround"],
            ["90-day", "Repair warranty"],
            [BUSINESS.hours, "Booking hours"],
          ].map(([stat, label]) => (
            <div key={label}>
              <p className="font-mono-tech text-lg md:text-xl text-zinc-100 font-bold">{stat}</p>
              <p className="font-mono-tech text-[10px] md:text-xs tracking-[0.2em] uppercase text-zinc-500 mt-1">{label}</p>
            </div>
          ))}
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-6 right-6 md:right-10 text-zinc-500"
      >
        <ArrowDown size={20} className="animate-bounce" />
      </motion.div>
    </section>
  );
};
