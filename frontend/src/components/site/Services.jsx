import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Reveal, SectionLabel } from "./Reveal";
import { SERVICES } from "../../lib/site-data";

const ServiceCard = ({ service, index }) => (
  <motion.button
    initial={{ opacity: 0, y: 48 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-60px" }}
    transition={{ duration: 0.8, delay: (index % 3) * 0.1, ease: [0.22, 1, 0.36, 1] }}
    whileHover={{ y: -6 }}
    onClick={() => document.querySelector("#booking")?.scrollIntoView({ behavior: "smooth" })}
    className={`group relative col-span-12 ${service.span} text-left border border-white/5 hover:border-white/20 hover:shadow-[0_0_50px_-12px_rgba(0,240,255,0.35)] transition-[border-color,box-shadow] duration-500 rounded-sm overflow-hidden bg-[#0A0A0C] focus:outline-none focus:ring-2 focus:ring-[#00F0FF] min-h-[280px] flex flex-col justify-end`}
    data-testid={`service-card-${service.id}`}
  >
    {service.image && (
      <div className="absolute inset-0">
        <img
          src={service.image}
          alt={service.title}
          className="w-full h-full object-cover opacity-40 group-hover:opacity-55 group-hover:scale-105 transition-[opacity,transform] duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0C] via-[#0A0A0C]/60 to-transparent" />
      </div>
    )}
    <div className="relative p-8 md:p-10 w-full">
      <div className="flex items-start justify-between mb-16 md:mb-24">
        <span className="font-mono-tech text-xs tracking-[0.2em] text-[#00F0FF]">{service.num}</span>
        <ArrowUpRight
          size={20}
          className="text-zinc-600 group-hover:text-[#00F0FF] group-hover:translate-x-1 group-hover:-translate-y-1 transition-[color,transform] duration-300"
        />
      </div>
      <h3 className="font-display font-bold uppercase tracking-tight text-2xl md:text-3xl text-zinc-100 mb-3">
        {service.title}
      </h3>
      <p className="text-zinc-400 text-sm md:text-base leading-relaxed max-w-lg">{service.desc}</p>
    </div>
  </motion.button>
);

export const Services = () => (
  <section id="services" className="py-32 md:py-48 bg-[#050505]" data-testid="services-section">
    <div className="max-w-7xl mx-auto px-6 md:px-10">
      <SectionLabel index="02" title="Capabilities" testId="services-label" />

      <Reveal>
        <h2 className="font-display font-bold uppercase tracking-tight text-4xl md:text-5xl text-zinc-100 max-w-3xl mb-24" data-testid="services-heading">
          Everything between <span className="text-[#00F0FF]">the wall socket</span> and the screen.
        </h2>
      </Reveal>

      <div className="grid grid-cols-12 gap-4 md:gap-6">
        {SERVICES.map((s, i) => (
          <ServiceCard key={s.id} service={s} index={i} />
        ))}
      </div>
    </div>
  </section>
);
