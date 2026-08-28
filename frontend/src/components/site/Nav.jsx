import { useState } from "react";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { BUSINESS } from "../../lib/site-data";

const LINKS = [
  { label: "Process", href: "#process", testId: "nav-link-process" },
  { label: "Services", href: "#services", testId: "nav-link-services" },
  { label: "Pricing", href: "#pricing", testId: "nav-link-pricing" },
  { label: "About", href: "#about", testId: "nav-link-about" },
  { label: "Coverage", href: "#coverage", testId: "nav-link-coverage" },
];

const scrollTo = (href) => {
  document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
};

export const Nav = () => {
  const [open, setOpen] = useState(false);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
      className="fixed top-0 inset-x-0 z-50 backdrop-blur-xl bg-black/60 border-b border-white/5"
      data-testid="site-nav"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-10 h-16 md:h-20 flex items-center justify-between">
        <button
          data-testid="nav-logo"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="font-display font-black text-lg md:text-xl tracking-tight uppercase text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#00F0FF]"
        >
          {BUSINESS.name}
          <span className="text-[#00F0FF]">.</span>
        </button>

        <nav className="hidden md:flex items-center gap-10">
          {LINKS.map((l) => (
            <button
              key={l.href}
              data-testid={l.testId}
              onClick={() => scrollTo(l.href)}
              className="font-mono-tech text-xs tracking-[0.2em] uppercase text-zinc-400 hover:text-[#00F0FF] transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#00F0FF]"
            >
              {l.label}
            </button>
          ))}
          <button
            data-testid="nav-quote-button"
            onClick={() => scrollTo("#booking")}
            className="font-mono-tech text-xs tracking-[0.2em] uppercase bg-[#00F0FF] text-black px-5 py-2.5 rounded-sm font-bold hover:bg-white transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-white"
          >
            Request Quote
          </button>
        </nav>

        <button
          data-testid="nav-mobile-toggle"
          className="md:hidden text-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#00F0FF]"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-white/5 bg-black/90 px-6 py-6 flex flex-col gap-5" data-testid="nav-mobile-menu">
          {LINKS.map((l) => (
            <button
              key={l.href}
              data-testid={`${l.testId}-mobile`}
              onClick={() => {
                setOpen(false);
                scrollTo(l.href);
              }}
              className="text-left font-mono-tech text-sm tracking-[0.2em] uppercase text-zinc-300 hover:text-[#00F0FF] transition-colors"
            >
              {l.label}
            </button>
          ))}
          <button
            data-testid="nav-quote-button-mobile"
            onClick={() => {
              setOpen(false);
              scrollTo("#booking");
            }}
            className="font-mono-tech text-sm tracking-[0.2em] uppercase bg-[#00F0FF] text-black px-5 py-3 rounded-sm font-bold w-max"
          >
            Request Quote
          </button>
        </div>
      )}
    </motion.header>
  );
};
