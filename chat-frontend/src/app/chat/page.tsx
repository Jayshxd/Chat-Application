"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useMemo } from "react";
import ChatNexus from "@/components/ChatNexus";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

function ChatContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const roomId = useMemo(() => {
    const id = searchParams.get("roomId");
    if (!id) {
      return null;
    }
    return id;
  }, [searchParams]);

  if (!roomId) {
    router.push("/");
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#09090b]">
        <Loader2 className="h-6 w-6 animate-spin text-violet-400" />
      </div>
    );
  }

  return <ChatNexus roomId={roomId} />;
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#09090b]">
          <Loader2 className="h-6 w-6 animate-spin text-violet-400" />
        </div>
      }
    >
      <ChatContent />
    </Suspense>
  );
}
