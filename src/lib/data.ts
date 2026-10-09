import "server-only";
import { getAdminDb } from "@/lib/firebase-admin";
import type { CommentWithAuthor, StoredComment } from "@/types/comment";
import type { UserProfile } from "@/types/user";

export async function getProfile(uid: string): Promise<UserProfile | null> {
  const snapshot = await getAdminDb().collection("users").doc(uid).get();
  return snapshot.exists ? (snapshot.data() as UserProfile) : null;
}

export async function getOtherUsers(ownUid: string): Promise<UserProfile[]> {
  const snapshot = await getAdminDb().collection("users").get();
  return snapshot.docs
    .map((d) => d.data() as UserProfile)
    .filter((p) => p.uid !== ownUid)
    .sort((a, b) => a.fullName.localeCompare(b.fullName));
}

export async function getComments(profileUid: string): Promise<CommentWithAuthor[]> {
  const db = getAdminDb();
  const snapshot = await db
    .collection("users").doc(profileUid).collection("comments")
    .orderBy("createdAt", "desc")
    .get();

  const stored = snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as StoredComment) }));

  // Look up each author's CURRENT profile so names/photos are never stale
  const authorUids = [...new Set(stored.map((c) => c.authorUid))];
  const authorSnaps = authorUids.length
    ? await db.getAll(...authorUids.map((uid) => db.collection("users").doc(uid)))
    : [];
  const authors = new Map<string, UserProfile>();
  authorSnaps.forEach((s) => {
    if (s.exists) authors.set(s.id, s.data() as UserProfile);
  });

  return stored.map((c) => ({
    id: c.id,
    authorUid: c.authorUid,
    text: c.text,
    createdAt: c.createdAt,
    authorName: authors.get(c.authorUid)?.fullName ?? "Deleted user",
    authorPhotoURL: authors.get(c.authorUid)?.photoURL ?? null,
  }));
}