import SignUpDialog from "@/components/SignUpDialog";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-6 text-center">
      <h1 className="text-4xl font-bold">HealthShared</h1>
      <p className="max-w-md text-muted-foreground">
        Create an account, build your profile, and connect with others.
      </p>
      <SignUpDialog />
    </main>
  );
}