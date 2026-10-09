"use server";

import { revalidatePath } from "next/cache";
import { getAdminDb } from "@/lib/firebase-admin";
import { getSessionUser } from "@/lib/session";
import { updateProfileSchema, type UpdateProfileValues } from "@/schemas/profileSchema";
import type { ActionResult } from "@/types/action";

export async function updateProfile(input: UpdateProfileValues): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "You must be logged in" };

  const parsed = updateProfileSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  try {
    await getAdminDb().collection("users").doc(user.uid).update(parsed.data);
    revalidatePath("/dashboard");
    revalidatePath(`/users/${user.uid}`);
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not update profile" };
  }
}