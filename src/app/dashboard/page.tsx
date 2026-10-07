"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { collection, doc, getDocs, onSnapshot } from "firebase/firestore";
import { toast } from "sonner";
import { auth, db } from "@/lib/firebase";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import type { UserProfile } from "@/types/user";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

export default function DashboardPage() {
  const { user, loading } = useRequireAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);

  // Own profile (live)
  useEffect(() => {
    if (!user) return;
    const unsubscribe = onSnapshot(
      doc(db, "users", user.uid),
      (snapshot) => setProfile(snapshot.exists() ? (snapshot.data() as UserProfile) : null),
      () => toast.error("Could not load your profile"),
    );
    return unsubscribe;
  }, [user]);

  // Other users
  useEffect(() => {
    if (!user) return;
    getDocs(collection(db, "users"))
      .then((snapshot) =>
        setUsers(
          snapshot.docs
            .map((d) => d.data() as UserProfile)
            .filter((p) => p.uid !== user.uid),
        ),
      )
      .catch(() => toast.error("Could not load users"))
      .finally(() => setUsersLoading(false));
  }, [user]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  if (loading || !user) {
    return <main className="flex min-h-screen items-center justify-center">Loading…</main>;
  }

  return (
    <main className="mx-auto max-w-3xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Button variant="outline" onClick={handleLogout}>
          Log out
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your profile</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          {profile ? (
            <>
              <Avatar className="h-16 w-16">
                <AvatarImage src={profile.photoURL ?? undefined} alt={profile.fullName} />
                <AvatarFallback>{getInitials(profile.fullName)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{profile.fullName}</p>
                <p className="text-sm text-muted-foreground">{profile.email}</p>
                <p className="mt-1 text-sm">{profile.bio || "No bio yet."}</p>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Loading profile…</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Other users</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {usersLoading && <p className="text-sm text-muted-foreground">Loading users…</p>}
          {!usersLoading && users.length === 0 && (
            <p className="text-sm text-muted-foreground">No other users yet.</p>
          )}
          {users.map((u) => (
            <Link
              key={u.uid}
              href={`/users/${u.uid}`}
              className="flex items-center gap-3 rounded-md p-2 hover:bg-muted"
            >
              <Avatar>
                <AvatarImage src={u.photoURL ?? undefined} alt={u.fullName} />
                <AvatarFallback>{getInitials(u.fullName)}</AvatarFallback>
              </Avatar>
              <span>{u.fullName}</span>
            </Link>
          ))}
        </CardContent>
      </Card>
    </main>
  );
}