"use server";

import { revalidatePath } from "next/cache";
import { getAdminDb } from "@/lib/firebase-admin";
import { getSessionUser } from "@/lib/session";
import { idSchema } from "@/schemas/common";
import { commentSchema, type CommentValues } from "@/schemas/commentSchema";
import type { ActionResult } from "@/types/action";
import type { StoredComment } from "@/types/comment";

function refresh(profileUid: string) {
  revalidatePath("/dashboard");
  revalidatePath(`/users/${profileUid}`);
}

export async function addComment(profileUid: string, input: CommentValues): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "You must be logged in" };

  const id = idSchema.safeParse(profileUid);
  const parsed = commentSchema.safeParse(input);
  if (!id.success || !parsed.success) return { ok: false, error: "Invalid comment" };

  try {
    const profileRef = getAdminDb().collection("users").doc(id.data);
    if (!(await profileRef.get()).exists) return { ok: false, error: "Profile not found" };

    const comment: StoredComment = {
      authorUid: user.uid,
      text: parsed.data.text,
      createdAt: new Date().toISOString(),
    };
    await profileRef.collection("comments").add(comment);
    refresh(id.data);
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not post comment" };
  }
}

export async function deleteComment(profileUid: string, commentId: string): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "You must be logged in" };

  const profileId = idSchema.safeParse(profileUid);
  const cid = idSchema.safeParse(commentId);
  if (!profileId.success || !cid.success) return { ok: false, error: "Invalid request" };

  try {
    const ref = getAdminDb()
      .collection("users").doc(profileId.data)
      .collection("comments").doc(cid.data);
    const snapshot = await ref.get();
    if (!snapshot.exists) return { ok: false, error: "Comment not found" };

    const { authorUid } = snapshot.data() as StoredComment;
    // Authorization: the comment's author or the profile's owner
    if (authorUid !== user.uid && profileId.data !== user.uid) {
      return { ok: false, error: "You can't delete this comment" };
    }
    await ref.delete();
    refresh(profileId.data);
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not delete comment" };
  }
}