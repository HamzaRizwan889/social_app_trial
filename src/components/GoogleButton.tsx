"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FirebaseError } from "firebase/app";
import {
  browserPopupRedirectResolver,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { toast } from "sonner";

import { startSession } from "@/app/actions/auth";
import { auth } from "@/lib/firebase";
import { getAuthErrorMessage } from "@/lib/authErrors";
import { Button } from "@/components/ui/button";

export default function GoogleButton() {
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  const handleClick = async () => {
    setBusy(true);
    try {
      const { user } = await signInWithPopup(
        auth,
        new GoogleAuthProvider(),
        browserPopupRedirectResolver,
      );

      const result = await startSession({ idToken: await user.getIdToken() });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      router.push("/dashboard");
    } catch (error: unknown) {
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