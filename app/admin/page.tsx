"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Work_Sans } from "next/font/google";
import { AnimatePresence, motion } from "framer-motion";
import { io, Socket } from "socket.io-client";

const workSans = Work_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

type PlayerRole = "Batsman" | "Bowler" | "All rounder";
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
const TOTAL_COINS = 2000;
const CAPTAIN_COINS = 200;
const AUCTION_PURSE = TOTAL_COINS - CAPTAIN_COINS;
const TARGET_SQUAD_PER_TEAM = 4;

const INITIAL_TEAMS: Team[] = [
  { id: "rcb", name: "Royal Challengers Bengaluru", short: "RCB", logo: "/logos/rcb.png", color: "#DC2626", textOnColor: "#FFFFFF", totalCoins: TOTAL_COINS, captainCoins: CAPTAIN_COINS, initialAuctionPurse: AUCTION_PURSE, remainingPurse: 1730, boughtCount: 2, targetSquadSize: TARGET_SQUAD_PER_TEAM },
  { id: "csk", name: "Chennai Super Kings", short: "CSK", logo: "/logos/csk.svg", color: "#FACC15", textOnColor: "#09090B", totalCoins: TOTAL_COINS, captainCoins: CAPTAIN_COINS, initialAuctionPurse: AUCTION_PURSE, remainingPurse: 1760, boughtCount: 1, targetSquadSize: TARGET_SQUAD_PER_TEAM },
  { id: "mi", name: "Mumbai Indians", short: "MI", logo: "/logos/mi.svg", color: "#0057B8", textOnColor: "#FFFFFF", totalCoins: TOTAL_COINS, captainCoins: CAPTAIN_COINS, initialAuctionPurse: AUCTION_PURSE, remainingPurse: 1770, boughtCount: 1, targetSquadSize: TARGET_SQUAD_PER_TEAM },
  { id: "gt", name: "Gujarat Titans", short: "GT", logo: "/logos/gt.png", color: "#1B2133", textOnColor: "#FFFFFF", totalCoins: TOTAL_COINS, captainCoins: CAPTAIN_COINS, initialAuctionPurse: AUCTION_PURSE, remainingPurse: 1800, boughtCount: 0, targetSquadSize: TARGET_SQUAD_PER_TEAM },
  { id: "rr", name: "Rajasthan Royals", short: "RR", logo: "/logos/rr.png", color: "#DB2777", textOnColor: "#FFFFFF", totalCoins: TOTAL_COINS, captainCoins: CAPTAIN_COINS, initialAuctionPurse: AUCTION_PURSE, remainingPurse: 1780, boughtCount: 1, targetSquadSize: TARGET_SQUAD_PER_TEAM },
  { id: "srh", name: "Sunrisers Hyderabad", short: "SRH", logo: "/logos/srh.png", color: "#EA580C", textOnColor: "#FFFFFF", totalCoins: TOTAL_COINS, captainCoins: CAPTAIN_COINS, initialAuctionPurse: AUCTION_PURSE, remainingPurse: 1770, boughtCount: 1, targetSquadSize: TARGET_SQUAD_PER_TEAM },
  { id: "kkr", name: "Kolkata Knight Riders", short: "KKR", logo: "/logos/kkr.svg", color: "#6D28D9", textOnColor: "#FFFFFF", totalCoins: TOTAL_COINS, captainCoins: CAPTAIN_COINS, initialAuctionPurse: AUCTION_PURSE, remainingPurse: 1800, boughtCount: 0, targetSquadSize: TARGET_SQUAD_PER_TEAM },
  { id: "dc", name: "Delhi Capitals", short: "DC", logo: "/logos/dc.png", color: "#1D4ED8", textOnColor: "#FFFFFF", totalCoins: TOTAL_COINS, captainCoins: CAPTAIN_COINS, initialAuctionPurse: AUCTION_PURSE, remainingPurse: 1800, boughtCount: 0, targetSquadSize: TARGET_SQUAD_PER_TEAM },
];

