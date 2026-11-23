"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type Player = {
  id: number;
  timestamp: string;
  name: string;
  age: string;
  role: "Batsman" | "Bowler" | "All rounder";
  basePrice: number;
  tier: "Marquee" | "Gold" | "Challenger";
  isDuplicate?: boolean;
};

type CardColorTheme = {
  hue: number;
  accentHex: string;
  softBgHex: string;
  borderHex: string;
  glowHex: string;
  badgeTextHex: string;
  robotHeadHex: string;
  robotVisorHex: string;
  robotEyeHex: string;
  robotAccentHex: string;
};

const rawPlayers: Omit<Player, "id" | "basePrice" | "tier" | "isDuplicate">[] = [
  { timestamp: "11/22/2026 22:14:58", name: "A.Ravi teja", age: "34", role: "All rounder" },
  { timestamp: "11/22/2026 22:17:41", name: "Sathwik", age: "24", role: "All rounder" },
  { timestamp: "11/22/2026 22:24:12", name: "BITTU", age: "21", role: "Batsman" },
  { timestamp: "11/22/2026 22:29:36", name: "Sundar", age: "20", role: "All rounder" },
  { timestamp: "11/22/2026 22:30:06", name: "G balaji", age: "22", role: "All rounder" },
  { timestamp: "11/22/2026 22:30:18", name: "Zeeshan hyder", age: "26", role: "All rounder" },
  { timestamp: "11/22/2026 22:33:07", name: "A.MOSHE", age: "36", role: "Batsman" },
  { timestamp: "11/22/2026 22:33:51", name: "Prasanth (nani)", age: "40", role: "All rounder" },
  { timestamp: "11/22/2026 22:35:40", name: "R.DANI", age: "38", role: "Batsman" },
  { timestamp: "11/22/2026 22:37:07", name: "Stephen Therey", age: "Not Provided", role: "All rounder" },
  { timestamp: "11/22/2026 22:38:14", name: "Nivesh", age: "28", role: "All rounder" },
  { timestamp: "11/22/2026 22:45:08", name: "Karunya", age: "31", role: "All rounder" },
  { timestamp: "11/22/2026 22:47:55", name: "Pradeep(Moni)", age: "26", role: "Batsman" },
  { timestamp: "11/22/2026 23:05:01", name: "Bittu Rithwik", age: "17", role: "Batsman" },
  { timestamp: "11/22/2026 23:23:40", name: "Bittu Rithwik", age: "17", role: "Batsman" },
  { timestamp: "11/22/2026 23:38:27", name: "Manni", age: "27", role: "All rounder" },
  { timestamp: "11/22/2026 23:41:20", name: "Lamechrex", age: "22", role: "All rounder" },
  { timestamp: "11/22/2026 23:42:10", name: "Syam prasad", age: "54", role: "All rounder" },
  { timestamp: "11/23/2026 0:15:10", name: "Kranthi Kumar", age: "23", role: "Bowler" },
  { timestamp: "11/23/2026 0:29:18", name: "Abhilash(kevin)", age: "32", role: "All rounder" },
  { timestamp: "11/23/2026 0:56:28", name: "Gachibowli diwakar", age: "35", role: "All rounder" },
  { timestamp: "11/23/2026 1:07:25", name: "Vinay Devaraj", age: "56", role: "Bowler" },
  { timestamp: "11/23/2026 1:08:16", name: "Kayala Suresh", age: "45", role: "Batsman" },
  { timestamp: "11/23/2026 2:09:47", name: "Joseph", age: "26", role: "Batsman" },
  { timestamp: "11/23/2026 3:00:26", name: "A Ashu", age: "27", role: "All rounder" },
  { timestamp: "11/23/2026 3:55:22", name: "Zeeshan hyder", age: "26", role: "All rounder" },
  { timestamp: "11/23/2026 7:06:28", name: "Naresh", age: "36", role: "All rounder" },
  { timestamp: "11/23/2026 7:21:41", name: "Rony", age: "25", role: "All rounder" },
  { timestamp: "11/23/2026 8:12:35", name: "Keerthan", age: "25", role: "All rounder" },
  { timestamp: "11/23/2026 8:15:44", name: "Tani pushpa Kumar", age: "27", role: "Batsman" },
  { timestamp: "11/23/2026 9:21:56", name: "Praveen", age: "35", role: "Batsman" },
  { timestamp: "11/23/2026 9:23:18", name: "BHARGAV", age: "28", role: "All rounder" },
];

