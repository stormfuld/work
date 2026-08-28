import { motion } from "framer-motion";
import { Reveal, SectionLabel } from "./Reveal";
import { PROCESS } from "../../lib/site-data";

export const Manifesto = () => (
  <section id="process" className="py-32 md:py-48" data-testid="process-section">
    <div className="max-w-7xl mx-auto px-6 md:px-10">
      <SectionLabel index="01" title="The Process" testId="process-label" />

      <Reveal>
        <h2 className="font-display font-bold uppercase tracking-tight text-4xl md:text-5xl text-zinc-100 max-w-3xl mb-24" data-testid="process-heading">
          No guesswork. No jargon. <span className="text-zinc-500">A method.</span>
        </h2>
      </Reveal>

      <div>
        {PROCESS.map((step, i) => (
          <motion.div
            key={step.num}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.8, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="group grid grid-cols-12 gap-6 items-start border-b border-white/10 py-12 md:py-16 hover:bg-white/[0.02] transition-colors duration-500"
            data-testid={`process-step-${step.num}`}
          >
            <span className="col-span-3 md:col-span-2 font-mono-tech font-bold text-5xl md:text-7xl text-zinc-700 group-hover:text-[#00F0FF] transition-colors duration-500">
              {step.num}
            </span>
            <div className="col-span-9 md:col-span-4">
              <h3 className="font-display font-bold uppercase text-2xl md:text-3xl text-zinc-100 tracking-tight">
                {step.title}
              </h3>
            </div>
            <p className="col-span-9 col-start-4 md:col-span-5 md:col-start-8 text-zinc-400 text-base leading-relaxed">
              {step.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);
