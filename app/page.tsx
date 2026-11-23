"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useInView,
  useScroll,
  useTransform,
} from "framer-motion";

/* ================================================================
   DATA
   ================================================================ */

interface Team {
  name: string;
  short: string;
  logo: string;
  color: string;
  glow: string;
}

const topFourTeams: Team[] = [
  {
    name: "Royal Challengers Bengaluru",
    short: "RCB",
    logo: "/logos/rcb.png",
    color: "#E4002B",
    glow: "rgba(228,0,43,0.28)",
  },
  {
    name: "Chennai Super Kings",
    short: "CSK",
    logo: "/logos/csk.svg",
    color: "#FBBF24",
    glow: "rgba(251,191,36,0.28)",
  },
  {
    name: "Mumbai Indians",
    short: "MI",
    logo: "/logos/mi.svg",
    color: "#004BA0",
    glow: "rgba(0,75,160,0.3)",
  },
  {
    name: "Punjab Kings",
    short: "PBKS",
    logo: "/logos/pbks.svg",
    color: "#DD1F2D",
    glow: "rgba(221,31,45,0.28)",
  },
];

const bottomFourTeams: Team[] = [
  {
    name: "Rajasthan Royals",
    short: "RR",
    logo: "/logos/rr.png",
    color: "#EA1A85",
    glow: "rgba(234,26,133,0.28)",
  },
  {
    name: "Sunrisers Hyderabad",
    short: "SRH",
    logo: "/logos/srh.png",
    color: "#FF822A",
    glow: "rgba(255,130,42,0.28)",
  },
  {
    name: "Kolkata Knight Riders",
    short: "KKR",
    logo: "/logos/kkr.svg",
    color: "#7C3AED",
    glow: "rgba(124,58,237,0.3)",
  },
  {
    name: "Delhi Capitals",
    short: "DC",
    logo: "/logos/dc.png",
    color: "#004C93",
    glow: "rgba(0,76,147,0.3)",
  },
];

const teams: Team[] = [...topFourTeams, ...bottomFourTeams];

/* ================================================================
   ANIMATION VARIANTS
   ================================================================ */

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      delay: i * 0.1,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: (i: number = 0) => ({
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
      delay: i * 0.08,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

/* ================================================================
   INTRO SPLASH (TOP 4 + KSL CAPTION + BOTTOM 4 -> FADE OUT)
   ================================================================ */

function IntroLogoTile({ team, index }: { team: Team; index: number }) {
  const [imgError, setImgError] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.45, y: 18 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 18,
        delay: 0.12 + index * 0.07,
      }}
      style={{
        boxShadow: `0 0 28px ${team.glow}`,
        borderColor: `${team.color}55`,
      }}
      className="flex flex-col items-center justify-center rounded-2xl border bg-[#0c0c0c]/90 px-3 py-3.5 backdrop-blur-md"
    >
      <div className="flex h-12 w-12 items-center justify-center md:h-14 md:w-14">
        {!imgError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={team.logo}
            alt={`${team.name} logo`}
            className="max-h-full max-w-full object-contain"
            onError={() => setImgError(true)}
          />
        ) : (
          <div
            className="flex h-11 w-11 items-center justify-center rounded-full border text-sm font-bold text-white"
            style={{
              borderColor: team.color,
              background: `${team.color}25`,
            }}
          >
            {team.short}
          </div>
        )}
      </div>
      <span
        className="mt-1.5 font-mono text-[11px] font-bold tracking-[0.2em]"
        style={{ color: team.color }}
      >
        {team.short}
      </span>
    </motion.div>
  );
}

