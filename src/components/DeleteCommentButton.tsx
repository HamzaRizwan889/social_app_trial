"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { deleteComment } from "@/app/actions/comments";

interface DeleteCommentButtonProps {
  profileUid: string;
  commentId: string;
}

export default function DeleteCommentButton({ profileUid, commentId }: DeleteCommentButtonProps) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const result = await deleteComment(profileUid, commentId);
          if (!result.ok) toast.error(result.error);
        })
      }
      className="mt-2 text-xs text-muted-foreground hover:text-destructive"
    >
      {pending ? "Deleting…" : "Delete"}
    </button>
  );
}