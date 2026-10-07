"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useProfile } from "@/hooks/useProfile";
import { formatDate } from "@/lib/format";
import AppHeader from "@/components/AppHeader";
import CommentSection from "@/components/CommentSection";
import EditProfileDialog from "@/components/EditProfileDialog";
import PageLoader from "@/components/PageLoader";
import UserAvatar from "@/components/UserAvatar";

export default function UserProfilePage() {
  const params = useParams<{ uid: string }>();
  const { user, loading } = useRequireAuth();
  const { profile: viewed, loading: viewedLoading } = useProfile(user ? params.uid : undefined);
  const { profile: me } = useProfile(user?.uid);

  if (loading || !user || viewedLoading) return <PageLoader />;

  const isOwnProfile = user.uid === params.uid;

  return (
    <div className="min-h-screen bg-muted/30">
      <AppHeader />
      <main className="mx-auto max-w-2xl space-y-6 p-6">
        <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to dashboard
        </Link>

        {!viewed ? (
          <p className="rounded-xl border bg-card p-6 text-center">User not found.</p>
        ) : (
          <>
            <section className="overflow-hidden rounded-xl border bg-card shadow-sm">
              <div className="h-24 bg-gradient-to-r from-primary to-primary/50" />
              <div className="px-6 pb-6">
                <UserAvatar
                  name={viewed.fullName}
                  photoURL={viewed.photoURL}
                  className="-mt-12 h-24 w-24 text-2xl ring-4 ring-card"
                />
                <h1 className="mt-3 text-xl font-semibold">{viewed.fullName}</h1>
                {isOwnProfile ? (
                  <p className="text-sm text-muted-foreground">{viewed.email}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Member since {formatDate(viewed.createdAt)}
                  </p>
                )}
                <p className="mt-3 whitespace-pre-wrap text-sm">{viewed.bio || "No bio yet."}</p>
                {isOwnProfile && (
                  <div className="mt-4">
                    <EditProfileDialog profile={viewed} />
                  </div>
                )}
              </div>
            </section>

            {me && <CommentSection profileUid={viewed.uid} author={me} isProfileOwner={isOwnProfile} />}
          </>
        )}
      </main>
    </div>
  );
}