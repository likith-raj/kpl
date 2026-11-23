"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Work_Sans } from "next/font/google";
import { AnimatePresence, motion } from "framer-motion";

const workSans = Work_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

/* ================================================================
   TYPES & CONSTANTS
   ================================================================ */

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

const ROUND_SECONDS = 15;
const BASE_PRICE = 10;
const TOTAL_COINS = 2000;
const CAPTAIN_COINS = 200;
const AUCTION_PURSE = TOTAL_COINS - CAPTAIN_COINS; // 1800 live purse
const TARGET_SQUAD_PER_TEAM = 4;

const INITIAL_TEAMS: Team[] = [
  {
    id: "rcb",
    name: "Royal Challengers Bengaluru",
    short: "RCB",
    logo: "/logos/rcb.png",
    color: "#DC2626",
    textOnColor: "#FFFFFF",
    totalCoins: TOTAL_COINS,
    captainCoins: CAPTAIN_COINS,
    initialAuctionPurse: AUCTION_PURSE,
    remainingPurse: 1730,
    boughtCount: 2,
    targetSquadSize: TARGET_SQUAD_PER_TEAM,
  },
  {
    id: "csk",
    name: "Chennai Super Kings",
    short: "CSK",
    logo: "/logos/csk.svg",
    color: "#FACC15",
    textOnColor: "#09090B",
    totalCoins: TOTAL_COINS,
    captainCoins: CAPTAIN_COINS,
    initialAuctionPurse: AUCTION_PURSE,
    remainingPurse: 1760,
    boughtCount: 1,
    targetSquadSize: TARGET_SQUAD_PER_TEAM,
  },
  {
    id: "mi",
    name: "Mumbai Indians",
    short: "MI",
    logo: "/logos/mi.svg",
    color: "#0057B8",
    textOnColor: "#FFFFFF",
    totalCoins: TOTAL_COINS,
    captainCoins: CAPTAIN_COINS,
    initialAuctionPurse: AUCTION_PURSE,
    remainingPurse: 1770,
    boughtCount: 1,
    targetSquadSize: TARGET_SQUAD_PER_TEAM,
  },
  {
    id: "gt",
    name: "Gujarat Titans",
    short: "GT",
    logo: "/logos/gt.png",
    color: "#1B2133",
    textOnColor: "#FFFFFF",
    totalCoins: TOTAL_COINS,
    captainCoins: CAPTAIN_COINS,
    initialAuctionPurse: AUCTION_PURSE,
    remainingPurse: 1800,
    boughtCount: 0,
    targetSquadSize: TARGET_SQUAD_PER_TEAM,
  },
  {
    id: "rr",
    name: "Rajasthan Royals",
    short: "RR",
    logo: "/logos/rr.png",
    color: "#DB2777",
    textOnColor: "#FFFFFF",
    totalCoins: TOTAL_COINS,
    captainCoins: CAPTAIN_COINS,
    initialAuctionPurse: AUCTION_PURSE,
    remainingPurse: 1780,
    boughtCount: 1,
    targetSquadSize: TARGET_SQUAD_PER_TEAM,
  },
  {
    id: "srh",
    name: "Sunrisers Hyderabad",
    short: "SRH",
    logo: "/logos/srh.png",
    color: "#EA580C",
    textOnColor: "#FFFFFF",
    totalCoins: TOTAL_COINS,
    captainCoins: CAPTAIN_COINS,
    initialAuctionPurse: AUCTION_PURSE,
    remainingPurse: 1770,
    boughtCount: 1,
    targetSquadSize: TARGET_SQUAD_PER_TEAM,
  },
  {
    id: "kkr",
    name: "Kolkata Knight Riders",
    short: "KKR",
    logo: "/logos/kkr.svg",
    color: "#6D28D9",
    textOnColor: "#FFFFFF",
    totalCoins: TOTAL_COINS,
    captainCoins: CAPTAIN_COINS,
    initialAuctionPurse: AUCTION_PURSE,
    remainingPurse: 1800,
    boughtCount: 0,
    targetSquadSize: TARGET_SQUAD_PER_TEAM,
  },
  {
    id: "dc",
    name: "Delhi Capitals",
    short: "DC",
    logo: "/logos/dc.png",
    color: "#1D4ED8",
    textOnColor: "#FFFFFF",
    totalCoins: TOTAL_COINS,
    captainCoins: CAPTAIN_COINS,
    initialAuctionPurse: AUCTION_PURSE,
    remainingPurse: 1800,
    boughtCount: 0,
    targetSquadSize: TARGET_SQUAD_PER_TEAM,
  },
];

