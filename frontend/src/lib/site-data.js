export const BUSINESS = {
  name: "CircuitWorks",
  tagline: "Computer Repair & IT Services",
  phone: "(555) 014-2273",
  email: "hello@circuitworks.tech",
  hours: "Mon–Sat · 9:00–19:00",
  area: "On-site & remote · Greater metro area",
};

export const IMAGES = {
  heroBg:
    "https://images.unsplash.com/photo-1561076634-521942b94092?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NTN8MHwxfHNlYXJjaHwzfHxzZXJ2ZXIlMjBsaWdodHMlMjBkYXJrfGVufDB8fHx8MTc4Nzg4NDkyNXww&ixlib=rb-4.1.0&q=85",
  rig:
    "https://images.unsplash.com/photo-1675410202405-5ef270c857d3?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzNDR8MHwxfHNlYXJjaHwzfHxjb21wdXRlciUyMHJlcGFpciUyMHRlY2huaWNpYW4lMjBkYXJrfGVufDB8fHx8MTc4Nzg4NDkyNHww&ixlib=rb-4.1.0&q=85",
  circuit:
    "https://images.unsplash.com/photo-1787181875853-e8158cebaed8?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzNzl8MHwxfHNlYXJjaHwyfHxjaXJjdWl0JTIwYm9hcmQlMjBtYWNybyUyMGRhcmt8ZW58MHx8fHwxNzg3ODg0OTI0fDA&ixlib=rb-4.1.0&q=85",
  technician:
    "https://images.unsplash.com/photo-1594398985750-3b54ec074a0a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzNDR8MHwxfHNlYXJjaHwyfHxjb21wdXRlciUyMHJlcGFpciUyMHRlY2huaWNpYW4lMjBkYXJrfGVufDB8fHx8MTc4Nzg4NDkyNHww&ixlib=rb-4.1.0&q=85",
};

export const SERVICES = [
  {
    id: "general-repair",
    num: "S/01",
    title: "General Repair",
    desc: "Cracked screens, dead batteries, failing drives, broken ports. Hardware faults diagnosed and fixed with OEM-grade parts.",
    span: "md:col-span-8",
    image: IMAGES.rig,
  },
  {
    id: "virus-removal",
    num: "S/02",
    title: "Virus & Malware Removal",
    desc: "Deep-clean eradication of malware, ransomware triage, browser hijacks and rootkits — plus hardening so it doesn't come back.",
    span: "md:col-span-4",
    image: null,
  },
  {
    id: "upgrades",
    num: "S/03",
    title: "Upgrades & Custom Builds",
    desc: "SSD swaps, RAM boosts, GPU installs and full custom rigs specced to your workload and budget.",
    span: "md:col-span-4",
    image: null,
  },
  {
    id: "networking",
    num: "S/04",
    title: "Home & Small Office Networking",
    desc: "Wi-Fi dead zones eliminated. Mesh setups, router config, NAS and printer sharing that just works.",
    span: "md:col-span-8",
    image: IMAGES.circuit,
  },
  {
    id: "data-recovery",
    num: "S/05",
    title: "Data Recovery & Backup",
    desc: "Failed drives, deleted files, corrupted partitions. Recovery-first approach, then a bulletproof backup plan.",
    span: "md:col-span-12",
    image: null,
  },
];

export const PRICING = [
  {
    id: "diagnostic",
    name: "Diagnostic",
    price: "$49",
    unit: "flat",
    desc: "Full bench diagnostic with a written report. Fee credited toward any repair.",
    features: ["Same-day assessment", "Written fault report", "Credited to repair", "No fix, no fee"],
    featured: false,
  },
  {
    id: "standard-repair",
    name: "Standard Repair",
    price: "$99",
    unit: "from",
    desc: "Most common fixes: screens, batteries, malware, OS rebuilds, tune-ups.",
    features: ["Parts at cost", "90-day warranty", "Free re-check within 7 days", "Remote or on-site"],
    featured: true,
  },
  {
    id: "restoration",
    name: "Full Restoration",
    price: "$189",
    unit: "from",
    desc: "Data recovery, liquid damage, board-level work and full custom builds.",
    features: ["Priority queue", "Board-level repair", "Recovery-first protocol", "1-year workmanship cover"],
    featured: false,
  },
];

export const PROCESS = [
  {
    num: "01",
    title: "Diagnostics",
    desc: "Every machine hits the bench first. We isolate the fault — not the symptom — and send you a plain-English report with a fixed quote before any work begins.",
  },
  {
    num: "02",
    title: "Surgery",
    desc: "Anti-static bench, OEM-grade parts, documented every step. Photos of board-level work on request. Your data stays untouched and encrypted.",
  },
  {
    num: "03",
    title: "Stress Test",
    desc: "Repaired machines burn in under load for a minimum of 4 hours. Thermal, memory and storage must all pass before it leaves the bench.",
  },
  {
    num: "04",
    title: "Handover",
    desc: "You get the machine, the old parts, a warranty card and a straight answer on how to stop it happening again.",
  },
];

export const MARQUEE_ITEMS = [
  "LOGIC BOARD REPAIR",
  "DATA RECOVERY",
  "THERMAL PASTE RENEWAL",
  "VIRUS ERADICATION",
  "CUSTOM BUILDS",
  "SSD UPGRADES",
];
