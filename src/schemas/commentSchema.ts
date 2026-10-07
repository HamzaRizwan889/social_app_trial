import { z } from "zod";

export const commentSchema = z.object({
  text: z
    .string()
    .trim()
    .min(1, "Write something first")
    .max(500, "Comments are limited to 500 characters"),
});

export type CommentValues = z.infer<typeof commentSchema>;