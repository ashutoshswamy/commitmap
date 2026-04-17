"use client";

import Link from "next/link";
import { Icon } from "./components/Icon";
import { RepoInput } from "./components/RepoInput";
import { GitMerge } from "lucide-react";
import { motion } from "framer-motion";

export default function LandingPage() {
  return (
    <div className="relative flex-1 flex flex-col bg-background overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] [background-size:80px_80px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />
        <div className="absolute top-[-10%] left-1/2 w-[80vw] h-[70vh] rounded-full bg-[radial-gradient(circle_at_center,rgba(167,75,254,0.28),transparent_60%)] blur-3xl animate-float" />
        <div className="absolute bottom-[-30%] right-[-10%] w-[60vw] h-[60vh] rounded-full bg-[radial-gradient(circle_at_center,rgba(68,226,205,0.10),transparent_60%)] blur-3xl animate-float-delayed" />
      </div>

      <header className="relative z-10 flex items-center justify-between px-6 md:px-10 py-6">
        <Link href="/" className="flex items-center gap-3">
          <span className="relative w-8 h-8 grid place-items-center">
            <span className="absolute inset-0 bg-gradient-primary rounded-sm" />
            <GitMerge className="relative w-4 h-4 text-on-primary" strokeWidth={2.4} />
          </span>
          <div className="flex flex-col leading-none">
            <span className="font-headline font-black tracking-tighter text-base text-on-surface">
              CommitMap
            </span>
            <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-on-surface-variant/60 mt-1">
              the git visualizer
            </span>
          </div>
        </Link>
        <nav className="flex items-center gap-7 text-sm font-label">
          <Link
            href="/dashboard"
            className="ml-2 flex items-center gap-2 px-3 py-1.5 rounded-sm bg-surface-container-high hover:bg-surface-container-highest transition-colors"
          >
            Launch
            <Icon name="arrow-right" size={14} />
          </Link>
        </nav>
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 md:px-10 pt-6 pb-16">
        <div className="absolute inset-0 pointer-events-none opacity-[0.65]">
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 1200 700"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden
          >
            <defs>
              <linearGradient id="ln-main" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor="#ddb8ff" stopOpacity="0" />
                <stop offset="0.5" stopColor="#ddb8ff" stopOpacity="0.5" />
                <stop offset="1" stopColor="#ddb8ff" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M600 0 L600 700"
              stroke="url(#ln-main)"
              strokeWidth="1.5"
              fill="none"
              className="draw-path"
              style={{ ["--draw-len" as string]: 700 }}
            />
            <path
              d="M600 140 C 600 220, 440 260, 440 340 L 440 560"
              stroke="#44e2cd"
              strokeOpacity="0.45"
              strokeWidth="1.2"
              fill="none"
              className="draw-path"
              style={{ ["--draw-len" as string]: 900, animationDelay: "0.4s" }}
            />
            <path
              d="M600 260 C 600 330, 780 370, 780 460"
              stroke="#ffb2b9"
              strokeOpacity="0.4"
              strokeWidth="1.2"
              strokeDasharray="4 5"
              fill="none"
              className="draw-path"
              style={{ ["--draw-len" as string]: 700, animationDelay: "0.6s" }}
            />
            <path
              d="M600 420 C 600 480, 900 500, 960 620"
              stroke="#a74bfe"
              strokeOpacity="0.35"
              strokeWidth="1.2"
              fill="none"
              className="draw-path"
              style={{ ["--draw-len" as string]: 900, animationDelay: "0.8s" }}
            />
          </svg>

          <GraphNode cx="21%" cy="20%" color="primary" delay={0.6} />
          <GraphNode cx="50%" cy="36%" color="primary" large delay={0.8} />
          <GraphNode cx="36%" cy="60%" color="secondary" delay={1.0} />
          <GraphNode cx="50%" cy="70%" color="primary" delay={1.2} />
          <GraphNode cx="65%" cy="66%" color="tertiary" delay={1.4} />
          <GraphNode cx="80%" cy="88%" color="primary" delay={1.6} />
        </div>

        <div className="relative z-10 w-full max-w-3xl flex flex-col items-center text-center">

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="font-headline font-black tracking-[-0.04em] text-5xl md:text-7xl lg:text-[88px] leading-[0.95] text-on-surface max-w-4xl"
          >
            Curate your{" "}
            <span className="text-gradient-primary italic font-serif font-light">
              code history
            </span>
            .
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.25, ease: [0.22, 1, 0.36, 1] }} 
            className="mt-7 max-w-xl text-base md:text-lg text-on-surface-variant/80 font-light leading-relaxed"
          >
            Stop reading git logs. Start reading your repository — its lineage,
            its rhythm, its architecture — as a living, high-fidelity archive.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="mt-12 w-full max-w-2xl"
          >
            <RepoInput autoFocus />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 flex items-center flex-wrap justify-center gap-x-6 gap-y-2 text-[11px] font-mono uppercase tracking-[0.18em] text-on-surface-variant/50"
          >
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary shadow-[0_0_6px_rgba(68,226,205,0.6)]" />
              public repos
            </span>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_6px_rgba(221,184,255,0.6)]" />
              instant render
            </span>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary shadow-[0_0_6px_rgba(255,178,185,0.6)]" />
              no auth required
            </span>
          </motion.div>
        </div>

        <motion.section
          id="how"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            hidden: { opacity: 0, y: 40 },
            visible: { 
              opacity: 1, 
              y: 0, 
              transition: { 
                staggerChildren: 0.1, 
                duration: 0.8, 
                ease: [0.22, 1, 0.36, 1] 
              } 
            }
          }}
          className="relative z-10 mt-24 w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-[1px] bg-outline-variant/10 rounded-sm overflow-hidden"
        >
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
              }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="relative group bg-surface/70 backdrop-blur-sm p-7 overflow-hidden transition-all duration-500 ease-ledger hover:shadow-[0_10px_40px_-10px_rgba(221,184,255,0.12)] border border-transparent hover:border-outline-variant/20 rounded-sm"
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-primary/[0.04] to-transparent pointer-events-none" />
              <div className="relative flex items-center justify-between mb-6">
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-on-surface-variant/40">
                  {String(i + 1).padStart(2, "0")} / {String(features.length).padStart(2, "0")}
                </span>
                <span className="text-on-surface-variant/50 group-hover:text-primary transition-colors">
                  <Icon name={f.icon} size={16} />
                </span>
              </div>
              <h3 className="relative font-headline font-bold text-xl text-on-surface mb-2 tracking-tight">
                {f.title}
              </h3>
              <p className="relative text-sm text-on-surface-variant/70 font-light leading-relaxed">
                {f.body}
              </p>
            </motion.div>
          ))}
        </motion.section>

        {/* Showcase Section 1: Lineage */}
        <section className="relative z-10 w-full max-w-6xl mt-32 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center px-6 md:px-10">
          <motion.div 
            initial={{ opacity: 0, x: -30 }} 
            whileInView={{ opacity: 1, x: 0 }} 
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="order-2 lg:order-1 flex flex-col items-start text-left"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary mb-6">
              <Icon name="timeline" size={14} />
              <span className="font-mono text-[10px] uppercase tracking-[0.22em]">Trace Lineage</span>
            </div>
            <h2 className="font-headline font-bold text-3xl md:text-5xl text-on-surface mb-6 tracking-tight">
              Every commit,<br/>vividly rendered.
            </h2>
            <p className="text-lg text-on-surface-variant/80 font-light leading-relaxed mb-8">
              Navigate through your repository's history with unprecedented clarity. Our custom rendering engine maps out complex branch topologies into a single, intuitive timeline. Stop guessing who touched what and when.
            </p>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            whileInView={{ opacity: 1, scale: 1 }} 
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            className="order-1 lg:order-2 w-full h-[400px] bg-surface-container-low rounded-lg border border-outline-variant/20 relative overflow-hidden flex items-center justify-center group shadow-2xl"
          >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
              {/* Abstract Mockup */}
              <div className="flex flex-col gap-4 w-3/4 max-w-md">
                 {[1,2,3].map(i => (
                    <div key={i} className="flex items-center gap-4 relative">
                      <div className="w-8 h-8 rounded-full bg-surface-container-highest border border-outline-variant/30 flex items-center justify-center z-10 transition-transform group-hover:scale-110 duration-500">
                         <div className={`w-3 h-3 rounded-full ${i===1 ? 'bg-primary' : i===2 ? 'bg-secondary' : 'bg-tertiary'} shadow-[0_0_8px_currentColor]`} />
                      </div>
                      <div className={`flex-1 bg-surface-container p-4 rounded border border-outline-variant/10 shadow-sm transition-all duration-500 ease-ledger group-hover:shadow-[0_0_20px_rgba(221,184,255,0.15)] ${i===1 ? 'group-hover:translate-x-2' : i===2 ? 'group-hover:translate-x-3 delay-75' : 'group-hover:translate-x-1 delay-150'}`}>
                         <div className="w-1/3 h-2.5 bg-on-surface-variant/40 rounded mb-2" />
                         <div className="w-2/3 h-2 bg-on-surface-variant/20 rounded" />
                      </div>
                      {/* connection line */}
                      {i !== 3 && <div className="absolute left-4 top-8 bottom-[-16px] w-[2px] bg-outline-variant/20 -translate-x-1/2" />}
                    </div>
                 ))}
              </div>
          </motion.div>
        </section>

        {/* Showcase Section 2: Architecture */}
        <section className="relative z-10 w-full max-w-6xl mt-32 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center px-6 md:px-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            whileInView={{ opacity: 1, scale: 1 }} 
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="order-1 w-full h-[400px] bg-surface-container-low rounded-lg border border-outline-variant/20 relative overflow-hidden flex items-center justify-center p-6 md:p-8 shadow-2xl group"
          >
             <div className="absolute inset-0 bg-gradient-to-bl from-secondary/5 to-transparent pointer-events-none" />
             {/* Abstract Mockup */}
             <div className="w-full h-full max-w-lg bg-surface-container rounded border border-outline-variant/10 flex overflow-hidden">
                <div className="w-1/3 border-r border-outline-variant/10 p-3 space-y-3 bg-surface/50">
                   <div className="flex items-center gap-2"><Icon name="folder" size={14} className="text-on-surface-variant/60"/><div className="w-1/2 h-2 rounded bg-on-surface-variant/40"/></div>
                   <div className="flex items-center gap-2 ml-4"><Icon name="file" size={14} className="text-on-surface-variant/60"/><div className="w-2/3 h-2 rounded bg-on-surface-variant/30"/></div>
                   <div className="flex items-center gap-2 ml-4"><Icon name="file" size={14} className="text-secondary"/><div className="w-1/2 h-2 rounded bg-secondary/80"/></div>
                   <div className="flex items-center gap-2"><Icon name="folder" size={14} className="text-on-surface-variant/60"/><div className="w-5/6 h-2 rounded bg-on-surface-variant/40"/></div>
                </div>
                <div className="flex-1 p-5 space-y-4 relative bg-surface-container">
                   <div className="w-3/4 h-3.5 rounded bg-on-surface-variant/30 mb-8"/>
                   <div className="w-full h-2 rounded bg-on-surface-variant/10"/>
                   <div className="w-5/6 h-2 rounded bg-on-surface-variant/10"/>
                   <div className="w-[#90%] h-2 rounded bg-on-surface-variant/10"/>
                   <div className="w-3/4 h-2 rounded bg-on-surface-variant/10"/>
                   <div className="absolute bottom-5 right-5 px-3 py-1.5 rounded-full bg-secondary/10 border border-secondary/20 flex items-center gap-2 group-hover:bg-secondary/20 transition-colors duration-500">
                     <span className="w-1.5 h-1.5 rounded-full bg-secondary shadow-[0_0_6px_rgba(68,226,205,0.6)] animate-pulse-ring text-secondary" />
                     <span className="w-1.5 h-1.5 absolute rounded-full bg-secondary shadow-[0_0_6px_rgba(68,226,205,0.6)]" />
                     <span className="text-[9px] font-mono text-secondary uppercase tracking-[0.2em] font-medium ml-1">Active File</span>
                   </div>
                </div>
              </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 30 }} 
            whileInView={{ opacity: 1, x: 0 }} 
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            className="order-2 flex flex-col items-start text-left"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/10 text-secondary mb-6">
              <Icon name="folder" size={14} />
              <span className="font-mono text-[10px] uppercase tracking-[0.22em]">See Architecture</span>
            </div>
            <h2 className="font-headline font-bold text-3xl md:text-5xl text-on-surface mb-6 tracking-tight">
              The codebase<br/>as a landscape.
            </h2>
            <p className="text-lg text-on-surface-variant/80 font-light leading-relaxed mb-8">
              Watch your repository structure come alive. Visualize hot paths, dead code, and complex file interdependencies all at a glance. Understand the shape of the project before writing a single line.
            </p>
          </motion.div>
        </section>

        {/* Call to Action Section */}
        <section className="relative z-10 w-full max-w-4xl mt-32 mb-8 px-6 relative overflow-hidden rounded-2xl p-10 md:p-16 text-center flex flex-col items-center">
            <div className="absolute inset-0 bg-surface-container-low opacity-80" />
            <div className="absolute inset-0 border border-outline-variant/20 rounded-2xl" />
            <div className="absolute inset-0 opacity-[0.20] bg-[radial-gradient(ellipse_at_center,rgba(221,184,255,0.8),transparent_70%)] blur-2xl animate-pulse" />
            
            <h2 className="relative font-headline font-bold text-3xl md:text-4xl text-on-surface mb-6">
              Ready to see your code differently?
            </h2>
            <p className="relative text-base md:text-lg text-on-surface-variant/80 font-light mb-10 max-w-xl">
              Drop in any repository URL and instantly visualize its entire lineage. No sign up or database required — just clean, ephemeral rendering.
            </p>
            <div className="relative w-full max-w-xl">
               <RepoInput />
            </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-outline-variant/10 py-5 px-6 md:px-10 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] font-mono text-on-surface-variant/40">
        <span className="flex items-center gap-4">
          <span className="font-semibold text-on-surface-variant/60">Developer</span>
          <a href="https://github.com/ashutoshswamy" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">GitHub</a>
          <a href="https://linkedin.com/in/ashutoshswamy" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">LinkedIn</a>
          <a href="https://twitter.com/ashutoshswamy_" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">Twitter</a>
        </span>
        <span className="flex items-center gap-3">
          <span>CommitMap</span>
        </span>
      </footer>
    </div>
  );
}

