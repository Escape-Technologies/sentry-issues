import { z } from "zod";

export const SentryProjectResponseSchema = z.object({
  slug: z.string(),
});
export const SentryIssueResponseSchema = z.object({
  id: z.string(),
  title: z.string(),
  culprit: z.string(),
  permalink: z.string(),
});
