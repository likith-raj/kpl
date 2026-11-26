"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Work_Sans } from "next/font/google";
import { AnimatePresence, motion } from "framer-motion";
import { io, Socket } from "socket.io-client";

const workSans = Work_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
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

const BASE_PRICE = 10;

function useAuctionSounds(muted: boolean) {
  const ctxRef = useRef<AudioContext | null>(null);
  const getContext = useCallback(() => {
    if (typeof window === "undefined") return null;
    if (!ctxRef.current) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) ctxRef.current = new AudioCtx();
    }
    if (ctxRef.current && ctxRef.current.state === "suspended") ctxRef.current.resume().catch(() => {});
    return ctxRef.current;
  }, []);

  const playAuctionStart = useCallback(() => {
    if (muted) return;
    const ctx = getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    
    // Teekken style auction start sound (ascending arpeggio)
    [523.25, 659.25, 783.99, 1046.5, 1318.51].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(freq, now + idx * 0.1);
      gain.gain.setValueAtTime(0.05, now + idx * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.1);
      osc.stop(now + idx * 0.1 + 0.28);
    });
  }, [getContext, muted]);

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

  const playBidTick = useCallback(() => {
    if (muted) return;
    const ctx = getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, now);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.1);
  }, [getContext, muted]);

  return { playAuctionStart, playSoldSound, playUnsoldSound, playBidTick };
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
        {antennaType === 0 && (
          <>
            <line x1="50" y1="12" x2="50" y2="25" stroke="#E5C158" strokeWidth="4" strokeLinecap="round" />
            <circle cx="50" cy="11" r="5" fill="#FACC15" />
          </>
        )}
        {antennaType === 1 && (
          <>
            <line x1="36" y1="15" x2="41" y2="26" stroke="#E5C158" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="64" y1="15" x2="59" y2="26" stroke="#E5C158" strokeWidth="3.5" strokeLinecap="round" />
            <circle cx="35" cy="14" r="4" fill="#D4AF37" />
            <circle cx="65" cy="14" r="4" fill="#D4AF37" />
          </>
        )}
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
        {mouthType === 0 && (
          <path d="M41 63 Q50 70 59 63" fill="none" stroke="#0B0B0B" strokeWidth="3.2" strokeLinecap="round" />
        )}
        {mouthType === 1 && <rect x="39" y="61" width="22" height="6" rx="3" fill="#0B0B0B" />}
        {mouthType === 2 && (
          <path d="M40 62 L45 66 L50 62 L55 66 L60 62" fill="none" stroke="#0B0B0B" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
        )}
      </svg>
    </div>
  );
}

