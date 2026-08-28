import { Reveal } from "./Reveal";
import { BUSINESS } from "../../lib/site-data";

export const Footer = () => (
  <footer className="border-t border-white/5 pt-24 pb-10 overflow-hidden" data-testid="site-footer">
    <div className="max-w-7xl mx-auto px-6 md:px-10">
      <Reveal>
        <button
          data-testid="footer-cta"
          onClick={() => document.querySelector("#booking")?.scrollIntoView({ behavior: "smooth" })}
          className="block w-full text-left font-display font-black uppercase tracking-tighter leading-none text-[16vw] md:text-[10vw] text-zinc-100 hover:text-[#00F0FF] transition-colors duration-500 focus:outline-none"
        >
          Let's fix it<span className="text-[#00F0FF]">.</span>
        </button>
      </Reveal>

      <div className="mt-20 pt-10 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <p className="font-display font-black uppercase tracking-tight text-lg text-zinc-100 mb-2">
            {BUSINESS.name}<span className="text-[#00F0FF]">.</span>
          </p>
          <p className="font-mono-tech text-[10px] tracking-[0.2em] uppercase text-zinc-500">{BUSINESS.tagline}</p>
        </div>
        <div>
          <p className="font-mono-tech text-[10px] tracking-[0.2em] uppercase text-zinc-500 mb-3">Contact</p>
          <p className="font-mono-tech text-sm text-zinc-300" data-testid="footer-phone">{BUSINESS.phone}</p>
          <p className="font-mono-tech text-sm text-zinc-300" data-testid="footer-email">{BUSINESS.email}</p>
        </div>
        <div>
          <p className="font-mono-tech text-[10px] tracking-[0.2em] uppercase text-zinc-500 mb-3">Hours</p>
          <p className="font-mono-tech text-sm text-zinc-300">{BUSINESS.hours}</p>
          <p className="font-mono-tech text-sm text-zinc-500 mt-1">{BUSINESS.area}</p>
        </div>
        <div className="flex flex-col md:items-end justify-end gap-2">
          <a
            href="/admin"
            data-testid="footer-owner-login-link"
            className="font-mono-tech text-[10px] tracking-[0.2em] uppercase text-zinc-600 hover:text-[#00F0FF] transition-colors duration-300"
          >
            Owner login
          </a>
          <p className="font-mono-tech text-[10px] tracking-[0.2em] uppercase text-zinc-600">
            © {new Date().getFullYear()} {BUSINESS.name}
          </p>
        </div>
      </div>
    </div>
  </footer>
);
