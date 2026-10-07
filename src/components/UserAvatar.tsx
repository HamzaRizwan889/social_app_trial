/* eslint-disable @next/next/no-img-element */
import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/format";

interface UserAvatarProps {
  name: string;
  photoURL: string | null;
  className?: string;
}

export default function UserAvatar({ name, photoURL, className }: UserAvatarProps) {
  if (photoURL) {
    return (
      <img
        src={photoURL}
        alt={name}
        className={cn("shrink-0 rounded-full object-cover", className)}
      />
    );
  }
  return (
    <div
      aria-label={name}
      className={cn(
        "grid shrink-0 place-items-center rounded-full bg-primary/15 text-sm font-semibold text-primary",
        className,
      )}
    >
      {getInitials(name)}
    </div>
  );
}