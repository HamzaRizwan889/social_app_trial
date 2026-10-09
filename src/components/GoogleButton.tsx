"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FirebaseError } from "firebase/app";
import {
  browserPopupRedirectResolver,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { toast } from "sonner";

import { auth, db } from "@/lib/firebase";
import { getAuthErrorMessage } from "@/lib/authErrors";
import type { UserProfile } from "@/types/user";
import { Button } from "@/components/ui/button";

export default function GoogleButton() {
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  const handleClick = async () => {
    setBusy(true);
    try {
      const { user } = await signInWithPopup(
        startSession({ idToken: await user.getIdToken() }),
        auth,
        new GoogleAuthProvider(),
        browserPopupRedirectResolver,
      );
      const ref = doc(db, "users", user.uid);

      const existing = await getDoc(ref);
      if (!existing.exists()) {
        const profile: UserProfile = {
          uid: user.uid,
          fullName: user.displayName ?? "New user",
          email: user.email ?? "",
          bio: "",
          photoURL: user.photoURL,
          createdAt: new Date().toISOString(),
        };
        await setDoc(ref, profile);
      }
      router.push("/dashboard");
   } catch (error: unknown) {
    console.error("Google sign-in error:", error);
    const closed = error instanceof FirebaseError && error.code === "auth/popup-closed-by-user";
    if (!closed) toast.error(getAuthErrorMessage(error));

    } finally {
      setBusy(false);
    }
  };

  return (
    <Button type="button" variant="outline" className="w-full" onClick={handleClick} disabled={busy}>
      {busy ? "Connecting…" : "Continue with Google"}
    </Button>
  );
}