const INITIAL_PLAYERS: AuctionPlayer[] = [
  { id: 1, name: "A.Ravi teja", age: "34", role: "All rounder", basePrice: BASE_PRICE, status: "SOLD", soldToTeamId: "rcb", soldPrice: 40, soldOrder: 1 },
  { id: 2, name: "Sathwik", age: "24", role: "All rounder", basePrice: BASE_PRICE, status: "SOLD", soldToTeamId: "csk", soldPrice: 40, soldOrder: 2 },
  { id: 3, name: "BITTU", age: "21", role: "Batsman", basePrice: BASE_PRICE, status: "SOLD", soldToTeamId: "mi", soldPrice: 30, soldOrder: 3 },
  { id: 4, name: "Sundar", age: "20", role: "All rounder", basePrice: BASE_PRICE, status: "SOLD", soldToTeamId: "srh", soldPrice: 30, soldOrder: 4 },
  { id: 5, name: "G balaji", age: "22", role: "All rounder", basePrice: BASE_PRICE, status: "SOLD", soldToTeamId: "rr", soldPrice: 20, soldOrder: 5 },
  { id: 6, name: "Zeeshan hyder", age: "26", role: "All rounder", basePrice: BASE_PRICE, status: "SOLD", soldToTeamId: "rcb", soldPrice: 30, soldOrder: 6 },
  { id: 7, name: "A.MOSHE", age: "36", role: "Batsman", basePrice: BASE_PRICE, status: "IN AUCTION" },
  { id: 8, name: "Prasanth (nani)", age: "40", role: "All rounder", basePrice: BASE_PRICE, status: "UPCOMING" },
  { id: 9, name: "R.DANI", age: "38", role: "Batsman", basePrice: BASE_PRICE, status: "UPCOMING" },
  { id: 10, name: "Stephen Therey", age: "Not Provided", role: "All rounder", basePrice: BASE_PRICE, status: "UPCOMING" },
  { id: 11, name: "Nivesh", age: "28", role: "All rounder", basePrice: BASE_PRICE, status: "UPCOMING" },
  { id: 12, name: "Karunya", age: "31", role: "All rounder", basePrice: BASE_PRICE, status: "UPCOMING" },
  { id: 13, name: "Pradeep(Moni)", age: "26", role: "Batsman", basePrice: BASE_PRICE, status: "UPCOMING" },
  { id: 14, name: "Bittu Rithwik", age: "17", role: "Batsman", basePrice: BASE_PRICE, status: "UPCOMING" },
  { id: 15, name: "Manni", age: "27", role: "All rounder", basePrice: BASE_PRICE, status: "UPCOMING" },
  { id: 16, name: "Lamechrex", age: "22", role: "All rounder", basePrice: BASE_PRICE, status: "UPCOMING" },
  { id: 17, name: "Syam prasad", age: "54", role: "All rounder", basePrice: BASE_PRICE, status: "UPCOMING" },
  { id: 18, name: "Kranthi Kumar", age: "23", role: "Bowler", basePrice: BASE_PRICE, status: "UPCOMING" },
  { id: 19, name: "Abhilash(kevin)", age: "32", role: "All rounder", basePrice: BASE_PRICE, status: "UPCOMING" },
  { id: 20, name: "Gachibowli diwakar", age: "35", role: "All rounder", basePrice: BASE_PRICE, status: "UPCOMING" },
  { id: 21, name: "Vinay Devaraj", age: "56", role: "Bowler", basePrice: BASE_PRICE, status: "UPCOMING" },
  { id: 22, name: "Kayala Suresh", age: "45", role: "Batsman", basePrice: BASE_PRICE, status: "UPCOMING" },
  { id: 23, name: "Joseph", age: "26", role: "Batsman", basePrice: BASE_PRICE, status: "UPCOMING" },
  { id: 24, name: "A Ashu", age: "27", role: "All rounder", basePrice: BASE_PRICE, status: "UPCOMING" },
  { id: 25, name: "Naresh", age: "36", role: "All rounder", basePrice: BASE_PRICE, status: "UPCOMING" },
  { id: 26, name: "Rony", age: "25", role: "All rounder", basePrice: BASE_PRICE, status: "UPCOMING" },
  { id: 27, name: "Keerthan", age: "25", role: "All rounder", basePrice: BASE_PRICE, status: "UPCOMING" },
  { id: 28, name: "Tani pushpa Kumar", age: "27", role: "Batsman", basePrice: BASE_PRICE, status: "UPCOMING" },
  { id: 29, name: "Praveen", age: "35", role: "Batsman", basePrice: BASE_PRICE, status: "UPCOMING" },
  { id: 30, name: "BHARGAV", age: "28", role: "All rounder", basePrice: BASE_PRICE, status: "UPCOMING" },
];

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
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(now + idx * 0.08); osc.stop(now + idx * 0.08 + 0.48);
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
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(now + idx * 0.16); osc.stop(now + idx * 0.16 + 0.35);
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
    osc.frequency.setValueAtTime(740, now);
    gain.gain.setValueAtTime(0.09, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(now); osc.stop(now + 0.1);
  }, [getContext, muted]);

  return { playSoldSound, playUnsoldSound, playBidTick };
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

