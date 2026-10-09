import { z } from "zod";

export const idSchema = z.string().regex(/^[A-Za-z0-9_-]{1,128}$/, "Invalid id");