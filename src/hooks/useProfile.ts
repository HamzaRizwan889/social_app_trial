"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { UserProfile } from "@/types/user";

interface ProfileResult {
  uid: string;
  profile: UserProfile | null;
}

export function useProfile(uid: string | undefined) {
  const [result, setResult] = useState<ProfileResult | null>(null);

  useEffect(() => {
    if (!uid) return;
    return onSnapshot(
      doc(db, "users", uid),
      (snapshot) =>
        setResult({ uid, profile: snapshot.exists() ? (snapshot.data() as UserProfile) : null }),
      () => setResult({ uid, profile: null }),
    );
  }, [uid]);

  const current = result !== null && result.uid === uid ? result : null;
  return { profile: current?.profile ?? null, loading: current === null };
}