// Generate a distinct vibrant color theme for every single player index
function getCardColorTheme(index: number): CardColorTheme {
  const hue = Math.round((index * 137.508) % 360);
  const compHue = (hue + 180) % 360;
  const triHue = (hue + 120) % 360;

  return {
    hue,
    accentHex: `hsl(${hue}, 82%, 58%)`,
    softBgHex: `hsla(${hue}, 70%, 16%, 0.45)`,
    borderHex: `hsla(${hue}, 78%, 55%, 0.42)`,
    glowHex: `hsla(${hue}, 85%, 55%, 0.22)`,
    badgeTextHex: `hsl(${hue}, 92%, 72%)`,
    robotHeadHex: `hsl(${hue}, 75%, 64%)`,
    robotVisorHex: `hsl(${hue}, 35%, 9%)`,
    robotEyeHex: `hsl(${compHue}, 95%, 65%)`,
    robotAccentHex: `hsl(${triHue}, 85%, 60%)`,
  };
}

const players: Player[] = (() => {
  const seen = new Set<string>();
  return rawPlayers.map((p, idx) => {
    const key = `${p.name.toLowerCase().trim()}-${p.age.toLowerCase().trim()}-${p.role.toLowerCase().trim()}`;
    const isDuplicate = seen.has(key);
    seen.add(key);

    const tier: Player["tier"] =
      p.role === "All rounder" ? "Marquee" : p.role === "Batsman" ? "Gold" : "Challenger";

    return {
      ...p,
      id: idx + 1,
      basePrice: 200,
      tier,
      isDuplicate,
    };
  });
})();

