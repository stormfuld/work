import MarqueeLib from "react-fast-marquee";
import { MARQUEE_ITEMS } from "../../lib/site-data";

export const Marquee = () => (
  <div className="py-16 md:py-24 border-y border-white/5 overflow-hidden" data-testid="editorial-marquee">
    <MarqueeLib speed={28} gradient={false} pauseOnHover>
      {MARQUEE_ITEMS.map((item) => (
        <span key={item} className="flex items-center">
          <span className="font-display font-black uppercase text-6xl md:text-8xl tracking-tighter text-stroke mx-6 whitespace-nowrap">
            {item}
          </span>
          <span className="font-mono-tech text-[#00F0FF] text-3xl md:text-5xl mx-6">+</span>
        </span>
      ))}
    </MarqueeLib>
  </div>
);
