"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, Zap, Hash } from "lucide-react";
import { createRoom, getRoom } from "@/lib/api";

type Mode = "idle" | "create" | "join";

export default function RoomPortal() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("idle");
  const [roomName, setRoomName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    if (!roomName.trim() || !username.trim()) {
      setError("Room name and username are required");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const room = await createRoom(roomName.trim());
      sessionStorage.setItem("chat_username", username.trim());
      router.push(`/chat?roomId=${room.id}`);
    } catch {
      setError("Failed to initialize room. Is the server running?");
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin() {
    if (!roomCode.trim() || !username.trim()) {
      setError("Room code and username are required");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const room = await getRoom(roomCode.trim());
      if (!room) {
        setError("Room not found. Check the code and try again.");
        return;
      }
      sessionStorage.setItem("chat_username", username.trim());
      router.push(`/chat?roomId=${room.id}`);
    } catch {
      setError("Connection failed. Is the server running?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#09090b]">
      {/* Ambient background effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-violet-600/10 blur-[128px]" />
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-cyan-500/8 blur-[128px]" />
        <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-fuchsia-500/5 blur-[96px]" />
      </div>

      {/* Grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-lg px-6"
      >
        {/* Header */}
        <div className="mb-10 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.03] px-4 py-1.5 text-xs font-medium tracking-widest text-zinc-400 uppercase"
          >
            <Zap className="h-3 w-3 text-violet-400" />
            Real-time Protocol
          </motion.div>
          <h1 className="font-[family-name:var(--font-geist-sans)] text-5xl font-bold tracking-tight text-white">
            Nexus
          </h1>
          <p className="mt-2 text-sm tracking-wide text-zinc-500">
            Encrypted channels. Zero latency.
          </p>
        </div>

        {/* Bento Card */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-1 backdrop-blur-xl">
          <div className="rounded-xl border border-white/[0.04] bg-gradient-to-b from-white/[0.03] to-transparent p-6">
            {/* Username field - always visible */}
            <div className="mb-5">
              <label className="mb-1.5 block text-[11px] font-medium tracking-widest text-zinc-500 uppercase">
                Identity
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your callsign"
                maxLength={24}
                className="w-full rounded-lg border border-white/[0.06] bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition-all duration-200 placeholder:text-zinc-600 focus:border-violet-500/40 focus:bg-white/[0.05] focus:ring-1 focus:ring-violet-500/20 font-[family-name:var(--font-geist-mono)]"
              />
            </div>

            {/* Action buttons */}
            <AnimatePresence mode="wait">
              {mode === "idle" && (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-2 gap-3"
                >
                  <button
                    onClick={() => { setMode("create"); setError(""); }}
                    className="group relative flex flex-col items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 text-center transition-all duration-300 hover:border-violet-500/30 hover:bg-violet-500/[0.04]"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400 transition-colors group-hover:bg-violet-500/20">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">Initialize</div>
                      <div className="text-[11px] text-zinc-500">Create a room</div>
                    </div>
                  </button>
                  <button
                    onClick={() => { setMode("join"); setError(""); }}
                    className="group relative flex flex-col items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 text-center transition-all duration-300 hover:border-cyan-500/30 hover:bg-cyan-500/[0.04]"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 transition-colors group-hover:bg-cyan-500/20">
                      <Hash className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">Phase-In</div>
                      <div className="text-[11px] text-zinc-500">Join a room</div>
                    </div>
                  </button>
                </motion.div>
              )}

              {mode === "create" && (
                <motion.div
                  key="create"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="mb-1.5 block text-[11px] font-medium tracking-widest text-zinc-500 uppercase">
                      Room Name
                    </label>
                    <input
                      type="text"
                      value={roomName}
                      onChange={(e) => setRoomName(e.target.value)}
                      placeholder="Name your channel"
                      maxLength={48}
                      autoFocus
                      className="w-full rounded-lg border border-white/[0.06] bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition-all duration-200 placeholder:text-zinc-600 focus:border-violet-500/40 focus:bg-white/[0.05] focus:ring-1 focus:ring-violet-500/20 font-[family-name:var(--font-geist-mono)]"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => { setMode("idle"); setError(""); }}
                      className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 text-xs font-medium text-zinc-400 transition-colors hover:bg-white/[0.06] hover:text-white"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleCreate}
                      disabled={loading}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-xs font-semibold text-white transition-all duration-200 hover:bg-violet-500 disabled:opacity-50"
                    >
                      {loading ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      ) : (
                        <>
                          Initialize <ArrowRight className="h-3.5 w-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}

              {mode === "join" && (
                <motion.div
                  key="join"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="mb-1.5 block text-[11px] font-medium tracking-widest text-zinc-500 uppercase">
                      Room Code
                    </label>
                    <input
                      type="text"
                      value={roomCode}
                      onChange={(e) => setRoomCode(e.target.value.toLowerCase())}
                      placeholder="6-character code"
                      maxLength={6}
                      autoFocus
                      className="w-full rounded-lg border border-white/[0.06] bg-white/[0.03] px-4 py-3 text-center text-lg font-bold tracking-[0.3em] text-white outline-none transition-all duration-200 placeholder:text-zinc-600 placeholder:text-sm placeholder:font-normal placeholder:tracking-normal focus:border-cyan-500/40 focus:bg-white/[0.05] focus:ring-1 focus:ring-cyan-500/20 font-[family-name:var(--font-geist-mono)]"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => { setMode("idle"); setError(""); }}
                      className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 text-xs font-medium text-zinc-400 transition-colors hover:bg-white/[0.06] hover:text-white"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleJoin}
                      disabled={loading}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-cyan-600 px-4 py-2.5 text-xs font-semibold text-white transition-all duration-200 hover:bg-cyan-500 disabled:opacity-50"
                    >
                      {loading ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      ) : (
                        <>
                          Phase-In <ArrowRight className="h-3.5 w-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-4 text-center text-xs text-red-400/80"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-[11px] text-zinc-600">
          WebSocket STOMP &middot; End-to-end
        </p>
      </motion.div>
    </div>
  );
}
