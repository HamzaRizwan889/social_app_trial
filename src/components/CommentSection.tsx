"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { toast } from "sonner";

import { db } from "@/lib/firebase";
import { formatDate } from "@/lib/format";
import { commentSchema, type CommentValues } from "@/schemas/commentSchema";
import type { ProfileComment } from "@/types/comment";
import type { UserProfile } from "@/types/user";
import UserAvatar from "@/components/UserAvatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface CommentSectionProps {
  profileUid: string;
  author: UserProfile; 
  isProfileOwner: boolean;
}

export default function CommentSection({ profileUid, author, isProfileOwner }: CommentSectionProps) {
  const [comments, setComments] = useState<ProfileComment[] | null>(null);

  const form = useForm<CommentValues>({
    resolver: zodResolver(commentSchema),
    defaultValues: { text: "" },
  });
  const { errors, isSubmitting } = form.formState;

  useEffect(() => {
    const commentsQuery = query(
      collection(db, "users", profileUid, "comments"),
      orderBy("createdAt", "desc"),
    );
    return onSnapshot(
      commentsQuery,
      (snapshot) =>
        setComments(
          snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ProfileComment, "id">) })),
        ),
      () => toast.error("Could not load comments"),
    );
  }, [profileUid]);

  const onSubmit = async (values: CommentValues) => {
    const comment: Omit<ProfileComment, "id"> = {
      authorUid: author.uid,
      authorName: author.fullName,
      authorPhotoURL: author.photoURL,
      text: values.text,
      createdAt: new Date().toISOString(),
    };
    try {
      await addDoc(collection(db, "users", profileUid, "comments"), comment);
      form.reset();
    } catch {
      toast.error("Could not post comment");
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      await deleteDoc(doc(db, "users", profileUid, "comments", commentId));
    } catch {
      toast.error("Could not delete comment");
    }
  };

  return (
    <section className="rounded-xl border bg-card p-6 shadow-sm">
      <h2 className="text-lg font-semibold">Comments</h2>

      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4 space-y-2">
        <Textarea rows={3} placeholder="Write a comment…" {...form.register("text")} />
        {errors.text && <p className="text-sm text-destructive">{errors.text.message}</p>}
        <div className="flex justify-end">
          <Button type="submit" size="sm" disabled={isSubmitting}>
            {isSubmitting ? "Posting…" : "Post comment"}
          </Button>
        </div>
      </form>

      <div className="mt-6 space-y-4">
        {comments === null && <p className="text-sm text-muted-foreground">Loading comments…</p>}
        {comments?.length === 0 && (
          <p className="text-sm text-muted-foreground">No comments yet. Be the first!</p>
        )}
        {comments?.map((comment) => (
          <div key={comment.id} className="flex gap-3">
            <UserAvatar name={comment.authorName} photoURL={comment.authorPhotoURL} className="h-9 w-9" />
            <div className="min-w-0 flex-1 rounded-lg bg-muted/60 px-4 py-3">
              <div className="flex items-center justify-between gap-2">
                <Link href={`/users/${comment.authorUid}`} className="truncate text-sm font-medium hover:underline">
                  {comment.authorName}
                </Link>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {formatDate(comment.createdAt)}
                </span>
              </div>
              <p className="mt-1 whitespace-pre-wrap break-words text-sm">{comment.text}</p>
              {(comment.authorUid === author.uid || isProfileOwner) && (
                <button
                  type="button"
                  onClick={() => handleDelete(comment.id)}
                  className="mt-2 text-xs text-muted-foreground hover:text-destructive"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}