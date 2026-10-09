"use client";

import { useState } from "react";
import Link from "next/link";
import type { UserProfile } from "@/types/user";
import UserAvatar from "@/components/UserAvatar";
import { Input } from "@/components/ui/input";

export default function UserSearchList({ users }: { users: UserProfile[] }) {
  const [search, setSearch] = useState("");
  const term = search.trim().toLowerCase();
  const visible = users.filter((u) => u.fullName.toLowerCase().includes(term));

  return (
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
        {visible.length === 0 && (
          <p className="text-sm text-muted-foreground">
            {users.length === 0 ? "No other users yet." : "No users match your search."}
          </p>
        )}
        {visible.map((u) => (
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
  );
}