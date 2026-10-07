import { z } from "zod";

export const profileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "Full name is required")
    .max(50, "Name must be 50 characters or less"),
  bio: z.string().trim().max(300, "Bio must be 300 characters or less"),
});

export type ProfileValues = z.infer<typeof profileSchema>;

const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

export const imageFileSchema = z
  .instanceof(File)
  .refine((file) => file.type.startsWith("image/"), "Please choose an image file")
  .refine((file) => file.size <= MAX_IMAGE_BYTES, "Image must be 2 MB or smaller");