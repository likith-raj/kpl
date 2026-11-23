"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Work_Sans } from "next/font/google";
import { io, Socket } from "socket.io-client";

const workSans = Work_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export default function AdminLoginPage() {
  const router = useRouter();
  const socketRef = useRef<Socket | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  const [isConnected, setIsConnected] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [pos, setPos] = useState({ x: 100, y: 100 });
  const [dragging, setDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const socket = io("http://localhost:4000", { transports: ["websocket"] });
    socketRef.current = socket;

    socket.on("connect", () => setIsConnected(true));
    socket.on("disconnect", () => setIsConnected(false));

    socket.on("admin:login:success", (data: { email: string }) => {
      sessionStorage.setItem("ksl_admin", "true");
      sessionStorage.setItem("ksl_admin_email", data.email);
      router.push("/admin");
    });

    socket.on("admin:login:error", (msg: string) => {
      setLoginError(msg || "Invalid email or password");
      setIsLoading(false);
    });

    return () => {
      socket.disconnect();
    };
  }, [router]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!boxRef.current) return;
    setDragging(true);
    dragOffset.current = {
      x: e.clientX - pos.x,
      y: e.clientY - pos.y,
    };
  };

  useEffect(() => {
    if (!dragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      setPos({
        x: Math.max(0, Math.min(window.innerWidth - 380, e.clientX - dragOffset.current.x)),
        y: Math.max(0, Math.min(window.innerHeight - 320, e.clientY - dragOffset.current.y)),
      });
    };

    const handleMouseUp = () => setDragging(false);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging]);

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
    <div className={`${workSans.className} relative min-h-screen w-full bg-[#050505] text-white`}>
      <div
        ref={boxRef}
        style={{ left: pos.x, top: pos.y }}
        className="fixed z-50 w-[380px] rounded-xl border border-[#FACC15]/30 bg-[#0c0c0c] shadow-2xl"
      >
        <div
          onMouseDown={handleMouseDown}
          className={`flex cursor-move items-center justify-between rounded-t-xl bg-[#141414] px-4 py-2.5 ${dragging ? "cursor-grabbing" : ""}`}
        >
          <div className="flex items-center gap-2">
            <span className="text-base">🔒</span>
            <span className="text-sm font-bold text-[#FACC15]">Admin Access</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${isConnected ? "bg-emerald-400" : "bg-rose-400"}`} />
            <span className="text-[10px] text-zinc-500">{isConnected ? "Connected" : "Offline"}</span>
          </div>
        </div>

        <div className="p-4">
          <p className="text-xs text-zinc-400">Enter admin credentials to continue</p>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            autoComplete="off"
            className="mt-3 w-full rounded-lg border border-white/15 bg-[#141414] px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-[#FACC15]"
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            placeholder="Password"
            autoComplete="off"
            className="mt-2 w-full rounded-lg border border-white/15 bg-[#141414] px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-[#FACC15]"
          />

          {loginError && <p className="mt-2 text-xs text-rose-400">{loginError}</p>}

          <button
            type="button"
            onClick={handleLogin}
            disabled={!isConnected || isLoading || !email || !password}
            className="mt-3 w-full rounded-lg bg-[#FACC15] px-4 py-2 text-sm font-bold text-black transition hover:opacity-90 disabled:opacity-40"
          >
            {isLoading ? "Logging in..." : isConnected ? "Login" : "Connecting..."}
          </button>

          <p className="mt-2 text-center text-[10px] text-zinc-600">
            Drag this box anywhere · Only one admin allowed
          </p>
        </div>
      </div>

      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-zinc-800">KSL Auction</h1>
          <p className="mt-2 text-sm text-zinc-700">Drag the admin box to position it anywhere</p>
        </div>
      </div>
    </div>
  );
}