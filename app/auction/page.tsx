"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Work_Sans } from "next/font/google";
import { AnimatePresence, motion } from "framer-motion";
import { io, Socket } from "socket.io-client";

const workSans = Work_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

type PlayerRole = "Batsman" | "Bowler" | "All rounder" | "Wicketkeeper";
type AuctionStatus = "IN AUCTION" | "SOLD" | "UNSOLD" | "UPCOMING";

interface Team {
  id: string;
  name: string;
  short: string;
  logo: string;
  color: string;
  textOnColor: "#FFFFFF" | "#09090B";
  totalCoins: number;
  captainCoins: number;
  initialAuctionPurse: number;
  remainingPurse: number;
  boughtCount: number;
  targetSquadSize: number;
}

interface AuctionPlayer {
  id: number;
  name: string;
  age: string;
  role: PlayerRole;
  basePrice: number;
  status: AuctionStatus;
  soldToTeamId?: string;
  soldPrice?: number;
  soldOrder?: number;
}

interface SoldBannerPayload {
  id: number;
  playerName: string;
  team: Team;
  amount: number;
}

const ROUND_SECONDS = 15;
const BASE_PRICE = 10;

function useAuctionSounds(muted: boolean) {
  const ctxRef = useRef<AudioContext | null>(null);

  const getContext = useCallback(() => {
    if (typeof window === "undefined") return null;
    if (!ctxRef.current) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) ctxRef.current = new AudioCtx();
    }
    if (ctxRef.current && ctxRef.current.state === "suspended") {
      ctxRef.current.resume().catch(() => {});
    }
    return ctxRef.current;
  }, []);

  const playSoldSound = useCallback(() => {
    if (muted) return;
    const ctx = getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      gain.gain.setValueAtTime(0.001, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.18, now + idx * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0008, now + idx * 0.08 + 0.45);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.48);
    });
  }, [getContext, muted]);

  const playUnsoldSound = useCallback(() => {
    if (muted) return;
    const ctx = getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    [311.13, 233.08].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(freq, now + idx * 0.16);
      gain.gain.setValueAtTime(0.001, now + idx * 0.16);
      gain.gain.exponentialRampToValueAtTime(0.11, now + idx * 0.16 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0008, now + idx * 0.16 + 0.32);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.16);
      osc.stop(now + idx * 0.16 + 0.35);
    });
  }, [getContext, muted]);

  return { playSoldSound, playUnsoldSound };
}

function RobotAvatar({ seed, size = 76 }: { seed: string; size?: number }) {
  const hash = useMemo(() => {
    let h = 0;
    for (let i = 0; i < seed.length; i++) h = seed.charCodeAt(i) + ((h << 5) - h);
    return Math.abs(h);
  }, [seed]);
  const antennaType = hash % 3;
  const mouthType = (hash >> 2) % 3;
  return (
    <div style={{ width: size, height: size }} className="relative shrink-0 overflow-hidden rounded-full border border-white/20 bg-[#121212]">
      <svg viewBox="0 0 100 100" className="h-full w-full">
        <circle cx="50" cy="50" r="50" fill="#161616" />
        {antennaType === 0 && (<><line x1="50" y1="12" x2="50" y2="25" stroke="#E5C158" strokeWidth="4" strokeLinecap="round" /><circle cx="50" cy="11" r="5" fill="#FACC15" /></>)}
        {antennaType === 1 && (<><line x1="36" y1="15" x2="41" y2="26" stroke="#E5C158" strokeWidth="3.5" strokeLinecap="round" /><line x1="64" y1="15" x2="59" y2="26" stroke="#E5C158" strokeWidth="3.5" strokeLinecap="round" /><circle cx="35" cy="14" r="4" fill="#D4AF37" /><circle cx="65" cy="14" r="4" fill="#D4AF37" /></>)}
        {antennaType === 2 && <path d="M42 25 L50 12 L58 25 Z" fill="#D4AF37" />}
        <rect x="15" y="42" width="8" height="18" rx="4" fill="#D4AF37" />
        <rect x="77" y="42" width="8" height="18" rx="4" fill="#D4AF37" />
        <path d="M24 94 C24 79, 76 79, 76 94 Z" fill="#E5C158" opacity="0.9" />
        <rect x="42" y="74" width="16" height="9" rx="3" fill="#D4AF37" />
        <rect x="23" y="25" width="54" height="50" rx="16" fill="#E5C158" />
        <rect x="30" y="36" width="40" height="20" rx="9" fill="#0B0B0B" />
        <circle cx="41" cy="46" r="5" fill="#38BDF8" />
        <circle cx="59" cy="46" r="5" fill="#38BDF8" />
        <circle cx="42.5" cy="44.5" r="1.6" fill="#FFFFFF" />
        <circle cx="60.5" cy="44.5" r="1.6" fill="#FFFFFF" />
        {mouthType === 0 && (<path d="M41 63 Q50 70 59 63" fill="none" stroke="#0B0B0B" strokeWidth="3.2" strokeLinecap="round" />)}
        {mouthType === 1 && <rect x="39" y="61" width="22" height="6" rx="3" fill="#0B0B0B" />}
        {mouthType === 2 && (<path d="M40 62 L45 66 L50 62 L55 66 L60 62" fill="none" stroke="#0B0B0B" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />)}
      </svg>
    </div>
  );
}

