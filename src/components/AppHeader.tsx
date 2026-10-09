"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { toast } from "sonner";

import { endSession } from "@/app/actions/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";

export default function AppHeader() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const handleLogout = async () => {
    setBusy(true);
    try {
      await endSession();
      await signOut(auth); 
      router.replace("/");
      router.refresh();
    } catch {
      toast.error("Could not log out. Please try again");
      setBusy(false);
    }
  };

  return (
    <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            N
          </span>
          NexusMedia
        </Link>
        <Button variant="outline" size="sm" onClick={handleLogout} disabled={busy}>
          {busy ? "Logging out…" : "Log out"}
        </Button>
      </div>
    </header>
  );
}