function RobotAvatar({
  seed,
  theme,
  size = 60,
}: {
  seed: string;
  theme: CardColorTheme;
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
  const earType = (hash >> 4) % 2;

  return (
    <div
      style={{
        width: size,
        height: size,
        borderColor: theme.accentHex,
        boxShadow: `0 0 18px ${theme.glowHex}`,
      }}
      className="relative shrink-0 overflow-hidden rounded-full border-2 bg-[#111111] transition-transform duration-300 group-hover:scale-105"
    >
      <svg viewBox="0 0 100 100" className="h-full w-full">
        <circle cx="50" cy="50" r="50" fill={theme.softBgHex} />
        <circle
          cx="50"
          cy="50"
          r="44"
          fill="none"
          stroke={theme.accentHex}
          strokeOpacity="0.35"
          strokeWidth="1.5"
          strokeDasharray="4 3"
        />

        {antennaType === 0 && (
          <>
            <line
              x1="50"
              y1="12"
              x2="50"
              y2="25"
              stroke={theme.robotHeadHex}
              strokeWidth="4"
              strokeLinecap="round"
            />
            <circle cx="50" cy="11" r="5" fill={theme.robotEyeHex} />
          </>
        )}
        {antennaType === 1 && (
          <>
            <line
              x1="36"
              y1="15"
              x2="41"
              y2="26"
              stroke={theme.robotHeadHex}
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <line
              x1="64"
              y1="15"
              x2="59"
              y2="26"
              stroke={theme.robotHeadHex}
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <circle cx="35" cy="14" r="4" fill={theme.robotAccentHex} />
            <circle cx="65" cy="14" r="4" fill={theme.robotAccentHex} />
          </>
        )}
        {antennaType === 2 && <path d="M42 25 L50 12 L58 25 Z" fill={theme.robotAccentHex} />}

        {earType === 0 ? (
          <>
            <rect x="15" y="42" width="8" height="18" rx="4" fill={theme.robotAccentHex} />
            <rect x="77" y="42" width="8" height="18" rx="4" fill={theme.robotAccentHex} />
          </>
        ) : (
          <>
            <circle cx="19" cy="51" r="6" fill={theme.robotAccentHex} />
            <circle cx="81" cy="51" r="6" fill={theme.robotAccentHex} />
          </>
        )}

        <path d="M24 94 C24 79, 76 79, 76 94 Z" fill={theme.robotHeadHex} opacity="0.92" />
        <rect x="42" y="74" width="16" height="9" rx="3" fill={theme.robotAccentHex} />

        <rect x="23" y="25" width="54" height="50" rx="16" fill={theme.robotHeadHex} />
        <rect x="30" y="36" width="40" height="20" rx="9" fill={theme.robotVisorHex} />

        <circle cx="41" cy="46" r="5" fill={theme.robotEyeHex} />
        <circle cx="59" cy="46" r="5" fill={theme.robotEyeHex} />
        <circle cx="42.5" cy="44.5" r="1.6" fill="#ffffff" />
        <circle cx="60.5" cy="44.5" r="1.6" fill="#ffffff" />

        {mouthType === 0 && (
          <path
            d="M41 63 Q50 70 59 63"
            fill="none"
            stroke={theme.robotVisorHex}
            strokeWidth="3.2"
            strokeLinecap="round"
          />
        )}
        {mouthType === 1 && (
          <rect x="39" y="61" width="22" height="6" rx="3" fill={theme.robotVisorHex} />
        )}
        {mouthType === 2 && (
          <path
            d="M40 62 L45 66 L50 62 L55 66 L60 62"
            fill="none"
            stroke={theme.robotVisorHex}
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>
    </div>
  );
}

export default function RegistersPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [hideDuplicates, setHideDuplicates] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  const uniqueCount = useMemo(() => players.filter((p) => !p.isDuplicate).length, []);

  const roleStats = useMemo(() => {
    const active = hideDuplicates ? players.filter((p) => !p.isDuplicate) : players;
    return {
      allRounders: active.filter((p) => p.role === "All rounder").length,
      batsmen: active.filter((p) => p.role === "Batsman").length,
      bowlers: active.filter((p) => p.role === "Bowler").length,
    };
  }, [hideDuplicates]);

  const filteredPlayers = useMemo(() => {
    return players.filter((player) => {
      if (hideDuplicates && player.isDuplicate) return false;

      const matchesSearch =
        player.name.toLowerCase().includes(search.toLowerCase()) ||
        player.role.toLowerCase().includes(search.toLowerCase()) ||
        player.age.toLowerCase().includes(search.toLowerCase()) ||
        player.tier.toLowerCase().includes(search.toLowerCase()) ||
        player.timestamp.toLowerCase().includes(search.toLowerCase());

      const matchesRole = roleFilter === "All" || player.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [search, roleFilter, hideDuplicates]);

  const selectedTheme = useMemo(
    () => (selectedPlayer ? getCardColorTheme(selectedPlayer.id - 1) : null),
    [selectedPlayer]
  );

  return (
    <main className="relative flex min-h-screen flex-col justify-between overflow-x-hidden bg-[#080808] px-4 py-8 text-white md:px-8 xl:px-12">
      {/* Ambient Gold Spotlight */}
      <div className="pointer-events-none fixed inset-x-0 top-0 -z-10 mx-auto h-96 max-w-5xl rounded-full bg-[#c49a45]/[0.06] blur-[120px]" />

      <div className="mx-auto w-full max-w-[1600px]">
        {/* Top Navigation Bar */}
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4 border-b border-[#c49a45]/20 pb-5">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="rounded-lg border border-[#c49a45]/40 bg-[#14120e] px-4 py-2 text-sm font-medium text-[#d8b568] transition hover:border-[#c49a45] hover:bg-[#c49a45]/15"
            >
              ← Back to Home
            </Link>
            <Link
              href="/auction"
              className="rounded-lg bg-gradient-to-r from-[#c49a45] to-[#e2be70] px-4 py-2 text-sm font-bold text-black shadow-[0_0_20px_rgba(196,154,69,0.35)] transition hover:brightness-110"
            >
              Go to Live Auction Room →
            </Link>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-[#c49a45]/30 bg-[#14120d] px-4 py-1.5 text-xs font-semibold tracking-[0.28em] text-[#d8b568]">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            KSL · 2026 AUCTION
          </div>
        </div>

        {/* Hero Title Section */}
        <div className="mb-8 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="mb-2 text-xs font-semibold tracking-[0.35em] text-[#c49a45]">
              OFFICIAL PLAYER ROSTER &amp; SCOUTING
            </p>
            <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">
              Registered{" "}
              <span className="bg-gradient-to-r from-[#c49a45] via-[#f0d48c] to-[#c49a45] bg-clip-text text-transparent">
                Players
              </span>
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-gray-400">
              Verified KSL 2026 auction pool with unique card color signatures, cartoon robot avatars, and base valuations.
            </p>
          </div>

          {/* View Mode & Duplicate Cleaner Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setHideDuplicates(!hideDuplicates)}
              className={`rounded-lg border px-3.5 py-2 text-xs font-semibold transition ${
                hideDuplicates
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                  : "border-amber-500/40 bg-amber-500/10 text-amber-300"
              }`}
            >
              {hideDuplicates ? `✓ Unique Roster (${uniqueCount})` : `Showing All (${players.length})`}
            </button>

            <div className="flex rounded-lg border border-[#c49a45]/30 bg-[#121212] p-1">
              <button
                onClick={() => setViewMode("cards")}
                className={`rounded-md px-3.5 py-1.5 text-xs font-semibold transition ${
                  viewMode === "cards"
                    ? "bg-[#c49a45] text-black"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Grid Cards
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`rounded-md px-3.5 py-1.5 text-xs font-semibold transition ${
                  viewMode === "table"
                    ? "bg-[#c49a45] text-black"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Data Table
              </button>
            </div>
          </div>
        </div>

        {/* KPI Summary Strip */}
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-5">
          <div className="rounded-xl border border-[#c49a45]/30 bg-gradient-to-br from-[#191610] to-[#0f0e0c] p-5">
            <p className="text-[11px] font-semibold tracking-wider text-gray-400">AUCTION POOL</p>
            <p className="mt-1.5 text-3xl font-extrabold text-[#e2be70]">
              {hideDuplicates ? uniqueCount : players.length}
            </p>
            <p className="mt-1 text-[11px] text-gray-500">
              {hideDuplicates ? "2 duplicate entries hidden" : "Raw registration entries"}
            </p>
          </div>

          <div className="rounded-xl border border-[#c49a45]/25 bg-[#12110e] p-5">
            <p className="text-[11px] font-semibold tracking-wider text-gray-400">ALL-ROUNDERS</p>
            <p className="mt-1.5 text-3xl font-extrabold text-[#d8b568]">{roleStats.allRounders}</p>
            <p className="mt-1 text-[11px] text-[#c49a45]/80">Marquee Tier</p>
          </div>

          <div className="rounded-xl border border-sky-500/20 bg-[#0e1318] p-5">
            <p className="text-[11px] font-semibold tracking-wider text-gray-400">BATSMEN</p>
            <p className="mt-1.5 text-3xl font-extrabold text-sky-400">{roleStats.batsmen}</p>
            <p className="mt-1 text-[11px] text-sky-400/70">Gold Tier</p>
          </div>

          <div className="rounded-xl border border-emerald-500/20 bg-[#0e1713] p-5">
            <p className="text-[11px] font-semibold tracking-wider text-gray-400">BOWLERS</p>
            <p className="mt-1.5 text-3xl font-extrabold text-emerald-400">{roleStats.bowlers}</p>
            <p className="mt-1 text-[11px] text-emerald-400/70">Challenger Tier</p>
          </div>

          <div className="col-span-2 rounded-xl border border-[#c49a45]/25 bg-[#12110e] p-5 lg:col-span-1">
            <p className="text-[11px] font-semibold tracking-wider text-gray-400">SHOWING NOW</p>
            <p className="mt-1.5 text-3xl font-extrabold text-white">{filteredPlayers.length}</p>
            <p className="mt-1 text-[11px] text-emerald-400">● Base Price: ₹200</p>
          </div>
        </div>

        {/* Search & Role Filter Bar */}
        <div className="mb-8 flex flex-col gap-3 rounded-xl border border-[#c49a45]/25 bg-[#11100d] p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search player name, age, role, or tier..."
              className="w-full rounded-lg border border-[#c49a45]/30 bg-[#0a0a0a] px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-[#c49a45]"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {["All", "All rounder", "Batsman", "Bowler"].map((role) => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={`rounded-lg border px-4 py-2.5 text-xs font-semibold transition ${
                  roleFilter === role
                    ? "border-[#c49a45] bg-[#c49a45] text-black"
                    : "border-[#c49a45]/25 bg-[#171613] text-gray-300 hover:border-[#c49a45]/60"
                }`}
              >
                {role === "All" ? "All Roles" : role}
              </button>
            ))}
          </div>
        </div>

        {/* GRID CARDS VIEW — EACH CARD WITH ITS OWN UNIQUE COLOR */}
        {viewMode === "cards" && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredPlayers.map((player) => {
              const theme = getCardColorTheme(player.id - 1);

              return (
                <div
                  key={`${player.timestamp}-${player.id}`}
                  onClick={() => setSelectedPlayer(player)}
                  style={{
                    borderColor: theme.borderHex,
                    background: `linear-gradient(160deg, ${theme.softBgHex} 0%, #0d0d0d 55%)`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = `0 14px 32px ${theme.glowHex}`;
                    e.currentTarget.style.borderColor = theme.accentHex;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.style.borderColor = theme.borderHex;
                  }}
                  className="group relative cursor-pointer overflow-hidden rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Top Unique Color Accent Line */}
                  <div
                    style={{ backgroundColor: theme.accentHex }}
                    className="absolute inset-x-0 top-0 h-1 opacity-90"
                  />

                  {/* Top Row: ID & Tier */}
                  <div className="mb-4 flex items-center justify-between">
                    <span
                      style={{ color: theme.badgeTextHex }}
                      className="rounded-md bg-black/50 px-2.5 py-1 font-mono text-xs font-bold"
                    >
                      #{String(player.id).padStart(2, "0")}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {player.isDuplicate && (
                        <span className="rounded-full border border-red-500/40 bg-red-500/15 px-2 py-0.5 text-[10px] font-semibold text-red-300">
                          Duplicate
                        </span>
                      )}
                      <span
                        style={{
                          color: theme.badgeTextHex,
                          borderColor: theme.borderHex,
                        }}
                        className="rounded-full border bg-black/45 px-2.5 py-0.5 text-[10px] font-semibold tracking-wider"
                      >
                        {player.tier}
                      </span>
                    </div>
                  </div>

                  {/* Robot Avatar + Player Name */}
                  <div className="flex items-center gap-4">
                    <RobotAvatar
                      seed={`${player.name}-${player.id}`}
                      theme={theme}
                      size={64}
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-lg font-bold text-white transition">
                        {player.name}
                      </h3>
                      <span
                        style={{
                          color: theme.badgeTextHex,
                          borderColor: theme.borderHex,
                          backgroundColor: "rgba(0,0,0,0.4)",
                        }}
                        className="mt-1.5 inline-block rounded-full border px-3 py-0.5 text-[11px] font-semibold"
                      >
                        {player.role}
                      </span>
                    </div>
                  </div>

                  {/* Player Metadata Box */}
                  <div className="mt-5 grid grid-cols-2 gap-2.5 rounded-xl border border-white/[0.08] bg-black/45 p-3 text-xs">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-gray-400">Age</p>
                      <p className="mt-0.5 font-semibold text-white">
                        {player.age === "Not Provided" ? "N/A" : `${player.age} Yrs`}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-gray-400">Base Price</p>
                      <p style={{ color: theme.badgeTextHex }} className="mt-0.5 font-bold">
                        ₹{player.basePrice}
                      </p>
                    </div>
                  </div>

                  {/* Footer Timestamp */}
                  <div className="mt-3.5 flex items-center justify-between text-[11px] text-gray-400">
                    <span>Reg: {player.timestamp.split(" ")[0]}</span>
                    <span style={{ color: theme.badgeTextHex }} className="font-semibold group-hover:underline">
                      View Card →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TABLE VIEW */}
        {viewMode === "table" && (
          <div className="overflow-hidden rounded-2xl border border-[#c49a45]/25 bg-[#111111]">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-[#c49a45]/30 bg-[#1c1912] text-xs uppercase tracking-wider text-[#d8b568]">
                    <th className="px-5 py-4">#</th>
                    <th className="px-5 py-4">Player</th>
                    <th className="px-5 py-4">Role</th>
                    <th className="px-5 py-4">Age</th>
                    <th className="px-5 py-4">Base Price</th>
                    <th className="px-5 py-4">Timestamp</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredPlayers.map((player) => {
                    const theme = getCardColorTheme(player.id - 1);

                    return (
                      <tr
                        key={`${player.timestamp}-${player.id}`}
                        onClick={() => setSelectedPlayer(player)}
                        className="group cursor-pointer border-b border-white/[0.06] text-sm transition hover:bg-white/[0.04]"
                      >
                        <td
                          style={{ color: theme.badgeTextHex }}
                          className="px-5 py-3.5 font-mono font-semibold"
                        >
                          {player.id}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3.5">
                            <RobotAvatar
                              seed={`${player.name}-${player.id}`}
                              theme={theme}
                              size={42}
                            />
                            <div>
                              <p className="font-bold text-white">{player.name}</p>
                              <p className="text-[11px] text-gray-400">{player.tier} Pool</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            style={{
                              color: theme.badgeTextHex,
                              borderColor: theme.borderHex,
                              backgroundColor: theme.softBgHex,
                            }}
                            className="rounded-full border px-3 py-1 text-xs font-semibold"
                          >
                            {player.role}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-gray-300">{player.age}</td>
                        <td
                          style={{ color: theme.badgeTextHex }}
                          className="px-5 py-3.5 font-bold"
                        >
                          ₹{player.basePrice}
                        </td>
                        <td className="whitespace-nowrap px-5 py-3.5 text-xs text-gray-400">
                          {player.timestamp}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredPlayers.length === 0 && (
          <div className="rounded-2xl border border-[#c49a45]/25 bg-[#111111] px-5 py-16 text-center">
            <p className="text-lg font-semibold text-gray-300">No matching players found</p>
            <p className="mt-1 text-sm text-gray-500">
              Try clearing your search filter or switching roles.
            </p>
          </div>
        )}

        {/* End-of-Roster Summary Banner */}
        {filteredPlayers.length > 0 && (
          <div className="mt-10 flex flex-col items-center justify-between gap-4 rounded-2xl border border-[#c49a45]/25 bg-gradient-to-r from-[#14120d] via-[#191610] to-[#14120d] px-6 py-5 sm:flex-row">
            <div>
              <p className="text-xs font-semibold tracking-[0.25em] text-[#c49a45]">
                END OF REGISTERED ROSTER
              </p>
              <p className="mt-1 text-sm text-gray-300">
                Displaying <span className="font-bold text-white">{filteredPlayers.length}</span> players with unique color identities ready for KSL 2026 Auction.
              </p>
            </div>
            <Link
              href="/auction"
              className="shrink-0 rounded-lg border border-[#c49a45] bg-[#c49a45]/15 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#f0d48c] transition hover:bg-[#c49a45] hover:text-black"
            >
              Proceed to Live Room →
            </Link>
          </div>
        )}
      </div>

      {/* Player Spotlight Modal */}
      {selectedPlayer && selectedTheme && (
        <div
          onClick={() => setSelectedPlayer(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              borderColor: selectedTheme.accentHex,
              background: `linear-gradient(165deg, ${selectedTheme.softBgHex} 0%, #0b0b0b 60%)`,
              boxShadow: `0 0 55px ${selectedTheme.glowHex}`,
            }}
            className="relative w-full max-w-md rounded-2xl border p-6"
          >
            <button
              onClick={() => setSelectedPlayer(null)}
              className="absolute right-4 top-4 rounded-lg border border-white/15 bg-black/40 px-2.5 py-1 text-xs text-gray-300 hover:bg-white/10 hover:text-white"
            >
              ✕ Close
            </button>

            <div className="flex flex-col items-center text-center">
              <span
                style={{
                  color: selectedTheme.badgeTextHex,
                  borderColor: selectedTheme.borderHex,
                }}
                className="mb-3 rounded-full border bg-black/50 px-3 py-1 text-[11px] font-bold tracking-widest"
              >
                PLAYER CARD #{String(selectedPlayer.id).padStart(2, "0")}
              </span>

              <RobotAvatar
                seed={`${selectedPlayer.name}-${selectedPlayer.id}`}
                theme={selectedTheme}
                size={104}
              />

              <h2 className="mt-4 text-2xl font-extrabold text-white">{selectedPlayer.name}</h2>

              <span
                style={{
                  color: selectedTheme.badgeTextHex,
                  borderColor: selectedTheme.borderHex,
                  backgroundColor: "rgba(0,0,0,0.45)",
                }}
                className="mt-2 rounded-full border px-3.5 py-1 text-xs font-semibold"
              >
                {selectedPlayer.role}
              </span>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 rounded-xl border border-white/10 bg-black/55 p-4 text-sm">
              <div>
                <p className="text-xs text-gray-400">Age</p>
                <p className="font-semibold text-white">{selectedPlayer.age}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Base Price</p>
                <p style={{ color: selectedTheme.badgeTextHex }} className="font-bold">
                  ₹{selectedPlayer.basePrice}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Auction Tier</p>
                <p className="font-semibold text-gray-200">{selectedPlayer.tier}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Registered At</p>
                <p className="text-xs text-gray-300">{selectedPlayer.timestamp}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mx-auto mt-10 w-full max-w-[1600px] border-t border-white/[0.07] pt-5 text-center text-xs tracking-wider text-gray-500">
        KSL · St. John&apos;s English Medium School · Nellore
      </footer>
    </main>
  );
}