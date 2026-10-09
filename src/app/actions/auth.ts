"use server";

import { cookies } from "next/headers";
import { z } from "zod";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { SESSION_COOKIE, SESSION_MAX_AGE_MS } from "@/lib/session";
import type { ActionResult } from "@/types/action";
import type { UserProfile } from "@/types/user";

const startSessionSchema = z.object({
  idToken: z.string().min(1),
  fullName: z.string().trim().min(1).max(50).optional(),
});

export async function startSession(
  input: z.infer<typeof startSessionSchema>,
): Promise<ActionResult> {
  const parsed = startSessionSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid request" };

  try {
    const auth = getAdminAuth();
    const decoded = await auth.verifyIdToken(parsed.data.idToken);

    const ref = getAdminDb().collection("users").doc(decoded.uid);
    const existing = await ref.get();
    if (!existing.exists) {
      const tokenName = typeof decoded.name === "string" ? decoded.name : null;
      const tokenPicture = typeof decoded.picture === "string" ? decoded.picture : null;
      const profile: UserProfile = {
        uid: decoded.uid,
        fullName: parsed.data.fullName ?? tokenName ?? "New user",
        email: decoded.email ?? "",
        bio: "",
        photoURL: tokenPicture,
        createdAt: new Date().toISOString(),
      };
      await ref.set(profile);
    }

    const sessionCookie = await auth.createSessionCookie(parsed.data.idToken, {
      expiresIn: SESSION_MAX_AGE_MS,
    });
    (await cookies()).set(SESSION_COOKIE, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE_MS / 1000,
    });
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not sign you in. Please try again" };
  }
}

export async function endSession(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}