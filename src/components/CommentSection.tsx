import Link from "next/link";
import { formatDate } from "@/lib/format";
import type { CommentWithAuthor } from "@/types/comment";
import CommentForm from "@/components/CommentForm";
import DeleteCommentButton from "@/components/DeleteCommentButton";
import UserAvatar from "@/components/UserAvatar";

interface CommentSectionProps {
  profileUid: string;
  viewerUid: string;
  comments: CommentWithAuthor[];
}

export default function CommentSection({ profileUid, viewerUid, comments }: CommentSectionProps) {
  const isProfileOwner = viewerUid === profileUid;

  return (
    <section className="rounded-xl border bg-card p-6 shadow-sm">
      <h2 className="text-lg font-semibold">Comments</h2>
      <div className="mt-4">
        <CommentForm profileUid={profileUid} />
      </div>

      <div className="mt-6 space-y-4">
        {comments.length === 0 && (
          <p className="text-sm text-muted-foreground">No comments yet. Be the first!</p>
        )}
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3">
            <UserAvatar name={comment.authorName} photoURL={comment.authorPhotoURL} className="h-9 w-9" />
            <div className="min-w-0 flex-1 rounded-lg bg-muted/60 px-4 py-3">
              <div className="flex items-center justify-between gap-2">
                <Link href={`/users/${comment.authorUid}`} className="truncate text-sm font-medium hover:underline">
                  {comment.authorName}
                </Link>
                <span className="shrink-0 text-xs text-muted-foreground">{formatDate(comment.createdAt)}</span>
              </div>
              <p className="mt-1 whitespace-pre-wrap break-words text-sm">{comment.text}</p>
              {(comment.authorUid === viewerUid || isProfileOwner) && (
                <DeleteCommentButton profileUid={profileUid} commentId={comment.id} />
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}