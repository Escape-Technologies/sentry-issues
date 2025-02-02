import { z } from "zod";

export const SentryProjectSchema = z.object({
  slug: z.string(),
});
export type SentryProjectT = z.infer<typeof SentryProjectSchema>;

export const SentryIssueSchema = z.object({
  id: z.string(),
  title: z.string(),
  culprit: z.string(),
  permalink: z.string(),
});
export type SentryIssueT = z.infer<typeof SentryIssueSchema>;

export const SentryEventSchema = z.object({
  id: z.string(),
  eventID: z.string(),
  dateCreated: z.string(),
});
export type SentryEventT = z.infer<typeof SentryEventSchema>;