function IntroSplash({ onFinish }: { onFinish: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 2900);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <motion.div
      key="ksl-intro-splash"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.03 }}
      transition={{ duration: 0.75, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden bg-[#050505] px-4"
    >
      {/* Subtle Radial Gold Glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(212,175,55,0.12)_0%,_transparent_68%)]" />

      {/* Skip Button */}
      <button
        type="button"
        onClick={onFinish}
        className="absolute right-6 top-6 z-10 rounded-full border border-[#D4AF37]/30 bg-black/50 px-4 py-1.5 font-mono text-[11px] tracking-[0.2em] text-zinc-400 uppercase transition hover:border-[#D4AF37] hover:text-[#D4AF37]"
      >
        Skip
      </button>

      <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center gap-7 md:gap-9">
        {/* TOP FOUR TEAMS */}
        <div className="grid w-full max-w-2xl grid-cols-4 gap-3 sm:gap-5">
          {topFourTeams.map((team, idx) => (
            <IntroLogoTile key={team.short} team={team} index={idx} />
          ))}
        </div>

        {/* CENTER KSL CAPTION */}
        <motion.div
          initial={{ opacity: 0, scale: 0.65 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 220,
            damping: 16,
            delay: 0.45,
          }}
          className="text-center"
        >
          <p className="font-mono text-[10px] tracking-[0.38em] text-[#D4AF37]/80 uppercase md:text-xs">
            8 Franchises · 1 Stage
          </p>
          <h2 className="mt-1 font-[family-name:var(--font-oswald)] text-5xl font-bold tracking-[0.18em] text-gradient-gold text-glow-gold uppercase md:text-7xl">
            KSL
          </h2>
          <p className="mt-1 font-mono text-xs tracking-[0.28em] text-zinc-300 uppercase md:text-sm">
            Cricket Auction · 2026
          </p>
        </motion.div>

        {/* BOTTOM FOUR TEAMS */}
        <div className="grid w-full max-w-2xl grid-cols-4 gap-3 sm:gap-5">
          {bottomFourTeams.map((team, idx) => (
            <IntroLogoTile key={team.short} team={team} index={idx + 4} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ================================================================
   UTILITY COMPONENTS
   ================================================================ */

function Section({
  children,
  className = "",
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`relative ${className}`}>
      {children}
    </section>
  );
}

function SectionTitle({
  label,
  title,
  subtitle,
}: {
  label: string;
  title: string;
  subtitle?: string;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: true,
    margin: "-100px",
  });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={staggerContainer}
      className="text-center mb-16 md:mb-20"
    >
      <motion.p
        variants={fadeUp}
        className="text-xs md:text-sm font-mono tracking-[0.3em] text-[#D4AF37] mb-4 uppercase"
      >
        {label}
      </motion.p>

      <motion.h2
        variants={fadeUp}
        className="font-[family-name:var(--font-oswald)] text-4xl md:text-6xl lg:text-7xl font-bold uppercase tracking-tight text-white"
      >
        {title}
      </motion.h2>

      {subtitle && (
        <motion.p
          variants={fadeUp}
          className="mt-4 text-base md:text-lg text-zinc-500 max-w-xl mx-auto"
        >
          {subtitle}
        </motion.p>
      )}

      <motion.div variants={fadeUp} className="mt-6">
        <div className="gold-line-short" />
      </motion.div>
    </motion.div>
  );
}

/* ================================================================
   PARTICLES
   ================================================================ */

const PARTICLE_DATA = [
  { left: 12, delay: 0.2, dur: 7.1, size: 1.8 },
  { left: 85, delay: 2.4, dur: 9.3, size: 1.2 },
  { left: 37, delay: 5.1, dur: 6.5, size: 2.1 },
  { left: 63, delay: 1.0, dur: 8.8, size: 1.5 },
  { left: 91, delay: 3.7, dur: 7.9, size: 2.5 },
  { left: 8, delay: 6.3, dur: 10.2, size: 1.1 },
  { left: 55, delay: 0.8, dur: 6.1, size: 2.8 },
  { left: 29, delay: 4.5, dur: 11.5, size: 1.4 },
  { left: 73, delay: 7.2, dur: 7.4, size: 2.2 },
  { left: 46, delay: 1.6, dur: 8.1, size: 1.7 },
  { left: 18, delay: 3.3, dur: 9.8, size: 2.0 },
  { left: 96, delay: 5.8, dur: 6.7, size: 1.3 },
  { left: 42, delay: 2.1, dur: 10.9, size: 2.6 },
  { left: 67, delay: 0.5, dur: 7.6, size: 1.9 },
  { left: 3, delay: 4.0, dur: 8.5, size: 2.3 },
  { left: 78, delay: 6.9, dur: 6.3, size: 1.6 },
  { left: 51, delay: 1.4, dur: 9.1, size: 2.4 },
  { left: 24, delay: 3.9, dur: 7.2, size: 1.0 },
  { left: 88, delay: 5.5, dur: 10.4, size: 2.9 },
  { left: 33, delay: 7.8, dur: 6.9, size: 1.8 },
  { left: 60, delay: 0.1, dur: 8.3, size: 2.1 },
  { left: 15, delay: 2.8, dur: 11.1, size: 1.5 },
  { left: 82, delay: 4.3, dur: 7.7, size: 2.7 },
  { left: 48, delay: 6.6, dur: 9.5, size: 1.2 },
  { left: 70, delay: 1.9, dur: 6.4, size: 2.0 },
  { left: 5, delay: 3.5, dur: 8.9, size: 1.4 },
  { left: 39, delay: 5.2, dur: 10.7, size: 2.5 },
  { left: 93, delay: 7.5, dur: 7.0, size: 1.7 },
  { left: 57, delay: 0.6, dur: 9.6, size: 2.3 },
  { left: 21, delay: 2.0, dur: 6.8, size: 1.1 },
];

function Particles() {
  return (
    <div className="hero-particles">
      {PARTICLE_DATA.map((p, i) => (
        <div
          key={i}
          className="particle"
          style={{
            left: `${p.left}%`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.dur}s`,
            width: `${p.size}px`,
            height: `${p.size}px`,
          }}
        />
      ))}
    </div>
  );
}

/* ================================================================
   HERO
   ================================================================ */

function Hero({ onReplayIntro }: { onReplayIntro: () => void }) {
  const ref = useRef(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 1], [0, 150]);

  return (
    <Section className="min-h-screen flex items-center justify-center animated-gradient overflow-hidden">
      <Particles />

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(212,175,55,0.08)_0%,_transparent_70%)]" />

      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent" />

      <motion.div
        ref={ref}
        style={{ opacity, y }}
        className="relative z-10 text-center px-6 max-w-5xl mx-auto"
      >
        {/* KSL Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.8,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-3 border border-[#D4AF37]/30 rounded-full px-6 py-2 bg-[#D4AF37]/5 backdrop-blur-sm">
            <div className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />

            <span className="text-xs md:text-sm font-mono tracking-[0.25em] text-[#D4AF37] uppercase">
              The Auction Experience · 2026
            </span>

            <div className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
          </div>
        </motion.div>

        {/* Main Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 1,
            delay: 0.3,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
        >
          <h1 className="font-[family-name:var(--font-oswald)] text-7xl md:text-9xl lg:text-[10rem] font-bold tracking-tighter leading-[0.85]">
            <span className="text-gradient-gold text-glow-gold">
              KSL
            </span>
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <p className="font-[family-name:var(--font-oswald)] text-2xl md:text-4xl lg:text-5xl font-light tracking-[0.15em] text-white/90 mt-2 uppercase">
            Cricket Auction
          </p>
        </motion.div>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1, delay: 0.9 }}
          className="my-8"
        >
          <div className="gold-line max-w-md mx-auto" />
        </motion.div>

        {/* School name */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.1 }}
        >
          <p className="text-sm md:text-base font-mono tracking-[0.2em] text-zinc-400 uppercase">
            St. John&apos;s English Medium School
          </p>

          <p className="text-xs md:text-sm text-zinc-600 mt-1 tracking-wider">
            Subedarpet, Nellore, Andhra Pradesh — 524001
          </p>
        </motion.div>

        {/* Tagline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.4 }}
          className="mt-12"
        >
          <h2 className="font-[family-name:var(--font-oswald)] text-3xl md:text-5xl lg:text-6xl font-bold uppercase tracking-tight">
            <span className="text-gradient-white">The Game</span>
            <br />
            <span className="text-gradient-white">Begins Here.</span>
          </h2>

          <p className="mt-4 text-sm md:text-base text-zinc-500 max-w-lg mx-auto">
            Eight franchises. One stage. A battle for the ultimate squad.
          </p>

          <button
            type="button"
            onClick={onReplayIntro}
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/25 bg-white/[0.02] px-4 py-1.5 font-mono text-[11px] tracking-[0.2em] text-zinc-400 uppercase transition hover:border-[#D4AF37]/60 hover:text-[#D4AF37]"
          >
            <span>↻</span> Replay Intro
          </button>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="mt-12 scroll-indicator"
        >
          <div className="flex flex-col items-center gap-2">
            <span className="text-[10px] font-mono tracking-[0.3em] text-zinc-600 uppercase">
              Scroll
            </span>

            <svg
              className="w-5 h-5 text-[#D4AF37]/60"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </div>
        </motion.div>
      </motion.div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#050505] to-transparent" />
    </Section>
  );
}

/* ================================================================
   TEAM CARD
   ================================================================ */

function TeamCard({
  team,
  index,
}: {
  team: Team;
  index: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: true,
    margin: "-50px",
  });

  const [imgError, setImgError] = useState(false);

  return (
    <motion.div
      ref={ref}
      custom={index}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={scaleIn}
      className="team-card p-6 md:p-8 text-center group"
      style={
        {
          "--team-color": team.color,
          "--team-glow": team.glow,
        } as React.CSSProperties
      }
    >
      {/* Team color accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] opacity-60 group-hover:opacity-100 transition-opacity"
        style={{ background: team.color }}
      />

      {/* Logo */}
      <div className="team-logo-container mb-5">
        {!imgError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={team.logo}
            alt={`${team.name} logo`}
            className="max-w-[90px] max-h-[90px] object-contain"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white border-2"
            style={{
              borderColor: team.color,
              background: `${team.color}20`,
              boxShadow: `0 0 30px ${team.glow}`,
            }}
          >
            {team.short}
          </div>
        )}
      </div>

      {/* Team Name */}
      <h3 className="font-[family-name:var(--font-oswald)] text-base md:text-lg font-semibold text-white uppercase tracking-wide mb-1">
        {team.name}
      </h3>

      <p
        className="text-xs font-mono tracking-[0.2em] transition-colors"
        style={{ color: team.color }}
      >
        {team.short}
      </p>

      {/* Bottom glow */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-24 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none blur-3xl"
        style={{ background: team.glow }}
      />
    </motion.div>
  );
}

/* ================================================================
   TEAMS SECTION
   ================================================================ */

function TeamsSection() {
  const countRef = useRef(null);
  const isCountInView = useInView(countRef, { once: true });

  return (
    <Section
      id="teams"
      className="py-24 md:py-32 bg-[#050505] relative"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(212,175,55,0.03)_0%,_transparent_60%)]" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Counter */}
        <motion.div
          ref={countRef}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={isCountInView ? { opacity: 1, scale: 1 } : {}}
          transition={{
            duration: 0.8,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          className="text-center mb-6"
        >
          <span className="font-[family-name:var(--font-oswald)] text-8xl md:text-9xl font-bold text-gradient-gold text-glow-gold">
            08
          </span>

          <p className="text-sm font-mono tracking-[0.3em] text-zinc-500 uppercase mt-2">
            Teams
          </p>
        </motion.div>

        <SectionTitle
          label="The Franchises"
          title="Meet The Teams"
          subtitle="Eight powerhouses ready to build their dream squads at the KSL Auction 2026"
        />

        {/* Team Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {teams.map((team, i) => (
            <TeamCard
              key={team.short}
              team={team}
              index={i}
            />
          ))}
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0">
        <div className="gold-line" />
      </div>
    </Section>
  );
}

/* ================================================================
   DRAGGABLE FLOATING MENU
   ================================================================ */

function FloatingMenu() {
  return (
    <motion.div
      drag
      dragMomentum={false}
      dragElastic={0.05}
      whileDrag={{
        scale: 1.03,
        cursor: "grabbing",
      }}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 1 }}
      className="fixed bottom-8 right-8 z-[100] w-[260px] max-w-[calc(100vw-32px)] rounded-2xl border border-[#D4AF37]/30 bg-[#090909]/95 p-5 shadow-[0_0_35px_rgba(212,175,55,0.15)] backdrop-blur-xl cursor-grab select-none"
    >
      {/* Menu Header */}
      <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
        <div>
          <p className="font-mono text-xs tracking-[0.25em] text-[#D4AF37] uppercase">
            KSL Menu
          </p>
          <p className="mt-1 text-[9px] tracking-widest text-zinc-600 uppercase">
            Navigation Panel
          </p>
        </div>

        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#D4AF37]/20 bg-[#D4AF37]/5 text-[#D4AF37]">
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 6h.01M8 12h.01M8 18h.01M16 6h.01M16 12h.01M16 18h.01"
            />
          </svg>
        </div>
      </div>

      {/* Menu Options */}
      <div className="space-y-3">
        <a
          href="/registers"
          onPointerDown={(event) => event.stopPropagation()}
          className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-4 transition-all duration-300 hover:border-[#D4AF37]/50 hover:bg-[#D4AF37]/10"
        >
          <span className="font-mono text-xs text-[#D4AF37]/70 group-hover:text-[#D4AF37]">
            01
          </span>

          <span className="text-sm font-semibold tracking-wider text-white transition-colors group-hover:text-[#D4AF37]">
            PLAYERS LIST
          </span>

          <svg
            className="ml-auto h-4 w-4 text-zinc-600 transition-all group-hover:translate-x-1 group-hover:text-[#D4AF37]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 12h14m-7-7 7 7-7 7"
            />
          </svg>
        </a>

        <a
          href="/auction"
          onPointerDown={(event) => event.stopPropagation()}
          className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-4 transition-all duration-300 hover:border-[#D4AF37]/50 hover:bg-[#D4AF37]/10"
        >
          <span className="font-mono text-xs text-[#D4AF37]/70 group-hover:text-[#D4AF37]">
            02
          </span>

          <span className="text-sm font-semibold tracking-wider text-white transition-colors group-hover:text-[#D4AF37]">
            AUCTION LIVE ROOM
          </span>

          <svg
            className="ml-auto h-4 w-4 text-zinc-600 transition-all group-hover:translate-x-1 group-hover:text-[#D4AF37]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 12h14m-7-7 7 7-7 7"
            />
          </svg>
        </a>
      </div>

      {/* Drag Hint */}
      <div className="mt-4 flex items-center justify-center gap-2">
        <svg
          className="h-3 w-3 text-zinc-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 6h.01M8 12h.01M8 18h.01M16 6h.01M16 12h.01M16 18h.01"
          />
        </svg>

        <p className="text-[9px] font-mono tracking-[0.2em] text-zinc-600 uppercase">
          Drag to Move
        </p>
      </div>
    </motion.div>
  );
}

/* ================================================================
   VENUE SECTION (SUBTLE CORNER-FRAMED MAP)
   ================================================================ */

function VenueSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: true,
    margin: "-100px",
  });

  return (
    <Section
      id="venue"
      className="py-24 md:py-32 bg-[#050505] relative"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_rgba(212,175,55,0.04)_0%,_transparent_60%)]" />

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <SectionTitle
          label="Auction Venue"
          title="Welcome to the Big Stage"
          subtitle="Where champions are chosen and legends are born"
        />

        <motion.div
          ref={ref}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="grid md:grid-cols-2 gap-8 md:gap-12 items-center"
        >
          {/* Map with subtle corner accents */}
          <motion.div
            variants={fadeUp}
            className="group relative rounded-2xl border border-[#D4AF37]/20 bg-[#0a0a0a] p-2.5 shadow-[0_0_30px_rgba(212,175,55,0.06)] transition-all duration-300 hover:border-[#D4AF37]/45"
          >
            {/* Subtle corner brackets */}
            <span className="pointer-events-none absolute -top-1.5 -left-1.5 h-5 w-5 border-t-2 border-l-2 border-[#D4AF37]/75 rounded-tl-md" />
            <span className="pointer-events-none absolute -top-1.5 -right-1.5 h-5 w-5 border-t-2 border-r-2 border-[#D4AF37]/75 rounded-tr-md" />
            <span className="pointer-events-none absolute -bottom-1.5 -left-1.5 h-5 w-5 border-b-2 border-l-2 border-[#D4AF37]/75 rounded-bl-md" />
            <span className="pointer-events-none absolute -bottom-1.5 -right-1.5 h-5 w-5 border-b-2 border-r-2 border-[#D4AF37]/75 rounded-br-md" />

            <div className="map-container overflow-hidden rounded-xl">
              <iframe
                src="https://maps.google.com/maps?q=St+Johns+English+Medium+School+Subedarpet+Nellore+Andhra+Pradesh+524001&t=&z=15&ie=UTF8&iwloc=&output=embed"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                title="KSL Auction Venue — St. John's English Medium School"
              />
            </div>

            <div className="mt-2.5 flex items-center justify-between px-2 pb-1 text-[11px] font-mono tracking-wider text-zinc-500">
              <span>NELLORE · AP 524001</span>
              <a
                href="https://maps.google.com/?q=St+Johns+English+Medium+School+Subedarpet+Nellore+Andhra+Pradesh+524001"
                target="_blank"
                rel="noreferrer"
                className="text-[#D4AF37]/80 transition hover:text-[#D4AF37]"
              >
                Open Maps ↗
              </a>
            </div>
          </motion.div>

          {/* Venue Details */}
          <motion.div variants={fadeUp} custom={1}>
            <div className="space-y-8">
              {/* School badge */}
              <div className="inline-flex items-center gap-2 border border-[#D4AF37]/20 rounded-full px-4 py-1.5 bg-[#D4AF37]/5">
                <svg
                  className="w-4 h-4 text-[#D4AF37]"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                    clipRule="evenodd"
                  />
                </svg>

                <span className="text-xs font-mono tracking-widest text-[#D4AF37] uppercase">
                  Venue
                </span>
              </div>

              {/* School Name */}
              <div>
                <h3 className="font-[family-name:var(--font-oswald)] text-2xl md:text-3xl font-bold text-white uppercase tracking-wide">
                  St. John&apos;s English
                  <br />
                  Medium School
                </h3>

                <div className="w-12 h-0.5 bg-[#D4AF37] mt-4" />
              </div>

              {/* Address */}
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-zinc-600 mt-0.5 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 0115 0z"
                    />
                  </svg>

                  <div>
                    <p className="text-zinc-300 text-sm leading-relaxed">
                      Subedarpet, Nellore
                      <br />
                      Andhra Pradesh — 524001
                      <br />
                      India
                    </p>
                  </div>
                </div>
              </div>

              {/* Event details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
                  <p className="text-xs font-mono tracking-widest text-[#D4AF37] uppercase mb-1">
                    Event
                  </p>
                  <p className="text-white font-semibold text-sm">
                    KSL Auction
                  </p>
                </div>

                <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
                  <p className="text-xs font-mono tracking-widest text-[#D4AF37] uppercase mb-1">
                    Year
                  </p>
                  <p className="text-white font-semibold text-sm">
                    2026
                  </p>
                </div>

                <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
                  <p className="text-xs font-mono tracking-widest text-[#D4AF37] uppercase mb-1">
                    Teams
                  </p>
                  <p className="text-white font-semibold text-sm">
                    8 Franchises
                  </p>
                </div>

                <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
                  <p className="text-xs font-mono tracking-widest text-[#D4AF37] uppercase mb-1">
                    Format
                  </p>
                  <p className="text-white font-semibold text-sm">
                    Live Auction
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </Section>
  );
}

/* ================================================================
   FOOTER
   ================================================================ */

function Footer() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <footer className="relative py-20 md:py-28 bg-[#030303] overflow-hidden">
      {/* Top gold line */}
      <div className="absolute top-0 left-0 right-0">
        <div className="gold-line" />
      </div>

      {/* Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(212,175,55,0.04)_0%,_transparent_70%)]" />

      <motion.div
        ref={ref}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={staggerContainer}
        className="relative z-10 text-center px-6"
      >
        <motion.p
          variants={fadeUp}
          className="text-xs font-mono tracking-[0.3em] text-[#D4AF37]/60 uppercase mb-6"
        >
          KSL Auction 2026
        </motion.p>

        <motion.h2
          variants={fadeUp}
          className="font-[family-name:var(--font-oswald)] text-3xl md:text-5xl lg:text-6xl font-bold uppercase tracking-tight text-white max-w-4xl mx-auto leading-tight"
        >
          One Stage. Eight Teams.
          <br />
          <span className="text-gradient-gold">
            One Champion.
          </span>
        </motion.h2>

        <motion.div variants={fadeUp} className="mt-8">
          <div className="gold-line max-w-xs mx-auto" />
        </motion.div>

        <motion.div variants={fadeUp} className="mt-8 space-y-2">
          <p className="text-xs font-mono tracking-[0.2em] text-zinc-500 uppercase">
            St. John&apos;s English Medium School · Nellore
          </p>

          <p className="text-xs text-zinc-700">
            © 2026 KSL. All rights reserved.
          </p>
        </motion.div>

        {/* Decorative KSL watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
          <span className="font-[family-name:var(--font-oswald)] text-[20rem] md:text-[30rem] font-bold text-white/[0.015] leading-none">
            KSL
          </span>
        </div>
      </motion.div>
    </footer>
  );
}

/* ================================================================
   MAIN PAGE
   ================================================================ */

export default function Home() {
  const [showIntro, setShowIntro] = useState(true);

  return (
    <>
      <AnimatePresence mode="wait">
        {showIntro && <IntroSplash onFinish={() => setShowIntro(false)} />}
      </AnimatePresence>

      <main className="relative">
        <Hero onReplayIntro={() => setShowIntro(true)} />

        <TeamsSection />

        {/* Draggable Menu */}
        <FloatingMenu />

        <VenueSection />

        <Footer />
{/* Secret Admin Link — small, bottom */}
<div className="mt-8 text-center">
  <Link
    href="/admin-login"
    className="text-[10px] text-zinc-600 hover:text-zinc-400 transition"
  >
    Admin
  </Link>
</div>
      </main>
    </>
  );
}