/* ================================================================
   MAIN ADMIN PAGE
   ================================================================ */

export default function AdminPage() {
  const router = useRouter();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [connectedUsers, setConnectedUsers] = useState(0);

  const [teams, setTeams] = useState<Team[]>(INITIAL_TEAMS);
  const [players, setPlayers] = useState<AuctionPlayer[]>(INITIAL_PLAYERS);
  const [leadingTeamId, setLeadingTeamId] = useState<string>("rcb");
  const [currentBid, setCurrentBid] = useState<number>(BASE_PRICE);
  const [secondsLeft, setSecondsLeft] = useState<number>(ROUND_SECONDS);
  const [timerPaused, setTimerPaused] = useState<boolean>(false);
  const [muted, setMuted] = useState<boolean>(false);
  const [soldBanner, setSoldBanner] = useState<SoldBannerPayload | null>(null);
  const [statusNote, setStatusNote] = useState<string>("Connecting...");

  const { playSoldSound, playUnsoldSound, playBidTick } = useAuctionSounds(muted);

  // ============ SESSION CHECK ============
  useEffect(() => {
    const isAdminSession = sessionStorage.getItem("ksl_admin");
    if (!isAdminSession) {
      router.push("/admin-login");
    } else {
      setIsAdmin(true);
      setAdminEmail(sessionStorage.getItem("ksl_admin_email") || "");
    }
  }, [router]);

  // ============ SOCKET CONNECTION ============
  useEffect(() => {
    const socket = io("http://localhost:4000", { transports: ["websocket"] });
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

    socket.on("auction:state", (state: { currentBid: number; leadingTeamId: string; secondsLeft: number; timerPaused: boolean; statusNote: string }) => {
      setCurrentBid(state.currentBid);
      setLeadingTeamId(state.leadingTeamId);
      setSecondsLeft(state.secondsLeft);
      setTimerPaused(state.timerPaused);
      setStatusNote(state.statusNote);
    });

    socket.on("auction:update", (state: { currentBid: number; leadingTeamId: string; secondsLeft: number; timerPaused: boolean; statusNote: string }) => {
      setCurrentBid(state.currentBid);
      setLeadingTeamId(state.leadingTeamId);
      setSecondsLeft(state.secondsLeft);
      setTimerPaused(state.timerPaused);
      setStatusNote(state.statusNote);
    });

    socket.on("timer:update", ({ secondsLeft }: { secondsLeft: number }) => setSecondsLeft(secondsLeft));
    socket.on("timer:toggle", ({ paused }: { paused: boolean }) => setTimerPaused(paused));
    socket.on("timer:reset", ({ seconds }: { seconds: number }) => setSecondsLeft(seconds));

    socket.on("player:sold", (data: { playerName: string; teamShort: string; amount: number; teamId: string }) => {
      playSoldSound();
      const team = INITIAL_TEAMS.find((t) => t.id === data.teamId);
      if (team) setSoldBanner({ id: Date.now(), playerName: data.playerName, team, amount: data.amount });
    });

    socket.on("player:unsold", () => playUnsoldSound());
    socket.on("users:count", (count: number) => setConnectedUsers(count));

    return () => { socket.disconnect(); };
  }, [playSoldSound, playUnsoldSound]);

  const activePlayer = useMemo(
    () => players.find((p) => p.status === "IN AUCTION") ?? players.find((p) => p.status === "UPCOMING"),
    [players]
  );

  const handleBid = (increment: number) => {
    if (!isAdmin || !socketRef.current || !activePlayer) return;
    const team = teams.find((t) => t.id === leadingTeamId) ?? teams[0];
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

  const handleToggleTimer = () => {
    if (!isAdmin || !socketRef.current) return;
    socketRef.current.emit("timer:toggle", !timerPaused);
  };

  const handleResetTimer = () => {
    if (!isAdmin || !socketRef.current) return;
    socketRef.current.emit("timer:reset", ROUND_SECONDS);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("ksl_admin");
    sessionStorage.removeItem("ksl_admin_email");
    router.push("/");
  };

  const leadingTeam = teams.find((t) => t.id === leadingTeamId) ?? teams[0];
  const timerPercent = Math.max(0, Math.min(100, (secondsLeft / ROUND_SECONDS) * 100));

  return (
    <div className={`${workSans.className} min-h-screen w-full overflow-x-hidden bg-[#050505] text-base font-normal text-white`}>
      <CenterSoldOverlay banner={soldBanner} onDone={() => setSoldBanner(null)} />

      <header className="w-full border-b border-white/10 bg-[#080808]">
        <div className="flex w-full flex-wrap items-center justify-between gap-3 px-4 py-3.5 md:px-6">
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/" className="rounded-lg border border-white/15 bg-[#111111] px-3 py-1.5 text-sm font-medium text-[#FACC15] transition hover:border-white/30">← Home</Link>
            <Link href="/auction" className="rounded-lg border border-white/15 bg-[#111111] px-3 py-1.5 text-sm font-medium text-zinc-200 transition hover:border-white/30">Viewer</Link>
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${isConnected ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300" : "border-rose-500/40 bg-rose-500/10 text-rose-300"}`}>
              <span className={`h-2 w-2 rounded-full ${isConnected ? "bg-emerald-400" : "bg-rose-400"}`} />
              {isConnected ? `CONNECTED · ${connectedUsers} watching` : "OFFLINE"}
            </span>
            {isAdmin && <span className="inline-flex items-center gap-1.5 rounded-full border border-[#FACC15]/40 bg-[#FACC15]/10 px-3 py-1 text-xs font-bold text-[#FACC15]">👑 ADMIN</span>}
          </div>
          <div className="text-center">
            <h1 className="text-lg font-bold tracking-wide text-white uppercase md:text-xl">KSL Auction Admin</h1>
            <p className="text-xs text-zinc-400">{adminEmail || "St. John's English Medium School · Nellore"}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => setMuted((m) => !m)} className="rounded-lg border border-white/15 bg-[#111111] px-3 py-1.5 text-sm font-medium text-zinc-200 transition hover:border-white/30">
              {muted ? "Sound Off" : "Sound On"}
            </button>
            <button type="button" onClick={handleLogout} className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-1.5 text-sm font-medium text-rose-300 transition hover:bg-rose-500/20">
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="w-full border-b border-white/10 bg-[#0b0b0b] px-4 py-2 text-xs text-zinc-300 md:px-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-medium text-[#FACC15]">{statusNote}</span>
          <span className="text-zinc-400">Base ₹10 · Purse: 2,000 Total · 200 Captain · 1,800 Auction</span>
        </div>
      </div>

      <main className="w-full px-4 py-5 md:px-6">
        <section className="rounded-xl border border-white/15 bg-[#0c0c0c] p-5">
          {activePlayer ? (
            <>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-[#FACC15] px-2.5 py-1 text-xs font-bold text-black">#{String(activePlayer.id).padStart(2, "0")}</span>
                  <span className="text-sm font-medium text-zinc-300">{activePlayer.role}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-lg border px-3 py-1 text-sm font-bold ${secondsLeft <= 4 ? "border-rose-500 bg-rose-500/20 text-rose-300" : "border-white/20 bg-[#141414] text-[#FACC15]"}`}>
                    {secondsLeft}s {timerPaused ? "Paused" : "Remaining"}
                  </span>
                  <button type="button" onClick={handleToggleTimer} className="rounded-lg border border-white/15 bg-[#141414] px-2.5 py-1 text-xs font-medium text-zinc-200">
                    {timerPaused ? "Resume" : "Pause"}
                  </button>
                  <button type="button" onClick={handleResetTimer} className="rounded-lg border border-white/15 bg-[#141414] px-2.5 py-1 text-xs font-medium text-zinc-300">
                    Reset 15s
                  </button>
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
                  </div>
                </div>
                <div style={{ backgroundColor: leadingTeam.color, color: leadingTeam.textOnColor }} className="w-full rounded-xl p-4 text-center sm:w-64 sm:text-right">
                  <p className="text-xs font-semibold uppercase opacity-85">Current Bid · {leadingTeam.short}</p>
                  <p className="mt-1 text-3xl font-bold">₹{currentBid}</p>
                  <p className="mt-1 text-xs font-medium opacity-90">Purse Left: ₹{leadingTeam.remainingPurse}</p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
                <div className="flex flex-wrap gap-2">
                  {[10, 20, 30].map((inc) => (
                    <button
                      key={inc}
                      type="button"
                      onClick={() => handleBid(inc)}
                      style={{ backgroundColor: leadingTeam.color, color: leadingTeam.textOnColor }}
                      className="rounded-lg px-3.5 py-2 text-sm font-bold transition hover:opacity-90"
                    >
                      +₹{inc} ({leadingTeam.short})
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={handleUnsold} className="rounded-lg border border-rose-500/40 bg-rose-500/15 px-4 py-2 text-sm font-semibold text-rose-300 transition hover:bg-rose-500 hover:text-white">
                    Mark Unsold
                  </button>
                  <button type="button" onClick={handleSold} style={{ backgroundColor: leadingTeam.color, color: leadingTeam.textOnColor }} className="rounded-lg px-4 py-2 text-sm font-bold transition hover:opacity-95">
                    SOLD to {leadingTeam.short}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="py-10 text-center text-zinc-400">All players completed.</div>
          )}
        </section>

        <section className="mt-6">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base font-bold text-white uppercase">8 Teams — Select Leading Team</h2>
            <span className="text-xs text-zinc-400">Click a team to set as leading bidder</span>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {teams.map((team) => {
              const isLead = team.id === leadingTeamId;
              const pursePercent = Math.max(0, Math.min(100, Math.round((team.remainingPurse / team.initialAuctionPurse) * 100)));
              const slotsLeft = Math.max(0, team.targetSquadSize - team.boughtCount);
              return (
                <button
                  key={team.id}
                  type="button"
                  onClick={() => handleSelectTeam(team.id)}
                  style={{ backgroundColor: isLead ? team.color : "#090909", color: isLead ? team.textOnColor : "#FFFFFF", borderColor: isLead ? team.color : "#1F1F1F" }}
                  className="w-full rounded-xl border p-4 text-left transition-all duration-200"
                >
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
                </button>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}