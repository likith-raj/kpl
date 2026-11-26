"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Work_Sans } from "next/font/google";
import { io, Socket } from "socket.io-client";

const workSans = Work_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export default function AdminLoginPage() {
  const router = useRouter();
  const socketRef = useRef<Socket | null>(null);

  const [isConnected, setIsConnected] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const socket = io("http://localhost:4000", { transports: ["websocket"] });
    socketRef.current = socket;

    socket.on("connect", () => setIsConnected(true));
    socket.on("disconnect", () => setIsConnected(false));

    socket.on("admin:login:success", (data: { email: string; token: string }) => {
      if (!data.token) {
        setLoginError("Login token was not received.");
        setIsLoading(false);
        return;
      }
      sessionStorage.setItem("ksl_admin", "true");
      sessionStorage.setItem("ksl_admin_email", data.email);
      sessionStorage.setItem("ksl_admin_token", data.token);
      router.push("/admin");
    });

    socket.on("admin:login:error", (msg: string) => {
      setLoginError(msg || "Invalid email or password");
      setIsLoading(false);
    });

    return () => { socket.disconnect(); };
  }, [router]);

  const handleLogin = () => {
    if (!socketRef.current) return;
    if (!email || !password) {
      setLoginError("Please enter email and password");
      return;
    }
    setIsLoading(true);
    setLoginError("");
    socketRef.current.emit("admin:login", { email, password });
  };

  return (
    <div
      className={`${workSans.className} relative min-h-screen w-full overflow-hidden bg-[#030303] text-white`}
      style={{ fontFamily: "'Work Sans', sans-serif" }}
    >
      {/* Background gradient orbs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-[#FACC15]/5 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-[#FACC15]/3 blur-[120px]" />
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FACC15]/2 blur-[160px]" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#FACC15 1px, transparent 1px), linear-gradient(90deg, #FACC15 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md">
          {/* Logo / Brand */}
          <div className="mb-10 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl border border-[#FACC15]/30 bg-[#FACC15]/10 shadow-[0_0_40px_rgba(250,204,21,0.15)]">
              <span className="text-4xl">🏏</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white">KPL Auction</h1>
            <p className="mt-1 text-sm text-zinc-500">Admin Control Panel</p>
          </div>

          {/* Login Card */}
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0a] shadow-[0_0_60px_rgba(0,0,0,0.6)]">
            {/* Top accent bar */}
            <div className="h-1 w-full bg-gradient-to-r from-transparent via-[#FACC15] to-transparent" />

            <div className="p-8">
              {/* Status indicator */}
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">Sign In</h2>
                <div className="flex items-center gap-2 rounded-full border border-white/10 bg-[#141414] px-3 py-1.5">
                  <span
                    className={`h-2 w-2 rounded-full ${isConnected ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]" : "bg-rose-400"}`}
                  />
                  <span className="text-xs font-medium text-zinc-400">
                    {isConnected ? "Server Online" : "Connecting…"}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                {/* Email */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-zinc-500">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@kpl.com"
                    autoComplete="off"
                    className="w-full rounded-xl border border-white/10 bg-[#141414] px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none transition focus:border-[#FACC15]/60 focus:bg-[#161616] focus:shadow-[0_0_0_3px_rgba(250,204,21,0.08)]"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-zinc-500">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                      placeholder="••••••••"
                      autoComplete="off"
                      className="w-full rounded-xl border border-white/10 bg-[#141414] px-4 py-3 pr-12 text-sm text-white placeholder-zinc-600 outline-none transition focus:border-[#FACC15]/60 focus:bg-[#161616] focus:shadow-[0_0_0_3px_rgba(250,204,21,0.08)]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 transition hover:text-zinc-300"
                    >
                      {showPassword ? "🙈" : "👁️"}
                    </button>
                  </div>
                </div>

                {/* Error */}
                {loginError && (
                  <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3">
                    <span className="text-sm">⚠️</span>
                    <p className="text-xs font-medium text-rose-400">{loginError}</p>
                  </div>
                )}

                {/* Login Button */}
                <button
                  type="button"
                  onClick={handleLogin}
                  disabled={!isConnected || isLoading || !email || !password}
                  className="mt-2 w-full rounded-xl bg-[#FACC15] py-3.5 text-sm font-black tracking-wide text-black transition-all hover:bg-[#FDE047] hover:shadow-[0_0_30px_rgba(250,204,21,0.3)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-30"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Authenticating…
                    </span>
                  ) : isConnected ? (
                    "Access Admin Panel →"
                  ) : (
                    "Connecting to server…"
                  )}
                </button>
              </div>

              <p className="mt-6 text-center text-xs text-zinc-700">
                KPL · St. John's English Medium School · Nellore
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
