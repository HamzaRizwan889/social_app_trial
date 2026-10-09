import Link from "next/link";
export default function PageLoader() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3">
      <p className="text-muted-foreground">Loading…</p>
      <Link href="/" className="text-sm underline">
        Back to home
      </Link>
    </main>
  );
}