// 30 Unique KSL Players (duplicates removed, base price = 10)
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

/* ================================================================
   WEB AUDIO SOUND EFFECTS
   ================================================================ */

function useAuctionSounds(muted: boolean) {
  const ctxRef = useRef<AudioContext | null>(null);

  const getContext = useCallback(() => {
    if (typeof window === "undefined") return null;
    if (!ctxRef.current) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
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
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
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
    const freqs = [311.13, 233.08];
    freqs.forEach((freq, idx) => {
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
    osc.frequency.setValueAtTime(740, now);
    gain.gain.setValueAtTime(0.09, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.1);
  }, [getContext, muted]);

  return { playSoldSound, playUnsoldSound, playBidTick };
}

/* ================================================================
   CARTOON ROBOT AVATAR (CIRCULAR SVG)
   ================================================================ */

function RobotAvatar({
  seed,
  size = 76,
}: {
  seed: string;
  size?: number;
}) {
  const hash = useMemo(() => {
    let h = 0;
    for (let i = 0; i < seed.length; i++) {
      h = seed.charCodeAt(i) + ((h << 5) - h);
    }
    return Math.abs(h);
  }, [seed]);

  const antennaType = hash % 3;
  const mouthType = (hash >> 2) % 3;

  return (
    <div
      style={{ width: size, height: size }}
      className="relative shrink-0 overflow-hidden rounded-full border border-white/20 bg-[#121212]"
    >
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
          <path
            d="M40 62 L45 66 L50 62 L55 66 L60 62"
            fill="none"
            stroke="#0B0B0B"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>
    </div>
  );
}

/* ================================================================
   TEAM LOGO BADGE
   ================================================================ */

function TeamLogoBadge({
  team,
  size = 44,
}: {
  team: Team;
  size?: number;
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      style={{ width: size, height: size }}
      className="flex shrink-0 items-center justify-center overflow-hidden rounded-lg bg-black/60 p-1"
    >
      {!imgError ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={team.logo}
          alt={`${team.name} logo`}
          className="h-full w-full object-contain"
          onError={() => setImgError(true)}
        />
      ) : (
        <span className="text-xs font-bold tracking-wider text-white">
          {team.short}
        </span>
      )}
    </div>
  );
}

/* ================================================================
   CENTER SCREEN SOLD OVERLAY (NO OUTLINE, FADES AFTER 3 SECONDS)
   ================================================================ */

interface SoldBannerPayload {
  id: number;
  playerName: string;
  team: Team;
  amount: number;
}

function CenterSoldOverlay({
  banner,
  onDone,
}: {
  banner: SoldBannerPayload | null;
  onDone: () => void;
}) {
  useEffect(() => {
    if (!banner) return;
    const timer = setTimeout(() => {
      onDone();
    }, 3000);
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
          className="pointer-events-none fixed inset-0 z-[150] flex items-center justify-center bg-black/65 px-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.94 }}
            transition={{ duration: 0.35 }}
            className="flex flex-col items-center text-center"
          >
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-[#111111] p-2.5 md:h-28 md:w-28">
              <TeamLogoBadge team={banner.team} size={88} />
            </div>

            <p className="mt-4 text-sm font-bold tracking-[0.2em] text-white uppercase md:text-base">
              SOLD TO {banner.team.short}
            </p>

            <p className="mt-1 text-base font-medium text-zinc-200">
              {banner.playerName} · {banner.team.name}
            </p>

            <p className="mt-2 text-2xl font-bold text-[#FACC15] md:text-3xl">
              ₹{banner.amount}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ================================================================
   MAIN AUCTION LIVE ROOM (/auction)
   ================================================================ */

export default function AuctionLiveRoomPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  const [teams, setTeams] = useState<Team[]>(INITIAL_TEAMS);
  const [players, setPlayers] = useState<AuctionPlayer[]>(INITIAL_PLAYERS);
  const [leadingTeamId, setLeadingTeamId] = useState<string>("rcb");
  const [currentBid, setCurrentBid] = useState<number>(BASE_PRICE);
  const [secondsLeft, setSecondsLeft] = useState<number>(ROUND_SECONDS);
  const [timerPaused, setTimerPaused] = useState<boolean>(false);
  const [muted, setMuted] = useState<boolean>(false);
  const [projectorMode, setProjectorMode] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [soldBanner, setSoldBanner] = useState<SoldBannerPayload | null>(null);
  const [statusNote, setStatusNote] = useState<string>(
    "15s swap timer active · Base price ₹10 · RCB leading at ₹10"
  );

  const { playSoldSound, playUnsoldSound, playBidTick } = useAuctionSounds(muted);

  const activePlayer = useMemo(
    () =>
      players.find((p) => p.status === "IN AUCTION") ??
      players.find((p) => p.status === "UPCOMING"),
    [players]
  );

  const soldCounterRef = useRef<number>(
    INITIAL_PLAYERS.filter((p) => p.status === "SOLD").length
  );

  const swapToNextPlayer = useCallback(
    (
      currentId: number,
      outcome: "SOLD" | "UNSOLD",
      winningTeam?: Team,
      finalPrice?: number
    ) => {
      setPlayers((prev) => {
        const nextUpcoming = prev.find(
          (p) => p.id !== currentId && p.status === "UPCOMING"
        );

        if (outcome === "SOLD") {
          soldCounterRef.current += 1;
        }

        return prev.map((p) => {
          if (p.id === currentId) {
            if (outcome === "SOLD" && winningTeam && finalPrice) {
              return {
                ...p,
                status: "SOLD" as const,
                soldToTeamId: winningTeam.id,
                soldPrice: finalPrice,
                soldOrder: soldCounterRef.current,
              };
            }
            return {
              ...p,
              status: "UNSOLD" as const,
            };
          }
          if (nextUpcoming && p.id === nextUpcoming.id) {
            return {
              ...p,
              status: "IN AUCTION" as const,
            };
          }
          return p;
        });
      });

      setSecondsLeft(ROUND_SECONDS);
      setCurrentBid(BASE_PRICE);
    },
    []
  );

  const handleMarkUnsold = useCallback(() => {
    if (!activePlayer) return;
    playUnsoldSound();
    setStatusNote(`${activePlayer.name} UNSOLD — swapped to next player`);
    swapToNextPlayer(activePlayer.id, "UNSOLD");
  }, [activePlayer, playUnsoldSound, swapToNextPlayer]);

  const handleSellPlayer = useCallback(() => {
    if (!activePlayer) return;
    const team = teams.find((t) => t.id === leadingTeamId);
    if (!team) return;

    const finalAmount = Math.max(activePlayer.basePrice, currentBid);
    if (team.remainingPurse < finalAmount) {
      setStatusNote(`${team.short} purse low (₹${team.remainingPurse} left)`);
      return;
    }

    playSoldSound();
    setSoldBanner({
      id: Date.now(),
      playerName: activePlayer.name,
      team,
      amount: finalAmount,
    });
    setStatusNote(`${activePlayer.name} SOLD to ${team.short} for ₹${finalAmount}`);

    setTeams((prev) =>
      prev.map((t) =>
        t.id === team.id
          ? {
              ...t,
              remainingPurse: t.remainingPurse - finalAmount,
              boughtCount: t.boughtCount + 1,
            }
          : t
      )
    );

    swapToNextPlayer(activePlayer.id, "SOLD", team, finalAmount);
  }, [
    activePlayer,
    currentBid,
    leadingTeamId,
    playSoldSound,
    swapToNextPlayer,
    teams,
  ]);

  // 15-second countdown per player -> auto UNSOLD sound + swap
  useEffect(() => {
    if (!activePlayer || timerPaused) return;

    if (secondsLeft <= 0) {
      handleMarkUnsold();
      return;
    }

    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [activePlayer, handleMarkUnsold, secondsLeft, timerPaused]);

  const handleBidByTeam = (teamId: string, increment: number = 10) => {
    playBidTick();
    setLeadingTeamId(teamId);
    const nextBid = currentBid + increment;
    setCurrentBid(nextBid);
    if (secondsLeft < 6) {
      setSecondsLeft(8);
    }
    const t = teams.find((item) => item.id === teamId);
    if (t) {
      setStatusNote(`${t.short} leading bid at ₹${nextBid}`);
    }
  };

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

  const stats = useMemo(() => {
    const totalRegistered = players.length;
    const soldPlayers = players.filter((p) => p.status === "SOLD");
    const unsoldPlayers = players.filter((p) => p.status === "UNSOLD");
    const remainingPlayers = players.filter(
      (p) => p.status === "UPCOMING" || p.status === "IN AUCTION"
    );
    const totalSpending = soldPlayers.reduce((sum, p) => sum + (p.soldPrice ?? 0), 0);

    return {
      totalRegistered,
      soldCount: soldPlayers.length,
      unsoldCount: unsoldPlayers.length,
      remainingCount: remainingPlayers.length,
      totalSpending,
    };
  }, [players]);

  const recentlySold = useMemo(() => {
    return players
      .filter((p) => p.status === "SOLD")
      .sort((a, b) => (b.soldOrder ?? 0) - (a.soldOrder ?? 0));
  }, [players]);

  const upcomingPlayers = useMemo(() => {
    return players.filter(
      (p) => p.status === "UPCOMING" && p.id !== activePlayer?.id
    );
  }, [players, activePlayer]);

  const teamMap = useMemo(() => {
    const map = new Map<string, Team>();
    teams.forEach((t) => map.set(t.id, t));
    return map;
  }, [teams]);

  const leadingTeam = teamMap.get(leadingTeamId) ?? teams[0];
  const timerPercent = Math.max(0, Math.min(100, (secondsLeft / ROUND_SECONDS) * 100));

  return (
    <div
      ref={containerRef}
      className={`${workSans.className} min-h-screen w-full overflow-x-hidden bg-[#050505] text-base font-normal text-white`}
    >
      {/* Center Screen SOLD Winning Team Overlay (3s fade, no outline) */}
      <CenterSoldOverlay banner={soldBanner} onDone={() => setSoldBanner(null)} />

      {/* Top Bar */}
      {!projectorMode && (
        <header className="w-full border-b border-white/10 bg-[#080808]">
          <div className="flex w-full flex-wrap items-center justify-between gap-3 px-4 py-3.5 md:px-6">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/"
                className="rounded-lg border border-white/15 bg-[#111111] px-3 py-1.5 text-sm font-medium text-[#FACC15] transition hover:border-white/30"
              >
                ← Home
              </Link>
              <Link
                href="/registers"
                className="rounded-lg border border-white/15 bg-[#111111] px-3 py-1.5 text-sm font-medium text-zinc-200 transition hover:border-white/30"
              >
                Players
              </Link>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                LIVE
              </span>
            </div>

            <div className="text-center">
              <h1 className="text-lg font-bold tracking-wide text-white uppercase md:text-xl">
                KSL Auction Live Room
              </h1>
              <p className="text-xs text-zinc-400">
                St. John&apos;s English Medium School · Nellore
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setMuted((m) => !m)}
                className="rounded-lg border border-white/15 bg-[#111111] px-3 py-1.5 text-sm font-medium text-zinc-200 transition hover:border-white/30"
              >
                {muted ? "Sound Off" : "Sound On"}
              </button>
              <button
                type="button"
                onClick={() => setProjectorMode(true)}
                className="rounded-lg border border-white/15 bg-[#141414] px-3 py-1.5 text-sm font-semibold text-[#FACC15] transition hover:border-white/30"
              >
                Projector 16:9
              </button>
              <button
                type="button"
                onClick={toggleFullscreen}
                className="rounded-lg border border-white/15 bg-[#111111] px-3 py-1.5 text-sm font-medium text-zinc-200 transition hover:border-white/30"
              >
                {isFullscreen ? "Exit Full" : "Fullscreen"}
              </button>
            </div>
          </div>
        </header>
      )}

      {/* Status Bar */}
      {!projectorMode && (
        <div className="w-full border-b border-white/10 bg-[#0b0b0b] px-4 py-2 text-xs text-zinc-300 md:px-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-medium text-[#FACC15]">{statusNote}</span>
            <span className="text-zinc-400">
              Base ₹10 · Purse: 2,000 Total · 200 Captain · 1,800 Auction
            </span>
          </div>
        </div>
      )}

      {projectorMode && (
        <div className="flex w-full items-center justify-between border-b border-white/10 bg-[#080808] px-6 py-3">
          <span className="text-sm font-semibold tracking-wider text-[#FACC15] uppercase">
            KSL Live Projector Display
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleFullscreen}
              className="rounded-lg border border-white/15 bg-[#111111] px-3 py-1.5 text-sm text-zinc-200"
            >
              {isFullscreen ? "Exit Full" : "Fullscreen"}
            </button>
            <button
              type="button"
              onClick={() => setProjectorMode(false)}
              className="rounded-lg border border-white/15 bg-[#141414] px-3 py-1.5 text-sm font-medium text-[#FACC15]"
            >
              Exit Projector
            </button>
          </div>
        </div>
      )}

      {/* END-TO-END MAIN CONTENT */}
      <main className="w-full px-4 py-5 md:px-6">
        {/* Stats Row */}
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

        {/* Active Player + Side Lists */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          {/* Active Player & 15s Swap Stage */}
          <section className="rounded-xl border border-white/15 bg-[#0c0c0c] p-5 lg:col-span-8">
            {activePlayer ? (
              <>
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-[#FACC15] px-2.5 py-1 text-xs font-bold text-black">
                      #{String(activePlayer.id).padStart(2, "0")}
                    </span>
                    <span className="text-sm font-medium text-zinc-300">
                      {activePlayer.role}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-lg border px-3 py-1 text-sm font-bold ${
                        secondsLeft <= 4
                          ? "border-rose-500 bg-rose-500/20 text-rose-300"
                          : "border-white/20 bg-[#141414] text-[#FACC15]"
                      }`}
                    >
                      {secondsLeft}s Swap
                    </span>
                    <button
                      type="button"
                      onClick={() => setTimerPaused((p) => !p)}
                      className="rounded-lg border border-white/15 bg-[#141414] px-2.5 py-1 text-xs font-medium text-zinc-200"
                    >
                      {timerPaused ? "Resume" : "Pause"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSecondsLeft(ROUND_SECONDS)}
                      className="rounded-lg border border-white/15 bg-[#141414] px-2.5 py-1 text-xs font-medium text-zinc-300"
                    >
                      Reset 15s
                    </button>
                  </div>
                </div>

                {/* 15s Progress Bar */}
                <div className="mb-5 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full transition-all duration-500"
                    style={{
                      width: `${timerPercent}%`,
                      backgroundColor: secondsLeft <= 4 ? "#F43F5E" : "#FACC15",
                    }}
                  />
                </div>

                <div className="flex flex-col items-center justify-between gap-5 sm:flex-row">
                  <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
                    <RobotAvatar seed={`${activePlayer.name}-${activePlayer.id}`} size={84} />
                    <div>
                      <p className="text-xs font-medium text-zinc-400">
                        Age: {activePlayer.age} · Base Price: ₹{activePlayer.basePrice}
                      </p>
                      <h2 className="mt-0.5 text-2xl font-bold text-white md:text-3xl">
                        {activePlayer.name}
                      </h2>
                      <p className="mt-1 text-xs text-zinc-400">
                        Swaps to Unsold automatically after 15 seconds
                      </p>
                    </div>
                  </div>

                  {/* Current Lead Box */}
                  <div
                    style={{
                      backgroundColor: leadingTeam.color,
                      color: leadingTeam.textOnColor,
                    }}
                    className="w-full rounded-xl p-4 text-center sm:w-64 sm:text-right"
                  >
                    <p className="text-xs font-semibold uppercase opacity-85">
                      Current Bid · {leadingTeam.short}
                    </p>
                    <p className="mt-1 text-3xl font-bold">₹{currentBid}</p>
                    <p className="mt-1 text-xs font-medium opacity-90">
                      Purse Left: ₹{leadingTeam.remainingPurse}
                    </p>
                  </div>
                </div>

                {/* Bid Increments (+10, +20, +30) + Sold / Unsold Actions */}
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
                  <div className="flex flex-wrap gap-2">
                    {[10, 20, 30].map((inc) => (
                      <button
                        key={inc}
                        type="button"
                        onClick={() => handleBidByTeam(leadingTeam.id, inc)}
                        className="rounded-lg border border-white/15 bg-[#151515] px-3.5 py-2 text-sm font-semibold text-white transition hover:border-[#FACC15]"
                      >
                        +₹{inc} ({leadingTeam.short})
                      </button>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={handleMarkUnsold}
                      className="rounded-lg border border-rose-500/40 bg-rose-500/15 px-4 py-2 text-sm font-semibold text-rose-300 transition hover:bg-rose-500 hover:text-white"
                    >
                      Mark Unsold
                    </button>
                    <button
                      type="button"
                      onClick={handleSellPlayer}
                      style={{
                        backgroundColor: leadingTeam.color,
                        color: leadingTeam.textOnColor,
                      }}
                      className="rounded-lg px-4 py-2 text-sm font-bold transition hover:opacity-95"
                    >
                      SOLD to {leadingTeam.short}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="py-10 text-center text-zinc-400">
                All players completed.
              </div>
            )}
          </section>

          {/* Recently Sold & Upcoming */}
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
                    <div
                      key={p.id}
                      className="flex items-center justify-between rounded-lg border border-white/10 bg-[#121212] px-3 py-2 text-sm"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-white">{p.name}</p>
                        <p className="text-xs text-zinc-400">
                          {buyer?.short ?? "—"} · {p.role}
                        </p>
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
                  <div
                    key={p.id}
                    className="flex items-center justify-between rounded-lg border border-white/10 bg-[#121212] px-3 py-2 text-sm"
                  >
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

        {/* 8 TEAMS: LEADING TEAM FULL COLOR, OTHERS SOLID DARK/BLACK */}
        <section className="mt-6">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base font-bold text-white uppercase">
              8 Teams — Tap a Team to Bid (+₹10)
            </h2>
            <span className="text-xs text-zinc-400">
              2,000 Coins − 200 Captain = 1,800 Auction Purse
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {teams.map((team) => {
              const isLead = team.id === leadingTeamId;
              const pursePercent = Math.max(
                0,
                Math.min(
                  100,
                  Math.round((team.remainingPurse / team.initialAuctionPurse) * 100)
                )
              );
              const slotsLeft = Math.max(0, team.targetSquadSize - team.boughtCount);

              return (
                <button
                  key={team.id}
                  type="button"
                  onClick={() => handleBidByTeam(team.id, 10)}
                  style={{
                    backgroundColor: isLead ? team.color : "#090909",
                    color: isLead ? team.textOnColor : "#FFFFFF",
                    borderColor: isLead ? team.color : "#1F1F1F",
                  }}
                  className="w-full rounded-xl border p-4 text-left transition-all duration-200"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-3">
                      <TeamLogoBadge team={team} size={42} />
                      <div className="min-w-0">
                        <p className="truncate text-base font-bold uppercase">
                          {team.short}
                        </p>
                        <p
                          className={`truncate text-xs ${
                            isLead ? "opacity-90" : "text-zinc-500"
                          }`}
                        >
                          {team.name}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`rounded-md px-2 py-0.5 text-xs font-bold ${
                        isLead
                          ? "bg-black/25"
                          : "bg-[#141414] text-zinc-400"
                      }`}
                    >
                      {pursePercent}%
                    </span>
                  </div>

                  {/* Purse % Bar */}
                  <div
                    className={`mt-3 h-1.5 w-full overflow-hidden rounded-full ${
                      isLead ? "bg-black/25" : "bg-white/10"
                    }`}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${pursePercent}%`,
                        backgroundColor: isLead ? team.textOnColor : "#FACC15",
                      }}
                    />
                  </div>

                  <div
                    className={`mt-3 grid grid-cols-3 gap-2 border-t pt-2.5 text-xs ${
                      isLead ? "border-black/20" : "border-white/10 text-zinc-400"
                    }`}
                  >
                    <div>
                      <span className="block text-[11px] opacity-75">Purse</span>
                      <span className="font-bold">₹{team.remainingPurse}</span>
                    </div>
                    <div>
                      <span className="block text-[11px] opacity-75">Bought</span>
                      <span className="font-bold">{team.boughtCount}</span>
                    </div>
                    <div>
                      <span className="block text-[11px] opacity-75">Slots Left</span>
                      <span className="font-bold">{slotsLeft}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* End-of-Page Footer */}
        <footer className="mt-8 border-t border-white/10 pt-4 text-center text-xs text-zinc-500">
          KSL Cricket Auction 2026 · St. John&apos;s English Medium School · Nellore
        </footer>
      </main>
    </div>
  );
}