function TeamLogoBadge({ team, size = 44 }: { team: Team; size?: number }) {
  const [imgError, setImgError] = useState(false);
  return (
    <div style={{ width: size, height: size }} className="flex shrink-0 items-center justify-center overflow-hidden rounded-lg bg-black/60 p-1">
      {!imgError ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={team.logo} alt={`${team.name} logo`} className="h-full w-full object-contain" onError={() => setImgError(true)} />
      ) : (
        <span className="text-xs font-bold tracking-wider text-white">{team.short}</span>
      )}
    </div>
  );
}

function CenterSoldOverlay({ banner, onDone }: { banner: SoldBannerPayload | null; onDone: () => void }) {
  useEffect(() => {
    if (!banner) return;
    const timer = setTimeout(() => onDone(), 3000);
    return () => clearTimeout(timer);
  }, [banner, onDone]);

  return (
    <AnimatePresence>
      {banner && (
        <motion.div key={banner.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.45 }} className="pointer-events-none fixed inset-0 z-[150] flex items-center justify-center bg-black/65 px-4">
          <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.94 }} transition={{ duration: 0.35 }} className="flex flex-col items-center text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-[#111111] p-2.5 md:h-28 md:w-28">
              <TeamLogoBadge team={banner.team} size={88} />
            </div>
            <p className="mt-4 text-sm font-bold tracking-[0.2em] text-white uppercase md:text-base">SOLD TO {banner.team.short}</p>
            <p className="mt-1 text-base font-medium text-zinc-200">{banner.playerName} · {banner.team.name}</p>
            <p className="mt-2 text-2xl font-bold text-[#FACC15] md:text-3xl">₹{banner.amount}</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function TeamSquadsPanel({
  teams,
  players,
  isOpen,
  onClose,
}: {
  teams: Team[];
  players: AuctionPlayer[];
  isOpen: boolean;
  onClose: () => void;
}) {
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);

  const soldPlayersByTeam = useMemo(() => {
    const map = new Map<string, AuctionPlayer[]>();
    teams.forEach((t) => map.set(t.id, []));
    players
      .filter((p) => p.status === "SOLD" && p.soldToTeamId)
      .sort((a, b) => (b.soldOrder ?? 0) - (a.soldOrder ?? 0))
      .forEach((p) => {
        const arr = map.get(p.soldToTeamId!);
        if (arr) arr.push(p);
      });
    return map;
  }, [teams, players]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[140] bg-black/50"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 z-[145] h-full w-full max-w-md overflow-y-auto border-l border-white/10 bg-[#0a0a0a] p-5 shadow-2xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white uppercase">Team Squads</h2>
              <button type="button" onClick={onClose} className="rounded-lg border border-white/15 bg-[#141414] px-3 py-1 text-sm text-zinc-300">
                Close
              </button>
            </div>

            <div className="space-y-2">
              {teams.map((team) => {
                const squad = soldPlayersByTeam.get(team.id) ?? [];
                const isExpanded = expandedTeam === team.id;
                return (
                  <div key={team.id} className="overflow-hidden rounded-xl border border-white/10 bg-[#0c0c0c]">
                    <button
                      type="button"
                      onClick={() => setExpandedTeam(isExpanded ? null : team.id)}
                      className="flex w-full items-center justify-between gap-3 p-3 text-left"
                      style={{ backgroundColor: isExpanded ? team.color : "#0c0c0c", color: isExpanded ? team.textOnColor : "#FFFFFF" }}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <TeamLogoBadge team={team} size={36} />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold uppercase">{team.short}</p>
                          <p className={`truncate text-xs ${isExpanded ? "opacity-90" : "text-zinc-500"}`}>
                            {squad.length} players · ₹{team.remainingPurse} left
                          </p>
                        </div>
                      </div>
                      <span className={`text-lg ${isExpanded ? "" : "text-zinc-400"}`}>{isExpanded ? "▲" : "▼"}</span>
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="space-y-1.5 p-3">
                            {squad.length === 0 ? (
                              <p className="text-xs text-zinc-500">No players sold yet.</p>
                            ) : (
                              squad.map((p) => (
                                <div key={p.id} className="flex items-center justify-between rounded-lg border border-white/10 bg-[#121212] px-3 py-2 text-sm">
                                  <div className="min-w-0">
                                    <p className="truncate font-semibold text-white">{p.name}</p>
                                    <p className="text-xs text-zinc-400">{p.role}</p>
                                  </div>
                                  <span className="font-semibold text-[#FACC15]">₹{p.soldPrice}</span>
                                </div>
                              ))
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default function AuctionViewerPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const teamsRef = useRef<Team[]>([]);

  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<AuctionPlayer[]>([]);
  const [leadingTeamId, setLeadingTeamId] = useState<string>("rcb");
  const [currentBid, setCurrentBid] = useState<number>(BASE_PRICE);
  const [secondsLeft, setSecondsLeft] = useState<number>(ROUND_SECONDS);
  const [timerPaused, setTimerPaused] = useState<boolean>(false);
  const [muted, setMuted] = useState<boolean>(false);
  const [projectorMode, setProjectorMode] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [soldBanner, setSoldBanner] = useState<SoldBannerPayload | null>(null);
  const [statusNote, setStatusNote] = useState<string>("Connecting to auction...");
  const [connectedUsers, setConnectedUsers] = useState<number>(0);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [bidCount, setBidCount] = useState<number>(0);
  const [nextIncrement, setNextIncrement] = useState<number>(10);
  const [showSquads, setShowSquads] = useState<boolean>(false);
  const [timerSeconds, setTimerSeconds] = useState<number>(15);

  const { playSoldSound, playUnsoldSound } = useAuctionSounds(muted);

  useEffect(() => {
    teamsRef.current = teams;
  }, [teams]);

  useEffect(() => {
    const socket = io("http://localhost:4000", {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("✅ Connected to backend");
      setIsConnected(true);
      setStatusNote("Connected · Waiting for auction...");
    });

    socket.on("disconnect", () => {
      console.log("❌ Disconnected from backend");
      setIsConnected(false);
      setStatusNote("Disconnected · Reconnecting...");
    });

    socket.on("auction:state", (state: any) => {
      setCurrentBid(state.currentBid);
      setLeadingTeamId(state.leadingTeamId);
      setSecondsLeft(state.secondsLeft);
      setTimerPaused(state.timerPaused);
      setStatusNote(state.statusNote);
      setTeams(state.teams);
      setPlayers(state.players);
      setBidCount(state.bidCount ?? 0);
      setNextIncrement(state.nextIncrement ?? 10);
      setTimerSeconds(state.timerSeconds ?? 15);
    });

    socket.on("auction:update", (state: any) => {
      setCurrentBid(state.currentBid);
      setLeadingTeamId(state.leadingTeamId);
      setSecondsLeft(state.secondsLeft);
      setTimerPaused(state.timerPaused);
      setStatusNote(state.statusNote);
      setTeams(state.teams);
      setPlayers(state.players);
      setBidCount(state.bidCount ?? 0);
      setNextIncrement(state.nextIncrement ?? 10);
      setTimerSeconds(state.timerSeconds ?? 15);
    });

    socket.on("timer:update", ({ secondsLeft }: { secondsLeft: number }) => setSecondsLeft(secondsLeft));
    socket.on("timer:toggle", ({ paused }: { paused: boolean }) => setTimerPaused(paused));
    socket.on("timer:reset", ({ seconds }: { seconds: number }) => setSecondsLeft(seconds));

    socket.on("player:sold", (data: { playerName: string; teamShort: string; amount: number; teamId: string }) => {
      playSoldSound();
      const team = teamsRef.current.find((t) => t.id === data.teamId);
      if (team) {
        setSoldBanner({
          id: Date.now(),
          playerName: data.playerName,
          team,
          amount: data.amount,
        });
      }
    });

    socket.on("player:unsold", () => playUnsoldSound());
    socket.on("users:count", (count: number) => setConnectedUsers(count));

    return () => { socket.disconnect(); };
  }, [playSoldSound, playUnsoldSound]);

  const activePlayer = useMemo(
    () => players.find((p) => p.status === "IN AUCTION") ?? players.find((p) => p.status === "UPCOMING"),
    [players]
  );

  const stats = useMemo(() => {
    const totalRegistered = players.length;
    const soldPlayers = players.filter((p) => p.status === "SOLD");
    const unsoldPlayers = players.filter((p) => p.status === "UNSOLD");
    const remainingPlayers = players.filter((p) => p.status === "UPCOMING" || p.status === "IN AUCTION");
    const totalSpending = soldPlayers.reduce((sum, p) => sum + (p.soldPrice ?? 0), 0);
    return { totalRegistered, soldCount: soldPlayers.length, unsoldCount: unsoldPlayers.length, remainingCount: remainingPlayers.length, totalSpending };
  }, [players]);

  const recentlySold = useMemo(() => players.filter((p) => p.status === "SOLD").sort((a, b) => (b.soldOrder ?? 0) - (a.soldOrder ?? 0)), [players]);
  const upcomingPlayers = useMemo(() => players.filter((p) => p.status === "UPCOMING" && p.id !== activePlayer?.id), [players, activePlayer]);
  const teamMap = useMemo(() => {
    const map = new Map<string, Team>();
    teams.forEach((t) => map.set(t.id, t));
    return map;
  }, [teams]);

  const leadingTeam = teamMap.get(leadingTeamId) ?? teams[0] ?? { id: "rcb", name: "Royal Challengers Bengaluru", short: "RCB", logo: "/logos/rcb.png", color: "#DC2626", textOnColor: "#FFFFFF" as const, totalCoins: 2000, captainCoins: 200, initialAuctionPurse: 1800, remainingPurse: 1800, boughtCount: 0, targetSquadSize: 4 };
  const timerPercent = Math.max(0, Math.min(100, (secondsLeft / timerSeconds) * 100));

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await (containerRef.current ?? document.documentElement).requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch {
      setIsFullscreen(Boolean(document.fullscreenElement));
    }
  };

  return (
    <div ref={containerRef} className={`${workSans.className} min-h-screen w-full overflow-x-hidden bg-[#050505] text-base font-normal text-white`}>
      <CenterSoldOverlay banner={soldBanner} onDone={() => setSoldBanner(null)} />
      <TeamSquadsPanel teams={teams} players={players} isOpen={showSquads} onClose={() => setShowSquads(false)} />

      {!projectorMode && (
        <header className="w-full border-b border-white/10 bg-[#080808]">
          <div className="flex w-full flex-wrap items-center justify-between gap-3 px-4 py-3.5 md:px-6">
            <div className="flex flex-wrap items-center gap-2">
              <Link href="/" className="rounded-lg border border-white/15 bg-[#111111] px-3 py-1.5 text-sm font-medium text-[#FACC15] transition hover:border-white/30">← Home</Link>
              <Link href="/registers" className="rounded-lg border border-white/15 bg-[#111111] px-3 py-1.5 text-sm font-medium text-zinc-200 transition hover:border-white/30">Players</Link>
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${isConnected ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300" : "border-rose-500/40 bg-rose-500/10 text-rose-300"}`}>
                <span className={`h-2 w-2 rounded-full ${isConnected ? "bg-emerald-400" : "bg-rose-400"}`} />
                {isConnected ? `LIVE · ${connectedUsers} watching` : "OFFLINE"}
              </span>
              <button
                type="button"
                onClick={() => setShowSquads(true)}
                className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/40 bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-300 transition hover:bg-sky-500/20"
              >
                📋 Team Squads
              </button>
            </div>

            <div className="text-center">
              <h1 className="text-lg font-bold tracking-wide text-white uppercase md:text-xl">KSL Auction Live Room</h1>
              <p className="text-xs text-zinc-400">St. John&apos;s English Medium School · Nellore</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={() => setMuted((m) => !m)} className="rounded-lg border border-white/15 bg-[#111111] px-3 py-1.5 text-sm font-medium text-zinc-200 transition hover:border-white/30">{muted ? "Sound Off" : "Sound On"}</button>
              <button type="button" onClick={() => setProjectorMode(true)} className="rounded-lg border border-white/15 bg-[#141414] px-3 py-1.5 text-sm font-semibold text-[#FACC15] transition hover:border-white/30">Projector 16:9</button>
              <button type="button" onClick={toggleFullscreen} className="rounded-lg border border-white/15 bg-[#111111] px-3 py-1.5 text-sm font-medium text-zinc-200 transition hover:border-white/30">{isFullscreen ? "Exit Full" : "Fullscreen"}</button>
              <Link href="/admin" className="rounded-lg border border-[#FACC15]/40 bg-[#FACC15]/10 px-3 py-1.5 text-sm font-semibold text-[#FACC15] transition hover:bg-[#FACC15]/20">Admin Login</Link>
            </div>
          </div>
        </header>
      )}

      {!projectorMode && (
        <div className="w-full border-b border-white/10 bg-[#0b0b0b] px-4 py-2 text-xs text-zinc-300 md:px-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-medium text-[#FACC15]">{statusNote}</span>
            <span className="text-zinc-400">Base ₹10 · Purse: 2,000 Total · 200 Captain · 1,800 Auction</span>
          </div>
        </div>
      )}

      {projectorMode && (
        <div className="flex w-full items-center justify-between border-b border-white/10 bg-[#080808] px-6 py-3">
          <span className="text-sm font-semibold tracking-wider text-[#FACC15] uppercase">KSL Live Projector Display</span>
          <div className="flex items-center gap-2">
            <button type="button" onClick={toggleFullscreen} className="rounded-lg border border-white/15 bg-[#111111] px-3 py-1.5 text-sm text-zinc-200">{isFullscreen ? "Exit Full" : "Fullscreen"}</button>
            <button type="button" onClick={() => setProjectorMode(false)} className="rounded-lg border border-white/15 bg-[#141414] px-3 py-1.5 text-sm font-medium text-[#FACC15]">Exit Projector</button>
          </div>
        </div>
      )}

      <main className="w-full px-4 py-5 md:px-6">
        <section className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <div className="rounded-xl border border-white/10 bg-[#0d0d0d] p-4">
            <p className="text-xs font-medium text-zinc-400 uppercase">Total Players</p>
            <p className="mt-1 text-2xl font-bold text-[#FACC15]">{stats.totalRegistered}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-[#0d0d0d] p-4">
            <p className="text-xs font-medium text-zinc-400 uppercase">Sold</p>
            <p className="mt-1 text-2xl font-bold text-emerald-400">{stats.soldCount}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-[#0d0d0d] p-4">
            <p className="text-xs font-medium text-zinc-400 uppercase">Unsold</p>
            <p className="mt-1 text-2xl font-bold text-rose-400">{stats.unsoldCount}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-[#0d0d0d] p-4">
            <p className="text-xs font-medium text-zinc-400 uppercase">Remaining</p>
            <p className="mt-1 text-2xl font-bold text-sky-400">{stats.remainingCount}</p>
          </div>
          <div className="col-span-2 rounded-xl border border-white/10 bg-[#0d0d0d] p-4 sm:col-span-1">
            <p className="text-xs font-medium text-zinc-400 uppercase">Total Spent</p>
            <p className="mt-1 text-2xl font-bold text-white">₹{stats.totalSpending}</p>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          <section className="rounded-xl border border-white/15 bg-[#0c0c0c] p-5 lg:col-span-8">
            {activePlayer ? (
              <>
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-[#FACC15] px-2.5 py-1 text-xs font-bold text-black">#{String(activePlayer.id).padStart(2, "0")}</span>
                    <span className="text-sm font-medium text-zinc-300">{activePlayer.role}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-lg border px-3 py-1 text-sm font-bold ${secondsLeft <= 4 ? "border-rose-500 bg-rose-500/20 text-rose-300" : "border-white/20 bg-[#141414] text-[#FACC15]"}`}>{secondsLeft}s {timerPaused ? "Paused" : "Remaining"}</span>
                  </div>
                </div>

                <div className="mb-5 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                  <div className="h-full transition-all duration-500" style={{ width: `${timerPercent}%`, backgroundColor: secondsLeft <= 4 ? "#F43F5E" : "#FACC15" }} />
                </div>

                <div className="flex flex-col items-center justify-between gap-5 sm:flex-row">
                  <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
                    <RobotAvatar seed={`${activePlayer.name}-${activePlayer.id}`} size={84} />
                    <div>
                      <p className="text-xs font-medium text-zinc-400">Age: {activePlayer.age} · Base Price: ₹{activePlayer.basePrice}</p>
                      <h2 className="mt-0.5 text-2xl font-bold text-white md:text-3xl">{activePlayer.name}</h2>
                      <p className="mt-1 text-xs text-zinc-400">Bids: {bidCount} · Next increment: ₹{nextIncrement}</p>
                    </div>
                  </div>

                  <div style={{ backgroundColor: leadingTeam.color, color: leadingTeam.textOnColor }} className="w-full rounded-xl p-4 text-center sm:w-64 sm:text-right">
                    <p className="text-xs font-semibold uppercase opacity-85">Current Bid · {leadingTeam.short}</p>
                    <p className="mt-1 text-3xl font-bold">₹{currentBid}</p>
                    <p className="mt-1 text-xs font-medium opacity-90">Purse Left: ₹{leadingTeam.remainingPurse}</p>
                  </div>
                </div>
              </>
            ) : (
              <div className="py-10 text-center text-zinc-400">All players completed.</div>
            )}
          </section>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:col-span-4 lg:grid-cols-1">
            <section className="rounded-xl border border-white/10 bg-[#0c0c0c] p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-bold text-white uppercase">Recently Sold</h3>
                <span className="text-xs font-medium text-[#FACC15]">{recentlySold.length}</span>
              </div>
              <div className="max-h-44 space-y-2 overflow-y-auto pr-1">
                {recentlySold.map((p) => {
                  const buyer = p.soldToTeamId ? teamMap.get(p.soldToTeamId) : undefined;
                  return (
                    <div key={p.id} className="flex items-center justify-between rounded-lg border border-white/10 bg-[#121212] px-3 py-2 text-sm">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-white">{p.name}</p>
                        <p className="text-xs text-zinc-400">{buyer?.short ?? "—"} · {p.role}</p>
                      </div>
                      <span className="font-semibold text-[#FACC15]">₹{p.soldPrice}</span>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="rounded-xl border border-white/10 bg-[#0c0c0c] p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-bold text-white uppercase">Upcoming Players</h3>
                <span className="text-xs font-medium text-zinc-400">{upcomingPlayers.length}</span>
              </div>
              <div className="max-h-44 space-y-2 overflow-y-auto pr-1">
                {upcomingPlayers.slice(0, 6).map((p) => (
                  <div key={p.id} className="flex items-center justify-between rounded-lg border border-white/10 bg-[#121212] px-3 py-2 text-sm">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-white">{p.name}</p>
                      <p className="text-xs text-zinc-400">{p.role}</p>
                    </div>
                    <span className="text-xs font-semibold text-zinc-300">₹{p.basePrice}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        <section className="mt-6">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base font-bold text-white uppercase">8 Teams — Live Purse Status</h2>
            <span className="text-xs text-zinc-400">2,000 Coins − 200 Captain = 1,800 Auction Purse</span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {teams.map((team) => {
              const isLead = team.id === leadingTeamId;
              const pursePercent = Math.max(0, Math.min(100, Math.round((team.remainingPurse / team.initialAuctionPurse) * 100)));
              const slotsLeft = Math.max(0, team.targetSquadSize - team.boughtCount);
              return (
                <div key={team.id} style={{ backgroundColor: isLead ? team.color : "#090909", color: isLead ? team.textOnColor : "#FFFFFF", borderColor: isLead ? team.color : "#1F1F1F" }} className="w-full rounded-xl border p-4 text-left">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-3">
                      <TeamLogoBadge team={team} size={42} />
                      <div className="min-w-0">
                        <p className="truncate text-base font-bold uppercase">{team.short}</p>
                        <p className={`truncate text-xs ${isLead ? "opacity-90" : "text-zinc-500"}`}>{team.name}</p>
                      </div>
                    </div>
                    <span className={`rounded-md px-2 py-0.5 text-xs font-bold ${isLead ? "bg-black/25" : "bg-[#141414] text-zinc-400"}`}>{pursePercent}%</span>
                  </div>
                  <div className={`mt-3 h-1.5 w-full overflow-hidden rounded-full ${isLead ? "bg-black/25" : "bg-white/10"}`}>
                    <div className="h-full rounded-full transition-all duration-300" style={{ width: `${pursePercent}%`, backgroundColor: isLead ? team.textOnColor : "#FACC15" }} />
                  </div>
                  <div className={`mt-3 grid grid-cols-3 gap-2 border-t pt-2.5 text-xs ${isLead ? "border-black/20" : "border-white/10 text-zinc-400"}`}>
                    <div><span className="block text-[11px] opacity-75">Purse</span><span className="font-bold">₹{team.remainingPurse}</span></div>
                    <div><span className="block text-[11px] opacity-75">Bought</span><span className="font-bold">{team.boughtCount}</span></div>
                    <div><span className="block text-[11px] opacity-75">Slots Left</span><span className="font-bold">{slotsLeft}</span></div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <footer className="mt-8 border-t border-white/10 pt-4 text-center text-xs text-zinc-500">
          KSL Cricket Auction 2026 · St. John&apos;s English Medium School · Nellore
        </footer>
      </main>
    </div>
  );
}