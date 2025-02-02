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

// https://zodjs.netlify.app/guide/recursive-types
const literalSchema = z.string();
type Literal = z.infer<typeof literalSchema>;
type vars = Literal | { [key: string]: vars } | vars[];
const varsSchema: z.ZodType<vars> = z.lazy(() =>
  z.union([literalSchema, z.array(varsSchema), z.record(varsSchema)])
);

const exception = z.object({
  type: z.literal("exception"),
  data: z.object({
    values: z.array(
      z.object({
        type: z.string(),
        value: z.string(),
        stacktrace: z.object({
          frames: z.array(
            z.object({
              absPath: z.string(),
              lineno: z.number().optional(),
              vars: z.record(z.string(), varsSchema),
            })
          ),
        }),
      })
    ),
  }),
});

const breadcrumbs = z.object({
  type: z.literal("breadcrumbs"),
  data: z.object({}),
});

export const SentryEventSchema = z.object({
  id: z.string(),
  eventID: z.string(),
  dateCreated: z.string(),
  entries: z.array(z.discriminatedUnion("type", [exception, breadcrumbs])),
});
export type SentryEventT = z.infer<typeof SentryEventSchema>;
