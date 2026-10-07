"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, onSnapshot } from "firebase/firestore";
import { toast } from "sonner";

import { db } from "@/lib/firebase";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useProfile } from "@/hooks/useProfile";
import type { UserProfile } from "@/types/user";
import AppHeader from "@/components/AppHeader";
import CommentSection from "@/components/CommentSection";
import EditProfileDialog from "@/components/EditProfileDialog";
import PageLoader from "@/components/PageLoader";
import UserAvatar from "@/components/UserAvatar";
import { Input } from "@/components/ui/input";

export default function DashboardPage() {
  const { user, loading } = useRequireAuth();
  const { profile } = useProfile(user?.uid);
  const [users, setUsers] = useState<UserProfile[] | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!user) return;
    const ownUid = user.uid;
    return onSnapshot(
      collection(db, "users"),
      (snapshot) =>
        setUsers(snapshot.docs.map((d) => d.data() as UserProfile).filter((p) => p.uid !== ownUid)),
      () => toast.error("Could not load users"),
    );
  }, [user]);

  if (loading || !user) return <PageLoader />;

  const term = search.trim().toLowerCase();
  const visibleUsers = (users ?? [])
    .filter((u) => u.fullName.toLowerCase().includes(term))
    .sort((a, b) => a.fullName.localeCompare(b.fullName));

  return (
    <div className="min-h-screen bg-muted/30">
      <AppHeader />
      <main className="mx-auto grid max-w-5xl gap-6 p-6 lg:grid-cols-[320px_1fr]">
        <aside>
          <section className="overflow-hidden rounded-xl border bg-card shadow-sm">
            <div className="h-24 bg-gradient-to-r from-primary to-primary/50" />
            <div className="px-6 pb-6">
              {profile ? (
                <>
                  <UserAvatar
                    name={profile.fullName}
                    photoURL={profile.photoURL}
                    className="-mt-12 h-24 w-24 text-2xl ring-4 ring-card"
                  />
                  <h1 className="mt-3 text-xl font-semibold">{profile.fullName}</h1>
                  <p className="text-sm text-muted-foreground">{profile.email}</p>
                  <p className="mt-3 whitespace-pre-wrap text-sm">
                    {profile.bio || "No bio yet. Add one!"}
                  </p>
                  <div className="mt-4">
                    <EditProfileDialog profile={profile} />
                  </div>
                </>
              ) : (
                <p className="pt-6 text-sm text-muted-foreground">Loading profile…</p>
              )}
            </div>
          </section>
        </aside>

        <div className="space-y-6">
          <section className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-semibold">People</h2>
              <Input
                className="sm:max-w-xs"
                placeholder="Search by name…"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {users === null && <p className="text-sm text-muted-foreground">Loading users…</p>}
              {users !== null && visibleUsers.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  {users.length === 0 ? "No other users yet." : "No users match your search."}
                </p>
              )}
              {visibleUsers.map((u) => (
                <Link
                  key={u.uid}
                  href={`/users/${u.uid}`}
                  className="flex items-center gap-3 rounded-lg border bg-background p-3 transition hover:border-primary/40 hover:bg-accent"
                >
                  <UserAvatar name={u.fullName} photoURL={u.photoURL} className="h-10 w-10" />
                  <span className="truncate font-medium">{u.fullName}</span>
                </Link>
              ))}
            </div>
          </section>

          {profile && <CommentSection profileUid={profile.uid} author={profile} isProfileOwner />}
        </div>
      </main>
    </div>
  );
}