"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { addComment } from "@/app/actions/comments";
import { commentSchema, type CommentValues } from "@/schemas/commentSchema";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function CommentForm({ profileUid }: { profileUid: string }) {
  const form = useForm<CommentValues>({
    resolver: zodResolver(commentSchema),
    defaultValues: { text: "" },
  });
  const { errors, isSubmitting } = form.formState;

  const onSubmit = async (values: CommentValues) => {
    const result = await addComment(profileUid, values);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    form.reset();
  };

  return (
    <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
      <Textarea rows={3} placeholder="Write a comment…" {...form.register("text")} />
      {errors.text && <p className="text-sm text-destructive">{errors.text.message}</p>}
      <div className="flex justify-end">
        <Button type="submit" size="sm" disabled={isSubmitting}>
          {isSubmitting ? "Posting…" : "Post comment"}
        </Button>
      </div>
    </form>
  );
}