"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  LogOut,
  Copy,
  Check,
  Loader2,
  ChevronUp,
  Wifi,
  WifiOff,
} from "lucide-react";
import { getRoom, getMessages, type Message, type Room } from "@/lib/api";
import { connectStomp, sendMessage, disconnectStomp } from "@/lib/stomp";
import { cn } from "@/lib/utils";

interface ChatNexusProps {
  roomId: string;
}

export default function ChatNexus({ roomId }: ChatNexusProps) {
  const router = useRouter();
  const [room, setRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [username, setUsername] = useState("");
  const [connected, setConnected] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [copied, setCopied] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const prevScrollHeightRef = useRef<number>(0);

  // Load username from session
  useEffect(() => {
    const stored = sessionStorage.getItem("chat_username");
    if (!stored) {
      router.push("/");
      return;
    }
    setUsername(stored);
  }, [router]);

  // Fetch room details
  useEffect(() => {
    if (!roomId) return;
    getRoom(roomId).then((r) => {
      if (!r) {
        router.push("/");
        return;
      }
      setRoom(r);
    });
  }, [roomId, router]);

  // Load initial messages
  useEffect(() => {
    if (!roomId) return;
    getMessages(roomId, 0, 50).then((page) => {
      // Messages come in descending order from API, reverse for chronological display
      setMessages(page.content.slice().reverse());
      setCurrentPage(0);
      setHasMore(!page.last);
      setInitialLoad(false);
    });
  }, [roomId]);

  // Connect WebSocket
  useEffect(() => {
    if (!roomId || !username) return;
    connectStomp(
      roomId,
      (msg) => {
        setMessages((prev) => {
          // Deduplicate by checking if message ID already exists
          if (msg.id && prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      },
      () => setConnected(true),
      () => setConnected(false)
    );
    return () => {
      disconnectStomp();
      setConnected(false);
    };
  }, [roomId, username]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (initialLoad) return;
    const container = scrollContainerRef.current;
    if (!container) return;
    // Only auto-scroll if user is near bottom
    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight <
      150;
    if (isNearBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, initialLoad]);

  // Scroll to bottom on initial load
  useEffect(() => {
    if (!initialLoad && messages.length > 0) {
      messagesEndRef.current?.scrollIntoView();
    }
  }, [initialLoad]); // eslint-disable-line react-hooks/exhaustive-deps

  // Intersection Observer for infinite scroll (load older messages)
  const loadMoreMessages = useCallback(async () => {
    if (loadingHistory || !hasMore) return;
    setLoadingHistory(true);
    const container = scrollContainerRef.current;
    if (container) {
      prevScrollHeightRef.current = container.scrollHeight;
    }
    try {
      const nextPage = currentPage + 1;
      const page = await getMessages(roomId, nextPage, 50);
      const olderMessages = page.content.slice().reverse();
      setMessages((prev) => [...olderMessages, ...prev]);
      setCurrentPage(nextPage);
      setHasMore(!page.last);
    } catch {
      // silently fail
    } finally {
      setLoadingHistory(false);
    }
  }, [loadingHistory, hasMore, currentPage, roomId]);

  // Preserve scroll position after loading older messages
  useEffect(() => {
    if (!loadingHistory && prevScrollHeightRef.current > 0) {
      const container = scrollContainerRef.current;
      if (container) {
        const newScrollHeight = container.scrollHeight;
        container.scrollTop =
          newScrollHeight - prevScrollHeightRef.current;
        prevScrollHeightRef.current = 0;
      }
    }
  }, [messages, loadingHistory]);

  // Set up Intersection Observer
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingHistory && !initialLoad) {
          loadMoreMessages();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadingHistory, initialLoad, loadMoreMessages]);

  function handleSend() {
    const text = input.trim();
    if (!text || !connected) return;
    sendMessage(roomId, username, text);
    setInput("");
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleCopyCode() {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleLeave() {
    disconnectStomp();
    router.push("/");
  }

  function formatTime(ts: string) {
    try {
      const date = new Date(ts);
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  }

  if (initialLoad) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#09090b]">
        <Loader2 className="h-6 w-6 animate-spin text-violet-400" />
      </div>
    );
  }

  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-[#09090b]">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-0 h-64 w-64 rounded-full bg-violet-600/8 blur-[100px]" />
        <div className="absolute -right-32 bottom-0 h-64 w-64 rounded-full bg-cyan-500/6 blur-[100px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between border-b border-white/[0.04] bg-white/[0.01] px-4 py-3 backdrop-blur-xl sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {connected ? (
              <Wifi className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <WifiOff className="h-3.5 w-3.5 text-red-400" />
            )}
            <h1 className="text-sm font-semibold text-white font-[family-name:var(--font-geist-sans)]">
              {room?.roomName || "Loading..."}
            </h1>
          </div>
          <button
            onClick={handleCopyCode}
            className="group flex items-center gap-1.5 rounded-md border border-white/[0.06] bg-white/[0.03] px-2.5 py-1 text-[11px] font-medium tracking-widest text-zinc-500 transition-colors hover:border-violet-500/30 hover:text-violet-400 font-[family-name:var(--font-geist-mono)]"
          >
            {roomId}
            {copied ? (
              <Check className="h-3 w-3 text-emerald-400" />
            ) : (
              <Copy className="h-3 w-3 opacity-50 group-hover:opacity-100" />
            )}
          </button>
        </div>
        <button
          onClick={handleLeave}
          className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:border-red-500/30 hover:bg-red-500/[0.04] hover:text-red-400"
        >
          <LogOut className="h-3.5 w-3.5" />
          Leave
        </button>
      </header>

      {/* Messages area */}
      <div
        ref={scrollContainerRef}
        className="relative z-10 flex-1 overflow-y-auto px-4 py-4 sm:px-6"
      >
        {/* Sentinel for intersection observer */}
        <div ref={sentinelRef} className="h-1" />

        {/* Loading indicator for older messages */}
        <AnimatePresence>
          {loadingHistory && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center gap-2 py-3"
            >
              <Loader2 className="h-4 w-4 animate-spin text-zinc-500" />
              <span className="text-xs text-zinc-500">Loading history...</span>
            </motion.div>
          )}
        </AnimatePresence>

        {hasMore && !loadingHistory && messages.length > 0 && (
          <button
            onClick={loadMoreMessages}
            className="mx-auto mb-4 flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.02] px-4 py-1.5 text-[11px] text-zinc-500 transition-colors hover:border-white/[0.1] hover:text-zinc-300"
          >
            <ChevronUp className="h-3 w-3" />
            Load older messages
          </button>
        )}

        {/* Messages */}
        <div className="mx-auto max-w-2xl space-y-1">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="mb-3 text-2xl">💬</div>
              <p className="text-sm text-zinc-500">
                No messages yet. Start the conversation.
              </p>
            </div>
          )}

          {messages.map((msg, i) => {
            const isMe = msg.sender === username;
            const showSender =
              i === 0 || messages[i - 1].sender !== msg.sender;

            return (
              <motion.div
                key={msg.id || `${msg.sender}-${msg.timestamp}-${i}`}
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  duration: 0.3,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className={cn(
                  "flex",
                  isMe ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[75%] sm:max-w-[65%]",
                    showSender ? "mt-3" : "mt-0.5"
                  )}
                >
                  {showSender && (
                    <p
                      className={cn(
                        "mb-1 text-[11px] font-medium",
                        isMe ? "text-right text-violet-400/70" : "text-cyan-400/70"
                      )}
                    >
                      {isMe ? "You" : msg.sender}
                    </p>
                  )}
                  <div
                    className={cn(
                      "rounded-xl px-3.5 py-2 text-[13px] leading-relaxed",
                      isMe
                        ? "rounded-br-sm bg-violet-600/20 text-violet-100 border border-violet-500/10"
                        : "rounded-bl-sm bg-white/[0.04] text-zinc-300 border border-white/[0.04]"
                    )}
                  >
                    <p className="break-words whitespace-pre-wrap">{msg.content}</p>
                    <p
                      className={cn(
                        "mt-1 text-[10px]",
                        isMe ? "text-violet-400/40 text-right" : "text-zinc-600"
                      )}
                    >
                      {formatTime(msg.timestamp)}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area */}
      <div className="relative z-10 border-t border-white/[0.04] bg-white/[0.01] p-4 backdrop-blur-xl sm:px-6">
        <div className="mx-auto flex max-w-2xl items-end gap-3">
          <div className="flex-1 rounded-xl border border-white/[0.06] bg-white/[0.03] transition-colors focus-within:border-violet-500/30 focus-within:bg-white/[0.04]">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={connected ? "Type a message..." : "Connecting..."}
              disabled={!connected}
              rows={1}
              className="w-full resize-none bg-transparent px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 disabled:opacity-40 font-[family-name:var(--font-geist-sans)]"
              style={{ maxHeight: "120px" }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "auto";
                target.style.height = Math.min(target.scrollHeight, 120) + "px";
              }}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim() || !connected}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white transition-all duration-200 hover:bg-violet-500 disabled:opacity-30 disabled:hover:bg-violet-600"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