function TeamLogoBadge({ team, size = 44 }: { team: Team; size?: number }) {
  const [imgError, setImgError] = useState(false);
  return (
    <div style={{ width: size, height: size }} className="flex shrink-0 items-center justify-center overflow-hidden rounded-lg bg-black/60 p-1">
      {!imgError ? (
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
        <motion.div
          key={banner.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45 }}
          className="pointer-events-none fixed inset-0 z-[150] flex items-center justify-center bg-black/70 px-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.94 }}
            transition={{ duration: 0.35 }}
            className="flex flex-col items-center rounded-3xl bg-[#0f0f0f] p-8 shadow-2xl ring-1 ring-[#FACC15]/30"
          >
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-[#111111] p-3">
              <TeamLogoBadge team={banner.team} size={96} />
            </div>
            <p className="mt-5 text-sm font-black tracking-[0.3em] text-[#FACC15] uppercase">SOLD TO {banner.team.short}</p>
            <p className="mt-2 text-lg font-medium text-white">{banner.playerName}</p>
            <p className="mt-1 text-sm text-zinc-400">{banner.team.name}</p>
            <p className="mt-4 text-4xl font-black text-[#FACC15]">₹{banner.amount}</p>
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[140] bg-black/60" onClick={onClose} />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 250 }}
            className="fixed right-0 top-0 z-[145] h-full w-full max-w-lg overflow-y-auto border-l border-white/10 bg-[#080808] p-6 shadow-2xl"
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Team Squads</h2>
              <button type="button" onClick={onClose} className="rounded-lg border border-white/10 bg-[#141414] px-3 py-1.5 text-sm text-zinc-300 transition hover:bg-white/5">
                Close
              </button>
            </div>

            <div className="space-y-3">
              {teams.map((team) => {
                const squad = soldPlayersByTeam.get(team.id) ?? [];
                const isExpanded = expandedTeam === team.id;
                return (
                  <div key={team.id} className="overflow-hidden rounded-2xl border border-white/10 bg-[#0f0f0f]">
                    <button
                      type="button"
                      onClick={() => setExpandedTeam(isExpanded ? null : team.id)}
                      className="flex w-full items-center justify-between gap-4 p-4 text-left transition-colors"
                      style={{ backgroundColor: isExpanded ? team.color : "#0f0f0f", color: isExpanded ? team.textOnColor : "#FFFFFF" }}
                    >
                      <div className="flex min-w-0 items-center gap-4">
                        <TeamLogoBadge team={team} size={48} />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold uppercase">{team.short}</p>
                          <p className={`truncate text-xs ${isExpanded ? "opacity-90" : "text-zinc-500"}`}>{squad.length} players · ₹{team.remainingPurse} left</p>
                        </div>
                      </div>
                      <span className={`text-xl ${isExpanded ? "" : "text-zinc-400"}`}>{isExpanded ? "▲" : "▼"}</span>
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                          <div className="space-y-2 p-4">
                            {squad.length === 0 ? (
                              <p className="text-sm text-zinc-500">No players bought yet.</p>
                            ) : (
                              squad.map((p) => (
                                <div key={p.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-[#141414] px-4 py-3">
                                  <div className="min-w-0">
                                    <p className="truncate font-bold text-white">{p.name}</p>
                                    <p className="text-xs text-zinc-400">{p.role}</p>
                                  </div>
                                  <span className="font-bold text-[#FACC15]">₹{p.soldPrice}</span>
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

/* ================================================================
   MAIN ADMIN PAGE
   ================================================================ */

export default function AdminPage() {
  const router = useRouter();
  const socketRef = useRef<Socket | null>(null);
  const teamsRef = useRef<Team[]>([]);

  const [isConnected, setIsConnected] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [connectedUsers, setConnectedUsers] = useState(0);

  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<AuctionPlayer[]>([]);
  const [leadingTeamId, setLeadingTeamId] = useState<string>("rcb");
  const [currentBid, setCurrentBid] = useState<number>(BASE_PRICE);
  const [muted, setMuted] = useState<boolean>(false);
  const [soldBanner, setSoldBanner] = useState<SoldBannerPayload | null>(null);
  const [statusNote, setStatusNote] = useState<string>("Connecting...");
  const [bidCount, setBidCount] = useState<number>(0);
  const [nextIncrement, setNextIncrement] = useState<number>(10);
  const [showSquads, setShowSquads] = useState<boolean>(false);
  const [auctionStarted, setAuctionStarted] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [threshold, setThreshold] = useState<number>(4);
  const [incrementStep, setIncrementStep] = useState<number>(10);
  const [showSettings, setShowSettings] = useState<boolean>(false);

  const { playAuctionStart, playSoldSound, playUnsoldSound, playBidTick } = useAuctionSounds(muted);

  useEffect(() => {
    teamsRef.current = teams;
  }, [teams]);

  // ============ SESSION CHECK ============
  useEffect(() => {
    const isAdminSession = sessionStorage.getItem("ksl_admin");
    const token = sessionStorage.getItem("ksl_admin_token");
    if (!isAdminSession || !token) {
      router.push("/admin-login");
    } else {
      setIsAdmin(true);
      setAdminEmail(sessionStorage.getItem("ksl_admin_email") || "");
    }
  }, [router]);

  // ============ SOCKET CONNECTION ============
  useEffect(() => {
    if (!isAdmin) return;

    const socket = io("http://localhost:4000", {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("✅ Admin connected");
      setIsConnected(true);
      setStatusNote("Connected. Admin controls active.");
    });

    socket.on("disconnect", () => {
      console.log("❌ Admin disconnected");
      setIsConnected(false);
      setStatusNote("Disconnected");
    });

    socket.on("auction:state", (state: any) => {
      setCurrentBid(state.currentBid);
      setLeadingTeamId(state.leadingTeamId);
      setStatusNote(state.statusNote);
      setTeams(state.teams);
      setPlayers(state.players);
      setBidCount(state.bidCount ?? 0);
      setNextIncrement(state.nextIncrement ?? 10);
      setAuctionStarted(state.auctionStarted ?? false);
      setSelectedCategory(state.selectedCategory ?? "All");
      setThreshold(state.threshold ?? 4);
      setIncrementStep(state.incrementStep ?? 10);
    });

    socket.on("auction:update", (state: any) => {
      setCurrentBid(state.currentBid);
      setLeadingTeamId(state.leadingTeamId);
      setStatusNote(state.statusNote);
      setTeams(state.teams);
      setPlayers(state.players);
      setBidCount(state.bidCount ?? 0);
      setNextIncrement(state.nextIncrement ?? 10);
      setAuctionStarted(state.auctionStarted ?? false);
      setSelectedCategory(state.selectedCategory ?? "All");
      setThreshold(state.threshold ?? 4);
      setIncrementStep(state.incrementStep ?? 10);
    });

    socket.on("player:sold", (data: { playerName: string; teamShort: string; amount: number; teamId: string }) => {
      playSoldSound();
      const team = teamsRef.current.find((t) => t.id === data.teamId);
      if (team) setSoldBanner({ id: Date.now(), playerName: data.playerName, team, amount: data.amount });
    });

    socket.on("player:unsold", () => playUnsoldSound());
    socket.on("users:count", (count: number) => setConnectedUsers(count));

    return () => { socket.disconnect(); };
  }, [isAdmin, playSoldSound, playUnsoldSound]);

  const activePlayer = useMemo(
    () => players.find((p) => p.status === "IN AUCTION") ?? players.find((p) => p.status === "UPCOMING"),
    [players]
  );

  const handleBid = (increment: number) => {
    if (!isAdmin || !socketRef.current || !activePlayer) return;
    const team = teams.find((t) => t.id === leadingTeamId) ?? teams[0];
    if (!team) return;
    const amount = currentBid + increment;
    playBidTick();
    socketRef.current.emit("bid:place", { amount, teamId: team.id, teamShort: team.short });
  };

  const handleSelectTeam = (teamId: string) => {
    if (!isAdmin) return;
    setLeadingTeamId(teamId);
  };

  const handleSold = () => {
    if (!isAdmin || !socketRef.current || !activePlayer) return;
    const team = teams.find((t) => t.id === leadingTeamId);
    if (!team) return;
    socketRef.current.emit("player:sold", {
      playerName: activePlayer.name,
      teamShort: team.short,
      teamId: team.id,
      amount: currentBid,
    });
  };

  const handleUnsold = () => {
    if (!isAdmin || !socketRef.current || !activePlayer) return;
    socketRef.current.emit("player:unsold", { playerName: activePlayer.name });
  };

  const handleLogout = () => {
    sessionStorage.removeItem("ksl_admin");
    sessionStorage.removeItem("ksl_admin_email");
    sessionStorage.removeItem("ksl_admin_token");
    router.push("/");
  };

  const handleStartAuction = (category: string) => {
    if (!isAdmin || !socketRef.current) return;
    setSelectedCategory(category);
    playAuctionStart();
    socketRef.current.emit("auction:start", { category });
  };

  const handleRandomPlayer = (category: string) => {
    if (!isAdmin || !socketRef.current) return;
    setSelectedCategory(category);
    socketRef.current.emit("player:random", { category });
  };

  const handleSettingsUpdate = () => {
    if (!isAdmin || !socketRef.current) return;
    socketRef.current.emit("settings:update", {
      threshold: Number(threshold),
      incrementStep: Number(incrementStep),
    });
  };

  const leadingTeam = teams.find((t) => t.id === leadingTeamId) ?? teams[0];

  if (!isAdmin) {
    return (
      <div className={`${workSans.className} flex min-h-screen items-center justify-center bg-[#050505] text-white`}>
        <p className="text-sm text-zinc-400">Checking admin session...</p>
      </div>
    );
  }

  if (!leadingTeam) {
    return (
      <div className={`${workSans.className} flex min-h-screen items-center justify-center bg-[#050505] text-white`}>
        <p className="text-sm text-zinc-400">Loading teams...</p>
      </div>
    );
  }

  return (
    <div className={`${workSans.className} min-h-screen w-full overflow-x-hidden bg-[#030303] text-base font-normal text-white`}>
      <CenterSoldOverlay banner={soldBanner} onDone={() => setSoldBanner(null)} />
      <TeamSquadsPanel teams={teams} players={players} isOpen={showSquads} onClose={() => setShowSquads(false)} />

      {/* HEADER */}
      <header className="w-full border-b border-white/10 bg-[#080808]">
        <div className="flex w-full flex-wrap items-center justify-between gap-3 px-4 py-4 md:px-6">
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/" className="flex items-center gap-2 rounded-xl border border-white/15 bg-[#111111] px-4 py-2 text-sm font-bold text-[#FACC15] transition hover:border-white/30">
              ← Home
            </Link>
            <span
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold ${
                isConnected
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                  : "border-rose-500/40 bg-rose-500/10 text-rose-300"
              }`}
            >
              <span className={`h-2.5 w-2.5 rounded-full ${isConnected ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" : "bg-rose-400"}`} />
              {isConnected ? `CONNECTED · ${connectedUsers} WATCHING` : "OFFLINE"}
            </span>
            {isAdmin && (
              <span className="inline-flex items-center gap-2 rounded-full border border-[#FACC15]/40 bg-[#FACC15]/10 px-3 py-1.5 text-xs font-black text-[#FACC15]">
                👑 ADMIN
              </span>
            )}
            <button
              type="button"
              onClick={() => setShowSquads(true)}
              className="inline-flex items-center gap-2 rounded-full border border-sky-500/40 bg-sky-500/10 px-4 py-2 text-xs font-bold text-sky-300 transition hover:bg-sky-500/20"
            >
              📋 Team Squads
            </button>
          </div>

          <div className="text-center">
            <h1 className="text-xl font-black tracking-wider text-white uppercase md:text-2xl">KPL Auction</h1>
            <p className="text-xs text-zinc-500">{adminEmail || "St. John's English Medium School · Nellore"}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowSettings(!showSettings)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition ${
                  showSettings
                    ? "border-[#FACC15] bg-[#FACC15]/10 text-[#FACC15]"
                    : "border-white/15 bg-[#111111] text-zinc-300 hover:border-white/30 hover:bg-[#161616]"
                }`}
              >
                ⚙️ Settings
              </button>
            </div>

            <button type="button" onClick={() => setMuted((m) => !m)} className="rounded-xl border border-white/15 bg-[#111111] px-4 py-2 text-sm font-bold text-zinc-300 transition hover:border-white/30">
              {muted ? "🔊 Off" : "🔊 On"}
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-2 text-sm font-bold text-rose-300 transition hover:bg-rose-500/20"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* STATUS BAR */}
      <div className="w-full border-b border-white/10 bg-[#0b0b0b] px-4 py-2.5 text-xs text-zinc-400 md:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="font-bold text-[#FACC15]">{statusNote}</span>
          <div className="flex items-center gap-4">
            <span>Base ₹{BASE_PRICE} | Purse: ₹{teams[0]?.initialAuctionPurse || 1800} | Capt: ₹{teams[0]?.captainCoins || 200}</span>
          </div>
        </div>
      </div>

      {/* SETTINGS PANEL (COLLAPSIBLE) */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-white/10 bg-[#0f0f0f]"
          >
            <div className="p-6 md:px-8">
              <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-sm font-black uppercase tracking-widest text-[#FACC15]">⚙️ Auction Settings</h2>
                  <p className="text-xs text-zinc-500">Configure bid increments and auction behavior</p>
                </div>
                <button
                  type="button"
                  onClick={handleSettingsUpdate}
                  className="rounded-lg bg-[#FACC15] px-4 py-2 text-xs font-black text-black transition hover:opacity-90 hover:shadow-[0_0_20px_rgba(250,204,21,0.3)]"
                >
                  Save Settings
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-zinc-500">Bid Threshold</label>
                  <input
                    type="number"
                    value={threshold}
                    onChange={(e) => setThreshold(Number(e.target.value))}
                    className="w-full rounded-xl border border-white/15 bg-[#141414] px-4 py-3 text-sm text-white outline-none focus:border-[#FACC15]"
                  />
                  <p className="mt-1.5 text-xs text-zinc-600">Bids before increment increases (default: 4)</p>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-zinc-500">Increment Step (₹)</label>
                  <input
                    type="number"
                    value={incrementStep}
                    onChange={(e) => setIncrementStep(Number(e.target.value))}
                    className="w-full rounded-xl border border-white/15 bg-[#141414] px-4 py-3 text-sm text-white outline-none focus:border-[#FACC15]"
                  />
                  <p className="mt-1.5 text-xs text-zinc-600">Starting bid increment amount (default: ₹10)</p>
                </div>
              </div>

              <div className="mt-8 border-t border-white/10 pt-6">
                <h3 className="mb-4 text-xs font-black uppercase tracking-widest text-emerald-400">🚀 Start Auction</h3>
                <div className="flex flex-wrap gap-2">
                  {["All", "Batsman", "Bowler", "All rounder", "Wicketkeeper"].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => handleStartAuction(cat)}
                      className={`rounded-lg px-4 py-3 text-xs font-black transition ${
                        selectedCategory === cat
                          ? "bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                          : "border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => handleRandomPlayer(selectedCategory)}
                    className="w-full rounded-xl border border-sky-500/40 bg-sky-500/10 px-4 py-3 text-sm font-black text-sky-300 transition hover:bg-sky-500/20 hover:border-sky-400"
                  >
                    🎲 Random Player ({selectedCategory})
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="w-full px-4 py-8 md:px-6">
        {/* ACTIVE PLAYER CARD */}
        <section className="relative overflow-hidden rounded-3xl border border-white/15 bg-[#0c0c0c] p-6 shadow-2xl md:p-8">
          {activePlayer ? (
            <>
              {/* Player info header */}
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <span className="rounded-lg bg-[#FACC15] px-3 py-1.5 text-xs font-black text-black">#{String(activePlayer.id).padStart(2, "0")}</span>
                  <span className="rounded-lg border border-white/15 bg-[#141414] px-3 py-1.5 text-xs font-medium text-zinc-300">{activePlayer.role}</span>
                </div>
                <div className="text-xs text-zinc-500">
                  <span className="mr-3">Age: {activePlayer.age}</span>
                  <span>Base: ₹{activePlayer.basePrice}</span>
                </div>
              </div>

              <div className="flex flex-col items-center justify-between gap-6 lg:flex-row">
                {/* Player info */}
                <div className="flex flex-col items-center gap-5 text-center lg:flex-row lg:text-left">
                  <RobotAvatar seed={`${activePlayer.name}-${activePlayer.id}`} size={100} />
                  <div>
                    <h2 className="text-2xl font-black text-white md:text-3xl lg:text-4xl">{activePlayer.name}</h2>
                    <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-zinc-400">
                      <span>Bids: {bidCount}</span>
                      <span className="h-4 w-px bg-zinc-700" />
                      <span>Next: +₹{nextIncrement}</span>
                    </div>
                  </div>
                </div>

                {/* Current bid display */}
                <div
                  style={{ backgroundColor: leadingTeam.color, color: leadingTeam.textOnColor }}
                  className="flex w-full flex-col items-center justify-center rounded-2xl p-6 text-center shadow-lg lg:w-72 lg:shadow-xl"
                >
                  <p className="text-xs font-black uppercase opacity-90">Current Bid</p>
                  <p className="mt-1 text-4xl font-black tracking-tight">₹{currentBid}</p>
                  <div className="mt-3 flex items-center justify-center gap-2">
                    <TeamLogoBadge team={leadingTeam} size={36} />
                    <p className="text-sm font-bold uppercase opacity-90">{leadingTeam.short} leading</p>
                  </div>
                  <p className="mt-2 text-xs opacity-80">Purse: ₹{leadingTeam.remainingPurse}</p>
                </div>
              </div>

              {/* Bid buttons */}
              <div className="mt-8 flex flex-col items-center gap-4 lg:flex-row lg:justify-between">
                <div className="flex flex-wrap justify-center gap-3 lg:justify-start">
                  {[incrementStep, incrementStep * 2, incrementStep * 3].map((inc) => (
                    <button
                      key={inc}
                      type="button"
                      onClick={() => handleBid(inc)}
                      style={{ backgroundColor: leadingTeam.color, color: leadingTeam.textOnColor }}
                      className="rounded-xl px-5 py-3 text-sm font-black transition hover:brightness-110 active:scale-95"
                    >
                      +₹{inc} ({leadingTeam.short})
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={handleUnsold}
                    className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-6 py-3 text-sm font-bold text-rose-300 transition hover:bg-rose-500 hover:text-white"
                  >
                    Mark Unsold
                  </button>
                  <button
                    type="button"
                    onClick={handleSold}
                    style={{ backgroundColor: leadingTeam.color, color: leadingTeam.textOnColor }}
                    className="rounded-xl px-6 py-3 text-sm font-black transition hover:brightness-110 active:scale-95"
                  >
                    SOLD to {leadingTeam.short}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="py-16 text-center">
              <div className="mb-4 text-6xl">🏆</div>
              <p className="text-xl font-bold text-zinc-400">All players completed!</p>
              <p className="mt-2 text-sm text-zinc-600">Auction session ended.</p>
            </div>
          )}
        </section>

        {/* 8 TEAMS GRID */}
        <section className="mt-8">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-black uppercase text-white">8 Teams</h2>
            <p className="text-xs text-zinc-500">Click to set as leading bidder</p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {teams.map((team) => {
              const isLead = team.id === leadingTeamId;
              const pursePercent = Math.max(0, Math.min(100, Math.round((team.remainingPurse / team.initialAuctionPurse) * 100)));
              const slotsLeft = Math.max(0, team.targetSquadSize - team.boughtCount);
              return (
                <button
                  key={team.id}
                  type="button"
                  onClick={() => handleSelectTeam(team.id)}
                  className={`group relative w-full rounded-2xl border p-5 text-left transition-all duration-300 ${
                    isLead ? "border-[#FACC15] shadow-[0_0_30px_rgba(250,204,21,0.15)]" : "border-white/10 hover:border-white/30"
                  }`}
                  style={{ backgroundColor: isLead ? team.color : "#0f0f0f", color: isLead ? team.textOnColor : "#FFFFFF" }}
                >
                  {isLead && (
                    <span className="absolute -right-3 -top-3 rounded-full bg-[#FACC15] px-2 py-1 text-[10px] font-black text-black shadow-lg">
                      LEADING
                    </span>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                      <TeamLogoBadge team={team} size={52} />
                      <div className="min-w-0">
                        <p className="truncate text-base font-black uppercase">{team.short}</p>
                        <p className="truncate text-xs opacity-90">{team.name}</p>
                      </div>
                    </div>
                    <span className="rounded-md bg-black/25 px-2 py-1 text-xs font-bold">{pursePercent}%</span>
                  </div>
                  <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-black/20">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pursePercent}%`, backgroundColor: isLead ? team.textOnColor : "#FACC15" }}
                    />
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2 border-t pt-3 text-xs">
                    <div>
                      <p className="text-[10px] opacity-70">Purse</p>
                      <p className="font-bold">₹{team.remainingPurse}</p>
                    </div>
                    <div>
                      <p className="text-[10px] opacity-70">Bought</p>
                      <p className="font-bold">{team.boughtCount}</p>
                    </div>
                    <div>
                      <p className="text-[10px] opacity-70">Slots</p>
                      <p className="font-bold">{slotsLeft}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
