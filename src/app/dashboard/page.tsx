import { getComments, getOtherUsers, getProfile } from "@/lib/data";
import { requireUser } from "@/lib/session";
import AppHeader from "@/components/AppHeader";
import CommentSection from "@/components/CommentSection";
import EditProfileDialog from "@/components/EditProfileDialog";
import UserAvatar from "@/components/UserAvatar";
import UserSearchList from "@/components/UserSearchList";

export default async function DashboardPage() {
  const user = await requireUser();
  const [profile, users, comments] = await Promise.all([
    getProfile(user.uid),
    getOtherUsers(user.uid),
    getComments(user.uid),
  ]);

  return (
    <div className="min-h-screen bg-muted/30">
      <AppHeader />
      {!profile ? (
        <main className="p-6 text-center">Your profile could not be found.</main>
      ) : (
        <main className="mx-auto grid max-w-5xl gap-6 p-6 lg:grid-cols-[320px_1fr]">
          <aside>
            <section className="overflow-hidden rounded-xl border bg-card shadow-sm">
              <div className="h-24 bg-gradient-to-r from-primary to-primary/50" />
              <div className="px-6 pb-6">
                <UserAvatar
                  name={profile.fullName}
                  photoURL={profile.photoURL}
                  className="-mt-12 h-24 w-24 text-2xl ring-4 ring-card"
                />
                <h1 className="mt-3 text-xl font-semibold">{profile.fullName}</h1>
                <p className="text-sm text-muted-foreground">{profile.email}</p>
                <p className="mt-3 whitespace-pre-wrap text-sm">{profile.bio || "No bio yet. Add one!"}</p>
                <div className="mt-4">
                  <EditProfileDialog profile={profile} />
                </div>
              </div>
            </section>
          </aside>

          <div className="space-y-6">
            <UserSearchList users={users} />
            <CommentSection profileUid={user.uid} viewerUid={user.uid} comments={comments} />
          </div>
        </main>
      )}
    </div>
  );
}