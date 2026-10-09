import Link from "next/link";
import { notFound } from "next/navigation";
import { getComments, getProfile } from "@/lib/data";
import { requireUser } from "@/lib/session";
import { formatDate } from "@/lib/format";
import { idSchema } from "@/schemas/common";
import AppHeader from "@/components/AppHeader";
import CommentSection from "@/components/CommentSection";
import EditProfileDialog from "@/components/EditProfileDialog";
import UserAvatar from "@/components/UserAvatar";

export default async function UserProfilePage({ params }: { params: Promise<{ uid: string }> }) {
  const { uid } = await params;
  const viewer = await requireUser();
  if (!idSchema.safeParse(uid).success) notFound();

  const [profile, comments] = await Promise.all([getProfile(uid), getComments(uid)]);
  if (!profile) notFound();

  const isOwnProfile = viewer.uid === uid;

  return (
    <div className="min-h-screen bg-muted/30">
      <AppHeader />
      <main className="mx-auto max-w-2xl space-y-6 p-6">
        <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to dashboard
        </Link>

        <section className="overflow-hidden rounded-xl border bg-card shadow-sm">
          <div className="h-24 bg-gradient-to-r from-primary to-primary/50" />
          <div className="px-6 pb-6">
            <UserAvatar
              name={profile.fullName}
              photoURL={profile.photoURL}
              className="-mt-12 h-24 w-24 text-2xl ring-4 ring-card"
            />
            <h1 className="mt-3 text-xl font-semibold">{profile.fullName}</h1>
            <p className="text-sm text-muted-foreground">
              {isOwnProfile ? profile.email : `Member since ${formatDate(profile.createdAt)}`}
            </p>
            <p className="mt-3 whitespace-pre-wrap text-sm">{profile.bio || "No bio yet."}</p>
            {isOwnProfile && (
              <div className="mt-4">
                <EditProfileDialog profile={profile} />
              </div>
            )}
          </div>
        </section>

        <CommentSection profileUid={uid} viewerUid={viewer.uid} comments={comments} />
      </main>
    </div>
  );
}