const features: {
  title: string;
  body: string;
  icon: "timeline" | "compare" | "sparkle" | "search" | "terminal" | "eye-off";
}[] = [
  {
    title: "Trace Lineage",
    body: "Every merge, rebase, cherry-pick — rendered as a single readable line. No more guessing.",
    icon: "timeline",
  },
  {
    title: "Compare Deeply",
    body: "Diff with the context you actually need. Not just red and green, but the surrounding architecture.",
    icon: "compare",
  },
  {
    title: "See Architecture",
    body: "The file tree as a landscape. Hot paths, dead code, and ownership gradients at a glance.",
    icon: "sparkle",
  },
  {
    title: "Universal Search",
    body: "Instantly find files, authors, and commit messages across the entire repo context.",
    icon: "search",
  },
  {
    title: "Zero Config",
    body: "Point it at any public repository URL or local folder, and it just works. No database setups.",
    icon: "terminal",
  },
  {
    title: "No Database Logging",
    body: "Your repository queries are routed ephemerally through our servers to GitHub. We never store, log, or persist your code history.",
    icon: "eye-off",
  },
];

function GraphNode({
  cx,
  cy,
  color,
  large,
  delay = 0,
}: {
  cx: string;
  cy: string;
  color: "primary" | "secondary" | "tertiary";
  large?: boolean;
  delay?: number;
}) {
  const cls = {
    primary: "bg-primary shadow-[0_0_18px_rgba(221,184,255,0.6)]",
    secondary: "bg-secondary shadow-[0_0_18px_rgba(68,226,205,0.6)]",
    tertiary: "bg-tertiary shadow-[0_0_18px_rgba(255,178,185,0.6)]",
  }[color];
  const size = large ? "w-4 h-4 ring-4 ring-primary/15" : "w-2.5 h-2.5";
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={`absolute flex items-center justify-center`}
      style={{
        left: cx,
        top: cy,
        x: "-50%",
        y: "-50%",
      }}
    >
      <motion.div
        animate={{ scale: [0.8, 2.2], opacity: [0.35, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: [0.25, 1, 0.5, 1], delay }}
        className={`absolute rounded-full ${cls} w-full h-full`}
      />
      <div className={`relative rounded-full ${cls} ${size}`} />
    </motion.div>
  );
}
