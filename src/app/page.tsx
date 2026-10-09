import SignUpDialog from "@/components/SignUpDialog";
import LoginDialog from "@/components/LoginDialog";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";

export default async function Home() {
if (await getSessionUser()) redirect("/dashboard");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-6 text-center">
      <h1 className="text-4xl font-bold">NexusMedia</h1>
      <p className="max-w-md text-muted-foreground">
        Create an account, build your profile, and connect with others.
      </p>
      <div className="flex gap-3">
        <SignUpDialog />
        <LoginDialog />
      </div>
    </main>
  );
}