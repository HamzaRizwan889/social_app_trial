export default function PageLoader() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3">
      <p className="text-muted-foreground">Loading…</p>
      <a href="/" className="text-sm underline">
        Back to home
      </a>
    </main>
  );
}