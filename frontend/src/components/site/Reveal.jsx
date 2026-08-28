import { motion } from "framer-motion";

export const Reveal = ({ children, delay = 0, y = 48, className = "" }) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-80px" }}
    transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
  >
    {children}
  </motion.div>
);

export const MaskedLine = ({ children, delay = 0, className = "" }) => (
  <span className={`block overflow-hidden ${className}`}>
    <motion.span
      className="block"
      initial={{ y: "110%" }}
      animate={{ y: 0 }}
      transition={{ duration: 1, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.span>
  </span>
);

export const SectionLabel = ({ index, title, testId }) => (
  <Reveal y={24}>
    <div className="flex items-center gap-4 mb-16" data-testid={testId}>
      <span className="font-mono-tech text-xs md:text-sm tracking-[0.2em] text-[#00F0FF] uppercase">
        {index}
      </span>
      <span className="h-px flex-1 bg-white/10" />
      <span className="font-mono-tech text-xs md:text-sm tracking-[0.2em] text-zinc-500 uppercase">
        {title}
      </span>
    </div>
  </Reveal>
);
