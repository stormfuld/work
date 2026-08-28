import { Reveal, SectionLabel } from "./Reveal";
import { IMAGES } from "../../lib/site-data";

export const About = () => (
  <section id="about" className="py-32 md:py-48 bg-[#0A0A0C] border-y border-white/5" data-testid="about-section">
    <div className="max-w-7xl mx-auto px-6 md:px-10">
      <SectionLabel index="04" title="The Technician" testId="about-label" />

      <div className="grid grid-cols-12 gap-8 md:gap-12 items-center">
        <div className="col-span-12 md:col-span-5 relative">
          <Reveal>
            <div className="relative overflow-hidden rounded-sm border border-white/10" data-testid="about-image-frame">
              <img
                src={IMAGES.technician}
                alt="Technician at work on a laptop"
                className="w-full h-[420px] md:h-[560px] object-cover grayscale hover:grayscale-0 transition-[filter] duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6">
                <p className="font-mono-tech text-[10px] tracking-[0.2em] uppercase text-[#00F0FF]">Bench 01 — Est. 2019</p>
              </div>
            </div>
          </Reveal>
        </div>

        <div className="col-span-12 md:col-span-6 md:col-start-7">
          <Reveal>
            <h2 className="font-display font-bold uppercase tracking-tight text-4xl md:text-5xl text-zinc-100 mb-8" data-testid="about-heading">
              One technician. <span className="text-zinc-500">Zero handoffs.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="text-zinc-400 text-base md:text-lg leading-relaxed mb-6" data-testid="about-body-1">
              This is a one-person workshop, and that's the point. The person who
              diagnoses your machine is the person who repairs it — and the person
              who answers the phone when you call back.
            </p>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="text-zinc-400 text-base md:text-lg leading-relaxed mb-12" data-testid="about-body-2">
              Evenings and weekends by design: drop your machine off after work,
              get it back before the weekend. Every repair is documented,
              photographed and covered by a written warranty.
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <div className="grid grid-cols-3 gap-6 border-t border-white/10 pt-8" data-testid="about-stats">
              {[
                ["7 yrs", "Bench experience"],
                ["CompTIA", "A+ certified"],
                ["4.9/5", "Customer rating"],
              ].map(([stat, label]) => (
                <div key={label}>
                  <p className="font-mono-tech text-xl md:text-2xl font-bold text-[#00F0FF]">{stat}</p>
                  <p className="font-mono-tech text-[10px] md:text-xs tracking-[0.15em] uppercase text-zinc-500 mt-2">{label}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  </section>
);
